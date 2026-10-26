// The shore, through time (sharks-older-than-trees, 27 Oct 2026). One stretch of coast seen from the land: the land is a
// wedge on the LEFT that runs off into the distance, the sea fills the right and the far horizon, and a low sun sits over
// the sea on the right (so the key light comes from the right: LIGHTS.sunset). The same place is drawn in four times:
//   today  golden hour, grass, a forest, the big tree he hugs at the water's edge
//   ordo   450 million years ago (the Ordovician): bare rock, tide pools, low moss, a strange purple sky
//   devo   ~390 million years ago (the Devonian): the first trees (fern-like crowns on straight trunks)
//   meso   the dinosaurs' time: a warm sky, the old trees still standing
// A state `S` says how much of each is there, so the rewind can morph one into the other:
//   {pal: palette (shPal(...) blends them), modern: 0..1 the forest of today (it UN-GROWS toward 0), grass: 0..1,
//    moss: 0..1, devo: 0..1 the first trees' growth, rocks: 0..1, sunX, sunH (above the horizon, world units),
//    clouds: cloud drift (world units), hzGlow}
// World units: the hero is 560 tall (1 m ~ 320), his feet on SH.gy. Everything here is drawn every frame with shapes
// (it catches the light), except the sky and the far ridges, which are flat paint.
'use strict';

const SH = { gy: 1560, hz: 900 };
// the shoreline at the hero's depth and beyond: points from the near (bottom) to the far horizon; land is LEFT of it
const SH_COAST = [[1180, 2400], [860, 1940], [700, 1690], [636, 1590], [600, 1520], [560, 1440], [470, 1290], [330, 1130], [120, 1010],
  [-200, 950], [-700, 915], [-1600, 902]];

const SH_PALS = {
  today: { top: '#2E5C9A', mid: '#E7A07A', hz: '#FFD8A2', sea1: '#5E9DB4', sea2: '#1D5674', seaHi: '#FFE2B0',
    land1: '#7DA64C', land2: '#456F2C', sand: '#E2C38C', wet: '#B79A6E', rock: '#8D8478', rockDk: '#5E5750',
    ridge: '#6E7F96', ridge2: '#49607A', sun: '#FFE9B8', cloud: '#FFD2B4', cloudSh: '#C88A92', foam: '#FFF4E2' },
  ordo: { top: '#1F1A44', mid: '#8E527E', hz: '#F49A6E', sea1: '#4FA0A0', sea2: '#14505C', seaHi: '#FFC7A0',
    land1: '#8C7E72', land2: '#5B504B', sand: '#A99482', wet: '#7E6C62', rock: '#9A8C80', rockDk: '#5C5250',
    ridge: '#6E5A72', ridge2: '#4A3E58', sun: '#FFD2A6', cloud: '#E9A2A4', cloudSh: '#7E4E78', foam: '#FFE8DA' },
  devo: { top: '#24466E', mid: '#C48C70', hz: '#F7C48E', sea1: '#4E9C9C', sea2: '#155260', seaHi: '#FFDDB0',
    land1: '#7E875A', land2: '#4D5638', sand: '#B8A486', wet: '#86765E', rock: '#968A7C', rockDk: '#5E564E',
    ridge: '#5E7286', ridge2: '#405268', sun: '#FFE4B4', cloud: '#FBD0B0', cloudSh: '#A8808C', foam: '#FFF0DE' },
  meso: { top: '#3A2F64', mid: '#E2805A', hz: '#FFC27C', sea1: '#5A92AC', sea2: '#1A4466', seaHi: '#FFD8A0',
    land1: '#7E8C48', land2: '#4A5A2A', sand: '#D2B07A', wet: '#9E8460', rock: '#8E8274', rockDk: '#5A524A',
    ridge: '#6E6488', ridge2: '#4C4468', sun: '#FFE0A8', cloud: '#FFC0A0', cloudSh: '#B07888', foam: '#FFF0DC' },
};
// blend palettes: shPal('today') or shPal('today', 'ordo', k)
function shPal(a, b, k = 0) {
  const A = SH_PALS[a], B = SH_PALS[b || a], o = {};
  for (const key of Object.keys(A)) o[key] = mixH(A[key], B[key], clamp(k));
  return o;
}
const shSeaAt = (S, y) => mixH(S.pal.sea1, S.pal.sea2, clamp(inv(SH.hz, SH.gy + 420, y)));

// ---------------------------------------------------------------- seeded layouts (initShore)
let SH_TREES = [], SH_DEVO = [], SH_ROCKS = [], SH_MOSS = [], SH_GRASS = [], SH_WAVES = [], SH_CLOUDS = [], SH_RIDGE = [];
function initShore() {
  const r = mulberry32(4501);
  // today's forest on the land: [x, baseY, height, kind, seed, depth]; drawn far to near (by baseY)
  const T = [];
  for (let i = 0; i < 26; i++) {
    const by = lerp(1000, 1500, Math.pow(r(), 1.3));
    const xr = SH_COAST.length ? shCoastX(by) : 600;
    const x = lerp(-900, xr - 120, r());
    if (x > 200 && x < 800 && by > 1250) continue;              // keep the hero's spot (and the big tree's) clear
    const d = inv(1000, 1500, by);                             // 0 far .. 1 near
    T.push([x, by, lerp(520, 1250, d) * (0.75 + 0.45 * r()), r() < 0.55 ? 'pine' : 'oak', Math.floor(r() * 1e6), d]);
  }
  T.sort((a, b) => a[1] - b[1]);
  SH_TREES = T;
  // the first trees (devo), around his spot: [x, baseY, height, seed, delay 0..1]
  SH_DEVO = [[-120, 1250, 1350, 11, 0.35], [160, 1330, 1650, 12, 0.15], [300, 1500, 1950, 13, 0.0], [520, 1380, 1550, 14, 0.25],
    [-420, 1180, 1150, 15, 0.5], [-640, 1300, 1500, 16, 0.55], [60, 1610, 2100, 17, 0.1], [-260, 1450, 1750, 18, 0.3]]
    .filter((d) => d[0] < shCoastX(d[1]) - 40);
  // rocks / slabs of the bare land
  SH_ROCKS = [];
  for (let i = 0; i < 46; i++) {
    const by = lerp(960, 1900, Math.pow(r(), 0.9)), x = lerp(-1200, shCoastX(by) - 20, r());
    SH_ROCKS.push([x, by, lerp(40, 190, inv(960, 1900, by)) * (0.6 + 0.8 * r()), Math.floor(r() * 1e6)]);
  }
  SH_ROCKS.sort((a, b) => a[1] - b[1]);
  SH_MOSS = [];
  for (let i = 0; i < 70; i++) {
    const by = lerp(980, 1900, Math.pow(r(), 0.8)), x = lerp(-1200, shCoastX(by) - 10, r());
    SH_MOSS.push([x, by, lerp(18, 90, inv(980, 1900, by)) * (0.6 + 0.8 * r()), Math.floor(r() * 1e6)]);
  }
  SH_MOSS.sort((a, b) => a[1] - b[1]);
  SH_GRASS = [];
  for (let i = 0; i < 260; i++) {
    const by = lerp(980, 1950, Math.pow(r(), 0.7)), x = lerp(-1200, shCoastX(by) - 30, r());
    SH_GRASS.push([x, by, lerp(8, 40, inv(980, 1950, by)) * (0.6 + 0.8 * r()), r() * 6.28]);
  }
  SH_WAVES = [];
  for (let i = 0; i < 90; i++) SH_WAVES.push([r() * 3200 - 900, lerp(SH.hz + 6, SH.gy + 420, Math.pow(r(), 1.7)), 0.4 + r(), r() * 6.28]);
  SH_CLOUDS = [];
  for (let i = 0; i < 9; i++) SH_CLOUDS.push([r() * 2600 - 800, 120 + r() * 520, 160 + r() * 260, Math.floor(r() * 1e6)]);
  SH_RIDGE = [];
  for (let i = 0; i <= 60; i++) SH_RIDGE.push([i / 60, 0.5 + 0.5 * Math.sin(i * 0.7 + r()) * (0.6 + 0.4 * r())]);
}
function shCoastX(y) {
  for (let i = 1; i < SH_COAST.length; i++) {
    const a = SH_COAST[i - 1], b = SH_COAST[i];
    if (y <= a[1] && y >= b[1]) return lerp(a[0], b[0], inv(a[1], b[1], y));
  }
  return y > SH_COAST[0][1] ? SH_COAST[0][0] : SH_COAST[SH_COAST.length - 1][0];
}

// ---------------------------------------------------------------- far things sit on the horizon, with a small parallax
// a far point (x, h above the horizon) on screen, for a layer of parallax p (0 = fixed, 1 = the main plane)
function shFar(cam, x, h, p) {
  const hz = toScreen(cam, cam.x, SH.hz)[1], zf = 1 + (cam.zoom - 1) * p * 0.6;
  return [540 + (x - 540 - (cam.x - 540) * p) * zf, hz - h * zf, zf];
}

function shSky(cam, t, S) {
  screenSpace();
  const hz = toScreen(cam, cam.x, SH.hz)[1];
  const g = ctx.createLinearGradient(0, Math.min(hz - 1500, -200), 0, hz + 4);
  g.addColorStop(0, S.pal.top); g.addColorStop(0.62, S.pal.mid); g.addColorStop(1, S.pal.hz);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the sun over the sea, low on the right (its glow is light: the glow layer)
  const [sx, sy, zf] = shFar(cam, S.sunX === undefined ? 980 : S.sunX, S.sunH === undefined ? 150 : S.sunH, 0.18);
  const R = 74 * zf;
  softDot(ctx, sx, sy, R * 4.2, S.pal.hz, 0.42);
  softDot(gctx, sx, sy, R * 1.7, S.pal.sun, 0.75 * (S.sunA === undefined ? 1 : S.sunA));   // screenSpace(): gctx is already at half scale
  circle(ctx, sx, sy, R, S.pal.sun);
  circle(gctx, sx, sy, R, S.pal.sun);
  // clouds (flat paint, drifting; `clouds` shifts them, the rewind sends them racing back)
  for (const [x0, h, w, seed] of SH_CLOUDS) {
    const rr = mulberry32(seed);
    const [cx, cy, z] = shFar(cam, ((x0 + (S.clouds || 0) + 2400) % 3200) - 1100, 900 - h, 0.12);
    const ww = w * z;
    for (let k = 0; k < 9; k++) {   // a cloud: soft puffs, a shaded underside, a lit top
      const dx = (rr() - 0.5) * ww * 1.5, dy = (rr() - 0.5) * ww * 0.2, rx = ww * (0.2 + 0.22 * rr());
      softDot(ctx, cx + dx, cy + dy + rx * 0.22, rx * 1.15, S.pal.cloudSh, 0.42);
      softDot(ctx, cx + dx - rx * 0.12, cy + dy - rx * 0.08, rx, S.pal.cloud, 0.55);
    }
  }
  // far ridges on the horizon, left (over the land) and a low headland far right
  for (const [p, col, hMax, x0, x1, seed] of [[0.1, S.pal.ridge, 210, -1800, 700, 1], [0.2, S.pal.ridge2, 130, -1600, 420, 2]]) {
    ctx.beginPath();
    const a = shFar(cam, x0, 0, p); ctx.moveTo(a[0], a[1] + 4);
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, hh = hMax * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(u * 17 + seed * 3) * Math.cos(u * 7.3 + seed))) * (1 - 0.7 * Math.pow(u, 3));
      const q = shFar(cam, lerp(x0, x1, u), hh, p); ctx.lineTo(q[0], q[1]);
    }
    const b = shFar(cam, x1, 0, p); ctx.lineTo(b[0], b[1] + 4); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  }
  return { hz, sun: [sx, sy, R] };
}

// the sea: one plane from the horizon down, glitter on the sun's path, slow wave lines (world coords: apply the camera)
function shSea(cam, t, S, sun) {
  applyCam(cam);
  const g = ctx.createLinearGradient(0, SH.hz, 0, SH.gy + 420);
  g.addColorStop(0, S.pal.sea1); g.addColorStop(1, S.pal.sea2);
  ctx.fillStyle = g; ctx.fillRect(-3000, SH.hz, 7000, 3000);
  // the haze line at the horizon
  const h2 = ctx.createLinearGradient(0, SH.hz - 2, 0, SH.hz + 60);
  h2.addColorStop(0, rgba(S.pal.hz, 0.85)); h2.addColorStop(1, rgba(S.pal.hz, 0));
  ctx.fillStyle = h2; ctx.fillRect(-3000, SH.hz - 2, 7000, 62);
  paint(() => shWaveLines(cam, t, S, sun, SH.hz, 99999));
}
// the wave lines and the glitter, between rows y0..y1 (the water patch in front of a shark redraws its own rows)
function shWaveLines(cam, t, S, sun, y0, y1, xs, c = ctx) {
  const sunWx = cam.x + (sun[0] - 540) / cam.zoom;
  for (const [x, y, w, ph] of SH_WAVES) {
    if (y < y0 || y > y1) continue;
    const d = inv(SH.hz, SH.gy + 420, y), L = lerp(20, 120, d) * w, xx = x + 18 * Math.sin(t * 0.9 + ph);
    if (xs && (xx < xs[0] || xx > xs[1])) continue;
    if (xx - L / 2 < shCoastX(y) + 30) continue;                 // only on the water (the glints are light: they would shine through the land)
    const near = Math.exp(-Math.pow((xx - sunWx) / lerp(160, 520, d), 2));
    const a = 0.16 + 0.55 * near;
    line(c, xx - L / 2, y, xx + L / 2, y, lerp(1.5, 5, d), rgba(near > 0.3 ? S.pal.seaHi : '#FFFFFF', a * (0.6 + 0.4 * Math.sin(t * 2.1 + ph * 3))));
    if (near > 0.25) {
      softDot(gctx, xx, y, lerp(6, 16, d), S.pal.seaHi, 0.5 * near * (0.5 + 0.5 * Math.sin(t * 5 + ph * 7)));   // gctx carries the camera too
    }
  }
}

// the land: the wedge left of the coastline, grass (today) or bare rock (ordo), the wet edge and the foam
function shLand(cam, t, S) {
  applyCam(cam);
  const coast = SH_COAST;
  // wet sand / foam along the coast
  ctx.beginPath(); ctx.moveTo(-3000, 2400);
  for (const [x, y] of coast) ctx.lineTo(x + lerp(6, 50, inv(SH.hz, 2000, y)), y);
  ctx.lineTo(-3000, SH.hz + 2); ctx.closePath();
  ctx.fillStyle = S.pal.wet; ctx.fill();
  const g = ctx.createLinearGradient(0, SH.hz, 0, 2000);
  g.addColorStop(0, mixH(S.pal.land2, S.pal.hz, 0.25)); g.addColorStop(0.35, S.pal.land1); g.addColorStop(1, S.pal.land2);
  ctx.beginPath(); ctx.moveTo(-3000, 2400);
  for (const [x, y] of coast) ctx.lineTo(x, y);
  ctx.lineTo(-3000, SH.hz + 2); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  // the beach strip along the coast (sand today, grey grit 450 Ma ago)
  ctx.beginPath();
  for (let i = 0; i < coast.length; i++) { const [x, y] = coast[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  for (let i = coast.length - 1; i >= 0; i--) { const [x, y] = coast[i], w = lerp(6, 120, inv(SH.hz, 2000, y)); ctx.lineTo(x - w, y + w * 0.12); }
  ctx.closePath(); ctx.fillStyle = S.pal.sand; ctx.fill();
  // foam that breathes along the edge
  const fk = 0.5 + 0.5 * Math.sin(t * 1.6);
  paint(() => {
    for (let i = 1; i < coast.length; i++) {
      const [x0, y0] = coast[i - 1], [x1, y1] = coast[i], d = inv(SH.hz, 2000, y0);
      line(ctx, x0 + 10 + 18 * d * fk, y0, x1 + 10 + 18 * d * fk, y1, lerp(1.5, 7, d), rgba(S.pal.foam, 0.75));
    }
  });
  // the ground's texture: grass tufts fading out as the grass goes, rock slabs and moss coming in
  const grass = S.grass === undefined ? 1 : S.grass, rocks = S.rocks || 0, moss = S.moss || 0;
  for (const [x, y, s, seed] of SH_ROCKS) {
    const k = clamp(rocks * 1.4 - 0.4 * hash(seed));
    if (k <= 0.02) continue;
    shRock(ctx, x, y, s * (0.4 + 0.6 * k), seed, S.pal);
  }
  for (const [x, y, s, seed] of SH_MOSS) {
    const k = clamp(moss * 1.5 - 0.5 * hash(seed + 3));
    if (k <= 0.02) continue;
    shMossPatch(ctx, x, y, s * k, seed);
  }
  if (grass > 0.02) {
    for (const [x, y, s, ph] of SH_GRASS) {
      const hgt = s * grass * (0.8 + 0.2 * Math.sin(t * 1.3 + ph));
      if (hgt < 3) continue;
      const lean = 0.25 * Math.sin(t * 1.1 + ph);
      for (let k = -1; k <= 1; k++) line(ctx, x + k * s * 0.25, y, x + k * s * 0.4 + lean * hgt, y - hgt * (1 - 0.2 * Math.abs(k)), Math.max(1.5, s * 0.12), k ? S.pal.land2 : mixH(S.pal.land1, '#C8E080', 0.25));
    }
  }
}
function shRock(c, x, y, s, seed, pal) {
  const r = mulberry32(seed), n = 7, pts = [];
  for (let i = 0; i < n; i++) { const a = Math.PI + (i / (n - 1)) * Math.PI; pts.push([x + Math.cos(a) * s * (0.8 + 0.3 * r()), y + Math.sin(a) * s * 0.45 * (0.7 + 0.5 * r())]); }
  c.beginPath(); c.moveTo(x - s * 0.95, y + s * 0.06);
  for (const p of pts) c.lineTo(p[0], p[1]);
  c.lineTo(x + s * 0.95, y + s * 0.06); c.closePath();
  c.fillStyle = mixH(pal.rock, pal.rockDk, 0.25 * r()); c.fill();
  paint(() => {
    line(c, x - s * 0.5, y - s * 0.18, x + s * 0.1, y - s * 0.3, Math.max(1.2, s * 0.03), rgba(pal.rockDk, 0.7));
    line(c, x + s * 0.1, y - s * 0.3, x + s * 0.3, y - s * 0.08, Math.max(1.2, s * 0.03), rgba(pal.rockDk, 0.7));
  });
}
// a mat of moss and liverwort: low green humps with a lighter top (450 million years ago this was the tallest life on land)
function shMossPatch(c, x, y, s, seed) {
  if (s < 2) return;
  const r = mulberry32(seed), n = 4 + Math.floor(r() * 3);
  // low green cushions: domes that hug the rock, darker underneath, a fuzz of light tips on top
  for (let k = 0; k < n; k++) {
    const dx = (k - (n - 1) / 2) * s * 0.42 + (r() - 0.5) * s * 0.2, rx = s * (0.26 + 0.16 * r()), ry = rx * (0.55 + 0.25 * r());
    c.beginPath(); c.ellipse(x + dx, y, rx, ry, 0, Math.PI, Math.PI * 2); c.closePath();
    c.fillStyle = k % 2 ? '#3F7A35' : '#4A8A3C'; c.fill();
  }
  paint(() => {
    for (let k = 0; k < n * 3; k++) {
      const dx = (r() - 0.5) * s * 1.5, hh = s * (0.25 + 0.3 * r());
      if (Math.abs(dx) > s * 0.8) continue;
      circle(c, x + dx, y - hh * Math.sqrt(Math.max(0, 1 - Math.pow(dx / (s * 0.85), 2))), Math.max(1, s * 0.05), '#8CC45E');
    }
  });
}
// ---------------------------------------------------------------- trees of today (they un-grow in the rewind)
// g 0..1: the tree's growth; it shrinks toward its base (a rewind of its growing), a sapling at the end
function shTree(c, x, by, h, kind, seed, g, pal, t) {
  if (g <= 0.01) return;
  const r = mulberry32(seed), hh = h * g, ww = h * 0.05 * (0.35 + 0.65 * g);
  const sway = 0.012 * Math.sin(t * 0.9 + seed) * hh;
  const trunk = mixH('#5B3D2A', pal.land2, 0.2);
  c.beginPath(); c.moveTo(x - ww, by); c.lineTo(x - ww * 0.45 + sway * 0.6, by - hh * 0.8); c.lineTo(x + ww * 0.45 + sway * 0.6, by - hh * 0.8); c.lineTo(x + ww, by); c.closePath();
  c.fillStyle = trunk; c.fill();
  if (kind === 'pine') {
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const u = i / tiers, yb = by - hh * (0.22 + 0.68 * u), wb = hh * 0.26 * (1 - 0.72 * u), yt = yb - hh * 0.26;
      c.beginPath(); c.moveTo(x - wb + sway * u, yb); c.lineTo(x + sway * (u + 0.2), yt); c.lineTo(x + wb + sway * u, yb);
      c.quadraticCurveTo(x + sway * u, yb + hh * 0.04, x - wb + sway * u, yb); c.closePath();
      c.fillStyle = i % 2 ? '#2F5C36' : '#356A3C'; c.fill();
    }
  } else {
    for (let k = 0; k < 6; k++) {
      const a = r() * 6.28, d = r() * 0.5, R = hh * (0.17 + 0.08 * r());
      ellipse(c, x + Math.cos(a) * hh * 0.16 * d + sway, by - hh * (0.72 + 0.12 * Math.sin(a) * d), R, R * 0.86, k % 2 ? '#4C7F34' : '#5A9038');
    }
  }
}
function shForest(cam, t, S, near) {
  applyCam(cam);
  const m = S.modern === undefined ? 1 : S.modern;
  if (m <= 0.01) return;
  for (const [x, by, h, kind, seed, d] of SH_TREES) {
    if (near !== undefined && (d > 0.75) !== near) continue;
    // the rewind: each tree un-grows at its own moment (far ones first), so the forest drains away
    const g = clamp((m - 0.55 * (1 - d) * hash(seed) - 0.0) / 0.45);
    shTree(ctx, x, by, h, kind, seed, E.inOutSine(g), S.pal, t);
  }
}

// ---------------------------------------------------------------- the big tree he hugs (today), at the water's edge
const BIG = { x: 560, by: 1556, w: 112, h: 1260 };
// its trunk in world units; g = growth (1 today; the rewind un-grows it out of his arms). Returns its top.
function bigTrunk(c, g, t, pal, o = {}) {
  if (g <= 0.005) return null;
  const x = BIG.x, by = BIG.by, h = BIG.h * g, w = BIG.w * (0.3 + 0.7 * Math.pow(g, 0.6));
  const sway = 3 * Math.sin(t * 0.8) * g;
  // roots flaring into the ground and the water
  c.beginPath();
  c.moveTo(x - w * 1.25, by + 8); c.quadraticCurveTo(x - w * 0.6, by - 30 * g, x - w * 0.5, by - 120 * g);
  c.lineTo(x - w * 0.42 + sway, by - h); c.lineTo(x + w * 0.42 + sway, by - h);
  c.lineTo(x + w * 0.5, by - 120 * g); c.quadraticCurveTo(x + w * 0.62, by - 28 * g, x + w * 1.35, by + 10); c.closePath();
  c.fillStyle = o.col || '#7A5236'; c.fill();
  // bark: a few broad, broken grooves and plates, a knot hole (paint: no edge of their own)
  paint(() => {
    const r = mulberry32(77);
    for (let i = 0; i < 6; i++) {
      const u = -0.34 + 0.68 * (i / 5) + 0.05 * (r() - 0.5);
      let y = by - 30 * g;
      while (y > by - h * 0.96) {
        const seg = (60 + 120 * r()) * g, y1 = Math.max(by - h * 0.96, y - seg);
        const xx0 = x + u * w * (1 - 0.18 * (by - y) / Math.max(1, h)) + sway * ((by - y) / Math.max(1, h));
        const xx1 = x + u * w * (1 - 0.18 * (by - y1) / Math.max(1, h)) + sway * ((by - y1) / Math.max(1, h)) + (r() - 0.5) * 8 * g;
        line(c, xx0, y, xx1, y1, Math.max(2, (5 + 4 * r()) * g), 'rgba(66,40,26,0.8)');
        y = y1 - (20 + 50 * r()) * g;
      }
    }
    for (let i = 0; i < 7; i++) {   // lighter plates catching the light
      const u = -0.3 + 0.6 * r(), yy = by - h * (0.08 + 0.85 * r()), ww = (12 + 14 * r()) * g;
      line(c, x + u * w + sway * (by - yy) / Math.max(1, h), yy, x + u * w + sway * (by - yy) / Math.max(1, h), yy - (30 + 40 * r()) * g, ww, 'rgba(150,108,74,0.18)');
    }
    ellipse(c, x - w * 0.12 + sway * 0.62, by - h * 0.62, 12 * g, 18 * g, 'rgba(60,36,24,0.95)');
    ellipse(c, x - w * 0.12 + sway * 0.62, by - h * 0.62 + 3 * g, 7 * g, 11 * g, 'rgba(26,14,10,0.95)');
  });
  return [x + sway, by - h, w];
}
// its crown (above his head: in the set, behind him)
function bigCrown(c, g, t, pal) {
  if (g <= 0.05) return;
  const x = BIG.x + 3 * Math.sin(t * 0.8) * g, top = BIG.by - BIG.h * g, R = 520 * Math.pow(g, 1.2);
  const r = mulberry32(912);
  for (let k = 0; k < 16; k++) {
    const a = r() * 6.28, d = Math.sqrt(r()), rr = R * (0.32 + 0.22 * r());
    ellipse(c, x + Math.cos(a) * R * 0.7 * d, top - R * 0.15 + Math.sin(a) * R * 0.42 * d, rr, rr * 0.8, k % 3 === 0 ? '#3F7530' : k % 3 === 1 ? '#4E8A37' : '#5C9A3E');
  }
  // the limbs that carry it
  for (const [dx, dy] of [[-260, -140], [240, -170], [-60, -260]]) line(c, x, top + 60 * g, x + dx * g, top + dy * g, 34 * g, '#5E3E2A');
}

// ---------------------------------------------------------------- the first trees (Devonian: Wattieza / Archaeopteris-like)
// A straight, slightly bowed trunk patterned with old frond scars, and a crown of big feathery fronds that unroll from
// fiddleheads. g: growth 0..1 (the trunk shoots up first, then the fronds unroll at the top).
function shFirstTree(c, x, by, h, seed, g, t, pal) {
  if (g <= 0.005) return null;
  const r = mulberry32(seed);
  const gt = E.outCubic(clamp(g / 0.7)), gf = E.outCubic(clamp((g - 0.42) / 0.58));
  const hh = h * gt, w = h * 0.03 * (0.45 + 0.55 * gt), bow = (r() - 0.5) * 0.06 * hh, sway = 0.006 * hh * Math.sin(t * 0.8 + seed);
  const at = (u) => [x + bow * Math.sin(Math.PI * u) + sway * u * u, by - hh * u];
  // trunk: a bowed column, wider at the foot
  c.beginPath();
  for (let i = 0; i <= 12; i++) { const u = i / 12, p = at(u); c.lineTo(p[0] - w * (1.3 - 0.6 * u), p[1]); }
  for (let i = 12; i >= 0; i--) { const u = i / 12, p = at(u); c.lineTo(p[0] + w * (1.3 - 0.6 * u), p[1]); }
  c.closePath(); c.fillStyle = '#6E5638'; c.fill();
  // old frond scars in a diamond lattice (paint)
  paint(() => {
    for (let i = 1; i < 16; i++) {
      const u = i / 16, p = at(u), ww = w * (1.3 - 0.6 * u);
      for (const k of [-0.5, 0, 0.5]) {
        const cx = p[0] + k * ww * 1.1 + (i % 2 ? ww * 0.28 : 0), cy = p[1];
        if (Math.abs(cx - p[0]) > ww * 0.95) continue;
        c.beginPath(); c.moveTo(cx, cy - ww * 0.32); c.lineTo(cx + ww * 0.2, cy); c.lineTo(cx, cy + ww * 0.32); c.lineTo(cx - ww * 0.2, cy); c.closePath();
        c.fillStyle = 'rgba(52,38,24,0.55)'; c.fill();
      }
    }
  });
  // the crown: fronds from the top; each unrolls from a tight curl (gf 0) to a long, drooping, feathery arc (gf 1)
  const n = 12, top = at(1);
  const fronds = [];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, j = Math.floor(i / 2);
    const a0 = -Math.PI / 2 + side * (0.12 + 0.3 * j) + 0.1 * (r() - 0.5);
    const L = h * (0.26 + 0.08 * r()) * (0.2 + 0.8 * gf);
    const curl = (1 - gf) * 9.5, droop = gf * (0.8 + 0.25 * j) * side;
    const pts = []; let ang = a0, p = top.slice(); const N = 22;
    for (let k = 0; k <= N; k++) {
      pts.push(p.slice());
      const u = k / N;
      ang += (droop * 0.1 + side * curl * u * u * 0.8) / N * 6 + 0.015 * Math.sin(t * 1.3 + i + u * 3);
      p = [p[0] + Math.cos(ang) * L / N, p[1] + Math.sin(ang) * L / N];
    }
    fronds.push([pts, side, L]);
  }
  for (const [pts] of fronds) poly(c, pts, Math.max(2.5, w * 0.34), '#3F6E30');
  paint(() => {
    for (const [pts, side, L] of fronds) {
      for (let k = 2; k < pts.length - 1; k++) {
        const [px, py] = pts[k], [qx, qy] = pts[k + 1], dx = qx - px, dy = qy - py, Lq = Math.hypot(dx, dy) || 1;
        const nx = -dy / Lq, ny = dx / Lq, u = k / pts.length, ll = L * 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (0.25 + 0.75 * gf);
        for (const sd of [1, -1]) {
          const ex = px + nx * ll * sd + dx * 1.4, ey = py + ny * ll * sd + dy * 1.4 + ll * 0.25;
          c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo((px + ex) / 2 + nx * sd * ll * 0.15, (py + ey) / 2 + ny * sd * ll * 0.15, ex, ey);
          c.lineWidth = Math.max(2, ll * 0.22); c.strokeStyle = sd > 0 ? '#62A847' : '#529A3E'; c.lineCap = 'round'; c.stroke();
        }
      }
    }
  });
  return top;
}
function shFirstForest(cam, t, S, near) {
  applyCam(cam);
  const g0 = S.devo || 0;
  if (g0 <= 0.001) return;
  for (const [x, by, h, seed, delay] of SH_DEVO) {
    if (near !== undefined && (by > 1520) !== near) continue;
    const g = clamp((g0 - delay * 0.45) / 0.55);
    shFirstTree(ctx, x, by, h, seed, g, t, S.pal);
  }
}

// a spray of grit and moss bits where something lands (world units)
function shDust(c, x, y, k, s = 1, col = '#C9B8A6', seed = 3) {
  if (k <= 0 || k >= 1) return;
  const r = mulberry32(seed);
  for (let i = 0; i < 14; i++) {
    const a = Math.PI + r() * Math.PI, v = (60 + 140 * r()) * s, d = E.outCubic(k);
    const px = x + Math.cos(a) * v * d * 1.4, py = y + Math.sin(a) * v * d * 0.6 + 120 * s * k * k;
    ellipse(c, px, py, (10 + 16 * r()) * s * (1 - k * 0.6), (7 + 9 * r()) * s * (1 - k * 0.6), rgba(col, 0.75 * (1 - k)));
  }
}
