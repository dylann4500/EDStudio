// Subject packs for the Scribe kit (Nov 9): ready worksheets for chemistry, biology, physics and economics homework (and 049's
// calculus set as `math`), each written glyph by glyph in Scribe's real hand (scribe.js) WITH its hand-drawn figure, so a promo
// can show the subject's money shot: the pen drawing a Lewis structure, a Punnett square, a free-body diagram, a market shift.
//   import { subjectSheet, SUBJECTS, SUBJECT_KEYS } from '@engine/build/subjects.js';
//   const sheet = subjectSheet(G, 'chemistry', { name: 'Max' });   // = makeSheet(G, {...pack.sheet, subject: pack, ...over})
//   sheet.draw(p)  (p = 0 → sheet.total, as for any sheet)  ·  makeScreen(G, icon, sheet)  → the app shows "CHEMISTRY · PROBLEM SET 4"
//   FIG.punnett / FIG.ice / FIG.lewis / FIG.fbdRamp / FIG.fbdDot / FIG.market / FIG.payoff / FIG.foodChain / FIG.animalCell:
//   the figure builders, for a sheet of your own (pass P.fig = (c) => FIG.x(c.k, …) in a `rich: true` makeSheet).
//
// What Scribe really draws (the Scribe repo, ~/Documents/GitHub/math hw grift, README.md — keep packs inside it):
//   §Chemistry  "Lewis structures (@lewis)… pairs of dots on four sides", "ICE and BCA tables (@ice)", "subscripts and charges are the
//               writer's own digits and signs made small and lowered", "⇌ as two single-barbed harpoons", molar mass is a strong sign.
//   §Biology    "Punnett squares (@punnett)… the gametes outside the grid… the true ratios and probabilities under it", ratios with
//               spaced colons (3 purple : 1 white), "Flowcharts, food webs… (@foodchain)… joined by freehand bowed arrows",
//               "Cell diagrams (@organelles). An animal, plant or bacterial cell" (no chloroplast in an animal cell).
//   §Physics    "draws a free-body diagram for every ΣF or Στ it solves" (a dot, a box…; inclines), "starts each part from its
//               principle… carries units on every number", figures "the way a student draws on an iPad… lines that bow once and land
//               a little off their mark, open arrowheads that never repeat exactly"; a narrow figure "has the working written beside it".
//   §Economics  "@econ… markets with shifts… each equilibrium is dotted and dropped to named values on the axes (P* for one state,
//               P₁ and P₂ for several)", "@payoff… Each best response is underlined under its own number, and each pure Nash
//               equilibrium is circled with a hurried loop", explanations written as short paragraphs.
// The numbers are computed here from the problem (the cross, m/θ/μ, the curves, the payoffs), so a pack can't disagree with itself.
import { makeSheet } from './scribe.js';

const D2R = Math.PI / 180;
const trim = (x, n = 3) => String(Number(x.toPrecision(n)));   // 3 s.f., no trailing zeros: 49, 42.4, 8.49, 24.5
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const FIG = {
  /** A one-gene Punnett square (Aa × Aa, Bb × bb…) at grid top-left (x, y): gametes outside, genotypes in the cells, the ratios
   *  worked out from the cross and written at `ratioAt`. o: {cell, dom: 'black', rec: 'white', u} */
  punnett(k, x, y, p1, p2, o = {}) {
    const s = o.cell ?? 100, u = o.u ?? 30, out = [], g1 = [p1[0], p1[1]], g2 = [p2[0], p2[1]];
    const geno = (a, b) => (a === a.toUpperCase() && b !== b.toUpperCase() ? a + b : b === b.toUpperCase() && a !== a.toUpperCase() ? b + a : [a, b].sort().join(''));
    if (o.cross !== false) out.push(...k.text(`${p1} × ${p2}`, x + s, y - 84, { u: u * 1.05, align: 'center' }));
    g2.forEach((a, c) => out.push(...k.text(a, x + s * (c + 0.5), y - 14, { u, align: 'center' })));
    g1.forEach((a, r) => out.push(...k.text(a, x - 28, y + s * (r + 0.5), { u, align: 'center', valign: 'middle' })));
    out.push(...k.grid(x, y, [s, s], [s, s]));
    const counts = {};
    g1.forEach((a, r) => g2.forEach((b, c) => { const gt = geno(a, b); counts[gt] = (counts[gt] ?? 0) + 1; out.push(...k.text(gt, x + s * (c + 0.5), y + s * (r + 0.5), { u, align: 'center', valign: 'middle' })); }));
    const keys = Object.keys(counts).sort((a, b) => (b.replace(/[a-z]/g, '').length - a.replace(/[a-z]/g, '').length));   // AA, Aa, aa
    const gd = keys.reduce((g, kk) => gcd(g, counts[kk]), 0);
    const dom = keys.filter((kk) => /[A-Z]/.test(kk)).reduce((n, kk) => n + counts[kk], 0), rec = 4 - dom, pd = gcd(dom, rec) || 1;
    const R = {
      genotypes: keys.map((kk) => `${counts[kk] / gd} ${kk}`).join(' : '),
      phenotypes: [dom && `${dom / pd} ${o.dom ?? 'dominant'}`, rec && `${rec / pd} ${o.rec ?? 'recessive'}`].filter(Boolean).join(' : '),
      pRec: rec ? `${rec / gcd(rec, 4)}/${4 / gcd(rec, 4)}` : '0',
    };
    if (o.ratioAt) {
      const [rx, ry] = o.ratioAt, ru = o.ratioU ?? 25;
      out.push(...k.text('genotypes:', rx, ry, { u: ru * 0.8 }), ...k.text(R.genotypes, rx + 10, ry + 54, { u: ru }));
      out.push(...k.text('phenotypes:', rx, ry + 118, { u: ru * 0.8 }));
      const ph = k.text(R.phenotypes, rx + 10, ry + 174, { u: ru }); out.push(...ph, ...k.ring(ph, { pad: 8 }));
    }
    out.R = R; return out;
  },

  /** An ICE table under its equation: species = ['H_2', 'I_2', '2HI'], signs between them ['+', '⇌'], rows = {I: [...], C: [...], E: [...]} */
  ice(k, x, y, species, signs, rows, o = {}) {
    const cw = o.cw ?? 118, lw = o.lw ?? 54, rh = o.rh ?? 50, u = o.u ?? 24, out = [];
    species.forEach((sp, c) => { const cx = x + lw + cw * (c + 0.5); out.push(...k.text(sp, cx, y + 34, { u: u * 1.08, align: 'center' }));
      if (signs[c]) out.push(...k.text(signs[c], x + lw + cw * (c + 1) - (signs[c] === '⇌' ? 8 : 0), y + 34, { u: u * (signs[c] === '⇌' ? 0.9 : 1.08), align: 'center' })); });
    const gy = y + 52;
    out.push(...k.line([x - 6, gy], [x + lw + cw * species.length + 6, gy + k.J(3)], { bow: 0.01 }));
    out.push(...k.grid(x, gy, [lw, ...species.map(() => cw)], [rh, rh, rh], { outer: false }));
    ['I', 'C', 'E'].forEach((L, r) => {
      const my = gy + rh * (r + 0.5);
      out.push(...k.text(L, x + lw / 2, my, { u, align: 'center', valign: 'middle' }));
      (rows[L] ?? []).forEach((v, c) => out.push(...k.text(v, x + lw + cw * (c + 0.5), my, { u: u * 0.95, align: 'center', valign: 'middle' })));
    });
    return out;
  },

  /** A Lewis structure written on the line (backbone left to right, H at the free points, lone pairs as pairs of dots).
   *  mol: 'H2O' (H–O–H, two lone pairs on O) | 'CO2' (O=C=O, two lone pairs on each O). (cx, yb) = centre of the backbone, its baseline. */
  lewis(k, cx, yb, mol = 'H2O', o = {}) {
    const u = o.u ?? 36, gap = o.gap ?? 96, out = [];
    const atoms = mol === 'CO2' ? ['O', 'C', 'O'] : ['H', 'O', 'H'], order = mol === 'CO2' ? 2 : 1;
    const A = atoms.map((a, i) => k.text(a, cx + (i - 1) * gap, yb, { u, align: 'center' }));
    const B = A.map((t) => k.bbox(t)), mid = (b) => b.cy;
    out.push(...A[0]);
    for (let i = 1; i < 3; i++) {
      const a = B[i - 1], b = B[i], y0 = (mid(a) + mid(b)) / 2;
      for (let j = 0; j < order; j++) { const dy = order === 2 ? (j ? 6 : -6) : 0; out.push(...k.line([a.x1 + 9, y0 + dy], [b.x0 - 9, y0 + dy], { bow: 0.02, miss: 1 })); }
      out.push(...A[i]);
    }
    const lonely = mol === 'CO2' ? [0, 2] : [1];   // which atoms carry the lone pairs (2 each)
    for (const i of lonely) { const b = B[i]; out.push(...k.pair(b.cx, b.y0 - 17, 'h', { gap: 13 }), ...k.pair(b.cx, b.y1 + 17, 'h', { gap: 13 })); }
    return out;
  },

  /** A free-body diagram on an incline: the ramp triangle (rising to the right) at bottom-left (x, yb) with base `len`, a box on it,
   *  and weight / normal / kinetic friction arrows from the box's centre, labelled; returns the working too (worked from m, θ, μ). */
  fbdRamp(k, x, yb, o = {}) {
    const m = o.m ?? 5.0, th = o.theta ?? 30, mu = o.mu ?? 0.2, g = 9.8, L = o.len ?? 350, out = [];
    const t = th * D2R, A = [x, yb], B = [x + L, yb], C = [x + L, yb - L * Math.tan(t)];
    const up = [Math.cos(t), -Math.sin(t)], n = [-Math.sin(t), -Math.cos(t)];
    out.push(...k.poly([A, B, C], { close: true }));
    const arcPts = []; for (let i = 0; i <= 8; i++) { const a = -t * (i / 8); arcPts.push([A[0] + 48 * Math.cos(a), A[1] + 48 * Math.sin(a)]); }
    out.push(...k.poly(arcPts, { line: 2.6 }), ...k.text(`${th}°`, A[0] + 58, yb - 8, { u: 20 }));
    const s = o.at ?? 0.62 * L, bs = o.box ?? 60, S = [A[0] + up[0] * s, A[1] + up[1] * s];
    const P = (p, a, b) => [p[0] + up[0] * a + n[0] * b, p[1] + up[1] * a + n[1] * b];
    out.push(...k.poly([P(S, -bs / 2, 0), P(S, bs / 2, 0), P(S, bs / 2, bs), P(S, -bs / 2, bs)], { close: true }));
    const c = P(S, 0, bs / 2), W = m * g, N = W * Math.cos(t), f = mu * N, Fp = W * Math.sin(t), a = (Fp - f) / m;
    out.push(...k.dot(c[0], c[1], { r: 4 }));
    const tipW = [c[0], c[1] + 100], tipN = [c[0] + n[0] * 104, c[1] + n[1] * 104], tipF = [c[0] + up[0] * 92, c[1] + up[1] * 92];
    out.push(...k.arrow(c, tipW), ...k.text('mg', tipW[0] + 12, tipW[1] + 4, { u: 24 }));
    out.push(...k.arrow(c, tipN), ...k.text('N', tipN[0] - 34, tipN[1] + 10, { u: 26 }));
    out.push(...k.arrow(c, tipF), ...k.text('f_k', tipF[0] + 6, tipF[1] - 12, { u: 24 }));
    out.R = { W, N, f, Fp, a, lines: [`mg = (${m.toFixed(1)})(9.8) = ${trim(W)} N`, `N = mg cos${th}° = ${trim(N)} N`, `f_k = μ_k N = ${trim(f)} N`, 'ΣF = ma',
      `mg sin${th}° - f_k = ma`, `${trim(Fp)} - ${trim(f)} = ${m.toFixed(1)}a`, `a = ${trim(a, 2)} m/s^2`] };
    return out;
  },

  /** A dot free-body diagram: forces = [{dir: [dx, dy] (canvas, y down), len, label}] from the point (cx, cy). */
  fbdDot(k, cx, cy, forces, o = {}) {
    const out = [...k.dot(cx, cy, { r: 5 })], u = o.u ?? 28;
    for (const F of forces) {
      const L = Math.hypot(...F.dir), ux = F.dir[0] / L, uy = F.dir[1] / L, tip = [cx + ux * F.len, cy + uy * F.len];
      out.push(...k.arrow([cx + ux * 8, cy + uy * 8], tip));
      const horiz = Math.abs(ux) > 0.5, lx = horiz ? tip[0] + ux * 16 : tip[0] + 16, ly = horiz ? tip[1] : tip[1] - uy * 14;
      out.push(...k.text(F.label, lx, ly, { u, align: horiz && ux < 0 ? 'right' : 'left', valign: 'middle' }));
    }
    return out;
  },

  /** A market graph with one shift. shift: 'supply-left' | 'supply-right' | 'demand-left' | 'demand-right'. Origin (x0, y0) = the
   *  axes' corner; q/p = px per unit (Q, P on 0…10). Both equilibria dotted and dropped to P₁/Q₁ and P₂/Q₂ (README §Economics). */
  market(k, x0, y0, o = {}) {
    const q = o.q ?? 36, p = o.p ?? 37, out = [], M = (Q, P) => [x0 + q * Q, y0 - p * P], shift = o.shift ?? 'supply-left';
    const sup = shift.startsWith('supply'), left = shift.endsWith('left');
    const D = [9, -0.8], S = [1, 0.8], C2 = sup ? [S[0] + (left ? 2 : -2), 0.8] : [D[0] + (left ? -2 : 2), -0.8];
    const clip = ([a, b]) => { let qa = 0.3, qb = 9.3; for (const P of [0.4, 9.4]) { const Q = (P - a) / b; if (b > 0) { if (P === 0.4) qa = Math.max(qa, Q); else qb = Math.min(qb, Q); } else { if (P === 9.4) qa = Math.max(qa, Q); else qb = Math.min(qb, Q); } } return [qa, qb]; };
    const curve = (ln, label) => { const [qa, qb] = clip(ln), a = M(qa, ln[0] + ln[1] * qa), b = M(qb, ln[0] + ln[1] * qb), end = ln[1] > 0 ? b : b;
      return [...k.line(a, b, { bow: 0.015 }), ...k.text(label, end[0] + 10, end[1] + (ln[1] > 0 ? 6 : 22), { u: 24 })]; };
    const eq = (l1, l2) => { const Q = (l2[0] - l1[0]) / (l1[1] - l2[1]); return [Q, l1[0] + l1[1] * Q]; };
    out.push(...k.line([x0, y0], [x0 + q * 10.6, y0], { bow: 0.006 }), ...k.line([x0, y0], [x0, y0 - p * 10.3], { bow: 0.006 }));
    out.push(...k.text('P', x0 - 30, y0 - p * 9.9, { u: 26 }), ...k.text('Q', x0 + q * 10.4, y0 + 42, { u: 26 }));
    out.push(...curve(D, 'D'), ...curve(S, 'S'), ...curve(C2, sup ? "S'" : "D'"));
    const lv = (sup && left) || (!sup && !left) ? 7.6 : 3.0, base = sup ? S : D, at = (ln) => (lv - ln[0]) / ln[1];
    const qa = at(base), qb = at(C2), dq = Math.sign(qb - qa) * 0.25;
    out.push(...k.arrow(M(qa + dq, lv), M(qb - dq, lv), { head: 11, line: 3 }));
    const E1 = eq(D, S), E2 = sup ? eq(D, C2) : eq(C2, S);
    for (const [E, i] of [[E1, 1], [E2, 2]]) {
      const pt = M(...E);
      out.push(...k.dot(pt[0], pt[1], { r: 4.5 }), ...k.dashed(pt, M(0, E[1])), ...k.dashed(pt, M(E[0], 0)));
      out.push(...k.text(`P_${i}`, x0 - 10, pt[1], { u: 21, align: 'right', valign: 'middle' }), ...k.text(`Q_${i}`, pt[0], y0 + 34, { u: 21, align: 'center' }));
    }
    const pUp = E2[1] > E1[1], qUp = E2[0] > E1[0], C = sup ? 'S' : 'D';
    out.R = { E1, E2, lines: [o.cause ?? (sup ? (left ? 'Supply falls,' : 'Supply rises,') : (left ? 'Demand falls,' : 'Demand rises,')), `so ${C} shifts ${left ? 'left' : 'right'} to ${C}'.`,
      `Price ${pUp ? 'rises' : 'falls'}: P_1 → P_2.`, `Quantity ${qUp ? 'rises' : 'falls'}: Q_1 → Q_2.`] };
    return out;
  },

  /** A 2×2 payoff matrix: pay[r][c] = [A's, B's]. Best responses underlined under their own numbers, each pure Nash equilibrium
   *  circled (computed from the payoffs, never given). (x, y) = the grid's top-left; the row player's labels sit left of it. */
  payoff(k, x, y, o = {}) {
    const rowsN = o.rows ?? ['High', 'Low'], colsN = o.cols ?? ['High', 'Low'], pay = o.pay ?? [[[50, 50], [20, 70]], [[70, 20], [30, 30]]];
    const cw = o.cw ?? 170, rh = o.rh ?? 80, u = o.u ?? 27, out = [], cells = [];
    out.push(...k.text(o.colPlayer ?? 'Firm B', x + cw, y - 62, { u: u * 0.9, align: 'center' }), ...k.text(o.rowPlayer ?? 'Firm A', x - (o.rowLabelW ?? 104), y + rh, { u: u * 0.9, align: 'right', valign: 'middle' }));
    colsN.forEach((c, j) => out.push(...k.text(c, x + cw * (j + 0.5), y - 12, { u: u * 0.9, align: 'center' })));
    out.push(...k.grid(x, y, [cw, cw], [rh, rh]));
    rowsN.forEach((r, i) => out.push(...k.text(r, x - 16, y + rh * (i + 0.5), { u: u * 0.9, align: 'right', valign: 'middle' })));
    pay.forEach((row, i) => row.forEach(([a, b], j) => {
      const cx = x + cw * (j + 0.5), by = y + rh * (i + 0.5) + u * 0.9;   // digits: ink centre ≈ baseline − 0.9 u
      const A = k.text(String(a), cx - 14, by, { u, align: 'right' }), cm = k.text(',', cx - 8, by, { u }), Bb = k.text(String(b), cx + 14, by, { u });
      out.push(...A, ...cm, ...Bb); cells.push({ i, j, A, B: Bb, all: [...A, ...cm, ...Bb] });
    }));
    const bestA = (j) => Math.max(...pay.map((row) => row[j][0])), bestB = (i) => Math.max(...pay[i].map((c) => c[1]));
    const nash = [];
    for (const c of cells) {
      const ba = pay[c.i][c.j][0] === bestA(c.j), bb = pay[c.i][c.j][1] === bestB(c.i);
      if (ba) out.push(...k.under(c.A)); if (bb) out.push(...k.under(c.B));
      if (ba && bb) nash.push(c);
    }
    for (const c of nash) out.push(...k.ring(c.all, { pad: 14 }));
    out.R = { nash: nash.map((c) => `(${rowsN[c.i]}, ${colsN[c.j]})`), pay: nash.map((c) => pay[c.i][c.j]) };
    return out;
  },

  /** A food chain: names joined by freehand arrows (energy flow), each level labelled small underneath. */
  foodChain(k, x0, x1, yb, names, levels = [], o = {}) {
    const u = o.u ?? 28, n = names.length, out = [], T = names.map((nm, i) => k.text(nm, x0 + (x1 - x0) * (i + 0.5) / n, yb, { u, align: 'center' })), B = T.map((t) => k.bbox(t));
    T.forEach((t, i) => {
      out.push(...t);
      if (levels[i]) out.push(...k.text(levels[i], B[i].cx, yb + 46, { u: o.lu ?? 17, align: 'center' }));
      if (i < n - 1) { const y = (B[i].cy + B[i + 1].cy) / 2; out.push(...k.arrow([B[i].x1 + 14, y], [B[i + 1].x0 - 14, y + k.J(4)], { head: 13 })); }
    });
    return out;
  },

  /** An animal cell (membrane, nucleus + nucleolus, two mitochondria, ribosomes) centred at (cx, cy), labelled with leader lines
   *  at x = lx (no cell wall, no chloroplast: README §Biology checks that an animal cell has neither). */
  animalCell(k, cx, cy, lx, o = {}) {
    const rx = o.rx ?? 200, ry = o.ry ?? 126, out = [];
    out.push(...k.ellipse(cx, cy, rx, ry, { wob: 0.05, drift: 0.02, line: 3.8 }));
    const nx = cx - 34, ny = cy - 4;
    out.push(...k.ellipse(nx, ny, 54, 46, { line: 3.4 }), ...k.ellipse(nx + 8, ny + 4, 13, 11, { line: 3 }), ...k.dot(nx + 8, ny + 4, { r: 4 }));
    const mito = (mx, my, r) => { const o2 = k.ellipse(mx, my, 40, 17, { rot: r, line: 3 }); const z = [];
      for (let i = 0; i <= 8; i++) { const t = -30 + i * 7.5, s = i % 2 ? 9 : -9; z.push([mx + t * Math.cos(r) - s * Math.sin(r), my + t * Math.sin(r) + s * Math.cos(r)]); }
      return [...o2, ...k.poly(z, { line: 2.2 })]; };
    out.push(...mito(cx + 112, cy - 58, -0.35), ...mito(cx - 112, cy + 70, 0.3));
    const ribo = [[cx + 70, cy + 40], [cx + 92, cy + 62], [cx + 58, cy + 74], [cx + 118, cy + 30], [cx - 140, cy - 30], [cx - 122, cy - 56]];
    for (const [x, y] of ribo) out.push(...k.dot(x, y, { r: 3.6 }));
    const lu = o.lu ?? 23;
    out.push(...k.label('nucleus', [lx, cy - 86], [nx + 40, ny - 30], { u: lu }));
    out.push(...k.label('mitochondrion', [lx, cy - 36], [cx + 150, cy - 70], { u: lu }));
    out.push(...k.label('ribosomes', [lx, cy + 18], [cx + 122, cy + 32], { u: lu }));
    out.push(...k.label('cell membrane', [lx, cy + 76], [cx + rx * Math.cos(0.55), cy + ry * Math.sin(0.55)], { u: lu }));
    return out;
  },
};

const NOTE = 'Due Nov 30, 11:59 PM  ·  HANDWRITTEN WORK ONLY';

export const SUBJECTS = {
  chemistry: {
    key: 'chemistry', label: 'Chemistry · Problem Set 4', tags: ['Balance', 'Lewis', 'Molar mass', 'ICE table'],
    sheet: { title: 'CHEM 1A · PROBLEM SET 4', note: NOTE, page: 'p. 1 of 3', seed: 41, rich: true, problems: [
      { q: '1.  Balance:  CH₄ + O₂ → CO₂ + H₂O', h: 0.85, fig: ({ k, y }) => {   // CH₄ + 2O₂ → CO₂ + 2H₂O (C 1 = 1, H 4 = 4, O 4 = 4)
        const eq = k.text('CH_4 + 2O_2 → CO_2 + 2H_2O', 124, y + 118, { u: 32 });
        return [...eq, ...k.box(eq, { pad: 11 }), ...k.text('C: 1 = 1     H: 4 = 4     O: 4 = 4', 132, y + 180, { u: 21 })]; } },
      { q: '2.  Draw the Lewis structure of H₂O. What is its shape?', h: 1.15, fig: ({ k, y }) => {   // 6 + 2(1) = 8 e⁻: 2 bonds + 2 lone pairs on O, bent
        const lab = k.text('shape:', 530, y + 228, { u: 24 }), shape = k.text('bent', k.bbox(lab).x1 + 34, y + 228, { u: 26 }), ring = k.ring(shape, { pad: 8 });
        return [...FIG.lewis(k, 300, y + 186, 'H2O'), ...k.text('6 + 2(1) = 8 valence e^-', 530, y + 128, { u: 24 }), ...k.text('2 bonds, 2 lone pairs on O', 530, y + 176, { u: 24 }),
          ...lab, ...shape, ...ring, ...k.text('104.5°', k.bbox(ring).x1 + 18, y + 228, { u: 22 })]; } },
      { q: '3.  Find the molar mass of CO₂.', h: 0.6, fig: ({ k, y }) => {   // 12.01 + 2(16.00) = 44.01 g/mol
        const a = k.text('12.01 + 2(16.00) =', 124, y + 106, { u: 29 }), b = k.text('44.01 g/mol', k.bbox(a).x1 + 36, y + 106, { u: 29 });
        return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
      { q: '4.  H₂ + I₂ ⇌ 2HI,  Kc = 49.  Start: 0.50 M H₂ and 0.50 M I₂.\n     Find [HI] at equilibrium.', h: 1.6, fig: ({ k, y }) => {
        // (2x)²/(0.50 − x)² = 49 → 2x/(0.50 − x) = 7 → 9x = 3.5 → x = 0.389 → [HI] = 2x = 0.78 M (check: 0.778²/0.111² = 49.0)
        const T = FIG.ice(k, 112, y + 104, ['H_2', 'I_2', '2HI'], ['+', '⇌'], { I: ['0.50', '0.50', '0'], C: ['-x', '-x', '+2x'], E: ['0.50-x', '0.50-x', '2x'] }, { cw: 128, lw: 48 });
        const W = [], L = ['K_c = [HI]^2/([H_2][I_2])', '(2x)^2/(0.50-x)^2 = 49', '2x/(0.50-x) = 7', '9x = 3.5,   x = 0.389'];
        L.forEach((s, i) => W.push(...k.text(s, 600, y + 146 + i * 46, { u: 21 })));
        const a = k.text('[HI] = 2x =', 600, y + 340, { u: 22 }), b = k.text('0.78 M', k.bbox(a).x1 + 34, y + 340, { u: 25 });
        return [...T, ...W, ...a, ...b, ...k.ring(b, { pad: 9 })]; } },
    ] },
  },
  biology: {
    key: 'biology', label: 'Biology · Problem Set 6', tags: ['Punnett', 'Food chain', 'Cell'],
    sheet: { title: 'BIO 1 · PROBLEM SET 6', note: NOTE, page: 'p. 1 of 3', seed: 61, rich: true, problems: [
      { q: '1.  Black fur (B) is dominant to white fur (b).\n     Cross Bb × Bb. Give the genotype and phenotype ratios.', h: 2.0,   // 1 BB : 2 Bb : 1 bb, 3 black : 1 white
        fig: ({ k, y }) => FIG.punnett(k, 250, y + 226, 'Bb', 'Bb', { cell: 92, dom: 'black', rec: 'white', ratioAt: [560, y + 214] }) },
      { q: '2.  Draw a food chain with four trophic levels. Label each level.', h: 0.9,
        fig: ({ k, y }) => FIG.foodChain(k, 90, 960, y + 128, ['grass', 'cricket', 'frog', 'hawk'], ['producer', '1° consumer', '2° consumer', '3° consumer']) },
      { q: '3.  Sketch an animal cell and label four structures.', h: 1.6, fig: ({ k, y }) => FIG.animalCell(k, 330, y + 206, 650) },
    ] },
  },
  physics: {
    key: 'physics', label: 'Physics · Problem Set 5', tags: ['FBD · ramp', 'FBD · plane', 'F = ma'],
    sheet: { title: 'PHYS 1 · PROBLEM SET 5', note: NOTE, page: 'p. 1 of 3', seed: 51, rich: true, problems: [
      { q: '1.  A 5.0 kg block slides down a 30° ramp (μₖ = 0.20).\n     Draw the free-body diagram and find its acceleration.', h: 2.0, fig: ({ k, y }) => {
        // mg = 49 N, N = mg cos30° = 42.4 N, f = μN = 8.49 N, mg sin30° = 24.5 N → a = (24.5 − 8.49)/5.0 = 3.2 m/s²
        const F = FIG.fbdRamp(k, 120, y + 462, { m: 5.0, theta: 30, mu: 0.2 }), W = [];
        F.R.lines.slice(0, -1).forEach((s, i) => W.push(...k.text(s, 560, y + 150 + i * 44, { u: 23 })));
        const a = k.text(F.R.lines[F.R.lines.length - 1], 560, y + 150 + 6 * 44 + 6, { u: 25 });
        return [...F, ...W, ...a, ...k.ring(a, { pad: 10 })]; } },
      { q: '2.  A plane flies level at a constant velocity. Draw its FBD.', h: 1.25, fig: ({ k, y }) => {   // a = 0 → ΣF = 0: L = W, T = D
        const F = FIG.fbdDot(k, 300, y + 186, [{ dir: [0, -1], len: 86, label: 'L' }, { dir: [0, 1], len: 86, label: 'W' }, { dir: [1, 0], len: 118, label: 'T' }, { dir: [-1, 0], len: 118, label: 'D' }]);
        const r = k.text('L = W,    T = D', 574, y + 256, { u: 26 });
        return [...F, ...k.text('constant v → a = 0', 560, y + 136, { u: 24 }), ...k.text('ΣF = 0', 560, y + 186, { u: 24 }), ...r, ...k.ring(r, { pad: 8 })]; } },
      { q: '3.  Find the net force on a 1200 kg car accelerating at 2.5 m/s².', h: 0.65, fig: ({ k, y }) => {   // 1200 × 2.5 = 3000 N
        const a = k.text('F = ma = (1200)(2.5) =', 124, y + 116, { u: 29 }), b = k.text('3.0 × 10^3 N', k.bbox(a).x1 + 44, y + 116, { u: 29 });
        return [...a, ...b, ...k.ring(b, { pad: 10 })]; } },
    ] },
  },
  economics: {
    key: 'economics', label: 'Economics · Problem Set 3', tags: ['Market shift', 'Nash'],
    sheet: { title: 'ECON 1 · PROBLEM SET 3', note: NOTE, page: 'p. 1 of 3', seed: 31, rich: true, problems: [
      { q: '1.  A frost destroys half of the orange crop. Show the effect on\n     the market for oranges and explain.', h: 2.1, fig: ({ k, y }) => {
        // D: P = 9 − 0.8Q, S: P = 1 + 0.8Q → E₁ (5, 5); S′: P = 3 + 0.8Q → E₂ (3.75, 6): price up, quantity down
        const M = FIG.market(k, 160, y + 500, { shift: 'supply-left', cause: 'The frost cuts supply,' }), W = [];
        M.R.lines.forEach((s, i) => W.push(...k.text(s, 590, y + 214 + i * 50, { u: 22 })));
        return [...M, ...W]; } },
      { q: '2.  Two firms each pick a High or Low price. Payoffs are\n     (A, B) in $ millions. Find the Nash equilibrium.', h: 1.6, fig: ({ k, y }) => {
        // Low is dominant for both (70 > 50, 30 > 20) → the only pure Nash equilibrium is (Low, Low) = (30, 30)
        const P = FIG.payoff(k, 340, y + 186, {}), a = k.text('Low is dominant for both.', 120, y + 408, { u: 24 }), b = k.text(`Nash: ${P.R.nash.join(', ')}`, k.bbox(a).x1 + 40, y + 408, { u: 24 });
        return [...P, ...a, ...b]; } },
    ] },
  },
  math: {   // 049's calculus sheet, unchanged (not rich): subjectSheet(G, 'math') draws exactly 049's page
    key: 'math', label: 'Calculus · Problem Set 9', tags: ['∫ by parts', 'd/dx', 'Limit', '∫', 'Sketch', 'Series'],
    sheet: { seed: 9, page: 'p. 1 of 7', problems: [
      { q: '1.  ∫ x sin x dx', a: '= x cos x\n= -x cos x + sin x + C', pre: true, cross: 9 },
      { q: '2.  d/dx [ ln(x² + 1) ]', a: '= 2x / (x^2 + 1)' },
      { q: '3.  lim (x→0)  sin(3x) / x', a: '= 3' },
      { q: '4.  ∫ (7x⁶ + 77) dx', a: '= x^7 + 77x + 7 + C' },
      { q: '5.  Sketch y = x² − 4x + 3', a: 'roots x=1, x=3', graph: true },
      { q: '6.  Σ 1/n²  (n = 1 → ∞)', a: '= π^2/6' },
    ] },
  },
};
export const SUBJECT_KEYS = ['chemistry', 'biology', 'physics', 'economics', 'math'];

/** A pack's worksheet: makeSheet with the pack's spec (over = {name, seed, title, note, page, …} overrides it). The sheet carries
 *  `subject` (the pack), so makeScreen(G, icon, sheet) shows its class line and a tile per problem; pass `subject: false` there
 *  to get 049's plain 40-tile screen. */
export function subjectSheet(G, key, over = {}) {
  const S = SUBJECTS[key];
  if (!S) throw new Error(`subjectSheet: no pack "${key}" (have ${SUBJECT_KEYS.join(', ')})`);
  return makeSheet(G, { ...S.sheet, subject: S, ...over });
}
