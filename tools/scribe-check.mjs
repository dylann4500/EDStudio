#!/usr/bin/env node
// Regression check for engine/build/scribe.js (Nov 9, subject packs): every makeSheet / makeScreen / layoutHand call in the
// shipped reels (videos/*/shots.js) is rebuilt with the working-tree scribe.js AND with the one at a git ref (default main),
// drawn at several pen positions / app modes, and compared pixel for pixel. Any change to the kit must print "identical".
//   node tools/scribe-check.mjs [--ref main]           (needs the sandbox disabled: headless Chrome)
//   node tools/scribe-check.mjs --packs <dir>          also writes every subject pack's sheet + app screen as PNGs to <dir>
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { findChrome } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const ref = flag('ref', 'main'), packsDir = flag('packs', null);
const refSrc = execFileSync('git', ['show', `${ref}:engine/build/scribe.js`], { cwd: ROOT, encoding: 'utf8' });

// ---- pull the calls out of every reel (string-aware bracket matching)
function balanced(s, i) {   // s[i] is an opening bracket; returns the index just past its match
  const open = '([{', close = ')]}'; let depth = 0, q = null;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '/' && s[k + 1] === '/') { k = s.indexOf('\n', k); if (k < 0) return s.length; continue; }
    if (open.includes(c)) depth++; else if (close.includes(c) && --depth === 0) return k + 1;
  }
  return s.length;
}
const cases = [];
for (const dir of fs.readdirSync(path.join(ROOT, 'videos')).sort()) {
  const f = path.join(ROOT, 'videos', dir, 'shots.js');
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (!/from '@engine\/build\/scribe\.js'/.test(src)) continue;
  const consts = {};   // simple literal consts a call may reference (057's wsProblems)
  for (const m of src.matchAll(/const (\w+) = ([[{])/g)) consts[m[1]] = src.slice(m.index + m[0].length - 1, balanced(src, m.index + m[0].length - 1));
  const bare = (expr) => expr.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, "''");   // identifiers outside strings only
  const env = (expr) => Object.entries(consts).filter(([k]) => new RegExp(`(^|[^.\\w])${k}\\b(?!\\s*:)`).test(bare(expr))).map(([k, v]) => `const ${k} = ${v};`).join('\n');
  for (const [re, kind] of [[/makeSheet\(G, /g, 'sheet'], [/makeScreen\(G, icon, (\w+)(, )?/g, 'screen'], [/layoutHand\(G, /g, 'layout']]) {
    for (const m of src.matchAll(re)) {
      const start = m.index + m[0].length;
      if (kind === 'screen') { const end = balanced(src, m.index + 'makeScreen'.length); const opt = m[2] ? src.slice(start, end - 1) : '{}'; cases.push({ dir, kind, expr: opt, env: env(opt) }); continue; }
      const end = balanced(src, m.index + (kind === 'sheet' ? 'makeSheet' : 'layoutHand').length), expr = src.slice(start, end - 1);
      cases.push({ dir, kind, expr, env: env(expr) });
    }
  }
}

const page = `<!doctype html><meta charset="utf-8"><script type="importmap">{ "imports": { "three": "/node_modules/three/build/three.module.js", "@engine/": "/engine/" } }</script>
<script type="module">
import * as NEW from '/engine/build/scribe.js';
import * as OLD from '/__ref/scribe.js';
const CASES = ${JSON.stringify(cases)};
const fnv = (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 3) { h ^= d[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + c.width + 'x' + c.height; };
const strip = (its) => JSON.stringify(its.map(({ c, ...r }) => r));
try {
  const icon = await NEW.loadImg('/videos/049-scribe-promo/scribe-icon.png');
  const GN = await NEW.loadHand('/videos/049-scribe-promo/hand.json'), GO = await OLD.loadHand('/videos/049-scribe-promo/hand.json');
  { // warm-up: the first canvas text in a font can race a lazy font load, so draw every screen mode with both kits, then wait
    for (const [M, G] of [[NEW, GN], [OLD, GO]]) { const s = M.makeSheet(G, {}); const sc = M.makeScreen(G, icon, s); for (const mode of ['home', 'scan', 'solve', 'write', 'done']) sc.draw({ mode, k: 0.5 }); s.draw(5, true); }
    await document.fonts.ready; await new Promise((r) => setTimeout(r, 800));
  }
  const out = []; const firstSheet = {};
  for (const c of CASES) {
    let a, b; try { a = new Function('L', 'G', c.env + '\\nreturn L(G, ' + c.expr + ');'); } catch (e) { out.push([c.dir, c.kind, 'SKIP ' + e.message]); continue; }
    const run = (M, G, cs) => {
      if (c.kind === 'layout') return [strip(a(M.layoutHand, G))];
      if (c.kind === 'sheet') { const s = a(M.makeSheet, G); firstSheet[c.dir] ??= {}; firstSheet[c.dir][cs] ??= s;
        const T = s.total, r = [String(T), strip(s.items), strip(s.pre)]; for (const p of [0, T * 0.37, T * 0.71, T, T + 5]) { s.draw(p, true); r.push(fnv(s.canvas)); } return r; }
      const sh = firstSheet[c.dir]?.[cs]; if (!sh) return ['no sheet'];
      const scr = new Function('M', 'G', 'icon', 'sh', c.env + '\\nreturn M.makeScreen(G, icon, sh, ' + c.expr + ');')(M, G, icon, sh);
      const r = []; for (const st of [{ mode: 'home' }, { mode: 'scan', k: 0.5 }, { mode: 'solve', k: 0.3 }, { mode: 'solve', k: 1 }, { mode: 'write', k: 0 }, { mode: 'done', k: 1 }]) { scr.draw(st); r.push(fnv(scr.canvas)); } return r;
    };
    if (c.kind === 'screen' && !firstSheet[c.dir]) { out.push([c.dir, c.kind, 'skip (no makeSheet call in this file)']); continue; }
    try { const rn = run(NEW, GN, 'n'), ro = run(OLD, GO, 'o'); const diff = rn.map((v, i) => v === ro[i] ? null : i).filter((i) => i !== null);
      out.push([c.dir, c.kind, diff.length ? 'DIFF at ' + diff.join(',') : 'identical (' + rn.length + ' checks)']); }
    catch (e) { out.push([c.dir, c.kind, 'ERROR ' + e.message]); }
  }
  window.RESULT = out;
  if (${JSON.stringify(!!packsDir)}) {
    const { SUBJECT_KEYS, subjectSheet } = await import('/engine/build/subjects.js');
    const shots = {};
    for (const key of SUBJECT_KEYS) {
      const s = subjectSheet(GN, key); s.draw(s.total + 1, true); shots[key + '-sheet'] = s.canvas.toDataURL('image/png');
      const scr = NEW.makeScreen(GN, icon, s); scr.draw({ mode: 'solve', k: 0.6 }); shots[key + '-solve'] = scr.canvas.toDataURL('image/png');
      scr.draw({ mode: 'write', k: 0.5 }); shots[key + '-write'] = scr.canvas.toDataURL('image/png');
      s.draw(s.total * 0.55, true); shots[key + '-half'] = s.canvas.toDataURL('image/png');
    }
    window.PACKS = shots;
  }
} catch (e) { window.RESULT = [['-', '-', 'ERROR ' + e.stack]]; }
window.DONE = true;
</script>`;

const MIME = { '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.html': 'text/html' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u === '/__check.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(page); }
  if (u === '/__ref/scribe.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(refSrc); }
  const p = path.join(ROOT, u);
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--hide-scrollbars'] });
const pg = await browser.newPage();
pg.on('pageerror', (e) => console.log('[page error]', e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/__check.html`);
await pg.waitForFunction('window.DONE', { timeout: 300000 });
const res = await pg.evaluate('window.RESULT');
let bad = 0;
for (const [dir, kind, msg] of res) { const ok = /^identical/.test(msg), skip = /^skip/.test(msg); if (!ok && !skip) bad++; console.log(`${ok ? '✅' : skip ? '⏭️ ' : '❌'} ${dir.padEnd(30)} ${kind.padEnd(7)} ${msg}`); }
const n = res.filter(([, , m]) => /^identical/.test(m)).length;
console.log(bad ? `\n${bad} case(s) differ from ${ref}'s scribe.js` : `\nall ${n} cases identical to ${ref}'s scribe.js`);
if (packsDir) {
  const shots = await pg.evaluate('window.PACKS'); fs.mkdirSync(packsDir, { recursive: true });
  for (const [k, url] of Object.entries(shots || {})) fs.writeFileSync(path.join(packsDir, k + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('packs →', packsDir);
}
await browser.close(); srv.close();
process.exit(bad ? 1 : 0);
