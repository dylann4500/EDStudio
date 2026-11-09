// Motion-graphics geography on Canvas 2D: a Kurzgesagt-style Earth (orthographic globe: ocean gradient, flat land, soft terminator,
// atmosphere glow, people-dots) and flat maps, from the Natural Earth 1:110m outlines baked in engine/data/world110.js (no network).
//   const W = makeWorld();  W.globe(g, x, y, r, { lon0, lat0, dots: 0..1, dotFn(d, i) → brightness, land, ocean, night: 0..1 })
//   W.project(lat, lon, view) → [x, y, z]  (z < 0 = far side)          W.map(g, view, { codes: ['USA', …], fill, others })
//   W.mapView({ lon0, lat0, scale, cx, cy }) → view for flat maps (equirectangular, cos(lat0) aspect)   W.mapXY(view, lat, lon)
//   gcPts(a, b, n) = great-circle points between [lat, lon] pairs;  CITIES = [{name, lat, lon, pop (millions)}]
import { COUNTRIES } from '../data/world110.js';
import { clamp, lerp, shade, alpha as rgba, rng } from './ease.js';
import { glow, TAU } from './draw.js';

const D = Math.PI / 180;
export const CITIES = [
  ['Tokyo', 35.7, 139.7, 37], ['Delhi', 28.6, 77.2, 33], ['Shanghai', 31.2, 121.5, 29], ['Dhaka', 23.8, 90.4, 23], ['São Paulo', -23.5, -46.6, 22],
  ['Cairo', 30.0, 31.2, 22], ['Mexico City', 19.4, -99.1, 22], ['Beijing', 39.9, 116.4, 21], ['Mumbai', 19.1, 72.9, 21], ['Osaka', 34.7, 135.5, 19],
  ['Chongqing', 29.6, 106.5, 17], ['Karachi', 24.9, 67.0, 17], ['Kinshasa', -4.3, 15.3, 17], ['Lagos', 6.5, 3.4, 16], ['Istanbul', 41.0, 29.0, 16],
  ['Buenos Aires', -34.6, -58.4, 15], ['Kolkata', 22.6, 88.4, 15], ['Manila', 14.6, 121.0, 15], ['Guangzhou', 23.1, 113.3, 14], ['Tianjin', 39.1, 117.2, 14],
  ['Lahore', 31.5, 74.3, 14], ['Bangalore', 13.0, 77.6, 14], ['Rio de Janeiro', -22.9, -43.2, 14], ['Moscow', 55.8, 37.6, 13], ['Shenzhen', 22.5, 114.1, 13],
  ['Chennai', 13.1, 80.3, 12], ['Bogotá', 4.7, -74.1, 11], ['Jakarta', -6.2, 106.8, 11], ['Lima', -12.0, -77.0, 11], ['Paris', 48.9, 2.35, 11],
  ['Bangkok', 13.8, 100.5, 11], ['Hyderabad', 17.4, 78.5, 11], ['Seoul', 37.6, 127.0, 10], ['Nagoya', 35.2, 136.9, 9.5], ['London', 51.5, -0.13, 9.6],
  ['Chicago', 41.9, -87.6, 9], ['New York', 40.7, -74.0, 19], ['Los Angeles', 34.05, -118.25, 12.5], ['Tehran', 35.7, 51.4, 9.5], ['Ho Chi Minh City', 10.8, 106.7, 9.3],
  ['Luanda', -8.8, 13.2, 9], ['Kuala Lumpur', 3.1, 101.7, 8.6], ['Hong Kong', 22.3, 114.2, 7.6], ['Baghdad', 33.3, 44.4, 7.7], ['Riyadh', 24.7, 46.7, 7.7],
  ['Santiago', -33.4, -70.6, 6.9], ['Madrid', 40.4, -3.7, 6.8], ['Toronto', 43.7, -79.4, 6.4], ['Dallas', 32.8, -96.8, 6.6], ['Houston', 29.8, -95.4, 6.4],
  ['Miami', 25.8, -80.2, 6.2], ['Nairobi', -1.3, 36.8, 5.3], ['Johannesburg', -26.2, 28.0, 6.2], ['Addis Ababa', 9.0, 38.7, 5.5], ['Sydney', -33.9, 151.2, 5.3],
  ['Berlin', 52.5, 13.4, 3.6], ['Rome', 41.9, 12.5, 4.3], ['Atlanta', 33.7, -84.4, 5.0], ['Philadelphia', 40.0, -75.2, 5.8], ['Washington', 38.9, -77.0, 5.0],
].map(([name, lat, lon, pop]) => ({ name, lat, lon, pop }));

/** great-circle points from a=[lat,lon] to b=[lat,lon] (slerp), n segments */
export function gcPts(a, b, n = 64) {
  const v = ([la, lo]) => [Math.cos(la * D) * Math.cos(lo * D), Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D)];
  const A = v(a), B = v(b), om = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1)), out = [];
  for (let i = 0; i <= n; i++) { const u = i / n, s0 = Math.sin((1 - u) * om) / Math.sin(om), s1 = Math.sin(u * om) / Math.sin(om);
    const x = s0 * A[0] + s1 * B[0], y = s0 * A[1] + s1 * B[1], z = s0 * A[2] + s1 * B[2]; out.push([Math.atan2(z, Math.hypot(x, y)) / D, Math.atan2(y, x) / D]); }
  return out;
}
/** great-circle distance in km */
export const gcKm = (a, b) => { const [la1, lo1] = a.map((x) => x * D), [la2, lo2] = b.map((x) => x * D); return 6371 * 2 * Math.asin(Math.sqrt(Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2)); };

export function makeWorld({ dotStep = 1.6, seed = 7 } = {}) {
  // rings in degrees: [{code, pts: [[lat, lon], …], bb: [lat0, lon0, lat1, lon1]}]
  const rings = [];
  for (const [code, rs] of Object.entries(COUNTRIES)) for (const r of rs) {
    const pts = []; let la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
    for (let i = 0; i < r.length; i += 2) { const lon = r[i] / 10, lat = r[i + 1] / 10; pts.push([lat, lon]); la0 = Math.min(la0, lat); la1 = Math.max(la1, lat); lo0 = Math.min(lo0, lon); lo1 = Math.max(lo1, lon); }
    rings.push({ code, pts, bb: [la0, lo0, la1, lo1] });
  }
  const inside = (lat, lon) => {
    for (const R of rings) { const [a0, o0, a1, o1] = R.bb; if (lat < a0 || lat > a1 || lon < o0 || lon > o1) continue;
      let c = false; const P = R.pts; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [yi, xi] = P[i], [yj, xj] = P[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c; }
      if (c) return R.code; }
    return null;
  };
  // people-dots: a land grid + extra dots clustered on the big cities (brighter)
  const R = rng(seed), dots = [];
  for (let lat = -56; lat <= 72; lat += dotStep) for (let lon = -180; lon < 180; lon += dotStep / Math.max(0.35, Math.cos(lat * D))) {
    const la = lat + (R() - 0.5) * dotStep * 0.6, lo = lon + (R() - 0.5) * dotStep * 0.6; if (inside(la, lo)) dots.push({ lat: la, lon: lo, w: 0.25 + R() * 0.25 });
  }
  for (const c of CITIES) { const n = Math.round(6 + c.pop * 1.4); for (let i = 0; i < n; i++) { const rr = Math.sqrt(-2 * Math.log(1 - R() * 0.999)) * (0.5 + c.pop * 0.04), a = R() * TAU; dots.push({ lat: c.lat + Math.sin(a) * rr, lon: c.lon + Math.cos(a) * rr / Math.cos(c.lat * D), w: 0.75 + R() * 0.25 }); } }

  const W = { rings, dots, inside };
  /** orthographic projection for a view {lat0, lon0}: unit-sphere coords [x (right), y (up), z (toward the viewer)] */
  W.project = (lat, lon, v) => {
    const la = lat * D, dl = (lon - v.lon0) * D, l0 = v.lat0 * D, cl = Math.cos(la);
    return [cl * Math.sin(dl), Math.cos(l0) * Math.sin(la) - Math.sin(l0) * cl * Math.cos(dl), Math.sin(l0) * Math.sin(la) + Math.cos(l0) * cl * Math.cos(dl)];
  };
  // a dot sprite (soft round light), rendered once per colour
  const SPR = {};
  const sprite = (col) => { if (SPR[col]) return SPR[col]; const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, col); gr.addColorStop(1, rgba(col, 0)); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return (SPR[col] = c); };

  /** draw the globe at (x, y) radius r. o: {lon0, lat0, ocean, land, rim, dots (0..1 global brightness), dotFn(d, i, [px,py,z]) → 0..1, dotColor, dotSize, shade, highlight: {code: color}} */
  W.globe = (g, x, y, r, o = {}) => {
    const v = { lat0: o.lat0 ?? 20, lon0: o.lon0 ?? 0 };
    // atmosphere
    glow(g, x, y, r * 1.28, o.atmo ?? '#4aa3ff', 0.45, false);
    // ocean
    const og = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); og.addColorStop(0, shade(o.ocean ?? '#2f7fe0', 0.18)); og.addColorStop(1, shade(o.ocean ?? '#2f7fe0', -0.38));
    g.save(); g.fillStyle = og; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
    // land
    const land = o.land ?? '#3ccf86', hl = o.highlight ?? {};
    const paths = {};
    for (const Rg of rings) {
      const P = Rg.pts; let vis = false; const S = [];
      for (const [lat, lon] of P) { let [px, py, pz] = W.project(lat, lon, v); if (pz < 0) { const L = Math.hypot(px, py) || 1; px /= L; py /= L; } else vis = true; S.push([x + px * r, y - py * r]); }
      if (!vis) continue;
      const col = hl[Rg.code] ?? land; (paths[col] = paths[col] || []).push(S);
    }
    for (const [col, list] of Object.entries(paths)) {
      const lg = g.createLinearGradient(x - r, y - r, x + r, y + r); lg.addColorStop(0, shade(col, 0.12)); lg.addColorStop(1, shade(col, -0.22)); g.fillStyle = lg;
      g.beginPath(); for (const S of list) { g.moveTo(S[0][0], S[0][1]); for (let i = 1; i < S.length; i++) g.lineTo(S[i][0], S[i][1]); g.closePath(); } g.fill();
    }
    // terminator / soft shading (light from the top-left)
    const sg = g.createRadialGradient(x - r * 0.45, y - r * 0.5, r * 0.2, x - r * 0.1, y - r * 0.1, r * 1.35); sg.addColorStop(0, 'rgba(255,255,255,0.10)'); sg.addColorStop(0.55, 'rgba(8,16,48,0)'); sg.addColorStop(1, `rgba(8,16,48,${0.55 + 0.35 * (o.night ?? 0)})`);
    g.fillStyle = sg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    if (o.night) { g.fillStyle = `rgba(6,12,40,${0.55 * o.night})`; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    // people-dots
    const dk = o.dots ?? 0;
    if (dk > 0) {
      const spr = sprite(o.dotColor ?? '#ffe08a'), ds = (o.dotSize ?? 1) * Math.max(3, r * 0.022);
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < dots.length; i++) { const d = dots[i], p = W.project(d.lat, d.lon, v); if (p[2] < 0.05) continue;
        const b = dk * d.w * (o.dotFn ? o.dotFn(d, i, p) : 1) * clamp(p[2] * 3); if (b <= 0.01) continue;
        const sz = ds * (0.6 + 0.8 * b) * (0.55 + 0.45 * p[2]); g.globalAlpha = clamp(b); g.drawImage(spr, x + p[0] * r - sz, y - p[1] * r - sz, sz * 2, sz * 2); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    g.restore();
    // rim light
    g.save(); g.strokeStyle = rgba('#bfe6ff', 0.35); g.lineWidth = r * 0.025; g.beginPath(); g.arc(x, y, r * 0.99, Math.PI * 1.05, Math.PI * 1.65); g.stroke(); g.restore();
    return v;
  };
  /** screen point of (lat, lon) on a globe drawn at (x, y, r, view) → [sx, sy, z] */
  W.globeXY = (lat, lon, x, y, r, v) => { const p = W.project(lat, lon, v); return [x + p[0] * r, y - p[1] * r, p[2]]; };

  W.mapView = ({ lon0 = 0, lat0 = 0, scale = 10, cx = 540, cy = 960 } = {}) => ({ lon0, lat0, scale, cx, cy, k: Math.cos(lat0 * D) });
  W.mapXY = (v, lat, lon) => [v.cx + (lon - v.lon0) * v.k * v.scale, v.cy - (lat - v.lat0) * v.scale];
  /** flat map: every country (or `codes`), fill per code; o: {fill, others, border, codes, shadow} */
  W.map = (g, v, o = {}) => {
    const fill = o.fill ?? {}, base = o.others ?? '#2f5a8f', lists = {};
    for (const Rg of rings) {
      if (o.codes && !o.codes.includes(Rg.code)) continue;
      const S = Rg.pts.map(([la, lo]) => W.mapXY(v, la, lo));
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [a, b] of S) { x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); }
      if (x1 < -200 || x0 > 1280 || y1 < -200 || y0 > 2120) continue;
      const col = fill[Rg.code] ?? base; (lists[col] = lists[col] || []).push(S);
    }
    for (const [col, list] of Object.entries(lists)) {
      if (o.shadow) { g.save(); g.fillStyle = 'rgba(4,10,30,.28)'; g.translate(o.shadow, o.shadow); g.beginPath(); for (const S of list) { g.moveTo(S[0][0], S[0][1]); for (const p of S) g.lineTo(p[0], p[1]); g.closePath(); } g.fill(); g.restore(); }
      const lg = g.createLinearGradient(0, 0, 1080, 1920); lg.addColorStop(0, shade(col, 0.12)); lg.addColorStop(1, shade(col, -0.18)); g.fillStyle = lg;
      g.beginPath(); for (const S of list) { g.moveTo(S[0][0], S[0][1]); for (const p of S) g.lineTo(p[0], p[1]); g.closePath(); } g.fill();
      if (o.border) { g.save(); g.strokeStyle = o.border; g.lineWidth = o.borderW ?? 2; g.lineJoin = 'round'; g.stroke(); g.restore(); }
    }
  };
  return W;
}
