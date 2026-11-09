// 2D illustrated characters as living puppets (054 goth cheat-tutor; art from tools/anime/gen.py → cut.py).
// One cut-out PNG on a subdivided plane in the 3-D scene + a vertex shader that breathes the chest, sways the hair, tilts/bobs the
// head around the neck and leans the body (feet planted), and instant face swaps (blink / talk frames made by inpainting ONLY the
// face, so a swap never changes anything else). The whole frame then goes through engine/pixel.js like any other mesh.
//   const P = await makePuppet({ base: '/videos/054-x/art/hero.png', faces: { blink: '…-blink.png', talk: '…-talk.png' },
//     height: 1.8,                       // metres the IMAGE spans (feet at the bottom edge for full-body art)
//     rig: { neck: [u, v], head: [cu, cv, ru, rv], chest: [cu, cv, ru, rv], hair: [[cu, cv, ru, rv], …], hairTop: v } });  (uv: 0..1, v up)
//   scene.add(P.root);  P.update(t, { camera, talk: 0..1, face: 'blink'|null, headA, bob, sway, hair, breath, flip })
import * as THREE from 'three';

const VERT = /* glsl */`
uniform float uT, uBreath, uHeadA, uBob, uSway, uHair, uHairTop, uAsp;
uniform vec2 uNeck; uniform vec4 uHead, uChest, uH0, uH1, uH2, uH3;
uniform vec2 uSize;
varying vec2 vUv;
float ell(vec2 p, vec4 e) { if (e.z <= 0.0) return 0.0; vec2 d = (p - e.xy) / e.zw; return 1.0 - smoothstep(0.55, 1.0, length(d)); }
void main() {
  vec2 p = uv, q = uv;
  // breathing: the chest swells a little around its centre (more up than out)
  float wc = ell(p, uChest); q += (p - uChest.xy) * uBreath * wc * vec2(0.012, 0.022) + vec2(0.0, uBreath * wc * 0.004);
  // head: rotate around the neck pivot (aspect-correct) + bob, weighted by the head ellipse (hair near the head comes along)
  float wh = ell(p, uHead);
  vec2 d = (q - uNeck) * vec2(uAsp, 1.0); float a = uHeadA * wh; d = mat2(cos(a), sin(a), -sin(a), cos(a)) * d;
  q = uNeck + d / vec2(uAsp, 1.0) + vec2(0.0, uBob * wh);
  // hair: lazy sway that grows below the hair line (tips move most), a travelling wave so it reads as strands not a slab
  float hw = max(max(ell(p, uH0), ell(p, uH1)), max(ell(p, uH2), ell(p, uH3)));
  float k = clamp((uHairTop - p.y) / 0.25, 0.0, 1.0);
  q.x += uHair * hw * k * (sin(uT * 1.9 + p.y * 9.0) * 0.7 + sin(uT * 3.1 + p.y * 17.0 + p.x * 6.0) * 0.3) / uAsp;
  // body lean (feet planted at v = 0)
  q.x += uSway * p.y * p.y / uAsp;
  vUv = uv;
  vec3 pos = vec3((q.x - 0.5) * uSize.x, q.y * uSize.y, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;
const FRAG = /* glsl */`
uniform sampler2D uMap; uniform vec3 uTint; uniform float uOpacity, uFlip;
varying vec2 vUv;
void main() {
  vec2 uv = vUv; if (uFlip > 0.5) uv.x = 1.0 - uv.x;
  vec4 c = texture2D(uMap, uv);
  if (c.a < 0.03) discard;
  gl_FragColor = vec4(c.rgb * uTint, c.a * uOpacity);
}`;

const loader = new THREE.TextureLoader();
const load = (u) => loader.loadAsync(u).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; });

export async function makePuppet({ base, faces = {}, height = 1.8, rig = {}, segs = [40, 64] }) {
  const tex = await load(base), F = { base: tex };
  for (const [k, u] of Object.entries(faces)) F[k] = await load(u);
  const asp = tex.image.width / tex.image.height, W = height * asp;
  const e4 = (e) => new THREE.Vector4(...(e || [0, 0, 0, 0]));
  const hair = rig.hair || [];
  const U = {
    uMap: { value: tex }, uT: { value: 0 }, uBreath: { value: 0 }, uHeadA: { value: 0 }, uBob: { value: 0 }, uSway: { value: 0 }, uHair: { value: 0 },
    uHairTop: { value: rig.hairTop ?? 0.8 }, uAsp: { value: asp }, uSize: { value: new THREE.Vector2(W, height) },
    uNeck: { value: new THREE.Vector2(...(rig.neck || [0.5, 0.75])) }, uHead: { value: e4(rig.head) }, uChest: { value: e4(rig.chest) },
    uH0: { value: e4(hair[0]) }, uH1: { value: e4(hair[1]) }, uH2: { value: e4(hair[2]) }, uH3: { value: e4(hair[3]) },
    uTint: { value: new THREE.Color(1, 1, 1) }, uOpacity: { value: 1 }, uFlip: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true, side: THREE.DoubleSide, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, segs[0], segs[1]), mat);
  mesh.frustumCulled = false; mesh.renderOrder = 2;
  const root = new THREE.Group(); root.add(mesh);
  // contact shadow under the feet (a soft dark ellipse on the ground)
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const g = sc.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.55, W * 0.22), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.004; root.add(shadow);
  shadow.visible = rig.shadow !== false;

  const tmp = new THREE.Vector3();
  /** per frame: t, camera (billboard yaw), talk 0..1 (mouth frame), face (force a frame), blink (auto every ~3.4 s), motion params */
  function update(t, o = {}) {
    U.uT.value = t;
    U.uBreath.value = o.breath ?? Math.sin(t * 1.6) * 0.5 + 0.5;
    U.uHeadA.value = (o.headA ?? 0) + Math.sin(t * 0.9) * 0.012 * (o.idle ?? 1);
    U.uBob.value = (o.bob ?? 0) + Math.sin(t * 1.6 + 0.6) * 0.0018 * (o.idle ?? 1);
    U.uSway.value = (o.sway ?? 0) + Math.sin(t * 0.7) * 0.004 * (o.idle ?? 1);
    U.uHair.value = (o.hair ?? 1) * 0.006;
    U.uFlip.value = o.flip ? 1 : 0;
    if (o.tint) U.uTint.value.set(o.tint);
    U.uOpacity.value = o.opacity ?? 1;
    const blink = o.blink ?? (((t + 0.7) % 3.4) < 0.12);
    // faces: rest (closed mouth; else the base art) → talk (mid) → open (wide) by the mouth level; blink wins; o.face forces one
    const m = o.talk ?? 0;
    let key = F.rest ? 'rest' : 'base';
    if (m > 0.66 && F.open) key = 'open'; else if (m > 0.3) key = F.talk ? 'talk' : 'base';
    if (blink && F.blink) key = 'blink';
    if (o.face) key = o.face;
    U.uMap.value = F[key] || tex;
    if (o.camera) { root.getWorldPosition(tmp); mesh.rotation.y = Math.atan2(o.camera.position.x - tmp.x, o.camera.position.z - tmp.z) - root.rotation.y; }
  }
  mesh.scale.set(1, 1, 1);
  update(0);
  return { root, mesh, update, U, F, W, H: height };
}

/** a mouth envelope from words.json-style timing ([{t0, t1}] seconds): open-close flaps at ~8 Hz while a word is spoken */
export function talkAt(t, words) {
  for (const w of words) if (t >= w.t0 && t <= w.t1) return 0.5 + 0.5 * Math.sin((t - w.t0) * 2 * Math.PI * 7.5);
  return 0;
}
