// Your Text to VOYAGER 1 Would Take a Whole DAY: the worlds and the props (16 Nov 2026).
//  - his porch at night: a sky that runs from deep navy to violet with the Milky Way, far hills with a few lit windows,
//    the house's wooden wall with a warm window and a wall lamp, string lights along the eave, the railing, a potted
//    plant and a mug (vgSkyBack, vgPorch);
//  - the phone with a chat open to "Voyager 1" (last seen 1977): the typed text, the sent bubble, its status line
//    (sending / ETA / delivered), the grey reply bubble (vgPhone, vgChatFace, vgGrip);
//  - his text as a glowing green speech bubble he can ride, with a light-speed streak (vgBubble, vgTrail);
//  - deep space in three parallax star layers that can stream past (vgSpace), the Moon, Pluto with its heart, the Earth
//    as a small blue marble (vgMoon, vgPluto, vgEarthBall), Voyager 1 itself (the 3.7 m dish, the ten-sided bus, the
//    golden record, the power boom with its three drums, the science boom, the long magnetometer boom: vgVoyager);
//  - the HUD clock and label pills (vgClock, vgTag), stubble for the second day (vgStubble), and the scale for the
//    weird fact: one light-day against the 1,550 to the nearest star (vgScale).
'use strict';

const VG = {
  sky0: '#070A26', sky1: '#16185A', sky2: '#3A2C8C', sky3: '#7B3FA8', skyGlow: '#C2589E',
  hill0: '#1A1846', hill1: '#121238', hillHi: '#2C2A66',
  wall: '#7A4A33', wallSh: '#5A3424', wallHi: '#99613F', trim: '#F1E6D2', trimSh: '#C9B89E',
  win: '#FFC36A', winHi: '#FFE3A8', door: '#3C5BA8', doorSh: '#2B4180',
  floor: '#8A5636', floorSh: '#64391F', rail: '#EFE4CF', railSh: '#BFAE90',
  lamp: '#FFD27A', lampMetal: '#2C2A36',
  pot: '#D2643E', potSh: '#A2482A', leaf: '#3FA45A', leafSh: '#2A7A42',
  mug: '#3FB6C8', mugSh: '#2A8796',
  green: '#35D06A', greenHi: '#8CF5A8', greenDk: '#1E9A49',
  grey: '#E8EBF4', greyDk: '#AEB6CC',
  dish: '#F2F2EE', dishSh: '#C8CAD0', dishIn: '#DADCE2', bus: '#B9BECC', busSh: '#7E8496', gold: '#F2C14E', goldSh: '#B8862A',
  boom: '#5E6475', rtg: '#3A3E4C', rtgFin: '#555B6E',
};

let VG_STARS = null, VG_STARS2 = null, VG_MOON = null, VG_PLUTO = null, VG_EARTH = null;

// ================================================================ painted once
function vgPaintStars(seed, w, h, n, band) {
  const cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(seed);
  if (band) {
    // the Milky Way: a soft diagonal band of violet and blue haze with dense small stars and dark dust lanes
    for (let i = 0; i < 320; i++) {
      const u = rnd(), cx = w * (0.05 + 0.95 * u), cy = h * (0.9 - 0.75 * u) + (rnd() - 0.5) * 300;
      const r = 50 + rnd() * 170;
      const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      const col = rnd() < 0.35 ? '150,100,230' : rnd() < 0.6 ? '80,120,240' : '230,170,220';
      gg.addColorStop(0, `rgba(${col},0.085)`); gg.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    }
    for (let i = 0; i < 40; i++) {
      const u = rnd(), cx = w * (0.05 + 0.95 * u), cy = h * (0.9 - 0.75 * u) + (rnd() - 0.5) * 80;
      const r = 30 + rnd() * 70;
      const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      gg.addColorStop(0, 'rgba(5,6,24,0.35)'); gg.addColorStop(1, 'rgba(5,6,24,0)');
      x.fillStyle = gg; x.beginPath(); x.ellipse(cx, cy, r * 1.8, r * 0.5, -0.6, 0, Math.PI * 2); x.fill();
    }
  }
  for (let i = 0; i < n; i++) {
    const u = rnd(), inBand = band && rnd() < 0.5;
    const sx = inBand ? w * (0.05 + 0.95 * u) + (rnd() - 0.5) * 100 : rnd() * w;
    const sy = inBand ? h * (0.9 - 0.75 * u) + (rnd() - 0.5) * 360 * rnd() : rnd() * h;
    const big = rnd();
    const r = big < 0.025 ? 2.6 : big < 0.18 ? 1.5 : 0.85;
    x.fillStyle = rnd() < 0.16 ? '#FFE2B8' : rnd() < 0.32 ? '#BFD4FF' : '#FFFFFF';
    x.globalAlpha = 0.45 + 0.55 * rnd(); x.beginPath(); x.arc(sx, sy, r, 0, Math.PI * 2); x.fill();
    if (r > 2) {   // a few bright ones get a cross
      x.globalAlpha = 0.35; x.fillRect(sx - 7, sy - 0.6, 14, 1.2); x.fillRect(sx - 0.6, sy - 7, 1.2, 14);
    }
  }
  x.globalAlpha = 1;
  return cv;
}
// the Moon's face: grey with maria and craters, painted on a disc (radius 256)
function vgPaintMoon() {
  const R = 256, cv = mkCanvas(R * 2, R * 2), x = cv.getContext('2d'), rnd = mulberry32(21);
  const g = x.createRadialGradient(R * 0.7, R * 0.7, R * 0.1, R, R, R);
  g.addColorStop(0, '#F4F2EC'); g.addColorStop(0.6, '#D9D6CE'); g.addColorStop(1, '#A8A49C');
  x.fillStyle = g; x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.fill();
  x.save(); x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.clip();
  for (const [u, v, r] of [[0.38, 0.32, 0.2], [0.56, 0.42, 0.16], [0.32, 0.56, 0.17], [0.62, 0.62, 0.12], [0.46, 0.7, 0.1]]) {
    x.fillStyle = 'rgba(120,118,128,0.45)'; x.beginPath(); x.ellipse(u * 2 * R, v * 2 * R, r * 2 * R, r * 1.6 * R, 0.4, 0, Math.PI * 2); x.fill();
  }
  for (let i = 0; i < 46; i++) {
    const cx = rnd() * 2 * R, cy = rnd() * 2 * R, r = 6 + rnd() * rnd() * 34;
    x.fillStyle = 'rgba(110,108,118,0.35)'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = Math.max(1.5, r * 0.14); x.beginPath(); x.arc(cx - r * 0.12, cy - r * 0.12, r, Math.PI * 0.9, Math.PI * 1.7); x.stroke();
  }
  // the shadow side (the Sun from the upper left)
  const sh = x.createLinearGradient(R * 0.3, R * 0.3, R * 2, R * 2);
  sh.addColorStop(0, 'rgba(10,12,30,0)'); sh.addColorStop(0.62, 'rgba(10,12,30,0.05)'); sh.addColorStop(1, 'rgba(10,12,30,0.55)');
  x.fillStyle = sh; x.fillRect(0, 0, 2 * R, 2 * R);
  x.restore();
  VG_MOON = cv;
}
// Pluto: tan and rusty with the pale heart (Tombaugh Regio) on its face (radius 200)
function vgPaintPluto() {
  const R = 200, cv = mkCanvas(R * 2, R * 2), x = cv.getContext('2d'), rnd = mulberry32(33);
  const g = x.createRadialGradient(R * 0.72, R * 0.66, R * 0.1, R, R, R);
  g.addColorStop(0, '#F3D9B8'); g.addColorStop(0.55, '#D4A77E'); g.addColorStop(1, '#8C5E44');
  x.fillStyle = g; x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.fill();
  x.save(); x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.clip();
  for (let i = 0; i < 60; i++) {
    const cx = rnd() * 2 * R, cy = R * 1.15 + rnd() * R, r = 10 + rnd() * 40;
    x.fillStyle = rnd() < 0.5 ? 'rgba(120,58,40,0.35)' : 'rgba(80,44,36,0.3)'; x.beginPath(); x.ellipse(cx, cy, r * 1.6, r, 0.2, 0, Math.PI * 2); x.fill();
  }
  // the heart
  const hx = R * 1.05, hy = R * 0.98, hs = R * 0.58;
  x.fillStyle = '#FBF1E2';
  x.beginPath();
  x.moveTo(hx, hy + hs * 0.55);
  x.bezierCurveTo(hx - hs * 1.05, hy - hs * 0.05, hx - hs * 0.55, hy - hs * 0.85, hx, hy - hs * 0.32);
  x.bezierCurveTo(hx + hs * 0.55, hy - hs * 0.85, hx + hs * 1.05, hy - hs * 0.05, hx, hy + hs * 0.55);
  x.fill();
  const sh = x.createLinearGradient(R * 0.4, R * 0.3, R * 2, R * 2);
  sh.addColorStop(0, 'rgba(10,12,30,0)'); sh.addColorStop(0.6, 'rgba(10,12,30,0.08)'); sh.addColorStop(1, 'rgba(10,12,30,0.6)');
  x.fillStyle = sh; x.fillRect(0, 0, 2 * R, 2 * R);
  x.restore();
  VG_PLUTO = cv;
}
// a small Earth: blue oceans, green-brown land, white clouds (radius 160), lit from the upper left
function vgPaintEarth() {
  const R = 160, cv = mkCanvas(R * 2, R * 2), x = cv.getContext('2d'), rnd = mulberry32(44);
  const g = x.createRadialGradient(R * 0.72, R * 0.7, R * 0.1, R, R, R);
  g.addColorStop(0, '#5FC3FF'); g.addColorStop(0.6, '#2A86E0'); g.addColorStop(1, '#174C9E');
  x.fillStyle = g; x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.fill();
  x.save(); x.beginPath(); x.arc(R, R, R, 0, Math.PI * 2); x.clip();
  const land = [[0.36, 0.38, 0.22, 0.16, 0.5], [0.58, 0.3, 0.16, 0.12, -0.4], [0.55, 0.62, 0.12, 0.2, 0.3], [0.26, 0.66, 0.1, 0.08, 0]];
  for (const [u, v, rx, ry, rot] of land) {
    x.fillStyle = '#4FA35A'; x.beginPath(); x.ellipse(u * 2 * R, v * 2 * R, rx * 2 * R, ry * 2 * R, rot, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#B9A06A'; x.beginPath(); x.ellipse(u * 2 * R + 8, v * 2 * R + 4, rx * R * 0.9, ry * R * 0.7, rot, 0, Math.PI * 2); x.fill();
  }
  for (let i = 0; i < 26; i++) {
    x.fillStyle = 'rgba(255,255,255,0.7)';
    x.beginPath(); x.ellipse(rnd() * 2 * R, rnd() * 2 * R, 18 + rnd() * 40, 6 + rnd() * 10, (rnd() - 0.5) * 0.8, 0, Math.PI * 2); x.fill();
  }
  const sh = x.createLinearGradient(R * 0.4, R * 0.3, R * 2, R * 2);
  sh.addColorStop(0, 'rgba(6,8,30,0)'); sh.addColorStop(0.58, 'rgba(6,8,30,0.05)'); sh.addColorStop(1, 'rgba(6,8,30,0.65)');
  x.fillStyle = sh; x.fillRect(0, 0, 2 * R, 2 * R);
  x.restore();
  VG_EARTH = cv;
}
function vgWorldInit() {
  VG_STARS = vgPaintStars(7, 1500, 2500, 2400, true);   // the far layer, with the Milky Way
  VG_STARS2 = vgPaintStars(19, 1300, 2200, 380, false); // a nearer, sparser layer for parallax
  vgPaintMoon(); vgPaintPluto(); vgPaintEarth();
}

// ================================================================ the porch at night
// The sky and the far hills, in screen space. o: {hz (screen y of the far hills' foot), dx, dy (parallax shift, px),
// glow (0..1 the violet glow at the horizon)}
function vgSkyBack(o = {}) {
  screenSpace();
  const hz = o.hz != null ? o.hz : 1250, dx = o.dx || 0, dy = o.dy || 0;
  const g = ctx.createLinearGradient(0, hz - 1700, 0, hz + 60);
  g.addColorStop(0, VG.sky0); g.addColorStop(0.45, VG.sky1); g.addColorStop(0.78, VG.sky2); g.addColorStop(0.93, VG.sky3); g.addColorStop(1, VG.skyGlow);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the stars and the Milky Way, drifting with the camera (wrapped)
  const sx = (((-dx * 0.12 - 200) % 1500) + 1500) % 1500 - 1500, sy = -420 + dy * 0.12 + (hz - 1250) * 0.35;
  for (const ox of [0, 1500]) ctx.drawImage(VG_STARS, sx + ox, sy);
  // a soft violet glow over the hills
  const hg = ctx.createLinearGradient(0, hz - 380, 0, hz + 40);
  hg.addColorStop(0, 'rgba(194,88,158,0)'); hg.addColorStop(1, `rgba(214,104,170,${0.42 * (o.glow == null ? 1 : o.glow)})`);
  ctx.fillStyle = hg; ctx.fillRect(0, hz - 380, W, 420);
  // far hills, two ranges, with a few lit windows on the nearer one
  const hx = dx * 0.25;
  for (const [base, amp, col, seed] of [[hz - 70, 90, VG.hill0, 3], [hz, 120, VG.hill1, 8]]) {
    ctx.beginPath(); ctx.moveTo(-50, H);
    for (let X = -50; X <= W + 50; X += 30) {
      const u = (X + hx * (seed === 3 ? 0.5 : 1)) * 0.004;
      const y = base - amp * (0.5 + 0.32 * Math.sin(u * 2.1 + seed) + 0.18 * Math.sin(u * 5.3 + seed * 2));
      ctx.lineTo(X, y);
    }
    ctx.lineTo(W + 50, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  for (const [u, v] of [[0.12, 0.6], [0.31, 0.75], [0.47, 0.55], [0.69, 0.8], [0.86, 0.66]]) {
    const wx = ((u * W + hx) % W + W) % W, wy = hz + 40 * v;
    ctx.fillStyle = VG.win; ctx.fillRect(wx, wy, 7, 6);
    softDot(gctx, wx + 3, wy + 3, 16, '#FFC36A', 0.5);
  }
}
// the porch, in world space (under applyCam). The floor's top is at y 1900; the house wall stands at the left
// (x < wallX); the railing runs from it to the right at y railY. o: {wallX, railY, eaveY, lampOn, plant, mug, chair}
function vgPorch(c, t, o = {}) {
  const wallX = o.wallX != null ? o.wallX : 250, railY = o.railY != null ? o.railY : 1560, eaveY = o.eaveY != null ? o.eaveY : 980;
  // the floor boards
  c.fillStyle = VG.floor; c.fillRect(-900, 1900, 3000, 900);
  for (let i = 0; i < 12; i++) line(c, -900, 1918 + i * 26 + i * i * 2, 2100, 1918 + i * 26 + i * i * 2, 4, VG.floorSh);
  // the house wall: horizontal siding boards
  c.fillStyle = VG.wall; c.fillRect(-900, eaveY - 300, wallX + 900, 2300 - eaveY);
  for (let y = eaveY - 300; y < 1900; y += 46) { line(c, -900, y, wallX, y, 5, VG.wallSh); line(c, -900, y + 6, wallX, y + 6, 3, VG.wallHi); }
  // the corner trim
  c.fillStyle = VG.trim; c.fillRect(wallX - 26, eaveY - 300, 34, 2300 - eaveY);
  c.fillStyle = VG.trimSh; c.fillRect(wallX + 2, eaveY - 300, 6, 2300 - eaveY);
  // a window with warm light (in the wall, left of him) and its curtains
  const wx0 = wallX - 330, wy0 = 1080, ww = 230, wh = 300;
  c.fillStyle = VG.trim; c.fillRect(wx0 - 18, wy0 - 18, ww + 36, wh + 36);
  c.fillStyle = VG.win; c.fillRect(wx0, wy0, ww, wh);
  both((cc) => { const gg = cc.createLinearGradient(wx0, wy0, wx0, wy0 + wh); gg.addColorStop(0, 'rgba(255,227,168,0.9)'); gg.addColorStop(1, 'rgba(255,170,90,0.6)'); cc.fillStyle = gg; cc.fillRect(wx0, wy0, ww, wh); });
  c.fillStyle = VG.trim; c.fillRect(wx0 + ww / 2 - 7, wy0, 14, wh); c.fillRect(wx0, wy0 + wh / 2 - 7, ww, 14);
  c.fillStyle = '#C24B5A'; c.fillRect(wx0, wy0, 34, wh); c.fillRect(wx0 + ww - 34, wy0, 34, wh);
  // the wall lamp (a lantern sconce) above the window's right corner: in the glow layer so it blooms
  const lx = o.lampX != null ? o.lampX : wallX - 60, ly = o.lampY != null ? o.lampY : 1010;
  c.fillStyle = VG.lampMetal; c.fillRect(lx - 8, ly - 70, 16, 40); c.fillRect(lx - 30, ly - 36, 60, 12);
  rrect(c, lx - 24, ly - 26, 48, 64, 8); c.fillStyle = VG.lamp; c.fill();
  c.fillStyle = VG.lampMetal; c.fillRect(lx - 30, ly + 36, 60, 10);
  softDot(gctx, lx, ly + 4, 120, '#FFC870', 0.95); softDot(gctx, lx, ly + 4, 40, '#FFF2C8', 1);
  // the porch roof over the eave (dark shingles in rows, a lighter edge), the house's gable above it on the left
  c.fillStyle = '#2B2350'; c.fillRect(-900, eaveY - 170, 3000, 150);
  for (let r = 0; r < 4; r++) for (let x = -900 + (r % 2) * 30; x < 2100; x += 60) { c.fillStyle = r % 2 ? '#352B60' : '#3D3270'; c.fillRect(x, eaveY - 165 + r * 36, 56, 32); }
  c.fillStyle = '#4A3E86'; c.fillRect(-900, eaveY - 176, 3000, 12);
  c.beginPath(); c.moveTo(-900, eaveY - 170); c.lineTo(-900, eaveY - 640); c.lineTo(wallX - 300, eaveY - 900); c.lineTo(wallX + 120, eaveY - 520);
  c.lineTo(wallX + 120, eaveY - 170); c.closePath(); c.fillStyle = VG.wallSh; c.fill();
  c.beginPath(); c.moveTo(-900, eaveY - 640); c.lineTo(wallX - 300, eaveY - 900); c.lineTo(wallX + 160, eaveY - 500);
  c.lineTo(wallX + 130, eaveY - 470); c.lineTo(wallX - 300, eaveY - 860); c.lineTo(-900, eaveY - 600); c.closePath(); c.fillStyle = '#2B2350'; c.fill();
  rrect(c, wallX - 380, eaveY - 520, 150, 170, 10); c.fillStyle = VG.trim; c.fill();
  c.fillStyle = VG.win; c.fillRect(wallX - 368, eaveY - 508, 126, 146);
  softDot(gctx, wallX - 305, eaveY - 435, 120, '#FFC36A', 0.55);
  // the eave: a beam across the top with the string lights sagging under it
  c.fillStyle = VG.trim; c.fillRect(-900, eaveY - 30, 3000, 38);
  c.fillStyle = VG.trimSh; c.fillRect(-900, eaveY + 4, 3000, 8);
  vgStringLights(c, -900, 2100, eaveY + 20, t);
  // the railing: two rails and balusters, a post at each end
  for (const px of [wallX + 10, o.postX != null ? o.postX : 1010]) { c.fillStyle = VG.rail; c.fillRect(px - 24, eaveY, 48, 1900 - eaveY); c.fillStyle = VG.railSh; c.fillRect(px + 12, eaveY, 12, 1900 - eaveY); }
  c.fillStyle = VG.rail; c.fillRect(wallX, railY - 16, 2000, 30); c.fillStyle = VG.railSh; c.fillRect(wallX, railY + 8, 2000, 8);
  c.fillStyle = VG.rail; c.fillRect(wallX, 1840, 2000, 20);
  for (let x = wallX + 60; x < 2100; x += 74) { c.fillStyle = VG.rail; c.fillRect(x - 10, railY + 14, 20, 1840 - railY - 14); c.fillStyle = VG.railSh; c.fillRect(x + 4, railY + 14, 6, 1840 - railY - 14); }
  // a potted plant on the rail by the post, a mug further along
  if (o.plant !== false) vgPlant(c, o.plantX != null ? o.plantX : 930, railY - 16, 1, t);
  if (o.mug !== false) vgMug(c, o.mugX != null ? o.mugX : 790, railY - 16, 1, o.mugOld || 0);
}
// warm bulbs on a sagging wire (each bulb in the glow layer), a gentle sway on a loop-safe clock
function vgStringLights(c, x0, x1, y, t) {
  const span = 260, sway = 4 * Math.sin(t * loopW(0.8));
  c.save(); c.lineWidth = 4; c.strokeStyle = '#1C1A26'; c.beginPath();
  for (let x = x0; x < x1; x += span) { c.moveTo(x, y); c.quadraticCurveTo(x + span / 2, y + 70 + sway, x + span, y); }
  c.stroke(); c.restore();
  let i = 0;
  for (let x = x0; x < x1; x += span) {
    for (let k = 1; k <= 3; k++, i++) {
      const u = k / 4, bx = x + span * u, by = y + 4 * u * (1 - u) * (70 + sway) + 14;
      const col = ['#FFD27A', '#FF9F6A', '#FFE6A0'][i % 3];
      c.fillStyle = '#2C2A36'; c.fillRect(bx - 5, by - 16, 10, 10);
      ellipse(c, bx, by, 10, 14, col);
      softDot(gctx, bx, by, 46, col, 0.85);
    }
  }
}
function vgPlant(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.28 + 0.03 * Math.sin(t * loopW(1.1) + i);
    const L = 70 + 22 * Math.sin(i * 2.3);
    c.save(); c.rotate(a + Math.PI / 2);
    c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(18, -60 - L * 0.5, 0, -60 - L); c.quadraticCurveTo(-18, -60 - L * 0.5, 0, -60);
    c.fillStyle = i % 2 ? VG.leaf : VG.leafSh; c.fill(); c.restore();
  }
  c.beginPath(); c.moveTo(-40, -64); c.lineTo(40, -64); c.lineTo(30, 0); c.lineTo(-30, 0); c.closePath(); c.fillStyle = VG.pot; c.fill();
  c.fillStyle = VG.potSh; c.fillRect(-44, -70, 88, 14);
  c.restore();
}
// a mug of tea; old (0..1) = two days later: no steam, a green skin of mould
function vgMug(c, x, y, s, old = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -26, -56, 52, 56, 8); c.fillStyle = VG.mug; c.fill();
  c.lineWidth = 9; c.strokeStyle = VG.mugSh; c.beginPath(); c.arc(30, -30, 13, -1.2, 1.2); c.stroke();
  ellipse(c, 0, -56, 24, 6, old > 0.5 ? '#6E8F3A' : '#6B3A1E');
  c.restore();
}

// ================================================================ the phone and the chat
// the phone: centre (x, y), height h, screen facing us; o: the chat's state (vgChatFace)
function vgPhone(c, x, y, h, t, o = {}) {
  const w = h * 0.49;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0);
  rrect(c, -w / 2, -h / 2, w, h, w * 0.17); c.fillStyle = '#1C1F2B'; c.fill();
  const ix = -w / 2 + w * 0.055, iy = -h / 2 + w * 0.055, iw = w * 0.89, ih = h - w * 0.11;
  paint(() => vgChatFace(c, ix, iy, iw, ih, t, o));
  c.restore();
  softDot(gctx, x, y, h * 0.6, '#BFE8FF', 0.16);   // the screen's light
}
// the chat in a box: the header (Voyager 1, last seen 1977), the typed text in the input, the sent bubble, its status,
// the reply. o: {typed (0..1 of "u ok?" typed), sent (0..1 the bubble pops in), lift (0..1 the bubble has left the
// phone), status: 'sending' | 'eta' | 'delivered' | 'none', eta (0..1 the ETA pill pops), prog (0..1 the progress bar),
// reply (0..1 the grey "beep." pops in), tap (0..1 the send button pressed)}
function vgChatFace(c, ix, iy, iw, ih, t, o = {}) {
  c.save();
  rrect(c, ix, iy, iw, ih, iw * 0.11); c.fillStyle = '#0E1224'; c.fill();
  rrect(c, ix, iy, iw, ih, iw * 0.11); c.clip();
  const U = iw / 100, X = (u) => ix + u * U, Y = (v) => iy + v * U;   // positions in U: hundredths of the screen's width
  // a faint starry wallpaper
  for (let i = 0; i < 22; i++) circle(c, X(100 * hash(i * 3.3)), Y(36 + 150 * hash(i * 7.1)), 0.5 * U + 0.6 * U * hash(i), 'rgba(160,180,255,0.25)');
  // header: back arrow, the avatar (a tiny Voyager dish), the name and "last seen 1977"
  c.fillStyle = '#1B2140'; c.fillRect(ix, iy, iw, 34 * U);
  c.strokeStyle = '#8FA3FF'; c.lineWidth = 2.6 * U; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(X(8), Y(12)); c.lineTo(X(4), Y(17)); c.lineTo(X(8), Y(22)); c.stroke();
  circle(c, X(20), Y(17), 10.5 * U, '#2C3A78');
  ellipse(c, X(19), Y(15.5), 7 * U, 4.4 * U, '#F2F2EE', -0.4);
  line(c, X(19.5), Y(17), X(25), Y(23), 2 * U, '#F2C14E');
  c.textAlign = 'left'; c.textBaseline = 'middle';
  c.font = `900 ${Math.round(12 * U)}px Montserrat`; c.fillStyle = '#FFFFFF'; c.fillText('Voyager 1', X(33), Y(13));
  c.font = `700 ${Math.round(8 * U)}px Montserrat`; c.fillStyle = '#8FA3FF'; c.fillText('last seen 1977', X(34), Y(25.5));
  // the sent bubble (green, right), popping in, then leaving for space
  const sent = clamp(o.sent || 0), lift = clamp(o.lift || 0);
  if (sent > 0.01 && lift < 0.98) {
    const k = E.outBack(sent, 2), bw = 62 * U, bh = 28 * U, bx = X(94) - bw, by = Y(66) - lift * 90 * U;
    c.save(); c.globalAlpha = 1 - lift; c.translate(bx + bw, by + bh); c.scale(k, k); c.translate(-(bx + bw), -(by + bh));
    rrect(c, bx, by, bw, bh, 12 * U); c.fillStyle = VG.green; c.fill();
    c.beginPath(); c.moveTo(bx + bw - 9 * U, by + bh - 2); c.lineTo(bx + bw + 4 * U, by + bh + 5 * U); c.lineTo(bx + bw - 19 * U, by + bh - 2); c.fill();
    c.font = `900 ${Math.round(16 * U)}px Montserrat`; c.fillStyle = '#06331A'; c.textAlign = 'center';
    c.fillText('u ok?', bx + bw / 2, by + bh / 2 + 0.6 * U);
    c.restore();
  }
  // the status line under it
  if (sent > 0.6 && o.status && o.status !== 'none') {
    c.textAlign = 'right'; c.font = `800 ${Math.round(8.5 * U)}px Montserrat`;
    const sy = Y(107);
    if (o.status === 'sending') { c.fillStyle = '#8FA3FF'; c.fillText('Sending' + '...'.slice(0, 1 + Math.floor((t * 3) % 3)), X(94), sy); }
    if (o.status === 'delivered') {
      c.fillStyle = VG.greenHi; c.fillText('Delivered', X(84), sy);
      c.strokeStyle = VG.greenHi; c.lineWidth = 2.2 * U;
      c.beginPath(); c.moveTo(X(86.5), sy); c.lineTo(X(89), sy + 3.4 * U); c.lineTo(X(94), sy - 4.4 * U); c.stroke();
    }
    if (o.status === 'sending') {
      // a progress bar that barely moves
      const pb = clamp(o.prog || 0);
      rrect(c, X(30), sy + 9 * U, 64 * U, 4 * U, 2 * U); c.fillStyle = '#2A3160'; c.fill();
      rrect(c, X(30), sy + 9 * U, Math.max(4 * U, 64 * U * pb), 4 * U, 2 * U); c.fillStyle = VG.green; c.fill();
    }
  }
  // the ETA pill: ARRIVES IN 24 HOURS
  const ek = clamp(o.eta || 0);
  if (ek > 0.01) {
    const k = E.outBack(ek, 2.2), cx = X(50), cy = Y(146);
    c.save(); c.translate(cx, cy); c.rotate(-0.04); c.scale(k, k);
    rrect(c, -42 * U, -18 * U, 84 * U, 36 * U, 18 * U); c.fillStyle = '#FFD447'; c.fill();
    c.textAlign = 'center'; c.fillStyle = '#2A1E00';
    c.font = `800 ${Math.round(8 * U)}px Montserrat`; c.fillText('ARRIVES IN', 0, -8 * U);
    c.font = `900 ${Math.round(14 * U)}px Montserrat`; c.fillText('24 HOURS', 0, 6.5 * U);
    c.restore();
  }
  // the reply: a grey bubble on the left, "beep."
  const rk = clamp(o.reply || 0);
  if (rk > 0.01) {
    const k = E.outBack(rk, 2.4), bw = 60 * U, bh = 28 * U, bx = X(6), by = Y(132);
    c.save(); c.translate(bx, by + bh); c.scale(k, k); c.translate(-bx, -(by + bh));
    rrect(c, bx, by, bw, bh, 12 * U); c.fillStyle = '#E8EBF4'; c.fill();
    c.beginPath(); c.moveTo(bx + 9 * U, by + bh - 2); c.lineTo(bx - 4 * U, by + bh + 5 * U); c.lineTo(bx + 19 * U, by + bh - 2); c.fill();
    c.font = `900 ${Math.round(16 * U)}px Montserrat`; c.fillStyle = '#1B2140'; c.textAlign = 'center';
    c.fillText('beep.', bx + bw / 2, by + bh / 2 + 0.6 * U);
    c.font = `800 ${Math.round(7.5 * U)}px Montserrat`; c.fillStyle = '#C8A8FF'; c.textAlign = 'left';
    c.fillText('2 DAYS LATER', bx + 1 * U, by - 7 * U);
    c.restore();
  }
  // the input bar with what he is typing, and the send button
  const iyb = Y(194);
  rrect(c, X(4), iyb - 11 * U, 70 * U, 22 * U, 11 * U); c.fillStyle = '#1F2648'; c.fill();
  const typed = clamp(o.typed || 0), txt = 'u ok?'.slice(0, Math.round(typed * 5));
  c.textAlign = 'left'; c.font = `800 ${Math.round(11 * U)}px Montserrat`; c.fillStyle = '#FFFFFF';
  c.fillText(txt, X(10), iyb + 0.6 * U);
  if (typed < 1 && Math.floor(t * 4) % 2 === 0) { const tw = c.measureText(txt).width; c.fillRect(X(10) + tw + 1.2 * U, iyb - 6.5 * U, 1.6 * U, 13 * U); }
  const tap = clamp(o.tap || 0);
  circle(c, X(86), iyb, (12 - 2 * tap) * U, tap > 0.3 ? VG.greenHi : VG.green);
  c.fillStyle = '#06331A';
  c.beginPath(); c.moveTo(X(86) - 4.6 * U, iyb - 5.8 * U); c.lineTo(X(86) + 6 * U, iyb); c.lineTo(X(86) - 4.6 * U, iyb + 5.8 * U); c.lineTo(X(86) - 2 * U, iyb); c.closePath(); c.fill();
  c.restore();
}
// a hand holding the phone from below (drawn after the phone; phone-local, origin at its centre, screen to us): the palm
// behind the lower right corner, three fingers wrapped round the left edge, the thumb on the right edge; thumb: {u, v} =
// the thumb's tip on the screen (0..1 of the phone's width and height), or null (resting along the edge). sleeve: the
// palette whose coat colours the forearm coming up from below the frame (the phone is close to the lens). mirror: the
// other hand.
function vgGrip(c, x, y, h, rot, thumb, sleeve, mirror) {
  const w = h * 0.49, s = h / 150;
  c.save(); c.translate(x, y); c.rotate(rot || 0); if (mirror) c.scale(-1, 1);
  c.lineCap = 'round';
  if (sleeve) {
    line(c, -w * 0.3, h * 2.0, w * 0.3, h * 0.5, 40 * s, sleeve.coatSh);
    line(c, -w * 0.27, h * 2.0, w * 0.32, h * 0.52, 32 * s, sleeve.coat);
    line(c, w * 0.29, h * 0.6, w * 0.31, h * 0.5, 42 * s, sleeve.coatSh);       // the cuff
  }
  // the palm, cupping the phone's bottom edge
  ellipse(c, w * 0.18, h * 0.53, 30 * s, 16 * s, PAL.skinSh);
  ellipse(c, w * 0.17, h * 0.52, 27 * s, 13 * s, PAL.skin);
  // three fingertips round the left edge
  for (let i = 0; i < 3; i++) {
    rrect(c, -w / 2 - 7 * s, h * (0.06 + i * 0.1), 17 * s, 12 * s, 6 * s); c.fillStyle = PAL.skinSh; c.fill();
    rrect(c, -w / 2 - 6 * s, h * (0.06 + i * 0.1) + 1 * s, 14 * s, 9 * s, 4.5 * s); c.fillStyle = PAL.skin; c.fill();
  }
  // the thumb: from the palm, over the right edge, to its tip
  const bx = w * 0.4, by = h * 0.5;
  const tx = -w / 2 + w * (thumb ? thumb.u : 0.74), ty = -h / 2 + h * (thumb ? thumb.v : 0.972);
  line(c, bx, by, tx, ty + 3 * s, 15 * s, PAL.skinSh);
  line(c, bx, by, tx, ty + 3 * s, 11.5 * s, PAL.skin);
  ellipse(c, tx, ty + 1 * s, 5.5 * s, 6.5 * s, PAL.skin);
  ellipse(c, tx + 0.5 * s, ty - 0.5 * s, 3.4 * s, 3.8 * s, '#F7CDB3');            // the nail
  c.restore();
}

// ================================================================ his text, flying
// a speech bubble (centre x, y; width w) with its text; o: {text, col ('green' | 'grey'), tail ('r' | 'l'), glow,
// squash (0..1: flattened on a hit), rot}
function vgBubble(c, x, y, w, o = {}) {
  const h = w * 0.46, green = o.col !== 'grey', sq = clamp(o.squash || 0);
  const sx = 1 + 0.22 * sq, sy = 1 - 0.28 * sq;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(sx, sy);
  // the glow: a soft ring round its edge (a filled shape in the glow layer would bloom the text away)
  const gk = o.glow == null ? 1 : o.glow;
  if (gk > 0) {
    const T = c.getTransform();
    gctx.save(); gctx.setTransform(T.a / 2, T.b / 2, T.c / 2, T.d / 2, T.e / 2, T.f / 2);
    rrect(gctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h * 0.46); gctx.lineWidth = 18; gctx.strokeStyle = rgba(green ? '#5CFF9A' : '#CFE0FF', 0.6 * gk); gctx.stroke();
    gctx.restore();
  }
  rrect(c, -w / 2, -h / 2, w, h, h * 0.42); c.fillStyle = green ? VG.green : VG.grey; c.fill();
  const tl = o.tail === 'l' ? -1 : 1;
  c.beginPath(); c.moveTo(tl * (w / 2 - h * 0.42), h / 2 - 4); c.lineTo(tl * (w / 2 + h * 0.08), h / 2 + h * 0.26); c.lineTo(tl * (w / 2 - h * 0.85), h / 2 - 4); c.closePath(); c.fill();
  // a glossy highlight along the top
  rrect(c, -w / 2 + h * 0.3, -h / 2 + h * 0.12, w - h * 0.6, h * 0.16, h * 0.08); c.fillStyle = green ? 'rgba(200,255,220,0.55)' : 'rgba(255,255,255,0.7)'; c.fill();
  paint(() => {
    c.font = `900 ${Math.round(h * 0.5)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = green ? '#06331A' : '#1B2140'; c.fillText(o.text || 'u ok?', (o.textDX || 0) * w, h * 0.04);
  });
  c.restore();
}
// a streak of light behind a fast thing: from (x, y) back along angle ang (radians; the way it came), length len
function vgTrail(c, x, y, len, ang, k, w, col = '#7DFFB0') {
  if (k <= 0.01 || len < 4) return;
  const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
  for (const [cc, mul] of [[c, 1], [gctx, 1]]) {
    cc.save(); cc.lineCap = 'round';
    const g = cc.createLinearGradient(x, y, x1, y1);
    g.addColorStop(0, rgba('#FFFFFF', 0.95 * k * mul)); g.addColorStop(0.2, rgba(col, 0.75 * k * mul)); g.addColorStop(1, rgba(col, 0));
    cc.strokeStyle = g; cc.lineWidth = w; cc.beginPath(); cc.moveTo(x, y); cc.lineTo(x1, y1); cc.stroke();
    cc.lineWidth = w * 0.35; cc.strokeStyle = rgba('#FFFFFF', 0.9 * k * mul); cc.beginPath(); cc.moveTo(x, y); cc.lineTo(x + (x1 - x) * 0.4, y + (y1 - y) * 0.4); cc.stroke();
    cc.restore();
  }
}

// ================================================================ deep space
// three star layers in screen space; o: {scroll (px the near layer has moved; far layers move less), vy, streak (0..1:
// stars smear into lines along the travel: light speed), dirX (1 = we travel right, so stars stream left), tint}
function vgSpace(o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#04051A'); g.addColorStop(0.55, '#0A0C2E'); g.addColorStop(1, '#130F3C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sc = o.scroll || 0, vy = o.vy || 0, dir = o.dirX == null ? 1 : o.dirX;
  // the far layer (with the Milky Way), then the near one
  const f1 = ((-dir * sc * 0.08) % 1500 + 1500) % 1500, f1y = ((vy * 0.08) % 2500 + 2500) % 2500;
  for (const ox of [-1500, 0]) for (const oy of [-2500, 0]) ctx.drawImage(VG_STARS, f1 + ox, f1y + oy - 300);
  const f2 = ((-dir * sc * 0.35) % 1300 + 1300) % 1300, f2y = ((vy * 0.35) % 2200 + 2200) % 2200;
  for (const ox of [-1300, 0]) for (const oy of [-2200, 0]) ctx.drawImage(VG_STARS2, f2 + ox, f2y + oy - 200);
  // the nearest stars: streaks when we move fast
  const st = clamp(o.streak || 0);
  if (st > 0.01) {
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      const z = 0.3 + 0.7 * hash(i * 2.7 + 1), L = (60 + 520 * z) * st;
      const px = ((hash(i * 1.3 + 5) * (W + 800) - dir * sc * (0.8 + 1.6 * z)) % (W + 800) + (W + 800)) % (W + 800) - 400;
      const py = ((hash(i * 4.1 + 9) * (H + 200) + vy * z) % (H + 200) + (H + 200)) % (H + 200) - 100;
      ctx.strokeStyle = rgba(i % 5 ? '#DDE6FF' : '#A6FFD0', 0.5 * z * st); ctx.lineWidth = 1.2 + 2.6 * z;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dir * L, py); ctx.stroke();
    }
    ctx.restore();
  }
}
function vgMoon(c, x, y, R) {
  circle(c, x, y, R, '#CFCBC2');               // the opaque disc first: the light stage knows the shape
  c.drawImage(VG_MOON, x - R, y - R, 2 * R, 2 * R);
}
function vgPluto(c, x, y, R) {
  circle(c, x, y, R, '#C99A72');
  c.drawImage(VG_PLUTO, x - R, y - R, 2 * R, 2 * R);
}
function vgEarthBall(c, x, y, R) {
  circle(c, x, y, R, '#2A86E0');
  c.drawImage(VG_EARTH, x - R, y - R, 2 * R, 2 * R);
  softDot(gctx, x, y, R * 1.6, '#5FB0FF', 0.4);
}
// a faint, distant Sun: a bright star with spikes (screen or world space)
function vgFarSun(c, x, y, s, k = 1) {
  softDot(gctx, x, y, 90 * s, '#FFE9B0', 0.9 * k);
  softDot(c, x, y, 26 * s, '#FFF6DC', k);
  line(c, x - 70 * s, y, x + 70 * s, y, 3 * s, rgba('#FFF6DC', 0.7 * k)); line(c, x, y - 70 * s, x, y + 70 * s, 3 * s, rgba('#FFF6DC', 0.7 * k));
}

// ================================================================ Voyager 1
// Seen three-quarters from the front: the 3.7 m dish (its open face toward -x, toward the Earth: o.face = -1) on top of the
// ten-sided bus, the golden record on the bus's side, the power boom with its three drums down-left, the science boom
// with the camera platform up-right, the long thin magnetometer boom. Centre (x, y) = the dish's centre; s = scale (1:
// the dish is 380 px across). o: {face (-1 | 1), bonk (0..1: the dish wobbles), spin}
function vgVoyager(c, x, y, s, t, o = {}) {
  const f = o.face || -1, wob = (o.bonk || 0) * 0.08 * Math.sin((o.bonkT || 0) * 30) * Math.exp(-(o.bonkT || 0) * 4);
  c.save(); c.translate(x, y); c.rotate(wob + (o.rot || 0)); c.scale(s * f, s);
  // the magnetometer boom: a long thin lattice off to the back (drawn first: behind)
  c.save(); c.lineCap = 'round';
  line(c, 40, 150, 640, 540, 6, '#8E93A6');
  for (let i = 1; i < 18; i++) { const u = i / 18; line(c, 40 + 600 * u - 6, 150 + 390 * u + 8, 40 + 600 * u + 6, 150 + 390 * u - 8, 2, '#8E93A6'); }
  c.restore();
  // the power boom, down and back: three drums with fins
  line(c, -10, 200, -260, 430, 14, VG.boom);
  for (let i = 0; i < 3; i++) {
    const bx = -100 - 62 * i, by = 288 + 57 * i;
    c.save(); c.translate(bx, by); c.rotate(-0.74);
    rrect(c, -30, -34, 60, 68, 10); c.fillStyle = VG.rtg; c.fill();
    for (let k = -1; k <= 1; k += 2) { c.fillStyle = VG.rtgFin; c.fillRect(k * 30 - (k < 0 ? 16 : 0), -30, 16, 60); }
    line(c, -26, -10, 26, -10, 3, '#6E7488'); line(c, -26, 10, 26, 10, 3, '#6E7488');
    c.restore();
  }
  // the science boom, up and back: the scan platform with the cameras
  line(c, 40, 140, 300, 40, 12, VG.boom);
  c.save(); c.translate(300, 40); c.rotate(-0.3);
  rrect(c, -40, -36, 80, 72, 8); c.fillStyle = '#4B5166'; c.fill();
  rrect(c, 8, -28, 54, 26, 6); c.fillStyle = '#2B2F3C'; c.fill(); circle(c, 62, -15, 11, '#6FA8FF');
  rrect(c, 8, 6, 44, 22, 6); c.fillStyle = '#2B2F3C'; c.fill(); circle(c, 52, 17, 8, '#6FA8FF');
  c.restore();
  softDot(gctx, x + f * s * (300 + 62), y + s * (40 - 15), 18 * s, '#9FD0FF', 0.5);
  // the bus: a ten-sided box under the dish (seen as a wide hexagonal prism), gold foil blankets
  c.beginPath(); c.moveTo(-120, 60); c.lineTo(120, 60); c.lineTo(150, 110); c.lineTo(120, 170); c.lineTo(-120, 170); c.lineTo(-150, 110); c.closePath();
  c.fillStyle = VG.bus; c.fill();
  c.beginPath(); c.moveTo(-120, 60); c.lineTo(-40, 60); c.lineTo(-40, 170); c.lineTo(-120, 170); c.lineTo(-150, 110); c.closePath(); c.fillStyle = VG.busSh; c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? VG.goldSh : VG.gold; c.fillRect(-30 + i * 34, 72, 30, 86); }
  // the golden record on the side (paint: a pattern on the bus)
  paint(() => {
    circle(c, -88, 114, 40, '#E2AE3E'); circle(c, -88, 114, 32, '#F6D27A'); circle(c, -88, 114, 6, '#8A6418');
    c.strokeStyle = 'rgba(140,100,24,0.55)'; c.lineWidth = 1.6;
    for (let r = 12; r < 32; r += 4) { c.beginPath(); c.arc(-88, 114, r, 0, Math.PI * 2); c.stroke(); }
  });
  // the feed support struts and the dish: a white bowl seen at an angle (open face toward -x)
  line(c, -60, 40, -170, -40, 6, '#D9DBE2'); line(c, -60, -120, -170, -40, 6, '#D9DBE2');
  c.save(); c.rotate(-0.12);
  // the back of the bowl
  ellipse(c, 0, -40, 205, 190, VG.dishSh);
  ellipse(c, -26, -40, 182, 178, VG.dish);
  // the inside, rings
  ellipse(c, -52, -40, 150, 160, VG.dishIn);
  c.strokeStyle = 'rgba(160,165,180,0.6)'; c.lineWidth = 3;
  for (const r of [0.35, 0.62, 0.86]) { c.beginPath(); c.ellipse(-52, -40, 150 * r, 160 * r, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  // the feed horn at the dish's focus, and its tripod
  line(c, -52, -50, -170, -44, 8, '#C9CED9');
  circle(c, -176, -44, 16, '#E9ECF3'); circle(c, -176, -44, 7, '#7E8496');
  // a little blinking light (it is alive)
  const blink = (Math.sin(t * loopW(3.1)) > 0.85) ? 1 : 0.15;
  circle(c, 120, 64, 7, rgba('#FF5A5A', 0.4 + 0.6 * blink));
  c.restore();
  softDot(gctx, x + f * s * 120, y + s * 64, 22 * s, '#FF6A6A', 0.6 * blink);
}

// ================================================================ HUD
// the trip clock: a pill with a stopwatch icon and HH:MM:SS (screen space). secs: elapsed seconds; k pops it in
function vgClock(x, y, secs, k, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  secs = Math.floor(secs + 0.002);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = Math.floor(secs % 60);
  const txt = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  ctx.save(); ctx.translate(x, y); const sc = E.outBack(clamp(k)); ctx.scale(sc, sc);
  rrect(ctx, -230, -62, 460, 124, 62); ctx.fillStyle = 'rgba(10,14,40,0.9)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = o.col || '#7DFFB0'; ctx.stroke();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.scale(sc, sc); rrect(gctx, -250, -82, 500, 164, 82); gctx.fillStyle = '#000'; gctx.fill(); gctx.restore();
  // the stopwatch icon, its hand turning
  circle(ctx, -168, 4, 32, '#FFFFFF'); circle(ctx, -168, 4, 25, '#0A0E28'); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-176, -42, 16, 12);
  const ha = (o.handA != null ? o.handA : secs * 0.1);
  line(ctx, -168, 4, -168 + Math.sin(ha) * 19, 4 - Math.cos(ha) * 19, 5, o.col || '#7DFFB0');
  ctx.font = '900 66px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText(txt, -118, 6);
  if (o.label) { ctx.font = '800 30px Montserrat'; ctx.textAlign = 'center'; ctx.fillStyle = o.col || '#7DFFB0'; ctx.fillText(o.label, 0, 100); }
  ctx.restore();
}
function vgTag(txt, x, y, col, k, size = 40, rot = 0, fill = 'rgba(14,16,40,0.88)') {
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

// ================================================================ him: stubble (the second day), drawn in his layer's post
function vgStubble(c, st, rr, k) {
  if (k <= 0.01) return;
  const hd = toWorld(st, rr.head), s = st.s;
  c.save(); c.translate(hd[0] + (st.headDX || 0) * s, hd[1] + (st.headDY || 0) * s); c.rotate((rr.lean || 0) + (st.headRot || 0)); c.scale(s, s);
  paint(() => {
    c.fillStyle = `rgba(70,52,60,${0.32 * k})`;
    c.beginPath(); c.moveTo(-56, 18); c.quadraticCurveTo(-50, 70, 0, 74); c.quadraticCurveTo(50, 70, 56, 18);
    c.quadraticCurveTo(30, 40, 22, 30); c.quadraticCurveTo(0, 58, -22, 30); c.quadraticCurveTo(-30, 40, -56, 18); c.closePath(); c.fill();
    for (let i = 0; i < 70; i++) {
      const u = hash(i * 1.71) * 2 - 1, v = hash(i * 3.13);
      const px = u * 52, py = 26 + v * 44;
      if (Math.abs(px) < 22 && py < 52 && py > 28) continue;      // keep the mouth clear
      if (px * px / 3300 + (py - 18) * (py - 18) / 3300 > 1) continue;
      circle(c, px, py, 1.8, `rgba(50,36,42,${0.6 * k})`);
    }
  });
  c.restore();
}

// ================================================================ the scale (the weird fact)
// A zoom out from one light-day to the nearest star, in screen space. The Sun sits at (x0, y0); the road goes UP.
// o: {pxPerLD (px for one light-day: 900 at the start, ~0.7 at the end), hero (0..1 him sitting on Voyager), year (the
// trail's year counter, 1977..2026), trail (0..1 the dashed trail drawn), star (0..1 the star's glow), ticks}
function vgScale(t, o = {}) {
  screenSpace();
  const x0 = o.x0 || 540, y0 = o.y0 || 1560, ppl = o.pxPerLD || 900;
  const vy = y0 - ppl;        // Voyager: one light-day up
  // the ruler: one segment a light-day, alternating colours, drawn while they are at least 3 px; under that a solid bar
  const tk = clamp(o.ticks == null ? 1 : o.ticks);
  if (tk > 0.01) {
    const yTop = Math.max(-200, y0 - 1550 * ppl);
    if (ppl >= 3) {
      const n0 = 0, n1 = Math.min(1550, Math.ceil((y0 + 200) / ppl));
      for (let i = n0; i < n1; i++) {
        const ya = y0 - i * ppl, yb = y0 - (i + 1) * ppl;
        if (yb > H + 50) continue;
        if (ya < -50) break;
        ctx.fillStyle = rgba(i % 2 ? '#7DFFB0' : '#2E8F5C', 0.9 * tk);
        ctx.fillRect(x0 - 7, yb, 14, ya - yb);
      }
    } else {
      const g = ctx.createLinearGradient(0, y0, 0, yTop);
      g.addColorStop(0, rgba('#7DFFB0', 0.9 * tk)); g.addColorStop(1, rgba('#5FD6FF', 0.9 * tk));
      ctx.fillStyle = g; ctx.fillRect(x0 - 5, yTop, 10, y0 - yTop);
    }
    gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.fillStyle = rgba('#5CFFA0', 0.35 * tk); gctx.fillRect(x0 - 14, yTop, 28, y0 - yTop); gctx.restore();
  }
  // the Sun (with the Earth beside it) at the bottom
  vgFarSun(ctx, x0, y0, 0.9, 1);
  // Voyager at one light-day, with him on it while it is big enough to see
  const tr = clamp(o.trail || 0);
  if (ppl > 40) {
    // the dashed trail it flew, 1977 -> now, and the year counter
    ctx.save(); ctx.setLineDash([16, 14]); ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFD447', 0.9 * tr);
    ctx.beginPath(); ctx.moveTo(x0 + 10, y0 - 40); ctx.quadraticCurveTo(x0 + 90, lerp(y0, vy, 0.5), x0 + 10, lerp(y0 - 40, vy + 60, tr)); ctx.stroke(); ctx.restore();
  }
}
