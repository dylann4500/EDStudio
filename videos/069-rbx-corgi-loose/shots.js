// 069 — Scribe promo, the first reel in the blocky-avatar game look (engine/rbx/, docs/STYLES.md → rbx): a real-world meme of the
// week redone as a blocky game. The trend (Nov 8–9 2026): at the Panthers–Broncos halftime corgi race in Charlotte (Sun Nov 8), a corgi
// named Quinn left the race and ran the field; handlers dove and missed, the second half started late, she was caught around the
// 40-yard line, Ollie won the race, and the team reposted it with "Still a good boy though." (Yahoo Sports / People, Nov 9; the
// Charlotte Corgi Club's own post: "GO QUINN GO!"). All on screen is our own generic look: no league or team marks, our stadium,
// our avatars and usernames (the chat lines are parody).
// Beats: start line (one f*cking job) → the race starts, the pack runs, Quinn absolutely f*cking does not → she takes the field
// (the 40, the 45, midfield) → handler 1 dives, misses: OOF (the avatar breaks into parts) → handler 2, same → the players wait,
// the jumbotron says DELAYED, she zooms past their legs → handler 3 gets her on the 40 → Ollie breaks the ribbon (a crown) → Quinn
// held up like a trophy, the stadium erupts → the team's post on a fan's phone → hard pivot (60 %): you, at night, 20 genetics
// problems, handwritten, due at midnight → pull a Quinn (dog ears) → one photo → Scribe solves all 20 → your own handwriting,
// stroke by stroke, the Punnett square drawn (corgi coat genetics: fluffy is recessive) → the teacher dives for a mistake: OOF →
// A+ → "still a good student, though" → the Scribe end card.
// Scribe facts (README + tryscribe.ink): a photo/PDF → every problem solved with worked steps → written in the student's own
// handwriting, stroke by stroke, with the diagrams biology needs (Punnett squares).
// Sets: the blocky stadium at the origin, the night bedroom at BO, the classroom at CO (one visible per shot).
import * as THREE from 'three';
import { clamp, lerp, smooth } from '@engine/core.js';
import { beatClock, u01, easeOutBack, squash } from '@engine/build/anim.js';
import { makeKick } from '@engine/build/cuts.js';
import { loadHand, loadImg, makeSheet, makeScreen } from '@engine/build/scribe.js';
import { FIG } from '@engine/build/subjects.js';
import { makeHud } from '@engine/build/brhud.js';
import * as R from '@engine/rbx/index.js';

const PI = Math.PI;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BO = [400, 0, 0], CO = [520, 0, 0];
const bw = (x, y, z) => [BO[0] + x, BO[1] + y, BO[2] + z], cw = (x, y, z) => [CO[0] + x, CO[1] + y, CO[2] + z];

/** piecewise-linear path through [t, x, z] keys: {x, z, head (yaw of travel), dist (cumulative), speed} */
function path(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, x0, z0] = keys[i], [t1, x1, z1] = keys[i + 1], u = clamp((t - t0) / Math.max(1e-6, t1 - t0));
  let dist = 0; for (let k = 0; k < i; k++) dist += Math.hypot(keys[k + 1][1] - keys[k][1], keys[k + 1][2] - keys[k][2]);
  const seg = Math.hypot(x1 - x0, z1 - z0); dist += seg * u;
  const speed = t < keys[0][0] || t > keys[keys.length - 1][0] ? 0 : seg / Math.max(1e-6, t1 - t0);
  return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), head: seg > 1e-4 ? Math.atan2(x1 - x0, z1 - z0) : null, dist, speed };
}
/** a look-at point that puts `subj` at vertical frame fraction f (0 = top) seen from `pos` (fov in degrees) */
function aimF(pos, subj, f = 0.4, fov = 50, side = 0) {
  const d = [subj[0] - pos[0], subj[1] - pos[1], subj[2] - pos[2]], dist = Math.hypot(...d);
  const yaw = Math.atan2(d[0], d[2]), pitch = Math.asin(d[1] / dist), tv = Math.tan(fov * PI / 360);
  const p2 = pitch + Math.atan((2 * f - 1) * tv), y2 = yaw + Math.atan(side * 2 * tv * 9 / 16);
  return [pos[0] + Math.sin(y2) * Math.cos(p2) * 10, pos[1] + Math.sin(p2) * 10, pos[2] + Math.cos(y2) * Math.cos(p2) * 10];
}

export async function build(studio, story) {
  const { scene, camera, renderer } = studio;
  renderer.localClippingEnabled = false;
  const B = beatClock(story), W = (b, w, n) => B.W(b, w, n), END = story.duration;
  await Promise.all(['600 30px Inter', '500 30px Inter', '700 64px Fredoka', '600 52px Fredoka', '400 40px "Luckiest Guy"'].map((f) => document.fonts.load(f).catch(() => {})));
  const G = await loadHand('/videos/049-scribe-promo/hand.json'), icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');

  // ---------------------------------------------------------------- word times
  const t = {
    job: W('hook', 'job'), straight: W('hook', 'straight'), line: W('hook', 'line'),
    sunday: W('race', 'sunday'), halftime: W('race', 'halftime'), theRace: W('race', 'the', 1), race: W('race', 'race'), other: W('race', 'the', 2), finish: W('race', 'finish'), quinn: W('race', 'quinn'), absolutely: W('race', 'absolutely'), not: W('race', 'not'),
    quinnL: W('loose', 'quinn'), field: W('loose', 'field'), the40: W('loose', 'the', 2), forty: W('loose', 'forty'), fortyfive: W('loose', 'fortyfive'), midfield: W('loose', 'midfield'),
    handlers: W('dive', 'handlers'), dive1: W('dive', 'dive', 1), miss1: W('dive', 'miss', 1), dive2: W('dive', 'dive', 2), miss2: W('dive', 'miss', 2),
    second: W('delay', 'the'), delayed: W('delay', 'delayed'), by: W('delay', 'by'), corgiD: W('delay', 'corgi'),
    they: W('caught', 'they'), grab: W('caught', 'grab'), fortyC: W('caught', 'forty'), ollie: W('caught', 'ollie'), winsO: W('caught', 'wins', 1), raceC: W('caught', 'race'), quinnC: W('caught', 'quinn'), internet: W('caught', 'internet'),
    even: W('team', 'even'), posted: W('team', 'posted'), still: W('team', 'still'), good: W('team', 'good'),
    meanwhile: W('pivot', 'meanwhile'), twenty: W('pivot', 'twenty'), genetics: W('pivot', 'genetics'), handwritten: W('pivot', 'handwritten'), due: W('pivot', 'due'), midnight: W('pivot', 'midnight'),
    so: W('scribe', 'so'), quinnS: W('scribe', 'quinn'), snap: W('scribe', 'snap'), photo: W('scribe', 'photo'), scribe: W('scribe', 'scribe'), solves: W('scribe', 'solves'), all: W('scribe', 'all'), in: W('scribe', 'in'), handwriting: W('scribe', 'handwriting'), punnett: W('scribe', 'punnett'), too: W('scribe', 'too'),
    your: W('end', 'your'), dives: W('end', 'dives'), mistake: W('end', 'mistake'), misses: W('end', 'misses'), stillE: W('end', 'still'), student: W('end', 'student'), though: W('end', 'though'),
  };
  const ENDCARD = t.though + 0.5;
  const FWORDS = story.order.flatMap((id) => story.beats[id].w.filter((w) => w[0] === 'fucking').map((w) => w[1]));

  // ---------------------------------------------------------------- the worksheet (biology: corgi coat genetics) + the app
  const sheet = makeSheet(G, { rich: true, seed: 69, name: 'Max', title: 'BIO 1 · GENETICS', note: 'Due 11:59 PM tonight  ·  HANDWRITTEN WORK ONLY', page: 'p. 1 of 6', problems: [
    { q: '1.  In corgis, short fur (F) is dominant to fluffy fur (f).\n     Cross Ff × Ff. Give the genotype and phenotype ratios.', h: 2.0,
      fig: ({ k, y }) => FIG.punnett(k, 250, y + 226, 'Ff', 'Ff', { cell: 92, dom: 'short', rec: 'fluffy', ratioAt: [560, y + 214] }) },   // 1 FF : 2 Ff : 1 ff, 3 short : 1 fluffy
    { q: '2.  Two fluffy corgis (ff × ff) have puppies.\n     What fraction of the puppies are fluffy?', h: 0.95, a: 'ff × ff → every pup is ff → 4/4 fluffy' },
    { q: '3.  What does "recessive" mean?', h: 0.75, a: 'it only shows with two copies (ff)' },
  ] });
  const screen = makeScreen(G, icon, sheet, { name: 'Max', n: 20, subject: 'Biology · Genetics' });
  const P1 = sheet.items.filter((it) => it.pi === 0).reduce((s, it) => s + (it.kind === 'p' ? it.w : 1), 0);

  // ---------------------------------------------------------------- world + sets
  const Wd = R.rbxWorld(studio, { size: 900 });
  Wd.plate.position.y = -0.3;                                   // the stadium slab sits on y = 0; keep the plate under it (no z-fight)
  const ST = R.buildStadium(studio, { world: Wd });
  const stadFog = scene.fog;
  const BR = R.rbxBedroom({ clock: [11, 58] }); BR.root.position.set(...BO); scene.add(BR.root);
  const CL = R.rbxClassroom({ board: ['BIO 1 · GENETICS', 'Ff × Ff', 'quiz today!'] }); CL.root.position.set(...CO); scene.add(CL.root);
  const FX = R.makeRbxFX(scene);
  const tags = R.makeTags(scene), chat = R.makeBubbles(scene);

  // ---------------------------------------------------------------- cast
  const dogs = [
    R.makeBlockDog({ coat: 0xd9893a, jersey: 0xe5384f, number: '1' }),
    R.makeBlockDog({ coat: 0xc8873f, jersey: 0xffc73b, number: '2' }),
    R.makeBlockDog({ coat: 0xdc8a3c, jersey: 0x2f7cf6, number: '3' }),             // Quinn
    R.makeBlockDog({ coat: 0xd09048, jersey: 0x9b5cf6, number: '4' }),
    R.makeBlockDog({ coat: 0xc8873f, dark: 0x2a2522, jersey: 0x2fd06a, number: '5' }),   // Ollie (tricolour)
  ];
  dogs.forEach((d) => scene.add(d.root));
  const Q = dogs[2], OL = dogs[4], DOG_S = 1.35;
  const crown = R.makeHat('crown', 0xf5c33b); crown.scale.setScalar(0.62); OL.head.add(crown); crown.position.set(0, 0.2, 0.08);
  const staff = (i) => ({ skin: [0xf2c79b, 0xd8a173, 0xffe0bd, 0x8d5a3b, 0xf5cd30][i], shirt: 0x14b8a6, pants: 0x2b2f3a, sleeve: 0.45, print: 'text:STAFF', printColor: '#ffffff', hair: ['short', 'pony', 'buzz', 'swoop', 'bun'][i], hairColor: [0x3a2618, 0xc98b3a, 0x2a1c14, 0x1d1410, 0x6b3d1f][i], hat: i === 0 ? 'cap' : null, hatColor: 0x2b2f36, face: 'smile' });
  const H = [0, 1, 2, 3, 4].map((i) => { const p = R.makeAvatar(staff(i)); scene.add(p.root); return p; });
  const players = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const p = R.makeAvatar({ skin: [0xf2c79b, 0x8d5a3b, 0xd8a173, 0xffe0bd, 0x8d5a3b, 0xf5cd30, 0xd8a173, 0xf2c79b][i], shirt: 0x1f63d6, pants: 0xf2f2f2, shoes: 0x16181d, sleeve: 0.55, print: 'number:' + [12, 88, 4, 23, 51, 9, 30, 77][i], hat: 'helmet', hatColor: 0x1f63d6, hatColor2: 0xf2f2f2, hair: 'none', face: 'meh' }); scene.add(p.root); return p; });
  const ref = R.makeAvatar({ skin: 0xffe0bd, shirt: 0xf2f2f2, pants: 0x16181d, sleeve: 0.5, hair: 'buzz', hairColor: 0x7a7a7a, hat: 'cap', hatColor: 0x16181d, face: 'meh', print: (g) => { g.fillStyle = '#16181d'; for (let x = 8; x < 256; x += 52) g.fillRect(x, -20, 24, 300); } });
  scene.add(ref.root);
  const owners = [0, 1].map((i) => { const p = R.makeAvatar({ skin: [0xf2c79b, 0x8d5a3b][i], shirt: [0xff6fb5, 0xffc73b][i], pants: 0x2b4c8c, hair: ['long', 'afro'][i], hairColor: [0xf0c25a, 0x1d1410][i], face: 'happy' }); scene.add(p.root); return p; });
  const you = R.makeAvatar({ skin: 0xf2c79b, shirt: 0x9b5cf6, pants: 0x2b2f3a, sleeve: 1, hair: 'swoop', hairColor: 0x5a3a22, print: 'heart', printColor: '#ffd84a', face: 'smile' });
  scene.add(you.root);
  const ears = you.addHat('dogears', 0xd9893a, 0x2b2f36); ears.visible = false;
  const teacher = R.makeAvatar({ skin: 0xffe0bd, shirt: 0xbfd9f4, pants: 0x5c6068, sleeve: 1, hair: 'buzz', hairColor: 0xb9b9b9, glasses: true, tie: 0xe5384f, face: 'meh' });
  scene.add(teacher.root);
  const magnifier = new THREE.Group(); scene.add(magnifier);
  { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 28), R.plastic(0x2b2f36, { rough: 0.3 })); magnifier.add(ring); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.105, 28), R.matFor('glass', 0xcfe8ff)); magnifier.add(gl); const hd = R.part([0.035, 0.16, 0.035], { color: 0x8a5a33, parent: magnifier, pos: [0, -0.19, 0] }); void hd; }

  // tags + chat
  tags.add(Q, 'Quinn', { color: '#ffd84a', at: (v) => Q.head.getWorldPosition(v).add(V(0, 0.42, 0)) });
  const olTag = tags.add(OL, 'Ollie', { color: '#b8ffb0', at: (v) => OL.head.getWorldPosition(v).add(V(0, 0.55, 0)) });
  H.slice(0, 3).forEach((p, i) => tags.add(p, 'Handler_' + (i + 1), { color: '#9fe6ff' }));
  tags.add(you, 'You', { color: '#ffffff' }); tags.add(teacher, 'Teacher', { color: '#ffb36b' });
  const LOG = R.makeChatLog({ top: 250, max: 4, show: [0.35, t.even - 0.05], lines: [
    [0.5, 'corgifan_22', '#ffd84a', 'CORGI RACE LETS GOOO'], [2.0, 'xX_Pup_Xx', '#9fe6ff', 'my money on #3'], [7.8, 'blox_dad', '#ff9fd0', 'wait wheres 3 going'],
    [9.4, 'corgifan_22', '#ffd84a', 'SHES FREE'], [11.0, 'TouchdownTom', '#9dff9d', 'she has wheels'], [12.5, 'xX_Pup_Xx', '#9fe6ff', 'midfield lmaooo'],
    [14.25, 'blox_dad', '#ff9fd0', 'ANKLES'], [15.45, 'TouchdownTom', '#9dff9d', 'oof x2'], [17.4, 'corgifan_22', '#ffd84a', 'game delayed by a dog'],
    [19.95, 'xX_Pup_Xx', '#9fe6ff', 'they got her'], [22.35, 'blox_dad', '#ff9fd0', 'GO QUINN GO'], [22.8, 'TouchdownTom', '#9dff9d', 'W QUINN'], [23.2, 'pupper99', '#ffb36b', 'GOAT'], [23.6, 'corgifan_22', '#ffd84a', 'W QUINN W QUINN'],
  ] });
  // crowd bubbles: anchors at front-row seats of the +z stand
  const seatAt = (x, row = 0) => V(x, 1.0 + row * 0.55 + 1.55, ST.D.standZ0 + row * 0.95 + 0.38);
  const anchor = (x, row) => { const o = new THREE.Object3D(); o.position.copy(seatAt(x, row)); scene.add(o); return o; };
  chat.say(anchor(17.5, 1), 'SHES FREE', 9.4, 10.9, { px: 110 }); chat.say(anchor(12.0, 0), 'GO QUINN GO', 22.4, 24.2, { px: 120 }); chat.say(anchor(6.0, 2), 'W QUINN', 22.8, 24.2, { px: 110 });
  chat.say(H[2], 'got her!!', t.grab + 0.15, t.ollie - 0.1, { px: 120 });
  chat.say(you, 'gg', t.though - 0.4, END, { px: 130 });

  // props: start gate bar, stacks, laptop, phone, paper, pen
  const paperM = R.plastic(0xf3f0e8, { rough: 0.85 });
  const stack = new THREE.Group(); scene.add(stack);
  { const s = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.3), paperM); s.position.y = 0.035; s.castShadow = true; stack.add(s); const top = new THREE.Mesh(new THREE.PlaneGeometry(0.216, 0.279), new THREE.MeshStandardMaterial({ map: sheet.tex, roughness: 0.85 })); top.rotation.x = -PI / 2; top.position.y = 0.071; stack.add(top); }
  const deskPaper = R.rbxPaper(sheet.tex); scene.add(deskPaper);               // on the bedroom desk (written by the pen)
  const classPaper = R.rbxPaper(sheet.tex); scene.add(classPaper);              // on the teacher's desk
  const aPlus = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.08), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: R.canvasTexture(220, 160, (g) => { g.strokeStyle = '#d42a3a'; g.lineWidth = 10; g.beginPath(); g.ellipse(110, 80, 96, 66, -0.1, 0, 7); g.stroke(); g.fillStyle = '#d42a3a'; g.font = '400 96px "Luckiest Guy", Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A+', 110, 88); }) }));
  aPlus.rotation.x = -PI / 2; scene.add(aPlus);
  const laptop = R.rbxLaptop(screen.tex, { w: 0.5, d: 0.34 }); scene.add(laptop.g);
  const phoneTex = makePostTex();
  const camPhone = R.rbxPhone(sheet.tex, { w: 0.085, h: 0.17 }); scene.add(camPhone.g);   // the viewfinder shows the sheet
  const postPhone = R.rbxPhone(phoneTex.tex, { w: 0.085, h: 0.17 }); scene.add(postPhone.g);
  const povArms = [0, 1].map(() => { const g = new THREE.Group(); R.part([0.34 * 0.55, 0.34 * 0.55, 0.62], { color: 0x2f7cf6, parent: g, pos: [0, 0, 0.31], radius: 0.03 }); R.part([0.34 * 0.56, 0.34 * 0.56, 0.12], { color: 0xf5cd30, parent: g, pos: [0, 0, 0.64], radius: 0.03 }); scene.add(g); return g; });
  const pen = R.rbxPen(); pen.g.scale.setScalar(0.55); scene.add(pen.g);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false })); flash.renderOrder = 40; scene.add(flash);
  const hearts = makeHearts(scene);

  // ---------------------------------------------------------------- choreography (all positions in the stadium's metres)
  const LZ0 = 20.3, laneX = (i) => ST.race.laneX(i);
  // Quinn: start line → leads the pack → stops (Quinn? absolutely not) → takes the field → the 40, the 45, midfield → dodges two dives
  // → runs the sideline past the waiting players → caught on the 40-yard line (x = 9.14) near the +z sideline
  const QK = [[0, laneX(2), LZ0], [5.5, laneX(2), LZ0], [6.3, laneX(2), 17.0], [7.0, laneX(2), 13.4], [7.4, laneX(2), 12.5], [t.not + 0.05, laneX(2), 12.5],
    [t.not + 0.8, 14.6, 12.3], [t.forty, ST.yardX(40), 12.4], [t.fortyfive, ST.yardX(45), 12.4], [t.midfield, 0, 12.0], [t.dive1 - 0.1, -5.0, 11.2], [t.dive1 + 0.2, -6.8, 9.9],
    [t.miss1, -7.3, 8.6], [t.dive2, -6.6, 5.6], [t.dive2 + 0.34, -6.3, 4.9], [t.dive2 + 0.48, -6.25, 4.85], [t.miss2, -5.2, 4.7], [t.miss2 + 0.8, -2.6, 9.5],
    [t.second + 1.0, -2.2, 18.5], [t.by, -2.0, 25.0], [t.they, 8.0, 25.0], [t.grab, ST.yardX(40) + 0.15, 21.0], [99, ST.yardX(40) + 0.15, 21.0]];
  const CATCH = [ST.yardX(40) + 0.15, 21.0];
  const pack = (i) => { const sp = [3.4, 3.2, 0, 3.0, 3.6][i]; return (tt) => { const a = Math.max(0, tt - 5.5); return { x: laneX(i) + 0.25 * Math.sin(a * 1.7 + i), z: LZ0 - sp * a * (1 - 0.15 * Math.sin(a * 0.6 + i)), run: a > 0 }; }; };
  const OLK = [[0, laneX(4), LZ0], [5.5, laneX(4), LZ0], [8.5, laneX(4), 9.0], [12.0, laneX(4), 3.0], [17.0, laneX(4), -6.0], [t.ollie, laneX(4), -18.2], [t.winsO + 0.05, laneX(4), -19.6], [t.raceC + 0.1, laneX(4), -21.4], [99, laneX(4), -21.4]];
  // handlers: H1 from the gate → dive 1; H2 from the finish → dive 2; H3 chases → the catch; H4/H5 trail her
  const H1K = [[0, 14.6, 21.8], [8.9, 14.6, 21.8], [t.dive1, -5.9, 12.9]], D1 = { t0: t.dive1, t1: t.miss1, a: [-5.9, 12.9], b: [-6.6, 9.8] };
  const H2K = [[0, 15.0, -21.2], [8.9, 15.0, -21.2], [t.dive2, -9.7, 5.1]], D2 = { t0: t.dive2, t1: t.miss2, a: [-9.7, 5.1], b: [-6.75, 5.0] };
  const H3K = [[0, 19.6, 21.8], [8.9, 19.6, 21.8], [13.0, 3.0, 15.0], [16.2, -1.0, 20.0], [t.by + 0.4, 4.0, 23.6], [t.grab - 0.36, 11.5, 22.7]], D3 = { t0: t.grab - 0.36, t1: t.grab, a: [11.5, 22.7], b: [CATCH[0] + 0.3, CATCH[1] + 0.25] };
  const trail = (lag, ox, oz) => (tt) => { const q = path(QK, Math.max(8.9, tt - lag)); return { x: q.x + ox, z: q.z + oz, run: tt > 9.1 && tt < t.grab + 0.6 }; };
  const H4 = trail(1.4, 1.8, 1.2), H5 = trail(2.1, 2.6, -1.6);
  const PLX = (i) => -3.6 + i * 1.5, PLZ = 26.3;

  // ---------------------------------------------------------------- impacts, kicks, fx (registered once)
  const KICKS = [], kick = (tt, s = 1, d = 0.45) => KICKS.push([tt, s, d]);
  for (const f of FWORDS) kick(f + 0.02, 0.14, 0.2);
  kick(t.race + 0.03, 0.35); kick(t.forty, 0.4, 0.3); kick(t.fortyfive, 0.45, 0.3); kick(t.midfield, 0.55, 0.35);
  kick(t.miss1, 1.0); kick(t.miss2, 1.0); kick(t.grab, 0.8); kick(t.delayed, 0.6); kick(t.winsO + 0.05, 0.4); kick(t.internet, 0.5);
  const STACK_HIT = t.twenty + 0.22; kick(STACK_HIT, 0.7); kick(t.handwritten, 0.5); kick(t.quinnS + 0.05, 0.35); kick(t.photo, 0.3);
  const TLAUNCH = t.mistake - 0.12, TLAND = t.misses; kick(TLAND, 1.1);
  for (const D of [D1, D2]) { FX.puff(D.t1, [D.b[0], 0.2, D.b[1]], { n: 9, size: 0.9, spread: 1.4 }); FX.studs(D.t1, [D.b[0], 0.35, D.b[1]], { n: 22, seed: D.t1 * 10 | 0 }); FX.pow(D.t1 + 0.02, [D.b[0], 1.3, D.b[1]], 'OOF!', { life: 0.75 }); }
  FX.puff(t.grab, [CATCH[0], 0.2, CATCH[1]], { n: 10, size: 1.0, spread: 1.5 }); FX.pow(t.grab + 0.05, [CATCH[0], 1.6, CATCH[1]], 'GOT HER!', { color: '#2fd06a', life: 0.8, px: 300 });
  FX.confetti(t.winsO + 0.04, [laneX(4), 4.4, -19.5], { n: 220, spread: 3.2, up: 4, seed: 4 }); FX.confetti(t.winsO + 0.12, [laneX(4) - 3, 4.4, -19.5], { n: 120, spread: 2.6, up: 4, seed: 6 });
  FX.confetti(t.internet - 0.1, [CATCH[0], 6, CATCH[1] + 2], { n: 320, spread: 5, up: 3, seed: 8 });
  FX.puff(STACK_HIT, bw(0.75, 0.82, -0.95), { n: 7, size: 0.32, spread: 0.45, life: 0.6 });
  FX.puff(TLAND, cw(0.6, 0.2, 0.55), { n: 10, size: 0.9, spread: 1.3 }); FX.studs(TLAND, cw(0.6, 0.35, 0.55), { n: 26, seed: 5 }); FX.pow(TLAND + 0.03, cw(0.6, 1.25, 0.55), 'OOF!', { life: 0.8 });
  FX.pow(t.stillE - 0.55, cw(0.6, 1.0, -1.8), 'A+', { color: '#ff5a6a', life: 0.75, px: 280 });
  const kickR = makeKick(KICKS);

  // ---------------------------------------------------------------- SHOTS (hard cuts; each a short gliding move)
  const POS = (k, a, b) => a.map((v, i) => lerp(v, b[i], k));
  const SH = [
    { id: 'start', t0: 0, set: 'st', cam: (tt) => { const k = smooth(u01(tt, t.straight - 0.35, t.line + 0.45)); const p = [laneX(2) + 0.7 - 0.3 * k, 0.55 + 6.45 * Math.sqrt(k), 17.4 + 0.15 * Math.min(tt, t.straight) + 10 * k * k ]; const a0 = aimF(p, [laneX(2), 0.86, LZ0], 0.67, 48); return { pos: p, look: k < 0.01 ? a0 : POS(k, a0, [laneX(2), -2.5, 4]), fov: 48 }; } },
    { id: 'wide', t0: t.sunday, set: 'st', cam: (tt) => { const u = smooth(u01(tt, t.sunday, t.theRace)); const p = [72 - 5 * u, 30 - 3 * u, 4 - 2 * u]; return { pos: p, look: [-24, 1, -1], fov: 58 }; } },
    { id: 'gate', t0: t.theRace, set: 'st', cam: (tt) => { const p = [laneX(2) + 0.45, 0.42, 15.6 - 0.4 * u01(tt, t.theRace, t.other)]; return { pos: p, look: aimF(p, [laneX(2), 0.86, LZ0 - 0.4], 0.66, 50), fov: 50 }; } },
    { id: 'pack', t0: t.other, set: 'st', cam: (tt) => { const z = pack(1)(tt).z; const p = [26.5, 1.15, z + 1.4]; return { pos: p, look: [15.5, 0.25, z - 1.6], fov: 46 }; } },
    { id: 'stop', t0: t.quinn, set: 'st', cam: (tt) => { const u = smooth(u01(tt, t.quinn, t.quinnL)); const p = [laneX(2) + 0.35, 0.62 - 0.1 * u, 10.1 + 0.5 * u]; return { pos: p, look: aimF(p, [laneX(2), 0.86, 12.5], 0.66, 46), fov: 46 }; } },
    { id: 'field', t0: t.quinnL, set: 'st', cam: (tt) => { const q = path(QK, tt), u = u01(tt, t.quinnL, t.the40); const p = [22 - 3 * u, 9.5, 35.5]; return { pos: p, look: aimF(p, [q.x, 0.2, q.z], 0.6, 44), fov: 44 }; } },
    { id: 'track', t0: t.the40, set: 'st', cam: (tt) => { const q = path(QK, tt - 0.12); const p = [q.x + 1.6, 2.7, 18.4]; return { pos: p, look: aimF(p, [q.x - 1.2, 0.2, 13.4], 0.5, 48), fov: 48 }; } },
    { id: 'mid', t0: t.midfield, set: 'st', cam: (tt) => { const u = u01(tt, t.midfield, t.handlers), q = path(QK, tt); const p = [2.6 - 1.5 * u, 5.2, 18.0]; return { pos: p, look: aimF(p, [q.x * 0.6 - 1.0, 0.3, 11.8], 0.52, 48), fov: 48 }; } },
    { id: 'dive1', t0: t.handlers, set: 'st', cam: (tt) => { const u = u01(tt, t.handlers, t.dive2); const p = [-3.6 + 0.4 * u, 0.95, 5.6 + 0.3 * u]; return { pos: p, look: aimF(p, [-6.6, 0.55, 10.2], 0.58, 50), fov: 50 }; } },
    { id: 'dive2', t0: t.dive2, set: 'st', cam: (tt) => { const u = u01(tt, t.dive2, t.second); const p = [-2.9 - 0.4 * u, 1.05, 1.2 + 0.2 * u]; return { pos: p, look: aimF(p, [-7.0, 0.5, 5.6], 0.58, 50), fov: 50 }; } },
    { id: 'bench', t0: t.second, set: 'st', cam: (tt) => { const u = smooth(u01(tt, t.second, t.delayed)); const p = [-4.6 + 2.2 * u, 1.55, 21.6]; return { pos: p, look: aimF(p, [0.4 + 2.2 * u, 1.75, PLZ], 0.36, 46), fov: 46 }; } },
    { id: 'tron', t0: t.delayed, set: 'st', cam: (tt) => { const u = u01(tt, t.delayed, t.by); const p = [-26 - 2 * u, 13, 9 - u]; return { pos: p, look: aimF(p, [-70.9, 19, 0], 0.5, 30), fov: 30 }; } },
    { id: 'legs', t0: t.by, set: 'st', cam: (tt) => { const q = path(QK, Math.min(tt, t.they)); const p = [q.x + 3.4, 0.6, 24.3]; return { pos: p, look: aimF(p, [q.x, 0.85, 25.0], 0.65, 52), fov: 52 }; } },
    { id: 'grab', t0: t.they, set: 'st', cam: (tt) => { const u = smooth(u01(tt, t.they, t.ollie)); const p = [CATCH[0] - 1.4 + 0.5 * u, 2.1 - 0.2 * u, CATCH[1] + 4.6 - 0.4 * u]; return { pos: p, look: tt < t.grab + 0.6 ? aimF(p, [CATCH[0], 0.3, CATCH[1] - 1.0], 0.6, 48) : aimF(p, [CATCH[0], 1.2, CATCH[1]], 0.36, 48), fov: 48 }; } },
    { id: 'ollie', t0: t.ollie, set: 'st', cam: (tt) => { const u = u01(tt, t.ollie, t.quinnC); const p = [laneX(4) + 1.2, 0.95 + 0.3 * u, -24.6]; return { pos: p, look: aimF(p, [laneX(4), 0.6, -19.8], 0.6, 50), fov: 50 }; } },
    { id: 'lift', t0: t.quinnC, set: 'st', cam: (tt) => { const a = lerp(-0.55, 0.35, smooth(u01(tt, t.quinnC, t.even))); const p = [CATCH[0] + 3.5 * Math.sin(a), 0.62, CATCH[1] - 3.5 * Math.cos(a)]; return { pos: p, look: aimF(p, [CATCH[0], 1.57, CATCH[1]], 0.72, 52), fov: 52 }; } },
    { id: 'post', t0: t.even, set: 'st', cam: (tt) => { const u = smooth(u01(tt, t.even, t.meanwhile)); return { pos: [12.6, 2.75, 30.2], look: [12.1 - 0.1 * u, 1.35, 27.4], fov: 46 }; } },
    { id: 'room', t0: t.meanwhile, set: 'br', cam: (tt) => { const u = smooth(u01(tt, t.meanwhile, t.twenty)); const p = bw(1.4 - 0.2 * u, 1.62, 1.9 - 0.5 * u); return { pos: p, look: aimF(p, bw(0.9, 1.62, -1.75), 0.37, 46), fov: 46 }; } },
    { id: 'stack', t0: t.twenty, set: 'br', cam: (tt) => { const u = smooth(u01(tt, t.twenty, t.handwritten)); const p = bw(1.15, 1.42 + 0.05 * u, 0.85 - 0.35 * u); return { pos: p, look: aimF(p, bw(0.88, 1.2, -1.3), 0.5, 48), fov: 48 }; } },
    { id: 'cry', t0: t.handwritten, set: 'br', cam: (tt) => { const u = u01(tt, t.handwritten, t.due); const p = bw(0.95, 1.25, 0.15 - 0.2 * u); return { pos: p, look: aimF(p, bw(0.9, 1.64, -1.75), 0.66, 44), fov: 44 }; } },
    { id: 'clock', t0: t.due, set: 'br', cam: (tt) => { const u = u01(tt, t.due, t.so); const p = bw(-0.05, 2.15, -1.0 - 0.25 * u); return { pos: p, look: aimF(p, bw(-0.05, 2.35, -2.47), 0.32, 40), fov: 40 }; } },
    { id: 'ears', t0: t.so, set: 'br', cam: (tt) => { const u = u01(tt, t.so, t.snap); const p = bw(1.05, 1.72, 1.05 - 0.3 * u); return { pos: p, look: aimF(p, bw(0.9, 1.66, -1.75), 0.36, 46), fov: 46 }; } },
    { id: 'photo', t0: t.snap, set: 'br', cam: (tt) => { const u = smooth(u01(tt, t.snap, t.scribe)); const p = bw(0.88, 1.42 - 0.04 * u, -0.38); return { pos: p, look: bw(0.88, 0.79, -0.8), fov: 46 }; } },
    { id: 'app', t0: t.scribe, set: 'br', cam: (tt) => { const u = smooth(u01(tt, t.scribe, t.in)); const s = laptopScreenWorld(), n = V(0, 0, 1).applyQuaternion(laptop.screen.getWorldQuaternion(new THREE.Quaternion())); const rr = V(1, 0, 0).applyQuaternion(laptop.screen.getWorldQuaternion(new THREE.Quaternion())), dd = 1.08 - 0.1 * u, c = s.clone().addScaledVector(rr, 0.075); const p = [c.x + n.x * dd, c.y + n.y * dd + 0.03, c.z + n.z * dd]; return { pos: p, look: [c.x, c.y - 0.02, c.z], fov: 40 }; } },
    { id: 'pen', t0: t.in, set: 'br', cam: (tt) => { let cx = 0, cz = 0; for (let k = 0; k < 6; k++) { const q = tipWorld(writeP(tt - k * 0.12)); cx += q[0] / 6; cz += q[2] / 6; } cx = lerp(cx, PAPER_POS[0] - 0.02, 0.45); cz = lerp(cz, PAPER_POS[2] - 0.06, 0.35); const p = [cx + 0.01, BO[1] + 0.79 + 0.46, cz + 0.12]; return { pos: p, look: [cx, BO[1] + 0.79, cz - 0.075], fov: 44 }; } },
    { id: 'teach', t0: t.your, set: 'cl', cam: (tt) => { const k = smooth(u01(tt, TLAUNCH - 0.1, TLAND)); const u = smooth(u01(tt, t.your, t.misses)); const p = cw(0.95, 1.4, 3.0 - 0.25 * u); return { pos: p, look: aimF(p, cw(0.6, 1.2, -1.9), 0.42, 52), fov: 52 }; } },
    { id: 'aplus', t0: t.misses, set: 'cl', cam: (tt) => { const u = smooth(u01(tt, t.misses, t.stillE)); const p = cw(1.9 - 0.4 * u, 0.85 + 0.25 * u, 2.4 - 0.6 * u); return { pos: p, look: aimF(p, cw(0.6, 0.85, -1.8), 0.52, 46), fov: 46 }; } },
    { id: 'gg', t0: t.stillE, set: 'cl', cam: (tt) => { const d = CL.D.desks[4], u = smooth(u01(tt, t.stillE, END)); const p = cw(d.x + 0.45, 1.55, d.z - 2.5 + 0.35 * u); return { pos: p, look: aimF(p, cw(d.x, 1.62, d.chair[2]), 0.4, 46), fov: 46 }; } },
  ];
  SH.forEach((s, i) => (s.t1 = SH[i + 1] ? SH[i + 1].t0 : END + 1));
  window.EDSTUDIO_CUTS = SH.slice(1).map((s) => s.t0);

  // ---------------------------------------------------------------- the pen + paper helpers
  const writeP = (tt) => (tt < t.in - 0.05 ? 0 : P1 * clamp((tt - (t.in - 0.05)) / (t.too + 0.2 - t.in)));
  const PAPER_POS = bw(0.88, 0.781, -0.78);
  const tipCache = new Map();
  function sheetTipAt(p) { const k = Math.round(p * 4) / 4; if (tipCache.has(k)) return tipCache.get(k); let acc = 0, tip = [sheet.w / 2, sheet.h / 2]; for (const it of sheet.items) { const wt = it.kind === 'p' ? it.w : 1; if (acc >= k) break; const f = Math.min(1, (k - acc) / wt); tip = it.kind === 'g' ? [it.x + it.w * f, it.y + it.h * 0.6] : it.pts[Math.min(it.pts.length - 1, Math.floor((it.pts.length - 1) * f))]; acc += wt; } tipCache.set(k, tip); return tip; }
  // the paper lies flat with its top toward −z: canvas x → world +x, canvas y → world +z
  const tipWorld = (p) => { const tip = sheetTipAt(p); return [PAPER_POS[0] + (tip[0] / sheet.w - 0.5) * 0.216, PAPER_POS[1] + 0.002, PAPER_POS[2] + (tip[1] / sheet.h - 0.5) * 0.279]; };
  const LAP = bw(0.25, 0.781, -1.05);
  function laptopScreenWorld() { laptop.screen.updateWorldMatrix(true, false); return laptop.screen.getWorldPosition(new THREE.Vector3()); }

  // ---------------------------------------------------------------- per-frame
  const hipsUp = { a: PI - 0.12, s: 0.12 }, seatY = BR.D.seat;
  const diveAt = (P, tt, D, rotY, opts = {}) => {      // run-up handled by the caller; flight from a → b (tip forward, arms ahead)
    const u = clamp((tt - D.t0) / (D.t1 - D.t0)), x = lerp(D.a[0], D.b[0], u), z = lerp(D.a[1], D.b[1], u);
    const lift = 0.95 * 4 * u * (1 - u) * (opts.h ?? 1);
    P.pose({ x, y: lift, z, rotY, tip: Math.min(PI / 2, u * 2.2) * (PI / 2) / (PI / 2), armL: hipsUp, armR: hipsUp, legL: { a: -0.25 }, legR: { a: -0.1 }, face: opts.face ?? 'scream' });
  };
  const flatPose = (D, rotY, face = 'oof') => ({ x: D.b[0], y: 0, z: D.b[1], rotY, tip: PI / 2, armL: hipsUp, armR: hipsUp, legL: { a: -0.25 }, legR: { a: -0.1 }, face });
  const runPose = (P, keys, tt, o = {}) => { const q = path(keys, tt); P.pose({ x: q.x, z: q.z, rotY: q.head ?? o.rotY ?? 0, walk: q.speed > 0.2 ? P.phaseFor(q.dist) : null, run: q.speed > 4, idle: tt, ...o }); return q; };

  function hideAll() {
    for (const d of dogs) d.root.visible = false;
    for (const p of [...H, ...players, ref, ...owners, you, teacher]) p.root.visible = false;
    for (const o of [stack, deskPaper, classPaper, aPlus, laptop.g, camPhone.g, postPhone.g, ...povArms, pen.g, magnifier]) o.visible = false;
    ears.visible = false; flash.material.opacity = 0; crown.visible = false; hearts.hide();
  }
  function useSet(set) {
    ST.root.visible = set === 'st'; BR.root.visible = set === 'br'; CL.root.visible = set === 'cl';
    const L = Wd.lights;
    Wd.sky.visible = set === 'st'; Wd.plate.visible = set === 'st';
    scene.fog = set === 'st' ? stadFog : null;
    if (set === 'br') { L.sun.intensity = 0.25; L.sun.color.setHex(0x8fa6ff); L.hemi.intensity = 0.42; L.hemi.color.setHex(0x5a66c8); L.hemi.groundColor.setHex(0x2a2440); BR.moon.intensity = 0.55; BR.lamp.light.intensity = 3.2; scene.background = new THREE.Color(0x0d1233); scene.environmentIntensity = 0.3; }
    else { L.sun.intensity = 2.4; L.sun.color.setHex(0xfff4e2); L.hemi.intensity = 1.0; L.hemi.color.setHex(0xd8eaff); L.hemi.groundColor.setHex(0x8a8f96); BR.moon.intensity = 0; BR.lamp.light.intensity = 0; scene.background = new THREE.Color(R.SKY.horizon); scene.environmentIntensity = 0.55; }
    camera.near = set === 'st' ? 0.05 : 0.02; camera.far = set === 'st' ? 2000 : 60; camera.updateProjectionMatrix();
  }

  function update(tt) {
    const sh = SH.find((s) => tt >= s.t0 && tt < s.t1) || SH[SH.length - 1], id = sh.id;
    hideAll(); useSet(sh.set);
    tags.list.forEach((e) => (e.on = true)); olTag.on = id === 'ollie';
    Wd.update(tt);

    if (sh.set === 'st') {
      // ----- the stadium: jumbotron, crowd, gate, ribbon, lane line
      const scr = tt < t.quinn ? [['HALFTIME', 'CORGI CUP'], '#1f63d6'] : tt < t.delayed ? [['LIVE', 'CORGI LOOSE'], '#c81e3a'] : tt < t.ollie ? [['2ND HALF', 'DELAYED'], '#c81e3a'] : [['WINNER', 'OLLIE'], '#16a34a'];
      ST.setScreen(...scr);
      const hype = tt < t.quinn ? 0.25 : tt < t.grab ? 0.6 : 1;
      const cheer = (i, T, s) => { const ph = s.ph ?? 0, j = Math.max(0, Math.sin(T * (5 + (i % 3)) + ph)) * hype * (hype > 0.5 ? 1 : 0.25), arms = hype > 0.5 ? clamp(0.5 + 0.5 * Math.sin(T * 3 + ph * 2)) * hype : 0.1 * (1 + Math.sin(T + ph)); return { jump: j * 0.6, arms }; };
      const front = id === 'post';
      ST.crowd.update(tt, (i, T, s) => (front && s.side > 0 && s.row <= 2 && Math.abs(s.x - 12.5) < 1.8 ? { hide: true } : cheer(i, T, s)));   // the POV lens sits in the stands
      if (id === 'wide' || id === 'tron' || id === 'field') ST.endCrowd.update(tt, cheer);
      const gateUp = easeOutBack(u01(tt, t.race, t.race + 0.3)); ST.gateBar.position.y = 1.0 + 1.2 * gateUp; ST.gateBar.rotation.z = 0.12 * gateUp;
      ST.snap(tt > t.winsO ? easeOutBack(u01(tt, t.winsO, t.winsO + 0.35)) : 0);
      ST.setLane(id === 'start' ? 2 : null, u01(tt, t.straight - 0.1, t.line + 0.3));
      const aims = { start: [laneX(2), 18, 10], wide: [0, 0, 60], gate: [laneX(2), 18, 8], pack: [laneX(2), 12, 14], stop: [laneX(2), 12, 8], field: [10, 12, 16], track: [path(QK, tt).x, 13, 9], mid: [-2, 11, 12],
        dive1: [-6.5, 9, 8], dive2: [-6.5, 5, 8], bench: [1, 25, 10], tron: [-60, 0, 40], legs: [4, 25, 10], grab: [CATCH[0], CATCH[1], 8], ollie: [laneX(4), -20, 8], lift: [CATCH[0], CATCH[1], 9], post: [12, 24, 10] };
      Wd.aim(aims[id][0], aims[id][1], aims[id][2]);

      // ----- dogs
      dogs.forEach((d, i) => {
        if (i === 2 || i === 4) return;
        const p = pack(i)(tt); d.pose({ x: p.x, z: p.z, rotY: PI, run: p.run ? d.phaseFor(LZ0 - p.z, DOG_S) : null, t: tt, scale: DOG_S, visible: p.z > -24 });
      });
      { const p = path(OLK, tt), fin = tt > t.winsO; OL.pose({ x: p.x, z: p.z, rotY: fin && p.speed < 0.5 ? 0.4 * Math.sin(tt * 3) : PI, run: p.speed > 0.3 ? OL.phaseFor(p.dist, DOG_S) : null, t: tt, scale: DOG_S, mouth: 'open', wag: fin ? 1.5 : 1 });
        crown.visible = tt > t.raceC - 0.05; crown.scale.setScalar(0.62 * easeOutBack(u01(tt, t.raceC - 0.05, t.raceC + 0.25))); }
      // Quinn
      const q = path(QK, tt), caught = tt >= t.grab;
      if (!caught) {
        let rotY = q.head ?? PI, look = 0, roll = 0;
        if (tt >= 7.4 && tt < t.not + 0.05) { rotY = PI; look = lerp(0, 0.0, 1); roll = 0.25 * smooth(u01(tt, t.absolutely, t.absolutely + 0.3)); }
        if (tt >= t.not - 0.05 && tt < t.not + 0.35) rotY = lerp(PI, -PI / 2 - 0.2, smooth(u01(tt, t.not - 0.05, t.not + 0.3)));
        Q.pose({ x: q.x, z: q.z, rotY, run: q.speed > 0.3 ? Q.phaseFor(q.dist, DOG_S) : null, t: tt, scale: DOG_S, mouth: tt > 7.4 && tt < t.absolutely ? 'closed' : 'open', headRoll: roll, look, wag: 1.4 });
      }
      // handlers
      const flatH = (P, D, rotY, seed, dir) => P.shatter(tt, D.t1, flatPose(D, rotY), { dir, power: 2.2, up: 3.4, seed });
      // H1
      if (tt < t.dive1) runPose(H[0], H1K, tt, { face: tt > 9 ? 'grin' : 'smile', armL: tt < 8.9 ? R.ARMS.cheer : undefined, armR: tt < 8.9 ? R.ARMS.cheer : undefined });
      else if (tt < t.miss1) diveAt(H[0], tt, D1, Math.atan2(D1.b[0] - D1.a[0], D1.b[1] - D1.a[1]));
      else flatH(H[0], D1, Math.atan2(D1.b[0] - D1.a[0], D1.b[1] - D1.a[1]), 21, [-0.1, 0, -0.9]);
      // H2
      if (tt < t.dive2) runPose(H[1], H2K, tt, { face: tt > 9 ? 'grin' : 'happy' });
      else if (tt < t.miss2) diveAt(H[1], tt, D2, Math.atan2(D2.b[0] - D2.a[0], D2.b[1] - D2.a[1]));
      else flatH(H[1], D2, PI / 2, 33, [0.9, 0, 0]);
      // H3: chase → dive → lands on her → sits up with her → stands, lifts her overhead
      const h3rot = Math.atan2(D3.b[0] - D3.a[0], D3.b[1] - D3.a[1]);
      if (tt < D3.t0) runPose(H[2], H3K, tt, { face: tt > 9 ? 'grin' : 'smile' });
      else if (tt < D3.t1) diveAt(H[2], tt, D3, h3rot, { face: 'shock' });
      else if (tt < t.grab + 0.42) H[2].pose({ ...flatPose(D3, h3rot, 'grin'), face: 'grin' });
      else if (tt < t.quinnC) { const k = smooth(u01(tt, t.grab + 0.42, t.grab + 0.75)); H[2].pose({ x: CATCH[0], z: CATCH[1] + 0.1, rotY: k > 0.5 ? 0 : h3rot, sit: k > 0.5, tip: (1 - k) * PI / 2, tipDir: 0, armL: R.ARMS.hold, armR: R.ARMS.hold, face: 'happy', idle: tt }); }
      else { const k = easeOutBack(u01(tt, t.quinnC, t.quinnC + 0.45)); H[2].pose({ x: CATCH[0], z: CATCH[1], rotY: PI, armL: { a: lerp(1.25, PI - 0.05, k), s: 0.12 }, armR: { a: lerp(1.25, PI - 0.05, k), s: 0.12 }, face: 'grin', bob: 0.04 * Math.abs(Math.sin(tt * 8)) }); }
      if (caught) {                                                // Quinn in H3's arms / overhead
        H[2].root.updateMatrixWorld(true);
        const a = H[2].hand.L.getWorldPosition(V(0, 0, 0)), b = H[2].hand.R.getWorldPosition(V(0, 0, 0)), m = a.add(b).multiplyScalar(0.5);
        const under = tt < t.grab + 0.42, over = tt >= t.quinnC;
        Q.pose({ x: under ? CATCH[0] - 0.1 : over ? m.x : CATCH[0] + 0.05, y: under || !over ? 0 : m.y, z: under ? CATCH[1] - 0.5 : over ? m.z : CATCH[1] + 0.85, rotY: over ? 0.2 * Math.sin(tt * 2) : 0.25, t: tt, scale: DOG_S * (under ? 0.95 : 1), mouth: 'open', wag: 2, visible: !under, run: over ? tt * 14 : null, roll: over ? 0 : 0 });
        if (over) { Q.root.position.y = m.y + 0.34; Q.root.rotation.y = PI + 0.25 * Math.sin(tt * 2.2); }
      }
      // H4/H5 trail her
      [[H[3], H4], [H[4], H5]].forEach(([P, f]) => { const p = f(tt), p2 = f(tt + 0.05); P.pose({ x: p.x, z: p.z, rotY: Math.atan2(p2.x - p.x, p2.z - p.z) || 0, walk: p.run ? P.phaseFor(tt * 5.5) : null, run: p.run, face: 'grin', idle: tt, visible: tt > 9 && tt < t.quinnC }); });
      if (tt < 9) { H[3].pose({ x: 22.6, z: 21.6, rotY: PI, idle: tt, armL: R.ARMS.cheer, armR: R.ARMS.cheer }); H[4].pose({ x: 11.6, z: -21.4, rotY: 0, idle: tt, armL: R.ARMS.hold, armR: R.ARMS.hold, face: 'happy' }); }
      // players + the ref on the +z sideline (heads follow Quinn in the 'legs' shot)
      players.forEach((p, i) => { const look = id === 'legs' ? clamp(Math.atan2(q.x - PLX(i), q.z - PLZ) - PI, -1.2, 1.2) : 0; const cheerUp = tt > t.quinnC;
        p.pose({ x: PLX(i), z: PLZ, rotY: PI + (i % 3 - 1) * 0.12, idle: tt + i, armL: cheerUp ? R.ARMS.cheer : i === 3 ? { a: 1.6, s: -0.35 } : R.ARMS.hips, armR: cheerUp ? R.ARMS.cheer : R.ARMS.hips, head: { yaw: look + (i === 3 && !cheerUp ? 0.35 : 0), pitch: i === 3 && !cheerUp ? 0.35 : 0 }, face: cheerUp ? 'happy' : id === 'legs' ? 'shock' : 'meh', bob: cheerUp ? 0.12 * Math.abs(Math.sin(tt * 7 + i)) : 0 }); });
      ref.pose({ x: 12.6, z: 25.7, rotY: PI - 0.5, idle: tt, armR: { a: 2.3, s: -0.3 }, armL: R.ARMS.hips, face: 'meh', head: { pitch: 0.1 } });
      owners.forEach((p, i) => p.pose({ x: [16.4, 24.4][i], z: -21.8, rotY: [-0.5, 0.5][i] + (tt > t.winsO ? 0 : 0), armL: R.ARMS.cheer, armR: tt > t.winsO ? R.ARMS.cheer : R.ARMS.wave(tt + i), face: tt > t.winsO ? 'happy' : 'grin', bob: tt > t.winsO ? 0.2 * Math.abs(Math.sin(tt * 8 + i)) : 0, idle: tt }));
      if (id === 'post') { tags.list.forEach((e) => (e.on = false)); phoneTex.draw(tt, { liked: tt > t.good, likeT: t.good }); }
    }

    // ----- the bedroom (night)
    if (sh.set === 'br') {
      const seated = { x: BO[0] + 0.9, z: BO[2] - 1.75, rotY: 0, sit: true, seat: seatY, idle: tt };
      const pov = id === 'photo' || id === 'app' || id === 'pen';
      you.root.visible = !pov;
      const face = id === 'room' ? 'grin' : id === 'stack' ? (tt > STACK_HIT ? 'shock' : 'grin') : id === 'cry' ? 'cry' : id === 'clock' ? 'cry' : id === 'ears' ? (tt > t.quinnS ? 'cool' : 'worried') : 'smile';
      const shake = id === 'stack' && tt > STACK_HIT ? 0.06 * Math.exp(-(tt - STACK_HIT) * 6) * Math.sin(tt * 60) : 0;
      you.pose({ ...seated, visible: !pov, armL: id === 'room' ? { a: 1.35, s: -0.2 } : id === 'cry' ? R.ARMS.facepalm : { a: 0.9, s: 0.05 }, armR: id === 'room' ? { a: 1.35, s: -0.2 } : { a: 0.9, s: 0.05 }, head: { pitch: id === 'room' ? 0.25 : 0, roll: shake + (id === 'cry' ? 0.1 * Math.sin(tt * 9) : 0) }, face });
      if (!pov) { ears.visible = id === 'ears' && tt > t.quinnS - 0.02; ears.scale.setScalar(ears.visible ? easeOutBack(u01(tt, t.quinnS - 0.02, t.quinnS + 0.25)) : 1); }
      // the stack of worksheets drops on the desk
      stack.visible = id === 'room' || id === 'stack' || id === 'cry'; sheet.draw(tt > t.in - 0.1 ? writeP(tt) : 0);
      if (stack.visible) { const y0 = bw(0, 0.781, 0)[1], fall = id === 'stack' ? 1 - easeInQ(u01(tt, t.twenty, STACK_HIT)) : 0, [sx, sy] = squash(tt, STACK_HIT, 0.3); stack.position.set(...bw(0.62, 0, -0.95)); stack.position.y = y0 + 0.9 * fall; stack.scale.set(sx, sy, sx); stack.visible = id !== 'room' || tt > t.twenty; }
      if (id === 'room') { you.root.updateMatrixWorld(true); const a = you.hand.L.getWorldPosition(V(0, 0, 0)), b = you.hand.R.getWorldPosition(V(0, 0, 0)); postPhone.g.visible = true; postPhone.g.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 0.1, 0.06)); postPhone.g.rotation.set(0.55, PI, 0); phoneTex.draw(tt, { liked: true, likeT: 0 }); }
      deskPaper.visible = id === 'photo' || id === 'pen' || id === 'app'; deskPaper.position.set(...PAPER_POS);
      laptop.g.visible = !(id === 'photo' || id === 'pen'); laptop.g.position.set(...LAP); laptop.g.rotation.y = PI + 0.35;
      const mode = tt < t.scribe ? 'home' : tt < t.solves ? 'scan' : tt < t.in - 0.15 ? 'solve' : 'write';
      screen.draw({ mode, k: mode === 'scan' ? u01(tt, t.scribe, t.solves) : mode === 'solve' ? u01(tt, t.solves, t.in - 0.2) : 0 });
      if (id === 'photo') { camPhone.screen.material.color.setScalar(tt > t.photo ? 1 + 2.5 * Math.exp(-(tt - t.photo) * 9) : 1); flash.material.opacity = tt > t.photo ? 0.85 * Math.exp(-(tt - t.photo) * 7) : 0; }
      if (id === 'pen') { const tip = tipWorld(writeP(tt)), sc = tt > t.in ? 0.0025 * Math.sin(tt * 55) : 0; pen.g.visible = true; pen.g.position.set(tip[0] + sc, tip[1], tip[2]); pen.glow.material.opacity = 0.55 + 0.25 * Math.sin(tt * 18); }
      const lx = BO[0] + 0.9; Wd.aim(lx, BO[2] - 1, 4); BR.setClock(11, tt > t.midnight ? 59 : 58);
    }

    // ----- the classroom
    if (sh.set === 'cl') {
      Wd.aim(CO[0] + 0.5, CO[2] - 0.5, 6);
      CL.D.desks.forEach((d, i) => { const hide = id === 'gg' ? i === 1 : i >= 2; d.g.visible = d.ch.visible = !hide; });
      const TD = cw(...CL.D.tdesk);
      classPaper.visible = true;
      // the paper hops off the desk when he dives, lands back as the debris settles
      const hop = u01(tt, TLAUNCH + 0.1, TLAND + 0.6), py = TD[1] + 0.002 + 0.75 * 4 * hop * (1 - hop);
      classPaper.position.set(TD[0], py, TD[2] - 0.1); classPaper.rotation.set(0.6 * Math.sin(hop * PI), 0, 0.25 * Math.sin(hop * PI * 2));
      aPlus.visible = tt > t.stillE - 0.5; aPlus.position.set(TD[0] + 0.05, TD[1] + 0.006, TD[2] - 0.05); aPlus.scale.setScalar(easeOutBack(u01(tt, t.stillE - 0.5, t.stillE - 0.3)) * 1.6);
      const tx = TD[0], tz = TD[2] - 0.75, D = { t0: TLAUNCH, t1: TLAND, a: [tx, tz + 0.2], b: [tx, CO[2] + 0.55] };
      if (tt < TLAUNCH) {
        teacher.pose({ x: tx, z: tz, rotY: 0, lean: 0.35 * smooth(u01(tt, t.your, t.dives)), idle: tt, armR: { a: 1.3 + 0.1 * Math.sin(tt * 3), s: -0.2 }, armL: R.ARMS.hips, head: { pitch: 0.5 }, face: tt > t.dives ? 'shock' : 'angry' });
        magnifier.visible = true; teacher.root.updateMatrixWorld(true); teacher.hand.R.getWorldPosition(magnifier.position); magnifier.position.y -= 0.05; magnifier.position.z += 0.12; magnifier.rotation.set(-PI / 2 + 0.3, 0, 0);
      } else if (tt < TLAND) diveAt(teacher, tt, D, 0, { h: 1.55, face: 'scream' });
      else teacher.shatter(tt, TLAND, flatPose(D, 0, 'oof'), { dir: [0, 0, 1], power: 2.4, up: 3.4, seed: 41 });
      const dk = CL.D.desks[4];
      you.pose({ x: CO[0] + dk.x, z: CO[2] + dk.chair[2], rotY: PI, sit: true, seat: 0.5, idle: tt, armL: tt > t.student ? R.ARMS.cheer : { a: 0.9 }, armR: tt > t.student ? R.ARMS.cheer : { a: 0.9 }, face: tt > t.stillE ? 'cool' : 'smile', visible: id === 'gg', bob: tt > t.student ? 0.05 * Math.abs(Math.sin(tt * 8)) : 0 });
      ears.visible = id === 'gg'; sheet.draw(sheet.total);
    }

    // ----- camera
    const cam = sh.cam(tt);
    studio.setCamera(cam.pos, cam.look, cam.fov, tt, 0.004);
    const d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
    kickR.apply(camera, tt, Math.min(d, 6));
    camera.updateMatrixWorld(true);
    if (id === 'post' || id === 'photo') povPhone(id === 'post' ? postPhone.g : camPhone.g, id === 'post' ? [0, -0.012, 0.29] : [0.0, 0.03, 0.27], tt);
    if (flash.material.opacity > 0) { const f = V(0, 0, -0.3).applyQuaternion(camera.quaternion); flash.position.copy(camera.position).add(f); flash.scale.setScalar(2); }
    studio.fill.intensity = sh.set === 'br' ? 0.35 : 0.3;
    FX.update(tt, camera); tags.update(camera, tt); chat.update(camera, tt); LOG.update(tt);
    hud.update(tt);
  }
  const easeInQ = (u) => clamp(u) ** 2;
  /** a phone held in front of the lens (POV): off = [right, up, forward] in metres in the camera frame; the arms reach in from below */
  function povPhone(ph, off, tt) {
    const r = V(1, 0, 0).applyQuaternion(camera.quaternion), u = V(0, 1, 0).applyQuaternion(camera.quaternion), f = V(0, 0, -1).applyQuaternion(camera.quaternion);
    const c = camera.position.clone().addScaledVector(r, off[0]).addScaledVector(u, off[1] + 0.004 * Math.sin(tt * 2.1)).addScaledVector(f, off[2]);
    ph.visible = true; ph.position.copy(c); ph.quaternion.copy(camera.quaternion); ph.rotateX(0.06);
    if (ph === postPhone.g) hearts.update(tt, t.good, c.clone().addScaledVector(r, 0.05).addScaledVector(u, -0.06).addScaledVector(f, -0.01).toArray());
  }

  // ---------------------------------------------------------------- the Scribe end card (brhud)
  const hud = makeHud({ show: [1e9, 1e9 + 1], alive: [[0, 0]], day: [[0, '']], feed: [], map: { shoreR: () => 1, spots: [], dots: () => [] },
    end: { t: ENDCARD, icon: '/videos/049-scribe-promo/scribe-icon.png', url: 'tryscribe.ink', tag: 'Your homework, in your handwriting.', offer: '10 free assignments ✦' } });

  // ---------------------------------------------------------------- QC (`node tools/render.mjs 069-rbx-corgi-loose --qc`)
  window.EDSTUDIO_QC = () => {
    const out = [], v = V(0, 0, 0), names = [['you', you], ['teacher', teacher], ['H1', H[0]], ['H2', H[1]], ['H3', H[2]], ...players.map((p, i) => ['player ' + i, p])];
    for (let tt = 0; tt < END; tt += 0.1) {
      update(tt);
      for (const [who, r] of names) {
        if (!r.root.visible || !r.body.visible) continue;
        r.root.updateMatrixWorld(true); r.head.getWorldPosition(v); v.project(camera);
        const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2; if (v.z > 1 || hx < 0.05 || hx > 0.95 || hy < 0 || hy > 1) continue;
        const cw0 = story.words.find((w) => tt >= w.t0 && tt < w.t1);
        if (cw0 && Math.abs(hx - 0.5) < 0.016 * cw0.w.length + 0.06 && Math.abs(hy - 1000 / 1920) < 0.045) out.push(`${tt.toFixed(1)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under the caption`);
      }
      for (const [who, d] of [['Quinn', Q], ['Ollie', OL]]) {
        if (!d.root.visible) continue; d.head.getWorldPosition(v); v.project(camera); const hx = (v.x + 1) / 2, hy = (1 - v.y) / 2;
        if (v.z < 1 && hx > 0.05 && hx < 0.95 && Math.abs(hy - 1000 / 1920) < 0.04) { const cw0 = story.words.find((w) => tt >= w.t0 && tt < w.t1); if (cw0 && Math.abs(hx - 0.5) < 0.016 * cw0.w.length + 0.06) out.push(`${tt.toFixed(1)}s ${who}'s face (y ${(hy * 100).toFixed(0)}%) under the caption`); }
      }
    }
    out.push(`shots: ${SH.length} → ` + SH.map((s) => `${s.id} ${s.t0.toFixed(2)}`).join(', '));
    update(0); return out;
  };
  update(0);
  return { update };
}

// ---------------------------------------------------------------- the team's post (a phone screen canvas; our own generic UI)
function makePostTex() {
  const c = document.createElement('canvas'); c.width = 540; c.height = 1080; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let last = '';
  const draw = (tt, { liked = false, likeT = 0 } = {}) => {
    const pop = liked ? 1 + 0.35 * Math.exp(-(tt - likeT) * 8) * Math.sin((tt - likeT) * 22) : 1, key = liked + ':' + pop.toFixed(2);
    if (key === last) return; last = key;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 540, 1080);
    g.fillStyle = '#f2f3f5'; g.fillRect(0, 0, 540, 96); g.fillStyle = '#16181d'; g.font = '700 34px Fredoka, sans-serif'; g.fillText('Posts', 30, 62);
    // header: avatar, name, check
    g.fillStyle = '#1f63d6'; g.beginPath(); g.arc(70, 170, 42, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; for (const [x, y, r] of [[54, 158, 9], [70, 150, 9], [86, 158, 9], [70, 180, 15]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = '#16181d'; g.font = '700 34px Fredoka, sans-serif'; g.fillText('The Team', 128, 164);
    g.fillStyle = '#1d9bf0'; g.beginPath(); g.arc(300, 152, 14, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(293, 152); g.lineTo(299, 158); g.lineTo(308, 146); g.stroke();
    g.fillStyle = '#6b6f76'; g.font = '500 26px Inter, sans-serif'; g.fillText('@team · 2m', 128, 200);
    g.fillStyle = '#16181d'; g.font = '600 44px Fredoka, sans-serif'; g.fillText('Still a good boy', 30, 300); g.fillText('though.', 30, 352);
    // the picture: a blocky corgi held up on a green field
    g.fillStyle = '#3fae49'; g.beginPath(); g.roundRect(30, 390, 480, 420, 26); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = 60; x < 510; x += 70) g.fillRect(x, 390, 6, 420);
    g.fillStyle = '#14b8a6'; g.fillRect(220, 660, 100, 150); g.fillStyle = '#f2c79b'; g.fillRect(232, 560, 76, 100);
    g.fillStyle = '#dc8a3c'; g.fillRect(170, 470, 200, 92); g.fillRect(320, 420, 90, 90); g.fillStyle = '#f6f1e8'; g.fillRect(372, 470, 46, 40);
    g.beginPath(); g.moveTo(330, 424); g.lineTo(344, 380); g.lineTo(362, 424); g.fill(); g.beginPath(); g.moveTo(372, 424); g.lineTo(390, 380); g.lineTo(404, 424); g.fillStyle = '#dc8a3c'; g.fill();
    g.fillStyle = '#2f7cf6'; g.fillRect(200, 474, 110, 84); g.fillStyle = '#16181d'; g.fillRect(352, 446, 10, 12); g.fillRect(410, 478, 12, 10);
    g.fillStyle = '#f2c79b'; g.fillRect(160, 450, 40, 120); g.fillRect(340, 500, 40, 80);
    // actions
    const hx = 70, hy = 880;
    g.save(); g.translate(hx, hy); g.scale(pop, pop); g.fillStyle = liked ? '#ff3d5a' : '#ffffff'; g.strokeStyle = liked ? '#ff3d5a' : '#16181d'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 22); g.bezierCurveTo(-46, -8, -22, -40, 0, -18); g.bezierCurveTo(22, -40, 46, -8, 0, 22); g.fill(); g.stroke(); g.restore();
    g.strokeStyle = '#16181d'; g.lineWidth = 5; g.beginPath(); g.roundRect(170, 860, 52, 40, 12); g.stroke(); g.beginPath(); g.moveTo(290, 900); g.lineTo(330, 862); g.lineTo(310, 902); g.stroke();
    g.fillStyle = '#6b6f76'; g.font = '500 26px Inter, sans-serif'; g.fillText(liked ? 'Liked by you and everyone' : 'Be the first to like this', 30, 960);
    tex.needsUpdate = true;
  };
  draw(0);
  return { tex, draw };
}
/** little red hearts that float up from the phone after the like */
function makeHearts(scene) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#ff3d5a'; g.translate(32, 36); g.beginPath(); g.moveTo(0, 18); g.bezierCurveTo(-34, -6, -16, -30, 0, -12); g.bezierCurveTo(16, -30, 34, -6, 0, 18); g.fill();
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const S = []; for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, depthTest: false })); s.renderOrder = 35; s.visible = false; scene.add(s); S.push(s); }
  return {
    hide() { S.forEach((s) => (s.visible = false)); },
    update(tt, t0, [x, y, z]) { S.forEach((s, i) => { const a = tt - t0 - i * 0.08; s.visible = a > 0 && a < 1.2; if (!s.visible) return; s.position.set(x - 0.012 + 0.03 * ((i * 37) % 10) / 10 + 0.008 * Math.sin(a * 6 + i), y + a * 0.15, z + 0.02); s.scale.setScalar(0.022 * (1 - a / 1.6)); s.material.opacity = 1 - a / 1.2; }); },
  };
}
