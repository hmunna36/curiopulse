// The summit: a clear morning above a sea of clouds. A far plate painted once (sky, snowy peaks, the cloud sea) drawn
// with parallax behind everything; the rocky top he stands on, a cairn with a flag, a string of prayer flags, his
// backpack and a thermos; a camera on a tripod with a self-timer lamp and a flash. World = 1080x1920 at zoom 1; he
// stands at (FAW.hx, FAW.hy). Everything that moves runs on loopW(), so the last frame meets the first.
'use strict';

const FAW = { hx: 540, hy: 1700, hs: 1.0, twinX: 760, sun: [900, 520] };
const FA_FLAGS = ['#2E6BFF', '#F4F7FF', '#FF4D4D', '#2FBF71', '#FFD447'];
let FA_FAR = null, FA_FARB = null;

function initSummit() {
  const w = 1080, h = 1920;
  FA_FAR = mkCanvas(w, h);
  const c = FA_FAR.getContext('2d');
  // the sky: deep blue at the top, pale where it meets the cloud sea
  const g = c.createLinearGradient(0, 0, 0, 1250);
  g.addColorStop(0, '#0B4BC4'); g.addColorStop(0.45, '#2B86E8'); g.addColorStop(0.8, '#7CC4F6'); g.addColorStop(1, '#CDEBFF');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // far snowy peaks poking out of the clouds
  const rng = mulberry32(808);
  const peaks = [[-60, 1150, 240], [150, 1090, 300], [390, 1160, 200], [640, 1060, 330], [880, 1130, 260], [1100, 1080, 300]];
  for (const [px, py, ww] of peaks) {
    const top = py - 0;
    c.fillStyle = '#6F8FC4';
    c.beginPath(); c.moveTo(px - ww, 1300); c.lineTo(px - ww * 0.15, top + 30); c.lineTo(px, top); c.lineTo(px + ww * 0.2, top + 40); c.lineTo(px + ww, 1300); c.closePath(); c.fill();
    // the lit side
    c.fillStyle = '#8FAEDC';
    c.beginPath(); c.moveTo(px, top); c.lineTo(px + ww * 0.2, top + 40); c.lineTo(px + ww, 1300); c.lineTo(px + ww * 0.25, 1300); c.closePath(); c.fill();
    // snow
    c.fillStyle = '#F4F8FF';
    c.beginPath(); c.moveTo(px - ww * 0.15, top + 30); c.lineTo(px, top); c.lineTo(px + ww * 0.2, top + 40);
    c.lineTo(px + ww * 0.28, top + 92); c.lineTo(px + ww * 0.12, top + 70); c.lineTo(px + ww * 0.02, top + 104); c.lineTo(px - ww * 0.1, top + 72); c.lineTo(px - ww * 0.26, top + 96); c.closePath(); c.fill();
  }
  // the cloud sea: rows of soft puffs, lit from the upper right
  for (let row = 0; row < 5; row++) {
    const y0 = 1170 + row * 46, n = 22;
    for (let i = 0; i < n; i++) {
      const x = -60 + (i + rng() * 0.6) * (w + 120) / n, r = 46 + rng() * 40 + row * 6, y = y0 + rng() * 26;
      c.fillStyle = row < 2 ? '#DCEBFA' : '#C6DBF2';
      c.beginPath(); c.arc(x, y + 10, r, 0, 7); c.fill();
      c.fillStyle = row < 2 ? '#FFFFFF' : '#EAF3FD';
      c.beginPath(); c.arc(x + r * 0.15, y - r * 0.08, r * 0.82, 0, 7); c.fill();
    }
  }
  c.fillStyle = '#C6DBF2'; c.fillRect(0, 1380, w, h - 1380);
  // a blurred copy for close shots
  FA_FARB = mkCanvas(w, h);
  const b = FA_FARB.getContext('2d');
  b.filter = 'blur(7px)'; b.drawImage(FA_FAR, 0, 0); b.filter = 'none';
}

// the far plate in screen space. It zooms and slides far less than the world (parallax). o.dy moves the horizon
// (a low camera puts it lower: + ; a high camera higher: -)
function faFar(cam, t, o = {}) {
  screenSpace();
  const z = 1 + (cam.zoom - 1) * 0.16, ox = -(cam.x - 540) * 0.1 * cam.zoom, oy = -(cam.y - 1350) * 0.08 * cam.zoom + (o.dy || 0);
  const x0 = 540 - 540 * z + ox, y0 = 960 - 960 * z + oy;
  // the plate never leaves a gap: the top sky colour behind it (a low camera pushes it down)
  ctx.fillStyle = '#0B4BC4'; ctx.fillRect(0, 0, 1080, 1920);
  ctx.drawImage(FA_FAR, x0, y0, 1080 * z, 1920 * z);
  const bl = clamp((cam.zoom - 1.6) / 1.2);
  if (bl > 0.02) { ctx.globalAlpha = bl; ctx.drawImage(FA_FARB, x0, y0, 1080 * z, 1920 * z); ctx.globalAlpha = 1; }
  // the sun, high on the right (glow layer), and two small clouds drifting past
  const sx = x0 + FAW.sun[0] * z, sy = y0 + FAW.sun[1] * z;
  if (o.sun !== false) {
    softDot(ctx, sx, sy, 210, '#FFF6D0', 0.35);
    softDot(gctx, sx, sy, 140, '#FFF3C4', 0.45);
    circle(ctx, sx, sy, 46, '#FFFDF0');
  }
  for (let i = 0; i < (o.clouds === false ? 0 : 2); i++) {
    const dx = 60 * Math.sin(t * loopW(0.09) + i * 2.4);
    const cx = x0 + (i ? 230 : 820) * z + dx, cy = y0 + (i ? 860 : 990) * z;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (const [px, py, r] of [[-70, 0, 34], [-24, -22, 46], [30, -26, 50], [80, -6, 36]]) { ctx.beginPath(); ctx.arc(cx + px * z, cy + py * z, r * z, 0, 7); ctx.fill(); }
    ctx.fillRect(cx - 90 * z, cy - 4 * z, 200 * z, 30 * z);
  }
}

// the prayer flags on a line between two world points, fluttering (drawn as set: behind him)
function faFlagLine(c, a, b, t, n = 14, sag = 70) {
  const P = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * 4 * u * (1 - u)];
  c.lineWidth = 3; c.strokeStyle = '#3A2A20'; c.beginPath();
  for (let i = 0; i <= 30; i++) { const p = P(i / 30); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
  for (let i = 0; i < n; i++) {
    const u0 = (i + 0.15) / n, u1 = (i + 0.85) / n, p0 = P(u0), p1 = P(u1);
    const wv = Math.sin(t * loopW(3.1) + i * 0.9), wl = 46 + 8 * wv;
    c.fillStyle = FA_FLAGS[i % 5];
    c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]);
    c.lineTo(lerp(p0[0], p1[0], 0.5) + 10 * wv, (p0[1] + p1[1]) / 2 + wl);
    c.closePath(); c.fill();
  }
}

// the rocky top: drawn before him (o.twin: room for two)
function faGround(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx, Y = FAW.hy + 4;
  // the summit block
  c.fillStyle = '#5B4E58';
  c.beginPath(); c.moveTo(-600, Y + 120); c.lineTo(-120, Y + 30); c.lineTo(200, Y - 6); c.lineTo(860, Y - 4); c.lineTo(1180, Y + 40); c.lineTo(1700, Y + 140);
  c.lineTo(1700, 2800); c.lineTo(-600, 2800); c.closePath(); c.fill();
  c.fillStyle = '#8A7A7E';
  c.beginPath(); c.moveTo(-600, Y + 120); c.lineTo(-120, Y + 30); c.lineTo(200, Y - 6); c.lineTo(860, Y - 4); c.lineTo(1180, Y + 40); c.lineTo(1700, Y + 140);
  c.lineTo(1700, Y + 190); c.lineTo(1160, Y + 86); c.lineTo(860, Y + 44); c.lineTo(200, Y + 42); c.lineTo(-120, Y + 76); c.lineTo(-600, Y + 170); c.closePath(); c.fill();
  paint(() => {
    // snow patches and cracks
    c.fillStyle = 'rgba(244,248,255,0.95)';
    for (const [x, y, rx, ry] of [[40, Y + 64, 70, 12], [330, Y + 30, 46, 8], [980, Y + 46, 80, 13], [700, Y + 70, 40, 7]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(40,30,40,0.5)'; c.lineWidth = 4;
    for (const [x, y] of [[120, Y + 90], [520, Y + 60], [860, Y + 80]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y + 40); c.lineTo(x + 18, y + 90); c.stroke(); }
  });
  // the cairn and its pole on the right, the flag pole on the left
  const cx0 = o.twin ? 1010 : 930;
  [[cx0, Y - 14, 64, 24, '#7C6E74'], [cx0 - 4, Y - 50, 52, 20, '#958489'], [cx0 + 4, Y - 82, 40, 16, '#7C6E74'], [cx0, Y - 106, 28, 12, '#958489']].forEach(([x, y, rx, ry, col]) => ellipse(c, x, y, rx, ry, col));
  line(c, cx0, Y - 110, cx0, Y - 520, 10, '#5A4636');
  const wv = Math.sin(t * loopW(2.6));
  c.fillStyle = '#FF4D4D'; c.beginPath(); c.moveTo(cx0, Y - 520); c.lineTo(cx0 - 120, Y - 496 + 8 * wv); c.lineTo(cx0, Y - 460); c.closePath(); c.fill();
  line(c, 70, Y + 10, 70, Y - 640, 10, '#5A4636');
  faFlagLine(c, [70, Y - 630], [cx0, Y - 515], t, 16, 110);
  // the summit sign
  c.fillStyle = '#7B5B3C'; c.fillRect(176, Y - 200, 14, 206);
  c.fillStyle = '#A67B4F'; c.beginPath(); c.moveTo(120, Y - 196); c.lineTo(254, Y - 196); c.lineTo(278, Y - 170); c.lineTo(254, Y - 144); c.lineTo(120, Y - 144); c.closePath(); c.fill();
  paint(() => { c.font = '900 24px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(43,27,18,0.9)'; c.fillText('SUMMIT', 196, Y - 169); });
  // his backpack and a thermos
  if (!o.noPack) {
    rrect(c, 236, Y - 150, 120, 150, 34); c.fillStyle = '#C9283E'; c.fill();
    rrect(c, 252, Y - 104, 88, 60, 14); c.fillStyle = '#A01E30'; c.fill();
    rrect(c, 228, Y - 196, 136, 44, 22); c.fillStyle = '#2FA88E'; c.fill();     // a rolled mat on top
    rrect(c, 382, Y - 96, 36, 96, 10); c.fillStyle = '#B8C2D6'; c.fill();       // the thermos
    rrect(c, 380, Y - 110, 40, 22, 6); c.fillStyle = '#5A6688'; c.fill();
  }
}

// the camera on a tripod, beside him: base at (x, y). o: {lamp 0..1 (the self-timer's blink), flash 0..1, s}
function faTripod(cam, t, x, y, o = {}) {
  applyCam(cam);
  const c = ctx, s = o.s || 1;
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const dx of [-60, 0, 60]) line(c, 0, -330, dx, 0, 9, '#2A2F44');
  rrect(c, -16, -350, 32, 40, 6); c.fillStyle = '#3A4058'; c.fill();
  // the camera, turned to face him (lens toward screen-left)
  rrect(c, -70, -430, 130, 84, 14); c.fillStyle = '#20232F'; c.fill();
  rrect(c, -40, -446, 50, 20, 6); c.fillStyle = '#20232F'; c.fill();
  circle(c, -78, -388, 34, '#141620'); circle(c, -84, -388, 22, '#3A5A8A');
  paint(() => { circle(c, -90, -394, 7, 'rgba(255,255,255,0.7)'); });
  const lamp = clamp(o.lamp || 0);
  circle(c, 34, -414, 9, lamp > 0.5 ? '#FF3B4E' : '#5A2030');
  c.restore();
  if (lamp > 0.5) softDot(gctx, x + 34 * s, y - 414 * s, 30 * s, '#FF3040', 0.9);
  const fl = clamp(o.flash || 0);
  if (fl > 0.01) {
    // world units (the camera's zoom multiplies them): a burst round the lens, not a white-out (13 Nov)
    softDot(gctx, x - 78 * s, y - 388 * s, 95 * s * (0.6 + fl), '#FFFFFF', 0.85 * fl);
    softDot(ctx, x - 78 * s, y - 388 * s, 42 * s * (0.6 + fl), '#FFFFFF', 0.8 * fl);
  }
}

// the near rocks along the bottom (in front of him)
function faNear(cam, t) {
  applyCam(cam);
  const c = ctx, Y = FAW.hy + 4;
  paint(() => {
    for (const [x, y, rx, ry] of [[-40, Y + 210, 160, 70], [1080, Y + 230, 190, 80]]) {
      ellipse(c, x, y, rx, ry, '#3E3440');
      ellipse(c, x + rx * 0.2, y - ry * 0.3, rx * 0.7, ry * 0.5, '#54474F');
    }
  });
}
