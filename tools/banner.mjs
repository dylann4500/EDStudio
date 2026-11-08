#!/usr/bin/env node
// Render the course banner: brand/course-banner.html -> brand/course/banner.png (1920×1080) + banner@2x.png (3840×2160).
//   node tools/banner.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { findChrome } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = await new Promise((res) => { const s = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }); s.listen(0, '127.0.0.1', () => res(s)); });
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
const out = path.join(ROOT, 'brand', 'course'); fs.mkdirSync(out, { recursive: true });
for (const [dsf, name] of [[1, 'banner.png'], [2, 'banner@2x.png']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: dsf });
  page.on('pageerror', (e) => console.log('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/brand/course-banner.html`, { waitUntil: 'load' });
  await page.waitForFunction('window.BANNER_READY', { timeout: 30000 });
  const f = path.join(out, name); await page.screenshot({ path: f }); console.log(f);
  await page.close();
}
await browser.close(); srv.close();
