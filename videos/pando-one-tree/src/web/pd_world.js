// This Whole Forest Is ONE Tree: the forest floor of Pando (Fishlake National Forest, Utah) and the same forest cut open.
// White quaking-aspen trunks with black eye-shaped scars (the running device: the trunks' eyes open), round leaves that
// quiver, a floor of grass and wildflowers, and under it one root network that every trunk grows from.
// World units: his feet on y = PD.gy, 1080 x 1920 at zoom 1. Depth layers through the world kit (wkLayers).
// Prefix pd / PD (this video's own).
'use strict';

const PD = { gy: 1560, hz: 1180 };
const PD_PAL = {
  sky1: '#3C9BE8', sky2: '#9FDBFF', sky3: '#DDF4FF',
  mtnFar: '#8FA6DB', mtnNear: '#6A86C6', fir: '#2F6B55',
  bark: '#F3F0E4', barkB: '#E6E3D2', base: '#3A3633', scar: '#2B2826', lent: '#6E6B62',
  leafG: ['#3E9C3A', '#58BC44', '#8AD95A'], leafY: ['#F2A818', '#FFD02E', '#FFE97E'],
  grassFar: '#8CC26F', grassMid: '#6DB34F', grass: '#4FA23A', grassDk: '#3A8A2E',
  soil1: '#8A5C3B', soil2: '#6A4229', soil3: '#4B2D1C', rock: '#9C8E80',
  root: '#B98A5A', rootSh: '#8E6440', rootLit: '#FFC24A', rootGlow: '#FF9A1A',
};
const pdLeafCol = (i, season) => mixH(PD_PAL.leafG[i], PD_PAL.leafY[i], clamp(season));

// ---------------------------------------------------------------- seeded geometry (built once)
const PDG = { groves: {}, hero: [], roots: [], rootlets: [], flowers: [], tufts: [], under: [] };
// the hero plane's trunks (world x); index 4 is the one he hugs
const PD_TRUNKS = [-1240, -880, -520, -170, 560, 940, 1300, 1660, 2020, 2380];
const PD_HUG = 4;
function initPando() {
  const R = mulberry32(4242);
  // grove layers: trunk positions per depth
  for (const p of [0.3, 0.5, 0.72]) {
    const arr = [], step = lerp(150, 330, (p - 0.3) / 0.42);
    for (let x = -1500; x < 2600; x += step * (0.75 + 0.5 * R())) {
      arr.push({ x, w: 1 + 0.25 * (R() - 0.5), seed: Math.floor(R() * 1e6), eye: 0.35 + 0.35 * R(), lean: (R() - 0.5) * 0.03 });
    }
    PDG.groves[p] = arr;
  }
  for (let i = 0; i < PD_TRUNKS.length; i++) {
    PDG.hero.push({ x: PD_TRUNKS[i], w: i === PD_HUG ? 1 : 0.92 + 0.18 * R(), seed: 1000 + i * 77, eye: i === PD_HUG ? 0.1 : 0.3 + 0.25 * R(), lean: i === PD_HUG ? 0 : (R() - 0.5) * 0.025 });
  }
  // flowers and grass tufts on the hero plane's floor (lupine spikes, paintbrush, yellow daisies)
  for (let i = 0; i < 150; i++) { const y = PD.gy - 8 + Math.pow(R(), 1.6) * 760; PDG.flowers.push({ x: -1400 + R() * 4000, y, kind: Math.floor(R() * 3), s: (0.7 + 0.6 * R()) * (1 + (y - PD.gy) / 380), ph: R() * 6 }); }
  for (let i = 0; i < 260; i++) { const y = PD.gy + Math.pow(R(), 1.4) * 800; PDG.tufts.push({ x: -1400 + R() * 4000, y, s: (0.6 + 0.8 * R()) * (1 + (y - PD.gy) / 300), ph: R() * 6 }); }
  PDG.flowers.sort((u, v) => u.y - v.y); PDG.tufts.sort((u, v) => u.y - v.y);
  for (let i = 0; i < 70; i++) { const y = PD.gy + 10 + Math.pow(R(), 1.3) * 760; PDG.under.push({ leaf: true, x: -1400 + R() * 4000, y, r: 9 * (1 + (y - PD.gy) / 300), rot: R() * 3, col: R() < 0.5 ? '#8FBF55' : '#C9B062' }); }
  // the root network: one main root, a root down from every trunk, branches, rootlets
  const main = [];
  for (let x = -1500; x <= 2700; x += 60) main.push([x, PD.gy + 175 + 36 * Math.sin(x * 0.0042) + 18 * Math.sin(x * 0.011 + 1)]);
  PDG.roots.push({ pts: main, w: 34, d0: 0 });
  const mainY = (x) => PD.gy + 175 + 36 * Math.sin(x * 0.0042) + 18 * Math.sin(x * 0.011 + 1);
  for (const tx of PD_TRUNKS) {
    for (const side of [-1, 1]) {
      const pts = [], ex = tx + side * (70 + 60 * R());
      for (let k = 0; k <= 8; k++) {
        const u = k / 8, x = lerp(tx + side * 30, ex, u), y = lerp(PD.gy + 10, mainY(ex), E.inOutSine(u));
        pts.push([x, y]);
      }
      PDG.roots.push({ pts, w: 24, trunk: tx });
    }
    // a deeper branch and rootlets
    const bx = tx + (R() - 0.5) * 300, pts = [];
    for (let k = 0; k <= 7; k++) { const u = k / 7; pts.push([lerp(bx, bx + (R() - 0.5) * 260, u), lerp(mainY(bx), mainY(bx) + 150 + 80 * R(), u)]); }
    PDG.roots.push({ pts, w: 14 });
  }
  for (let i = 0; i < 90; i++) {
    const x = -1400 + R() * 4000, y0 = mainY(x), pts = [[x, y0]];
    let a = Math.PI / 2 + (R() - 0.5) * 1.6, px = x, py = y0;
    for (let k = 0; k < 6; k++) { px += Math.cos(a) * 30; py += Math.sin(a) * 30; a += (R() - 0.5) * 0.45; pts.push([px, py]); }
    PDG.rootlets.push({ pts, w: 4 + 3 * R() });
  }
  // pebbles and stones in the soil
  for (let i = 0; i < 80; i++) PDG.under.push({ x: -1400 + R() * 4000, y: PD.gy + 60 + R() * 700, r: 6 + 16 * R(), rot: R() * 3, col: R() < 0.5 ? '#A89A8B' : '#8D7F72' });
  // distances along each root from the hero's feet (for the light that runs out along them)
  for (const r of PDG.roots) r.dist = r.pts.map((p) => Math.abs(p[0] - PD_TRUNKS[PD_HUG]) + 0.6 * Math.abs(p[1] - PD.gy));
  for (const r of PDG.rootlets) r.dist = r.pts.map((p) => Math.abs(p[0] - PD_TRUNKS[PD_HUG]) + 0.6 * Math.abs(p[1] - PD.gy));
  pdInitLand();
}

// ---------------------------------------------------------------- the sky and the far mountains (screen space + a far layer)
function pdSky(cam, t, o = {}) {
  screenSpace();
  const hy = wkHorizon(cam, 0.1, { hz: PD.hz, dy: o.dy || 0 });
  const g = ctx.createLinearGradient(0, 0, 0, Math.max(200, hy));
  const warm = o.season || 0;
  g.addColorStop(0, mixH(PD_PAL.sky1, '#4F8FDB', warm * 0.3)); g.addColorStop(0.65, mixH(PD_PAL.sky2, '#FFD9A0', warm * 0.35));
  g.addColorStop(1, mixH(PD_PAL.sky3, '#FFE8C2', warm * 0.5));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // soft clouds, loop-safe drift
  const w = loopW(0.02);
  for (let i = 0; i < 4; i++) {
    const x = ((i * 397 + 60 * Math.sin(t * w + i)) % 1500) - 200, y = 160 + i * 120 + 0.12 * (hy - 900);
    for (let j = 0; j < 5; j++) ellipse(ctx, x + j * 70 - 140, y - (j % 2) * 26, 90 - Math.abs(j - 2) * 14, 46, 'rgba(255,255,255,0.92)');
  }
  return hy;
}
function pdMountains(c2, o = {}) {
  const base = PD.hz + 20;
  for (const [col, amp, off, f] of [[PD_PAL.mtnFar, 260, 0, 0.0021], [PD_PAL.mtnNear, 170, 900, 0.0033]]) {
    ctx.fillStyle = mixH(col, '#C9A0C8', 0.15 * (o.season || 0));
    ctx.beginPath(); ctx.moveTo(-1600, base + 400);
    for (let x = -1600; x <= 2700; x += 40) ctx.lineTo(x, base - amp * (0.55 + 0.45 * Math.sin(x * f + off)) - 40 * Math.sin(x * f * 3.1 + off));
    ctx.lineTo(2700, base + 400); ctx.closePath(); ctx.fill();
  }
  // a band of dark firs along the foot of the near range
  ctx.fillStyle = PD_PAL.fir;
  for (let x = -1600; x <= 2700; x += 34) {
    const h = 50 + 30 * hash(x * 0.37);
    ctx.beginPath(); ctx.moveTo(x - 20, base + 30); ctx.lineTo(x, base + 30 - h); ctx.lineTo(x + 20, base + 30); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = mixH(PD_PAL.grassFar, '#C8B060', 0.3 * (o.season || 0)); ctx.fillRect(-1600, base + 28, 4300, 500);
}

// ---------------------------------------------------------------- an aspen trunk
// tr = {x, w, seed, eye, lean}; by = its base (world y); s = its scale (1 = the hero plane, 112 wide); o.eyes: 0..1 open,
// o.look: [lx, ly] (-1..1), o.blush, o.mood ('love' | 'flat' | 'peek'); o.top: the world y where it leaves the frame
function pdTrunk(c, tr, by, s, t, o = {}) {
  const w = 112 * s * tr.w, top = o.top !== undefined ? o.top : by - 3200 * s, x = tr.x, lean = tr.lean || 0;
  const xa = (y) => x + (by - y) * lean;
  const R = mulberry32(tr.seed);
  // the body: a little taper, a slight wobble at the edges
  c.fillStyle = o.bark || PD_PAL.bark;
  c.beginPath();
  const n = 12;
  for (let k = 0; k <= n; k++) { const y = lerp(by, top, k / n), ww = w * lerp(0.5, 0.42, k / n) * (1 + 0.025 * Math.sin(k * 2.3 + tr.seed)); c.lineTo(xa(y) - ww, y); }
  for (let k = n; k >= 0; k--) { const y = lerp(by, top, k / n), ww = w * lerp(0.5, 0.42, k / n) * (1 + 0.025 * Math.cos(k * 1.7 + tr.seed)); c.lineTo(xa(y) + ww, y); }
  c.closePath(); c.fill();
  // the dark, rough base
  c.fillStyle = PD_PAL.base;
  c.beginPath(); c.moveTo(xa(by) - w * 0.56, by + 6 * s);
  const bh = 150 * s;
  for (let k = 0; k <= 8; k++) { const u = k / 8; c.lineTo(xa(by) - w * 0.56 + w * 1.12 * u, by - bh * (0.55 + 0.45 * Math.abs(Math.sin(u * 7 + tr.seed))) ); }
  c.lineTo(xa(by) + w * 0.56, by + 6 * s); c.closePath(); c.fill();
  // lenticels: short dark dashes across the bark
  if (s > 0.25) {
    c.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const y = lerp(by - bh, Math.max(top, by - 1500 * s), R()), ww = w * (0.08 + 0.12 * R()), xx = xa(y) + (R() - 0.5) * w * 0.6;
      line(c, xx - ww, y, xx + ww, y + (R() - 0.5) * 2, Math.max(1.5, 4 * s), PD_PAL.lent);
    }
  }
  // the eye scars (one or two), which can open: returns their world positions
  const eyes = [];
  const ys = [by - (tr.eye * 1400 + 420) * s];
  if (tr.seed % 3 === 0) ys.push(by - (tr.eye * 900 + 1100) * s);
  for (const ey of ys) {
    if (ey < top + 30) continue;
    const ex = xa(ey) + (R() - 0.5) * w * 0.1;
    eyes.push([ex, ey]);
    pdEye(c, ex, ey, w * 0.36, t, o, tr.seed);
  }
  return eyes;
}
// an aspen "eye": a dark almond scar with a chevron brow above; open > 0 shows the white and a pupil
function pdEye(c, x, y, s, t, o = {}, seed = 0) {
  const open = clamp(o.eyes || 0), look = o.look || [0, 0];
  paint(() => {
    // the brow: a dark chevron
    c.fillStyle = PD_PAL.scar;
    c.beginPath(); c.moveTo(x - s * 1.25, y - s * 0.25); c.quadraticCurveTo(x, y - s * 1.05 - (o.mood === 'love' ? 0.2 * s * open : 0), x + s * 1.25, y - s * 0.25);
    c.quadraticCurveTo(x, y - s * 0.72, x - s * 1.25, y - s * 0.25); c.fill();
    // the almond
    const ry = s * lerp(0.2, o.mood === 'flat' ? 0.34 : 0.55, open);
    c.beginPath(); c.ellipse(x, y + s * 0.05, s, Math.max(1, ry + s * 0.08), 0, 0, Math.PI * 2); c.fill();
    if (open > 0.02) {
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.ellipse(x, y + s * 0.05, s * 0.8, Math.max(0.5, ry * 0.92), 0, 0, Math.PI * 2); c.fill();
      const pr = s * 0.36 * Math.min(1, open * 1.6);
      const px = x + look[0] * s * 0.4, py = y + s * 0.05 + look[1] * ry * 0.45;
      c.fillStyle = '#1B1A26'; c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(px - pr * 0.35, py - pr * 0.35, pr * 0.3, 0, Math.PI * 2); c.fill();
      if (o.mood === 'flat') {   // a heavy upper lid: unimpressed
        c.fillStyle = PD_PAL.bark; c.fillRect(x - s * 0.85, y - ry - s * 0.1, s * 1.7, ry * 0.95);
        c.fillStyle = PD_PAL.scar; c.fillRect(x - s * 0.85, y - s * 0.02 - ry * 0.12, s * 1.7, Math.max(2, s * 0.12));
      }
    }
    if ((o.blush || 0) > 0.01) {
      c.fillStyle = rgba('#FF7FA0', 0.55 * clamp(o.blush));
      ellipse(c, x - s * 0.95, y + s * 0.75, s * 0.42, s * 0.2, rgba('#FF7FA0', 0.6 * clamp(o.blush)));
      ellipse(c, x + s * 0.95, y + s * 0.75, s * 0.42, s * 0.2, rgba('#FF7FA0', 0.6 * clamp(o.blush)));
    }
  });
}

// ---------------------------------------------------------------- leaves
// a round crown made of quivering leaves (quaking aspen: the flat leaf stalks flutter in the slightest breeze)
function pdCrown(c, x, y, r, seed, t, season, o = {}) {
  const R = mulberry32(seed);
  const n = o.n || 22;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.8, ci = Math.floor(R() * 3);
    const bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * 0.75, br = r * (0.28 + 0.18 * R());
    ellipse(c, bx, by, br, br * 0.88, pdLeafCol(Math.min(2, ci + (by < y ? 1 : 0)), season));
  }
  // single leaves at the rim, flipping (silver backs) on loop-safe clocks
  const w = loopW(9);
  for (let i = 0; i < (o.leaves || 14); i++) {
    const a = R() * Math.PI * 2, lx = x + Math.cos(a) * r * 0.95, ly = y + Math.sin(a) * r * 0.7, ph = R() * 6;
    const fl = Math.sin(t * w + ph);
    ellipse(c, lx, ly, r * 0.09, r * 0.09 * (0.35 + 0.65 * Math.abs(fl)), fl > 0 ? pdLeafCol(2, season) : mixH('#D8E8C0', '#FFF2B8', season), a);
  }
}

// ---------------------------------------------------------------- the ground of a layer
function pdGround(c, base, p, o = {}) {
  const col = mixH(p < 0.4 ? PD_PAL.grassFar : p < 0.8 ? PD_PAL.grassMid : PD_PAL.grass, '#C9B25A', 0.35 * (o.season || 0));
  if (p >= 1) {
    const g = c.createLinearGradient(0, base, 0, base + 900);
    g.addColorStop(0, mixH('#62B847', '#C9B25A', 0.35 * (o.season || 0))); g.addColorStop(1, mixH('#3A8A2E', '#9A8A3A', 0.35 * (o.season || 0)));
    c.fillStyle = g;
  } else c.fillStyle = col;
  c.fillRect(-2000, base - 4, 5200, 3200);
  c.fillStyle = col;
  // a soft wavy top edge so the floor is not a ruler line
  c.beginPath(); c.moveTo(-2000, base + 10);
  for (let x = -2000; x <= 3200; x += 60) c.lineTo(x, base - 6 - 8 * Math.sin(x * 0.02 + p * 9));
  c.lineTo(3200, base + 10); c.closePath(); c.fill();
}

// ---------------------------------------------------------------- a grove layer (far trunks with crowns)
function pdGrove(c2, p, t, o = {}) {
  const base = PD.hz + (PD.gy - PD.hz) * p, s = 0.3 + 0.62 * p;
  pdGround(ctx, base, p, o);
  const arr = PDG.groves[p];
  // crowns behind, then trunks
  const crownY = base - 1650 * s;
  for (const tr of arr) pdCrown(ctx, tr.x + 30 * Math.sin(tr.seed), crownY + 80 * Math.sin(tr.seed * 0.7), 300 * s, tr.seed, t, o.season || 0, { n: 12, leaves: 6 });
  const eyesOut = [];
  for (const tr of arr) {
    const e = pdTrunk(ctx, tr, base, s * tr.w, t, { top: crownY + 40, eyes: o.eyesFar || 0, look: o.lookFor ? o.lookFor(tr.x, base) : [0, 0], blush: o.blush || 0, mood: o.mood });
    eyesOut.push(...e);
  }
  // a haze over the farther layers
  if (p < 0.6) { ctx.fillStyle = rgba('#DDEFFF', 0.28 * (1 - p)); ctx.fillRect(-2000, crownY - 600, 5200, base - crownY + 700); }
  return eyesOut;
}

// ---------------------------------------------------------------- the floor of his plane: grass, flowers, sun dapples
function pdFloor(t, o = {}) {
  const w = loopW(3);
  const yMax = (o.cut || 0) > 0.01 ? PD.gy + 14 : 1e9;   // in the cutaway only the surface keeps its plants
  for (const f of PDG.flowers) {
    if (f.y > yMax) continue;
    const sway = 4 * Math.sin(t * w + f.ph);
    if (f.kind === 0) {        // lupine: a purple spike
      line(ctx, f.x, f.y, f.x + sway, f.y - 70 * f.s, 5 * f.s, '#3D8C35');
      for (let k = 0; k < 6; k++) ellipse(ctx, f.x + sway * (1 - k / 8), f.y - 30 * f.s - k * 9 * f.s, 9 * f.s * (1 - k / 9), 6 * f.s, k % 2 ? '#8A6BE0' : '#A98AF2');
    } else if (f.kind === 1) { // paintbrush: red
      line(ctx, f.x, f.y, f.x + sway, f.y - 56 * f.s, 5 * f.s, '#3D8C35');
      ellipse(ctx, f.x + sway, f.y - 60 * f.s, 11 * f.s, 16 * f.s, '#E8443A');
    } else {                   // a yellow daisy
      line(ctx, f.x, f.y, f.x + sway, f.y - 46 * f.s, 4 * f.s, '#3D8C35');
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ellipse(ctx, f.x + sway + Math.cos(a) * 8 * f.s, f.y - 48 * f.s + Math.sin(a) * 8 * f.s, 7 * f.s, 4 * f.s, '#FFD447', a); }
      circle(ctx, f.x + sway, f.y - 48 * f.s, 5 * f.s, '#C07A1A');
    }
  }
  for (const g of PDG.tufts) {
    if (g.y > yMax) continue;
    const sway = 3 * Math.sin(t * w + g.ph);
    for (let k = -2; k <= 2; k++) line(ctx, g.x + k * 5 * g.s, g.y, g.x + k * 9 * g.s + sway, g.y - (26 + 6 * (2 - Math.abs(k))) * g.s, 4 * g.s, k % 2 ? PD_PAL.grassDk : '#5DB042');
  }
  // leaves and pebbles lying on the floor
  for (const l of PDG.under) if (l.leaf && l.y <= yMax) ellipse(ctx, l.x, l.y, l.r, l.r * 0.55, (o.season || 0) > 0.5 ? PD_PAL.leafY[Math.floor(l.r) % 3] : l.col, l.rot);
  // fallen leaves when it is autumn
  if ((o.season || 0) > 0.05) {
    for (let i = 0; i < 60; i++) ellipse(ctx, -1400 + hash(i * 3.1) * 4000, PD.gy + 6 + hash(i * 7.7) * 90, 10, 6, rgba(PD_PAL.leafY[i % 3], clamp(o.season)), hash(i) * 3);
  }
}
// the dressing of his place: his backpack against a trunk, a trail sign, a fallen log with mushrooms
function pdDress(t, o = {}) {
  // the trail sign (Fishlake brown with cream letters)
  const sx = -60, sy = PD.gy;
  ctx.fillStyle = '#6B4425'; ctx.fillRect(sx - 9, sy - 300, 18, 300);
  ctx.fillStyle = '#7A4E2A'; rrect(ctx, sx - 130, sy - 330, 260, 96, 12); ctx.fill();
  paint(() => {
    ctx.fillStyle = '#F4E6C2'; ctx.font = '400 54px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('PANDO', sx, sy - 296);
    ctx.font = '700 22px Montserrat'; ctx.fillText('FISHLAKE N.F.', sx, sy - 256);
  });
  // his backpack, leaning on the trunk to the right of his tree
  const bx = 1180, by = PD.gy;
  ctx.fillStyle = '#E0483C'; rrect(ctx, bx - 52, by - 150, 104, 150, 30); ctx.fill();
  ctx.fillStyle = '#B23128'; rrect(ctx, bx - 40, by - 84, 80, 60, 14); ctx.fill();
  ctx.fillStyle = '#1CB3A4'; ctx.fillRect(bx - 50, by - 120, 100, 10);
  ctx.fillStyle = '#4A88D8'; rrect(ctx, bx + 40, by - 118, 30, 80, 12); ctx.fill();   // a water bottle
  // a fallen log with mushrooms, to the left
  const lx = -330, ly = PD.gy + 20;
  ctx.fillStyle = '#8A6A4A'; rrect(ctx, lx - 230, ly - 70, 420, 76, 36); ctx.fill();
  ctx.fillStyle = '#C9A57E'; ellipse(ctx, lx + 186, ly - 32, 20, 36, '#C9A57E');
  for (const [mx, ms] of [[-120, 1], [-60, 0.7], [40, 0.85]]) {
    ctx.fillStyle = '#F2E6D2'; ctx.fillRect(lx + mx - 5 * ms, ly - 92 * ms, 10 * ms, 30 * ms);
    ellipse(ctx, lx + mx, ly - 92 * ms, 24 * ms, 14 * ms, '#E8543E');
    paint(() => { circle(ctx, lx + mx - 8 * ms, ly - 96 * ms, 3.5 * ms, '#FFF4E0'); circle(ctx, lx + mx + 7 * ms, ly - 92 * ms, 3 * ms, '#FFF4E0'); });
  }
}

// ---------------------------------------------------------------- the cut: the soil as a cross-section and the roots
// o.cut 0..1 (how far the cut has opened out from under him), o.glowT (seconds since the light started running out along
// the roots, < 0 none), o.sprout {x, k} a new sucker rising from the main root
function pdCut(t, o = {}) {
  const k = clamp(o.cut || 0);
  if (k <= 0.001) return;
  const cx = o.cutX !== undefined ? o.cutX : PD_TRUNKS[PD_HUG], half = (o.cutHalf || 4000) * E.outCubic(k), x0 = cx - half, x1 = cx + half;
  // the soil, in layers (opaque shapes, no clip)
  const layers = [[PD.gy + 4, PD_PAL.soil1], [PD.gy + 330, PD_PAL.soil2], [PD.gy + 720, PD_PAL.soil3]];
  for (const [y, col] of layers) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x0, 4000);
    for (let x = x0; x <= x1; x += 80) ctx.lineTo(x, y + 14 * Math.sin(x * 0.013 + y));
    ctx.lineTo(x1, 4000); ctx.closePath(); ctx.fill();
  }
  // the grass edge on the cut's top
  ctx.fillStyle = PD_PAL.grassDk; ctx.fillRect(x0, PD.gy - 4, x1 - x0, 22);
  for (const s of PDG.under) if (!s.leaf && s.x > x0 && s.x < x1) ellipse(ctx, s.x, s.y, s.r, s.r * 0.7, s.col, s.rot);
  // the roots: drawn dark, then lit where the light has reached
  const lit = (o.glowT !== undefined && o.glowT >= 0) ? o.glowT * 2600 : -1;
  const drawRoot = (r, w0) => {
    const P = r.pts.filter((p) => p[0] > x0 && p[0] < x1);
    if (P.length < 2) return;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = PD_PAL.rootSh; ctx.lineWidth = w0 + 6; smoothPath(ctx, P); ctx.stroke();
    ctx.strokeStyle = PD_PAL.root; ctx.lineWidth = w0; ctx.stroke();
    if (lit > 0) {
      // the lit part: every segment whose distance from his feet is under `lit`
      const Q = [];
      for (let i = 0; i < r.pts.length; i++) {
        const p = r.pts[i];
        if (p[0] < x0 || p[0] > x1 || r.dist[i] > lit) { if (Q.length > 1) break; Q.length = 0; continue; }
        Q.push(p);
      }
      if (Q.length > 1) {
        ctx.strokeStyle = PD_PAL.rootLit; ctx.lineWidth = w0 * 0.62; smoothPath(ctx, Q); ctx.stroke();
        gctx.strokeStyle = rgba(PD_PAL.rootGlow, 0.5); gctx.lineWidth = w0 * 1.25; gctx.lineJoin = 'round'; gctx.lineCap = 'round'; smoothPath(gctx, Q); gctx.stroke();
        // the light's front: a bright bead where it is running now
        const d0 = lit - 300;
        for (let i = 1; i < r.pts.length; i++) if (r.dist[i - 1] <= d0 + 300 && r.dist[i] > d0 && r.dist[i] <= lit && r.pts[i][0] > x0 && r.pts[i][0] < x1) { circle(ctx, r.pts[i][0], r.pts[i][1], w0 * 0.5, '#FFF8D8'); softDot(gctx, r.pts[i][0], r.pts[i][1], w0 * 3, '#FFE9A0', 0.9); }
      }
    }
  };
  for (const r of PDG.rootlets) drawRoot(r, r.w);
  for (const r of PDG.roots) drawRoot(r, r.w);
  // a pulse that keeps running along the main root once it is lit (loop-safe enough: only inside these shots)
  if (lit > 2600) {
    const main = PDG.roots[0].pts;
    for (let j = 0; j < 6; j++) {
      const u = ((t * 0.35 + j / 6) % 1), i = Math.floor(u * (main.length - 1)), p = main[i];
      if (p[0] > x0 && p[0] < x1) { circle(ctx, p[0], p[1], 14, '#FFF3C0'); softDot(gctx, p[0], p[1], 60, '#FFD060', 0.8); }
    }
  }
  // a sucker rising from the root to the surface: o.sprout = {x, k (0..1 to the surface, then up)}
  if (o.sprout && o.sprout.k > 0) {
    const sx = o.sprout.x, y0 = PD.gy + 175 + 36 * Math.sin(sx * 0.0042) + 18 * Math.sin(sx * 0.011 + 1);
    const ty = lerp(y0, PD.gy, clamp(o.sprout.k));
    line(ctx, sx, y0, sx + 6 * Math.sin(o.sprout.k * 5), ty, 16, PD_PAL.rootLit);
    line(gctx, sx, y0, sx, ty, 40, rgba(PD_PAL.rootGlow, 0.7));
    if (o.sprout.k < 1) { ellipse(ctx, sx, ty, 14, 20, '#7ED957'); }
  }
}

// ---------------------------------------------------------------- the whole forest floor
// o: {dy (low/high camera), season, eyesFar, eyes (hero plane, 0..1 or fn(i)), look, lookFor(x, y), blush, mood, cut,
//     glowT, sprout, hug (draw him hugging), hero(cam) (draws him), noDress, trunkHide: [indices]}
function pdForest(cam, t, o = {}) {
  const lo = { hz: PD.hz, dy: o.dy || 0 };
  pdSky(cam, t, o);
  wkLayers(cam, lo, [
    [0.1, () => pdMountains(null, o)],
    [0.3, (c2, p) => pdGrove(c2, p, t, o)],
    [0.5, (c2, p) => pdGrove(c2, p, t, o)],
    [0.72, (c2, p) => pdGrove(c2, p, t, o)],
  ]);
  applyCam(cam);
  pdGround(ctx, PD.gy, 1, o);
  // sun dapples on the floor (the glow layer)
  const wd = loopW(0.6);
  for (let i = 0; i < 14; i++) {
    const x = -900 + i * 260 + 40 * Math.sin(t * wd + i), y = PD.gy + 20 + (i % 3) * 30;
    ellipse(ctx, x, y, 90, 16, rgba('#FFF6B0', 0.25));
  }
  // the cut (under the floor) comes before the trunks, so the trunks stand on it
  pdCut(t, o);
  if (!o.noDress) pdDress(t, o);
  const eyes = [];
  for (let i = 0; i < PDG.hero.length; i++) {
    if (o.trunkHide && o.trunkHide.includes(i)) continue;
    if (i === PD_HUG && o.hugTrunkInLayer) continue;   // drawn in his layer, in front of him
    const tr = PDG.hero[i];
    const e = pdTrunk(ctx, tr, PD.gy, 1, t, { top: -3000, eyes: typeof o.eyes === 'function' ? o.eyes(i) : (o.eyes || 0),
      look: o.lookFor ? o.lookFor(tr.x, PD.gy - 700) : (o.look || [0, 0]), blush: o.blush || 0, mood: o.mood });
    eyes.push(...e);
  }
  pdFloor(t, o);
  let Hr = null;
  if (o.hero) { applyCam(cam); Hr = o.hero(cam); applyCam(cam); }
  if (o.after) { o.after(cam); applyCam(cam); }
  return { eyes, Hr };
}

// ---------------------------------------------------------------- a foreground of aspen leaves for the cinema kit
// In this Short the kit's "leaves-tr" / "leaves-tl" draw aspen leaves: a twig with round, heart-shaped leaves hanging in
// from a top corner, out of focus, quivering (the kit's own leaves are long and pointed, like a palm's, wrong for Pando);
// {col, lit} as for the kit's leaves (gold in autumn: col '#8A5A10', lit '#E0A020')
(function () {
  const old = window.cinFgShapes;
  window.cinFgShapes = function (x, kind, side, col, t, P) {
    if (kind !== 'leaves') return old(x, kind, side, col, t, P);
    const sx = side === 'tl' ? -1 : 1, ox = side === 'tl' ? -20 : W + 20, oy = 250;
    const R = (i) => hash(i * 12.9898 + 41.7);
    x.save(); x.translate(ox, oy); x.scale(sx, 1); x.rotate(0.04 * Math.sin(t * cinLoopW(0.7)));
    x.lineCap = 'round'; x.strokeStyle = '#3A3020'; x.lineWidth = 12;
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-140, 30, -300, 150); x.stroke();
    x.lineWidth = 7; x.beginPath(); x.moveTo(-120, 34); x.quadraticCurveTo(-170, 120, -150, 230); x.stroke();
    const base = x.fillStyle;
    for (let i = 0; i < 26; i++) {
      const u = R(i), lx = -20 - 300 * u, ly = 20 + 160 * u * u + 110 * (R(i + 30) - 0.3);
      const fl = Math.sin(t * cinLoopW(7 + 3 * R(i + 3)) + 6 * R(i + 4));   // quaking: the flat stalks flip the leaves
      const L = 46 + 22 * R(i + 6);
      x.save(); x.translate(lx, ly); x.rotate(-0.5 + R(i + 60)); x.scale(1, 0.35 + 0.65 * Math.abs(fl));
      x.fillStyle = (fl > 0.55 || R(i + 90) < 0.25) ? (P && P.lit) || '#4E8A38' : base;
      x.beginPath(); x.moveTo(0, -L * 0.1); x.bezierCurveTo(L * 0.7, -L * 0.45, L * 0.75, L * 0.55, 0, L * 0.85);
      x.bezierCurveTo(-L * 0.75, L * 0.55, -L * 0.7, -L * 0.45, 0, -L * 0.1); x.fill();
      x.restore();
    }
    x.restore();
  };
})();
