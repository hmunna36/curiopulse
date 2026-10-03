// Render web/scene.html frame by frame in headless Chrome.
// Usage: node render.js <timeline.json> <out.mp4 | out_dir> [frames e.g. "0-299" or "0,12,40"] [--audio mix.wav]
//   out.mp4: frames are piped straight into ffmpeg (nothing hits the disk) and muxed with --audio.
//   out_dir: PNGs for review.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

function parseFrames(spec, total) {
  if (!spec) return [...Array(total).keys()];
  const out = [];
  for (const part of spec.split(',')) {
    const m = part.split('-').map(Number);
    if (m.length === 2) for (let i = m[0]; i <= m[1]; i++) out.push(i);
    else out.push(m[0]);
  }
  return out.filter((f) => f >= 0 && f < total);
}

(async () => {
  const args = process.argv.slice(2);
  const ai = args.indexOf('--audio');
  const audio = ai >= 0 ? args.splice(ai, 2)[1] : null;
  const [tlPath, out, spec] = args;
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  const total = Math.round(tl.duration * tl.fps);
  const frames = parseFrames(spec, total);
  const toVideo = out.endsWith('.mp4');
  let ff = null;
  if (toVideo) {
    const a = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(tl.fps), '-c:v', 'png', '-i', '-'];
    if (audio) a.push('-i', audio);
    a.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-level', '4.2', '-g', '30', '-bf', '2', '-r', String(tl.fps),
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709');
    if (audio) a.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest');
    a.push('-movflags', '+faststart', out);
    ff = spawn('ffmpeg', a, { stdio: ['pipe', 'inherit', 'inherit'] });
  } else fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  await page.addInitScript({ content: 'window.TL = ' + JSON.stringify(tl) + ';' });
  // baked physics (bake_physics.js writes physics.json next to timeline.json): web/toolkit.js reads window.PHYS
  const physPath = path.join(path.dirname(path.resolve(tlPath)), 'physics.json');
  if (fs.existsSync(physPath)) await page.addInitScript({ content: 'window.PHYS = ' + fs.readFileSync(physPath, 'utf8') + ';' });
  await page.goto('file://' + path.resolve(__dirname, 'web/scene.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const t0 = Date.now();
  let n = 0;
  for (const f of frames) {
    const b64 = await page.evaluate((f) => {
      window.renderFrame(f);
      return document.getElementById('c').toDataURL('image/png').split(',')[1];
    }, f);
    const buf = Buffer.from(b64, 'base64');
    if (ff) { if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
    else fs.writeFileSync(path.join(out, `f_${String(f).padStart(4, '0')}.png`), buf);
    if (++n % 150 === 0) console.log(`  ${n}/${frames.length} frames, ${((Date.now() - t0) / n).toFixed(0)} ms/frame`);
  }
  await browser.close();
  if (ff) { ff.stdin.end(); await new Promise((r) => ff.on('close', r)); }
  console.log(`rendered ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
