// Render the thumbnail: SC.cover drawn once at 1920x1080, saved as a 1280x720 JPEG (YouTube's thumbnail size, < 2 MB).
// Usage: node make_cover.js <timeline.json> <cover.jpg> [also.png]
//   SC.cover(lt, t, shot) is a normal shot function in web/ (scenes.js) that is NOT in the timeline: it draws the
//   one frame made for the thumbnail (the hiker's face big and readable, 2-3 huge words, one object). No captions and
//   no subscribe cue are drawn over it. The optional third argument also saves the full-size PNG for review.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

(async () => {
  const [tlPath, out, png] = process.argv.slice(2);
  if (!tlPath || !out) { console.error('usage: node make_cover.js <timeline.json> <cover.jpg> [also.png]'); process.exit(2); }
  const src = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  const tl = { ...src, duration: 1, shots: [{ id: 'cover', start: 0, end: 1 }], captions: [], cues: { ...(src.cues || {}), sub_in: 1e9, sub_tap: 1e9 } };
  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }),
    args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none',
      ...(process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : []), ...(process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : [])],
  });
  const page = await browser.newPage({ viewport: { width: tl.width || 1920, height: tl.height || 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  await page.addInitScript({ content: 'window.TL = ' + JSON.stringify(tl) + ';' });
  const physPath = path.join(path.dirname(path.resolve(tlPath)), 'physics.json');
  if (fs.existsSync(physPath)) await page.addInitScript({ content: 'window.PHYS = ' + fs.readFileSync(physPath, 'utf8') + ';' });
  await page.goto('file://' + path.resolve(__dirname, 'web/scene.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
  const has = await page.evaluate(() => typeof SC.cover === 'function');
  if (!has) { console.error('no SC.cover in web/: write the thumbnail shot first'); await browser.close(); process.exit(1); }
  let q = 0.92, buf;
  do {
    const r = await page.evaluate((q) => {
      window.renderFrame(0);
      const c = document.createElement('canvas'); c.width = 1280; c.height = 720;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(document.getElementById('c'), 0, 0, 1280, 720);
      return { jpg: c.toDataURL('image/jpeg', q).split(',')[1], png: document.getElementById('c').toDataURL('image/png').split(',')[1] };
    }, q);
    buf = Buffer.from(r.jpg, 'base64');
    if (png) fs.writeFileSync(png, Buffer.from(r.png, 'base64'));
    q -= 0.06;
  } while (buf.length > 1.9e6 && q > 0.5);
  fs.writeFileSync(out, buf);
  await browser.close();
  console.log(`cover: ${out} (1280x720, ${(buf.length / 1024).toFixed(0)} KB)`);
})();
