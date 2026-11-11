// Your Phone's GPS Needs EINSTEIN: the worlds and the props (12 Nov 2026).
//  - a mountain lake at dusk (screen-space backdrop: sky with the first stars and a satellite glinting, three ranges with
//    alpenglow on the snow, the lake mirroring them) and its near shore: the trail, rocks, a signpost, a lantern post, the
//    wooden jetty seen side-on (gpLakeBack, gpShore, gpJetty);
//  - orbit: a star field with the Milky Way, the Earth with oceans, continents, clouds, a night side with city lights and a
//    glowing rim, gravity as rings hugging it (gpStars, gpEarth, gpGravRings);
//  - the GPS satellite (gold foil, two solar wings, the antenna array, a big clock on its side) and the 1977 test
//    satellite (a silver drum with paddles, a FIX toggle switch with a lamp, a sticky note) (gpSat, gpOldSat);
//  - clocks that tick, whirl or droop (gpClock), the wristwatch (gpWatch), the phone with the map app (gpPhone), the bubble
//    helmet, label pills (gpTag) and the day counter (gpCounter).
'use strict';

const GP = {
  skyTop: '#16194A', sky2: '#3B2F7E', sky3: '#B04F8C', sky4: '#FF8656', skyLow: '#FFC488',
  water0: '#E98A78', water1: '#5E4E94', water2: '#1E2350',
  mtnFar: '#7B6BB0', mtnFarSh: '#5D4F95', snow: '#FFD3C8', snowSh: '#C9A6D8',
  mtnMid: '#3C3672', forest: '#1B2547', forestTip: '#26335E',
  rock: '#4A4560', rockHi: '#6E6488', ground: '#2E3550', groundHi: '#47507A', grass: '#2F5A3A', grassHi: '#4E8A4E',
  wood: '#8A5A36', woodSh: '#5E3A22', woodHi: '#B47A4A',
  gold: '#E2B23E', goldSh: '#B8862A', goldHi: '#FFE38A', panel: '#1B2D6B', panelLine: '#4F78D8', panelFrame: '#C9D2E0',
  silver: '#C9CED9', silverSh: '#8C93A6', silverHi: '#F2F5FA',
};

// a far layer that moves by p times the camera (in the shot's own screen frame): cam0 is where it sits as drawn
function gpFar(cam, cam0, p) {
  const z = 1 + (cam.zoom / cam0.zoom - 1) * p;
  const dx = -(cam.x - cam0.x) * cam.zoom * p, dy = -(cam.y - cam0.y) * cam.zoom * p;
  const ox = W / 2 + dx + (cam.sx || 0) * p - (W / 2) * z, oy = H / 2 + dy + (cam.sy || 0) * p - (H / 2) * z;
  ctx.setTransform(z, 0, 0, z, ox, oy);
  gctx.setTransform(z / 2, 0, 0, z / 2, ox / 2, oy / 2);
}

// ================================================================ the lake at dusk: painted once
let GP_MTN = null, GP_STARS = null, GP_EARTH = null, GP_MW = null;
function gpRidge(rnd, w, base, amp, step, rough) {
  const pts = [];
  let y = base - amp * 0.5, v = 0;
  for (let x = -step; x <= w + step; x += step) {
    v += (rnd() - 0.5) * rough; v *= 0.86;
    y = base - amp * (0.5 + 0.35 * Math.sin(x * 0.0042 + 1.3) + 0.25 * Math.sin(x * 0.011 + 0.4)) + v * amp;
    pts.push([x, y]);
  }
  return pts;
}
function gpPaintMountains() {
  const w = 2400, h = 820, cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(77);
  // the far range: tall peaks, lit pink on the right faces, snow above a ragged line
  const far = [];
  for (let px = -60; px <= w + 60; px += 18) {
    const k = px / w;
    const peak = 330 + 210 * Math.pow(Math.abs(Math.sin(k * 7.3 + 0.6)), 1.6) + 70 * Math.sin(k * 23 + 2) + 24 * (rnd() - 0.5);
    far.push([px, h - peak]);
  }
  const fill = (pts, col) => { x.beginPath(); x.moveTo(pts[0][0], h + 5); for (const p of pts) x.lineTo(p[0], p[1]); x.lineTo(pts[pts.length - 1][0], h + 5); x.closePath(); x.fillStyle = col; x.fill(); };
  const g = x.createLinearGradient(0, 200, 0, h);
  g.addColorStop(0, GP.mtnFar); g.addColorStop(1, '#4E4488');
  fill(far, g);
  // lit faces: from each peak down-right a lighter wedge (the alpenglow side, the sun set on the right)
  for (let i = 1; i < far.length - 1; i++) {
    const [a, b, c2] = [far[i - 1], far[i], far[i + 1]];
    if (b[1] < a[1] && b[1] < c2[1] && b[1] < h - 380) {
      x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(b[0] + 120, b[1] + 230); x.lineTo(b[0] + 30, b[1] + 260); x.closePath();
      x.fillStyle = 'rgba(255,170,190,0.28)'; x.fill();
    }
  }
  // snow caps
  const tmp = mkCanvas(w, h), tx = tmp.getContext('2d');
  tx.beginPath(); tx.moveTo(far[0][0], h); for (const p of far) tx.lineTo(p[0], p[1]); tx.lineTo(far[far.length - 1][0], h); tx.closePath();
  tx.fillStyle = GP.snow; tx.fill();
  tx.globalCompositeOperation = 'destination-in';
  tx.beginPath(); tx.moveTo(0, 0);
  for (let px = 0; px <= w; px += 22) tx.lineTo(px, h - 470 + 40 * Math.sin(px * 0.031) + 30 * (rnd() - 0.5));
  tx.lineTo(w, 0); tx.closePath(); tx.fill();
  tx.globalCompositeOperation = 'source-atop';
  for (let px = 0; px <= w; px += 7) { tx.fillStyle = 'rgba(160,120,200,0.35)'; if (Math.sin(px * 0.013) > 0.2) tx.fillRect(px, 0, 4, h); }
  x.drawImage(tmp, 0, 0);
  // the mid range: darker, closer, a few forested shoulders
  const mid = gpRidge(rnd, w, h - 150, 260, 26, 0.5);
  fill(mid, GP.mtnMid);
  // the forest band at the shore: pine tips along a low ridge
  const fb = gpRidge(rnd, w, h - 40, 80, 30, 0.4);
  fill(fb, GP.forest);
  x.fillStyle = GP.forest;
  for (let px = 0; px < w; px += 9 + rnd() * 8) {
    const base = h - 40 - 80 * (0.5 + 0.35 * Math.sin(px * 0.0042 + 1.3) + 0.25 * Math.sin(px * 0.011 + 0.4)) + 30;
    const th = 40 + rnd() * 70, tw = 12 + rnd() * 10;
    x.beginPath(); x.moveTo(px, base - th); x.lineTo(px + tw, base + 10); x.lineTo(px - tw, base + 10); x.closePath(); x.fill();
  }
  x.fillStyle = GP.forest; x.fillRect(0, h - 40, w, 45);
  // a few lit cabin windows on the far shore
  for (const [px, py] of [[1520, h - 30], [1590, h - 26], [610, h - 34]]) { x.fillStyle = '#FFD27A'; x.fillRect(px, py, 9, 7); }
  GP_MTN = cv;
}
function gpPaintStars() {
  const w = 1400, h = 2400, cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(9);
  x.fillStyle = '#04051A'; x.fillRect(0, 0, w, h);
  // the Milky Way: a soft diagonal band of haze and dense small stars
  for (let i = 0; i < 260; i++) {
    const u = rnd(), cx = w * (0.1 + 0.9 * u), cy = h * (0.95 - 0.8 * u) + (rnd() - 0.5) * 380;
    const r = 60 + rnd() * 160;
    const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    const col = rnd() < 0.3 ? '120,90,200' : rnd() < 0.5 ? '70,110,220' : '200,170,230';
    gg.addColorStop(0, `rgba(${col},0.07)`); gg.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  }
  for (let i = 0; i < 2600; i++) {
    const u = rnd(), band = rnd() < 0.55;
    const sx = band ? w * (0.1 + 0.9 * u) + (rnd() - 0.5) * 120 : rnd() * w;
    const sy = band ? h * (0.95 - 0.8 * u) + (rnd() - 0.5) * 420 * rnd() : rnd() * h;
    const r = rnd() < 0.03 ? 2.2 : rnd() < 0.2 ? 1.4 : 0.8;
    x.fillStyle = rnd() < 0.15 ? '#FFE2B8' : rnd() < 0.3 ? '#BFD4FF' : '#FFFFFF';
    x.globalAlpha = 0.45 + 0.55 * rnd(); x.beginPath(); x.arc(sx, sy, r, 0, Math.PI * 2); x.fill();
  }
  x.globalAlpha = 1;
  GP_STARS = cv;
}
// the Earth's surface as a flat map (wraps in x): ocean, continents from noise, deserts and forests, clouds; and its lights
function gpPaintEarth() {
  const w = 1536, h = 768;
  const cv = mkCanvas(w, h), x = cv.getContext('2d');
  const lights = mkCanvas(w, h), lx = lights.getContext('2d');
  const img = x.createImageData(w, h), d = img.data;
  const L = lx.createImageData(w, h), ld = L.data;
  const n2 = (u, v) => (typeof sn2 === 'function' ? sn2(u, v) : Math.sin(u * 1.7 + Math.cos(v * 1.3)) * Math.cos(v * 1.1 + Math.sin(u * 0.9)));
  for (let j = 0; j < h; j++) {
    const lat = (j / h - 0.5) * Math.PI;
    for (let i = 0; i < w; i++) {
      const lon = (i / w) * Math.PI * 2;
      const u = Math.cos(lon) * 1.6, v = Math.sin(lon) * 1.6, ww = lat * 2.2;
      let e = 0.55 * n2(u + 3.1 * ww * 0.3, v + ww) + 0.3 * n2(u * 2.3 + 7, v * 2.3 - ww * 1.7) + 0.15 * n2(u * 5.1 - 2, v * 5.1 + ww * 3);
      e += 0.12 - 0.25 * Math.abs(lat) * 0.4;
      const k = (j * w + i) * 4;
      const ice = Math.abs(lat) > 1.33;
      if (ice) { d[k] = 236; d[k + 1] = 244; d[k + 2] = 255; }
      else if (e > 0.18) {
        const dry = 0.5 + 0.5 * n2(u * 1.2 + 11, v * 1.2 - 3) - 0.6 * Math.abs(Math.abs(lat) - 0.4);
        const hi = clamp((e - 0.18) * 2.2);
        const r0 = lerp(58, 196, clamp(dry)), g0 = lerp(128, 160, clamp(dry)), b0 = lerp(62, 98, clamp(dry));
        d[k] = r0 + 30 * hi; d[k + 1] = g0 + 18 * hi; d[k + 2] = b0 + 10 * hi;
        // the lights of towns on land (seen only on the night side)
        const hh = hash(i * 0.7313 + j * 1.9177 + 0.123 * i * j * 1e-3), cl = 0.5 + 0.5 * n2(u * 4.1 + 2, v * 4.1 - ww * 2);
        if (hh < 0.05 * cl * cl && e > 0.22 && Math.abs(lat) < 1.05) { ld[k] = 255; ld[k + 1] = 214; ld[k + 2] = 130; ld[k + 3] = 255; }
      } else {
        const deep = clamp((0.18 - e) * 2.5);
        d[k] = lerp(48, 18, deep); d[k + 1] = lerp(150, 70, deep); d[k + 2] = lerp(214, 170, deep);
      }
      d[k + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  lx.putImageData(L, 0, 0);
  // clouds: soft swirls on top
  const rnd = mulberry32(5);
  for (let i = 0; i < 300; i++) {
    const cx = rnd() * w, cy = h * (0.12 + 0.76 * rnd()), r = 14 + rnd() * 54, al = 0.08 + 0.18 * rnd(), rot = (rnd() - 0.5) * 0.6;
    x.fillStyle = `rgba(255,255,255,${al})`;
    for (const ox of [-w, 0, w]) { x.beginPath(); x.ellipse(cx + ox, cy, r * 2.2, r * 0.7, rot, 0, Math.PI * 2); x.fill(); }
  }
  GP_EARTH = { cv, lights };
}
function gpWorldInit() { gpPaintMountains(); gpPaintStars(); gpPaintEarth(); }

// ---------------------------------------------------------------- the dusk backdrop (screen space)
// o: {hz (screen y of the far shore), dx (shift right), ms (mountain scale), satX, satY (the satellite's glint), satK,
//     beam: {x0, y0, k} (a dashed beam from the phone to the satellite), dark (0..1, deeper dusk)}
function gpLakeBack(t, o = {}) {
  screenSpace();
  const hz = o.hz != null ? o.hz : 1150, dx = o.dx || 0, ms = o.ms || 1;
  const g = ctx.createLinearGradient(0, hz - 1500, 0, hz);
  g.addColorStop(0, GP.skyTop); g.addColorStop(0.35, GP.sky2); g.addColorStop(0.66, GP.sky3); g.addColorStop(0.86, GP.sky4); g.addColorStop(1, GP.skyLow);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 2);
  if (hz - 1500 > 0) { ctx.fillStyle = GP.skyTop; ctx.fillRect(0, 0, W, hz - 1500); }
  // the first stars, high up, twinkling on loop-safe clocks
  const rnd = mulberry32(31);
  for (let i = 0; i < 90; i++) {
    const sx = ((rnd() * 1400 + dx * 0.2) % 1400) - 160, sy = hz - 700 - rnd() * 1300;
    if (sy < -10) continue;
    const a = clamp((hz - 650 - sy) / 500) * (0.55 + 0.45 * Math.sin(t * loopW(1 + rnd() * 2) + i * 3));
    const r = rnd() < 0.15 ? 2.6 : 1.5;
    circle(ctx, sx, sy, r, rgba('#FFFFFF', 0.85 * a));
  }
  // the afterglow of the sun, set behind the right-hand mountains
  softDot(ctx, 1000 + dx * 0.3, hz - 40, 520 * ms, '#FFB070', 0.55);
  softDot(gctx, 1000 + dx * 0.3, hz - 40, 300 * ms, '#FF9A50', 0.45);
  // the satellite: a moving bright point with a cross glint
  if (o.satX != null) {
    const k = o.satK != null ? o.satK : 1, sx = o.satX, sy = o.satY;
    circle(ctx, sx, sy, 4, rgba('#FFFFFF', k));
    softDot(gctx, sx, sy, 26 + 30 * (o.satFlash || 0), '#DDEBFF', 0.9 * k);
    const fl = 18 + 40 * (o.satFlash || 0);
    line(ctx, sx - fl, sy, sx + fl, sy, 2, rgba('#FFFFFF', 0.7 * k)); line(ctx, sx, sy - fl, sx, sy + fl, 2, rgba('#FFFFFF', 0.7 * k));
  }
  // the mountains: the painted image, its base on the far shore
  const iw = GP_MTN.width * ms * 0.62, ih = GP_MTN.height * ms * 0.62;
  const ix = 540 - iw / 2 + dx;
  ctx.drawImage(GP_MTN, ix, hz - ih + 2, iw, ih);
  // the lake: the sky's low colours deepening toward us, the mountains mirrored in rippled strips
  const lg = ctx.createLinearGradient(0, hz, 0, H + 200);
  lg.addColorStop(0, GP.water0); lg.addColorStop(0.25, GP.water1); lg.addColorStop(1, GP.water2);
  ctx.fillStyle = lg; ctx.fillRect(0, hz, W, H - hz + 10);
  const sh = Math.min(ih, H - hz);
  ctx.save(); ctx.globalAlpha = 0.42;
  for (let y = 0; y < sh; y += 6) {
    const wob = (2 + y * 0.02) * Math.sin(y * 0.09 + t * loopW(1.7));
    const syImg = GP_MTN.height - 1 - (y / ih) * GP_MTN.height;
    if (syImg < 0) break;
    ctx.drawImage(GP_MTN, 0, syImg, GP_MTN.width, Math.max(1, (6 / ih) * GP_MTN.height), ix + wob, hz + y, iw, 6);
  }
  ctx.restore();
  // a glitter path under the afterglow, and ripple lines
  for (let i = 0; i < 26; i++) {
    const yy = hz + 8 + i * i * 1.6, ww = 30 + i * 9;
    if (yy > H) break;
    const xx = 960 + dx * 0.3 - i * 6 + 20 * Math.sin(t * loopW(1.3) + i * 2.1);
    line(ctx, xx - ww / 2, yy, xx + ww / 2, yy, 2 + i * 0.12, rgba('#FFD9A0', 0.5 * (1 - i / 26)));
    if (i % 3 === 0) line(gctx, xx - ww / 3, yy, xx + ww / 3, yy, 3, rgba('#FFC080', 0.35 * (1 - i / 26)));
  }
  for (let i = 0; i < 14; i++) {
    const yy = hz + 30 + i * 52, x0 = ((i * 397) % 900) + 40 * Math.sin(t * loopW(0.6) + i);
    line(ctx, x0, yy, x0 + 120 + i * 8, yy, 2, rgba('#FFFFFF', 0.08));
  }
  // the beam from his phone up to the satellite (drawn on in k)
  if (o.beam && o.beam.k > 0.01 && o.satX != null) {
    const b = o.beam, ex = lerp(b.x0, o.satX, clamp(b.k)), ey = lerp(b.y0, o.satY, clamp(b.k));
    ctx.save(); ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 120; ctx.lineWidth = 6; ctx.strokeStyle = rgba('#8FE3FF', 0.9);
    ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore();
    gctx.save(); gctx.setLineDash([16, 14]); gctx.lineDashOffset = -t * 120; gctx.lineWidth = 10; gctx.strokeStyle = rgba('#5FC8FF', 0.8);
    gctx.beginPath(); gctx.moveTo(b.x0, b.y0); gctx.lineTo(ex, ey); gctx.stroke(); gctx.restore();
  }
}

// ---------------------------------------------------------------- the near shore (world space)
// the trail along the shore: ground from y0 down, rocks, grass tufts, a signpost and a lantern post. o: {sign, lantern: [x, y]}
function gpShore(c, x0, x1, y0, t, o = {}) {
  c.fillStyle = GP.ground; c.beginPath(); c.moveTo(x0, y0 + 20);
  for (let x = x0; x <= x1; x += 40) c.lineTo(x, y0 + 14 * Math.sin(x * 0.013) + 8 * Math.sin(x * 0.041));
  c.lineTo(x1, y0 + 900); c.lineTo(x0, y0 + 900); c.closePath(); c.fill();
  // the trail itself: a lighter worn band
  c.fillStyle = GP.groundHi; c.beginPath(); c.moveTo(x0, y0 + 70);
  for (let x = x0; x <= x1; x += 40) c.lineTo(x, y0 + 60 + 10 * Math.sin(x * 0.009));
  for (let x = x1; x >= x0; x -= 40) c.lineTo(x, y0 + 150 + 12 * Math.sin(x * 0.011 + 1));
  c.closePath(); c.fill();
  const rnd = mulberry32(13);
  for (let i = 0; i < 9; i++) {
    const rx = x0 + rnd() * (x1 - x0), ry = y0 + 10 + rnd() * 200, rr = 22 + rnd() * 40;
    ellipse(c, rx, ry, rr, rr * 0.62, GP.rock);
    ellipse(c, rx - rr * 0.2, ry - rr * 0.22, rr * 0.55, rr * 0.3, GP.rockHi);
  }
  for (let i = 0; i < 26; i++) {
    const gx = x0 + rnd() * (x1 - x0), gy = y0 + rnd() * 220;
    for (let j = -2; j <= 2; j++) line(c, gx, gy, gx + j * 9 + 3 * Math.sin(t * loopW(1.2) + i), gy - 34 - 8 * Math.abs(j % 2), 5, j % 2 ? GP.grassHi : GP.grass);
  }
  if (o.sign) {
    const [sx, sy] = o.sign;
    rrect(c, sx - 9, sy - 210, 18, 210, 4); c.fillStyle = GP.woodSh; c.fill();
    c.save(); c.translate(sx + 6, sy - 175); c.rotate(-0.06);
    rrect(c, -10, -34, 190, 64, 8); c.fillStyle = GP.wood; c.fill();
    c.beginPath(); c.moveTo(180, -34); c.lineTo(214, -2); c.lineTo(180, 30); c.closePath(); c.fill();
    paint(() => { c.font = '900 30px Montserrat'; c.fillStyle = '#FFE9C8'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('LAKE TRAIL', 4, 0); });
    c.restore();
  }
  if (o.lantern) gpLantern(c, o.lantern[0], o.lantern[1], 1, t);
}
// a lantern on a post (a practical light: it blooms)
function gpLantern(c, x, y, s, t) {
  rrect(c, x - 8 * s, y - 260 * s, 16 * s, 260 * s, 4 * s); c.fillStyle = GP.woodSh; c.fill();
  line(c, x, y - 255 * s, x + 46 * s, y - 255 * s, 8 * s, GP.woodSh);
  const lx = x + 46 * s, ly = y - 210 * s, fl = 0.85 + 0.15 * Math.sin(t * loopW(9)) * Math.sin(t * loopW(5.3));
  line(c, lx, y - 255 * s, lx, ly - 40 * s, 3 * s, '#2A2A34');
  rrect(c, lx - 22 * s, ly - 40 * s, 44 * s, 70 * s, 8 * s); c.fillStyle = '#2A2A34'; c.fill();
  rrect(c, lx - 16 * s, ly - 32 * s, 32 * s, 54 * s, 6 * s); c.fillStyle = '#FFD27A'; c.fill();
  softDot(gctx, lx, ly - 5 * s, 120 * s, '#FFB050', 0.9 * fl);
  softDot(gctx, lx, ly - 5 * s, 40 * s, '#FFF2C0', 1);
  softDot(ctx, lx, ly - 5 * s, 200 * s, '#FFB060', 0.18 * fl);
}
// the wooden jetty, side-on: deck from x0 (the shore) to x1 (the end) at deck height y; posts down into the water
function gpJetty(c, x0, x1, y, t, o = {}) {
  // posts and their reflections
  for (let x = x0 + 60; x <= x1; x += 150) {
    rrect(c, x - 13, y + 10, 26, 220, 5); c.fillStyle = GP.woodSh; c.fill();
    rrect(c, x - 13, y + 230, 26, 120, 5); c.fillStyle = rgba(GP.woodSh, 0.35); c.fill();
  }
  // the fascia and the deck top
  rrect(c, x0, y - 6, x1 - x0, 36, 4); c.fillStyle = GP.woodSh; c.fill();
  rrect(c, x0, y - 18, x1 - x0, 18, 4); c.fillStyle = GP.wood; c.fill();
  for (let x = x0 + 30; x < x1; x += 46) line(c, x, y - 16, x, y - 2, 2, GP.woodSh);
  line(c, x0, y - 18, x1, y - 18, 3, GP.woodHi);
  // a mooring rope hanging between two posts
  c.save(); c.lineWidth = 5; c.strokeStyle = '#C9B48A'; c.beginPath(); c.moveTo(x1 - 300, y + 30); c.quadraticCurveTo(x1 - 225, y + 90, x1 - 150, y + 30); c.stroke(); c.restore();
  if (o.lantern !== false) gpLantern(c, o.lanternX != null ? o.lanternX : x1 - 20, y - 18, 0.9, t);
}

// ================================================================ orbit
// the star field (screen space), drifting a little with the camera
function gpStars(dx = 0, dy = 0) {
  screenSpace();
  const sx = ((-dx * 0.15) % 300) - 160, sy = ((-dy * 0.15) % 300) - 240;
  ctx.drawImage(GP_STARS, sx, sy);
}
// the Earth: centre (x, y), radius R; o: {rot (turns of the surface), sunA (the angle the sunlight comes from, radians,
//   0 = from the right), night (0..1 how deep the dark side is), lights (0..1)}
function gpEarth(c, x, y, R, t, o = {}) {
  const rot = o.rot || 0, sunA = o.sunA != null ? o.sunA : -2.4;
  // the atmosphere's glow first (behind)
  const ag = c.createRadialGradient(x, y, R * 0.985, x, y, R * 1.09);
  ag.addColorStop(0, 'rgba(95,184,255,0.6)'); ag.addColorStop(0.35, 'rgba(70,150,255,0.22)'); ag.addColorStop(1, 'rgba(60,130,255,0)');
  c.fillStyle = ag; c.beginPath(); c.arc(x, y, R * 1.09, 0, Math.PI * 2); c.fill();
  // (the glow layer gets only a thin rim: a filled disc there blooms the whole planet white)
  circle(c, x, y, R, '#1F6FC0');          // one opaque disc first: the light stage knows the shape
  c.save(); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.clip();
  // the surface map, scrolled (the planet turns) and stretched a little toward the limb
  const img = GP_EARTH.cv, mw = R * 3.4, mh = R * 2.1;
  const off = ((rot % 1) + 1) % 1 * mw;
  const cy0 = y - 0.65 * R;
  for (let k = -1; k <= 1; k++) c.drawImage(img, x - mw / 2 - off + k * mw, cy0 - mh / 2, mw, mh);
  // the sphere's shading: the lit side toward the Sun, the night side dark, and the lights of towns there
  const lx = x + Math.cos(sunA) * R * 0.9, ly = y + Math.sin(sunA) * R * 0.9;
  const night = o.night != null ? o.night : 0.85;
  const g = c.createLinearGradient(lx, ly, x - Math.cos(sunA) * R, y - Math.sin(sunA) * R);
  g.addColorStop(0, 'rgba(255,240,210,0.10)'); g.addColorStop(0.45, 'rgba(4,8,30,0)'); g.addColorStop(0.62, `rgba(4,8,30,${0.75 * night})`); g.addColorStop(1, `rgba(2,4,18,${0.92 * night})`);
  c.fillStyle = g; c.fillRect(x - R, y - R, 2 * R, 2 * R);
  if ((o.lights || 0) > 0.01) {
    // the lights of towns, only on the night side: drawn into the scratch canvas, masked by the night, added on
    const T = c.getTransform();
    tmpx.setTransform(1, 0, 0, 1, 0, 0); tmpx.clearRect(0, 0, W, H);
    tmpx.setTransform(T);
    for (let k = -1; k <= 1; k++) tmpx.drawImage(GP_EARTH.lights, x - mw / 2 - off + k * mw, cy0 - mh / 2, mw, mh);
    tmpx.globalCompositeOperation = 'destination-in';
    const m = tmpx.createLinearGradient(lx, ly, x - Math.cos(sunA) * R, y - Math.sin(sunA) * R);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.5, 'rgba(0,0,0,0)'); m.addColorStop(0.7, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,1)');
    tmpx.fillStyle = m; tmpx.fillRect(x - R * 1.2, y - R * 1.2, 2.4 * R, 2.4 * R);
    tmpx.globalCompositeOperation = 'source-over';
    tmpx.setTransform(1, 0, 0, 1, 0, 0);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = o.lights; c.drawImage(tmpC, 0, 0); c.restore();
  }
  // the limb: a thin bright blue edge
  const rg = c.createRadialGradient(x, y, R * 0.86, x, y, R);
  rg.addColorStop(0, 'rgba(120,200,255,0)'); rg.addColorStop(1, 'rgba(150,215,255,0.55)');
  c.fillStyle = rg; c.fillRect(x - R, y - R, 2 * R, 2 * R);
  c.restore();
  c.save(); c.lineWidth = Math.max(6, R * 0.012); c.strokeStyle = 'rgba(170,225,255,0.9)'; c.beginPath(); c.arc(x, y, R + 2, 0, Math.PI * 2); c.stroke(); c.restore();
  gctx.save(); gctx.lineWidth = Math.max(10, R * 0.016); gctx.strokeStyle = 'rgba(110,190,255,0.55)'; gctx.beginPath(); gctx.arc(x, y, R + 6, 0, Math.PI * 2); gctx.stroke(); gctx.restore();
}
// gravity as rings hugging the Earth: thick, bright and close together low down, thin and far apart high up; they flow inward
function gpGravRings(c, x, y, R, t, k = 1, o = {}) {
  if (k <= 0.01) return;
  const n = 9, flow = ((t * loopW(0.55)) % 1 + 1) % 1;
  for (let i = n - 1; i >= 0; i--) {
    const u = (i + 1 - flow) / n;                          // 0 at the surface .. 1 far out
    const rr = R + 30 + Math.pow(u, 1.8) * (o.reach || 900);
    const a = k * (1 - u) * (0.85 - 0.3 * u) * clamp(u * 6);
    c.save(); c.lineWidth = 3 + 20 * (1 - u) * (1 - u); c.strokeStyle = rgba('#6FA8FF', 0.55 * a);
    c.beginPath(); c.arc(x, y, rr, Math.PI * 1.02, Math.PI * 1.98); c.stroke(); c.restore();
    gctx.save(); gctx.lineWidth = 6 + 24 * (1 - u); gctx.strokeStyle = rgba('#3D7CFF', 0.5 * a);
    gctx.beginPath(); gctx.arc(x, y, rr, Math.PI * 1.02, Math.PI * 1.98); gctx.stroke(); gctx.restore();
  }
}

// ---------------------------------------------------------------- clocks
// an analog clock at (x, y), radius r. o: {time (seconds shown), whirl (0..1: hands blurred round), droop (0..1: hands
// sag like wet noodles), face ('white' | 'cream'), sweat, rim}
function gpClock(c, x, y, r, o = {}) {
  const tm = o.time || 0, droop = o.droop || 0, wh = o.whirl || 0;
  circle(c, x, y, r * 1.12, o.rim || '#2B2F45');
  circle(c, x, y, r * 1.03, o.rimHi || '#5B6384');
  paint(() => {
    circle(c, x, y, r, o.face === 'cream' ? '#FFF4DC' : '#F7F9FF');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, L = i % 3 === 0 ? 0.16 : 0.09;
      line(c, x + Math.sin(a) * r * (0.92 - L), y - Math.cos(a) * r * (0.92 - L), x + Math.sin(a) * r * 0.92, y - Math.cos(a) * r * 0.92, i % 3 === 0 ? r * 0.06 : r * 0.035, '#2A2E44');
    }
    // the hands: hour, minute, second; each a curve that sags toward the ground with droop
    const hand = (ang, len, w, col) => {
      const ex = x + Math.sin(ang) * len, ey = y - Math.cos(ang) * len;
      const mx = (x + ex) / 2, my = (y + ey) / 2 + droop * len * 0.55;
      const ex2 = lerp(ex, x + Math.sin(ang) * len * 0.7, droop * 0.6), ey2 = ey + droop * len * 0.85;
      c.save(); c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = col;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, ex2, ey2); c.stroke(); c.restore();
    };
    if (wh > 0.01) {          // the whirl: blurred discs where the hands sweep round
      c.save(); c.globalAlpha = 0.35 * wh; circle(c, x, y, r * 0.78, '#9AA6C8'); c.globalAlpha = 0.25 * wh; circle(c, x, y, r * 0.55, '#6A7598'); c.restore();
      for (let i = 0; i < 3; i++) {
        c.save(); c.lineWidth = r * 0.05; c.strokeStyle = rgba('#E8473C', 0.6 * wh); c.beginPath();
        c.arc(x, y, r * (0.68 - i * 0.07), tm * 9 + i, tm * 9 + i + 1.4); c.stroke(); c.restore();
      }
    }
    hand((tm / 43200) * Math.PI * 2 + 2.1, r * 0.48, r * 0.09, '#1E2236');
    hand((tm / 3600) * Math.PI * 2 + 0.4, r * 0.72, r * 0.06, '#1E2236');
    hand((tm / 60) * Math.PI * 2, r * 0.82, r * 0.025, '#E8473C');
    circle(c, x, y, r * 0.07, '#1E2236');
  });
  if (o.sweat) sweatDrop(c, x + r * 0.95, y - r * 0.6, r / 90, o.sweat);
}
// a wristwatch: strap along angle `ang`, face radius r
function gpWatch(c, x, y, r, ang, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang);
  rrect(c, -r * 0.62, -r * 2.1, r * 1.24, r * 4.2, r * 0.3); c.fillStyle = o.strap || '#3B2A22'; c.fill();
  for (let i = -3; i <= 3; i++) if (Math.abs(i) > 1) line(c, -r * 0.4, i * r * 0.5, r * 0.4, i * r * 0.5, 2, 'rgba(0,0,0,0.25)');
  c.restore();
  gpClock(c, x, y, r, Object.assign({ rim: '#5A5F70', rimHi: '#C7CCD8', face: 'cream' }, o));
}

// ---------------------------------------------------------------- the GPS satellite
// centre (x, y) of its body, scale s. o: {time (its clock), whirl, wing (0..1 how far the wings stand out), tilt}
function gpSat(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s);
  // the booms and the solar wings
  for (const sd of [-1, 1]) {
    line(c, sd * 130, 0, sd * 250, 0, 14, '#9AA2B6');
    c.save(); c.translate(sd * 250, 0);
    const pw = 430, ph = 170;
    rrect(c, sd > 0 ? 0 : -pw, -ph / 2, pw, ph, 6); c.fillStyle = GP.panelFrame; c.fill();
    rrect(c, sd > 0 ? 8 : -pw + 8, -ph / 2 + 8, pw - 16, ph - 16, 4); c.fillStyle = GP.panel; c.fill();
    paint(() => {
      for (let i = 1; i < 8; i++) { const xx = (sd > 0 ? 8 : -pw + 8) + i * (pw - 16) / 8; line(c, xx, -ph / 2 + 8, xx, ph / 2 - 8, 2, GP.panelLine); }
      line(c, sd > 0 ? 8 : -pw + 8, 0, sd > 0 ? pw - 8 : -8, 0, 2, GP.panelLine);
      // a sheen sliding along the cells
      const sh = ((t * loopW(0.25)) % 1) * pw;
      c.save(); c.globalAlpha = 0.18; c.fillStyle = '#9FC4FF'; c.fillRect(sd > 0 ? sh : -sh - 40, -ph / 2 + 8, 40, ph - 16); c.restore();
    });
    c.restore();
  }
  // the body: a box in crinkled gold foil
  rrect(c, -130, -110, 260, 220, 14); c.fillStyle = GP.gold; c.fill();
  paint(() => {
    const rnd = mulberry32(21);
    for (let i = 0; i < 16; i++) {
      const px = -120 + rnd() * 220, py = -100 + rnd() * 180;
      c.fillStyle = rnd() < 0.5 ? rgba(GP.goldSh, 0.55) : rgba(GP.goldHi, 0.5);
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + 30 + rnd() * 30, py + 6); c.lineTo(px + 18, py + 26 + rnd() * 20); c.closePath(); c.fill();
    }
    c.font = '900 30px Montserrat'; c.fillStyle = '#3A2A08'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GPS', 0, 82);
  });
  // the antenna array underneath (pointed at the Earth)
  rrect(c, -100, 110, 200, 30, 8); c.fillStyle = '#D9DDE6'; c.fill();
  for (let i = 0; i < 6; i++) { rrect(c, -88 + i * 33, 136, 22, 46, 8); c.fillStyle = '#F2F4F8'; c.fill(); }
  // the clock on its side
  gpClock(c, 0, -14, 78, { time: o.time || 0, whirl: o.whirl || 0, rim: '#2B2F45' });
  c.restore();
  // its light blinks
  const bl = Math.max(0, Math.sin(t * loopW(3.2)));
  softDot(gctx, x + 124 * s, y - 104 * s, 30 * s, '#FF5050', 0.9 * bl);
  circle(c, x + 124 * s, y - 104 * s, 7 * s, bl > 0.5 ? '#FF6060' : '#7A2A2A');
}
// the 1977 test satellite: a silver drum with gold bands, four short paddles, a mast; on its front the FIX switch box.
// o: {on (0..1 the lever up), lamp (0..1 red -> green), note (0..1 the sticky note in), time}
function gpOldSat(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // paddles (behind)
  for (const [ax, ay] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    c.save(); c.rotate(Math.atan2(ay, ax));
    line(c, 120, 0, 190, 0, 10, '#9AA2B6');
    rrect(c, 190, -46, 210, 92, 5); c.fillStyle = '#C9D2E0'; c.fill();
    rrect(c, 196, -40, 198, 80, 4); c.fillStyle = '#26326E'; c.fill();
    paint(() => { for (let i = 1; i < 5; i++) line(c, 196 + i * 39.6, -40, 196 + i * 39.6, 40, 2, '#5068C0'); });
    c.restore();
  }
  // the mast with its antenna
  line(c, 0, -170, 0, -330, 12, '#A7AEC0');
  ellipse(c, 0, -336, 46, 14, '#D9DDE6');
  // the drum: panels of silver with two gold bands
  rrect(c, -150, -175, 300, 350, 30); c.fillStyle = GP.silver; c.fill();
  paint(() => {
    for (let i = -2; i <= 2; i++) line(c, i * 55, -170, i * 55, 170, 4, rgba(GP.silverSh, 0.7));
    c.fillStyle = GP.gold; c.fillRect(-150, -120, 300, 26); c.fillRect(-150, 110, 300, 26);
    c.fillStyle = rgba(GP.silverHi, 0.6); c.fillRect(-130, -170, 26, 340);
  });
  // the switch box
  rrect(c, -95, -70, 190, 150, 14); c.fillStyle = '#4A505F'; c.fill();
  rrect(c, -85, -60, 170, 130, 10); c.fillStyle = '#5E6577'; c.fill();
  paint(() => {
    c.font = '900 34px Montserrat'; c.fillStyle = '#FFFFFF'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('FIX', -30, -32);
    c.font = '900 22px Montserrat';
    c.fillStyle = (o.on || 0) > 0.5 ? '#7DFFB0' : '#9AA0B0'; c.fillText('ON', 52, -36);
    c.fillStyle = (o.on || 0) > 0.5 ? '#9AA0B0' : '#FF8A8A'; c.fillText('OFF', 52, 50);
  });
  // the lamp
  const lamp = o.lamp || 0, lc = lamp > 0.5 ? '#3DFF8A' : '#FF3B3B';
  circle(c, -40, 30, 20, '#22252E'); circle(c, -40, 30, 15, lc);
  c.restore();
  softDot(gctx, x - 40 * s, y + 30 * s, 60 * s, lamp > 0.5 ? '#3DFF8A' : '#FF3B3B', 0.95);
  // the lever: a chunky toggle pivoting at the box's right half (down = OFF, up = ON)
  c.save(); c.translate(x + 40 * s, y + 8 * s); c.scale(s, s);
  const ang = lerp(0.95, -0.95, clamp(o.on || 0));
  c.rotate(ang);
  circle(c, 0, 0, 22, '#2B2F3A');
  rrect(c, -10, -78, 20, 80, 8); c.fillStyle = '#D8DCE6'; c.fill();
  circle(c, 0, -80, 18, '#E8473C');
  c.restore();
  // the sticky note
  const nk = clamp(o.note || 0);
  if (nk > 0.01) {
    c.save(); c.translate(x + 150 * s, y - 160 * s); c.rotate(0.12); const sc = E.outBack(nk) * s; c.scale(sc, sc);
    paint(() => {
      rrect(c, -110, -80, 220, 160, 4); c.fillStyle = '#FFE45C'; c.fill();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-110, 64, 220, 16);
      c.font = '900 30px Montserrat'; c.fillStyle = '#2A2010'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('IN CASE', 0, -42); c.fillText('EINSTEIN\'S', 0, -4); c.fillText('WRONG', 0, 34);
    });
    c.restore();
  }
}

// ---------------------------------------------------------------- the phone and the map app
// upright, centred at (x, y), height h. o: {dot: [u, v] the blue dot (0..1 of the screen), drift (0..1 the dot sliding off
// over the lake), err (0..1 the error ring and the 10 KM label), pulse (t), sat (0..1 the satellite icon lit)}
function gpPhone(c, x, y, h, t, o = {}) {
  const w = h * 0.49;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  rrect(c, -w / 2, -h / 2, w, h, w * 0.17); c.fillStyle = '#1C1F2B'; c.fill();
  const ix = -w / 2 + w * 0.06, iy = -h / 2 + w * 0.06, iw = w * 0.88, ih = h - w * 0.12;
  paint(() => gpMapFace(c, ix, iy, iw, ih, t, o));
  c.restore();
  softDot(gctx, x, y, h * 0.55, '#CFE8FF', 0.18);   // the screen's light
}
// the map itself in a box (also used big, on its own): land, the lake, the trail, the dot
function gpMapFace(c, ix, iy, iw, ih, t, o = {}) {
  c.save();
  rrect(c, ix, iy, iw, ih, iw * 0.12); c.fillStyle = '#E7EEDB'; c.fill();
  rrect(c, ix, iy, iw, ih, iw * 0.12); c.clip();
  const X = (u) => ix + u * iw, Y = (v) => iy + v * ih;
  // forest patches
  for (const [u, v, r] of [[0.15, 0.25, 0.16], [0.82, 0.72, 0.2], [0.2, 0.86, 0.14]]) ellipse(c, X(u), Y(v), r * iw, r * iw * 0.8, '#C7DDB0');
  // the lake (blue), with its name
  c.fillStyle = '#86C3EF'; c.beginPath();
  c.moveTo(X(0.45), Y(0.18)); c.bezierCurveTo(X(0.95), Y(0.1), X(1.05), Y(0.45), X(0.8), Y(0.58));
  c.bezierCurveTo(X(0.62), Y(0.68), X(0.5), Y(0.5), X(0.42), Y(0.42)); c.bezierCurveTo(X(0.34), Y(0.32), X(0.3), Y(0.2), X(0.45), Y(0.18)); c.fill();
  // the trail: dashed
  c.save(); c.setLineDash([iw * 0.04, iw * 0.03]); c.lineWidth = iw * 0.025; c.strokeStyle = '#B07A4A';
  c.beginPath(); c.moveTo(X(0.05), Y(0.95)); c.bezierCurveTo(X(0.3), Y(0.75), X(0.2), Y(0.6), X(0.36), Y(0.5)); c.stroke(); c.restore();
  // a road
  line(c, X(-0.1), Y(0.66), X(1.1), Y(0.98), iw * 0.04, '#FFFFFF');
  // the blue dot: where you are (or where the map THINKS you are)
  const dr = clamp(o.drift || 0);
  const du = lerp(o.dot ? o.dot[0] : 0.34, 0.74, E.inOutCubic(dr)), dv = lerp(o.dot ? o.dot[1] : 0.52, 0.3, E.inOutCubic(dr));
  const ring = ((o.pulse != null ? o.pulse : t) * 1.2) % 1;
  circle(c, X(du), Y(dv), iw * (0.08 + 0.12 * ring), rgba('#2F7BFF', 0.3 * (1 - ring)));
  circle(c, X(du), Y(dv), iw * 0.075, '#FFFFFF');
  circle(c, X(du), Y(dv), iw * 0.055, '#2F7BFF');
  // the error: a dashed arrow from where you really are to the dot, with 10 KM
  const ek = clamp(o.err || 0);
  if (ek > 0.01) {
    const u0 = o.dot ? o.dot[0] : 0.34, v0 = o.dot ? o.dot[1] : 0.52;
    circle(c, X(u0), Y(v0), iw * 0.035, '#E8473C');
    c.save(); c.setLineDash([iw * 0.03, iw * 0.025]); c.lineWidth = iw * 0.018; c.strokeStyle = rgba('#E8473C', ek);
    c.beginPath(); c.moveTo(X(u0), Y(v0)); c.lineTo(X(du), Y(dv)); c.stroke(); c.restore();
    c.save(); c.globalAlpha = ek; c.font = `900 ${Math.round(iw * 0.12)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const tx = X((u0 + du) / 2) - iw * 0.02, ty = Y((v0 + dv) / 2) + ih * 0.06;
    c.lineWidth = iw * 0.03; c.strokeStyle = '#FFFFFF'; c.strokeText('10 KM', tx, ty); c.fillStyle = '#E8473C'; c.fillText('10 KM', tx, ty); c.restore();
  }
  // the top bar: the satellite icon with its waves
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(ix, iy, iw, ih * 0.09);
  const sk = o.sat != null ? o.sat : 1;
  const sx = X(0.82), sy = Y(0.045), ss = iw * 0.05;
  rrect(c, sx - ss * 0.5, sy - ss * 0.5, ss, ss, 2); c.fillStyle = sk > 0.5 ? '#2F7BFF' : '#8A93A8'; c.fill();
  line(c, sx - ss * 1.4, sy, sx + ss * 1.4, sy, ss * 0.35, sk > 0.5 ? '#2F7BFF' : '#8A93A8');
  c.font = `900 ${Math.round(iw * 0.075)}px Montserrat`; c.fillStyle = '#2A2E44'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('GPS', X(0.06), sy);
  c.restore();
}

// ---------------------------------------------------------------- him: palettes, helmet, label pills
const GPWET = Object.assign({}, PAL, { hair: '#3A2516' });                 // wet hair: darker
const GPEIN = Object.assign({}, PAL, { hair: '#F1F1F4', hairHi: '#FFFFFF' }); // the Einstein poof: white
// in head units round his head: fn(c)
function gpOnHead(c, st, r, fn) {
  const hp = toWorld(st, r.head);
  c.save(); c.translate(hp[0] + (st.headDX || 0) * st.s, hp[1] + (st.headDY || 0) * st.s); c.rotate(r.lean + (st.headRot || 0)); c.scale(st.s, st.s);
  fn(c); c.restore();
}
// a bubble helmet (glass) round his head, with a collar ring; drops floating inside when wet
function gpHelmet(c, st, r, t, o = {}) {
  gpOnHead(c, st, r, (x) => {
    ellipse(x, 0, 96, 92, 22, '#8C93A6');               // the collar
    ellipse(x, 0, 92, 86, 14, '#C9CED9');
    paint(() => {
      x.save(); x.globalAlpha = 0.16; circle(x, 0, -8, 112, '#BFE3FF'); x.restore();
      x.save(); x.lineWidth = 7; x.strokeStyle = 'rgba(220,240,255,0.85)'; x.beginPath(); x.arc(0, -8, 112, 0, Math.PI * 2); x.stroke(); x.restore();
      x.save(); x.lineWidth = 10; x.lineCap = 'round'; x.strokeStyle = 'rgba(255,255,255,0.75)'; x.beginPath(); x.arc(0, -8, 92, -2.6, -2.0); x.stroke(); x.restore();
      circle(x, 52, -66, 9, 'rgba(255,255,255,0.8)');
      if (o.drops) {
        for (let i = 0; i < 7; i++) {
          const a = i * 2.4 + t * loopW(0.4) * (i % 2 ? 1 : -1), rr = 70 + 18 * Math.sin(i * 1.7 + t * loopW(0.6));
          const dx = Math.cos(a) * rr, dy = -8 + Math.sin(a) * rr * 0.9;
          circle(x, dx, dy, 6 + (i % 3) * 2, 'rgba(150,215,255,0.9)'); circle(x, dx - 2, dy - 2, 2.5, '#FFFFFF');
        }
      }
    });
  });
  const hp = toWorld(st, r.head);
  softDot(gctx, hp[0] - 50 * st.s, hp[1] - 70 * st.s, 40 * st.s, '#FFFFFF', 0.35);
}
// the Einstein poof (head units): a cloud of white fluff round his head and a bushy white moustache; k 0..1 grows it
function gpEinsteinHair(c, st, r, k, t) {
  if (k <= 0.01) return;
  gpOnHead(c, st, r, (x) => {
    const g = Math.max(0, k);
    const rnd = mulberry32(17);
    const puffs = [];
    for (let i = 0; i < 15; i++) {
      const a = -Math.PI * (0.02 + 0.96 * (i / 14)) + (rnd() - 0.5) * 0.15;
      const rr = 62 + 22 * rnd() + 26 * g;
      puffs.push([Math.cos(a) * rr * 1.08, -14 + Math.sin(a) * rr * 0.98, (20 + 14 * rnd()) * (0.5 + 0.6 * g)]);
    }
    for (const sd of [-1, 1]) puffs.push([sd * (78 + 18 * g), 18, 22 * (0.5 + 0.6 * g)], [sd * (70 + 12 * g), 44, 16 * (0.5 + 0.6 * g)]);
    for (const [px, py, pr] of puffs) circle(x, px, py, pr + 4, '#CFCFD8');
    for (const [px, py, pr] of puffs) circle(x, px - 2, py - 3, pr, '#F4F4F8');
    // the moustache, under the nose
    x.save(); x.translate(0, 26); x.scale(g, g);
    ellipse(x, -15, 0, 22, 11, '#E6E6EE', 0.2); ellipse(x, 15, 0, 22, 11, '#E6E6EE', -0.2);
    ellipse(x, -13, -2, 16, 7, '#FFFFFF', 0.2); ellipse(x, 13, -2, 16, 7, '#FFFFFF', -0.2);
    x.restore();
  });
}
// water running off him (after the lake): drips from his hair and sleeves
function gpDrips(c, st, r, t, k = 1) {
  if (k <= 0.01) return;
  gpOnHead(c, st, r, (x) => {
    for (let i = 0; i < 4; i++) {
      const u = ((t * loopW(1.1) + i * 0.27) % 1);
      circle(x, -50 + i * 32, 40 + u * 120, 6, rgba('#9FD8FF', k * (1 - u)));
    }
  });
}
// a label pill in screen space (a black patch in the glow layer under it, so nothing blooms over the words)
function gpTag(txt, x, y, col, k, size = 40, rot = 0, fill = 'rgba(14,16,32,0.86)') {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.rotate(rot);
  rrect(gctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, h / 2 + 14); gctx.fillStyle = 'rgba(0,0,0,1)'; gctx.fill(); gctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.04);
  ctx.restore();
}
// the day counter: a two-line board in screen space. k pops it in; day n and the gain so far
function gpCounter(x, y, k, day, gainTxt) {
  if (k <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.translate(x, y); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  rrect(ctx, -250, -96, 500, 192, 34); ctx.fillStyle = 'rgba(10,14,34,0.88)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#FFD447'; ctx.stroke();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); rrect(gctx, -270, -116, 540, 232, 50); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
  ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9FB4FF';
  ctx.fillText(day > 0 ? `DAY ${day}` : 'EVERY DAY', 0, -50);
  ctx.font = '900 72px Montserrat'; ctx.fillStyle = '#FFD447'; ctx.fillText(gainTxt, 0, 22);
  ctx.font = '800 26px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText('AHEAD OF YOUR CLOCK', 0, 72);
  ctx.restore();
}
