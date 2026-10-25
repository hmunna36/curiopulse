// Venus from space, as the one picture: the Sun in the middle, Venus going round it (counterclockwise, seen from above
// the north pole) while it turns on its own axis the OTHER way (clockwise: backwards), very slowly. He stands on top of
// it like the Little Prince, so a turn of the planet is a turn of him.
// Numbers: one lap = 224.7 Earth days (a Venus year); one turn = 243.0 days (Margot et al. 2021: 243.0226). After one
// lap he has turned 224.7 / 243 = 92.5 % of the way round; he is back where he started 18 days later.
// World units (camera like everywhere else). Everything ambient runs on loopW().
'use strict';

const SP = { sun: [540, 760], R: 1100, rp: 300, hs: 0.42, year: 224.7, day: 243.0 };
let SP_STARS = null, SP_TEX = null, SP_NEB = null;

function initSpace() {
  const rng = mulberry32(2430);
  SP_STARS = [...Array(520)].map(() => ({ x: -2600 + rng() * 6300, y: -2600 + rng() * 7000, r: 0.8 + rng() * 2.4, a: 0.3 + rng() * 0.7, ph: rng() * 6.28, w: 0.6 + rng() * 1.8, warm: rng() < 0.2 }));
  // the planet seen from above its pole: pale butterscotch cloud tops in a slow spiral round the polar vortex
  SP_TEX = mkCanvas(640, 640);
  const c = SP_TEX.getContext('2d');
  c.translate(320, 320);
  const g = c.createRadialGradient(-30, -30, 20, 0, 0, 300);
  g.addColorStop(0, '#FFF2D0'); g.addColorStop(0.55, '#F2D59A'); g.addColorStop(0.85, '#DDB070'); g.addColorStop(1, '#C8924E');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 300, 0, 7); c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, 298, 0, 7); c.clip();
  for (let k = 0; k < 9; k++) {                                   // spiral cloud bands
    const dark = k % 2 === 0, a0 = k * 0.7;
    c.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, r = 18 + 300 * u, a = a0 + u * 5.4;
      i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.lineWidth = 10 + 34 * hash(k + 3); c.lineCap = 'round';
    c.strokeStyle = dark ? 'rgba(170,110,50,0.22)' : 'rgba(255,248,226,0.30)'; c.stroke();
  }
  for (let i = 0; i < 70; i++) {                                  // streaks
    const a = rng() * 6.28, r = 60 + rng() * 230, L = 0.2 + 0.5 * rng();
    c.beginPath(); c.arc(0, 0, r, a, a + L); c.lineWidth = 3 + 9 * rng(); c.strokeStyle = rng() < 0.5 ? 'rgba(160,100,46,0.18)' : 'rgba(255,250,232,0.22)'; c.stroke();
  }
  const v = c.createRadialGradient(0, 0, 0, 0, 0, 60);              // the vortex's eye
  v.addColorStop(0, 'rgba(150,92,40,0.4)'); v.addColorStop(1, 'rgba(150,92,40,0)');
  c.fillStyle = v; c.beginPath(); c.arc(0, 0, 60, 0, 7); c.fill();
  c.restore();
  // a faint band of the galaxy behind everything
  SP_NEB = mkCanvas(1200, 1200);
  const n = SP_NEB.getContext('2d');
  n.filter = 'blur(40px)';
  for (let i = 0; i < 26; i++) { n.fillStyle = rgba(i % 3 ? '#4A3A8A' : '#7A3A6A', 0.18); n.beginPath(); n.ellipse(100 + i * 40, 1100 - i * 38 + 60 * Math.sin(i), 160, 90, -0.8, 0, 7); n.fill(); }
  n.filter = 'none';
}

// where things are, for d = Earth days since the start (frame 1 of the lap)
const spOrbitAng = (d) => Math.PI / 2 - (2 * Math.PI * d) / SP.year;          // decreasing = counterclockwise on screen
const spPos = (d) => { const a = spOrbitAng(d); return [SP.sun[0] + SP.R * Math.cos(a), SP.sun[1] + SP.R * Math.sin(a)]; };
const spHeroAng = (d) => -Math.PI / 2 + (2 * Math.PI * d) / SP.day;            // increasing = clockwise: backwards
const spOnPlanet = (C, a, h = 0) => [C[0] + (SP.rp + h) * Math.cos(a), C[1] + (SP.rp + h) * Math.sin(a)];

// the black, the galaxy, the stars (they sit far away: a little parallax)
function spBack(cam, t, o = {}) {
  screenSpace();
  ctx.fillStyle = '#03030C'; ctx.fillRect(0, 0, W, H);
  const pc = parallax(cam, 0.12);
  ctx.save(); ctx.globalAlpha = 0.9; ctx.drawImage(SP_NEB, -60 - (pc.x - 540) * 0.2, 300 - (pc.y - 960) * 0.2, 1200, 1200); ctx.restore();
  paint(() => {
    for (const s of SP_STARS) {
      const [x, y] = toScreen(pc, s.x, s.y);
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const tw = 0.7 + 0.3 * Math.sin(t * loopW(s.w) + s.ph);
      circle(ctx, x, y, s.r, rgba(s.warm ? '#FFE2B8' : '#DCE6FF', s.a * tw * (o.k === undefined ? 1 : o.k)));
    }
  });
}

// the Sun: a white-hot disc, a corona, and a wide glow in the glow layer
function spSun(cam, t, k = 1) {
  applyCam(cam);
  const [x, y] = SP.sun, r = 150;
  softDot(ctx, x, y, r * 6, '#FF9A3C', 0.16 * k);
  softDot(ctx, x, y, r * 3, '#FFC870', 0.3 * k);
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * loopW(0.05));
    for (let i = 0; i < 18; i++) {                                // corona streamers
      ctx.rotate(Math.PI * 2 / 18);
      const L = r * (1.5 + 0.6 * hash(i + 4) + 0.15 * Math.sin(t * loopW(0.7) + i));
      const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, rgba('#FFE7A0', 0.55 * k)); g.addColorStop(1, rgba('#FFB050', 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 0.22); ctx.lineTo(L, 0); ctx.lineTo(r * 0.8, r * 0.22); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const g = ctx.createRadialGradient(x - 30, y - 30, 10, x, y, r);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.6, '#FFF6D6'); g.addColorStop(0.92, '#FFD27A'); g.addColorStop(1, '#FFB04C');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  });
  softDot(gctx, x, y, r * 2.6, '#FFD27A', 0.55 * k);
  circle(gctx, x, y, r * 0.95, rgba('#FFF6DA', 0.8 * k));
}

// the orbit: a faint dashed ring, and the lap so far as a glowing arc (d0 .. d1 days)
function spOrbit(cam, t, o = {}) {
  applyCam(cam);
  const z = cam.zoom, [x, y] = SP.sun;
  paint(() => {
    ctx.save(); ctx.setLineDash([22 / z, 22 / z]); ctx.lineDashOffset = -t * 30 / z;
    ctx.beginPath(); ctx.arc(x, y, SP.R, 0, 7); ctx.lineWidth = 3.5 / z; ctx.strokeStyle = rgba('#B8C4FF', 0.35 * (o.ring === undefined ? 1 : o.ring)); ctx.stroke();
    ctx.restore();
  });
  const d1 = o.d1 || 0;
  if (d1 > 0.3) {
    const a0 = spOrbitAng(0), a1 = spOrbitAng(Math.min(d1, SP.year));
    for (const [c, w, col, a] of [[ctx, 14 / z, '#FFD447', 0.95], [gctx, 26 / z, '#FFC23A', 0.6]]) {
      c.save(); c.beginPath(); c.arc(x, y, SP.R, a1, a0); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = rgba(col, a * (o.trail === undefined ? 1 : o.trail)); c.stroke(); c.restore();
    }
  }
}

// the planet. C = centre (world), spin = the angle its clouds have turned (rad), sunK = how much the Sun lights it
function spPlanet(cam, t, C, spin, o = {}) {
  applyCam(cam);
  const rp = SP.rp, sd = [SP.sun[0] - C[0], SP.sun[1] - C[1]], L = Math.hypot(sd[0], sd[1]) || 1, u = [sd[0] / L, sd[1] / L];
  // atmosphere: a thin warm halo on the sunlit limb
  softDot(ctx, C[0] + u[0] * rp * 0.2, C[1] + u[1] * rp * 0.2, rp * 1.35, '#FFD9A0', 0.2);
  circle(ctx, C[0], C[1], rp, '#E8C482');                          // the disc (opaque: the light stage knows its shape)
  paint(() => {
    ctx.save(); ctx.translate(C[0], C[1]); ctx.rotate(spin);
    ctx.drawImage(SP_TEX, -320 * rp / 300, -320 * rp / 300, 640 * rp / 300, 640 * rp / 300);
    ctx.restore();
    // night side: away from the Sun
    ctx.save(); ctx.beginPath(); ctx.arc(C[0], C[1], rp + 1, 0, 7); ctx.clip();
    const g = ctx.createLinearGradient(C[0] + u[0] * rp, C[1] + u[1] * rp, C[0] - u[0] * rp, C[1] - u[1] * rp);
    g.addColorStop(0, 'rgba(255,240,200,0.10)'); g.addColorStop(0.42, 'rgba(18,8,34,0)'); g.addColorStop(0.6, 'rgba(18,8,34,0.62)'); g.addColorStop(1, 'rgba(10,4,24,0.86)');
    ctx.fillStyle = g; ctx.fillRect(C[0] - rp - 4, C[1] - rp - 4, 2 * rp + 8, 2 * rp + 8);
    ctx.restore();
    ctx.beginPath(); ctx.arc(C[0], C[1], rp, Math.atan2(u[1], u[0]) - 1.2, Math.atan2(u[1], u[0]) + 1.2);
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,236,190,0.75)'; ctx.stroke();
  });
  gctx.save(); gctx.beginPath(); gctx.arc(C[0], C[1], rp, Math.atan2(u[1], u[0]) - 1.1, Math.atan2(u[1], u[0]) + 1.1);
  gctx.lineWidth = 16; gctx.strokeStyle = 'rgba(255,214,150,0.35)'; gctx.stroke(); gctx.restore();
  if (o.zzz) zzz(C[0] + rp * 0.55, C[1] - rp * 0.2, t, o.zzz, 0.9, 1.2);
}

// where he started: a dashed line straight "up" from the planet (fixed against the stars: that is what a day measures)
function spStart(cam, C, k = 1) {
  if (k <= 0.01) return;
  applyCam(cam);
  const z = cam.zoom, a = -Math.PI / 2, p0 = spOnPlanet(C, a, 10), p1 = spOnPlanet(C, a, 300);
  paint(() => {
    ctx.save(); ctx.setLineDash([16 / z * 1.4, 12 / z * 1.4]);
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k));
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(127,233,255,0.9)'; ctx.stroke(); ctx.restore();
  });
}
// the turn so far: an arc just outside the planet from the start line, clockwise to where he is
function spDial(cam, C, a1, k = 1, done = 0) {
  if (k <= 0.01) return;
  applyCam(cam);
  const a0 = -Math.PI / 2, R = SP.rp + 46;
  for (const [c, w, col, al] of [[ctx, 16, done > 0.5 ? '#4DFFB4' : '#7FE9FF', 0.95], [gctx, 30, '#7FE9FF', 0.5]]) {
    c.save(); c.beginPath(); c.arc(C[0], C[1], R, a0, a0 + (a1 - a0) * k); c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = rgba(col, al); c.stroke(); c.restore();
  }
  // an arrowhead at the moving end
  const ae = a0 + (a1 - a0) * k, p = [C[0] + R * Math.cos(ae), C[1] + R * Math.sin(ae)], tg = [-Math.sin(ae), Math.cos(ae)];
  ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.atan2(tg[1], tg[0]));
  ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-8, -18); ctx.lineTo(-8, 18); ctx.closePath(); ctx.fillStyle = done > 0.5 ? '#4DFFB4' : '#7FE9FF'; ctx.fill();
  ctx.restore();
}

// a label pill in screen space: big text, a small line above it
function spPill(txt, sub, x, y, col, k, size = 64) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.35;
  rrect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 18); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, 3);
  if (sub) {
    ctx.font = '900 26px Montserrat';
    const sw = ctx.measureText(sub).width + 26;
    rrect(ctx, -sw / 2, -h / 2 - 44, sw, 36, 18); ctx.fillStyle = '#0B0B1A'; ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(sub, 0, -h / 2 - 25);
  }
  ctx.restore();
}
// the day counter at the top of the frame
function spCounter(d, k, x = 540, y = 520) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -190, -70, 380, 140, 26); ctx.fillStyle = 'rgba(8,8,24,0.86)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(127,233,255,0.6)'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 30px Montserrat'; ctx.fillStyle = '#BFF0FF'; ctx.fillText('EARTH DAYS', 0, -40);
  ctx.font = '400 92px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(Math.round(d)), 0, 22);
  ctx.restore();
}
// a little spinning globe with a curved arrow (screen space): the weird fact's EARTH vs VENUS
function spMiniGlobe(x, y, r, t, dir, col, label, k, mark = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(ctx, 0, 0, r + 6, '#0B0B1A');
  circle(ctx, 0, 0, r, col);
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
    for (let i = -2; i <= 2; i++) {                                // meridians that slide round: the spin
      const ph = ((dir * t * 1.6 + i * 0.6) % 3 + 3) % 3 - 1.5, xx = Math.sin(ph) * r;
      ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(xx), r, 0, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.stroke();
    }
    ctx.restore();
    // the arrow round it, in the way it turns
    ctx.beginPath(); ctx.arc(0, 0, r + 22, dir > 0 ? -2.6 : -0.54, dir > 0 ? -0.54 : -2.6, dir < 0);
    ctx.lineWidth = 9; ctx.strokeStyle = mark ? '#FF5A6E' : '#FFFFFF'; ctx.stroke();
    const ae = -0.54, ae2 = -2.6, e = dir > 0 ? ae : ae2, p = [(r + 22) * Math.cos(e), (r + 22) * Math.sin(e)];
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(e + (dir > 0 ? Math.PI / 2 : -Math.PI / 2));
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -14); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fillStyle = mark ? '#FF5A6E' : '#FFFFFF'; ctx.fill();
    ctx.restore();
    ctx.font = '900 38px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(label, 0, r + 66); ctx.fillStyle = '#FFFFFF'; ctx.fillText(label, 0, r + 66);
  });
  ctx.restore();
}
