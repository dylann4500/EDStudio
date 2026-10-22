#!/usr/bin/env node
// Render the EDStudios profile pictures: brand/avatars.html?n=1..5 -> brand/avatars/<n>-<name>.png (1080x1080, circle-safe).
//   node tools/avatars.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { findChrome } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAMES = ['stories', 'whatif', 'every3s', 'lasttime', 'rooms'];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = await new Promise((res) => { const s = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }); s.listen(0, '127.0.0.1', () => res(s)); });
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=' + (process.platform === 'darwin' ? 'metal' : 'default')] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('[page error]', e.message));
const out = path.join(ROOT, 'brand', 'avatars'); fs.mkdirSync(out, { recursive: true });
for (let n = 1; n <= NAMES.length; n++) {
  await page.goto(`http://127.0.0.1:${srv.address().port}/brand/avatars.html?n=${n}`, { waitUntil: 'load' });
  await page.waitForFunction('window.AVATAR_READY', { timeout: 30000 });
  const f = path.join(out, `${n}-${NAMES[n - 1]}.png`);
  await page.screenshot({ path: f, omitBackground: true });
  console.log(f);
}
await browser.close(); srv.close();
