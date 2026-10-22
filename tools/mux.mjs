#!/usr/bin/env node
// Mux videos/<video>/audio.wav onto out/silent.mp4 -> final.mp4 (capped bitrate, < 100 MB). Use after re-making audio only.
//   node tools/mux.mjs 001-bedroom-door
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findFfmpeg } from './lib.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(ROOT, 'videos', String(process.argv[2]));
const silent = path.join(dir, 'out', 'silent.mp4'), wav = path.join(dir, 'audio.wav'), final = path.join(dir, 'final.mp4');
for (const f of [silent, wav]) if (!fs.existsSync(f)) { console.error('missing ' + f); process.exit(1); }
const r = spawnSync(await findFfmpeg(), ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '6M', '-bufsize', '12M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' });
if (r.status === 0) console.log(final + '  ' + (fs.statSync(final).size / 1e6).toFixed(1) + ' MB');
process.exit(r.status ?? 1);
