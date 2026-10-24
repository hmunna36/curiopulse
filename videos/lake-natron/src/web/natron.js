// Lake Natron at golden hour (northern Tanzania): the far plate (a sky going from indigo to amber, a low sun on the right,
// long lit clouds, the Rift Valley's wall on the left, Ol Doinyo Lengai -- the volcano whose lava weathers WHITE -- with a
// thin plume, the salt flats on the far shore and a pink line of flamingos), painted once and drawn with a little
// parallax; and the water as a ground plane in 2.5D: a blood-red brine that mirrors the plate, rafts of pink-white soda
// crust, a glitter path under the sun, ripples, hot springs that steam.
// World = 1080x1920 at zoom 1. The far plate sits at parallax NT.pFar; the water plane runs from the horizon (u = 0,
// parallax NT.pFar) to the near line (u = 1, world y NT.near, parallax 1); u > 1 is closer than the near line.
// Everything ambient runs on loopW(), so the last frame meets the first.
'use strict';

const NT = { hor: 700, pFar: 0.2, near: 1160, vpx: 540, sun: [928, 500], volc: [292, 336], hx: 540, hy: 1150, hs: 1.0 };
const NT_PL = { x0: -700, y0: -900, w: 2480, h: 1640, res: 1.25 };    // the plate's world rectangle and its pixels per unit
let NT_PLATE = null, NT_PLATE_SOFT = null, NT_RAFTS = null, NT_RIPS = null, NT_SPRINGS = null;
const NT_SKY = [[-900, '#120B2E'], [-300, '#2A1650'], [120, '#5E2263'], [380, '#A93A64'], [560, '#E8603E'], [650, '#FFA24C'], [700, '#FFD98C']];

function ntSkyAt(y) {
  for (let i = 1; i < NT_SKY.length; i++) if (y <= NT_SKY[i][0]) {
    const a = NT_SKY[i - 1], b = NT_SKY[i];
    return mixH(a[1], b[1], (y - a[0]) / (b[0] - a[0]));
  }
  return NT_SKY[NT_SKY.length - 1][1];
}

// ---------------------------------------------------------------- the plate (painted once)
function ntPaintPlate(c) {
  const { hor } = NT;
  // the sky
  const g = c.createLinearGradient(0, NT_PL.y0, 0, hor + 40);
  for (const [y, col] of NT_SKY) g.addColorStop(clamp((y - NT_PL.y0) / (hor + 40 - NT_PL.y0)), col);
  g.addColorStop(1, '#FFE6A8');
  c.fillStyle = g; c.fillRect(NT_PL.x0, NT_PL.y0, NT_PL.w, NT_PL.h);
  // the sun's glow: a wide warm bloom over the right of the sky
  const [sx, sy] = NT.sun;
  for (const [r, col, a] of [[1100, '#FF8A3A', 0.26], [620, '#FFB45A', 0.32], [300, '#FFE1A0', 0.42], [150, '#FFF4D2', 0.6]]) {
    const rg = c.createRadialGradient(sx, sy, 0, sx, sy, r);
    rg.addColorStop(0, rgba(col, a)); rg.addColorStop(1, rgba(col, 0));
    c.fillStyle = rg; c.fillRect(sx - r, sy - r, 2 * r, 2 * r);
  }
  // long clouds lit from below: violet tops, hot pink and gold bellies (brighter toward the sun)
  const rng = mulberry32(9071);
  const clouds = [[-420, -520, 900, 34], [380, -420, 760, 26], [-80, -230, 1100, 40], [640, -150, 700, 30], [-500, 30, 820, 30],
    [180, 120, 980, 34], [760, 250, 620, 24], [-300, 300, 760, 26], [420, 420, 900, 20], [-120, 520, 700, 14], [700, 470, 520, 12]];
  for (const [x, y, w, h] of clouds) {
    const near = clamp(1 - Math.hypot(x + w / 2 - sx, y - sy) / 1300);
    const top = mixH('#3A1C55', '#7A3060', clamp((y + 600) / 1200)), belly = mixH(mixH('#C8487A', '#FF8A55', clamp((y + 200) / 800)), '#FFD27A', near * 0.8);
    for (let k = 0; k < 7; k++) {                       // a cloud is several overlapping lens shapes
      const px = x + w * (0.08 + 0.84 * rng()), pw = w * (0.22 + 0.3 * rng()), ph = h * (0.5 + 0.7 * rng()), py = y + (rng() - 0.5) * h * 0.8;
      c.fillStyle = rgba(top, 0.55); c.beginPath(); c.ellipse(px, py - ph * 0.25, pw, ph * 0.7, 0, 0, 7); c.fill();
      const bg = c.createLinearGradient(0, py - ph, 0, py + ph);
      bg.addColorStop(0, rgba(belly, 0)); bg.addColorStop(0.55, rgba(belly, 0.55)); bg.addColorStop(1, rgba(belly, 0.95));
      c.fillStyle = bg; c.beginPath(); c.ellipse(px, py + ph * 0.1, pw * 0.96, ph * 0.5, 0, 0, 7); c.fill();
    }
  }
  // the sun's disc, a little squashed by the haze, with a pale core
  c.save(); c.translate(sx, sy); c.scale(1, 0.96);
  const sg = c.createRadialGradient(0, 0, 0, 0, 0, 74);
  sg.addColorStop(0, '#FFFDF0'); sg.addColorStop(0.62, '#FFF0B8'); sg.addColorStop(0.9, '#FFC86A'); sg.addColorStop(1, 'rgba(255,170,80,0)');
  c.fillStyle = sg; c.beginPath(); c.arc(0, 0, 74, 0, 7); c.fill();
  c.restore();
  // the far wall of the Rift Valley on the left, two ranges in the haze
  const ridge = (y0, amp, seed, x0, x1, col, colB) => {
    const r = mulberry32(seed), pts = [];
    for (let x = x0; x <= x1; x += 40) pts.push([x, y0 - amp * (0.75 + 0.25 * Math.sin(x / 310 + seed) + 0.12 * r())]);
    const lg = c.createLinearGradient(0, y0 - amp, 0, hor);
    lg.addColorStop(0, col); lg.addColorStop(1, colB);
    c.fillStyle = lg; c.beginPath(); c.moveTo(x0, hor + 4); for (const p of pts) c.lineTo(p[0], p[1]);
    c.lineTo(x1, hor + 4); c.closePath(); c.fill();
  };
  ridge(hor - 10, 120, 3, -700, 1780, '#A85A7E', '#E89A86');               // far: pale, warm with haze
  ridge(hor - 4, 92, 7, -700, 420, '#7A3D6E', '#C9737E');                   // the escarpment, nearer, on the left
  // Ol Doinyo Lengai: a steep cone, the lit flank on the sun's side, white streaks running down from the crater
  const [vx, vy] = NT.volc, base = hor - 2, hw = 400;
  const cone = (cc) => {
    cc.beginPath(); cc.moveTo(vx - hw, base);
    cc.quadraticCurveTo(vx - hw * 0.42, base - (base - vy) * 0.42, vx - 34, vy + 6);
    cc.lineTo(vx - 14, vy - 2); cc.lineTo(vx + 4, vy + 8); cc.lineTo(vx + 22, vy - 1); cc.lineTo(vx + 36, vy + 8);
    cc.quadraticCurveTo(vx + hw * 0.42, base - (base - vy) * 0.42, vx + hw, base); cc.closePath();
  };
  const vg = c.createLinearGradient(vx - hw, 0, vx + hw, 0);
  vg.addColorStop(0, '#4E2A5E'); vg.addColorStop(0.47, '#5C2F62'); vg.addColorStop(0.53, '#9A4E72'); vg.addColorStop(1, '#C8687A');
  cone(c); c.fillStyle = vg; c.fill();
  c.save(); cone(c); c.clip();
  const hz = c.createLinearGradient(0, vy, 0, base);                         // haze thickens toward the base
  hz.addColorStop(0, 'rgba(255,170,130,0)'); hz.addColorStop(0.6, 'rgba(255,160,120,0.18)'); hz.addColorStop(1, 'rgba(255,190,140,0.62)');
  c.fillStyle = hz; c.fillRect(vx - hw, vy - 20, 2 * hw, base - vy + 30);
  const r2 = mulberry32(55);
  for (let i = 0; i < 15; i++) {                                              // the white streaks of weathered lava
    const a = -0.85 + 1.7 * (i / 14) + (r2() - 0.5) * 0.08, L = (base - vy) * (0.35 + 0.5 * r2());
    const x0 = vx + (r2() - 0.5) * 40, y0 = vy + 6, x1 = x0 + Math.sin(a) * L * 0.95, y1 = y0 + Math.cos(a) * L;
    const lw = 10 + 16 * r2();
    const sg2 = c.createLinearGradient(x0, y0, x1, y1);
    sg2.addColorStop(0, 'rgba(250,240,232,0.95)'); sg2.addColorStop(0.55, 'rgba(244,222,214,0.55)'); sg2.addColorStop(1, 'rgba(240,210,205,0)');
    c.strokeStyle = sg2; c.lineCap = 'round';
    c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + (r2() - 0.5) * 30, (y0 + y1) / 2, x1, y1); c.stroke();
  }
  ellipse(c, vx, vy + 10, 46, 12, 'rgba(255,246,236,0.95)');                // the crater's white rim
  c.restore();
  // the rim light down the sun-side edge of the cone
  c.save(); c.beginPath(); c.moveTo(vx + 36, vy + 8); c.quadraticCurveTo(vx + hw * 0.42, base - (base - vy) * 0.42, vx + hw, base);
  c.lineWidth = 5; c.strokeStyle = 'rgba(255,190,120,0.55)'; c.stroke(); c.restore();
  // a band of warm haze along the far shore
  const hb = c.createLinearGradient(0, hor - 170, 0, hor + 8);
  hb.addColorStop(0, 'rgba(255,170,110,0)'); hb.addColorStop(0.7, 'rgba(255,175,120,0.35)'); hb.addColorStop(1, 'rgba(255,214,160,0.72)');
  c.fillStyle = hb; c.fillRect(NT_PL.x0, hor - 170, NT_PL.w, 178);
  // the far shore: salt flats, pale and pink, and a long line of flamingos standing in the shallows
  c.fillStyle = '#F4C8B4'; c.fillRect(NT_PL.x0, hor - 3, NT_PL.w, 9);
  c.fillStyle = '#FBE3D2'; c.fillRect(NT_PL.x0, hor - 3, NT_PL.w, 3);
  const r3 = mulberry32(331);
  for (let i = 0; i < 2600; i++) {
    const x = NT_PL.x0 + r3() * NT_PL.w, band = Math.sin(x / 140 + 1.3) * 0.5 + 0.5;
    if (r3() > 0.25 + 0.75 * band) continue;                                // they stand in clumps
    const y = hor - 1 + r3() * 7, col = r3() < 0.7 ? '#FF7FA0' : '#FFB3C6';
    c.fillStyle = col; c.fillRect(x, y - 2.6, 1.6, 2.6);                     // a body
    if (r3() < 0.5) { c.fillStyle = 'rgba(120,40,60,0.5)'; c.fillRect(x + 0.4, y, 0.6, 2.4); }   // and a leg or two
  }
}

function initNatron() {
  const res = NT_PL.res, w = Math.round(NT_PL.w * res), h = Math.round(NT_PL.h * res);
  NT_PLATE = mkCanvas(w, h);
  const c = NT_PLATE.getContext('2d');
  c.setTransform(res, 0, 0, res, -NT_PL.x0 * res, -NT_PL.y0 * res);
  ntPaintPlate(c);
  NT_PLATE_SOFT = mkCanvas(w, h);
  const s = NT_PLATE_SOFT.getContext('2d');
  s.filter = 'blur(9px)'; s.drawImage(NT_PLATE, 0, 0); s.filter = 'none';
  // soda-crust rafts on the water: [world x at the near line, depth u, radius, seed]
  const rng = mulberry32(2024);
  NT_RAFTS = [];
  for (let i = 0; i < 46; i++) {
    const u = 0.04 + Math.pow(rng(), 1.7) * 1.15, wx = -1400 + rng() * 3900;
    NT_RAFTS.push({ wx, u, r: 40 + 150 * rng(), seed: 100 + i, rot: rng() * 6.28, pink: rng() });
  }
  NT_RAFTS.sort((a, b) => a.u - b.u);
  NT_RIPS = [...Array(260)].map(() => ({ wx: -1600 + rng() * 4300, u: 0.02 + Math.pow(rng(), 1.4) * 1.3, len: 26 + 60 * rng(), ph: rng() * 6.28, w: 0.4 + 0.9 * rng() }));
  NT_SPRINGS = [[-260, 0.32, 1], [980, 0.22, 2], [1320, 0.55, 3], [-520, 0.72, 4], [180, 0.12, 5], [760, 0.42, 6]];
  nbInitSprites();
}

// ---------------------------------------------------------------- the 2.5D water plane
// P: the plane for this frame's camera. ntAt(P, wx, u) -> [screen x, screen y, scale] for a point on the water
function ntPlane(cam, tilt = 0) {             // tilt: raise the horizon (the camera craning up over the lake)
  const pc = parallax(cam, NT.pFar);
  if (tilt) pc.sy = (pc.sy || 0) - tilt;
  const [vx, yH] = toScreen(pc, NT.vpx, NT.hor);
  const yN = toScreen(cam, 540, NT.near)[1];
  return { cam, pc, vx, yH, yN, yW: yH + 5 * pc.zoom };
}
function ntAt(P, wx, u) {
  const xN = toScreen(P.cam, wx, NT.near)[0];
  return [P.vx + (xN - P.vx) * u, P.yH + (P.yN - P.yH) * u, P.cam.zoom * u];
}
// the depth u of a screen row
const ntU = (P, y) => (y - P.yH) / Math.max(1, P.yN - P.yH);

// the plate, with the camera's parallax; soft = 0..1 (depth of field in close-ups)
function ntSky(P, t, o = {}) {
  screenSpace();
  ctx.save();
  camTransform(ctx, P.pc, 1);
  const soft = clamp(o.soft || 0);
  ctx.drawImage(NT_PLATE, NT_PL.x0, NT_PL.y0, NT_PL.w, NT_PL.h);
  if (soft > 0.01) { ctx.globalAlpha = soft; ctx.drawImage(NT_PLATE_SOFT, NT_PL.x0, NT_PL.y0, NT_PL.w, NT_PL.h); ctx.globalAlpha = 1; }
  ctx.restore();
  // the sun in the glow layer (it blooms) and its rays where something stands in front of it
  const [sx, sy] = toScreen(P.pc, NT.sun[0], NT.sun[1]);
  softDot(gctx, sx, sy, 110 * P.pc.zoom, '#FFD27A', 0.3 * (o.sunK === undefined ? 1 : o.sunK));
  circle(gctx, sx, sy, 30 * P.pc.zoom, rgba('#FFF4CC', 0.6 * (o.sunK === undefined ? 1 : o.sunK)));
  // the volcano's plume: a thin grey-pink smoke drifting right from the crater
  const [px, py] = toScreen(P.pc, NT.volc[0] + 4, NT.volc[1] + 4), z = P.pc.zoom;
  snWisps({ x: px, y: py, t: t * 0.6, n: 22, seed: 11, col: '#D9A8B6', size: 22 * z, rise: 210 * z, spread: 18 * z, life: 3.1, alpha: 0.32 * (1 - 0.5 * soft), glow: 0, sway: 160 * z });
  return [sx, sy];
}

// the water: a red brine that mirrors the plate. o: {soft, glint, rafts, steam, ripK}
function ntWater(P, t, o = {}) {
  screenSpace();
  const yW = Math.max(-10, P.yW), soft = clamp(o.soft || 0);
  if (yW >= H) return;
  // 1) the brine's own colour, by depth: hot pink-orange near the horizon, blood red, then deep crimson close up
  const g = ctx.createLinearGradient(0, yW, 0, Math.max(yW + 10, P.yN + (P.yN - P.yH) * 0.4));
  g.addColorStop(0, '#F27E62'); g.addColorStop(0.06, '#E2504E'); g.addColorStop(0.25, '#C42C44'); g.addColorStop(0.6, '#9A1736'); g.addColorStop(1, '#6A0E2A');
  ctx.fillStyle = g; ctx.fillRect(0, yW, W, H - yW);
  // 2) the reflection: the plate drawn upside down about the horizon, in rippled strips, strongest far away (fresnel)
  tmpx.setTransform(1, 0, 0, 1, 0, 0); tmpx.clearRect(0, 0, W, H);
  camTransform(tmpx, P.pc, 1);
  tmpx.drawImage(soft > 0.5 ? NT_PLATE_SOFT : NT_PLATE, NT_PL.x0, NT_PL.y0, NT_PL.w, NT_PL.h);
  tmpx.setTransform(1, 0, 0, 1, 0, 0);
  const step = 5, yHs = P.yH;
  for (let y = Math.floor(yW); y < H; y += step) {
    const u = ntU(P, y), ys = 2 * yHs - y + 2;
    if (ys < -step) break;
    const a = clamp(0.62 - 0.55 * Math.min(1, u * 1.1)) * (o.reflect === undefined ? 1 : o.reflect);
    if (a <= 0.02) continue;
    const amp = (1.5 + 18 * u) * (o.ripK === undefined ? 1 : o.ripK), dx = amp * Math.sin(y * 0.11 / (0.3 + u) + t * loopW(2.1)) + 0.5 * amp * Math.sin(y * 0.031 + t * loopW(1.3));
    ctx.globalAlpha = a;
    ctx.drawImage(tmpC, 0, ys, W, step, dx, y, W, step);
  }
  ctx.globalAlpha = 1;
  // 3) the glitter path under the sun: bright dashes that flicker, densest near the horizon
  const sx = toScreen(P.pc, NT.sun[0], NT.sun[1])[0], gk = o.glint === undefined ? 1 : o.glint;
  if (gk > 0.01) {
    const rng = mulberry32(77 + Math.floor(t * 12));
    for (let i = 0; i < 90; i++) {
      const u = Math.pow(rng(), 2.2) * 0.9, y = P.yH + (P.yN - P.yH) * u + 4;
      if (y < yW || y > H) continue;
      const spread = (30 + 260 * u) * P.cam.zoom * 0.5, x = sx + (rng() - 0.5) * 2 * spread * (0.4 + rng()), L = (6 + 40 * u) * (0.5 + rng()) * Math.max(0.6, P.cam.zoom * 0.6);
      const a = (0.35 + 0.65 * rng()) * gk * (1 - 0.6 * u);
      line(ctx, x - L / 2, y, x + L / 2, y, Math.max(1.4, 2.5 * u * P.cam.zoom * 0.6), rgba('#FFE7B0', a));
      line(gctx, x - L / 2, y, x + L / 2, y, 5, rgba('#FFD27A', a * 0.8));
    }
  }
  // 4) ripples: pale strokes lying on the plane
  for (const r of NT_RIPS) {
    const [x, y, s] = ntAt(P, r.wx + 24 * Math.sin(t * loopW(0.35 * r.w) + r.ph), r.u);
    if (y < yW + 2 || y > H + 10 || x < -200 || x > W + 200) continue;
    const L = r.len * s, k = 0.5 + 0.5 * Math.sin(t * loopW(1.2 * r.w) + r.ph);
    line(ctx, x - L / 2, y, x + L / 2, y, Math.max(1, 2.2 * s), rgba('#FFC4A8', (0.12 + 0.22 * k) * (1 - soft * 0.6) * clamp(1.4 - r.u)));
  }
  // 5) the soda crust: rafts lying flat on the water (pink-white, cracked into plates, rust at the edge)
  if (o.rafts !== false) for (const R of NT_RAFTS) ntRaft(P, R, t, soft);
  // 6) hot springs steaming here and there
  if (o.steam !== false) for (const [wx, u, sd] of NT_SPRINGS) {
    const [x, y, s] = ntAt(P, wx, u);
    if (y < yW || y > H + 200 || x < -300 || x > W + 300) continue;
    snWisps({ x, y, t, n: 14, seed: 40 + sd, col: '#FFE2D2', size: 70 * s, rise: 380 * s, spread: 90 * s, life: 3.4, alpha: 0.16, glow: 0.25, sway: 90 * s });
  }
}

// one raft of crust on the plane
function ntRaft(P, R, t, soft = 0) {
  const [x, y, s] = ntAt(P, R.wx, R.u);
  const rx = R.r * s, ry = rx * (0.07 + 0.22 * Math.min(1.2, R.u));
  if (y < P.yW - 2 || y - ry > H || x + rx < -50 || x - rx > W + 50 || rx < 2) return;
  const rng = mulberry32(R.seed), n = 14, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, k = 0.72 + 0.4 * rng(); pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  const base = mixH('#F7E4DA', '#F4B9C2', R.pink), edge = mixH('#D86A4C', '#B8433E', R.pink);
  ctx.save();
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = edge; ctx.fill();
  ctx.translate(x, y - ry * 0.12); ctx.scale(0.9, 0.86); ctx.translate(-x, -y);
  ctx.fillStyle = base; ctx.fill();
  if (rx > 30) {                                       // cracks: the crust breaks into plates
    ctx.clip();
    ctx.lineWidth = Math.max(1, rx * 0.012); ctx.strokeStyle = rgba(mixH(edge, '#7A2A2A', 0.3), 0.55);
    for (let i = 0; i < 9; i++) {
      const a = rng() * 6.283, cx = x + (rng() - 0.5) * rx, cy = y + (rng() - 0.5) * ry;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      for (let j = 0; j < 3; j++) ctx.lineTo(cx + Math.cos(a + (rng() - 0.5)) * rx * (0.2 + 0.3 * j), cy + Math.sin(a + (rng() - 0.5)) * ry * (0.2 + 0.3 * j));
      ctx.stroke();
    }
  }
  ctx.restore();
}

// a ring spreading on the water at a point of the plane (a splash, a dip): k 0..1 its age
function ntRing(P, wx, u, k, R = 120) {
  if (k <= 0 || k >= 1) return;
  const [x, y, s] = ntAt(P, wx, u), rx = R * s * (0.2 + E.outCubic(k)), ry = rx * (0.1 + 0.22 * Math.min(1.2, u));
  screenSpace();
  ctx.save(); ctx.lineWidth = Math.max(1.5, 5 * s * (1 - k)); ctx.strokeStyle = rgba('#FFD6C4', 0.8 * (1 - k));
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- life on the lake (the world must never sit still)
// wading groups [world x at the near line, depth u, birds, spread (world x), depth spread (u), bird height (world units
// at the near line), seed]; dead branches mid-lake with small stone birds on them; flocks crossing the sky
const NT_GROUPS = [
  { wx: -420, u: 0.30, n: 11, spread: 620, depth: 0.05, h: 250, seed: 1 }, { wx: 1460, u: 0.36, n: 8, spread: 520, depth: 0.05, h: 250, seed: 2 },
  { wx: 300, u: 0.16, n: 16, spread: 900, depth: 0.03, h: 250, seed: 3 }, { wx: 1050, u: 0.22, n: 10, spread: 500, depth: 0.03, h: 250, seed: 4 },
  { wx: -900, u: 0.52, n: 6, spread: 420, depth: 0.06, h: 250, seed: 5 }, { wx: 2050, u: 0.6, n: 5, spread: 380, depth: 0.06, h: 250, seed: 6 },
];
const NT_SNAGS = [{ wx: -200, u: 0.46, h: 420, seed: 21, birds: 3 }, { wx: 1500, u: 0.7, h: 360, seed: 22, birds: 2 }, { wx: 2300, u: 0.33, h: 380, seed: 23, birds: 2 }];
function ntSnag(P, S, t) {
  const [x, y, s] = ntAt(P, S.wx, S.u);
  if (y < P.yW || x < -300 || x > W + 300 || s < 0.05) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.scale(1, -1); ctx.globalAlpha = 0.25; nbBranch(ctx, 0, 0, S.h, S.seed, '#3A1420'); ctx.restore();   // its reflection
  const perches = nbBranch(ctx, 0, 0, S.h, S.seed, '#E3D3C0');
  const rng = mulberry32(S.seed + 5);
  for (let i = 0; i < S.birds && i < perches.length; i++) {
    const p = perches[Math.floor(rng() * perches.length)];
    ctx.drawImage(NB_SPR.s_stand, p[0] - 45 * 0.9, p[1] - 140 * 0.9 * 0.92, 90 * 0.9, 140 * 0.9);
  }
  ctx.restore();
}
// warm motes: salt dust and spray catching the low sun (screen space; a = how many)
let NT_MOTES = null;
function ntMotes(t, a = 1, cam = CAM0) {
  if (!NT_MOTES) { const rng = mulberry32(606); NT_MOTES = [...Array(90)].map(() => ({ x: rng(), y: rng(), z: 0.25 + rng() * 0.75, ph: rng() * 6.28, w: 0.5 + rng() })); }
  screenSpace();
  for (const m of NT_MOTES) {
    const par = (cam.x - 540) * m.z * 0.8 * (cam.zoom || 1);
    const x = ((m.x * (W + 200) - par + t * 18 * m.z + 22 * Math.sin(t * loopW(0.4 * m.w) + m.ph)) % (W + 200) + (W + 200)) % (W + 200) - 100;
    const y = ((m.y * H - t * 10 * m.z + 26 * Math.sin(t * loopW(0.3 * m.w) + m.ph * 2)) % H + H) % H;
    const tw = 0.5 + 0.5 * Math.sin(t * loopW(1.6 * m.w) + m.ph * 3);
    softDot(ctx, x, y, 2 + 5 * m.z, '#FFE3B0', 0.35 * a * tw * m.z);
    softDot(gctx, x, y, 6 + 9 * m.z, '#FFC870', 0.3 * a * tw * m.z);
  }
}
// heat shimmer: the band round the horizon wobbles (after the sky and the water are drawn)
function ntShimmer(P, t, k = 1) {
  if (k <= 0.01) return;
  const y0 = Math.max(0, Math.floor(P.yH - 60 * P.pc.zoom)), y1 = Math.min(H, Math.ceil(P.yH + 40 * P.pc.zoom));
  if (y1 <= y0) return;
  tmpx.setTransform(1, 0, 0, 1, 0, 0); tmpx.globalCompositeOperation = 'copy';
  tmpx.drawImage(mainC, 0, y0, W, y1 - y0, 0, y0, W, y1 - y0); tmpx.globalCompositeOperation = 'source-over';
  screenSpace();
  for (let y = y0; y < y1; y += 2) {
    const near = 1 - Math.abs(y - P.yH) / (60 * P.pc.zoom);
    ctx.drawImage(tmpC, 0, y, W, 2, 2.4 * k * near * Math.sin(y * 0.9 + t * loopW(9)), y, W, 2);
  }
}
// out-of-focus crust floating very close to the lens (drawn LAST: foreground); a = 0..1
const NT_FG = [[-120, 1.9, 260, 1], [640, 2.4, 200, 2], [1260, 2.1, 300, 3], [260, 3.0, 180, 4], [980, 2.8, 240, 5]];
function ntForeground(P, t, a = 1) {
  if (a <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.filter = `blur(${Math.round(10 + 4 * P.cam.zoom)}px)`;
  for (const [wx, u, r, sd] of NT_FG) {
    const [x, y, s] = ntAt(P, wx + 30 * Math.sin(t * loopW(0.25) + sd), u + 0.04 * Math.sin(t * loopW(0.6) + sd));
    if (y - 80 > H || x < -400 || x > W + 400) continue;
    const rng = mulberry32(sd * 31), rx = r * s, ry = rx * 0.32, n = 12;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const an = (i / n) * 6.283, kk = 0.75 + 0.35 * rng(); i ? ctx.lineTo(x + Math.cos(an) * rx * kk, y + Math.sin(an) * ry * kk) : ctx.moveTo(x + Math.cos(an) * rx * kk, y + Math.sin(an) * ry * kk); }
    ctx.closePath(); ctx.fillStyle = rgba('#F6D4CC', 0.85 * a); ctx.fill();
  }
  ctx.restore();
}
// all of it: the life behind the canoe (set). o: {flocks: [...], groups, snags}
function ntLife(P, t, o = {}) {
  screenSpace();
  if (o.snags !== false) for (const S of NT_SNAGS) ntSnag(P, S, t);
  if (o.groups !== false) for (const g of NT_GROUPS) nbGroup(P, g, t);
}
