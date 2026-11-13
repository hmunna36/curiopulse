// Dinosaurs Are Older Than FLOWERS: the worlds and the cast.
// - dfWorld / dfFront: one valley in two ages, drawn in parallax layers that each carry their own ground strip (so no gap
//   ever opens between them): the late Jurassic (era 0: ferns, cycads, monkey-puzzle conifers, horsetails, a smoking
//   volcano, not one petal) and the late Cretaceous (era 1: the same valley plus magnolia trees and a meadow in bloom).
//   `bloom` 0..1 grows or shrinks every flower, so the rewind can drain the valley and the fast-forward burst it open.
// - dfStego: a cartoon Stegosaurus (plates, tail spikes, a small beak that sniffs, chomps and chews).
// - dfRex: a cartoon T. rex drawn from its HIP (lean, neck, jaw, two tiny arms that reach and flail, a stomping walk).
// - dfBouquet: a wrapped bouquet held at its grip (flowers can be eaten one by one).
// - dfRoad: the time road (screen space): 150 million years ago -> now, with the three of them standing on it.
// World units: the ground line is DF_GY; the hiker stands on it at s = 1 (about 560 units tall).
'use strict';

const DF_GY = 1650;
const DFC = {
  fern: '#3F8F3A', fernDk: '#2A6A2C', cycad: '#4E9A3E', cycadDk: '#2F6C2E', cycTrunk: '#8A6A3E', cycTrunkDk: '#6A4E2C',
  conif: '#2F7048', conifDk: '#215238', bark: '#7A5636', barkDk: '#5A3E26', horse: '#5FA048',
  leaf: '#4E9A3E', leafHi: '#7CC452',
  mag: '#FF8DB7', magHi: '#FFE3EE', magDk: '#E2588F', magLeaf: '#3E8A3A',
  meadow: ['#FF5A8A', '#FFD447', '#B48CFF', '#FF8A3C', '#FFFFFF', '#FF6AD0', '#FFB0D0'],
};

// ---------------------------------------------------------------- small helpers
function dfMix(a, b, k) { return mixH(a, b, clamp(k)); }
// a layer's camera: parallax, plus a vertical shift of the far layers (the camera's height: + = horizon lower = low angle)
function dfLayerCam(cam, p, hz) {
  const lc = parallax(cam, p);
  lc.sy = (lc.sy || 0) + (hz || 0) * clamp((1 - p) / 0.8);
  return lc;
}
// a loop-safe sway (the same on the last frame as on the first)
function dfSway(t, w, ph) { return Math.sin(t * loopW(w) + ph); }

// ---------------------------------------------------------------- the sky (screen space)
function dfSky(t, o) {
  screenSpace();
  const k = clamp(o.era == null ? 1 : o.era);
  const top = dfMix('#6DB6CF', '#58AEEA', k), mid = dfMix('#B7E0D0', '#A6DAF6', k), bot = dfMix('#F3EBC0', '#FFF0D0', k);
  const hz = clamp((o.skyHz || 1150) / H, 0.2, 0.95);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(hz * 0.62, mid); g.addColorStop(hz, bot); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the sun: high on the LEFT (the rim light comes from the left; the key from the upper right is the sky)
  const sx = o.sunX == null ? 150 : o.sunX, sy = o.sunY == null ? 330 : o.sunY;
  softDot(ctx, sx, sy, 330, '#FFF6D8', 0.55);
  circle(ctx, sx, sy, 62, '#FFF8E4');
  softDot(gctx, sx, sy, 300, '#FFE9B0', 0.75);
  // soft clouds, drifting on loop-safe clocks
  const cl = [[260, 520, 1.0, 0.0], [820, 380, 1.25, 1.7], [640, 700, 0.8, 3.1], [-60, 760, 0.9, 4.4]];
  for (const [cx, cy, s, ph] of cl) {
    const dx = 40 * dfSway(t, 0.05, ph);
    const col = rgba('#FFFFFF', 0.82);
    for (const [ox, oy, r] of [[-90, 10, 70], [-20, -20, 90], [70, 0, 75], [140, 18, 55], [0, 30, 80]]) ellipse(ctx, cx + dx + ox * s, cy + oy * s, r * s * 1.25, r * s * 0.72, col);
  }
}

// ---------------------------------------------------------------- the plants
// a monkey-puzzle conifer (Araucaria): a straight trunk and tiers of drooping branch clusters (world units, base at y)
function dfConifer(c, x, y, h, seed, t, cols) {
  const r = mulberry32(seed), sw = 4 * dfSway(t, 0.6, seed);
  const bk = cols ? cols.bark : DFC.bark, cf = cols ? cols.conif : DFC.conif, cd = cols ? cols.conifDk : DFC.conifDk;
  c.beginPath(); c.moveTo(x - h * 0.022, y); c.lineTo(x - h * 0.012 + sw, y - h); c.lineTo(x + h * 0.012 + sw, y - h); c.lineTo(x + h * 0.022, y); c.closePath();
  c.fillStyle = bk; c.fill();
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const u = i / (tiers - 1), ty = y - h * (0.42 + 0.58 * u), w = h * (0.34 - 0.24 * u) * (0.85 + 0.3 * r());
    const xx = x + sw * (0.4 + 0.6 * u);
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(xx, ty - h * 0.03);
      c.quadraticCurveTo(xx + sd * w * 0.6, ty - h * 0.07, xx + sd * w, ty + h * 0.03);
      c.quadraticCurveTo(xx + sd * w * 0.55, ty + h * 0.02, xx, ty + h * 0.035); c.closePath();
      c.fillStyle = i % 2 ? cf : cd; c.fill();
    }
  }
  ellipse(c, x + sw, y - h * 1.0, h * 0.09, h * 0.07, cf);
}
// a cycad: a stout scaly trunk and a crown of stiff, feathery fronds
function dfCycad(c, x, y, h, seed, t, o = {}) {
  const r = mulberry32(seed), sw = 3 * dfSway(t, 0.8, seed);
  const tw = h * 0.16;
  c.beginPath(); c.moveTo(x - tw, y); c.quadraticCurveTo(x - tw * 1.1, y - h * 0.5, x - tw * 0.75, y - h * 0.62);
  c.lineTo(x + tw * 0.75, y - h * 0.62); c.quadraticCurveTo(x + tw * 1.1, y - h * 0.5, x + tw, y); c.closePath();
  c.fillStyle = o.trunk || DFC.cycTrunk; c.fill();
  paint(() => {
    for (let k = 1; k < 7; k++) {
      const yy = y - h * 0.62 * k / 7;
      c.beginPath(); c.moveTo(x - tw * 0.95, yy); c.quadraticCurveTo(x, yy + h * 0.035, x + tw * 0.95, yy);
      c.lineWidth = Math.max(1.5, h * 0.012); c.strokeStyle = o.trunkDk || DFC.cycTrunkDk; c.stroke();
    }
  });
  const n = 11, top = [x + sw * 0.4, y - h * 0.64];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 3.1 + 0.05 * dfSway(t, 0.9, seed + i);
    const L = h * (0.62 + 0.18 * r()), ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * 0.6 + L * 0.12 * Math.abs(Math.cos(a));
    const mx = (top[0] + ex) / 2, my = (top[1] + ey) / 2 - L * 0.16;
    c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mx, my, ex, ey);
    c.lineWidth = Math.max(3, h * 0.034); c.strokeStyle = o.frond || DFC.cycad; c.lineCap = 'round'; c.stroke();
    paint(() => {
      for (let k = 2; k < 12; k++) {
        const u = k / 12, qx = (1 - u) * (1 - u) * top[0] + 2 * u * (1 - u) * mx + u * u * ex, qy = (1 - u) * (1 - u) * top[1] + 2 * u * (1 - u) * my + u * u * ey;
        const ll = L * 0.2 * (1 - 0.45 * u), na = a + Math.PI / 2;
        line(c, qx, qy, qx + Math.cos(na - 0.5) * ll, qy + Math.sin(na - 0.5) * ll, Math.max(2.2, h * 0.02), k % 2 ? (o.frond || DFC.cycad) : (o.frondDk || DFC.cycadDk));
        line(c, qx, qy, qx - Math.cos(na + 0.5) * ll, qy - Math.sin(na + 0.5) * ll, Math.max(2.2, h * 0.02), k % 2 ? (o.frondDk || DFC.cycadDk) : (o.frond || DFC.cycad));
      }
    });
  }
}
// a fern clump (fronds fanning up from one point)
function dfFern(c, x, y, s, seed, t, col, colDk) {
  const r = mulberry32(seed);
  col = col || DFC.fern; colDk = colDk || DFC.fernDk;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.5 + 0.05 * dfSway(t, 1.1, seed + i);
    const L = (110 + 60 * r()) * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L * 0.8;
    const mx = (x + ex) / 2, my = (y + ey) / 2 - 26 * s;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, ex, ey);
    c.lineWidth = 5 * s; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
    paint(() => {
      for (let k = 1; k < 11; k++) {
        const u = k / 11, qx = (1 - u) * (1 - u) * x + 2 * u * (1 - u) * mx + u * u * ex, qy = (1 - u) * (1 - u) * y + 2 * u * (1 - u) * my + u * u * ey;
        const ll = (24 - 15 * u) * s;
        line(c, qx, qy, qx + Math.cos(a - 1.25) * ll, qy + Math.sin(a - 1.25) * ll, 5 * s, k % 2 ? col : colDk);
        line(c, qx, qy, qx + Math.cos(a + 1.25) * ll, qy + Math.sin(a + 1.25) * ll, 5 * s, k % 2 ? colDk : col);
      }
    });
  }
}
// a horsetail stem with whorls
function dfHorsetail(c, x, by, h, seed, t) {
  const n = 8, sway = 8 * dfSway(t, 0.9, seed);
  let px = x, py = by;
  for (let i = 0; i < n; i++) {
    const nx = x + sway * (i / n) * (i / n), ny = by - h / n * (i + 1);
    line(c, px, py, nx, ny, Math.max(3, h * 0.03), DFC.horse);
    paint(() => {
      const wl = h * 0.07;
      for (let k = 0; k < 8; k++) {
        const a = -Math.PI / 2 + (k / 7 - 0.5) * 2.6;
        line(c, nx, ny, nx + Math.cos(a) * wl, ny + Math.sin(a) * wl * 0.5 + wl * 0.3, Math.max(1.5, h * 0.008), k % 2 ? DFC.leaf : DFC.leafHi);
      }
    });
    px = nx; py = ny;
  }
}
// one flower head (cup, daisy or star) of size r at (x, y); bloom 0..1 grows it from nothing
function dfFlower(c, x, y, r, col, kind, bloom, rot = 0) {
  const k = E.outBack(clamp(bloom));
  if (k <= 0.02) return;
  const R = r * k;
  c.save(); c.translate(x, y); c.rotate(rot);
  if (kind === 1) {               // a daisy: white petals round a yellow eye
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ellipse(c, Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62, R * 0.42, R * 0.2, '#FFFFFF', a); }
    circle(c, 0, 0, R * 0.36, '#FFC21A');
  } else if (kind === 2) {        // a tulip cup
    c.beginPath(); c.moveTo(-R * 0.7, -R * 0.2); c.lineTo(-R * 0.45, -R * 0.95); c.lineTo(-R * 0.15, -R * 0.45); c.lineTo(0, -R * 1.05);
    c.lineTo(R * 0.15, -R * 0.45); c.lineTo(R * 0.45, -R * 0.95); c.lineTo(R * 0.7, -R * 0.2); c.quadraticCurveTo(R * 0.6, R * 0.55, 0, R * 0.55);
    c.quadraticCurveTo(-R * 0.6, R * 0.55, -R * 0.7, -R * 0.2); c.closePath(); c.fillStyle = col; c.fill();
  } else {                        // a five-petal star with a pale heart
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; ellipse(c, Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, R * 0.55, R * 0.42, col, a); }
    circle(c, 0, 0, R * 0.3, '#FFF3B0');
  }
  c.restore();
}
// a magnolia: a short trunk, a rounded leafy crown, big pink cup blossoms (bloom grows them)
function dfMagnolia(c, x, y, h, seed, t, bloom, cols) {
  const r = mulberry32(seed), sw = 3 * dfSway(t, 0.7, seed);
  const bk = cols ? cols.bark : DFC.bark, lf = cols ? cols.leaf : DFC.magLeaf;
  c.beginPath(); c.moveTo(x - h * 0.05, y); c.quadraticCurveTo(x - h * 0.03, y - h * 0.35, x - h * 0.16 + sw, y - h * 0.6);
  c.lineTo(x - h * 0.11 + sw, y - h * 0.62); c.quadraticCurveTo(x, y - h * 0.45, x + h * 0.12 + sw, y - h * 0.66);
  c.lineTo(x + h * 0.16 + sw, y - h * 0.63); c.quadraticCurveTo(x + h * 0.04, y - h * 0.38, x + h * 0.05, y); c.closePath();
  c.fillStyle = bk; c.fill();
  const blobs = [[-0.22, -0.72, 0.24], [0.2, -0.76, 0.26], [0, -0.9, 0.27], [-0.08, -0.62, 0.2], [0.14, -0.6, 0.18], [-0.3, -0.58, 0.15], [0.32, -0.6, 0.15]];
  for (const [bx, by2, br] of blobs) ellipse(c, x + bx * h + sw, y + by2 * h, br * h, br * h * 0.8, lf);
  if (bloom > 0.02) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const bx = x + sw + (r() - 0.5) * h * 0.68, by2 = y - h * (0.55 + 0.38 * r());
      const delay = r() * 0.5, kk = clamp((bloom - delay * 0.6) / 0.5);
      const col = i % 3 === 0 ? DFC.magHi : (i % 3 === 1 ? DFC.mag : DFC.magDk);
      paint(() => dfFlower(c, bx, by2, h * 0.05, col, 2, kk, (r() - 0.5) * 0.6));
    }
  }
}

// ---------------------------------------------------------------- the valley (behind the hero)
// o: {era 0..1 (sky), bloom 0..1 (flowers), hz (camera height: + = low angle), volcano, skyHz, sunX, sunY, meadowFrom/To}
function dfWorld(cam, t, o = {}) {
  const bloom = clamp(o.bloom == null ? 1 : o.bloom), era = o.era == null ? 1 : o.era;
  const skyHz = toScreen(dfLayerCam(cam, 0.25, o.hz), 0, 1300)[1];
  dfSky(t, { era, skyHz, sunX: o.sunX, sunY: o.sunY });
  // far: mountains and the volcano (p 0.25)
  let lc = dfLayerCam(cam, 0.25, o.hz); applyCam(lc);
  const haze = dfMix('#8DB4B0', '#8CB6CC', era), hazeDk = dfMix('#6E9C93', '#6E9AB8', era);
  ctx.beginPath(); ctx.moveTo(-2400, 1300);
  const ridge = [[-2400, 1080], [-1900, 900], [-1500, 1020], [-1100, 860], [-700, 990], [-300, 900], [100, 1010], [500, 930], [900, 1050],
    [1300, 950], [1650, 760], [1760, 760], [2100, 980], [2500, 900], [3000, 1040], [3400, 960]];
  for (const [rx, ry] of ridge) ctx.lineTo(rx, ry);
  ctx.lineTo(3400, 1300); ctx.closePath(); ctx.fillStyle = haze; ctx.fill();
  ctx.fillStyle = hazeDk; ctx.fillRect(-2400, 1290, 5800, 3000);
  if (o.volcano !== false) {
    // the volcano's smoke: soft puffs rising on a loop-safe clock
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.06 + i / 7) % 1);
      const px = 1705 + 120 * u + 30 * Math.sin(i * 2.3), py = 740 - 520 * u;
      ellipse(ctx, px, py, 70 + 120 * u, 50 + 80 * u, rgba('#E8E4DC', 0.7 * (1 - u)));
    }
    softDot(gctx, 1705, 760, 70, '#FF8A3C', 0.6);
  }
  // mid-far: a forest band of conifer tops (p 0.45)
  lc = dfLayerCam(cam, 0.45, o.hz); applyCam(lc);
  const band = dfMix('#4F8A6A', '#4F8D78', era);
  ctx.beginPath(); ctx.moveTo(-2600, 1440);
  for (let x = -2600; x <= 3600; x += 70) {
    const hh = 90 + 70 * Math.abs(Math.sin(x * 0.013)) + 40 * Math.abs(Math.sin(x * 0.041));
    ctx.lineTo(x, 1420 - hh); ctx.lineTo(x + 35, 1420 - hh * 0.55);
  }
  ctx.lineTo(3600, 1440); ctx.closePath(); ctx.fillStyle = band; ctx.fill();
  ctx.fillStyle = band; ctx.fillRect(-2600, 1435, 6200, 3000);
  // mid: the valley's trees (p 0.7), hazed toward the band's colour
  lc = dfLayerCam(cam, 0.7, o.hz); applyCam(lc);
  const hz2 = { bark: dfMix(DFC.bark, '#6E8A7A', 0.35), conif: dfMix(DFC.conif, '#5E9A80', 0.3), conifDk: dfMix(DFC.conifDk, '#4F8870', 0.3), leaf: dfMix(DFC.magLeaf, '#5E9A80', 0.3) };
  const mids = o.mids || [[-1500, 'c', 820, 3], [-1150, 'y', 420, 4], [-900, 'm', 520, 5], [-560, 'c', 960, 6], [-300, 'y', 380, 7], [-60, 'm', 600, 8],
    [260, 'c', 760, 9], [520, 'y', 440, 10], [820, 'm', 560, 11], [1100, 'c', 900, 12], [1380, 'y', 400, 13], [1650, 'm', 620, 14],
    [1950, 'c', 800, 15], [2250, 'y', 460, 16], [2550, 'm', 540, 17], [2850, 'c', 860, 18]];
  ctx.fillStyle = dfMix('#5A9A5E', '#5E9E64', era); ctx.fillRect(-2600, 1545, 6400, 3000);
  for (const [mx, kind, mh, sd] of mids) {
    if (kind === 'c') dfConifer(ctx, mx, 1550, mh, sd, t, hz2);
    else if (kind === 'y') dfCycad(ctx, mx, 1550, mh, sd, t, { frond: dfMix(DFC.cycad, '#6AA67A', 0.3), frondDk: dfMix(DFC.cycadDk, '#4E8A68', 0.3) });
    else {
      const mk = clamp(o.magK == null ? 1 : o.magK);
      if (mk > 0.02) dfMagnolia(ctx, mx, 1550, mh * E.outBack(mk), sd, t, bloom, hz2);
      if (mk < 0.98) dfCycad(ctx, mx + 120, 1550, mh * 0.62 * (1 - mk), sd + 40, t, { frond: dfMix(DFC.cycad, '#6AA67A', 0.3), frondDk: dfMix(DFC.cycadDk, '#4E8A68', 0.3) });
    }
  }
  // near: the hero's ground (p 1): a meadow strip, rocks, ferns, horsetails, cycads, and (in bloom) flowers everywhere
  applyCam(cam);
  const gTop = DF_GY - 60;
  const gg = ctx.createLinearGradient(0, gTop, 0, gTop + 900);
  gg.addColorStop(0, dfMix('#5FA24A', '#62A84C', era)); gg.addColorStop(1, dfMix('#3E7E36', '#3F8236', era));
  ctx.fillStyle = gg; ctx.fillRect(-3000, gTop, 7000, 4000);
  const r = mulberry32(77);
  for (let i = 0; i < 26; i++) {      // ferns and horsetails along the back of the meadow
    const fx = -1800 + i * 190 + 60 * r(), fy = gTop + 10 + 30 * r();
    if (i % 4 === 1) dfHorsetail(ctx, fx, fy + 20, 180 + 80 * r(), 300 + i, t);
    else dfFern(ctx, fx, fy + 30, 0.9 + 0.5 * r(), 500 + i, t);
  }
  if (bloom > 0.02) {                 // the meadow in bloom
    const rr = mulberry32(91);
    for (let i = 0; i < 140; i++) {
      const fx = -1900 + rr() * 4400, fy = gTop + 40 + rr() * 330, fs = 10 + 12 * rr() * (0.6 + (fy - gTop) / 400);
      const kk = clamp((bloom - rr() * 0.45) / 0.55), col = DFC.meadow[i % DFC.meadow.length], kind = i % 3;
      if (kk <= 0.02) continue;
      line(ctx, fx, fy + fs * 1.8, fx, fy + fs * 0.2, Math.max(2, fs * 0.18), '#3E8A34');
      paint(() => dfFlower(ctx, fx, fy, fs, col, kind, kk, (rr() - 0.5) * 0.5));
    }
  }
}
// what grows in front of the hero (drawn after him): low ferns and, in bloom, big flowers at the bottom corners
function dfFront(cam, t, o = {}) {
  applyCam(cam);
  const bloom = clamp(o.bloom == null ? 1 : o.bloom);
  const xs = o.xs || [[80, 1.5, 1], [1040, 1.6, 2], [-200, 1.3, 3], [1350, 1.4, 4]];
  for (const [fx, fs, sd] of xs) dfFern(ctx, fx, DF_GY + 170, fs, 700 + sd, t);
  if (bloom > 0.02 && o.flowers !== false) {
    const rr = mulberry32(131);
    for (let i = 0; i < 18; i++) {
      const fx = (o.fx0 || -300) + rr() * (o.fw || 1700), fy = DF_GY + 120 + rr() * 160, fs = 22 + 16 * rr();
      const kk = clamp((bloom - rr() * 0.4) / 0.6);
      if (kk <= 0.02) continue;
      line(ctx, fx, fy + fs * 2, fx, fy, 5, '#3E8A34');
      paint(() => dfFlower(ctx, fx, fy, fs, DFC.meadow[(i + 2) % DFC.meadow.length], i % 3, kk, (rr() - 0.5) * 0.4));
    }
  }
}

// ---------------------------------------------------------------- the Stegosaurus
const SG = { body: '#D6A23C', bodyDk: '#B07E26', belly: '#F0DDA2', stripe: '#A87422', plate: '#E8513A', plateHi: '#FFC24A', spike: '#F4E8CC',
  eye: '#FFFFFF', pupil: '#1A1522', beak: '#8A5A2A' };
// feet on y 0, facing right (flip -1 faces left), about 1,500 units nose to tail at s = 1.
// o: {walk (phase), headUp 0..1 (the head rises to chest height in front), headFwd, jaw 0..1, chew 0..1, look [x, y], blink,
//     puzzled 0..1 (a tilt of the head), petals (n petals stuck in the beak), returns {beak: [x, y] world}}
function dfStego(c, x, y, s, t, o = {}) {
  const P = SG, fl = o.flip || 1, ph = o.walk || 0, up = clamp(o.headUp || 0);
  const bob = 6 * Math.abs(Math.sin(ph));
  c.save(); c.translate(x, y); c.scale(s * fl, s);
  const leg = (lx, ly, len, w, lift, col) => {
    const lu = Math.max(0, Math.sin(lift)) * 26, sw = 26 * Math.cos(lift);
    c.beginPath(); c.moveTo(lx - w, ly - bob); c.quadraticCurveTo(lx - w * 1.1 + sw * 0.5, ly + len * 0.5, lx - w * 0.8 + sw, -lu);
    c.lineTo(lx + w * 0.9 + sw, -lu); c.quadraticCurveTo(lx + w * 1.05 + sw * 0.5, ly + len * 0.5, lx + w, ly - bob); c.closePath();
    c.fillStyle = col; c.fill();
    ellipse(c, lx + sw + 4, -lu - 6, w * 1.05, 16, col);
  };
  // the spine (for the plates): tail tip -> hips -> shoulders -> neck
  const spine = [[-760, -205], [-560, -300], [-380, -420], [-180, -520], [0, -520], [160, -455], [290, -350], [370, -270]];
  const sp = (u) => {   // a point along the spine, 0..1, and its normal (pointing up/out)
    const L = spine.length - 1, f = clamp(u) * L, i = Math.min(L - 1, Math.floor(f)), k = f - i;
    const a = spine[i], b = spine[i + 1];
    const px = lerp(a[0], b[0], k), py = lerp(a[1], b[1], k) - bob, dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return [px, py, dy / d, -dx / d];
  };
  // the head's place: low in front (grazing), or up at chest height (sniffing)
  const hx = lerp(560, 600 + (o.headFwd || 0), up), hy = lerp(-190, -430, up) - bob + 6 * Math.sin(t * 2.2) * (1 - up);
  actor(() => {
    leg(-180, -300, 300, 62, ph + Math.PI, P.bodyDk); leg(240, -210, 210, 46, ph, P.bodyDk);         // the far legs
    // the plates of the far row (behind the body)
    for (let i = 0; i < 9; i++) {
      const u = 0.16 + i * 0.085, [px, py, nx, ny] = sp(u), hgt = 70 + 190 * Math.sin(Math.PI * clamp((u - 0.1) / 0.85));
      dfPlate(c, px - 22, py - 4, nx, ny, hgt * 0.9, P.plate, true);
    }
    // the tail
    c.beginPath(); c.moveTo(-360, -440 - bob); c.quadraticCurveTo(-560, -330 - bob, -780, -200 - bob); c.quadraticCurveTo(-560, -250 - bob, -330, -260 - bob); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the tail spikes (thagomizer)
    for (const [sx2, sy2, a2] of [[-690, -232, -2.2], [-650, -246, -1.75], [-700, -205, 2.45], [-660, -222, 2.0]]) {
      c.beginPath(); c.moveTo(sx2 - 12, sy2 - bob); c.lineTo(sx2 + Math.cos(a2) * 95, sy2 - bob + Math.sin(a2) * 95); c.lineTo(sx2 + 14, sy2 - bob); c.closePath();
      c.fillStyle = P.spike; c.fill();
    }
    // the body: a high-arched back
    c.beginPath(); c.moveTo(-380, -420 - bob);
    c.bezierCurveTo(-260, -560 - bob, 60, -580 - bob, 220, -420 - bob);
    c.bezierCurveTo(330, -330 - bob, 360, -240 - bob, 300, -170 - bob);
    c.bezierCurveTo(160, -110 - bob, -160, -120 - bob, -330, -240 - bob); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the neck to the head
    const n0 = [300, -300 - bob], n1 = [lerp(430, 470, up), lerp(-250, -420, up) - bob];
    c.beginPath(); c.moveTo(n0[0] - 30, n0[1] - 70); c.quadraticCurveTo(n1[0], n1[1] - 60, hx - 10, hy - 34);
    c.lineTo(hx - 10, hy + 34); c.quadraticCurveTo(n1[0] - 20, n1[1] + 70, n0[0] + 10, n0[1] + 110); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the head: a small, long head with a horny beak; the lower jaw opens by `jaw`
    const jw = clamp(o.jaw || 0) * 0.55 + 0.12 * Math.max(0, Math.sin((o.chew || 0) * 9)) * (o.chew > 0 ? 1 : 0);
    const tilt = -0.18 * (o.puzzled || 0);
    c.save(); c.translate(hx, hy); c.rotate(tilt + up * -0.12);
    c.save(); c.rotate(jw);
    c.beginPath(); c.moveTo(-40, 6); c.quadraticCurveTo(40, 30, 104, 14); c.lineTo(100, 4); c.quadraticCurveTo(40, 10, -30, -4); c.closePath();
    c.fillStyle = P.bodyDk; c.fill();
    c.restore();
    c.beginPath(); c.moveTo(-60, -10); c.quadraticCurveTo(-40, -52, 30, -46); c.quadraticCurveTo(96, -38, 118, -6);
    c.quadraticCurveTo(106, 10, 60, 8); c.quadraticCurveTo(0, 14, -50, 30); c.closePath();
    c.fillStyle = P.body; c.fill();
    c.restore();
    // the near legs
    leg(-120, -310, 310, 66, ph, P.body); leg(300, -220, 220, 48, ph + Math.PI, P.body);
    // the near row of plates (in front of the far row, on the back)
    for (let i = 0; i < 8; i++) {
      const u = 0.2 + i * 0.09, [px, py, nx, ny] = sp(u), hgt = 60 + 200 * Math.sin(Math.PI * clamp((u - 0.12) / 0.85));
      dfPlate(c, px + 18, py + 8, nx, ny, hgt, P.plate, false);
    }
  });
  // the paint: belly, stripes, plate rims, the eye, the beak, petals in the beak
  paint(() => {
    c.beginPath(); c.moveTo(-300, -235 - bob); c.bezierCurveTo(-140, -150 - bob, 140, -140 - bob, 290, -190 - bob);
    c.lineWidth = 34; c.strokeStyle = rgba(P.belly, 0.8); c.lineCap = 'round'; c.stroke();
    for (let i = 0; i < 5; i++) { const xx = -220 + i * 110; line(c, xx, -470 - bob + Math.abs(xx) * 0.08, xx - 26, -330 - bob, 16, rgba(P.stripe, 0.55)); }
    const jw2 = clamp(o.jaw || 0) * 0.55;
    c.save(); c.translate(hx, hy); c.rotate(-0.18 * (o.puzzled || 0) + up * -0.12);
    c.beginPath(); c.moveTo(84, -24); c.quadraticCurveTo(116, -16, 120, -4); c.quadraticCurveTo(104, 6, 84, 4); c.closePath(); c.fillStyle = P.beak; c.fill();
    ellipse(c, 22, -26, 15, 15, P.eye);
    const lk = o.look || [1, 0];
    circle(c, 22 + 6 * lk[0], -26 + 5 * lk[1], 7.5, P.pupil);
    if ((o.blink || 0) > 0.05) { c.fillStyle = P.body; c.fillRect(4, -44, 36, 36 * clamp(o.blink)); }
    if ((o.puzzled || 0) > 0.3) line(c, 6, -48, 40, -40 - 10 * o.puzzled, 6, '#6A4A1E');   // a raised brow
    circle(c, 100, -18, 3.5, '#5A3A18');                                                         // the nostril
    if (o.petals) {                                                                              // petals sticking out of the beak
      for (let i = 0; i < o.petals; i++) {
        const a = 0.5 - i * 0.35, col = DFC.meadow[i % DFC.meadow.length];
        ellipse(c, 112 + Math.cos(a) * 18, 4 + Math.sin(a) * 18 + 8 * Math.sin(t * 9 + i), 16, 8, col, a);
      }
      line(c, 96, 6, 150, 34 + 6 * Math.sin(t * 9), 6, '#3E8A34');                              // a stem
    }
    if (jw2 > 0.08) ellipse(c, 70, 10, 26 * jw2, 10 * jw2, '#5A1E22');
    c.restore();
  });
  c.restore();
  o.beak = [x + (hx + 120 * Math.cos(-0.12 * up)) * s * fl, y + (hy - 4) * s];
  return o;
}
// one plate: a kite standing on the spine point (x, y), pointing along the normal (nx, ny)
function dfPlate(c, x, y, nx, ny, h, col, far) {
  const tx = -ny, ty = nx, w = h * 0.42;
  const tip = [x + nx * h, y + ny * h];
  c.beginPath(); c.moveTo(x - tx * w * 0.5, y - ty * w * 0.5);
  c.quadraticCurveTo(x + nx * h * 0.45 - tx * w * 0.75, y + ny * h * 0.45 - ty * w * 0.75, tip[0], tip[1]);
  c.quadraticCurveTo(x + nx * h * 0.45 + tx * w * 0.75, y + ny * h * 0.45 + ty * w * 0.75, x + tx * w * 0.5, y + ty * w * 0.5); c.closePath();
  c.fillStyle = far ? dfMix(col, '#8A2A1E', 0.35) : col; c.fill();
  if (!far) paint(() => {
    c.beginPath(); c.moveTo(x + nx * h * 0.25, y + ny * h * 0.25); c.lineTo(tip[0] - nx * 6, tip[1] - ny * 6);
    c.lineWidth = Math.max(2, h * 0.035); c.strokeStyle = rgba(SG.plateHi, 0.85); c.lineCap = 'round'; c.stroke();
  });
}

// ---------------------------------------------------------------- the T. rex (drawn from its HIP)
const RX = { body: '#3A8C9C', bodyDk: '#2A6C7C', belly: '#EDE6B4', stripe: '#24586A', mouth: '#7A1E2A', gum: '#C24A5A', teeth: '#FFFCEE',
  eye: '#FFD23A', pupil: '#16131F', claw: '#F4ECD8', brow: '#1F4E5E' };
// (hx, hy) = the hip; facing right (flip -1 faces left); s = 1 is about 1,250 units tall when it stands up.
// o: {lean (rad, + = chest and head go down), neck (rad, + = head pitches down), jaw 0..1, reach 0..1 (the tiny arms point
//     forward), flail 0..1 (they wave), look [x, y], blink, walk (phase), stomp 0..1 (the near foot lifted), sniff 0..1
//     (nostrils flare), happy 0..1 (eyes squint, a grin), noLegs}
// returns o with o.snout and o.hand (world points) for staging checks
function dfRex(c, hx, hy, s, t, o = {}) {
  const P = RX, fl = o.flip || 1, ph = o.walk || 0;
  c.save(); c.translate(hx, hy); c.scale(s * fl, s);
  const legDraw = (sd, col) => {
    // a big drumstick thigh, a shin, and a three-toed foot; sd = phase offset
    const lift = sd === 0 ? clamp(o.stomp || 0) : 0, a = 0.18 * Math.sin(ph + sd) - 0.35 * lift;
    c.save(); c.rotate(a);
    c.beginPath(); c.moveTo(-90, -40); c.quadraticCurveTo(-120, 140, -20, 260); c.lineTo(70, 250); c.quadraticCurveTo(120, 120, 90, -40); c.closePath();
    c.fillStyle = col; c.fill();
    c.translate(25, 255); c.rotate(-a * 1.6 + 0.35 * lift);
    c.beginPath(); c.moveTo(-40, 0); c.lineTo(-30, 270); c.lineTo(28, 270); c.lineTo(40, 0); c.closePath(); c.fillStyle = col; c.fill();
    c.translate(0, 280);
    c.beginPath(); c.moveTo(-50, -20); c.lineTo(120, -10); c.lineTo(130, 22); c.lineTo(-50, 22); c.closePath(); c.fillStyle = col; c.fill();
    c.restore();
  };
  actor(() => {
    if (!o.noLegs) legDraw(Math.PI, P.bodyDk);                                   // the far leg
    c.save(); c.rotate(o.lean || 0);
    // the tail: long and thick, swinging a little
    const tw = 30 * dfSway(t, 1.1, 2);
    c.beginPath(); c.moveTo(-60, -110); c.quadraticCurveTo(-420, -120, -820, 30 + tw); c.quadraticCurveTo(-420, 20, -60, 90); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the far arm (behind the body)
    rexArm(c, 268, 52, o, t, P.bodyDk, 1.3);
    // the body: a deep barrel, the chest forward
    c.beginPath(); c.moveTo(-120, -90); c.bezierCurveTo(-20, -190, 230, -170, 300, -70);
    c.bezierCurveTo(350, 10, 330, 110, 250, 140); c.bezierCurveTo(130, 180, -60, 160, -120, 90); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the neck: from the shoulders up and forward to the skull
    c.save(); c.translate(280, -80); c.rotate(o.neck || 0);
    c.beginPath(); c.moveTo(-70, -60); c.quadraticCurveTo(40, -150, 120, -150); c.lineTo(150, -40); c.quadraticCurveTo(60, 20, -20, 90); c.closePath();
    c.fillStyle = P.body; c.fill();
    // the head (skull frame at the neck's end)
    c.translate(110, -110); c.rotate(o.head || 0);
    rexHead(c, o, t, P);
    c.restore();
    // the near arm (in front of the chest)
    rexArm(c, 286, 66, o, t, P.body, 0);
    c.restore();
    if (!o.noLegs) legDraw(0, P.body);                                           // the near leg
  });
  // the paint on the body (belly and stripes)
  paint(() => {
    c.save(); c.rotate(o.lean || 0);
    c.beginPath(); c.moveTo(-70, 120); c.bezierCurveTo(10, 160, 120, 165, 190, 150);
    c.lineWidth = 40; c.strokeStyle = rgba(P.belly, 0.85); c.lineCap = 'round'; c.stroke();
    for (let i = 0; i < 4; i++) { const xx = -40 + i * 75; line(c, xx, -150 + i * 4, xx + 18, -80, 16, rgba(P.stripe, 0.6)); }
    for (let i = 0; i < 4; i++) { const xx = -250 - i * 120; line(c, xx, -100 + i * 18, xx + 14, -40 + i * 14, 14, rgba(P.stripe, 0.55)); }
    c.restore();
  });
  // the face paint (eye, brow, nostril) in the head's frame
  paint(() => {
    c.save(); c.rotate(o.lean || 0); c.translate(280, -80); c.rotate(o.neck || 0); c.translate(110, -110); c.rotate(o.head || 0);
    rexFace(c, o, t, P);
    c.restore();
  });
  // where the snout tip and the near hand land (world), for staging
    c.restore();
  const toW = (lx, ly) => {   // local (hip frame, before the flip) -> world, using the same chain as above
    const L = o.lean || 0, N = o.neck || 0, Hd = o.head || 0;
    const rot = (px, py, a) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];
    let p = rot(lx, ly, Hd); p = [p[0] + 110, p[1] - 110]; p = rot(p[0], p[1], N); p = [p[0] + 280, p[1] - 80]; p = rot(p[0], p[1], L);
    return [hx + p[0] * s * fl, hy + p[1] * s];
  };
  o.snout = toW(255, 0);
  const ar = (() => { const L = o.lean || 0; return [286 * Math.cos(L) - 66 * Math.sin(L), 286 * Math.sin(L) + 66 * Math.cos(L)]; })();
  o.arm = [hx + ar[0] * s * fl, hy + ar[1] * s];
  return o;
}
function rexHead(c, o, t, P) {
  const jw = clamp(o.jaw || 0) * 0.5;
  // the lower jaw (hinged at the back), with its teeth
  c.save(); c.translate(10, 30); c.rotate(jw);
  c.beginPath(); c.moveTo(-20, -10); c.lineTo(225, 0); c.quadraticCurveTo(232, 30, 200, 44); c.quadraticCurveTo(80, 64, -20, 40); c.closePath();
  c.fillStyle = P.bodyDk; c.fill();
  if (jw > 0.04) {
    c.beginPath(); c.moveTo(0, -6); c.lineTo(215, 2); c.lineTo(205, 16); c.lineTo(0, 10); c.closePath(); c.fillStyle = P.mouth; c.fill();
  }
  for (let i = 0; i < 7; i++) { const tx = 40 + i * 26; c.beginPath(); c.moveTo(tx, 0); c.lineTo(tx + 8, -18); c.lineTo(tx + 15, 0); c.closePath(); c.fillStyle = P.teeth; c.fill(); }
  c.restore();
  if (jw > 0.04) { c.beginPath(); c.moveTo(20, 20); c.lineTo(230, 24); c.lineTo(20, 40 + 90 * jw); c.closePath(); c.fillStyle = P.mouth; c.fill(); }
  // the skull: a big boxy head with a brow ridge and a long snout
  c.beginPath(); c.moveTo(-60, -30); c.quadraticCurveTo(-50, -110, 40, -112); c.quadraticCurveTo(120, -112, 200, -70);
  c.quadraticCurveTo(250, -48, 258, -8); c.quadraticCurveTo(250, 24, 220, 28); c.lineTo(10, 30); c.quadraticCurveTo(-50, 30, -60, -30); c.closePath();
  c.fillStyle = P.body; c.fill();
  // the upper teeth along the jaw line
  for (let i = 0; i < 8; i++) { const tx = 40 + i * 25; c.beginPath(); c.moveTo(tx, 26); c.lineTo(tx + 8, 46); c.lineTo(tx + 15, 26); c.closePath(); c.fillStyle = P.teeth; c.fill(); }
}
function rexFace(c, o, t, P) {
  const hp = clamp(o.happy || 0), bl = clamp(o.blink || 0);
  // the eye: yellow with a slit-round pupil, under a heavy brow
  const ex = 58, ey = -62;
  ellipse(c, ex, ey, 24, 22 * (1 - 0.55 * hp), P.eye);
  const lk = o.look || [1, 0];
  circle(c, ex + 8 * lk[0], ey + 6 * lk[1], 10 * (1 - 0.3 * hp), P.pupil);
  if (bl > 0.05) { c.fillStyle = P.body; c.fillRect(ex - 28, ey - 26, 56, 52 * bl); }
  c.beginPath(); c.moveTo(ex - 34, ey - 22 - 6 * hp); c.quadraticCurveTo(ex, ey - 40 - 8 * hp, ex + 36, ey - 26); c.lineWidth = 14; c.strokeStyle = P.brow; c.lineCap = 'round'; c.stroke();
  // the nostril, flaring on a sniff
  const sn = clamp(o.sniff || 0);
  ellipse(c, 236, -28, 9 + 5 * sn, 6 + 4 * sn, '#1E4A34', -0.3);
  // a grin line when happy (the lips curl up at the back)
  if (hp > 0.1) { c.beginPath(); c.moveTo(10, 20); c.quadraticCurveTo(-6, 10, -14, -6); c.lineWidth = 7; c.strokeStyle = '#1E4A34'; c.stroke(); }
  // little stripes on the snout
  for (let i = 0; i < 3; i++) line(c, 120 + i * 32, -96 + i * 10, 128 + i * 32, -74 + i * 10, 9, rgba(P.stripe, 0.6));
}
// a tiny arm from the chest: two short bones and two claws; reach 0 = hanging, 1 = pointing forward; flail waves it
function rexArm(c, x, y, o, t, col, ph) {
  const rch = clamp(o.reach || 0), fla = clamp(o.flail || 0);
  const w1 = fla * 0.55 * Math.sin(t * 26 + ph * 2.1), w2 = fla * 0.7 * Math.sin(t * 26 + 1.2 + ph * 2.1);
  const a1 = lerp(1.2, 0.05, rch) + w1, a2 = lerp(0.6, -0.15, rch) + w2;   // angles from +x (down = +)
  const e = [x + Math.cos(a1) * 48, y + Math.sin(a1) * 48];
  const hnd = [e[0] + Math.cos(a1 + a2) * 44, e[1] + Math.sin(a1 + a2) * 44];
  line(c, x, y, e[0], e[1], 36, col);
  line(c, e[0], e[1], hnd[0], hnd[1], 30, col);
  circle(c, hnd[0], hnd[1], 17, col);
  const ca = a1 + a2;
  for (const d of [-0.5, 0.45]) {        // two stubby fingers with little claws
    const f1 = [hnd[0] + Math.cos(ca + d) * 30, hnd[1] + Math.sin(ca + d) * 30];
    line(c, hnd[0], hnd[1], f1[0], f1[1], 13, col);
    c.beginPath(); c.moveTo(f1[0] + Math.cos(ca + d + 1.6) * 6, f1[1] + Math.sin(ca + d + 1.6) * 6);
    c.lineTo(f1[0] + Math.cos(ca + d) * 16, f1[1] + Math.sin(ca + d) * 16 + 5); c.lineTo(f1[0] + Math.cos(ca + d - 1.6) * 6, f1[1] + Math.sin(ca + d - 1.6) * 6); c.closePath();
    c.fillStyle = RX.claw; c.fill();
  }
}

// ---------------------------------------------------------------- the bouquet
// (x, y) = the grip; the cone points down from it, the flowers fan up above. s = 1 is about 300 units tall.
// o: {rot, eaten 0..1 (blooms gone, one by one), wiggle}
function dfBouquet(c, x, y, s, t, o = {}) {
  const ea = clamp(o.eaten || 0), rot = o.rot || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  // stems
  const heads = [[-62, -205, '#FF3D5E', 0, 34], [10, -238, '#FFD447', 3, 38], [70, -196, '#B48CFF', 2, 32], [-20, -168, '#FFFFFF', 1, 30],
    [40, -150, '#FF8A3C', 0, 30], [-80, -140, '#FF6AD0', 2, 28], [92, -128, '#FF3D5E', 1, 26]];
  for (let i = 0; i < heads.length; i++) {
    const [hx, hy] = heads[i];
    line(c, hx * 0.15, -40, hx, hy + 16, 7, '#3E8A34');
  }
  // leaves
  for (const [lx, ly, a] of [[-70, -100, -0.9], [76, -92, 0.9], [-40, -120, -0.5], [50, -112, 0.5]]) ellipse(c, lx, ly, 40, 14, '#4E9A3E', a);
  // the heads, eaten one by one (the last ones go first)
  for (let i = 0; i < heads.length; i++) {
    const gone = clamp(ea * heads.length - (heads.length - 1 - i));
    if (gone >= 0.99) continue;
    const [hx, hy, col, kind, r] = heads[i];
    const wob = 0.06 * Math.sin(t * 3 + i) * (o.wiggle || 0);
    paint(() => {
      if (kind === 3) {          // a sunflower
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ellipse(c, hx + Math.cos(a) * r * 0.75, hy + Math.sin(a) * r * 0.75, r * 0.45, r * 0.2, '#FFD447', a); }
        circle(c, hx, hy, r * 0.5, '#7A4A1E');
      } else if (kind === 0) {   // a rose: a cup with a spiral
        circle(c, hx, hy, r * (1 - gone), col);
        c.beginPath(); c.arc(hx, hy, r * 0.55 * (1 - gone), 0.2, 4.6); c.lineWidth = 5; c.strokeStyle = dfMix(col, '#5A0A1A', 0.35); c.stroke();
        c.beginPath(); c.arc(hx + 3, hy - 2, r * 0.25 * (1 - gone), 2.2, 6.8); c.stroke();
      } else dfFlower(c, hx, hy, r, col, kind, 1 - gone, wob);
    });
  }
  // the cone: kraft paper over pink tissue, a red ribbon at the grip
  c.beginPath(); c.moveTo(-120, -110); c.lineTo(120, -110); c.lineTo(22, 120); c.lineTo(-22, 120); c.closePath(); c.fillStyle = '#FF9EC2'; c.fill();
  c.beginPath(); c.moveTo(-104, -96); c.lineTo(66, -122); c.lineTo(104, -86); c.lineTo(18, 124); c.lineTo(-20, 124); c.closePath(); c.fillStyle = '#E6C493'; c.fill();
  paint(() => {
    line(c, -60, -60, -8, 110, 4, 'rgba(150,110,60,0.5)');
    line(c, 40, -80, 10, 110, 4, 'rgba(150,110,60,0.5)');
  });
  c.beginPath(); c.moveTo(-34, -6); c.lineTo(34, -6); c.lineTo(30, 18); c.lineTo(-30, 18); c.closePath(); c.fillStyle = '#E8343F'; c.fill();
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(sd * 46, -26, sd * 52, 8); c.quadraticCurveTo(sd * 30, 18, 0, 6); c.fillStyle = '#E8343F'; c.fill(); }
  c.restore();
}

// ---------------------------------------------------------------- the time road (screen space)
// three of them on a strip of time: Stegosaurus 150 million years ago (left), T. rex 67 (middle), the hero now (right).
// o: {kYou, kStego (brackets 0..1), rexLook (-1 back at Stego .. 1 at him), wave, cam}
const DF_ROAD = { y: 1000, x0: 190, x1: 780 };
function dfRoadX(myaAgo) { return DF_ROAD.x0 + (150 - myaAgo) / 150 * (DF_ROAD.x1 - DF_ROAD.x0); }
function dfRoadBack(cam, t) {
  // a big dusk sky with stars coming out, a low sun, and the road of time running across the land
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1B1F5A'); g.addColorStop(0.42, '#5A3E8C'); g.addColorStop(0.62, '#E2789A'); g.addColorStop(0.72, '#FFC27A'); g.addColorStop(1, '#FFC27A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = mulberry32(5);
  for (let i = 0; i < 70; i++) { const sx = r() * W, sy = r() * 760, a = 0.35 + 0.5 * Math.max(0, Math.sin(t * loopW(1.5 + r()) + i)); circle(ctx, sx, sy, 1.5 + r() * 2.2, rgba('#FFFFFF', a)); }
  applyCam(cam);
  // far hills, the land, the road
  ctx.fillStyle = '#6A4E8A'; ctx.beginPath(); ctx.moveTo(-600, 1060);
  for (let x = -600; x <= 1700; x += 100) ctx.lineTo(x, 1000 - 60 * Math.abs(Math.sin(x * 0.006)) - 30 * Math.abs(Math.sin(x * 0.017)));
  ctx.lineTo(1700, 1060); ctx.closePath(); ctx.fill();
  softDot(ctx, 960, 1010, 260, '#FFD08A', 0.5); softDot(gctx, 960, 1010, 220, '#FFC060', 0.6);
  const lg = ctx.createLinearGradient(0, 1040, 0, 1900); lg.addColorStop(0, '#3E3A6E'); lg.addColorStop(1, '#22204A');
  ctx.fillStyle = lg; ctx.fillRect(-800, 1040, 2700, 1400);
}
function dfRoad(cam, t, o) {
  applyCam(cam);
  const y = DF_ROAD.y, x0 = DF_ROAD.x0 - 70, x1 = DF_ROAD.x1 + 70;
  // the strip: green (the Jurassic) to pink (the bloom) to blue (now), with a tick every 10 million years
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#3E9A4A'); g.addColorStop(0.45, '#7CB84A'); g.addColorStop(0.58, '#FF8DB7'); g.addColorStop(0.9, '#7FC8FF'); g.addColorStop(1, '#7FC8FF');
  rrect(ctx, x0, y, x1 - x0, 44, 22); ctx.fillStyle = g; ctx.fill();
  paint(() => {
    for (let m = 0; m <= 150; m += 10) { const tx = dfRoadX(m); line(ctx, tx, y + 8, tx, y + (m % 50 ? 20 : 36), m % 50 ? 4 : 6, 'rgba(20,16,50,0.55)'); }
  });
}
// a bracket under the road from xa to xb, with its words below
function dfBracket(xa, xb, y, k, col, txt, sub) {
  if (k <= 0) return;
  const kk = E.outCubic(clamp(k * 1.4)), xm = (xa + xb) / 2, xe = lerp(xm, xb, kk), xs = lerp(xm, xa, kk);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(xs, y - 26); ctx.lineTo(xs, y); ctx.lineTo(xe, y); ctx.lineTo(xe, y - 26);
  ctx.lineWidth = 11; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xm - 18, y); ctx.lineTo(xm, y + 18); ctx.lineTo(xm + 18, y); ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
  const tk = clamp(k * 2 - 0.6);
  if (tk > 0) {
    const sc = lerp(0.5, 1, E.outBack(tk));
    ctx.save(); ctx.translate(xm, y + 74); ctx.scale(sc, sc);
    ctx.font = '400 66px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
    if (sub) { ctx.font = '900 30px Montserrat'; ctx.lineWidth = 8; ctx.strokeText(sub, 0, 50); ctx.fillStyle = '#FFFFFF'; ctx.fillText(sub, 0, 50); }
    ctx.restore();
  }
}
// a label over a figure on the road (screen space after applyCam(cam) -> drawn in world = road space)
function dfRoadLabel(x, y, txt, k, col) {
  if (k <= 0) return;
  const sc = lerp(0.6, 1, E.outBack(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 36;
  rrect(ctx, -w / 2, -28, w, 56, 18); ctx.fillStyle = 'rgba(12,10,30,0.82)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 2);
  ctx.restore();
}

// ---------------------------------------------------------------- the YEARS AGO counter and the tags (from sharks-older-than-trees'
// creatures.js, 27 Oct 2026; screen space)
function yearsHud(k, val, mode, t, y = 560) {
  if (k <= 0) return;
  screenSpace();
  const s = lerp(0.7, 1, E.outBack(clamp(k)));
  ctx.save(); ctx.translate(540, y); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 2);
  rrect(ctx, -300, -82, 600, 164, 30); ctx.fillStyle = 'rgba(12,10,30,0.82)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = mode === 'ff' ? '#4DFFB4' : '#C8A8FF'; ctx.stroke();
  const num = Math.round(val / 1e5) * 1e5;
  const txt = num.toLocaleString('en-US');
  ctx.font = '400 92px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const wNum = ctx.measureText(txt).width, sz = Math.min(1, 470 / wNum);
  ctx.save(); ctx.translate(26, -10); ctx.scale(sz, sz);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 0); ctx.restore();
  ctx.font = '800 30px Montserrat'; ctx.fillStyle = mode === 'ff' ? '#4DFFB4' : '#C8A8FF'; ctx.fillText('YEARS AGO', 26, 56);
  const on = 0.55 + 0.45 * Math.sign(Math.sin(t * 14));
  ctx.fillStyle = rgba(mode === 'ff' ? '#4DFFB4' : '#C8A8FF', on);
  const dir = mode === 'ff' ? 1 : -1;
  for (const ox of [-250, -214]) {
    ctx.beginPath(); ctx.moveTo(ox - 16 * dir, -28); ctx.lineTo(ox + 16 * dir, 0); ctx.lineTo(ox - 16 * dir, 28); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function shTag(txt, x, y, k, col, sub, lead) {
  if (k <= 0) return;
  screenSpace();
  if (lead) thinLeader([x, y + (sub ? 46 : 30)], lead, clamp(k * 1.3 - 0.2), col);
  const s = lerp(0.6, 1, E.outBack(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '900 42px Montserrat'; const w1 = ctx.measureText(txt).width;
  ctx.font = '800 26px Montserrat'; const w2 = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + 84, h = sub ? 108 : 70;
  rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(12,12,28,0.84)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  circle(ctx, -w / 2 + 28, sub ? -16 : 0, 9, col);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '900 42px Montserrat'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, -w / 2 + 50, sub ? -16 : 2);
  if (sub) { ctx.font = '800 26px Montserrat'; ctx.fillStyle = col; ctx.fillText(sub, -w / 2 + 50, 26); }
  ctx.restore();
}

// ---------------------------------------------------------------- a leafy bush in bloom (in front of something): a mound of
// overlapping leaf clumps with blossoms on it. (x, y) = the middle of its base; w, h its size (world units)
function dfBush(c, x, y, w, h, t, bloom, seed = 21) {
  const r = mulberry32(seed);
  const cols = ['#2F7A3A', '#3A8A40', '#45984A'];
  const clumps = [];
  for (let i = 0; i < 14; i++) {
    const u = (i + 0.5) / 14, bx = x + (u - 0.5) * w * 0.95, top = h * (0.55 + 0.45 * Math.sin(Math.PI * u)) * (0.8 + 0.25 * r());
    clumps.push([bx, y - top * 0.55, w * 0.13 + 30 * r(), top * 0.5]);
  }
  c.fillStyle = cols[0]; c.fillRect(x - w / 2, y - h * 0.4, w, h * 2);
  clumps.forEach(([bx, by, rx, ry], i) => ellipse(c, bx + 4 * dfSway(t, 0.9, i), by, rx, ry, cols[i % 3]));
  paint(() => {
    for (let i = 0; i < 26; i++) {
      const lx = x + (r() - 0.5) * w * 0.9, ly = y - r() * h * 0.85, a = (r() - 0.5) * 2;
      ellipse(c, lx, ly, 22, 8, i % 2 ? '#5AAE52' : '#2A6A32', a);
    }
    if (bloom > 0.02) for (let i = 0; i < 9; i++) {
      const lx = x + (r() - 0.5) * w * 0.85, ly = y - (0.35 + 0.55 * r()) * h * 0.85;
      dfFlower(c, lx, ly, 20 + 8 * r(), DFC.meadow[i % DFC.meadow.length], i % 3, bloom, (r() - 0.5) * 0.5);
    }
  });
}
