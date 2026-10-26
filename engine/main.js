// Boots one video: /engine/index.html?video=<folder under videos/>.
// The video folder supplies story.json (text + HUD timeline) and shots.js (3D scene + animation).
// Exposes window.renderAt(t) and window.EDSTUDIO_READY for tools/render.mjs.
import { createStudio, createOverlay } from '@engine/core.js';
import { createBuildOverlay, BUILD_FONTS } from '@engine/build/captions.js';

const slug = new URLSearchParams(location.search).get('video');
const base = `/videos/${slug}/`;

try {
  const story = await (await fetch(base + 'story.json')).json();
  const studio = createStudio(document.getElementById('gl'), story.look || {});
  // build genre (docs/BUILD.md): word-by-word center captions + callouts instead of title/HUD/subtitles
  const overlay = story.mode === 'build' ? createBuildOverlay(story) : createOverlay(story);
  const mod = await import(base + 'shots.js');
  const video = await mod.build(studio, story);

  await Promise.all([
    document.fonts.load('300 74px Newsreader'), document.fonts.load('italic 400 44px Newsreader'),
    document.fonts.load('600 20px Inter'), document.fonts.load('500 18px Inter'),
    ...(story.mode === 'build' ? BUILD_FONTS.map((f) => document.fonts.load(f)) : []),
  ]);
  await document.fonts.ready;

  window.STORY = story;
  // Debug cameras (tools/render.mjs --cam top|front): bird's-eye or straight-on views to check blocking + light.
  const dbg = new URLSearchParams(location.search).get('cam');
  if (dbg) { // hide ceilings + text so you can see the floor plan
    document.getElementById('ui').style.display = 'none';
    // ceilings go to layer 1: invisible to this camera but still casting shadows (so the lighting stays true)
    const v = new studio.THREE.Vector3();
    studio.scene.traverse((o) => { if (o.isMesh && o.getWorldPosition(v).y > 2.65) o.layers.set(1); if (o.isLight && o.shadow) o.shadow.camera.layers.enable(1); });
  }
  const debugCam = () => {
    const c = studio.camera, view = story.debugView || { center: [0, 0, 0], height: 7 };
    if (dbg === 'top') { c.position.set(view.center[0], view.height, view.center[2] + 0.001); c.fov = 60; c.updateProjectionMatrix(); c.lookAt(view.center[0], 0, view.center[2]); }
    if (dbg === 'front') { c.position.set(view.center[0], 1.6, view.center[2] + view.height); c.fov = 60; c.updateProjectionMatrix(); c.lookAt(view.center[0], 1.0, view.center[2]); }
  };
  window.renderAt = (t) => { accum.style.display = 'none'; video.update(t); if (dbg) debugCam(); overlay.update(t); studio.render(t); };
  // Motion blur (build genre: the reference's Blender renders are motion-blurred, so moves read smooth): render `n` sub-frames
  // spread over the shutter (fraction of the frame interval, 0.5 = 180°) and average them on a 2-D canvas laid over the WebGL
  // one. The text overlay is drawn once at the frame's own time, so captions stay crisp.
  const gl = document.getElementById('gl');
  const accum = document.createElement('canvas'); accum.width = gl.width; accum.height = gl.height;
  Object.assign(accum.style, { position: 'absolute', left: '0', top: '0', width: '1080px', height: '1920px', display: 'none' });
  gl.after(accum); const actx = accum.getContext('2d');
  window.renderAtBlur = (t, n = 2, shutter = 0.5, fps = 30) => {
    if (n <= 1) return window.renderAt(t);
    for (let k = 0; k < n; k++) {
      const tk = Math.max(0, t + ((k + 0.5) / n - 0.5) * shutter / fps);
      video.update(tk); studio.render(tk);
      actx.globalAlpha = 1 / (k + 1); actx.drawImage(gl, 0, 0);   // running mean of the sub-frames
    }
    actx.globalAlpha = 1; accum.style.display = 'block';
    video.update(t); overlay.update(t);
  };
  window.renderAt(0);
  window.EDSTUDIO_READY = true;
} catch (err) {
  console.error(err);
  window.EDSTUDIO_ERROR = String(err && err.stack || err);
}
