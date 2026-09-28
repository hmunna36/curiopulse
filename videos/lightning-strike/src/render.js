// Render frames of web/scene.html with headless Chromium.
// Usage: node render.js <timeline.json> <out_dir> [frames e.g. "0-299" or "0,12,40"]
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');

function parseFrames(spec, total) {
  if (!spec) return [...Array(total).keys()];
  const out = [];
  for (const part of spec.split(',')) {
    const m = part.split('-').map(Number);
    if (m.length === 2) for (let i = m[0]; i <= m[1]; i++) out.push(i);
    else out.push(m[0]);
  }
  return out;
}

(async () => {
  const [tlPath, outDir, spec] = process.argv.slice(2);
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const frames = parseFrames(spec, Math.round(tl.duration * tl.fps));
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exitCode = 1; });
  await page.addInitScript({ content: 'window.TL = ' + JSON.stringify(tl) + ';' });
  await page.goto('file://' + path.resolve(__dirname, 'web/scene.html'));
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const t0 = Date.now();
  for (const f of frames) {
    const b64 = await page.evaluate((f) => {
      window.renderFrame(f);
      return document.getElementById('c').toDataURL('image/png').split(',')[1];
    }, f);
    fs.writeFileSync(path.join(outDir, `f_${String(f).padStart(4, '0')}.png`), Buffer.from(b64, 'base64'));
  }
  console.log(`rendered ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close();
})();
