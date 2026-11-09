// MOTION-GRAPHICS TEMPLATE — a 10.5 s scaffold in the Kurzgesagt-like flat vector explainer look (docs/STYLES.md → mg; proof
// reel: 061). Everything is drawn with Canvas 2D by engine/mg (the WebGL studio idles): soft-gradient shapes with long subtle
// shadows on a deep-blue backdrop, round-headed people, a globe of people-dots, charts that build themselves, kinetic labels,
// parallax cameras and zoom/iris/wipe transitions. The text layer is the whatif overlay (title → HUD → subtitles) restyled by
// engine/mg/overlay.js with kinetic words; the end card is the Scribe card drawn on the canvas.
//   npm run new -- NNN-slug --from _mg-template   →  edit story.json (title, hud, subs, end.in) + SHOTS below  →  stills  →  audio
//   node tools/render.mjs NNN-slug --stills 1,3,5,7 && node tools/sheet.mjs NNN-slug       node tools/render.mjs NNN-slug --qc
import { E, tw, env, seqv, clamp, lerp, roll } from '@engine/mg/ease.js';
import { createMG, PAL } from '@engine/mg/stage.js';
import { circle, rrect, ring, line } from '@engine/mg/draw.js';
import { makeFolk, makeCrowd, drawCrowd, clapArms, clapCycle } from '@engine/mg/people.js';
import { makeWorld } from '@engine/mg/geo.js';
import { bars } from '@engine/mg/charts.js';
import { label, ktext } from '@engine/mg/type.js';
import { soundRings, burst } from '@engine/mg/fx.js';
import { drawHandsPOV } from '@engine/mg/people.js';
import { space, beach, beachFG } from '@engine/mg/scenes.js';
import { gascan } from '@engine/mg/icons.js';
import { mgOverlay } from '@engine/mg/overlay.js';
import { drawEndCard } from '@engine/mg/endcard.js';
import { loadImg } from '@engine/build/scribe.js';

export async function build(studio, story) {
  const M = await createMG(studio);
  const TXT = mgOverlay(story);
  const icon = await loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const W = makeWorld();
  const crowd = makeCrowd(11, 46, { x0: -620, x1: 620, y0: 520, y1: 130, s0: 1.25, s1: 0.5 });
  const CLAP = 4.4, END = story.end.in;
  M.hits = [[CLAP, 26, 0.45]];

  const SHOTS = [
    { t0: 0, id: 'globe', draw: (g, t) => {
      const cam = { x: 0, y: lerp(40, -20, tw(t, 0, 4.4)), z: lerp(0.92, 1.12, tw(t, 0, 4.4, E.io2)) };
      space(M, g, t, cam);
      M.view(g, cam, 1, (gg) => {
        // dots light in a wave from the viewer's side (k = time since 2.6 s), the camera keeps pushing in
        const v = W.globe(gg, 0, 0, 360, { lon0: -100 + t * 6, lat0: 22, dots: 0.35 + 0.65 * tw(t, 2.6, 1.2), dotFn: (d, i, p) => clamp((t - 2.6) * 2.2 - (1 - p[2]) * 2 + 0.3) });
        if (t > 2.6) label(gg, '8.3 BILLION PEOPLE', 120, 470, { k: tw(t, 2.9, 0.5, E.lin), size: 40 });   // labels: below the globe, never in the HUD box (x < 600, y 430–690)
      });
    } },
    { t0: 3.8, id: 'beach', tr: { kind: 'zoom', dur: 0.5, x: 540, y: 900 }, draw: (g, t) => {
      const cam = { x: lerp(-30, 40, tw(t, 3.8, 2.4)), y: 160, z: lerp(1.05, 1.12, tw(t, 3.8, 2.4)) };
      beach(M, g, t, cam);
      M.view(g, cam, 1, (gg) => {
        const heads = drawCrowd(gg, crowd, t, (c) => ({ arms: clapArms(t < CLAP ? E.io2(tw(t, CLAP - 0.35 - c.d * 0.05, 0.35)) : 1 - E.io2(tw(t, CLAP + 0.15, 0.6)) * 0.7), eyes: t > CLAP && t < CLAP + 0.5 ? 'happy' : 'open', mouth: t > CLAP ? 'grin' : 'smile', look: [0, -0.3] }));
        for (const h of heads.slice(-3)) M.markS(...h.head, 'front-row face');   // the --qc check: hero faces vs the subtitle band
        soundRings(gg, 0, 330, t - CLAP, { n: 5, speed: 1100, max: 1500, w: 12 });
        burst(gg, 0, 330, t - CLAP, { r: 200 });
      });
      beachFG(M, g, t, cam);
      drawHandsPOV(g, t < CLAP ? E.in2(tw(t, CLAP - 0.25, 0.25, E.lin)) : 1 - 0.5 * E.out3(tw(t, CLAP + 0.1, 0.4, E.lin)), { y: 1920 + 600 * (1 - E.out3(tw(t, 3.8, 0.5))), rise: 470 });   // the viewer's own hands (POV)
      M.flash(g, 0.35 * (1 - tw(t, CLAP, 0.25, E.lin)) * (t >= CLAP ? 1 : 0));
    } },
    { t0: 5.4, id: 'chart', tr: { kind: 'wipe', dur: 0.45 }, draw: (g, t) => {
      const cam = { x: 0, y: 0, z: lerp(1, 1.05, tw(t, 5.4, 1.2)) };
      space(M, g, t, cam, { planets: false });
      M.view(g, cam, 1, (gg) => {
        ktext(gg, 'WHERE THE ENERGY GOES', 40, -250, { size: 58, k: tw(t, 5.5, 0.6, E.lin) });
        bars(gg, -330, 210, 660, 330, [{ v: 99.9, label: 'HANDS (HEAT)', color: PAL.orange }, { v: 0.1, label: 'SOUND', color: PAL.teal }], { k: tw(t, 5.6, 0.9, E.lin), valueFmt: (v) => v.toFixed(1) + '%', labelSize: 26 });   // keep axis labels above the subtitle band (y < 1270)
        gascan(gg, 380, 205, 0.7, 1, { shadow: 90 });
      });
    } },
    { t0: END, id: 'end', tr: { kind: 'fade', dur: 0.3 }, draw: (g, t) => drawEndCard(M, g, icon, t - END, { t }) },
  ];

  function update(t) { M.render(t, SHOTS); TXT.update(t); }
  window.EDSTUDIO_QC = () => M.qc(update, story);
  return { update };
}
