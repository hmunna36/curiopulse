// Earth Has More TREES Than Our Galaxy Has STARS 🌲 — the forest world.
// One 3D world seen through a pinhole camera (metres; X right, Y up, Z away from the camera): a bald hilltop at (0, 0) where
// he sits, a valley of pines below it, forested ridges to the horizon, all drawn back to front: the terrain as silhouette
// slices (the far ones carry a saw-tooth of pine tops: forest to the horizon), real pines near the hill (each can wear a
// star on its tip and do the wave), the night sky as a plate painted once (a Milky Way band, a crescent moon) with bright
// stars drawn every frame (they twinkle, and in "give" they fall onto the trees). The same world by day for the plot
// where he counts trunks. Props: the tally counter, the stadium scoreboard, the sapling, the plot's rope and flags.
'use strict';

const TVW = { F: 1300, PATCH_X: 120, PATCH_Z: 170, NEAR_Z: 170, RIG_PER_M: 320 };
const TV_PLOT = { x: -46, z: 104 };                      // the plot he counts, by day
let TV_SKY = null, TV_SKY_HP = 2000, TV_BRIGHT = [], TV_TREES = [], TV_SLICES = [], TV_DAYSKY = null;

// ---------------------------------------------------------------- the ground (metres)
function tvH(x, z) {
  const knob = 9 * Math.exp(-(x * x + z * z) / (2 * 15 * 15));
  const valley = -24 * smooth(clamp((z - 6) / 190));
  const ridge = (58 + 70 * (0.5 + 0.5 * Math.sin(x * 0.0031 + 1.3)) + 24 * Math.sin(x * 0.0113 + 0.4)) * smooth(clamp((z - 230) / 1100));
  const roll = 2.6 * Math.sin(x * 0.043 + 0.7) * Math.sin(z * 0.036 + 1.1) * clamp((z - 24) / 60);
  return knob + valley + ridge + roll;
}
// the pinhole camera: C = {x, y, z, pitch (+ looks down), f, cx, cy}
function tvCam(o) { return Object.assign({ f: TVW.F, cx: 540, cy: 960, pitch: 0 }, o); }
function tvProj(C, X, Y, Z) {
  const px = X - C.x, py = Y - C.y, pz = Z - C.z, cp = Math.cos(C.pitch), sp = Math.sin(C.pitch);
  const d = pz * cp - py * sp;
  if (d < 0.08) return null;
  const u = py * cp + pz * sp, s = C.f / d;
  return [C.cx + px * s, C.cy - u * s, s, d];
}
function tvHorizonY(C) { return C.cy - C.f * Math.tan(C.pitch); }
// a camera between keys [t, x, y, z, pitch]; y is height ABOVE THE GROUND under it when `ground` is set
function tvKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return tvCam({ x: k[1], y: k[2], z: k[3], pitch: k[4] });
}

// ---------------------------------------------------------------- painted once
function initTvWorld() {
  // ---- the night sky: a plate whose row TV_SKY_HP is the horizon (stars sit at infinity: only the pitch moves them)
  {
    const PW = W + 400, PH = TV_SKY_HP + 260, c = mkCanvas(PW, PH), x = c.getContext('2d'), HP = TV_SKY_HP;
    const g = x.createLinearGradient(0, 0, 0, PH);
    g.addColorStop(0, '#02030B'); g.addColorStop(0.42, '#050A1E'); g.addColorStop(0.74, '#0B1A3A'); g.addColorStop(HP / PH - 0.02, '#1A3156');
    g.addColorStop(HP / PH, '#22385A'); g.addColorStop(1, '#0D1A2C');
    x.fillStyle = g; x.fillRect(0, 0, PW, PH);
    const rng = mulberry32(4401);
    // faint colour in the sky
    for (const [nx, ny, nr, col, a] of [[260, 700, 560, '#2C2470', 0.32], [900, 300, 620, '#163A6E', 0.3], [640, 1300, 700, '#24305E', 0.28]]) {
      const gg = x.createRadialGradient(nx, ny, 0, nx, ny, nr); gg.addColorStop(0, rgba(col, a)); gg.addColorStop(1, rgba(col, 0));
      x.fillStyle = gg; x.fillRect(0, 0, PW, PH);
    }
    // the Milky Way: a band from the lower left up to the upper right
    const A = [-60, HP - 120], B = [PW + 60, 80], L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, nx = -uy, ny = ux;
    for (let i = 0; i < 260; i++) {
      const s = rng() * L, off = (rng() + rng() + rng() - 1.5) * 150, px = A[0] + ux * s + nx * off, py = A[1] + uy * s + ny * off;
      const r = 40 + rng() * 140, warm = rng() < 0.45;
      const gg = x.createRadialGradient(px, py, 0, px, py, r);
      gg.addColorStop(0, warm ? 'rgba(255,214,170,0.10)' : 'rgba(170,196,255,0.10)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gg; x.fillRect(px - r, py - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 9000; i++) {
      const s = rng() * L, off = (rng() + rng() + rng() + rng() - 2) * 120, px = A[0] + ux * s + nx * off, py = A[1] + uy * s + ny * off;
      const r = 0.45 + Math.pow(rng(), 4) * 1.4;
      x.fillStyle = `rgba(${225 + 30 * rng() | 0},${222 + 30 * rng() | 0},255,${0.25 + 0.55 * rng()})`;
      x.fillRect(px, py, r * 1.6, r * 1.6);
    }
    // the dark lane down its middle
    for (let i = 0; i < 120; i++) {
      const s = rng() * L, off = (rng() - 0.5) * 50 + 14 * Math.sin(s * 0.006), px = A[0] + ux * s + nx * off, py = A[1] + uy * s + ny * off;
      const r = 26 + rng() * 60, gg = x.createRadialGradient(px, py, 0, px, py, r);
      gg.addColorStop(0, 'rgba(4,6,16,0.34)'); gg.addColorStop(1, 'rgba(4,6,16,0)');
      x.fillStyle = gg; x.fillRect(px - r, py - r, 2 * r, 2 * r);
    }
    // stars everywhere
    for (let i = 0; i < 2600; i++) {
      const px = rng() * PW, py = rng() * (HP - 30), r = 0.5 + Math.pow(rng(), 3) * 1.9, tint = rng();
      x.fillStyle = tint < 0.14 ? `rgba(255,222,190,${0.35 + 0.6 * rng()})` : tint < 0.3 ? `rgba(190,215,255,${0.35 + 0.6 * rng()})` : `rgba(240,244,255,${0.25 + 0.6 * rng()})`;
      x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }
    // the haze over the horizon
    const hz = x.createLinearGradient(0, HP - 300, 0, HP + 40);
    hz.addColorStop(0, 'rgba(60,96,140,0)'); hz.addColorStop(1, 'rgba(60,96,140,0.42)');
    x.fillStyle = hz; x.fillRect(0, HP - 300, PW, 340);
    TV_SKY = c;
    // the bright ones, drawn every frame (they twinkle, and they fall): plate coordinates, kept off the band's very centre
    const r2 = mulberry32(77);
    TV_BRIGHT = [...Array(170)].map((_, i) => {
      const px = 40 + r2() * (PW - 80), py = 60 + Math.pow(r2(), 0.8) * (HP - 260);
      return { px, py, r: 1.6 + Math.pow(r2(), 2) * 2.6, ph: r2() * 6.28, w: 0.6 + r2() * 1.6, warm: r2() < 0.25, i };
    });
  }
  // ---- the pines near the hill (the rest of the forest is in the slices' saw-tooth)
  {
    const rng = mulberry32(2026);
    const out = [];
    for (let z = 9; z < TVW.NEAR_Z; z += 4.6) {
      const sp = 5.2 + z * 0.012;
      for (let xx = -280; xx < 280; xx += sp) {
        const x = xx + (rng() - 0.5) * sp * 0.9, zz = z + (rng() - 0.5) * 4.2;
        const rr = Math.hypot(x, zz);
        if (rr < 17 + 6 * rng()) continue;                 // the bald top of the hill
        if (Math.hypot(x - TV_PLOT.x, zz - TV_PLOT.z) < 8) continue;   // the plot's clearing (its own trees are placed by hand)
        out.push({ x, z: zz, y: tvH(x, zz), h: 9 + rng() * 9 + (rr < 26 ? -3 : 0), w: 0.36 + rng() * 0.1, seed: rng() * 1000,
          tone: rng(), patch: Math.pow(x / TVW.PATCH_X, 2) + Math.pow(zz / TVW.PATCH_Z, 2) < 1 - 0.18 * Math.sin(Math.atan2(zz, x) * 5 + 1) * rng() });
      }
    }
    // a few on the hill's shoulders, close to him
    for (const [x, z, h] of [[-15.5, 5, 7.5], [17, 9, 8.2], [-21, 15, 9.5], [22.5, 2, 6.8], [-9, 21, 10]]) {
      out.push({ x, z, y: tvH(x, z), h, w: 0.4, seed: x * 7 + z, tone: 0.5, patch: true });
    }
    out.sort((a, b) => b.z - a.z);
    out.forEach((tr, i) => { tr.i = i; });
    TV_TREES = out;
  }
  TV_SLICES = [3600, 3000, 2500, 2100, 1750, 1450, 1200, 1000, 840, 700, 590, 500, 425, 362, 310, 266, 228, 196, 168, 146, 126, 108, 92, 78,
    66, 55, 46, 38, 31, 25, 20, 15.5, 11.5, 8, 5, 2.5, 0, -1.6, -3.2, -5];
}

// ---------------------------------------------------------------- palettes
const TV_NIGHT = { lit: '#5E9E92', ground: '#123426', groundFar: '#24425A', hill: '#1C4632', crown: ['#15503F', '#1A5C49', '#114437'], trunk: '#33251C',
  haze: '#2A4868', fog: [52, 84, 120], far: 2600 };
const TV_DAY = { lit: '#8FD07A', ground: '#3E6A2E', groundFar: '#9BC2D2', hill: '#4C7A33', crown: ['#2C6E3E', '#357C45', '#265F37'], trunk: '#5A3E2A',
  haze: '#A9CFE0', fog: [170, 205, 222], far: 2200 };
function tvFogK(d, P) { return clamp(Math.pow(d / P.far, 0.62)); }

// ---------------------------------------------------------------- the sky
function tvSky(C, t, o = {}) {
  screenSpace();
  const hy = tvHorizonY(C), y0 = hy - TV_SKY_HP, x0 = -200 - (C.yawPx || 0);
  ctx.drawImage(TV_SKY, x0, y0);
  if (hy + 240 < H) { ctx.fillStyle = '#0D1A2C'; ctx.fillRect(0, hy + 240, W, H - hy - 240); }
  // the crescent moon, upper left (the key light)
  const mx = x0 + 330, my = y0 + TV_SKY_HP - 1180;
  if (my > -120 && my < H + 120) {
    softDot(gctx, mx, my, 150, '#BFD8FF', 0.4);
    paint(() => {
      ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 38, 0, 7); ctx.fillStyle = '#F2F6FF'; ctx.fill();
      ctx.globalCompositeOperation = 'source-atop'; ctx.beginPath(); ctx.arc(mx + 17, my - 9, 36, 0, 7); ctx.fillStyle = '#0A1430'; ctx.fill(); ctx.restore();
    });
  }
  // the bright stars: twinkling (whole turns in the Short, for the loop); o.flare 0..1 flares them all; o.gone(i) -> 0..1 how far
  // it has left the sky (the falling stars draw themselves)
  const fl = o.flare || 0;
  paint(() => {
    for (const s of TV_BRIGHT) {
      if (o.gone && o.gone(s.i) > 0) continue;
      const sx = x0 + s.px, sy = y0 + s.py;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > hy - 30) continue;
      const tw = 0.62 + 0.38 * Math.sin(t * loopW(s.w * 2.2) + s.ph), r = s.r * (0.85 + 0.3 * tw) * (1 + 1.2 * fl);
      const col = s.warm ? '#FFE2BC' : '#EAF1FF';
      softDot(gctx, sx, sy, r * 5.5, col, (0.35 + 0.65 * fl) * tw);
      circle(ctx, sx, sy, r, col);
      if (fl > 0.05 || r > 3.1) tvSpikes(ctx, sx, sy, r * (2.4 + 4 * fl), col, 0.5 * tw + 0.5 * fl);
    }
  });
}
function tvBrightXY(C, s) { const hy = tvHorizonY(C); return [-200 - (C.yawPx || 0) + s.px, hy - TV_SKY_HP + s.py]; }
function tvSpikes(c, x, y, r, col, a) {
  c.save(); c.globalAlpha = clamp(a); c.strokeStyle = col; c.lineCap = 'round';
  c.lineWidth = Math.max(1, r * 0.08);
  c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke(); c.restore();
}
// a five-point star (screen units)
function tvStarPath(c, x, y, r, rot = 0) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + rot + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}
function tvTopper(x, y, r, k, t, seed = 0) {
  if (k <= 0.01 || r < 0.6) return;
  const rr = r * k, tw = 0.8 + 0.2 * Math.sin(t * loopW(3) + seed);
  softDot(gctx, x, y, rr * 2.4, '#FFD86A', (rr < 2.2 ? 0.26 : 0.17) * tw);
  if (rr < 2.2) { circle(ctx, x, y, Math.max(1.1, rr), '#FFF1B8'); return; }
  paint(() => {
    tvStarPath(ctx, x, y, rr, 0.06 * Math.sin(t * 2 + seed)); ctx.fillStyle = '#FFD447'; ctx.fill();
    tvStarPath(ctx, x, y - rr * 0.06, rr * 0.55); ctx.fillStyle = '#FFF4C2'; ctx.fill();
  });
}

// ---------------------------------------------------------------- a pine (screen units): base (x, y), height hp px
// o: {w (width / height), col, trunkK (how much bare trunk shows), sway px at the tip, hop px, squash}
function tvPine(c, x, y, hp, o) {
  const w = hp * (o.w || 0.4), col = o.col, sway = o.sway || 0, hop = o.hop || 0;
  y -= hop;
  if (hp < 5) { c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + sway, y - hp); c.lineTo(x + w / 2, y); c.fill(); return; }
  const tk = o.trunkK === undefined ? 0.16 : o.trunkK, sq = 1 + (o.squash || 0);
  c.fillStyle = o.trunk || '#2B2019';
  c.fillRect(x - hp * 0.032, y - hp * (tk + 0.1), hp * 0.064, hp * (tk + 0.1) + 1 + hop);
  const n = hp > 60 ? 5 : hp > 20 ? 4 : 3;
  for (let i = 0; i < n; i++) {
    const u0 = tk + (1 - tk) * (i / n) * 0.86, u1 = Math.min(1, u0 + (1 - tk) * 0.42);
    const yb = y - hp * u0 * sq, yt = y - hp * u1 * sq, wi = w * (1 - 0.72 * (i / n)), sw = sway * Math.pow(u1, 1.5), swb = sway * Math.pow(u0, 1.5);
    c.fillStyle = Array.isArray(col) ? col[i % col.length] : col;
    c.beginPath();
    c.moveTo(x + swb - wi / 2, yb);
    c.lineTo(x + swb - wi * 0.28, yb - hp * 0.035);
    c.lineTo(x + sw, yt);
    c.lineTo(x + swb + wi * 0.28, yb - hp * 0.035);
    c.lineTo(x + swb + wi / 2, yb);
    c.quadraticCurveTo(x + swb, yb - hp * 0.05, x + swb - wi / 2, yb);
    c.fill();
  }
  return [x + sway, y - hp * sq];
}

// ---------------------------------------------------------------- the world, back to front
// o: {pal, day, star(tr) -> 0..1 its topper, hop(tr) -> px, sway (amount), hero(C) (drawn when the slices reach z 0),
//     after(C), trees(tr) -> false to skip one, plotTrees: [{x, z, h}] extra hand-placed trees, flags: [[x, z]]}
function tvWorld(C, t, o = {}) {
  const P = o.pal || TV_NIGHT;
  if (!o.noSky) { if (o.day) tvDaySky(C, t, o); else tvSky(C, t, o); }
  screenSpace();
  if (o.skyOver) { o.skyOver(C); screenSpace(); }
  const hy = tvHorizonY(C);
  // mist low in the valley (night) / haze (day), behind the near forest
  const crowns = P.crown;
  let ti = 0;
  const trees = o.plotTrees ? TV_TREES.concat(o.plotTrees).sort((a, b) => b.z - a.z) : TV_TREES;
  const drawTreesTo = (zMin) => {
    while (ti < trees.length && trees[ti].z >= zMin) {
      const tr = trees[ti++];
      if (o.trees && o.trees(tr) === false) continue;
      const b = tvProj(C, tr.x, tr.y, tr.z);
      if (!b) continue;
      const hp = tr.h * b[2];
      if (b[0] < -hp || b[0] > W + hp || b[1] - hp > H + 40 || b[1] < -20) continue;
      const fk = tvFogK(b[3], P);
      const col = crowns.map((cc) => mixH(cc, P.haze, fk * 0.85));
      const sway = (o.sway === undefined ? 1 : o.sway) * hp * 0.012 * Math.sin(t * loopW(0.9) + tr.seed);
      const hop = o.hop ? o.hop(tr, b) : 0;
      const tip = tvPine(ctx, b[0], b[1], hp, { w: tr.w, col, sway, hop, trunkK: tr.trunkK, trunk: mixH(P.trunk, P.haze, fk * 0.8), squash: hop ? -0.002 * hop : 0 });
      if (o.star && tip) { const k = o.star(tr); if (k > 0) tvTopper(tip[0], tip[1] - hp * 0.02, Math.max(1.2, hp * 0.085), k, t, tr.seed); }
      if (o.afterTree) o.afterTree(tr, b, tip);
    }
  };
  let heroDone = false;
  const at = (o.at || []).slice().sort((a, b) => b.z - a.z);
  let ai = 0;
  const drawAtTo = (zMin) => { while (ai < at.length && at[ai].z >= zMin) { at[ai++].fn(C); screenSpace(); } };
  for (let si = 0; si < TV_SLICES.length; si++) {
    const Z = TV_SLICES[si];
    if (Z <= C.z + 0.5) break;
    drawTreesTo(Z);
    drawAtTo(Z);
    if (!heroDone && Z <= 0 && o.hero) { o.hero(C); screenSpace(); heroDone = true; }
    tvSlice(C, t, Z, P, o);
  }
  drawTreesTo(-1e9);
  drawAtTo(-1e9);
  if (!heroDone && o.hero) { o.hero(C); screenSpace(); }
  if (o.after) { o.after(C); screenSpace(); }
}
// one slice of ground at depth Z, filled down to the bottom of the frame; from z 170 on its top edge is pine tops
function tvSlice(C, t, Z, P, o) {
  const d0 = (Z - C.z) * Math.cos(C.pitch);
  if (d0 < 0.1) return;
  const span = (W * 0.62 + 300) * d0 / C.f, X0 = C.x - span, X1 = C.x + span;
  const forest = Z >= TVW.NEAR_Z - 2 && !(o.day && Z > 1300);
  const step = forest ? Math.max(6.5, 3.2 * d0 / C.f) : Math.max(2, span / 50);
  const pts = [];
  let seed = Math.floor(Z * 13.1);
  for (let X = Math.floor(X0 / step) * step; X <= X1 + step; X += step) {
    const gy = tvH(X, Z);
    if (forest) {
      const r1 = hash(X * 0.37 + seed), r2 = hash(X * 0.91 + seed * 1.7), th = 9 + 9 * r1;
      const a = tvProj(C, X - step * 0.5, tvH(X - step * 0.5, Z) + th * 0.18, Z), b = tvProj(C, X + (r2 - 0.5) * step * 0.3, gy + th, Z);
      if (a) pts.push(a); if (b) pts.push(b);
    } else {
      const a = tvProj(C, X, gy, Z);
      if (a) pts.push(a);
    }
  }
  if (pts.length < 2) return;
  const d = Math.max(1, d0), fk = tvFogK(d, P);
  const base = Z < 26 ? P.hill : P.ground;
  ctx.fillStyle = mixH(forest ? P.crown[(Math.floor(Z) % 3)] : base, P.haze, fk * (forest ? 0.92 : 0.8));
  ctx.beginPath(); ctx.moveTo(pts[0][0], H + 60);
  for (const p of pts) ctx.lineTo(p[0], Math.min(p[1], H + 60));
  ctx.lineTo(pts[pts.length - 1][0], H + 60); ctx.closePath(); ctx.fill();
  if (forest) {
    paint(() => {
      ctx.strokeStyle = mixH(P.lit || '#4E8C86', P.haze, fk * 0.7); ctx.lineWidth = Math.max(1.2, Math.min(5, 9 * C.f / Math.max(60, d) / 6)); ctx.lineJoin = 'round';
      ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const p = pts[i]; if (i % 2 === 0) ctx.moveTo(p[0], Math.min(p[1], H + 60)); else ctx.lineTo(p[0], Math.min(p[1], H + 60)); } ctx.stroke();
    });
  }
  if (Z < 30 && !forest) tvTufts(C, t, Z, P, d);
  if (o.slice) o.slice(Z, pts, d);
}

// ---------------------------------------------------------------- the day sky (the plot)
function tvDaySky(C, t, o = {}) {
  screenSpace();
  const hy = tvHorizonY(C);
  const g = ctx.createLinearGradient(0, hy - 1900, 0, hy + 60);
  g.addColorStop(0, '#3C86D6'); g.addColorStop(0.55, '#7DB8E8'); g.addColorStop(1, '#CFE8F2');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [cx, cy, r] of [[180, hy - 820, 120], [760, hy - 1180, 160], [980, hy - 600, 110]]) {
    for (let k = 0; k < 5; k++) ellipse(ctx, cx + (k - 2) * r * 0.55, cy + Math.abs(k - 2) * 12, r * 0.62, r * 0.4, 'rgba(255,255,255,0.88)');
  }
}

// ---------------------------------------------------------------- the hero inside the 3D world
// A: {x, z (metres: where he sits or stands), dy (metres above the ground), pose, face, ... as for charLayer}; returns {r, cam2}
function tvHeroCam(C, X, Z, dy = 0) {
  const p = tvProj(C, X, tvH(X, Z) + dy, Z);
  if (!p) return null;
  const zoom = p[2] / TVW.RIG_PER_M;
  return { x: (W / 2 - p[0]) / zoom, y: (H / 2 - p[1]) / zoom, zoom, rot: 0 };
}

// ---------------------------------------------------------------- props
// the tally counter in his hand (rig units, drawn in his layer's post): centre (x, y), the press 0..1, the number shown
function tvClicker(c, x, y, s, press, num, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  // the finger ring under it
  c.lineWidth = 7; c.strokeStyle = '#8C939E'; c.beginPath(); c.arc(0, 40, 17, 0, 7); c.stroke();
  // body
  c.fillStyle = '#C9CFD8'; c.beginPath(); c.arc(0, 0, 38, 0, 7); c.fill();
  c.fillStyle = '#9AA2AE'; c.beginPath(); c.arc(0, 2, 30, 0, 7); c.fill();
  // the button on top
  const by = -46 + 7 * press;
  c.fillStyle = '#AEB5C0'; c.fillRect(-7, by + 6, 14, 12);
  c.fillStyle = '#E2E6EC'; rrect(c, -14, by - 2, 28, 12, 5); c.fill();
  // the number window
  paint(() => {
    c.fillStyle = '#1A1F2A'; rrect(c, -26, -10, 52, 20, 4); c.fill();
    c.fillStyle = '#F4F7FB'; c.font = '700 13px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(num, 0, 1);
  });
  c.restore();
}
// the stadium scoreboard (screen units): centre x, bottom y of its legs, scale s (1 = 520 px wide); k pop, the two digits and
// how far each has flipped (0..1)
function tvScoreboard(x, y, s, k, t, d) {
  if (k <= 0.01) return;
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  // legs
  c.fillStyle = '#2B3442'; c.fillRect(-170, -260, 26, 260); c.fillRect(144, -260, 26, 260);
  c.fillStyle = '#3A4658'; c.fillRect(-150, -170, 300, 14);
  // the board
  c.translate(0, -260 - 200);
  c.fillStyle = '#1C2330'; rrect(c, -270, -200, 540, 400, 26); c.fill();
  c.fillStyle = '#0A0E16'; rrect(c, -248, -178, 496, 356, 16); c.fill();
  paint(() => {
    // bulbs round the edge (chasing)
    for (let i = 0; i < 34; i++) {
      const u = i / 34, per = 2 * (496 + 356);
      let p = u * per, bx, by;
      if (p < 496) { bx = -248 + p; by = -190; } else if ((p -= 496) < 356) { bx = 259; by = -178 + p; } else if ((p -= 356) < 496) { bx = 248 - p; by = 190; } else { p -= 496; bx = -259; by = 178 - p; }
      const on = 0.5 + 0.5 * Math.sin(t * loopW(9) - i * 1.1);
      circle(c, bx, by, 6, on > 0.5 ? '#FFE38A' : '#6B5A2A');
    }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '400 70px Anton'; c.fillStyle = '#7CFFB2'; c.fillText('TREES', -124, -112);
    c.fillStyle = '#FFD447'; c.fillText('STARS', 124, -112);
    c.fillStyle = '#2A3346'; c.fillRect(-3, -150, 6, 290);
    for (const [cx, dig, f, col] of [[-124, d.a, d.fa, '#7CFFB2'], [124, d.b, d.fb, '#FFD447']]) {
      c.fillStyle = '#141A26'; rrect(c, cx - 82, -62, 164, 196, 12); c.fill();
      const sq = f < 1 ? Math.abs(Math.cos(Math.PI * f)) : 1, show = f < 0.5 ? '' : dig;
      c.save(); c.translate(cx, 36); c.scale(1, Math.max(0.04, sq));
      c.font = '400 170px Anton'; c.fillStyle = f >= 0.5 ? col : '#4A5468'; c.fillText(show, 0, 8);
      c.restore();
      c.fillStyle = '#0A0E16'; c.fillRect(cx - 82, 33, 164, 4);
    }
  });
  c.restore();
  // the board's glow
  softDot(gctx, x, y - (460) * s, 360 * s, '#9CFFD0', 0.22 * k);
}
// a sapling (screen units) with a face: base (x, y), height hp, droop 0..1, look -1..1
function tvSapling(x, y, hp, t, droop, look) {
  const c = ctx, sway = hp * 0.03 * Math.sin(t * loopW(1.3)) + droop * hp * 0.18;
  tvPine(c, x, y, hp, { w: 0.46, col: ['#2E8A55', '#38A062', '#28794B'], sway, trunkK: 0.14, trunk: '#5A3E2A' });
  // its face on the lower tier
  const fx = x + sway * 0.25, fy = y - hp * 0.36;
  paint(() => {
    const e = hp * 0.035, dx = look * e * 0.6;
    for (const sx of [-1, 1]) { circle(c, fx + sx * hp * 0.06, fy, e * 1.5, '#F4F7FB'); circle(c, fx + sx * hp * 0.06 + dx, fy + e * 0.4 * droop, e * 0.8, '#121820'); }
    c.strokeStyle = '#0B1A14'; c.lineWidth = Math.max(2, hp * 0.012); c.lineCap = 'round';
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(fx + sx * hp * 0.035, fy - e * 2.2 + sx * droop * e * 0.9); c.lineTo(fx + sx * hp * 0.09, fy - e * 2.2 - sx * droop * e * 0.9 + droop * e * 1.2); c.stroke(); }
    c.beginPath(); c.arc(fx, fy + e * 3.6 + droop * e * 1.2, e * 1.3, Math.PI * (1.15 + 0.0), Math.PI * 1.85, false); c.stroke();
  });
}
// the plot's rope on four stakes with flags (screen projection of world corners)
function tvPlot(C, t, cx, cz, half, k = 1) {
  const cor = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([dx, dz]) => {
    const X = cx + dx, Z = cz + dz;
    return [tvProj(C, X, tvH(X, Z), Z), tvProj(C, X, tvH(X, Z) + 0.38, Z), tvProj(C, X, tvH(X, Z) + 1.05, Z)];
  });
  if (cor.some((q) => !q[0] || !q[1])) return;
  screenSpace();
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = cor[i][1], b = cor[(i + 1) % 4][1];
    ctx.strokeStyle = '#FF8A3D'; ctx.lineWidth = Math.max(2, 0.03 * (a[2] + b[2]) / 2);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.12 * (a[2] + b[2]) / 2, b[0], b[1]); ctx.stroke();
  }
  for (const q of cor) {
    ctx.strokeStyle = '#7A5636'; ctx.lineWidth = Math.max(2, q[0][2] * 0.05); ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke();
    const fs = q[2][2] * 0.32, wv = Math.sin(t * loopW(4) + q[0][0]) * fs * 0.12;
    ctx.fillStyle = '#FF6A3D'; ctx.beginPath(); ctx.moveTo(q[2][0], q[2][1]); ctx.lineTo(q[2][0] + fs, q[2][1] + fs * 0.25 + wv); ctx.lineTo(q[2][0], q[2][1] + fs * 0.5); ctx.fill();
  }
}

// grass tufts along a near slice of the hill (they sway on a whole-turn clock, for the loop)
function tvTufts(C, t, Z, P, d) {
  const s = C.f / Math.max(0.3, d);
  const span = (W * 0.6 + 200) / s, X0 = C.x - span, X1 = C.x + span, step = Math.max(0.09, 22 / s);
  const col = mixH(P.hill, '#2F5A3A', 0.5), col2 = mixH(P.hill, '#0A1C14', 0.4);
  for (let X = Math.floor(X0 / step) * step; X <= X1; X += step) {
    const r1 = hash(X * 3.7 + Z * 11.3), r2 = hash(X * 5.1 + Z * 7.9);
    if (r1 < 0.35) continue;
    const b = tvProj(C, X + (r2 - 0.5) * step, tvH(X, Z), Z);
    if (!b || b[0] < -40 || b[0] > W + 40 || b[1] > H + 40) continue;
    const hp = (0.12 + 0.22 * r2) * b[2], sw = hp * 0.18 * Math.sin(t * loopW(1.2) + X * 3 + Z);
    ctx.fillStyle = r1 > 0.7 ? col : col2;
    ctx.beginPath(); ctx.moveTo(b[0] - hp * 0.32, b[1] + 1);
    ctx.lineTo(b[0] - hp * 0.18 + sw * 0.6, b[1] - hp * 0.8); ctx.lineTo(b[0] - hp * 0.05, b[1] - hp * 0.2);
    ctx.lineTo(b[0] + sw, b[1] - hp); ctx.lineTo(b[0] + hp * 0.08, b[1] - hp * 0.2);
    ctx.lineTo(b[0] + hp * 0.22 + sw * 0.7, b[1] - hp * 0.75); ctx.lineTo(b[0] + hp * 0.34, b[1] + 1); ctx.closePath(); ctx.fill();
  }
}
