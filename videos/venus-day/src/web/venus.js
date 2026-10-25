// Venus, on the ground: an orange day under a lid of cloud that never opens (only about a tenth of the sunlight gets
// through, and the sky is orange-yellow), flat slabs of basalt to the horizon, broad volcanoes in the haze, heat shimmer.
// The far plate (sky, cloud deck, volcanoes) is painted once and drawn with parallax; the ground is a 2.5D plane like
// lake-natron's water: u = 0 at the horizon (parallax VN.pFar), u = 1 at the near line (world y VN.near).
// And his birthday there: a cake with a "1" candle whose flame is a BULB (no oxygen here, and it does not care when he
// blows), a desk calendar whose month flap flips while its day flap says MONDAY, bunting, a deck chair, a party popper.
// World = 1080x1920 at zoom 1. Everything ambient runs on loopW(), so the last frame meets the first.
'use strict';

const VN = { hor: 990, pFar: 0.24, near: 1720, vpx: 540, hx: 600, hy: 1650, hs: 1.0, glow: [900, 300], volc: [250, 860], volc2: [1180, 930] };
const VN_PL = { x0: -900, y0: -1500, w: 2900, h: 2560, res: 0.9 };
let VN_PLATE = null, VN_PLATE_SOFT = null, VN_SLABS = null, VN_DOTS = null, VN_DUST = null, VN_MOTES = null;
const VN_SKY = [[-1500, '#2A1208'], [-800, '#4E220E'], [-200, '#8C4016'], [350, '#C86A24'], [720, '#E8963C'], [900, '#F6B95C'], [990, '#FFD992']];

function vnSkyAt(y) {
  for (let i = 1; i < VN_SKY.length; i++) if (y <= VN_SKY[i][0]) {
    const a = VN_SKY[i - 1], b = VN_SKY[i];
    return mixH(a[1], b[1], (y - a[0]) / (b[0] - a[0]));
  }
  return VN_SKY[VN_SKY.length - 1][1];
}

// ---------------------------------------------------------------- the plate (painted once)
function vnPaintPlate(c) {
  const { hor } = VN;
  const g = c.createLinearGradient(0, VN_PL.y0, 0, hor + 30);
  for (const [y, col] of VN_SKY) g.addColorStop(clamp((y - VN_PL.y0) / (hor + 30 - VN_PL.y0)), col);
  c.fillStyle = g; c.fillRect(VN_PL.x0, VN_PL.y0, VN_PL.w, VN_PL.h);
  // where the Sun is, somewhere above the cloud: a wide, soft brightening (no disc ever shows)
  const [gx, gy] = VN.glow;
  for (const [r, col, a] of [[1500, '#FFB35A', 0.22], [900, '#FFC978', 0.24], [480, '#FFE2A4', 0.28], [220, '#FFF0C8', 0.3]]) {
    const rg = c.createRadialGradient(gx, gy, 0, gx, gy, r);
    rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0));
    c.fillStyle = rg; c.fillRect(gx - r, gy - r, 2 * r, 2 * r);
  }
  // the cloud deck: long streaks and heavy rolls, darker bellies; it thickens toward the top of the sky
  const rng = mulberry32(4242);
  for (let i = 0; i < 150; i++) {
    const y = VN_PL.y0 + 80 + Math.pow(rng(), 1.25) * (hor - 170 - VN_PL.y0), x = VN_PL.x0 + rng() * VN_PL.w;
    const depth = clamp((hor - y) / (hor - VN_PL.y0)), w = (260 + 900 * rng()) * (0.6 + 0.6 * depth), h = (14 + 46 * rng()) * (0.5 + depth);
    const near = clamp(1 - Math.hypot(x - gx, y - gy) / 1200);
    const lit = mixH(mixH('#E99A48', '#FFD38A', near), '#FFE9BE', near * near * 0.6), dark = mixH('#5A260E', '#8E4418', clamp(y / hor + 0.4));
    const dk = rng() < 0.45;
    c.fillStyle = rgba(dk ? dark : lit, dk ? 0.16 + 0.22 * depth : 0.10 + 0.22 * (1 - depth * 0.5));
    c.beginPath(); c.ellipse(x, y, w, h, (rng() - 0.5) * 0.06, 0, 7); c.fill();
    if (dk && rng() < 0.5) {                                                 // a roll's lit upper rim
      c.fillStyle = rgba(lit, 0.14); c.beginPath(); c.ellipse(x, y - h * 0.5, w * 0.8, h * 0.35, 0, 0, 7); c.fill();
    }
  }
  // far highlands along the horizon, washed out by the thick air
  const ridge = (y0, amp, seed, x0, x1, top, bot, step = 36) => {
    const r = mulberry32(seed), pts = [];
    for (let x = x0; x <= x1; x += step) pts.push([x, y0 - amp * (0.55 + 0.3 * Math.sin(x / 280 + seed) + 0.15 * Math.sin(x / 97 + seed * 2) + 0.1 * r())]);
    const lg = c.createLinearGradient(0, y0 - amp, 0, hor + 4);
    lg.addColorStop(0, top); lg.addColorStop(1, bot);
    c.fillStyle = lg; c.beginPath(); c.moveTo(x0, hor + 6); for (const p of pts) c.lineTo(p[0], p[1]);
    c.lineTo(x1, hor + 6); c.closePath(); c.fill();
  };
  ridge(hor - 4, 70, 3, VN_PL.x0, VN_PL.x0 + VN_PL.w, '#D58A48', '#F2B568');
  // two broad shield volcanoes (Venus's are wide and low, like Maat Mons): the near one has a vent that still glows
  const dome = (cx, base, hw, ht, a, b) => {
    c.beginPath(); c.moveTo(cx - hw, base);
    c.bezierCurveTo(cx - hw * 0.55, base - ht * 0.5, cx - hw * 0.3, base - ht, cx - 36, base - ht);
    c.lineTo(cx - 18, base - ht + 10); c.lineTo(cx + 12, base - ht + 6); c.lineTo(cx + 36, base - ht);
    c.bezierCurveTo(cx + hw * 0.3, base - ht, cx + hw * 0.55, base - ht * 0.5, cx + hw, base); c.closePath();
    const dg = c.createLinearGradient(0, base - ht, 0, base);
    dg.addColorStop(0, a); dg.addColorStop(1, b);
    c.fillStyle = dg; c.fill();
  };
  dome(VN.volc2[0], hor + 2, 520, 120, '#B8662C', '#EBA75C');
  dome(VN.volc[0], hor + 2, 700, VN.hor - VN.volc[1], '#9A4E22', '#E59E56');
  // the near volcano's lit flank (the glow is up and to the right) and its lava channels, faint red in the haze
  c.save(); dome(VN.volc[0], hor + 2, 700, VN.hor - VN.volc[1], 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'); c.clip();
  const lf = c.createLinearGradient(VN.volc[0] - 300, 0, VN.volc[0] + 700, 0);
  lf.addColorStop(0, 'rgba(70,20,6,0.28)'); lf.addColorStop(0.5, 'rgba(255,200,120,0)'); lf.addColorStop(1, 'rgba(255,214,140,0.22)');
  c.fillStyle = lf; c.fillRect(VN.volc[0] - 720, VN.volc[1] - 20, 1440, 200);
  const r2 = mulberry32(77);
  for (let i = 0; i < 5; i++) {
    const x0 = VN.volc[0] - 20 + 40 * r2(), y0 = VN.volc[1] + 8, a = -0.9 + 1.8 * r2(), L = 70 + 90 * r2();
    c.strokeStyle = rgba('#FF6A2A', 0.30 + 0.2 * r2()); c.lineWidth = 3 + 3 * r2(); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + Math.sin(a) * L * 0.5 + 20 * (r2() - 0.5), y0 + L * 0.5, x0 + Math.sin(a) * L * 1.3, y0 + L); c.stroke();
  }
  c.restore();
  // a band of thick haze along the horizon
  const hb = c.createLinearGradient(0, hor - 190, 0, hor + 10);
  hb.addColorStop(0, 'rgba(255,190,110,0)'); hb.addColorStop(0.7, 'rgba(255,196,120,0.38)'); hb.addColorStop(1, 'rgba(255,226,160,0.8)');
  c.fillStyle = hb; c.fillRect(VN_PL.x0, hor - 190, VN_PL.w, 200);
}

function initVenus() {
  const res = VN_PL.res, w = Math.round(VN_PL.w * res), h = Math.round(VN_PL.h * res);
  VN_PLATE = mkCanvas(w, h);
  const c = VN_PLATE.getContext('2d');
  c.setTransform(res, 0, 0, res, -VN_PL.x0 * res, -VN_PL.y0 * res);
  vnPaintPlate(c);
  VN_PLATE_SOFT = mkCanvas(w, h);
  const s = VN_PLATE_SOFT.getContext('2d');
  s.filter = 'blur(10px)'; s.drawImage(VN_PLATE, 0, 0); s.filter = 'none';
  // basalt slabs lying on the plain (Venera 13 saw flat, layered plates of rock): [world x at the near line, depth u, radius]
  const rng = mulberry32(1982);
  VN_SLABS = [];
  for (let i = 0; i < 70; i++) {
    const u = 0.03 + Math.pow(rng(), 1.6) * 1.25, wx = -1600 + rng() * 4200;
    VN_SLABS.push({ wx, u, r: 70 + 230 * rng(), seed: 300 + i, tone: rng(), step: rng() < 0.55 });
  }
  VN_SLABS.sort((a, b) => a.u - b.u);
  VN_DOTS = [...Array(320)].map(() => ({ wx: -1800 + rng() * 4600, u: 0.02 + Math.pow(rng(), 1.3) * 1.35, r: 3 + 9 * rng(), d: rng() }));
  VN_DUST = [...Array(9)].map((_, i) => ({ u: 0.06 + i * 0.13 + 0.05 * rng(), w: 700 + 900 * rng(), ph: rng() * 4000, sp: 18 + 22 * rng(), a: 0.07 + 0.07 * rng() }));
  VN_MOTES = [...Array(80)].map(() => ({ x: rng(), y: rng(), z: 0.25 + rng() * 0.75, ph: rng() * 6.28, w: 0.5 + rng() }));
}

// ---------------------------------------------------------------- the 2.5D ground
function vnPlane(cam, tilt = 0) {
  const pc = parallax(cam, VN.pFar);
  if (tilt) pc.sy = (pc.sy || 0) - tilt;
  const [vx, yH] = toScreen(pc, VN.vpx, VN.hor);
  const yN = toScreen(cam, 540, VN.near)[1];
  return { cam, pc, vx, yH, yN };
}
function vnAt(P, wx, u) {
  const xN = toScreen(P.cam, wx, VN.near)[0];
  return [P.vx + (xN - P.vx) * u, P.yH + (P.yN - P.yH) * u, P.cam.zoom * u];
}

// the plate with its parallax; soft 0..1 = depth of field in close-ups; o.dawn 0..1 brightens the low sky behind him (the
// weird fact's sunrise in the WEST, at screen x o.dawnX)
function vnSky(P, t, o = {}) {
  screenSpace();
  ctx.save(); camTransform(ctx, P.pc, 1);
  const soft = clamp(o.soft || 0);
  ctx.drawImage(VN_PLATE, VN_PL.x0, VN_PL.y0, VN_PL.w, VN_PL.h);
  if (soft > 0.01) { ctx.globalAlpha = soft; ctx.drawImage(VN_PLATE_SOFT, VN_PL.x0, VN_PL.y0, VN_PL.w, VN_PL.h); ctx.globalAlpha = 1; }
  ctx.restore();
  // the cloud deck creeps across the sky (Venus's upper winds lap the planet in about four days)
  const z = P.pc.zoom;
  for (let i = 0; i < 7; i++) {
    const yy = toScreen(P.pc, 0, -900 + i * 210)[1], x = ((i * 397 + t * (22 + 6 * i)) % 1600) - 300;
    softDot(ctx, x, yy, (260 + 60 * i) * z, i % 2 ? '#FFD596' : '#6E3010', 0.07);
  }
  // the volcano's vent, breathing in the glow layer
  const [vx, vy] = toScreen(P.pc, VN.volc[0], VN.volc[1] + 6);
  const br = 0.75 + 0.25 * Math.sin(t * loopW(1.3));
  softDot(gctx, vx, vy, 40 * z, '#FF5A1E', 0.45 * br * (1 - 0.6 * soft));
  softDot(ctx, vx, vy - 4 * z, 16 * z, '#FF8A3A', 0.6 * br);
  snWisps({ x: vx, y: vy - 6 * z, t: t * 0.5, n: 16, seed: 9, col: '#5A2A18', size: 18 * z, rise: 160 * z, spread: 14 * z, life: 3.2, alpha: 0.3 * (1 - 0.5 * soft), glow: 0, sway: 120 * z });
  if (o.dawn > 0.001) {                                        // a sunrise behind the cloud: low, hot, spreading
    const dx = o.dawnX === undefined ? 820 : o.dawnX, dy = P.yH - 30 * z, k = clamp(o.dawn);
    for (const [r, col, a] of [[900, '#FF9E3C', 0.30], [480, '#FFC870', 0.42], [200, '#FFF2C4', 0.7]]) softDot(ctx, dx, dy, r * (0.5 + 0.5 * k), col, a * k);
    softDot(gctx, dx, dy, 260 * (0.6 + 0.4 * k), '#FFC060', 0.55 * k);
  }
  return [vx, vy];
}

// the ground. o: {soft, dawn, dawnX}
function vnGround(P, t, o = {}) {
  screenSpace();
  const yH = Math.max(-10, P.yH), soft = clamp(o.soft || 0);
  if (yH >= H) return;
  const g = ctx.createLinearGradient(0, yH, 0, Math.max(yH + 10, P.yN + (P.yN - P.yH) * 0.45));
  g.addColorStop(0, '#E6A15A'); g.addColorStop(0.05, '#C67A3C'); g.addColorStop(0.2, '#9C5628'); g.addColorStop(0.55, '#713818'); g.addColorStop(1, '#46200C');
  ctx.fillStyle = g; ctx.fillRect(0, yH, W, H - yH);
  // fine soil and pebbles
  paint(() => {
    for (const d of VN_DOTS) {
      const [x, y, s] = vnAt(P, d.wx, d.u);
      if (y < yH + 2 || y > H + 10 || x < -40 || x > W + 40) continue;
      ellipse(ctx, x, y, d.r * s, d.r * s * (0.25 + 0.2 * Math.min(1, d.u)), d.d < 0.5 ? 'rgba(46,20,8,0.45)' : 'rgba(214,140,80,0.35)');
    }
  });
  for (const S of VN_SLABS) vnSlab(P, S, soft);
  // dust drifting low over the plain, slowly (surface winds on Venus are a gentle walk)
  for (const D of VN_DUST) {
    const [, y, s] = vnAt(P, 0, D.u);
    if (y < yH || y > H + 60) continue;
    const x = ((D.ph + t * D.sp) % 2400) - 600;
    softDot(ctx, x, y - 10 * s, D.w * Math.max(0.3, s) * 0.5, '#F2B06A', D.a);
  }
  if (o.dawn > 0.001) {                                         // the dawn behind him lights the far plain
    const dg = ctx.createLinearGradient(0, yH, 0, yH + 260 * P.cam.zoom);
    dg.addColorStop(0, rgba('#FFD08A', 0.5 * o.dawn)); dg.addColorStop(1, rgba('#FFD08A', 0));
    ctx.fillStyle = dg; ctx.fillRect(0, yH, W, 260 * P.cam.zoom);
  }
}
// one slab of basalt lying on the plane: a flat top, and (on some) a step down at its near edge
function vnSlab(P, S, soft = 0) {
  const [x, y, s] = vnAt(P, S.wx, S.u);
  const rx = S.r * s, ry = rx * (0.06 + 0.2 * Math.min(1.25, S.u));
  if (y < P.yH - 2 || y - ry > H || x + rx < -60 || x - rx > W + 60 || rx < 3) return;
  const rng = mulberry32(S.seed), n = 9, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + rng() * 0.3, k = 0.7 + 0.42 * rng(); pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  const top = mixH('#94512A', '#B26A38', S.tone), edge = '#3A1A0A', lip = mixH('#C9844C', '#E0A066', S.tone);
  const path = (dy = 0) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] + dy) : ctx.moveTo(p[0], p[1] + dy))); ctx.closePath(); };
  if (S.step) { path(Math.max(2, ry * 0.22)); ctx.fillStyle = '#4C230E'; ctx.fill(); }   // its thickness, in shade
  path(); ctx.fillStyle = top; ctx.fill();
  if (rx > 26) paint(() => {
    ctx.save(); path(); ctx.clip();
    ctx.lineWidth = Math.max(1, rx * 0.012); ctx.strokeStyle = rgba(edge, 0.55);              // cracks
    for (let i = 0; i < 5; i++) {
      const a = rng() * 6.283, cx = x + (rng() - 0.5) * rx, cy = y + (rng() - 0.5) * ry;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let j = 1; j <= 3; j++) ctx.lineTo(cx + Math.cos(a + (rng() - 0.5)) * rx * 0.3 * j, cy + Math.sin(a + (rng() - 0.5)) * ry * 0.3 * j);
      ctx.stroke();
    }
    ctx.restore();
    // the far edge catches the light from the cloud above
    ctx.beginPath(); for (let i = Math.floor(n * 0.55); i < n; i++) { const p = pts[i]; i === Math.floor(n * 0.55) ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); }
    ctx.lineWidth = Math.max(1, rx * 0.02); ctx.strokeStyle = rgba(lip, 0.7 * (1 - soft * 0.5)); ctx.stroke();
  });
}
// heat shimmer: the band round the horizon wobbles (after the sky and the ground are drawn)
function vnShimmer(P, t, k = 1) {
  if (k <= 0.01) return;
  const y0 = Math.max(0, Math.floor(P.yH - 70 * P.pc.zoom)), y1 = Math.min(H, Math.ceil(P.yH + 50 * P.pc.zoom));
  if (y1 <= y0) return;
  tmpx.setTransform(1, 0, 0, 1, 0, 0); tmpx.globalCompositeOperation = 'copy';
  tmpx.drawImage(mainC, 0, y0, W, y1 - y0, 0, y0, W, y1 - y0); tmpx.globalCompositeOperation = 'source-over';
  screenSpace();
  for (let y = y0; y < y1; y += 2) {
    const near = 1 - Math.abs(y - P.yH) / (70 * P.pc.zoom);
    ctx.drawImage(tmpC, 0, y, W, 2, 3.2 * k * near * Math.sin(y * 0.8 + t * loopW(10)), y, W, 2);
  }
}
// dust motes in the heavy orange air (screen space)
function vnMotes(t, a = 1, cam = CAM0) {
  screenSpace();
  for (const m of VN_MOTES) {
    const par = (cam.x - 540) * m.z * 0.8 * (cam.zoom || 1);
    const x = ((m.x * (W + 200) - par + t * 12 * m.z + 22 * Math.sin(t * loopW(0.4 * m.w) + m.ph)) % (W + 200) + (W + 200)) % (W + 200) - 100;
    const y = ((m.y * H - t * 6 * m.z + 26 * Math.sin(t * loopW(0.3 * m.w) + m.ph * 2)) % H + H) % H;
    const tw = 0.5 + 0.5 * Math.sin(t * loopW(1.4 * m.w) + m.ph * 3);
    softDot(ctx, x, y, 2 + 5 * m.z, '#FFD9A0', 0.3 * a * tw * m.z);
    softDot(gctx, x, y, 5 + 8 * m.z, '#FFB060', 0.22 * a * tw * m.z);
  }
}
// out-of-focus slabs very close to the lens (drawn LAST: foreground)
const VN_FG = [[-200, 1.9, 300, 1], [700, 2.5, 220, 2], [1300, 2.1, 320, 3], [300, 3.1, 200, 4]];
function vnForeground(P, t, a = 1) {
  if (a <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.filter = `blur(${Math.round(9 + 4 * P.cam.zoom)}px)`;
  for (const [wx, u, r, sd] of VN_FG) {
    const [x, y, s] = vnAt(P, wx, u);
    if (y - 90 > H || x < -400 || x > W + 400) continue;
    const rng = mulberry32(sd * 31), rx = r * s, ry = rx * 0.3, n = 10;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const an = (i / n) * 6.283, kk = 0.75 + 0.35 * rng(); i ? ctx.lineTo(x + Math.cos(an) * rx * kk, y + Math.sin(an) * ry * kk) : ctx.moveTo(x + Math.cos(an) * rx * kk, y + Math.sin(an) * ry * kk); }
    ctx.closePath(); ctx.fillStyle = rgba('#2E1408', 0.9 * a); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- props (world units, drawn under the camera)
// a boulder of basalt with a flat top (the calendar and the cake stand on these)
function vnRock(c, x, y, w, h, seed = 1) {
  const rng = mulberry32(seed);
  const top = [[x - w * 0.5, y - h * 0.62], [x - w * 0.18, y - h - 6 * rng()], [x + w * 0.3, y - h - 4 * rng()], [x + w * 0.52, y - h * 0.6]];
  c.beginPath(); c.moveTo(x - w * 0.56, y);
  for (const p of top) c.lineTo(p[0], p[1]);
  c.lineTo(x + w * 0.58, y); c.closePath(); c.fillStyle = '#5A2A12'; c.fill();
  c.beginPath(); c.moveTo(top[0][0], top[0][1]); c.lineTo(top[1][0], top[1][1]); c.lineTo(top[2][0], top[2][1]); c.lineTo(top[3][0], top[3][1]);
  c.lineTo(top[2][0] + 10, top[2][1] + h * 0.16); c.lineTo(top[1][0] - 4, top[1][1] + h * 0.18); c.closePath(); c.fillStyle = '#9A5428'; c.fill();
  paint(() => { line(c, x - w * 0.2, y - h * 0.4, x - w * 0.05, y - h * 0.12, 3, 'rgba(30,12,4,0.5)'); line(c, x + w * 0.22, y - h * 0.5, x + w * 0.3, y - h * 0.2, 3, 'rgba(30,12,4,0.5)'); });
  ellipse(c, x, y + 4, w * 0.6, 12, 'rgba(30,12,4,0.35)');
  return [x, y - h];                                            // the middle of its top
}

// a desk calendar with two flaps: the month (red, flips) over the day (cream: MONDAY). x, y = the middle of its foot.
// o: {month: 0..11 (a fraction flips it: 0.5 = halfway from that month to the next), rip: 0..1 (the day page tearing off
// and flying), ripDir}
const VN_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function vnCalendar(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the easel back and the foot
  c.beginPath(); c.moveTo(-118, 0); c.lineTo(-104, -300); c.lineTo(104, -300); c.lineTo(118, 0); c.closePath(); c.fillStyle = '#3A3F55'; c.fill();
  rrect(c, -126, -10, 252, 16, 6); c.fillStyle = '#2A2E40'; c.fill();
  // the day flap: cream, MONDAY (a torn copy can fly off, and there is another MONDAY under it)
  const day = (dx, dy, rot, sc = 1, torn = false) => {
    c.save(); c.translate(dx, dy); c.rotate(rot); c.scale(sc, sc);
    c.beginPath();
    if (torn) { c.moveTo(-96, -168); for (let i = 0; i <= 12; i++) c.lineTo(-96 + i * 16, -168 + (i % 2 ? 7 : -3)); }
    else c.moveTo(-96, -168), c.lineTo(96, -168);
    c.lineTo(96, -14); c.lineTo(-96, -14); c.closePath(); c.fillStyle = '#FFF6E2'; c.fill();
    paint(() => {
      c.font = '400 64px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1C1A2A';
      c.fillText('MONDAY', 0, -98);
      c.font = '800 22px Montserrat'; c.fillStyle = '#B24A3A'; c.fillText('DAY 1', 0, -42);
    });
    c.restore();
  };
  day(0, 0, 0);
  const rp = clamp(o.rip || 0);
  if (rp > 0 && rp < 1) {                                      // the torn page on its way out
    const dir = o.ripDir || 1, e = E.outCubic(rp);
    day(dir * 420 * e, -60 * Math.sin(Math.PI * rp) - 160 * e * e, dir * 1.4 * e, 1 - 0.2 * e, true);
  }
  // the month flap: red, flipping over the rings like a split-flap (the outgoing card folds up, the next one is there)
  const m = o.month || 0, mi = Math.floor(m) % 12, f = m - Math.floor(m), nxt = (mi + 1) % 12;
  const flap = (txt, sy, dark) => {
    c.save(); c.translate(0, -286); c.scale(1, sy);
    rrect(c, -96, 0, 192, 104, 8); c.fillStyle = dark ? '#A82432' : '#D8323E'; c.fill();
    if (sy > 0.12) paint(() => { c.font = '400 70px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText(txt, 0, 54); });
    c.restore();
  };
  flap(f > 0.02 ? VN_MONTHS[nxt] : VN_MONTHS[mi], 1, false);
  if (f > 0.02 && f < 0.98) flap(VN_MONTHS[mi], Math.cos(Math.PI * f) > 0 ? Math.cos(Math.PI * f) : 0, true);
  // the two rings it hangs on
  for (const rx of [-56, 56]) { c.beginPath(); c.arc(rx, -296, 13, Math.PI, 0); c.lineWidth = 7; c.strokeStyle = '#C8CCD8'; c.stroke(); }
  c.restore();
}

// bunting on two poles: triangles in party colours that sway (world units)
function vnBunting(c, t, x0, y0, x1, y1, sag = 90) {
  const cols = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF', '#FF9A3C'];
  for (const [px, py] of [[x0, y0], [x1, y1]]) { c.fillStyle = '#3A2214'; c.fillRect(px - 7, py - 6, 14, 900); circle(c, px, py - 6, 12, '#E6C27A'); }
  const n = 11, pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * Math.sin(Math.PI * u)];
  c.beginPath(); for (let i = 0; i <= 30; i++) { const p = pt(i / 30); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
  c.lineWidth = 4; c.strokeStyle = '#2A1A10'; c.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, p = pt(u), sw = 0.12 * Math.sin(t * loopW(1.6) + i * 0.9);
    c.save(); c.translate(p[0], p[1]); c.rotate(sw);
    c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(0, 62); c.closePath(); c.fillStyle = cols[i % cols.length]; c.fill();
    c.restore();
  }
}

// ---------------------------------------------------------------- the cake: one candle, a "1", whose flame is a bulb
// (cx, cy) = the middle of the cake's top (world). o: {lit 0..1, squash, s}
function vnCake(c, cx, cy, t, o = {}) {
  const b = o.s || 1, sq = o.squash || 0;
  const rx = 112 * b * (1 + 0.1 * sq), ry = 22 * b, hgt = 62 * b * (1 - 0.16 * sq);
  c.save(); c.translate(cx, cy);
  ellipse(c, 0, hgt + 8 * b, rx + 26 * b, ry + 6 * b, '#B9B2D6'); ellipse(c, 0, hgt + 3 * b, rx + 24 * b, ry + 5 * b, '#EDE8FF');
  c.beginPath(); c.moveTo(-rx, 0); c.lineTo(-rx, hgt); c.ellipse(0, hgt, rx, ry, 0, Math.PI, 0, true); c.lineTo(rx, 0); c.closePath(); c.fillStyle = '#FF8FB5'; c.fill();
  paint(() => { for (let i = -5; i <= 5; i++) { const u = i / 5.6; circle(c, u * rx, hgt + ry * Math.sqrt(Math.max(0, 1 - u * u)) - 7 * b, 7 * b, '#FFFFFF'); } });
  c.beginPath(); c.moveTo(-rx, 0);
  for (let i = 0; i <= 12; i++) { const u = -1 + (2 * i) / 12, dx = u * rx, dy = ry * Math.sqrt(Math.max(0, 1 - u * u)) + (i % 2 ? 18 : 6) * b * (0.8 + 0.4 * hash(i + 3)); c.lineTo(dx, dy); }
  c.lineTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI, true); c.closePath(); c.fillStyle = '#FFE3EE'; c.fill();
  ellipse(c, 0, 0, rx, ry, '#FFE3EE');
  paint(() => { for (let i = 0; i < 9; i++) { const a = i * 0.7, rr = 0.3 + 0.6 * hash(i + 11); circle(c, Math.cos(a) * rx * rr * 0.9, Math.sin(a) * ry * rr * 0.8, 4 * b, ['#FF5A6E', '#4DFFB4', '#7FE9FF', '#FFD447'][i % 4]); } });
  c.restore();
  // the "1" candle
  const fs = 92 * b, base = cy + 6 * b;
  paint(() => {
    c.save(); c.font = `400 ${fs}px Anton`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    c.lineWidth = 8 * b; c.strokeStyle = '#2A1030'; c.strokeText('1', cx, base);
    c.fillStyle = '#3FA7FF'; c.fillText('1', cx, base);
    c.restore();
    line(c, cx, base - fs * 0.8, cx, base - fs * 0.8 - 10 * b, 3 * b, '#2A1030');
  });
  const tip = [cx, base - fs * 0.8 - 10 * b];
  vnBulb(c, tip[0], tip[1], b, t, o.lit === undefined ? 1 : o.lit);
  return tip;
}
// the candle's "flame": a flame-shaped bulb with a filament. It does not flicker and it does not lean when he blows.
function vnBulb(c, x, y, s, t, k = 1) {
  const h = 46 * s, w = 14 * s;
  c.save(); c.translate(x, y);
  rrect(c, -5 * s, -6 * s, 10 * s, 8 * s, 2 * s); c.fillStyle = '#9AA0B8'; c.fill();       // the cap
  const shape = (cc) => { cc.beginPath(); cc.moveTo(0, -4 * s); cc.bezierCurveTo(w * 1.3, -h * 0.25, w * 0.6, -h * 0.78, 0, -h); cc.bezierCurveTo(-w * 0.6, -h * 0.78, -w * 1.3, -h * 0.25, 0, -4 * s); };
  shape(c); c.fillStyle = k > 0.5 ? '#FFD86A' : '#E8E2CC'; c.fill();
  paint(() => {
    c.beginPath(); c.moveTo(-3 * s, -8 * s); c.lineTo(-3 * s, -h * 0.42); c.lineTo(0, -h * 0.5); c.lineTo(3 * s, -h * 0.42); c.lineTo(3 * s, -8 * s);
    c.lineWidth = 2 * s; c.strokeStyle = k > 0.5 ? '#FF8A1E' : '#8A8270'; c.stroke();
    ellipse(c, -w * 0.3, -h * 0.62, w * 0.18, h * 0.12, 'rgba(255,255,255,0.75)', -0.3);
  });
  c.restore();
  if (k > 0.01) {
    gctx.save(); shape(gctx); gctx.restore();
    softDot(gctx, x, y - h * 0.5, 40 * s, '#FFC860', 0.35 * k);
    circle(gctx, x, y - h * 0.48, 12 * s, rgba('#FFF4C8', 0.6 * k));
  }
}

// a party popper: a cone with a string; it fires confetti from its mouth (world units). k: 0 rest, 1 popped
function vnPopper(c, x, y, rot, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, 0); c.lineTo(32, -96); c.lineTo(-32, -96); c.closePath(); c.fillStyle = '#C8A8FF'; c.fill();
  paint(() => { for (let i = 0; i < 3; i++) line(c, -14 - i * 6, -20 - i * 28, 14 + i * 6, -30 - i * 28, 7, i % 2 ? '#FFD447' : '#FF5A6E'); });
  ellipse(c, 0, -96, 32, 9, '#7A5AC8');
  c.restore();
}

// a striped deck chair seen from the front: the back (drawn before him) and the frame in front of his legs (after)
function vnChairBack(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) line(c, sd * 130, 0, sd * 112, -420, 16, '#8A5A30');
  c.beginPath(); c.moveTo(-118, -400); c.lineTo(118, -400); c.lineTo(126, -60); c.lineTo(-126, -60); c.closePath(); c.fillStyle = '#F4F0E6'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-118, -400); c.lineTo(118, -400); c.lineTo(126, -60); c.lineTo(-126, -60); c.closePath(); c.clip();
    for (let i = -3; i <= 3; i++) { c.fillStyle = i % 2 ? '#2BB3A6' : '#FF7A4E'; c.fillRect(i * 38 - 14, -420, 28, 380); }
    c.restore();
  });
  c.restore();
}
function vnChairFront(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) { line(c, sd * 150, 10, sd * 136, -170, 16, '#9A6838'); line(c, sd * 160, -170, sd * 96, -176, 14, '#B07A44'); }
  line(c, -150, -30, 150, -30, 12, '#8A5A30');
  c.restore();
}
// a mug (world units; rot tilts it toward his mouth)
function vnMug(c, x, y, rot, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -30, -40, 60, 74, 10); c.fillStyle = '#2BB3A6'; c.fill();
  c.beginPath(); c.arc(32, -4, 18, -1.3, 1.3); c.lineWidth = 9; c.strokeStyle = '#2BB3A6'; c.stroke();
  ellipse(c, 0, -40, 30, 8, '#5A2E14');
  paint(() => { c.font = '900 16px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('#1', 0, 4); });
  c.restore();
}

// ---------------------------------------------------------------- him in a heat suit (silver, teal straps: he reads
// against the orange) with a glass helmet; from a description.
const VNPAL = Object.assign({}, PAL, { coat: '#E8ECF4', coatSh: '#AEB6CA', coatHi: '#FFFFFF', coatDk: '#8A93AE', strap: '#14A89A', strapSh: '#0C776D',
  pants: '#D8DEEA', pantsSh: '#A2AAC0', shoe: '#5A6178', shoeSh: '#3E4458', sole: '#2A2E3E' });
// the helmet in head space: a glass bubble, a collar; fog 0..1 = his breath on the glass
function vnHelmet(c, fog = 0, t = 0) {
  rrect(c, -64, 60, 128, 28, 12); c.fillStyle = '#B8C0D4'; c.fill();
  rrect(c, -64, 60, 128, 10, 5); c.fillStyle = '#E9EDF6'; c.fill();
  paint(() => {
    c.beginPath(); c.arc(0, -8, 100, 0, 7); c.fillStyle = 'rgba(255,214,160,0.10)'; c.fill();
    c.lineWidth = 6; c.strokeStyle = 'rgba(255,240,220,0.85)'; c.stroke();
    if (fog > 0.01) {                                              // breath fog, from his mouth outward
      const g = c.createRadialGradient(0, 44, 0, 0, 40, 30 + 80 * fog);
      g.addColorStop(0, `rgba(250,248,244,${0.82 * fog})`); g.addColorStop(0.7, `rgba(248,246,242,${0.5 * fog})`); g.addColorStop(1, 'rgba(248,246,242,0)');
      c.save(); c.beginPath(); c.arc(0, -8, 97, 0, 7); c.clip(); c.fillStyle = g; c.fillRect(-110, -110, 220, 220); c.restore();
    }
    c.beginPath(); c.arc(0, -8, 86, Math.PI * 1.08, Math.PI * 1.42); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
    c.beginPath(); c.arc(0, -8, 86, Math.PI * 1.5, Math.PI * 1.56); c.stroke();
    c.beginPath(); c.arc(0, -8, 92, Math.PI * 0.12, Math.PI * 0.34); c.lineWidth = 5; c.strokeStyle = 'rgba(255,190,120,0.55)'; c.stroke();
  });
}
// a party hat sitting on top of the helmet (head space)
function vnHat(c, k = 1, tilt = 0, hop = 0) {
  if (k <= 0) return;
  c.save(); c.translate(8, -104 - hop); c.rotate(0.12 + tilt); c.scale(k, k);
  c.beginPath(); c.moveTo(-38, 0); c.lineTo(38, 0); c.lineTo(3, -92); c.closePath(); c.fillStyle = '#3FA7FF'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-38, 0); c.lineTo(38, 0); c.lineTo(3, -92); c.closePath(); c.clip();
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#FFD447' : '#FF5A6E'; c.beginPath(); c.moveTo(-60, -14 - i * 21); c.lineTo(60, -32 - i * 21); c.lineTo(60, -42 - i * 21); c.lineTo(-60, -24 - i * 21); c.closePath(); c.fill(); }
    c.restore();
  });
  rrect(c, -42, -7, 84, 13, 6); c.fillStyle = '#FFFFFF'; c.fill();
  circle(c, 3, -96, 12, '#FFD447');
  c.restore();
}
// sunglasses worn OVER the helmet glass (head space); up 0..1 pushes them up onto the top
function vnShades(c, k = 1, up = 0) {
  if (k <= 0.01) return;
  c.save(); c.translate(0, -6 - 92 * up); c.scale(k, k);
  paint(() => {
    for (const sd of [-1, 1]) { rrect(c, sd * 54 - 44, -24, 88, 52, 20); c.fillStyle = '#16132A'; c.fill(); }
    line(c, -12, -10, 12, -10, 8, '#16132A');
    for (const sd of [-1, 1]) ellipse(c, sd * 54 - 16, -10, 14, 7, 'rgba(255,255,255,0.55)', -0.3);
  });
  c.restore();
}
// puffed cheeks (head space)
function vnCheeks(c, k, pal) {
  if (k <= 0.03) return;
  paint(() => {
    for (const s of [-1, 1]) ellipse(c, s * 50, 32, 14 + 13 * k, 13 + 11 * k, mixH(pal.skin, pal.skinSh, s < 0 ? 0.55 : 0.85));
    for (const s of [-1, 1]) ellipse(c, s * 52, 34, 9 + 6 * k, 6 + 4 * k, 'rgba(255,110,110,0.34)');
    ellipse(c, 0, 44, 9, 7, pal.mouth);
  });
}

// A: {x, y, s, rot (whole body about his feet; for standing on a planet), face, lean, bob, headDX, headDY, headRot, pose
// (a base pose), sit, cake: {k, lit, at: [x, y] rig-local cake top}, armL / armR: rig-local targets (or {e, w}), handL /
// handR, cheeks, fog, hat, hatHop, hatTilt, shades, shadesUp, mug: {at, rot}, popper: {at, rot}, walk (a walking clock), post}
function vnHero(cam, t, A = {}) {
  const pal = A.pal || VNPAL;
  const st = { x: A.x === undefined ? VN.hx : A.x, y: A.y === undefined ? VN.hy : A.y, s: A.s === undefined ? VN.hs : A.s, face: A.face || FACES.calm,
    headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: A.noLegs };
  let pose = A.sit ? JSON.parse(JSON.stringify(POSES.sit)) : A.walk !== undefined ? walkPose(A.walk, 1) : JSON.parse(JSON.stringify(A.pose || POSES.stand));
  if (A.walk !== undefined) {                                    // a walk on the spot: knees up in turn
    const ph = A.walk;
    pose.legL = { a: 0.1 + 0.35 * Math.max(0, Math.sin(ph)), b: -0.9 * Math.max(0, Math.sin(ph)) };
    pose.legR = { a: 0.1 + 0.35 * Math.max(0, -Math.sin(ph)), b: -0.9 * Math.max(0, -Math.sin(ph)) };
    pose.hipY = -222 + 10 * Math.abs(Math.cos(ph));
  }
  pose.lean = (A.lean || 0) + (pose.lean || 0); pose.hipY += A.bob || 0;
  const cake = A.cake && A.cake.k > 0.01 ? A.cake : null;
  const cakeAt = cake ? (cake.at || [0, -318]) : null;
  if (cake) {                                                    // both hands under the plate's rim, elbows out
    pose = ikReach(pose, 'L', [cakeAt[0] - 128, cakeAt[1] + 72], -1);
    pose = ikReach(pose, 'R', [cakeAt[0] + 128, cakeAt[1] + 72], 1);
    pose.hand = 'open';
  }
  for (const sd of ['L', 'R']) {
    const tg = A['arm' + sd];
    if (!tg) continue;
    if (tg.e) pose = armAt(pose, sd, tg.e, tg.w);
    else pose = ikReach(pose, sd, tg, sd === 'L' ? -1 : 1);
  }
  if (A.handL) pose.handL = A.handL;
  if (A.handR) pose.handR = A.handR;
  let camR = cam;
  if (A.rot) {                                                   // the whole of him turned about his feet
    const F = toScreen(cam, st.x, st.y);
    camR = { x: st.x, y: st.y, zoom: cam.zoom, rot: (cam.rot || 0) + A.rot, sx: F[0] - W / 2, sy: F[1] - H / 2 };
  }
  const r = charLayer(camR, Object.assign({}, st, { pose }), t, { pal, ambient: A.ambient, pre: A.pre, post: (lc, rr) => {
    headSpace(lc, rr, Object.assign({}, st, { pose }), (c) => {
      vnCheeks(c, A.cheeks || 0, pal);
      vnHelmet(c, A.fog || 0, t);
      vnShades(c, A.shades || 0, A.shadesUp || 0);
      vnHat(c, A.hat === undefined ? 1 : A.hat, A.hatTilt || 0, A.hatHop || 0);
    });
    lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
    if (cake) {
      const tip = vnCake(lc, cakeAt[0], cakeAt[1] + (cake.dy || 0), t, { lit: cake.lit, s: 0.92 });
      for (const sd of [-1, 1]) {                                // fingers over the plate's rim
        const w = rr['wr' + (sd < 0 ? 'L' : 'R')];
        ellipse(lc, w[0] - sd * 6, w[1] - 10, 22, 16, pal.skin);
        paint(() => { for (let i = -1; i <= 1; i++) line(lc, w[0] - sd * 20, w[1] - 14 + i * 9, w[0] + sd * 4, w[1] - 16 + i * 9, 2.4, rgba(pal.skinSh, 0.9)); });
      }
      A._tip = tip;
    }
    if (A.mug) vnMug(lc, A.mug.at[0], A.mug.at[1], A.mug.rot || 0, 1);
    if (A.popper) vnPopper(lc, A.popper.at[0], A.popper.at[1], A.popper.rot || 0, 1);
    if (A.post) A.post(lc, rr, st, pose);
    lc.restore();
  } });
  // world points: rig-local p -> world, through his rotation
  const cs = Math.cos(A.rot || 0), sn = Math.sin(A.rot || 0);
  const wp = (p) => [st.x + (p[0] * cs - p[1] * sn) * st.s, st.y + (p[0] * sn + p[1] * cs) * st.s];
  const head = rig(pose).head;
  return { st, r, pose, wp, head: wp([head[0] + st.headDX, head[1] + st.headDY]), tip: A._tip ? wp(A._tip) : null };
}
// head-space helper (the rig's head, his lean and headRot): call inside a charLayer post
function headSpace(c, r, st, fn) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}

// confetti from a point (world), d = seconds since the burst
function vnConfetti(x, y, d, seed = 1, n = 34, spread = 1, dir = 0, v0 = 1) {
  if (d <= 0 || d > 1.6) return;
  const rng = mulberry32(seed * 131 + 7), cols = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF', '#FFFFFF'];
  paint(() => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + dir + (rng() - 0.5) * 2.2 * spread, v = (300 + rng() * 460) * v0, w = 6 + rng() * 7, col = cols[i % cols.length], sp = 6 + rng() * 10;
      const px = x + Math.cos(a) * v * d * (1 - 0.25 * d), py = y + Math.sin(a) * v * d + 0.5 * 700 * d * d;
      ctx.save(); ctx.translate(px, py); ctx.rotate(sp * d + i); ctx.globalAlpha = clamp(1.6 - d);
      ctx.fillStyle = col; ctx.fillRect(-w, -w * 0.45 * Math.abs(Math.cos(sp * d * 1.3 + i)), 2 * w, w * 0.9 * Math.abs(Math.cos(sp * d * 1.3 + i)) + 1.2);
      ctx.restore();
    }
  });
}
