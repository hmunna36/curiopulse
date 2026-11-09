// The EIFFEL TOWER Gets Taller in Summer: the world (10 Nov 2026). Paris on a blazing summer day: a deep blue sky with
// cumulus, a white-hot Sun, the city's zinc roofs and cream stone, chestnut trees, the Champ de Mars, and the tower itself,
// drawn with shapes every frame so it catches the light, and able to grow, stretch like a cat, lean, glow hot on one side
// and wear a sleepy face. Everything is seeded (mulberry32) and loops on loopW clocks.
'use strict';

const EF = {
  skyTop: '#1E6FD9', skyMid: '#4FA3F0', skyLow: '#BFE4FA', haze: '#FFE8C2',
  iron: '#8C5B37', ironSh: '#5F3B22', ironHi: '#D3955C', ironDk: '#3F2616', ironLine: '#5A361F',
  stone: '#EDE2C9', stoneSh: '#CDBB98', stoneDk: '#A99577', stoneHi: '#FFF6E2',
  zinc: '#7D90A8', zincSh: '#5E7088', zincHi: '#B3C4D8',
  leaf: '#3F8F3A', leafSh: '#2B6A2A', leafHi: '#78C25A',
  lawn: '#6BC24B', lawnSh: '#4F9C37', path: '#EBD9AA', water: '#3E9BD6',
  sun: '#FFF6C8', hot: '#FF7A1F', hot2: '#FFB347',
};

// ---------------------------------------------------------------- far layers: drawn in the shot's own screen frame,
// moving by p times the camera's motion away from the shot's reference camera cam0 (so a far thing barely moves)
function efFar(cam, cam0, p) {
  const z = 1 + (cam.zoom / cam0.zoom - 1) * p;
  const dx = -(cam.x - cam0.x) * cam.zoom * p, dy = -(cam.y - cam0.y) * cam.zoom * p;
  const ox = W / 2 + dx + (cam.sx || 0) * p - (W / 2) * z, oy = H / 2 + dy + (cam.sy || 0) * p - (H / 2) * z;
  ctx.setTransform(z, 0, 0, z, ox, oy);
  gctx.setTransform(z / 2, 0, 0, z / 2, ox / 2, oy / 2);
}

// ---------------------------------------------------------------- the sky, the Sun, the clouds
let EF_CLOUDS = null;
function efCloudImg(seed, w, h) {
  const cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(seed);
  const puffs = [];
  const n = 9 + Math.floor(rnd() * 5);
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const r = h * (0.18 + 0.2 * Math.sin(Math.PI * u) + 0.06 * rnd());
    puffs.push([w * (0.1 + 0.8 * u) + (rnd() - 0.5) * 20, h * 0.72 - r * (0.5 + 0.4 * rnd()), r]);
  }
  // the shaded underside first, then the lit body offset up, then a bright top rim
  for (const [px, py, r] of puffs) { x.fillStyle = '#C9D8EC'; x.beginPath(); x.arc(px, py + r * 0.18, r, 0, 7); x.fill(); }
  x.fillStyle = '#C9D8EC'; x.fillRect(w * 0.1, h * 0.62, w * 0.8, h * 0.12);
  for (const [px, py, r] of puffs) { x.fillStyle = '#F4F8FF'; x.beginPath(); x.arc(px - r * 0.06, py - r * 0.04, r * 0.92, 0, 7); x.fill(); }
  for (const [px, py, r] of puffs) { x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(px - r * 0.18, py - r * 0.2, r * 0.6, 0, 7); x.fill(); }
  // a flat base
  x.globalCompositeOperation = 'destination-out';
  x.fillRect(0, h * 0.74, w, h);
  x.globalCompositeOperation = 'source-over';
  return cv;
}
function efSkyInit() {
  EF_CLOUDS = [efCloudImg(11, 520, 220), efCloudImg(23, 420, 180), efCloudImg(37, 640, 240), efCloudImg(41, 360, 150)];
}
// o: {sunX, sunY, sunR, horizon (screen y), clouds: [[i, x, y, s], ...], heat (0..1), tint: dusk 0..1}
function efSky(t, o = {}) {
  const hz = o.horizon != null ? o.horizon : 1300;
  const g = ctx.createLinearGradient(0, -400, 0, hz + 60);
  const dusk = o.dusk || 0;
  g.addColorStop(0, mixH(EF.skyTop, '#3A4FC4', dusk));
  g.addColorStop(0.55, mixH(EF.skyMid, '#E58A6A', dusk * 0.8));
  g.addColorStop(0.92, mixH(EF.skyLow, '#FFC48A', dusk));
  g.addColorStop(1, mixH(EF.haze, '#FFB070', dusk));
  ctx.fillStyle = g; ctx.fillRect(-1200, -1600, W + 2400, hz + 1700 + 200);
  ctx.fillStyle = mixH(EF.haze, '#FFB070', dusk); ctx.fillRect(-1200, hz + 50, W + 2400, 2400);
  // the Sun: a white-hot disc with a warm halo (the halo and the disc bloom through the glow layer)
  if (o.sunX != null) {
    const r = o.sunR || 70;
    softDot(ctx, o.sunX, o.sunY, r * 4.2, '#FFE9A8', 0.45);
    softDot(ctx, o.sunX, o.sunY, r * 2.2, '#FFF4C8', 0.7);
    circle(ctx, o.sunX, o.sunY, r, EF.sun);
    softDot(gctx, o.sunX, o.sunY, r * 2.6, '#FFE7A0', 0.9);
    softDot(gctx, o.sunX, o.sunY, r * 1.2, '#FFFFFF', 1);
  }
  // clouds drift on loop-safe clocks
  for (const cl of o.clouds || []) {
    const [i, x0, y0, s] = cl, img = EF_CLOUDS[i % EF_CLOUDS.length];
    const dx = 18 * Math.sin(t * loopW(0.08) + i * 2.1);
    ctx.drawImage(img, x0 + dx - (img.width * s) / 2, y0 - (img.height * s) / 2, img.width * s, img.height * s);
  }
}

// ---------------------------------------------------------------- the city: strips of Haussmann blocks, painted once
let EF_CITY = null;
function efBlockStrip(seed, w, h, o) {
  const cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(seed);
  let px = -20;
  while (px < w) {
    const bw = o.bw[0] + rnd() * (o.bw[1] - o.bw[0]);
    const bh = o.bh[0] + rnd() * (o.bh[1] - o.bh[0]);
    const top = h - bh, roofH = bh * (0.22 + 0.08 * rnd());
    const facade = mixH(o.facade, o.facade2, rnd());
    x.fillStyle = facade; x.fillRect(px, top + roofH, bw + 1, bh);
    // the mansard roof: zinc, with dormers and a chimney stack with pots
    x.fillStyle = mixH(o.roof, o.roof2, rnd());
    x.beginPath(); x.moveTo(px - 2, top + roofH); x.lineTo(px + bw * 0.12, top + 4); x.lineTo(px + bw * 0.88, top + 4); x.lineTo(px + bw + 2, top + roofH); x.closePath(); x.fill();
    if (o.detail) {
      x.fillStyle = o.roofHi; x.fillRect(px + bw * 0.12, top + 3, bw * 0.76, 3);
      const nd = Math.max(1, Math.floor(bw / 34));
      for (let i = 0; i < nd; i++) {
        const dx = px + bw * 0.16 + (i + 0.5) * (bw * 0.68) / nd;
        x.fillStyle = o.facade2; x.fillRect(dx - 6, top + roofH * 0.38, 12, roofH * 0.42);
        x.fillStyle = o.win; x.fillRect(dx - 4, top + roofH * 0.46, 8, roofH * 0.3);
      }
      // window rows with a balcony line under the 2nd and 5th floors
      const rows = Math.max(2, Math.floor((bh - roofH) / 26)), cols = Math.max(2, Math.floor(bw / 22));
      for (let r = 0; r < rows; r++) {
        const wy = top + roofH + 8 + r * ((bh - roofH - 14) / rows);
        for (let c2 = 0; c2 < cols; c2++) {
          const wx = px + 6 + (c2 + 0.5) * ((bw - 12) / cols) - 4;
          x.fillStyle = rnd() < 0.18 ? o.winLit : o.win; x.fillRect(wx, wy, 8, 13);
        }
        if (r === 1 || r === 4) { x.fillStyle = o.balc; x.fillRect(px + 4, wy + 15, bw - 8, 2.5); }
      }
      if (rnd() < 0.8) {   // chimney stack + orange pots
        const cx2 = px + bw * (0.2 + 0.6 * rnd());
        x.fillStyle = o.facade2; x.fillRect(cx2 - 9, top - 16, 18, 22);
        for (let k = 0; k < 3; k++) { x.fillStyle = '#D9773F'; x.fillRect(cx2 - 8 + k * 6, top - 22, 4, 8); }
      }
    } else {
      x.fillStyle = o.win;
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < Math.floor(bw / 16); c2++) if (rnd() < 0.6) x.fillRect(px + 4 + c2 * 16, top + roofH + 6 + r * 14, 5, 7);
    }
    px += bw + (rnd() < 0.15 ? 6 + rnd() * 20 : 0);
  }
  return cv;
}
function efTreeStrip(seed, w, h, col, colSh, colHi) {
  const cv = mkCanvas(w, h), x = cv.getContext('2d'), rnd = mulberry32(seed);
  for (let px = -20; px < w + 40; px += 26 + rnd() * 20) {
    const r = h * (0.22 + 0.14 * rnd()), cy = h - r * 0.9;
    x.fillStyle = colSh; x.beginPath(); x.arc(px, cy + r * 0.12, r, 0, 7); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(px - r * 0.12, cy - r * 0.06, r * 0.86, 0, 7); x.fill();
    x.fillStyle = colHi; x.beginPath(); x.arc(px - r * 0.3, cy - r * 0.32, r * 0.42, 0, 7); x.fill();
  }
  x.fillStyle = colSh; x.fillRect(0, h - 6, w, 6);
  return cv;
}
function efCityInit() {
  EF_CITY = {
    far: efBlockStrip(301, 2600, 160, { bw: [50, 140], bh: [60, 120], facade: '#C9D3E6', facade2: '#B9C4DB', roof: '#9FAECB', roof2: '#8E9FC0', win: '#A7B4CF', detail: false }),
    mid: efBlockStrip(302, 2800, 300, { bw: [90, 200], bh: [170, 260], facade: '#F1E4C8', facade2: '#E2D2B0', roof: EF.zinc, roof2: '#6C7F98',
      roofHi: EF.zincHi, win: '#5B6B86', winLit: '#FFE2A0', balc: '#3A3F52', detail: true }),
    trees: efTreeStrip(303, 2800, 170, EF.leaf, EF.leafSh, EF.leafHi),
    treesFar: efTreeStrip(304, 2800, 110, '#5C9E5A', '#4A8650', '#86C077'),
  };
}
// draw a strip so that its bottom sits on y, tiled from x0, scaled by s
function efStrip(img, x0, y, s, alpha = 1) {
  const w = img.width * s, h = img.height * s;
  ctx.globalAlpha = alpha;
  for (let x = x0 - w; x < W + 1400; x += w) ctx.drawImage(img, x, y - h, w + 1, h);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the tower
// Front view of one face. (x, baseY): the foot of its axis; H: full height to the antenna tip, in px.
// o: {grow (0..: the whole height scales by 1 + grow), stretch (0..1: a cat's stretch: taller, thinner on top, splayed feet),
//     lean (px at the tip: the top leans; follows v^2), hot (0..1), sunSide (+1 right / -1 left), face (0..1), mood ('sleepy' |
//     'happy' | 'squint'), noAntenna, ghost (0..1: the winter outline, dashed), detail (1 = full lattice), flat (no fills)}
const EF_TW = { p1: [0.165, 0.193], p2: [0.344, 0.362], p3: [0.832, 0.846] };
function efHW(v) { return v < EF_TW.p3[0] ? 0.19 * Math.exp(-2.75 * v) : v < 0.846 ? 0.031 : v < 0.892 ? 0.016 : v < 0.915 ? 0.012 * (1 - (v - 0.892) / 0.023 * 0.6) : 0.0035; }
function efLegW(v) { return 0.072 * Math.exp(-1.7 * v); }
function efInner(v) { return v < 0.19 ? efHW(v) - efLegW(v) : Math.max(0, 0.046 * Math.pow(Math.max(0, 1 - (v - 0.19) / 0.155), 1.25)); }
function efTowerMap(x, baseY, H, o) {
  const k = o.stretch || 0, g = o.grow || 0, lean = o.lean || 0;
  const vy = (v) => baseY - H * (1 + g) * v * (1 + 0.16 * k * Math.min(1, v / 0.5) * Math.min(1, v / 0.5));
  const ws = (v) => 1 + k * (0.12 * Math.pow(1 - v, 4) - 0.14 * v);
  const lx = (v) => lean * v * v + (o.wobble || 0) * Math.sin(v * 6);
  return { P: (v, u) => [x + lx(v) + u * efHW(v) * H * ws(v), vy(v)], X: (v, w) => x + lx(v) + w * H * ws(v), Y: vy, ws, lx };
}
function efTower(c, x, baseY, H, o = {}) {
  const M = efTowerMap(x, baseY, H, o), P = M.P;
  const side = o.sunSide || 1;
  const grad = (y0, y1) => {
    const g = c.createLinearGradient(x - 0.2 * H, 0, x + 0.2 * H, 0);
    const lit = EF.ironHi, mid = EF.iron, dk = EF.ironSh;
    if (side > 0) { g.addColorStop(0, dk); g.addColorStop(0.45, mid); g.addColorStop(1, lit); }
    else { g.addColorStop(0, lit); g.addColorStop(0.55, mid); g.addColorStop(1, dk); }
    return g;
  };
  const hot = o.hot || 0;
  let hotFs = null;
  if (hot > 0.01) {   // the hot side: an orange wash on the sunny half, laid on each shape of the tower (never on the sky)
    hotFs = c.createLinearGradient(x - side * 0.2 * H, 0, x + side * 0.22 * H, 0);
    hotFs.addColorStop(0, rgba(EF.hot, 0)); hotFs.addColorStop(0.5, rgba(EF.hot, 0.0)); hotFs.addColorStop(1, rgba(EF.hot2, 0.62 * hot));
  }
  const fillHot = () => { if (hotFs) { c.fillStyle = hotFs; c.fill(); } };
  const fillPoly = (pts, fs) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fillStyle = fs; c.fill(); fillHot(); };
  const edge = (v0, v1, f, n = 16) => { const out = []; for (let i = 0; i <= n; i++) { const v = v0 + ((v1 - v0) * i) / n; out.push(f(v)); } return out; };
  const lw = Math.max(1.2, H * 0.0022);
  const latt = (pts, v0, v1, step) => {   // a lattice of X braces inside a polygon (paint: thin lines, no shape of their own)
    c.save(); c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.clip();
    c.strokeStyle = EF.ironLine; c.lineWidth = lw; c.beginPath();
    for (let v = v0; v < v1; v += step) {
      const a = M.Y(v), b = M.Y(v + step), xl = M.X(v, -0.25) - 0.25 * H, xr = M.X(v, 0.25) + 0.25 * H;
      for (let xx = xl; xx < xr; xx += (a - b) * 0.9) { c.moveTo(xx, a); c.lineTo(xx + (a - b) * 0.9, b); c.moveTo(xx + (a - b) * 0.9, a); c.lineTo(xx, b); }
      c.moveTo(xl, a); c.lineTo(xr, a);
    }
    c.stroke(); c.restore();
  };
  const fs = grad();
  // --- the four parts, bottom to top: two lower legs, the middle legs, the shaft, the top
  const legs = [];
  for (const s of [-1, 1]) {
    const outer = edge(0, EF_TW.p1[0] + 0.006, (v) => P(v, s));
    const inner = edge(EF_TW.p1[0] + 0.006, 0, (v) => [M.X(v, s * efInner(v)), M.Y(v)]);
    legs.push(outer.concat(inner));
  }
  const mids = [];
  for (const s of [-1, 1]) {
    const outer = edge(EF_TW.p1[1] - 0.004, EF_TW.p2[0] + 0.004, (v) => P(v, s), 12);
    const inner = edge(EF_TW.p2[0] + 0.004, EF_TW.p1[1] - 0.004, (v) => [M.X(v, s * efInner(v)), M.Y(v)], 12);
    mids.push(outer.concat(inner));
  }
  const shaft = edge(EF_TW.p2[1] - 0.003, EF_TW.p3[0] + 0.003, (v) => P(v, -1), 24).concat(edge(EF_TW.p3[0] + 0.003, EF_TW.p2[1] - 0.003, (v) => P(v, 1), 24));
  if (o.ghost > 0) {   // the cold tower's outline, dashed, left where the top used to be
    const G = efTowerMap(x, baseY, H, Object.assign({}, o, { grow: 0, stretch: 0, lean: 0, wobble: 0 }));
    c.save(); c.setLineDash([H * 0.012, H * 0.01]); c.lineWidth = Math.max(2, H * 0.003); c.strokeStyle = rgba('#FFFFFF', 0.8 * o.ghost);
    c.beginPath(); c.moveTo(G.X(0.8, -0.1), G.Y(1)); c.lineTo(G.X(0.8, 0.1), G.Y(1)); c.stroke(); c.restore();
  }
  for (const pts of legs) fillPoly(pts, fs);
  for (const pts of mids) fillPoly(pts, fs);
  fillPoly(shaft, fs);
  // the big arch between the feet (under the first platform)
  {
    const v0 = 0.025, xL = M.X(v0, -efInner(v0)), xR = M.X(v0, efInner(v0)), yb = M.Y(v0), yt = M.Y(EF_TW.p1[0] - 0.008);
    const cx = (xL + xR) / 2, rx = (xR - xL) / 2, ry = yb - yt;
    c.beginPath(); c.ellipse(cx, yb, rx, ry, 0, Math.PI, 2 * Math.PI); c.ellipse(cx, yb, rx * 0.93, ry * 0.9, 0, 2 * Math.PI, Math.PI, true); c.closePath();
    c.fillStyle = fs; c.fill(); fillHot();
    // the spandrel lace between the arch and the platform
    c.save(); c.strokeStyle = EF.ironLine; c.lineWidth = lw;
    for (let i = 1; i < 14; i++) { const a = Math.PI + (Math.PI * i) / 14; c.beginPath(); c.moveTo(cx + rx * Math.cos(a), yb + ry * Math.sin(a)); c.lineTo(cx + rx * Math.cos(a) * 1.02, yt); c.stroke(); }
    c.restore();
  }
  // platforms (the first with a frieze of little arches; railings on top)
  const plat = (v0, v1, hw, frieze) => {
    const y0 = M.Y(v1), y1 = M.Y(v0), xm = M.X((v0 + v1) / 2, 0), w = hw * H * M.ws(v0);
    rrect(c, xm - w, y0, 2 * w, y1 - y0, Math.min(4, (y1 - y0) / 3)); c.fillStyle = fs; c.fill(); fillHot();
    c.fillStyle = rgba(EF.ironHi, 0.8); c.fillRect(xm - w, y0, 2 * w, Math.max(1.5, (y1 - y0) * 0.16));
    if (frieze) {
      const n = 13, step = (2 * w) / n, r = Math.min(step * 0.42, (y1 - y0) * 0.6);
      c.save(); c.strokeStyle = EF.ironDk; c.lineWidth = lw * 1.1;
      for (let i = 0; i < n; i++) { c.beginPath(); c.arc(xm - w + step * (i + 0.5), y1, r, Math.PI, 2 * Math.PI); c.stroke(); }
      c.restore();
    }
    // a railing: tiny posts
    c.save(); c.strokeStyle = rgba(EF.ironDk, 0.9); c.lineWidth = Math.max(1, lw * 0.7); c.beginPath();
    for (let xx = xm - w + 3; xx < xm + w; xx += Math.max(4, H * 0.007)) { c.moveTo(xx, y0); c.lineTo(xx, y0 - Math.max(2, H * 0.006)); }
    c.moveTo(xm - w, y0 - Math.max(2, H * 0.006)); c.lineTo(xm + w, y0 - Math.max(2, H * 0.006)); c.stroke(); c.restore();
  };
  // lattice on every part (only when the tower is big enough to show it)
  if (H > 260) {
    for (const pts of legs) latt(pts, 0, EF_TW.p1[0], 0.028);
    for (const pts of mids) latt(pts, EF_TW.p1[1], EF_TW.p2[0], 0.03);
    latt(shaft, EF_TW.p2[1], EF_TW.p3[0], 0.034);
  }
  plat(EF_TW.p1[0], EF_TW.p1[1], 0.13, true);
  plat(EF_TW.p2[0], EF_TW.p2[1], 0.074, false);
  // the top: platform, the cabin, the little dome, the antenna with red and white bands
  plat(EF_TW.p3[0], EF_TW.p3[1], 0.032, false);
  {
    const y0 = M.Y(0.892), y1 = M.Y(EF_TW.p3[1]), xm = M.X(0.87, 0), w = 0.016 * H;
    rrect(c, xm - w, y0, 2 * w, y1 - y0, 3); c.fillStyle = fs; c.fill();
    c.fillStyle = rgba('#FFE7B8', 0.85);
    for (let i = -1; i <= 1; i++) c.fillRect(xm + i * w * 0.55 - w * 0.16, y0 + (y1 - y0) * 0.3, w * 0.32, (y1 - y0) * 0.38);
    const yd = M.Y(0.915);
    c.beginPath(); c.moveTo(xm - w * 0.8, y0); c.quadraticCurveTo(xm, yd - (y0 - yd) * 0.2, xm + w * 0.8, y0); c.closePath(); c.fillStyle = fs; c.fill();
    if (!o.noAntenna) {
      const ya = M.Y(1), xa = M.X(1, 0), xb = M.X(0.915, 0), aw = Math.max(2.5, H * 0.0045);
      line(c, xb, yd, xa, ya, aw, EF.ironSh);
      for (let i = 0; i < 4; i++) {
        const u0 = 0.55 + i * 0.1, u1 = u0 + 0.05;
        line(c, lerp(xb, xa, u0), lerp(yd, ya, u0), lerp(xb, xa, u1), lerp(yd, ya, u1), aw * 1.25, '#E8473C');
      }
    }
  }
  return M;
}
// the tower's glow when hot: an orange bloom along the sunny edge, in the glow layer
function efTowerGlow(M, H, side, k) {
  if (k <= 0.01) return;
  for (let v = 0.02; v < 0.84; v += 0.04) {
    const p = M.P(v, side * 0.85);
    softDot(gctx, p[0], p[1], H * (0.03 + 0.03 * (1 - v)), EF.hot2, 0.32 * k);
  }
}
// a sleepy face on the shaft (paint: no edge, no shadow). mood: 'sleepy' (closed, content) | 'happy' | 'squint'
function efTowerFace(c, M, H, k, mood = 'sleepy', t = 0, yawn = 0) {
  if (k <= 0.01) return;
  const v = 0.43, p = M.P(v, 0), s = H * 0.02 * k, y = p[1];
  paint(() => {
    c.save(); c.translate(p[0], y);
    c.lineCap = 'round'; c.strokeStyle = '#24130A'; c.lineWidth = Math.max(2, s * 0.32);
    for (const sx of [-1, 1]) {   // eyes: thin closed lids (content), a happy ^, or a squint
      c.beginPath();
      if (mood === 'squint') { c.moveTo(sx * s * 1.6 - s * 0.7, -s * 0.3); c.lineTo(sx * s * 1.6 + s * 0.7, s * 0.15); }
      else if (mood === 'happy') c.arc(sx * s * 1.6, s * 0.3, s * 0.7, Math.PI * 1.15, Math.PI * 1.85);
      else c.arc(sx * s * 1.6, -s * 0.5, s * 0.75, Math.PI * 0.2, Math.PI * 0.8);
      c.stroke();
      line(c, sx * s * 1.6 + sx * s * 0.62, -s * 0.12, sx * s * 1.6 + sx * s * 0.95, -s * 0.42, Math.max(1.5, s * 0.22), '#24130A');   // a lash
    }
    ellipse(c, -s * 2.5, s * 0.9, s * 0.62, s * 0.34, rgba('#FF6A6A', 0.6));
    ellipse(c, s * 2.5, s * 0.9, s * 0.62, s * 0.34, rgba('#FF6A6A', 0.6));
    if (yawn > 0.05) {            // a yawn: a dark oval mouth with a tongue
      ellipse(c, 0, s * 1.5, s * 0.55 * (0.6 + 0.4 * yawn), s * 0.85 * yawn, '#3A1208');
      ellipse(c, 0, s * 1.5 + s * 0.45 * yawn, s * 0.35, s * 0.25 * yawn, '#E0616C');
    } else { c.lineWidth = Math.max(2, s * 0.26); c.beginPath(); c.arc(0, s * 1.0, s * 0.55, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    c.restore();
  });
}

// ---------------------------------------------------------------- ground and greenery
// the Champ de Mars seen from above-ish: a long lawn with paths and rows of trees, drawn in world space
function efChampDeMars(x, y, w, h) {
  ctx.fillStyle = EF.lawnSh; ctx.fillRect(x - w / 2, y, w, h);
  ctx.fillStyle = EF.path; ctx.fillRect(x - w * 0.5, y, w, h * 0.06);
  for (const s of [-1, 1]) {
    ctx.fillStyle = EF.lawn; ctx.fillRect(x + s * w * 0.06 - (s < 0 ? w * 0.36 : 0), y + h * 0.1, w * 0.36, h * 0.9);
    ctx.fillStyle = EF.path; ctx.fillRect(x + s * w * 0.42 - (s < 0 ? w * 0.08 : 0), y + h * 0.1, w * 0.08, h * 0.9);
  }
}
// a chestnut tree (shapes, lit)
function efTree(c, x, y, s, seed = 1) {
  const rnd = mulberry32(seed);
  rrect(c, x - 9 * s, y - 120 * s, 18 * s, 122 * s, 6 * s); c.fillStyle = '#6A4A33'; c.fill();
  const puffs = [];
  for (let i = 0; i < 7; i++) puffs.push([x + (rnd() - 0.5) * 150 * s, y - 170 * s - rnd() * 110 * s, (48 + rnd() * 34) * s]);
  for (const [px, py, r] of puffs) circle(c, px, py, r, EF.leafSh);
  for (const [px, py, r] of puffs) circle(c, px - r * 0.12, py - r * 0.14, r * 0.8, EF.leaf);
  for (const [px, py, r] of puffs) circle(c, px - r * 0.3, py - r * 0.34, r * 0.34, EF.leafHi);
}
// the Trocadero terrace: pale stone paving falling away to the stone balustrade (rail at y), pigeons on it
function efTerrace(c, x0, x1, railY, t, o = {}) {
  // the balustrade: plinth, balusters, a rail
  const plinthY = railY + 150;
  c.fillStyle = EF.stoneSh; c.fillRect(x0, railY + 14, x1 - x0, 140);
  for (let x = x0 + 10; x < x1; x += 30) {
    c.beginPath(); c.moveTo(x - 9, plinthY - 6); c.quadraticCurveTo(x - 15, railY + 80, x - 6, railY + 30); c.lineTo(x + 6, railY + 30);
    c.quadraticCurveTo(x + 15, railY + 80, x + 9, plinthY - 6); c.closePath(); c.fillStyle = EF.stone; c.fill();
  }
  rrect(c, x0, railY - 4, x1 - x0, 34, 6); c.fillStyle = EF.stone; c.fill();
  c.fillStyle = EF.stoneHi; c.fillRect(x0, railY - 4, x1 - x0, 6);
  rrect(c, x0, plinthY - 8, x1 - x0, 30, 4); c.fillStyle = EF.stone; c.fill();
  // the paving in front
  const g = c.createLinearGradient(0, plinthY, 0, plinthY + 700);
  g.addColorStop(0, '#E6D7B5'); g.addColorStop(1, '#CDBA93');
  c.fillStyle = g; c.fillRect(x0, plinthY + 20, x1 - x0, 900);
  c.strokeStyle = rgba('#B5A27E', 0.7); c.lineWidth = 2; c.beginPath();
  for (let y = plinthY + 60; y < plinthY + 900; y += 70) { c.moveTo(x0, y); c.lineTo(x1, y); }
  c.stroke();
  // pigeons on the rail (one bobs its head)
  for (const [px, flip, sd] of o.pigeons || []) efPigeon(c, px, railY - 6, 1, flip, t, sd);
}
// a grey pigeon, side view, standing at (x, y) (its feet). flip: -1 faces left
function efPigeon(c, x, y, s, flip, t, seed = 1) {
  const bob = Math.max(0, Math.sin(t * loopW(5 + seed) + seed * 3)) ;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s * flip, s);
    line(c, -4, -2, -6, 6, 3, '#E0705A'); line(c, 4, -2, 6, 6, 3, '#E0705A');
    ellipse(c, -2, -20, 26, 17, '#8E97A8');
    c.beginPath(); c.moveTo(-22, -24); c.lineTo(-42, -14); c.lineTo(-20, -12); c.closePath(); c.fillStyle = '#6F778A'; c.fill();
    ellipse(c, -4, -24, 17, 10, '#A7AFBF');
    const hx = 18 + 5 * bob, hy = -38 + 3 * bob;
    ellipse(c, 12 + 3 * bob, -30, 10, 12, '#7DA59A');
    circle(c, hx, hy, 10, '#8E97A8');
    c.beginPath(); c.moveTo(hx + 8, hy - 2); c.lineTo(hx + 17, hy + 2); c.lineTo(hx + 8, hy + 4); c.closePath(); c.fillStyle = '#3A3A44'; c.fill();
    circle(c, hx + 3, hy - 3, 2.6, '#F2A23C'); circle(c, hx + 3.4, hy - 3, 1.3, '#111');
    c.restore();
  });
}
// a Paris street lamp (dark green cast iron, a glass lantern)
function efLamp(c, x, y, s) {
  rrect(c, x - 10 * s, y - 520 * s, 20 * s, 520 * s, 8 * s); c.fillStyle = '#23352E'; c.fill();
  rrect(c, x - 22 * s, y - 40 * s, 44 * s, 40 * s, 8 * s); c.fillStyle = '#23352E'; c.fill();
  c.beginPath(); c.moveTo(x - 26 * s, y - 520 * s); c.lineTo(x + 26 * s, y - 520 * s); c.lineTo(x + 34 * s, y - 600 * s); c.lineTo(x - 34 * s, y - 600 * s); c.closePath();
  c.fillStyle = '#F7EBC8'; c.fill();
  c.beginPath(); c.moveTo(x - 40 * s, y - 600 * s); c.lineTo(x + 40 * s, y - 600 * s); c.lineTo(x, y - 640 * s); c.closePath(); c.fillStyle = '#23352E'; c.fill();
  circle(c, x, y - 648 * s, 8 * s, '#23352E');
}

function efWorldInit() {
  efSkyInit();
  efCityInit();
}
