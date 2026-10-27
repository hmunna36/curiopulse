// How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 — space (screen space, drawn under a simple 2D camera).
// A starfield with a violet-blue nebula (painted once), a NEUTRON STAR that spins fast: a blinding blue-white ball, hot spots
// sweeping over it, magnetic field loops and two lighthouse beams from its tilted magnetic poles; the SUN (granulation
// painted once, limb darkening, prominences) that caves in; a night CITY skyline with lit windows (painted once) for the
// "size of a city" comparison.
'use strict';

let NS_STARS = null, NS_GRAN = null, NS_CITY_FAR = null, NS_CITY_NEAR = null;

function initSpace() {
  // ---- stars and a nebula (screen space, a little bigger than the frame so it can drift)
  {
    const c = mkCanvas(W + 200, H + 200), x = c.getContext('2d');
    x.fillStyle = '#03040C'; x.fillRect(0, 0, c.width, c.height);
    const neb = [[260, 520, 520, '#3A2A7A', 0.55], [860, 900, 600, '#1E3C7A', 0.5], [500, 1500, 560, '#4A2468', 0.45], [980, 260, 380, '#2A2E6E', 0.4]];
    for (const [nx, ny, nr, col, a] of neb) {
      const g = x.createRadialGradient(nx, ny, 0, nx, ny, nr); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    }
    const rng = mulberry32(303);
    for (let i = 0; i < 900; i++) {
      const sx = rng() * c.width, sy = rng() * c.height, r = Math.pow(rng(), 3) * 2.4 + 0.4;
      const tint = rng();
      x.fillStyle = tint < 0.15 ? `rgba(255,220,190,${0.4 + 0.6 * rng()})` : tint < 0.3 ? `rgba(190,215,255,${0.4 + 0.6 * rng()})` : `rgba(240,242,255,${0.3 + 0.6 * rng()})`;
      x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
      if (r > 2) { const g = x.createRadialGradient(sx, sy, 0, sx, sy, r * 5); g.addColorStop(0, 'rgba(220,230,255,0.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); x.fillStyle = g; x.fillRect(sx - r * 5, sy - r * 5, r * 10, r * 10); }
    }
    NS_STARS = c;
  }
  // ---- the Sun's granulation: bright cells with dark lanes (a tile drawn round the disc)
  {
    const S = 700, c = mkCanvas(S, S), x = c.getContext('2d');
    x.fillStyle = '#F07A1E'; x.fillRect(0, 0, S, S);
    const rng = mulberry32(77);
    for (let i = 0; i < 2600; i++) {
      const cx = rng() * S, cy = rng() * S, r = 5 + rng() * 11;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,${170 + 50 * rng()},${70 + 50 * rng()},0.8)`); g.addColorStop(1, 'rgba(255,130,30,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    }
    for (let i = 0; i < 9; i++) {                       // a few sunspots
      const cx = rng() * S, cy = 150 + rng() * 400, r = 6 + rng() * 12;
      x.fillStyle = 'rgba(120,40,10,0.85)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      x.fillStyle = 'rgba(200,90,30,0.6)'; x.beginPath(); x.arc(cx, cy, r * 1.8, 0, 7); x.fill();
    }
    NS_GRAN = c;
  }
  // ---- the city at night: far towers and near blocks, lit windows (world: x 0..1080, the street at y = 0)
  const city = (seed, n, hMin, hMax, col, win, W0) => {
    const c = mkCanvas(1400, 900), x = c.getContext('2d');
    const rng = mulberry32(seed);
    let px = 0;
    while (px < 1400) {
      const w = 50 + rng() * W0, h = hMin + rng() * (hMax - hMin);
      x.fillStyle = col; x.fillRect(px, 900 - h, w, h);
      if (rng() > 0.6) { x.fillRect(px + w * 0.4, 900 - h - 40 - rng() * 60, 4, 60); }          // an antenna
      if (rng() > 0.7) { x.beginPath(); x.moveTo(px, 900 - h); x.lineTo(px + w / 2, 900 - h - w * 0.4); x.lineTo(px + w, 900 - h); x.fill(); }
      for (let wy = 900 - h + 14; wy < 900 - 10; wy += 18) for (let wx = px + 8; wx < px + w - 8; wx += 14) {
        if (rng() < win) { x.fillStyle = rng() < 0.8 ? 'rgba(255,214,140,0.9)' : 'rgba(170,220,255,0.9)'; x.fillRect(wx, wy, 6, 9); }
      }
      x.fillStyle = col;
      px += w + 2 + rng() * 10;
    }
    return c;
  };
  NS_CITY_FAR = city(41, 30, 220, 640, '#141A3C', 0.28, 90);
  NS_CITY_NEAR = city(42, 20, 120, 380, '#0A0D22', 0.35, 130);
}

function spaceBg(t, o = {}) {
  screenSpace();
  const dx = (o.dx || 0) + 18 * Math.sin(t * 0.1), dy = (o.dy || 0);
  ctx.drawImage(NS_STARS, -100 + dx, -100 + dy);
  const rng = mulberry32(12);
  for (let i = 0; i < 18; i++) {                         // twinkling stars (they loop)
    const sx = rng() * W, sy = rng() * H, ph = rng() * 6.28, a = 0.4 + 0.4 * Math.sin(loopW(0.7 + rng()) * t + ph);
    softDot(gctx, sx + dx, sy + dy, 8, '#DDE6FF', a); circle(ctx, sx + dx, sy + dy, 1.8, `rgba(245,248,255,${a})`);
  }
}

// ---- the neutron star at (x, y) screen, radius R. o: {spin (turns per second), tilt (the magnetic axis off the spin axis),
// beams 0..1, field 0..1, glow, scoop: [x, y] (a string of its stuff pulled up to a spoon)}
function nsStar(x, y, R, t, o = {}) {
  const spin = (o.spin === undefined ? 1.6 : o.spin) * t * Math.PI * 2, tilt = o.tilt === undefined ? 0.5 : o.tilt;
  const glow = o.glow === undefined ? 1 : o.glow;
  // the corona
  softDot(gctx, x, y, R * 4.2, '#5FB4FF', 0.35 * glow);
  softDot(gctx, x, y, R * 2.0, '#BFE8FF', 0.6 * glow);
  softDot(ctx, x, y, R * 2.6, '#4F8FE0', 0.25 * glow);
  // the magnetic axis, turning round the spin axis (vertical): direction in 3D, then on screen
  const ax = [Math.sin(tilt) * Math.cos(spin), -Math.cos(tilt), Math.sin(tilt) * Math.sin(spin)];
  const beams = o.beams === undefined ? 1 : o.beams;
  const beam = (s) => {
    const d = [ax[0] * s, ax[1] * s], z = ax[2] * s;
    const L = R * 9, w0 = R * 0.12, w1 = R * (1.1 + 0.6 * Math.max(0, z));
    const bx = x + d[0] * R * 0.95, by = y + d[1] * R * 0.95, ex = x + d[0] * L, ey = y + d[1] * L;
    const nx = -d[1], ny = d[0], nl = Math.hypot(nx, ny) || 1;
    for (const [c, g] of [[ctx, false], [gctx, true]]) {
      const grd = c.createLinearGradient(bx, by, ex, ey);
      const a0 = (g ? 0.9 : 0.55) * beams * (0.55 + 0.45 * Math.max(0, z));
      grd.addColorStop(0, `rgba(220,245,255,${a0})`); grd.addColorStop(0.35, `rgba(140,205,255,${a0 * 0.45})`); grd.addColorStop(1, 'rgba(120,190,255,0)');
      c.fillStyle = grd; c.beginPath();
      c.moveTo(bx + nx / nl * w0, by + ny / nl * w0); c.lineTo(ex + nx / nl * w1, ey + ny / nl * w1);
      c.lineTo(ex - nx / nl * w1, ey - ny / nl * w1); c.lineTo(bx - nx / nl * w0, by - ny / nl * w0); c.closePath(); c.fill();
    }
    return z;
  };
  // the beam behind the star first, then the star, then the beam in front
  const zA = ax[2];
  if (zA < 0) beam(1); else beam(-1);
  // the body
  const g = ctx.createRadialGradient(x - R * 0.25, y - R * 0.3, R * 0.05, x, y, R);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.55, '#E4F6FF'); g.addColorStop(0.85, '#A8DBFF'); g.addColorStop(1, '#78B8F4');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
  // hot spots and cracks sweeping round it (they show how fast it spins)
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  const rng = mulberry32(8);
  for (let i = 0; i < 14; i++) {
    const lon = rng() * 6.28 + spin, lat = (rng() - 0.5) * 2.4, sz = R * (0.08 + 0.12 * rng());
    const cl = Math.cos(lon); if (cl <= 0.02) continue;
    const px = x + R * Math.cos(lat) * Math.sin(lon), py = y - R * Math.sin(lat) * 0.98;
    ctx.fillStyle = rng() > 0.5 ? 'rgba(120,180,255,0.35)' : 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(px, py, sz * cl, sz, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
  softDot(gctx, x, y, R * 1.05, '#FFFFFF', 0.85 * glow);
  // the field loops (a dipole round the magnetic axis), thin and glowing
  const fk = o.field === undefined ? 1 : o.field;
  if (fk > 0.01) {
    const ang = Math.atan2(ax[0], -ax[1]);
    for (let i = 1; i <= 4; i++) {
      const Lr = R * (1.5 + 0.75 * i);
      for (const side of [-1, 1]) {
        const pts = [];
        for (let k = 0; k <= 40; k++) {
          const th = 0.2 + (k / 40) * (Math.PI - 0.4), r = Lr * Math.sin(th) * Math.sin(th);
          if (r < R * 1.02) continue;
          const lx = side * r * Math.sin(th), ly = -r * Math.cos(th);
          pts.push([x + lx * Math.cos(ang) - ly * Math.sin(ang), y + lx * Math.sin(ang) + ly * Math.cos(ang)]);
        }
        for (const [c, w, col] of [[ctx, 2.5, `rgba(150,215,255,${0.45 * fk})`], [gctx, 6, `rgba(120,200,255,${0.5 * fk})`]]) {
          c.lineWidth = w; c.strokeStyle = col; c.beginPath(); for (const p of pts) c.lineTo(p[0], p[1]); c.stroke();
        }
      }
    }
  }
  if (zA < 0) beam(-1); else beam(1);
  // a flare when a beam points at us
  const face = Math.max(0, Math.abs(zA) - 0.35) / 0.65;
  return { flare: face * beams };
}

// ---- the Sun at (x, y), radius R; o: {k: 0..1 how far it has caved in (colour toward blue-white, spin), rot, prom}
function nsSun(x, y, R, t, o = {}) {
  const k = o.k || 0;
  const hot = clamp((k - 0.5) / 0.5);
  softDot(gctx, x, y, R * 2.4, mixH('#FF9A40', '#9FD8FF', hot), 0.32);
  softDot(ctx, x, y, R * 1.7, mixH('#FF8A30', '#4F9FE8', hot), 0.3);
  // prominences at the limb (they shrink away as it caves in)
  const pk = (o.prom === undefined ? 1 : o.prom) * (1 - clamp(k * 2));
  if (pk > 0.01) {
    for (let i = 0; i < 4; i++) {
      const a = -2.4 + i * 1.3 + 0.1 * Math.sin(t + i), h = R * (0.14 + 0.06 * Math.sin(t * 0.8 + i * 2));
      for (const [c, w, col] of [[ctx, R * 0.035, 'rgba(255,110,60,0.85)'], [gctx, R * 0.07, 'rgba(255,140,70,0.6)']]) {
        c.lineWidth = w * pk; c.strokeStyle = col; c.lineCap = 'round'; c.beginPath();
        for (let j = 0; j <= 16; j++) { const u = j / 16, aa = a + (u - 0.5) * 0.22, rr = R + h * Math.sin(Math.PI * u) * pk; c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
        c.stroke();
      }
    }
  }
  // the disc: granulation, turning; limb darkening
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
  ctx.translate(x, y); ctx.rotate((o.rot || 0) + t * 0.05);
  const s = (R * 2.2) / NS_GRAN.width;
  ctx.globalAlpha = 1 - hot;
  ctx.drawImage(NS_GRAN, -NS_GRAN.width * s / 2, -NS_GRAN.height * s / 2, NS_GRAN.width * s, NS_GRAN.height * s);
  ctx.globalAlpha = 1;
  ctx.rotate(-((o.rot || 0) + t * 0.05)); ctx.translate(-x, -y);
  if (hot > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(255,255,255,${hot})`); g.addColorStop(1, `rgba(150,210,255,${hot})`); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); }
  const lg = ctx.createRadialGradient(x, y, R * 0.55, x, y, R);
  lg.addColorStop(0, 'rgba(120,30,0,0)'); lg.addColorStop(0.7, `rgba(120,30,0,${0.18 * (1 - hot)})`); lg.addColorStop(1, `rgba(110,20,0,${0.7 * (1 - hot)})`);
  ctx.fillStyle = lg; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
  ctx.restore();
  softDot(gctx, x, y, R * 1.02, mixH('#FFC070', '#FFFFFF', hot), 0.16 + 0.6 * hot);
}

// ---- the city at night (screen space): far towers and near blocks standing on y = base, centred on x
function nsCity(x, base, w, t, o = {}) {
  const sF = w / 1400;
  ctx.drawImage(NS_CITY_FAR, x - w / 2, base - 900 * sF - 30 * sF, w, 900 * sF);
  ctx.drawImage(NS_CITY_NEAR, x - w / 2 - 60 * sF, base - 900 * sF, w * 1.09, 900 * sF);
  // the light from above falls on the rooftops
  if (o.lit > 0) {
    const g = ctx.createLinearGradient(0, base - 700 * sF, 0, base);
    g.addColorStop(0, `rgba(170,215,255,${0.35 * o.lit})`); g.addColorStop(1, 'rgba(170,215,255,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - w / 2 - 80, base - 700 * sF, w + 160, 700 * sF); ctx.restore();
  }
}

// a measuring line with end ticks and a label (screen)
function nsSpan(x0, x1, y, k, txt, col = '#FFD447') {
  if (k <= 0.01) return;
  const xm = (x0 + x1) / 2, h = (x1 - x0) / 2 * E.outCubic(clamp(k * 1.3));
  ctx.save(); ctx.lineCap = 'round';
  for (const [w, c] of [[9, 'rgba(10,12,34,0.8)'], [4, col]]) {
    line(ctx, xm - h, y, xm + h, y, w, c);
    line(ctx, xm - h, y - 18, xm - h, y + 18, w, c); line(ctx, xm + h, y - 18, xm + h, y + 18, w, c);
  }
  ctx.restore();
  if (txt && k > 0.4) ncPillLabel(txt, xm, y - 56, E.outBack(clamp((k - 0.4) / 0.6)), col, 40);
}
