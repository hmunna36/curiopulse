// Render the whole video with several headless browsers side by side, then join the pieces and add the sound.
// Usage: node render_par.js <timeline.json> <out.mp4> --audio mix.wav [--jobs N]
//   N defaults to the number of CPUs minus one (at least 1, at most 6). Each job renders a run of whole shots into
//   <work>/seg_<k>.mp4 with render.js (video only, the same encoder settings), so a cut between two pieces always
//   falls on a cut between two shots. The pieces are joined without re-encoding and muxed with the mix.
// Why: a 3-minute video is ~5,400 frames; one browser on a machine without a GPU takes too long.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const args = process.argv.slice(2);
const take = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1] : null; };
const audio = take('--audio');
const jobs = Math.max(1, Math.min(6, Number(take('--jobs') || process.env.RENDER_JOBS || Math.max(1, os.cpus().length - 1))));
const [tlPath, out] = args;
if (!tlPath || !out || !out.endsWith('.mp4')) { console.error('usage: node render_par.js <timeline.json> <out.mp4> --audio mix.wav [--jobs N]'); process.exit(2); }
const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
const total = Math.round(tl.duration * tl.fps);
const work = path.dirname(path.resolve(tlPath));

// split points: the shot starts closest to an even split
const starts = tl.shots.map((s) => Math.round(s.start * tl.fps)).filter((f) => f > 0 && f < total);
const cuts = [0];
for (let k = 1; k < jobs; k++) {
  const want = Math.round((total * k) / jobs);
  const best = starts.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a), starts[0] ?? want);
  if (best > cuts[cuts.length - 1]) cuts.push(best);
}
cuts.push(total);
const segs = cuts.slice(0, -1).map((a, k) => ({ a, b: cuts[k + 1] - 1, file: path.join(work, `seg_${k}.mp4`) }));
console.log(`${total} frames in ${segs.length} piece(s): ${segs.map((s) => `${s.a}-${s.b}`).join(', ')}`);

const t0 = Date.now();
Promise.all(segs.map((s, k) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [path.join(__dirname, 'render.js'), tlPath, s.file, `${s.a}-${s.b}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  const tag = (d) => String(d).split('\n').filter(Boolean).forEach((ln) => console.log(`[${k}] ${ln}`));
  p.stdout.on('data', tag); p.stderr.on('data', tag);
  p.on('close', (code) => (code === 0 && fs.existsSync(s.file) ? resolve() : reject(new Error(`piece ${k} failed (exit ${code})`))));
}))).then(() => {
  const list = path.join(work, 'segs.txt');
  fs.writeFileSync(list, segs.map((s) => `file '${s.file.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const a = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list];
  if (audio) a.push('-i', audio);
  a.push('-map', '0:v:0', '-c:v', 'copy');
  if (audio) a.push('-map', '1:a:0', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest');
  a.push('-movflags', '+faststart', out);
  const r = spawnSync('ffmpeg', a, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('joining the pieces failed');
  for (const s of segs) fs.rmSync(s.file, { force: true });
  fs.rmSync(list, { force: true });
  console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s with ${segs.length} job(s): ${out}`);
}).catch((e) => { console.error(String(e.message || e)); process.exit(1); });
