// VIDEO 008 — "What if everyone's search history appeared above their head?"  (tone: MONTAGE, funny — see docs/TONES.md)
// 68 s, 9 beats, FIVE sets in one scene (each set's root parked at its own offset; only the current one is visible).
// The premise is a prop: makeSearchBubble (engine/props.js) — a camera-facing search card above every head.
// Comedy: one gag per place, the picture (the card) delivers the punch, the subtitle sets it up. Gary (002/007) is the everyman.
//
// Shot list (seconds)                  | set      | what happens
//  0.0–10.0  walk   8:59 → 9:00         | street   | crowd walks; at 9:00 a search card pops above every head; all stop, look up, look away
// 10.0–16.5  gary   +10 seconds         | street   | Gary's card: "is it legal to marry a pigeon" + worse; the neighbour reads it and side-steps; Gary covers his head
// 16.5–23.0  class  +1 minute           | classroom| the teacher's card: "how many days until summer" … then every kid's card says the same
// 23.0–29.5  date   +1 hour             | street   | bench first date: "how to not look like a serial killer" / "how to tell if he's a serial killer"; she leaves
// 29.5–36.0  war    +1 day              | war room | six leaders, five cards say "how to delete search history"; they all look down at the table
// 36.0–42.5  hosp   +1 week             | street   | a surgeon walks out of the hospital: "can you put a spleen back in"; the waiting patient backs away
// 42.5–49.0  spy    +3 months           | border   | a spy in a trench coat: "how to look less suspicious"; the guard points at it; he turns back
// 49.0–55.5  gran   +6 months           | bedroom  | grandma on her tablet: "HOW DO I MAKE THE LETTERS BIGGER" → "SINGLE GRANDPAS NEAR ME" → "thank you so much dear"
// 55.5–68.0  end    +1 year             | street   | Gary meets a stranger whose card says "is it legal to marry a pigeon" too; high five. Fade → question card
import * as THREE from 'three';
import { K, clamp, lerp, lerpAngle, faceToward, rng, mat, mk } from '@engine/core.js';
import { makePerson, basePose, applyPose, blink } from '@engine/rig.js';
import { makePhone, makeSearchBubble } from '@engine/props.js';
import { buildStreet, SIDEWALK_H as SH, DIMS as SD } from '@engine/sets/street.js';
import { buildClassroom, DIMS as CD } from '@engine/sets/classroom.js';
import { buildWarRoom, DIMS as WD } from '@engine/sets/warroom.js';
import { buildBedroom } from '@engine/sets/bedroom.js';
import { buildBorder } from '@engine/sets/military.js';

const PI = Math.PI;
const OFF = { street: [1500, 0, 0], cls: [3000, 0, 0], war: [4500, 0, 0], bed: [6000, 0, 0], border: [7500, 0, 0] };
const POP = 7.0;   // 9:00 AM — every card appears

export const SHOTS = [
  { t0: 0, t1: 10.0, cam: 'walk', set: 'street' },
  { t0: 10.0, t1: 16.5, cam: 'gary', set: 'street' },
  { t0: 16.5, t1: 23.0, cam: 'class', set: 'cls' },
  { t0: 23.0, t1: 29.5, cam: 'date', set: 'street' },
  { t0: 29.5, t1: 36.0, cam: 'war', set: 'war' },
  { t0: 36.0, t1: 42.5, cam: 'hosp', set: 'street' },
  { t0: 42.5, t1: 49.0, cam: 'spy', set: 'border' },
  { t0: 49.0, t1: 55.5, cam: 'gran', set: 'bed' },
  { t0: 55.5, t1: 68.0, cam: 'end', set: 'street' },
];
// camera coordinates are LOCAL to the shot's set (OFF is added at runtime). p/a = start→end, fov, amp = handheld drift
export const CAMS = {
  walk:  { p: [[-20.0, 1.7, 4.0], [-20.0, 1.7, 3.4]], a: [[-20.0, 2.15, -1.6], [-20.0, 2.15, -1.6]], fov: 48, amp: 0.006 },
  gary:  { p: [[3.42, 1.9, 2.45], [3.35, 1.9, 2.15]], a: [[3.2, 2.12, -1.2], [3.2, 2.12, -1.2]], fov: 44, amp: 0.004 },
  class: { p: [[0.95, 2.05, -2.85], [0.85, 2.02, -2.82]], a: [[-0.3, 1.25, 0.8], [-0.35, 1.25, 0.8]], fov: 62, amp: 0.004 },
  date:  { p: [[10.0, 1.5, 1.65], [10.0, 1.48, 1.3]], a: [[10.0, 1.55, -2.2], [10.0, 1.53, -2.2]], fov: 50, amp: 0.004 },
  war:   { p: [[0.0, 2.1, 1.9], [0.0, 2.05, 1.6]], a: [[0, 1.95, -1.3], [0, 1.93, -1.3]], fov: 62, amp: 0.004 },
  hosp:  { p: [[-11.45, 1.85, 2.3], [-11.5, 1.83, 1.85]], a: [[-11.5, 2.02, -1.5], [-11.5, 2.0, -1.5]], fov: 48, amp: 0.005 },
  spy:   { p: [[1.9, 1.7, 3.7], [1.75, 1.66, 3.3]], a: [[-0.6, 1.9, -1.4], [-0.6, 1.88, -1.4]], fov: 52, amp: 0.005 },
  gran:  { p: [[1.95, 1.55, 1.55], [1.75, 1.5, 1.25]], a: [[0.0, 1.55, -1.4], [0.0, 1.52, -1.4]], fov: 50, amp: 0.003 },
  end:   { p: [[-20.0, 1.6, 3.1], [-20.0, 1.6, 2.6]], a: [[-20.0, 1.95, -1.5], [-20.0, 1.95, -1.5]], fov: 48, amp: 0.005 },
};
const shotAt = (t) => SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];

// ---------------------------------------------------------------- arm library (tested in 002/007 + this video's lineup, t ≥ 200)
const A = (sx, sz, el, twist = 0, free = 0) => ({ sx, sz, el, twist, free });
const REST = A(0.03, 0.07, -0.18, 0, 1);
const MOUTH_B = A(-1.25, 0.05, -2.4, -0.7);                                    // hand over mouth
const HIDE_A = A(-2.75, 0.45, -1.35, 0.25), HIDE_B = A(-2.75, 0.45, -1.35, -0.25); // both hands on top of the head ("hide it")
const POINT_B = A(-2.0, 0.15, -0.05, 0);                                         // pointing up
const TAB_A = A(-0.6, 0.0, -1.35, 0.5), TAB_B = A(-0.75, 0.05, -1.45, -0.45);    // holding a tablet at chest height
const HIGH5_B = A(-2.35, 0.25, -0.55, -0.2);                                     // raised for a high five
const CROSS_A = A(-0.5, -0.05, -1.6, 0.75), CROSS_B = A(-0.5, -0.05, -1.6, -0.75); // arms crossed-ish
const WRITE_B = A(-0.85, 0.12, -0.9, -0.3);
const mixArm = (a, b, k) => ({ sx: lerp(a.sx, b.sx, k), sz: lerp(a.sz, b.sz, k), el: lerp(a.el, b.el, k), twist: lerp(a.twist || 0, b.twist || 0, k), free: lerp(a.free ?? 0, b.free ?? 0, k) });

const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));
function walkDist(t, v, tStop = 1e9, ramp = 0.5) { if (t <= tStop) return v * t; const u = Math.min(t - tStop, ramp); return v * (tStop + u - (u * u) / (2 * ramp)); }
// cartoon pop: 0 → 1 with a small overshoot
const boing = (t, t0) => (t < t0 ? 0 : 1 - Math.exp(-7 * (t - t0)) * Math.cos(13 * (t - t0)));

const SKINS = [0xf1c3a1, 0xe2ad8c, 0xc98e6a, 0x9a6447, 0x6e4430, 0xf3d0b5, 0xd9a37f];
const TOPS = [0xd2483f, 0x3d7bd9, 0xf1c24a, 0x6fa84f, 0x8f6fb8, 0xe58fa6, 0x2f4f73, 0xf5f0e2, 0xe08a3a, 0x4fb3a8];
const PANTS = [0x34405c, 0x2a2a2a, 0x6b5a48, 0x45607a, 0x8a7b6a];
const HAIRS = [0x2a1d16, 0x5a3a24, 0x9a6a3a, 0xd9b46a, 0x1a1a1a, 0xc9c4be];
const STYLES = ['short', 'bob', 'messy', 'none', 'short', 'bob', 'messy'];
const KS = 0.62; // kid scale

// the crowd's searches (sus + specific, suggestive at most — nothing explicit, nothing about kids)
const CROWD_Q = [
  'how to delete search history', 'feet pics side hustle', 'how to get rid of a body', 'is it cheating if it was a dream',
  'how to explain the hotel charge to my wife', 'why is my roommate\'s toothbrush wet', 'how to tell my mom i\'m a furry',
  'can you marry a cartoon', 'is it illegal to lick a frog', 'incognito mode actually private??', 'how to win back my ex\'s mom',
  'is my dentist flirting', 'can you be allergic to your wife', 'how long can you not shower', 'my neighbor\'s wifi password',
  'can you sue a goose', 'why do i miss my ex\'s dog more than my ex', 'is it weird to lick batteries', 'can you get arrested for doing this',
  'how to text back after 6 weeks', 'does my boss know', 'why do i smell like soup', 'how to make my cat love me back',
  'is it normal to eat butter alone', 'how to look rich', 'how to hide a goat in an apartment',
];

export async function build(studio, story) {
  const { scene, setCamera } = studio;
  const off = (key, x, y, z) => [x + OFF[key][0], y + OFF[key][1], z + OFF[key][2]];

  // ---------------------------------------------------------------- sets (each parked at its offset; fogs kept per set)
  const street = buildStreet(studio, {}); street.root.position.set(...OFF.street); const streetFog = scene.fog;
  const cls = buildClassroom(studio, {}); cls.root.position.set(...OFF.cls); cls.setClock(9, 1); cls.setSeason('autumn', 0); cls.setDoor(0);
  cls.setBoard('Spelling test\nFRIDAY');
  const war = buildWarRoom(studio, {}); war.root.position.set(...OFF.war); war.globe.g.visible = false; war.beam.visible = false;
  const bed = buildBedroom(studio, {}); bed.root.position.set(...OFF.bed);
  bed.crib.visible = false; Object.values(bed.decor).forEach((g) => (g.visible = false)); bed.setDoor(0); bed.setLamp(1); bed.setNightlight(0); bed.setXmas(0, 0);
  bed.lights.spill.intensity = 0;
  const border = buildBorder(studio); border.root.position.set(...OFF.border);
  border.tanks.forEach((T) => (T.g.visible = false));
  scene.fog = null;
  const ROOTS = { street: street.root, cls: cls.root, war: war.root, bed: bed.root, border: border.root };
  const FOGS = { street: streetFog, cls: null, war: null, bed: null, border: null };
  const FAR = { street: 400, cls: 60, war: 60, bed: 60, border: 420 };

  // ---------------------------------------------------------------- cast
  const R = rng(8);
  const randPerson = () => {
    const style = STYLES[Math.floor(R() * STYLES.length)];
    const p = makePerson({ skin: SKINS[Math.floor(R() * SKINS.length)], top: TOPS[Math.floor(R() * TOPS.length)], pants: PANTS[Math.floor(R() * PANTS.length)],
      hair: HAIRS[Math.floor(R() * HAIRS.length)], hairStyle: style, glasses: R() < 0.25, mustache: style !== 'bob' && R() < 0.3 ? HAIRS[Math.floor(R() * 3)] : null });
    scene.add(p.root); p.seed = R(); p.seed2 = R(); p.seed3 = R(); return p;
  };
  const extras = Array.from({ length: 26 }, randPerson);
  const kids = Array.from({ length: 18 }, () => { const k = randPerson(); k.root.scale.setScalar(KS); return k; });
  const gary = makePerson({ skin: 0xe9b48f, top: 0x3d7bd9, collar: 0xf5f0e2, pants: 0x6b5a48, shoes: 0x3a2e2a, hair: 0x5a3a24, hairStyle: 'none', mustache: 0x4a2e1c, headR: 0.142 });
  const neighbor = makePerson({ skin: 0x9a6447, top: 0xe58fa6, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'bob' });
  const teacher = makePerson({ skin: 0xe2ad8c, top: 0x7a9e7e, collar: 0xf3e9dc, pants: 0x4a4f5c, hair: 0x8a5a3a, hairStyle: 'bob', glasses: true });
  const him = makePerson({ skin: 0xf1c3a1, top: 0x2f4f73, collar: 0xf5f0e2, pants: 0x2a2a2a, hair: 0x2a1d16, hairStyle: 'messy' });
  const her = makePerson({ skin: 0xc98e6a, top: 0xf1c24a, pants: 0x45607a, hair: 0x3d2a1f, hairStyle: 'bob' });
  const LEAD = [
    { a: PI - 1.0, skin: 0xe8b996, top: 0x2b3a57, pants: 0x232a3a, hair: 0x2e2620, hairStyle: 'short' },
    { a: PI + 0.6, skin: 0xc68e66, top: 0x3a3b40, pants: 0x2a2a2e, hair: 0x1d1a18, hairStyle: 'bob' },
    { a: PI - 0.2, skin: 0x9a6a4c, top: 0x4c5a3a, pants: 0x3a4430, hair: 0x18120e, hairStyle: 'short' },
    { a: PI + 1.0, skin: 0xf0c8a8, top: 0x5a2d36, pants: 0x2b2228, hair: 0xb8b4ad, hairStyle: 'short', glasses: true },
    { a: PI + 0.2, skin: 0xd9a77f, top: 0x31435a, pants: 0x262f3d, hair: 0x5a4030, hairStyle: 'bob' },
    { a: PI - 0.6, skin: 0xe2ad8c, top: 0x6a7380, pants: 0x3a3f47, hair: 0x3d2a1f, hairStyle: 'messy' },
  ];
  const leaders = LEAD.map((L) => makePerson({ ...L, collar: 0xf1ede4 }));
  const doctor = makePerson({ skin: 0xf1c3a1, top: 0xf7f7f4, collar: 0x7fb7b0, pants: 0x5fa39b, shoes: 0xf2f2f2, hair: 0x9a6a3a, hairStyle: 'bob', glasses: true });
  const patient = makePerson({ skin: 0x9a6447, top: 0xe08a3a, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a });
  const spy = makePerson({ skin: 0xe2ad8c, top: 0xb08a58, collar: 0xb08a58, pants: 0x3a3226, shoes: 0x1a1a1a, hair: 0x1a1a1a, hairStyle: 'short', mustache: 0x1a1a1a, glasses: true });
  // trench coat skirt + dark glasses on the spy
  mk(new THREE.CylinderGeometry(0.2, 0.27, 0.5, 16, 1, true), mat(0xb08a58, 0.85, { side: THREE.DoubleSide }), spy.pelvis, 0, -0.2, 0);
  spy.head.glasses.children.forEach((m) => m.material && (m.material = mat(0x111111, 0.3)));
  const shades = mk(new THREE.BoxGeometry(0.2, 0.05, 0.02), mat(0x111111, 0.2), spy.head.g, 0, 0.012, 0.135);
    const gran = makePerson({ skin: 0xf0c8a8, top: 0xa86b82, collar: 0xf1ede4, pants: 0x6a5a6a, shoes: 0x7a5a4a, hair: 0xdedad4, hairStyle: 'bob', glasses: true });
  const linda = makePerson({ skin: 0x6e4430, top: 0x4fb3a8, pants: 0x34405c, hair: 0x1a1a1a, hairStyle: 'bob' });
  const guard = border.guard;                                 // reparented to the scene (put() adds the set offset itself)
  const CAST = [gary, neighbor, teacher, him, her, ...leaders, doctor, patient, spy, guard, gran, linda];
  CAST.forEach((c) => scene.add(c.root));
  const ALL = [...extras, ...kids, ...CAST];

  // gran's tablet
  const tablet = makePhone(); tablet.g.scale.setScalar(2.1); gran.arms.find((a) => a.s === 1).hand.add(tablet.g);
  tablet.g.position.set(-0.06, -0.06, 0.05); tablet.g.rotation.set(0.9, 0, 0.5); tablet.screenMat.emissiveIntensity = 1.0;

  // ---------------------------------------------------------------- the search cards
  const B = (o) => { const b = makeSearchBubble(o); scene.add(b.sprite); return b; };
  const crowdB = extras.map((e, i) => B({ query: CROWD_Q[i % CROWD_Q.length], width: 0.9, maxChars: 14 }));
  const kidB = kids.map(() => B({ query: 'how many days until summer', width: 0.62, maxChars: 12 }));
  const hero = {
    gary: B({ query: 'is it legal to marry a pigeon', history: ['pigeon costume adult size', 'how to tell if a pigeon is flirting', 'why do pigeons look at me like that', 'how to delete search history'], width: 1.1, maxChars: 30, offX: -0.3 }),
    neighbor: B({ query: 'how to make gary stop talking about pigeons', width: 0.7, maxChars: 18, offX: 0.25 }),
    teacher: B({ query: 'how many days until summer', history: ['wine that looks like coffee', 'how to fake my death before parent night'], width: 0.62, maxChars: 22 }),
    him: B({ query: 'how to not look like a serial killer', width: 0.72, maxChars: 12, offX: 0.2 }),
    her: B({ query: 'how to tell if he\'s a serial killer', width: 0.72, maxChars: 12, offX: -0.2 }),
    leaders: LEAD.map((L, i) => B({ query: i === 4 ? 'is incognito mode actually incognito' : 'how to delete search history', width: 0.8, maxChars: 11 })),
    doctor: B({ query: 'can you put a spleen back in', history: ['surgery tutorial 2x speed', 'lost my wedding ring inside a patient', 'is it bad if they woke up'], width: 0.85, maxChars: 22, offX: -0.12 }),
    patient: B({ query: 'webmd says i\'m pregnant. i\'m a man', width: 0.55, maxChars: 13, offX: -0.15 }),
    spy: B({ query: 'how to look less suspicious', history: ['how to get rid of a body (asking for a friend)', 'my handler is my mom what do i do', 'how to delete search history'], width: 1.3, maxChars: 26, offX: 0.12 }),
    guard: B({ query: 'how to ask out a spy', width: 0.6, maxChars: 14, offX: 0.1 }),
    gran: B({ query: 'HOW DO I MAKE THE LETTERS BIGGER', history: ['SINGLE GRANDPAS NEAR ME', 'is 91 too old for a tattoo', 'thank you so much dear'], width: 0.8, maxChars: 22 }),
    garyEnd: B({ query: 'is it legal to marry a pigeon', width: 0.7, maxChars: 10, offX: 0.2 }),
    linda: B({ query: 'is it legal to marry a pigeon', width: 0.7, maxChars: 10, offX: -0.2 }),
  };
  const BUBBLES = [...crowdB, ...kidB, ...Object.values(hero).flat()];
  const _v = new THREE.Vector3();
  /** Place a card on top of a rig's head (lift in meters above the neck pivot, scaled for kids). */
  function stick(b, rig, k = 1, scale = 1, lift = 0.36) {
    rig.root.updateMatrixWorld(true); rig.headG.getWorldPosition(_v);
    b.sprite.position.set(_v.x, _v.y + lift * scale, _v.z); b.setPop(k * scale); b.sprite.visible = k > 0.001;
  }

  // ---------------------------------------------------------------- performances (local coords; `key` = set)
  function put(rig, key, p, scale = 1) {
    p.floor = p.floor || 0;
    p.x += OFF[key][0]; p.z += OFF[key][2];
    applyPose(rig, p);
    if (scale !== 1) rig.root.position.y = (p.y || 0) * scale;
    rig.root.visible = true;
  }
  const LIFTS = [0.36, 0.95, 0.65];   // crowd cards stacked at three heights so they don't hide each other
  const popAt = (t, x) => boing(t, POP + ((x + 26) / 12) * 0.45); // the cards pop left→right along the street

  function walkCrowd(t, e, i) { // S1: side-on walkers; cards pop; all stop, look up, then look away from each other
    const p = basePose(); p.eyes = blink(t, i + 3); p.y = SH; p.floor = SH;
    const v = (e.seed < 0.5 ? -1 : 1) * (0.75 + e.seed2 * 0.45);
    const lanes = [-2.5, -2.05, -1.6, -1.15, -0.7];
    const stop = POP + 0.15 + e.seed2 * 0.3;
    const d = walkDist(t, v, stop, 0.45);
    p.x = wrap(((i * 0.37 + e.seed * 0.3) % 1) * 12 - 26 + d, -26, -14); p.z = lanes[i % lanes.length] + (e.seed3 - 0.5) * 0.15;
    p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(d); p.speed = t < stop ? Math.abs(v) : 0;
    const up = K(t, [[POP + 0.45 + e.seed * 0.15, 0], [POP + 0.8 + e.seed * 0.15, 1]]);
    const away = K(t, [[POP + 1.7 + e.seed * 0.2, 0], [POP + 2.1 + e.seed * 0.2, 1]]);
    p.headPitch = lerp(0.05, -0.55, up) * (1 - away) + 0.4 * away;
    p.headYaw = (i % 2 ? 0.8 : -0.8) * away;
    p.mouth = up > 0.3 ? 'o' : 'smile';
    if (away > 0) p.mouth = 'flat';
    if (i % 3 === 0) p.armB = mixArm(REST, MOUTH_B, K(t, [[POP + 1.0 + e.seed * 0.2, 0], [POP + 1.35 + e.seed * 0.2, 1]]));
    return p;
  }
  function endCrowd(t, e, i) { // S9: a year later — everyone walks with their card up, nobody cares; heads up, smiling
    const p = basePose(); p.eyes = blink(t, i + 3); p.y = SH; p.floor = SH;
    const v = (e.seed < 0.5 ? -1 : 1) * (0.7 + e.seed2 * 0.4);
    const lanes = [-2.75, -2.4, -2.05];
    const d = v * (t - 55.5);
    p.x = wrap(((i * 0.41 + e.seed * 0.3) % 1) * 12 - 26 + d, -26, -14); p.z = lanes[i % lanes.length] + (e.seed3 - 0.5) * 0.12;
    p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(d); p.speed = Math.abs(v);
    p.headYaw = (e.seed2 - 0.5) * 0.6; p.mouth = 'smile';
    return p;
  }
  function bgWalker(t, e, i, x0, x1, z, t0) { // background walkers for close shots
    const p = basePose(); p.eyes = blink(t, i); p.y = SH; p.floor = SH;
    const v = (i % 2 ? -1 : 1) * (0.7 + e.seed2 * 0.3), d = v * (t - t0);
    p.x = wrap(x0 + (i * 0.43 % 1) * (x1 - x0) + d, x0, x1); p.z = z + (i % 2) * 0.35;
    p.rotY = v > 0 ? PI / 2 : -PI / 2; p.dist = Math.abs(d); p.speed = Math.abs(v); p.headPitch = 0.25; p.mouth = 'flat';
    return p;
  }

  // S2: Gary in front of the market; the neighbour beside him reads his card and side-steps out of frame
  const GX = 3.15, GZ = -1.2;
  function garyPose(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.y = SH; p.floor = SH; p.mouth = 'flat';
    Object.assign(p, { x: GX, z: GZ, rotY: 0.22 });
    const look = K(t, [[10.2, 0], [10.6, 1], [12.9, 1], [13.3, 0]]);
    p.headPitch = lerp(0.05, -0.6, look); p.mouth = look > 0.5 ? 'o' : 'flat';
    const hideK = K(t, [[13.4, 0], [13.75, 1], [15.0, 1], [15.4, 0.15]]);
    p.armA = mixArm(REST, HIDE_A, hideK); p.armB = mixArm(REST, HIDE_B, hideK);
    p.headPitch += 0.25 * hideK;
    p.headYaw = K(t, [[15.0, 0], [15.4, 0.38]]);            // deadpan look into the lens
    return p;
  }
  function neighborPose(t) {
    const p = basePose(); p.eyes = blink(t, 6); p.y = SH; p.floor = SH;
    const step = K(t, [[13.6, 0], [14.6, 1]]);
    Object.assign(p, { x: lerp(GX - 0.62, GX - 1.35, step), z: GZ - 0.25, rotY: lerp(0.1, -PI / 2, K(t, [[13.5, 0], [13.75, 1]])) });
    p.dist = 0.75 * step; p.speed = step > 0.02 && step < 0.98 ? 0.8 : 0;
    const read = K(t, [[11.6, 0], [12.0, 1]]);
    p.headYaw = read * 0.75; p.headPitch = lerp(0.05, -0.45, read); p.mouth = read > 0.5 ? 'flat' : 'smile';
    return p;
  }

  function kidPose(t, i) { // S3: kids at desks facing the board
    const p = basePose(); p.eyes = blink(t, i + 4);
    const d = CD.desks[i];
    Object.assign(p, { x: d.x, z: d.z + CD.chair.dz, rotY: PI, y: -0.22, footFwd: 0.4, lean: 0.06 });
    p.headPitch = lerp(-0.05, -0.55, K(t, [[20.45 + (i % 4) * 0.05, 0], [20.8, 1], [21.6, 1], [22.0, 0]]));
    p.mouth = t > 20.4 ? 'smile' : 'flat';
    p.armA = A(-0.7, 0.05, -0.9, 0.3); p.armB = A(-0.7, 0.05, -0.9, -0.3);
    return p;
  }
  function teacherPose(t) {
    const p = basePose(); p.eyes = blink(t, 1); p.glasses = true;
    Object.assign(p, { x: 0.25, z: -1.35, rotY: 0.05 });
    p.armA = CROSS_A; p.armB = CROSS_B;
    const up = K(t, [[16.9, 0], [17.3, 1], [19.4, 1], [19.8, 0]]);
    const see = K(t, [[20.7, 0], [21.1, 1]]);                 // she sees every kid's card
    p.headPitch = lerp(0.0, -0.45, up) + 0.15 * see; p.headYaw = see * 1.0; p.mouth = see > 0.5 ? 'smile' : 'flat';
    return p;
  }

  // S4: first date on the bench. She reads his card, he reads hers; she leaves (40 seconds into the date)
  const BX = SD.spots.bench[0], BZ = SD.spots.bench[1];
  function himPose(t) {
    const p = basePose(); p.eyes = blink(t, 3);
    Object.assign(p, { x: BX - 0.38, z: BZ - 0.02, y: -0.185, floor: SH, rotY: 0.12, footFwd: 0.42 });
    const read = K(t, [[25.1, 0], [25.45, 1]]);
    p.headYaw = lerp(0.25, 0.65, read); p.headPitch = lerp(0.05, -0.42, read);
    const back = K(t, [[26.9, 0], [27.3, 1]]);
    p.headPitch = lerp(p.headPitch, 0.0, back); p.headYaw = lerp(p.headYaw, 0.8, back);
    const cam = K(t, [[28.3, 0], [28.7, 1]]); p.headYaw = lerp(p.headYaw, -0.1, cam);   // deadpan into the lens
    p.mouth = read > 0.5 && cam < 0.5 ? 'o' : 'smile';
    if (cam > 0.5) p.mouth = 'flat';
    p.armA = A(-0.45, 0.05, -0.9, 0.3); p.armB = A(-0.45, 0.05, -0.9, -0.3);
    return p;
  }
  function herPose(t) {
    const p = basePose(); p.eyes = blink(t, 7);
    const up = K(t, [[26.8, 0], [27.25, 1]]);
    const walk = clamp((t - 27.3) / 2.2), d = walk * 2.6;
    Object.assign(p, { x: BX + 0.38 + d, z: lerp(BZ - 0.02, BZ + 0.45, up), y: lerp(-0.185, SH, up), floor: SH, rotY: lerpAngle(-0.12, PI / 2, K(t, [[27.1, 0], [27.4, 1]])), footFwd: 0.42 * (1 - up) });
    p.dist = d; p.speed = walk > 0 && walk < 1 ? 1.2 : 0;
    const read = K(t, [[24.0, 0], [24.35, 1], [25.6, 1], [25.95, 0]]);
    p.headYaw = lerp(-0.25, -0.7, read); p.headPitch = lerp(0.05, -0.42, read);
    const stare = K(t, [[25.95, 0], [26.3, 1]]); p.headYaw = lerp(p.headYaw, -0.05, stare * (1 - up));
    p.mouth = read > 0.5 ? 'o' : 'smile'; if (stare > 0.5) p.mouth = 'flat';
    if (up < 0.5) { p.armA = A(-0.45, 0.05, -0.9, 0.3); p.armB = A(-0.45, 0.05, -0.9, -0.3); }
    return p;
  }

  function leaderPose(t, i) { // S5: notice each other's cards → all look down at the table in sync
    const L = LEAD[i], Rr = WD.ring;
    const p = basePose(); p.eyes = blink(t, i + 1); p.glasses = !!L.glasses;
    p.x = Math.sin(L.a) * Rr; p.z = Math.cos(L.a) * Rr; p.rotY = L.a + PI;
    p.armA = CROSS_A; p.armB = i % 2 ? WRITE_B : CROSS_B;
    const look = K(t, [[30.6 + i * 0.12, 0], [31.0 + i * 0.12, 1], [33.0, 1], [33.6, 0]]);
    p.headPitch = lerp(0.1, -0.35, look); p.headYaw = (i % 2 ? 0.55 : -0.55) * look;
    const down = K(t, [[33.5, 0], [34.3, 1]]);
    p.headPitch = lerp(p.headPitch, 0.55, down); p.lean = 0.03 + 0.12 * down;
    p.mouth = look > 0.5 ? 'o' : 'flat';
    if (i === 4) { const s = K(t, [[34.6, 0], [35.0, 1]]); p.headPitch = lerp(p.headPitch, 0.0, s); p.mouth = s > 0.5 ? 'smile' : p.mouth; }
    return p;
  }

  // S6: the surgeon walks out of the hospital doors and stops; the waiting patient reads her card and backs away
  function doctorPose(t) {
    const p = basePose(); p.eyes = blink(t, 5); p.y = SH; p.floor = SH; p.glasses = true;
    const walk = K(t, [[36.0, 0], [37.8, 1]]);
    Object.assign(p, { x: -11.35, z: lerp(-2.75, -1.05, walk), rotY: 0.1 });
    p.dist = 1.7 * walk; p.speed = walk > 0.02 && walk < 0.98 ? 1.0 : 0;
    p.headPitch = 0.4; p.armA = A(-0.6, 0.0, -1.35, 0.5); p.armB = WRITE_B;  // reading a clipboard
    p.mouth = 'flat';
    return p;
  }
  function patientPose(t) {
    const p = basePose(); p.eyes = blink(t, 9); p.y = SH; p.floor = SH;
    const back = K(t, [[40.6, 0], [42.4, 1]]);
    Object.assign(p, { x: lerp(-11.92, -12.5, back), z: lerp(-0.6, -0.2, back), rotY: 0.75 });
    p.dist = 0.6 * back; p.speed = back > 0.02 && back < 0.98 ? 0.5 : 0;
    const read = K(t, [[39.3, 0], [39.7, 1]]);
    p.headPitch = lerp(0.05, -0.5, read); p.headYaw = 0.1 * read;
    p.mouth = read > 0.5 ? 'o' : 'flat';
    p.armB = mixArm(REST, MOUTH_B, K(t, [[40.0, 0], [40.35, 1]]));
    return p;
  }

  // S7: the spy strolls up to the barrier; the guard points at his card; he looks up at it and walks back
  function spyPose(t) {
    const p = basePose(); p.eyes = 'open'; p.glasses = true;
    const inK = K(t, [[42.5, 0], [44.9, 1]]);
    const z = lerp(-4.6, -1.0, inK);
    const turn = K(t, [[47.4, 0], [47.8, 1]]);
    const outD = Math.max(0, t - 47.8) * 1.1;
    Object.assign(p, { x: 0.55, z: z - outD, rotY: lerpAngle(0, PI, turn) });
    p.dist = 3.6 * inK + outD; p.speed = (inK > 0.02 && inK < 0.98) || outD > 0 ? 1.1 : 0;
    p.armA = CROSS_A; p.armB = CROSS_B;
    const up = K(t, [[46.3, 0], [46.7, 1], [47.2, 1], [47.5, 0]]);
    p.headPitch = lerp(0.05, -0.6, up); p.mouth = up > 0.5 ? 'o' : 'flat';
    return p;
  }
  function guardPose(t) {
    const p = basePose(); p.eyes = blink(t, 4);
    Object.assign(p, { x: 0.0, z: 0.8, rotY: PI - 0.15 });
    const read = K(t, [[44.6, 0], [45.0, 1]]);
    p.headPitch = lerp(0.05, -0.35, read);
    const point = K(t, [[45.4, 0], [45.8, 1], [47.4, 1], [47.8, 0]]);
    p.armA = mixArm(REST, { ...POINT_B, twist: 0 }, point);
    p.mouth = point > 0.5 ? 'o' : 'flat';
    return p;
  }

  // S8: grandma on the edge of the bed with her tablet
  function granPose(t) {
    const p = basePose(); p.eyes = blink(t, 2); p.glasses = true;
    Object.assign(p, { x: 0.35, z: -1.15, y: -0.17, footFwd: 0.42, rotY: 0.95, lean: 0.1 });
    p.armA = TAB_A; p.armB = TAB_B;
    const tap = (a) => K(t, [[a, 0], [a + 0.1, 1], [a + 0.25, 0]]);
    p.armB = { ...TAB_B, sx: TAB_B.sx - 0.08 * (tap(49.9) + tap(51.1) + tap(52.5)) };
    const up = K(t, [[53.9, 0], [54.4, 1]]);
    p.headPitch = lerp(0.5, -0.05, up); p.headYaw = lerp(0, 0.25, up); p.mouth = 'smile';
    return p;
  }

  // S9: Gary walks right, Linda walks left; they stop, read each other's card, look at each other, high five
  const MEET = 58.0;
  function endPair(t, who) {
    const p = basePose(); p.eyes = blink(t, who === 'g' ? 2 : 5); p.y = SH; p.floor = SH;
    const s = who === 'g' ? 1 : -1, xStop = -20 - s * 0.32;
    const v = 0.85, d = walkDist(t - 55.5, v, MEET - 55.5, 0.5);
    p.x = xStop - s * (v * (MEET - 55.5 + 0.25) - d); p.z = -0.3;
    p.rotY = s > 0 ? PI / 2 : -PI / 2; p.dist = d; p.speed = t < MEET ? v : 0;
    const read = K(t, [[58.3, 0], [58.7, 1], [59.4, 1], [59.8, 0]]);
    p.headPitch = lerp(0.05, -0.5, read);
    const turn = K(t, [[60.0, 0], [60.4, 1]]);                       // both turn a little toward the lens
    p.rotY = lerpAngle(p.rotY, s > 0 ? PI / 2 - 0.55 : -PI / 2 + 0.55, turn);
    const hi = K(t, [[60.2, 0], [60.45, 1], [60.75, 1], [61.1, 0]]);
    if (s > 0) p.armA = mixArm(REST, { ...HIGH5_B, twist: 0.2 }, hi); else p.armB = mixArm(REST, HIGH5_B, hi);
    p.mouth = read > 0.5 ? 'o' : 'smile';
    return p;
  }

  // ---------------------------------------------------------------- debug pose lineup (t ≥ 200, stills only)
  const LINEUP = [['REST', REST, REST], ['HIDE', HIDE_A, HIDE_B], ['POINT', REST, POINT_B], ['TABLET', TAB_A, TAB_B], ['HIGH5', REST, HIGH5_B], ['MOUTH', REST, MOUTH_B], ['CROSS', CROSS_A, CROSS_B], ['WRITE', A(-0.6, 0.0, -1.35, 0.5), WRITE_B]];
  function lineup(t) {
    for (const [k, r] of Object.entries(ROOTS)) r.visible = k === 'street';
    scene.fog = streetFog; studio.camera.far = 400;
    ALL.forEach((p) => (p.root.visible = false)); BUBBLES.forEach((b) => (b.sprite.visible = false));
    const yaw = t >= 210 ? 0.25 : 1.0;
    extras.slice(0, LINEUP.length).forEach((e, i) => { const p = basePose(); Object.assign(p, { x: -20 + i * 0.85, z: 3.0, rotY: yaw }); p.armA = LINEUP[i][1]; p.armB = LINEUP[i][2]; put(e, 'street', p); });
    street.aimSun(-17, 3, 8); street.setSeason('spring', 0, [-17, 3]);
    const k = (Math.floor(t) % 4) * 2; extras.forEach((e, i) => { e.root.visible = i >= k && i < k + 2; });
    setCamera(off('street', -20 + k * 0.85 + 0.42, 1.2, 6.6), off('street', -20 + k * 0.85 + 0.42, 0.95, 3.0), 40, 0, 0);
  }

  // ---------------------------------------------------------------- per-frame update
  let lastSet = null;
  function update(t) {
    document.getElementById('ui').style.visibility = t >= 200 ? 'hidden' : '';
    if (t >= 200) { lastSet = null; return lineup(t); }
    const shot = shotAt(t), S = shot.set;
    if (S !== lastSet) { for (const [k, r] of Object.entries(ROOTS)) r.visible = k === S; lastSet = S; }
    scene.fog = FOGS[S]; studio.camera.far = FAR[S];
    studio.fill.intensity = S === 'bed' ? 1.2 : S === 'war' ? 1.0 : S === 'border' ? 2.2 : 0.4;
    ALL.forEach((p) => (p.root.visible = false)); BUBBLES.forEach((b) => (b.sprite.visible = false));

    if (S === 'street') {
      const center = { walk: [-20, -1.5], gary: [3, -1.3], date: [10, -2], hosp: [-11.5, -1.5], end: [-20, -1.5] }[shot.cam];
      street.aimSun(center[0], center[1], 9);
      street.setSeason({ walk: 'spring', gary: 'spring', date: 'summer', hosp: 'autumn', end: 'spring' }[shot.cam], t, center);
      street.cart.visible = shot.cam !== 'gary';
      if (shot.cam === 'walk') {
        extras.forEach((e, i) => { const p = walkCrowd(t, e, i); put(e, 'street', p); stick(crowdB[i], e, popAt(t, p.x - OFF.street[0]), 1, LIFTS[i % 3]); });
      } else if (shot.cam === 'gary') {
        put(gary, 'street', garyPose(t)); put(neighbor, 'street', neighborPose(t));
        hero.gary.setRows(((t - 10.5) / 0.8 + 1)); stick(hero.gary, gary, 1, 1, 0.38);
        stick(hero.neighbor, neighbor);
        for (let i = 0; i < 4; i++) { put(extras[i], 'street', bgWalker(t, extras[i], i, 0.5, 6.5, -2.65, 10)); stick(crowdB[i], extras[i]); }
      } else if (shot.cam === 'date') {
        put(him, 'street', himPose(t)); put(her, 'street', herPose(t));
        stick(hero.him, him); stick(hero.her, her);
      } else if (shot.cam === 'hosp') {
        put(doctor, 'street', doctorPose(t)); put(patient, 'street', patientPose(t));
        hero.doctor.setRows(((t - 38.2) / 0.9 + 1)); stick(hero.doctor, doctor, 1, 1, 0.38);
        stick(hero.patient, patient);
      } else if (shot.cam === 'end') {
        extras.forEach((e, i) => { const p = endCrowd(t, e, i); put(e, 'street', p); stick(crowdB[i], e, 1, 1, LIFTS[i % 3]); });
        put(gary, 'street', endPair(t, 'g')); put(linda, 'street', endPair(t, 'l'));
        stick(hero.garyEnd, gary); stick(hero.linda, linda);
      }
    } else if (S === 'cls') {
      kids.forEach((k, i) => { put(k, 'cls', kidPose(t, i), KS); stick(kidB[i], k, boing(t, 20.2 + (i % 6) * 0.05 + Math.floor(i / 6) * 0.12), 1, 0.36 * KS); });
      put(teacher, 'cls', teacherPose(t));
      hero.teacher.setRows(((t - 17.6) / 0.9 + 1)); stick(hero.teacher, teacher);
    } else if (S === 'war') {
      leaders.forEach((L, i) => { put(L, 'war', leaderPose(t, i)); stick(hero.leaders[i], L, 1, 1, [0.8, 0.8, 0.8, 0.36, 0.36, 0.36][i]); }); // neighbours' cards alternate low/high
      if (war.setGlobeLight) war.setGlobeLight(1);
      war.globe.spin.rotation.y = t * 0.15;
    } else if (S === 'border') {
      put(spy, 'border', spyPose(t)); put(guard, 'border', guardPose(t));
      hero.spy.setRows(((t - 43.3) / 0.8 + 1)); stick(hero.spy, spy, 1, 1, 0.38);
      stick(hero.guard, guard);
    } else if (S === 'bed') {
      bed.setSeason('autumn', t); bed.lights.moon.intensity = 1.0;
      put(gran, 'bed', granPose(t));
      hero.gran.setRows(t < 50.0 ? 0 : t < 51.2 ? 1 : t < 52.9 ? 2 : 3); stick(hero.gran, gran, 1, 1, 0.38);
    }

    // camera (local → world)
    const c = CAMS[shot.cam], u = clamp((t - shot.t0) / (shot.t1 - shot.t0));
    const e = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
    const o = OFF[S];
    const P = c.p[0].map((v, i) => lerp(v, c.p[1][i], e) + o[i]);
    const Aim = c.a[0].map((v, i) => lerp(v, c.a[1][i], e) + o[i]);
    setCamera(P, Aim, c.fov, t, c.amp);
  }
  return { update };
}
