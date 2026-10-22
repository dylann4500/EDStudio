// Shared helpers for tools: locate Chrome and ffmpeg on macOS / Windows / Linux.
import fs from 'node:fs';
export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const c = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    win32: ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] || [];
  return c.find((p) => fs.existsSync(p));
}
export async function findFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try { return (await import('@ffmpeg-installer/ffmpeg')).default.path; } catch { return 'ffmpeg'; }
}
