// The campsite in the rain at night (clasped-thumbs, 3 Nov 2026): mosquito-bites' camp.js land under a storm sky, dimmed
// and wet, with a hanging lantern (the key light), a drowned campfire that smokes, puddles with rings, rain in two layers,
// lightning, and a hole in the clouds with a shaft of sun (`ctSun`). Loaded after camp.js, before scenes.js.
'use strict';

const CTW = { lantern: [70, 980], clouds: null };

function initCtWorld() {
  // cloud masses for the sky: [x 0..1, y 0..1, r, speed, shade]
  const rng = mulberry32(4711);
  CTW.clouds = [];
  for (let i = 0; i < 26; i++) CTW.clouds.push([rng(), rng() * 0.62, 150 + rng() * 260, 0.4 + rng() * 0.8, rng()]);
}

// the sky: storm clouds; flash 0..1 lights them from inside; sun 0..1 opens a hole at (CTW.sunX) with warm light
function ctSky(cam, t, o = {}) {
  const flash = o.flash || 0, sun = o.sun || 0;
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixH('#070A16', '#3A4A78', flash * 0.6)); g.addColorStop(0.45, mixH('#121A34', '#4A5C90', flash * 0.6));
  g.addColorStop(0.8, mixH('#1E2846', '#56689A', flash * 0.5)); g.addColorStop(1, '#1A2240');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the sun's hole: warm sky behind the clouds
  const SUNP = o.sunAt || toScreen(cam, 760, 300);
  if (sun > 0.01) {
    const p = SUNP;
    softDot(ctx, p[0], p[1], 700 * (0.4 + 0.6 * sun), '#FFC870', 0.75 * sun);
    softDot(ctx, p[0], p[1], 260 * (0.4 + 0.6 * sun), '#FFF1C8', 0.9 * sun);
    softDot(gctx, p[0], p[1], 300 * sun, '#FFD890', 0.6 * sun);
  }
  // cloud masses drift (loopW keeps them where they started on the last frame)
  const w = loopW(0.012);
  for (const [x0, y0, r, sp, sh] of CTW.clouds) {
    let x = ((x0 * 1700 + t * w * 1700 * sp / (Math.PI * 2) * 6.283 - cam.x * 0.08) % 1700 + 1700) % 1700 - 310;
    const y = y0 * 900 - (cam.y - 960) * 0.05 + 40;
    let part = 0;
    if (sun > 0.01) { const p = SUNP, d = Math.hypot(x - p[0], y - p[1]); part = sun * clamp(1 - d / 760); x += Math.sign(x - p[0] || 1) * 320 * part; }
    const col = mixH(mixH('#1A2238', '#2C3858', sh), '#8C9CC8', flash * 0.7);
    softDot(ctx, x, y, r * 1.5, col, 0.85);
    softDot(ctx, x + r * 0.3, y - r * 0.2, r, mixH(col, '#3C4A70', 0.4 + 0.4 * flash), 0.6);
    if (part > 0.05) softDot(ctx, x - Math.sign(x - SUNP[0]) * r * 0.5, y, r * 0.8, '#FFB86A', 0.35 * part);
  }
}

// the land: camp.js's painting, darker and bluer (rain), the tent's glow, the string of bulbs mostly out
function ctBack(cam, t, o = {}) {
  const soft = o.soft || 0, flash = o.flash || 0, sun = o.sun || 0;
  ctSky(cam, t, o);
  applyCam(cam);
  if (soft < 0.999) ctx.drawImage(CAMP.bg, CAMP.X0, CAMP.Y0);
  if (soft > 0.001) { ctx.globalAlpha = clamp(soft); ctx.drawImage(CAMP.soft, CAMP.X0, CAMP.Y0); ctx.globalAlpha = 1; }
  // rain and night over the land: a cold veil, lifted by the flash and warmed by the sun
  ctx.save(); ctx.globalAlpha = 0.42 * (1 - 0.6 * flash) * (1 - 0.55 * sun);
  ctx.fillStyle = '#0A1430'; ctx.fillRect(CAMP.X0, CAMP.Y0, CAMP.BW, CAMP.BH); ctx.restore();
  if (sun > 0.01) { ctx.save(); ctx.globalAlpha = 0.16 * sun; ctx.fillStyle = '#FFB060'; ctx.fillRect(CAMP.X0, CAMP.Y0, CAMP.BW, CAMP.BH); ctx.restore(); }
  // the tent glows from inside
  softDot(gctx, 150, CAMP.GY - 90, 150, '#FFB060', 0.32 + 0.04 * Math.sin(t * loopW(2.1)));
  softDot(ctx, 150, CAMP.GY - 90, 260, '#FF9A40', 0.12);
  // a few bulbs of the string still on
  for (let i = 1; i < 14; i += 3) {
    const [x, y] = campBulb(i / 14), col = ['#FFD98A', '#FF9A6E', '#9FE8FF', '#FFC0D8'][i % 4];
    softDot(ctx, x, y + 12, 26 + 46 * soft, col, 0.5 - 0.25 * soft);
    softDot(gctx, x, y + 12, 40 + 30 * soft, col, 0.32);
  }
  // wet ground: a sheen and puddles
  ctx.save(); ctx.translate(540, CAMP.GY + 70); ctx.scale(1, 0.16);
  softDot(ctx, 0, 0, 900, '#5A6CA0', 0.18 + 0.3 * flash); ctx.restore();
  for (const [px, pw] of [[-120, 220], [760, 260], [1180, 180]]) {
    ellipse(ctx, px, CAMP.GY + 90, pw, 26, mixH('#24345E', '#9CB0E8', 0.6 * flash + 0.3 * sun));
    ellipse(ctx, px - pw * 0.2, CAMP.GY + 86, pw * 0.5, 9, rgba('#8FA4D8', 0.35));
    for (let k = 0; k < 3; k++) {
      const u = (((t * loopW(1.3)) / (Math.PI * 2) * 1.3 + hash(px + k * 7.7)) % 1 + 1) % 1, rx = px + (hash(px * 3 + k) - 0.5) * pw;
      ctx.beginPath(); ctx.ellipse(rx, CAMP.GY + 90, 6 + 46 * u, 2 + 9 * u, 0, 0, Math.PI * 2);
      ctx.lineWidth = 2.5; ctx.strokeStyle = rgba('#C8D8FF', 0.55 * (1 - u)); ctx.stroke();
    }
  }
}

// the drowned campfire: wet logs and a thin smoke
function ctDeadFire(t) {
  const x = CAMP.FX, y = CAMP.GY + 44, c = ctx;
  for (let i = 0; i < 9; i++) { const a = Math.PI * (i / 8), sx = x - Math.cos(a) * 104, sy = y + 8 + Math.sin(a) * 26; ellipse(c, sx, sy, 24, 17, i % 2 ? '#3A4060' : '#2E344E'); }
  for (const [a, col] of [[-0.42, '#2E2018'], [0.42, '#3A2618'], [0, '#281A12']]) {
    c.save(); c.translate(x, y - 8); c.rotate(a); rrect(c, -92, -16, 184, 32, 14); c.fillStyle = col; c.fill(); c.restore();
  }
  for (let i = 0; i < 7; i++) {
    const u = (((t * 0.22 + i / 7) % 1) + 1) % 1, sx = x + 30 * Math.sin(u * 5 + i) + 20 * u, sy = y - 30 - 360 * u;
    softDot(c, sx, sy, 30 + 70 * u, '#8A94B0', 0.22 * (1 - u) * clamp(u * 6));
  }
}

// the lantern on its pole: the scene's key light (world coords)
function ctLantern(t, sun = 0) {
  const [x, y] = CTW.lantern, sw = 0.05 * Math.sin(t * loopW(1.7));
  line(ctx, x - 40, CAMP.GY + 60, x - 40, y - 150, 14, '#2A1E16');
  line(ctx, x - 40, y - 150, x + 10, y - 150, 10, '#2A1E16');
  ctx.save(); ctx.translate(x + 10, y - 150); ctx.rotate(sw);
  line(ctx, 0, 0, 0, 40, 3, '#151018');
  rrect(ctx, -26, 40, 52, 70, 10); ctx.fillStyle = '#20161A'; ctx.fill();
  rrect(ctx, -19, 48, 38, 54, 8); ctx.fillStyle = '#FFD27A'; ctx.fill();
  rrect(ctx, -30, 34, 60, 12, 5); ctx.fillStyle = '#20161A'; ctx.fill();
  ctx.restore();
  const lx = x + 10 + Math.sin(sw) * -75, ly = y - 75;
  softDot(ctx, lx, ly, 380, '#FFA850', 0.2 * (1 - 0.5 * sun));
  softDot(gctx, lx, ly, 120, '#FFD080', 0.85);
  softDot(gctx, lx, ly, 300, '#FF9A40', 0.3);
}

// rain in screen space: amount 0..1, layer 0 back (fine), 1 front (big, few). Off when amount is 0.
function ctRain(t, amount, layer) {
  if (amount <= 0.01) return;
  drawRain(t, amount, layer);
}
// a shaft of sun from the hole in the clouds onto him (screen space, from a world point)
function ctSunShaft(cam, sun, to, from) {
  if (sun <= 0.01) return;
  const a = from || toScreen(cam, 760, 300), b = toScreen(cam, to[0], to[1]);
  screenSpace();
  for (const [w, al] of [[300, 0.12], [170, 0.16], [80, 0.2]]) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, ww = w * sun;
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, rgba('#FFE6A8', al * sun)); g.addColorStop(1, rgba('#FFE6A8', al * 0.4 * sun));
    ctx.beginPath(); ctx.moveTo(a[0] + nx * ww * 0.3, a[1] + ny * ww * 0.3); ctx.lineTo(b[0] + nx * ww, b[1] + ny * ww);
    ctx.lineTo(b[0] - nx * ww, b[1] - ny * ww); ctx.lineTo(a[0] - nx * ww * 0.3, a[1] - ny * ww * 0.3); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
  }
  softDot(gctx, b[0], b[1] - 60, 260 * sun, '#FFD890', 0.35 * sun);
}
