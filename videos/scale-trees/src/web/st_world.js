// The coal swamp, about 300 million years ago (the Carboniferous), for "The Tree That Wore SNAKESKIN": scale trees
// (Lepidodendron) 40 m tall whose bark is a lattice of diamond leaf cushions, standing in black water under layers of haze.
// One perspective camera for every layer: a layer at depth dz is drawn at scale 1 / (1 / zoom + dz) about the same point,
// so a crane up the trunk or a pull back to the whole tree moves the far forest less (stLayerCam). World units: the hiker is
// 560 tall (1.8 m), so a metre is 311 units and the big tree is 12,440 tall.
'use strict';

const ST = { gy: 1560, m: 311 };
ST.treeH = 40 * ST.m;
const BT = { x: 880, by: ST.gy, half: 190 };          // the big tree he touches (its trunk's left edge is by his hand)
BT.trunk = 0.74 * ST.treeH; BT.top = BT.by - BT.trunk;   // the trunk's top (the crown takes it to 40 m)
const POLE = { x: 300, by: ST.gy, h: 820 };            // a young scale tree beside him: an unbranched pole, leafy above

// colours of the place
const STC = {
  bark: '#4E4A2E', barkDk: '#221E10', cush: '#8E8650', cushHi: '#B4AA6A', cushRim: '#5A5430', scar: '#2E2A16', scarDot: '#14120A',
  leaf: '#5E9A3C', leafDk: '#3F7330', leafHi: '#86BF52', cone: '#8A6A3A',
  water: '#1C2A22', waterHi: '#5E7A5A', mud: '#3A3122', mudHi: '#5A4C34', root: '#5A5232',
  haze: '#BFD0A0', hazeHi: '#E8E6B8', sky: '#9CC7C0', skyTop: '#6EA6BC', canopy: '#3E6A55',
  fern: '#4C8A3A', fernDk: '#2E5E2A', horse: '#6E8A46',
};

// ---------------------------------------------------------------- the camera of a layer
function stLayerCam(cam, dz) {
  if (!dz) return cam;
  const inv0 = 1 / cam.zoom + dz;
  const z = 1 / Math.max(0.03, inv0);
  return { x: cam.x, y: cam.y, zoom: z, rot: cam.rot || 0, sx: cam.sx, sy: cam.sy };
}
// what part of the world a camera sees (with a margin)
function stView(cam, m = 0.15) {
  const hw = (W / 2) / cam.zoom * (1 + m), hh = (H / 2) / cam.zoom * (1 + m);
  return { x0: cam.x - hw, x1: cam.x + hw, y0: cam.y - hh, y1: cam.y + hh };
}
const stHazeK = (dz) => 1 - Math.exp(-dz * 0.85);

// ---------------------------------------------------------------- the forest's layout (initStWorld)
let ST_LAYERS = [], ST_BARK_TILE = null, ST_PAT = null, ST_FERNS = [], ST_HORSE = [];
function initStWorld() {
  const mk = (dz, n, x0, x1, seed, hMin, hMax, kind) => {
    const r = mulberry32(seed), trees = [];
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + 0.5 + 0.6 * (r() - 0.5)) / n);
      const h = lerp(hMin, hMax, r());
      trees.push({ x, h, half: lerp(110, 180, r()) * (h / ST.treeH), seed: Math.floor(r() * 1e6), kind: r() < kind ? 'sig' : 'lep', fall: -1, lean: (r() - 0.5) * 0.03 });
    }
    return { dz, trees };
  };
  ST_LAYERS = [
    mk(3.4, 26, -9000, 10000, 11, 0.78 * ST.treeH, 1.0 * ST.treeH, 0.3),
    mk(1.6, 15, -6500, 7500, 22, 0.8 * ST.treeH, 1.0 * ST.treeH, 0.25),
    mk(0.62, 9, -4200, 5600, 33, 0.82 * ST.treeH, 1.0 * ST.treeH, 0.2),
  ];
  // keep the near layer's trunks off the hero's spot (x 380-1100 at that depth would sit right behind him)
  ST_LAYERS[2].trees = ST_LAYERS[2].trees.filter((tr) => Math.abs(tr.x - 700) > 900);
  // the bark as a tile: two columns and two rows of leaf cushions, at 4 px a unit (used where a cushion is small on screen)
  const tw = 2 * 40, th = 2 * 64, S = 4;
  ST_BARK_TILE = mkCanvas(tw * S, th * S);
  const c = ST_BARK_TILE.getContext('2d');
  c.scale(S, S);
  c.fillStyle = STC.barkDk; c.fillRect(0, 0, tw, th);
  for (const [cx, cy] of [[0, 0], [40, 0], [80, 0], [20, 32], [60, 32], [0, 64], [40, 64], [80, 64], [20, 96], [60, 96], [0, 128], [40, 128], [80, 128]]) {
    stCushion(c, cx, cy, 36, 58, 1, false);
  }
  ST_PAT = null;
  // ferns and horsetails on the bank (world units, the hero's plane)
  const r = mulberry32(404);
  ST_FERNS = [];
  for (let i = 0; i < 14; i++) ST_FERNS.push({ x: lerp(-700, 1900, r()), y: ST.gy + 30 + 260 * r(), s: 0.7 + 0.7 * r(), seed: Math.floor(r() * 1e5) });
  ST_FERNS.sort((a, b) => a.y - b.y);
  ST_HORSE = [];
  for (let i = 0; i < 7; i++) ST_HORSE.push({ x: lerp(-1600, 2600, r()), h: lerp(1600, 3400, r()), seed: Math.floor(r() * 1e5) });
}

// ---------------------------------------------------------------- one leaf cushion (a diamond) at (x, y), w x h units
// k: 0..1 how much of it faces us (1 = straight on); scarLit: a freshly bared scar (the plucked leaf)
function stCushion(c, x, y, w, h, k, scarLit) {
  const hw = 0.5 * w * k, hh = 0.5 * h;
  c.beginPath(); c.moveTo(x, y - hh); c.quadraticCurveTo(x + hw * 0.9, y - hh * 0.35, x + hw, y); c.quadraticCurveTo(x + hw * 0.9, y + hh * 0.35, x, y + hh);
  c.quadraticCurveTo(x - hw * 0.9, y + hh * 0.35, x - hw, y); c.quadraticCurveTo(x - hw * 0.9, y - hh * 0.35, x, y - hh); c.closePath();
  c.fillStyle = STC.cushRim; c.fill();
  c.save(); c.translate(x, y); c.scale(0.86, 0.88); c.translate(-x, -y);
  c.beginPath(); c.moveTo(x, y - hh); c.quadraticCurveTo(x + hw * 0.9, y - hh * 0.35, x + hw, y); c.quadraticCurveTo(x + hw * 0.9, y + hh * 0.35, x, y + hh);
  c.quadraticCurveTo(x - hw * 0.9, y + hh * 0.35, x - hw, y); c.quadraticCurveTo(x - hw * 0.9, y - hh * 0.35, x, y - hh); c.closePath();
  c.fillStyle = STC.cush; c.fill(); c.restore();
  // a lighter middle ridge (the cushion bulges), and the leaf scar near its top: a small diamond with two dots
  c.beginPath(); c.moveTo(x, y - hh * 0.8); c.lineTo(x + hw * 0.32, y - hh * 0.05); c.lineTo(x, y + hh * 0.72); c.lineTo(x - hw * 0.32, y - hh * 0.05); c.closePath();
  c.fillStyle = STC.cushHi; c.fill();
  const sy = y - hh * 0.28, sw = hw * 0.42, sh = hh * 0.2;
  c.beginPath(); c.moveTo(x, sy - sh); c.lineTo(x + sw, sy); c.lineTo(x, sy + sh); c.lineTo(x - sw, sy); c.closePath();
  c.fillStyle = scarLit ? '#B9E07A' : STC.scar; c.fill();
  if (k > 0.45) {
    c.fillStyle = scarLit ? '#6E9A3A' : STC.scarDot;
    c.beginPath(); c.arc(x - sw * 0.35, sy + sh * 0.05, Math.max(0.6, sw * 0.12), 0, 7); c.fill();
    c.beginPath(); c.arc(x + sw * 0.35, sy + sh * 0.05, Math.max(0.6, sw * 0.12), 0, 7); c.fill();
  }
}

// ---------------------------------------------------------------- a scale-tree trunk
// half width at height above the base (u = 0 base .. 1 top); a flared foot
function stHalfAt(half, h, up) {
  const u = clamp(up / h);
  const flare = up < 320 ? 0.55 * Math.pow(1 - up / 320, 2) : 0;
  return half * (1 - 0.38 * u + flare);
}
// the trunk's outline (world units) from by up to by - h
function stTrunkPath(c, x, by, h, half, top = 1) {
  const N = 24;
  c.beginPath();
  for (let i = 0; i <= N; i++) { const up = h * top * (i / N); c.lineTo(x - stHalfAt(half, h, up), by - up); }
  for (let i = N; i >= 0; i--) { const up = h * top * (i / N); c.lineTo(x + stHalfAt(half, h, up), by - up); }
  c.closePath();
}
// the trunk with its diamonds. o: {cam (for culling and level of detail), lit: [[row, col]...] cushions to light up (k),
// litK, bare: [[row, col]] a fresh scar, fogK (0..1 haze), col (flat colour for far layers), detail: false = a flat tone}
const ST_CW = 50, ST_CH = 82;   // the cushion lattice: a cushion every 40 units round the trunk and 32 up (rows alternate)
function stTrunk(c, x, by, h, half, cam, o = {}) {
  stTrunkPath(c, x, by, h, half, o.top || 1);
  c.fillStyle = o.col || STC.barkDk; c.fill();
  if (o.detail === false) return;
  const v = stView(cam, 0.05);
  const yTop = Math.max(by - h * (o.top || 1), v.y0), yBot = Math.min(by, v.y1);
  if (yTop >= yBot || x + half * 1.6 < v.x0 || x - half * 1.6 > v.x1) return;
  const px = ST_CH * cam.zoom;    // a cushion's height on screen
  paint(() => {
    if (px < 22) {
      // small on screen: the tile as a pattern over the trunk, darkened toward the edges (a round trunk)
      if (!ST_PAT) ST_PAT = c.createPattern(ST_BARK_TILE, 'repeat');
      if (typeof DOMMatrix !== 'undefined' && ST_PAT.setTransform) ST_PAT.setTransform(new DOMMatrix().translate(x - 40, by).scale(0.25));   // (guarded for scene-smoke's mock canvas)
      c.save();
      stTrunkPath(c, x, by, h, half, o.top || 1); c.clip();
      c.fillStyle = ST_PAT; c.globalAlpha = 0.85; c.fill();
      c.globalAlpha = 1;
      c.restore();
    } else {
      // close: every cushion drawn on a cylinder (they squeeze toward the trunk's edges)
      const r0 = Math.floor((by - yBot) / (ST_CH / 2)) - 1, r1 = Math.ceil((by - yTop) / (ST_CH / 2)) + 1;
      for (let row = Math.max(0, r0); row <= r1; row++) {
        const y = by - row * (ST_CH / 2);
        const hw = stHalfAt(half, h, by - y);
        if (by - y < 40) continue;
        const circ = 2 * Math.PI * hw, n = Math.max(6, Math.round(circ / ST_CW));
        const off = (row % 2) * 0.5 + (o.twist || 0) * row;
        for (let k = 0; k < n; k++) {
          const a = ((k + off) / n) * 2 * Math.PI;
          const s = Math.sin(a), cs = Math.cos(a);
          if (cs <= 0.12) continue;              // the back of the trunk
          const cx = x + hw * s;
          const lit = o.litFn ? o.litFn(row, k, cx, y) : 0;
          stCushion(c, cx, y, ST_CW * 0.92, ST_CH * 0.92, cs, o.bareFn ? o.bareFn(row, k) : false);
          if (lit > 0) {
            c.lineWidth = 3.2; c.strokeStyle = rgba('#FFD447', 0.95 * lit);
            const hw2 = 0.46 * ST_CW * cs, hh2 = 0.46 * ST_CH;
            c.beginPath(); c.moveTo(cx, y - hh2); c.lineTo(cx + hw2, y); c.lineTo(cx, y + hh2); c.lineTo(cx - hw2, y); c.closePath(); c.stroke();
          }
        }
      }
      // roundness: the edges of the trunk fall into shade (paint over the cushions, see-through)
      const g = c.createLinearGradient(x - half * 1.2, 0, x + half * 1.2, 0);
      g.addColorStop(0, 'rgba(18,16,8,0.32)'); g.addColorStop(0.22, 'rgba(18,16,8,0.0)'); g.addColorStop(0.7, 'rgba(18,16,8,0.0)'); g.addColorStop(1, 'rgba(18,16,8,0.5)');
      c.save(); stTrunkPath(c, x, by, h, half, o.top || 1); c.clip(); c.fillStyle = g; c.fillRect(x - half * 2, yTop, half * 4, yBot - yTop); c.restore();
    }
    if (o.fogK > 0) { c.save(); stTrunkPath(c, x, by, h, half, o.top || 1); c.fillStyle = rgba(o.fogCol || STC.haze, o.fogK); c.fill(); c.restore(); }
  });
}

// ---------------------------------------------------------------- a crown: forks again and again (dichotomous), each tip a
// tuft of grassy leaves, some with a cone hanging under it. Lepidodendron 'lep'; Sigillaria 'sig' forks once or twice, big tufts.
function stCrown(c, x, y, h, half, seed, t, o = {}) {
  const r = mulberry32(seed);
  const depth = o.depth || (o.kind === 'sig' ? 2 : 5);
  const L0 = h * (o.kind === 'sig' ? 0.07 : 0.085), w0 = half * 0.62;
  const tips = [];
  const sway = (o.sway === undefined ? 1 : o.sway) * 0.02 * Math.sin(t * 0.7 + seed);
  const br = (px, py, ang, len, w, d) => {
    const ex = px + Math.sin(ang) * len, ey = py - Math.cos(ang) * len;
    c.beginPath(); c.moveTo(px - w, py); c.quadraticCurveTo(px + Math.sin(ang) * len * 0.5 - w * 0.7, py - Math.cos(ang) * len * 0.5, ex - w * 0.6, ey);
    c.lineTo(ex + w * 0.6, ey); c.quadraticCurveTo(px + Math.sin(ang) * len * 0.5 + w * 0.7, py - Math.cos(ang) * len * 0.5, px + w, py); c.closePath();
    c.fillStyle = o.col || STC.bark; c.fill();
    if (d <= 0) { tips.push([ex, ey, ang]); return; }
    const spread = (o.kind === 'sig' ? 0.32 : 0.42) + 0.12 * (r() - 0.5);
    const lean = 0.08 * (r() - 0.5);
    br(ex, ey, ang - spread + lean + sway, len * (0.76 + 0.08 * r()), w * 0.68, d - 1);
    br(ex, ey, ang + spread + lean + sway, len * (0.76 + 0.08 * r()), w * 0.68, d - 1);
  };
  br(x, y + 4, sway, L0, w0, depth - 1);
  // the tufts (and cones): leaves are thin strokes; far away a tuft is one soft blob
  const far = o.far;
  for (const [tx, ty, ang] of tips) {
    const tl = h * (o.kind === 'sig' ? 0.05 : 0.032);
    if (far) {
      ellipse(c, tx + Math.sin(ang) * tl * 0.4, ty - Math.cos(ang) * tl * 0.4, tl * 0.9, tl * 0.7, o.leafCol || STC.leafDk, ang);
      continue;
    }
    const nL = o.kind === 'sig' ? 26 : 14;
    paint(() => {
      for (let i = 0; i < nL; i++) {
        const a = ang + (i / (nL - 1) - 0.5) * (o.kind === 'sig' ? 3.6 : 2.6) + 0.15 * Math.sin(t * 1.3 + i + seed);
        const ll = tl * (0.7 + 0.5 * hash(i + seed)), droop = 0.25 * Math.sign(Math.sin(a));
        const ex = tx + Math.sin(a) * ll, ey = ty - Math.cos(a) * ll;
        c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.sin(a) * ll * 0.6, ty - Math.cos(a) * ll * 0.6, ex + droop * ll * 0.3, ey + ll * 0.18);
        c.lineWidth = Math.max(1.2, tl * 0.07); c.strokeStyle = i % 3 ? (o.leafCol || STC.leaf) : (o.leafCol2 || STC.leafHi); c.lineCap = 'round'; c.stroke();
      }
    });
    if (o.kind !== 'sig' && hash(tx * 0.13 + seed) < 0.4) {   // a cone hanging at the tip
      ellipse(c, tx + Math.sin(ang) * tl * 0.15, ty + tl * 0.18, tl * 0.12, tl * 0.32, o.coneCol || STC.cone, ang * 0.3);
    }
  }
}

// ---------------------------------------------------------------- the sky, the far haze (screen space, from the camera)
function stBackdrop(cam, t) {
  screenSpace();
  const c8 = stLayerCam(cam, 8);
  const yOf = (Y) => 960 + (Y - c8.y) * c8.zoom;
  const g = ctx.createLinearGradient(0, yOf(-17000), 0, yOf(ST.gy + 300));
  const stops = [[-17000, STC.skyTop], [-12500, STC.sky], [-10200, '#7FA79A'], [-8600, STC.canopy], [-6000, '#6E967E'],
    [-2000, '#9DB58C'], [ST.gy - 200, STC.haze], [ST.gy, STC.hazeHi], [ST.gy + 300, '#5E6E52']];
  const y0 = -17000, y1 = ST.gy + 300;
  for (const [Y, col] of stops) g.addColorStop(clamp((Y - y0) / (y1 - y0)), col);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the sun, high on the right behind the canopy (its glow is light)
  const sp = [960 + (5200 - c8.x) * c8.zoom + 540 - 960, yOf(-14500)];
  softDot(ctx, sp[0], sp[1], 900 * Math.max(0.35, c8.zoom * 8), '#FFF4C8', 0.55);
  softDot(gctx, sp[0], sp[1], 420 * Math.max(0.35, c8.zoom * 8), '#FFE9A8', 0.6);
  return { sun: sp, yOf };
}

// ---------------------------------------------------------------- one layer of forest (behind the hero)
// o: {fall: (tree, i) => {ang, splash}} the swamp shot topples trees; skip: tree index list
function stLayer(cam, t, L, o = {}) {
  const lc = stLayerCam(cam, L.dz);
  const v = stView(lc, 0.1), fog = stHazeK(L.dz) * (o.clear ? lerp(1, 0.55, o.clear) : 1);
  applyCam(lc);
  // water from this layer's line down (darker near): a band of the swamp's surface
  const gyS = toScreen(lc, lc.x, ST.gy)[1];
  screenSpace();
  if (gyS < H) {
    const wg = ctx.createLinearGradient(0, gyS, 0, H);
    wg.addColorStop(0, mixH(STC.water, STC.hazeHi, fog * 0.9)); wg.addColorStop(1, mixH(STC.water, STC.haze, fog * 0.5));
    ctx.fillStyle = wg; ctx.fillRect(0, Math.max(0, gyS - 1), W, H - gyS + 1);
  }
  applyCam(lc);
  const trunkCol = mixH(STC.barkDk, STC.haze, fog * 0.92), crownCol = mixH(STC.bark, STC.haze, fog * 0.9), leafCol = mixH(STC.leafDk, STC.haze, fog * 0.8);
  L.trees.forEach((tr, i) => {
    if (o.skip && o.skip.includes(i)) return;
    const fall = o.fall ? o.fall(tr, i, L) : null;
    const ang = fall ? fall.ang : tr.lean;
    if (tr.x + tr.h * Math.abs(Math.sin(ang)) + 2000 < v.x0 || tr.x - tr.h * Math.abs(Math.sin(ang)) - 2000 > v.x1) return;
    ctx.save();
    ctx.translate(tr.x, ST.gy); ctx.rotate(ang); ctx.translate(-tr.x, -ST.gy);
    const sub = fall && fall.sink ? fall.sink : 0;
    stTrunk(ctx, tr.x, ST.gy + sub, tr.h * 0.74, tr.half, lc, { col: trunkCol, detail: L.dz < 2, fogK: L.dz < 2 ? fog * 0.85 : 0, fogCol: STC.haze });
    stCrown(ctx, tr.x, ST.gy + sub - tr.h * 0.74, tr.h, tr.half, tr.seed, t, { kind: tr.kind, far: L.dz > 1.0, col: crownCol, leafCol, leafCol2: mixH(STC.leaf, STC.haze, fog * 0.8), coneCol: mixH(STC.cone, STC.haze, fog), depth: L.dz > 2 ? 4 : undefined });
    ctx.restore();
    if (o.afterTree) o.afterTree(tr, i, L, fall, lc);
    // the reflection in the water under it (near layers): a dark, rippled column
    if (L.dz < 2 && !fall) {
      paint(() => {
        const hw = stHalfAt(tr.half, tr.h * 0.74, 0) * 0.9;
        for (let k = 0; k < 7; k++) {
          const yy = ST.gy + 30 + k * 70, dx = 14 * Math.sin(t * 1.6 + k * 1.7 + tr.seed);
          ctx.fillStyle = rgba(trunkCol, 0.32 * (1 - k / 7));
          ctx.fillRect(tr.x - hw + dx, yy, hw * 2, 46);
        }
      });
    }
  });
  // ground haze over the layer (the water's mist), then the layer's own haze toward the canopy
  screenSpace();
  const hz = ctx.createLinearGradient(0, gyS - 700 * lc.zoom * 3, 0, gyS + 60);
  hz.addColorStop(0, rgba(STC.hazeHi, 0)); hz.addColorStop(1, rgba(STC.hazeHi, 0.32 * (0.4 + fog)));
  ctx.fillStyle = hz; ctx.fillRect(0, 0, W, Math.min(H, gyS + 60));
  return lc;
}

// ---------------------------------------------------------------- horsetails (Calamites): jointed stalks with whorls of needles
function stHorsetail(c, x, by, h, seed, t, col = STC.horse) {
  const r = mulberry32(seed), n = 9, sway = 6 * Math.sin(t * 0.9 + seed);
  let px = x, py = by;
  for (let i = 0; i < n; i++) {
    const seg = h / n, nx = x + sway * (i / n) * (i / n), ny = by - seg * (i + 1);
    line(c, px, py, nx, ny, Math.max(3, h * 0.022 * (1 - i / (n + 2))), col);
    // the joint and its whorl of needle leaves
    paint(() => {
      const wl = h * 0.06 * (0.6 + 0.4 * (1 - i / n));
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k / 9 - 0.5) * 2.6;
        line(c, nx, ny, nx + Math.cos(a) * wl, ny + Math.sin(a) * wl * 0.55 + wl * 0.35, Math.max(1.4, h * 0.004), k % 2 ? STC.leaf : STC.leafHi);
      }
    });
    px = nx; py = ny;
  }
}

// ---------------------------------------------------------------- a tree fern / a low fern frond (screen-agnostic, world units)
function stFern(c, x, y, s, seed, t, col = STC.fern) {
  const r = mulberry32(seed);
  paint(() => {
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i / 6 - 0.5) * 2.4 + 0.06 * Math.sin(t + i + seed);
      const L = (70 + 40 * r()) * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L * 0.75;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + ex) / 2, (y + ey) / 2 - 18 * s, ex, ey + 8 * s);
      c.lineWidth = 3.5 * s; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
      for (let k = 1; k < 9; k++) {
        const u = k / 9, qx = lerp(x, ex, u), qy = lerp(y, ey, u) - 18 * s * Math.sin(Math.PI * u), ll = (16 - 9 * u) * s;
        line(c, qx, qy, qx + Math.cos(a - 1.2) * ll, qy + Math.sin(a - 1.2) * ll, 3 * s, k % 2 ? col : STC.fernDk);
        line(c, qx, qy, qx + Math.cos(a + 1.2) * ll, qy + Math.sin(a + 1.2) * ll, 3 * s, k % 2 ? STC.fernDk : col);
      }
    }
  });
}

// ---------------------------------------------------------------- the hero's ground: a mud island round the big tree's foot,
// its roots (Stigmaria: long forked roots dotted with little round scars) running out into the water
function stBank(cam, t, o = {}) {
  applyCam(cam);
  const v = stView(cam, 0.2);
  // the swamp in the hero's plane: water to the bottom of the frame
  screenSpace();
  const gyS = toScreen(cam, cam.x, ST.gy)[1];
  if (gyS < H) {
    const wg = ctx.createLinearGradient(0, gyS, 0, H);
    wg.addColorStop(0, '#2C3A2C'); wg.addColorStop(1, '#141C16');
    ctx.fillStyle = wg; ctx.fillRect(0, Math.max(0, gyS), W, H);
  }
  applyCam(cam);
  // the island
  const X0 = -260, X1 = 1500;
  ctx.beginPath(); ctx.moveTo(X0 - 200, ST.gy + 60);
  for (let i = 0; i <= 30; i++) { const u = i / 30, x = lerp(X0, X1, u); ctx.lineTo(x, ST.gy - 8 - 26 * Math.sin(Math.PI * u) + 6 * vnoise(u * 9, 3)); }
  ctx.lineTo(X1 + 260, ST.gy + 70); ctx.lineTo(X1 + 160, ST.gy + 520); ctx.lineTo(X0 - 120, ST.gy + 520); ctx.closePath();
  ctx.fillStyle = STC.mud; ctx.fill();
  paint(() => {   // wet sheen and pebbles of rotting leaves
    const r = mulberry32(51);
    for (let i = 0; i < 40; i++) ellipse(ctx, lerp(X0, X1, r()), ST.gy + 20 + 420 * r(), 20 + 40 * r(), 5 + 6 * r(), i % 3 ? rgba(STC.mudHi, 0.6) : rgba('#7A8A4A', 0.45));
  });
  // the roots
  const rr = mulberry32(61);
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, ang = side * (0.08 + 0.12 * rr());
    let px = BT.x + side * (BT.half * 1.2 + 30 * i), py = ST.gy - 10 + 14 * i;
    const len = 900 + 500 * rr(), w0 = 46 - 4 * i;
    const pts = [[px, py]];
    for (let k = 1; k <= 8; k++) { px += side * len / 8; py += 10 + 6 * Math.sin(k + i) + (k > 5 ? 16 : 0); pts.push([px, py]); }
    for (let k = 0; k < pts.length - 1; k++) line(ctx, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], w0 * (1 - k / 10), STC.root);
    paint(() => { for (let k = 1; k < pts.length - 1; k++) for (let j = 0; j < 3; j++) circle(ctx, lerp(pts[k][0], pts[k + 1][0], j / 3), pts[k][1] - 4, 5, '#3E3A20'); });
  }
  if (o.ferns !== false) for (const f of ST_FERNS) if (f.x > v.x0 - 200 && f.x < v.x1 + 200) stFern(ctx, f.x, f.y, f.s, f.seed, t);
}

// ---------------------------------------------------------------- the young scale tree: an unbranched pole, leaves all over
// its upper part (spiralling), its lower part already bare and diamond-patterned. o.plucked: 0..1 the leaf he pulls;
// o.gust: 0..1 a gust bends its leaves toward +x; o.lit: 0..1 the diamonds light up bottom-up; returns the pluck leaf's base
const POLE_PLUCK = { row: 18, k: 1 };   // the leaf he plucks: on the pole's side that faces him, chest high
function stPole(c, t, o = {}) {
  const x = POLE.x, by = POLE.by, h = POLE.h, half = 46;
  const at = (up) => [x + 6 * Math.sin(up * 0.004 + 1), by - up];
  c.beginPath();
  for (let i = 0; i <= 12; i++) { const up = h * i / 12, p = at(up), hw = half * (1 - 0.35 * i / 12) + (up < 80 ? 26 * (1 - up / 80) : 0); c.lineTo(p[0] - hw, p[1]); }
  for (let i = 12; i >= 0; i--) { const up = h * i / 12, p = at(up), hw = half * (1 - 0.35 * i / 12) + (up < 80 ? 26 * (1 - up / 80) : 0); c.lineTo(p[0] + hw, p[1]); }
  c.closePath(); c.fillStyle = STC.barkDk; c.fill();
  const rows = Math.floor(h / 22);
  let pluckBase = null;
  paint(() => {
    for (let row = 1; row < rows; row++) {
      const up = row * 22, p = at(up), hw = half * (1 - 0.35 * up / h);
      const n = 6;
      for (let k = 0; k < n; k++) {
        const a = ((k + (row % 2) * 0.5) / n) * 2 * Math.PI, s = Math.sin(a), cs = Math.cos(a);
        if (cs <= 0.15) continue;
        const cx = p[0] + hw * s;
        stCushion(c, cx, p[1], 22, 34, cs, o.plucked > 0.5 && row === POLE_PLUCK.row && k === POLE_PLUCK.k);
        const litK = o.lit ? clamp(o.lit * 1.6 - up / (h * 0.42) * 0.6) * (up < h * 0.45 ? 1 : 0) : 0;
        if (litK > 0) {
          c.lineWidth = 2.6; c.strokeStyle = rgba('#FFD447', 0.95 * litK);
          c.beginPath(); c.moveTo(cx, p[1] - 16); c.lineTo(cx + 10 * cs, p[1]); c.lineTo(cx, p[1] + 16); c.lineTo(cx - 10 * cs, p[1]); c.closePath(); c.stroke();
        }
        if (row === POLE_PLUCK.row && k === POLE_PLUCK.k) pluckBase = [cx, p[1] - 6];
      }
    }
  });
  // the leaves: long, grassy, from every cushion on the upper part (drawn as strokes, back ones first)
  const gust = o.gust || 0;
  const leaves = [];
  for (let row = Math.floor(rows * 0.42); row < rows + 3; row++) {
    const up = Math.min(h, row * 22), p = at(up), hw = half * (1 - 0.35 * up / h);
    for (let k = 0; k < 6; k++) {
      const a = ((k + (row % 2) * 0.5) / 6) * 2 * Math.PI, s = Math.sin(a), cs = Math.cos(a);
      const len = (row >= rows ? 150 : 210 - 60 * (up / h)) * (0.85 + 0.3 * hash(row * 7 + k));
      const base = [p[0] + hw * s * 0.9, p[1] - 4];
      const dir = Math.atan2(-0.9, s * 1.4 + 0.12 * (hash(row + k * 3) - 0.5));
      leaves.push({ base, dir, len, cs, row, k, s });
    }
  }
  leaves.sort((a, b) => a.cs - b.cs);
  for (const L of leaves) {
    const isPluck = L.row === POLE_PLUCK.row && L.k === POLE_PLUCK.k;
    if (isPluck && o.plucked > 0.5) continue;     // it is in his hand now (drawn by the scene)
    let dir = L.dir + gust * 0.9 * (0.5 + 0.5 * Math.sin(t * 9 + L.row)) * (L.s > -0.3 ? 1 : 0.4) + 0.04 * Math.sin(t * 1.4 + L.row + L.k);
    const droop = 0.35;
    let len = L.len;
    if (isPluck && o.pull > 0) { len *= 1 + 0.12 * o.pull; dir += 0.5 * o.pull; }
    const ex = L.base[0] + Math.cos(dir) * len, ey = L.base[1] + Math.sin(dir) * len + droop * len * 0.35;
    const mx = L.base[0] + Math.cos(dir) * len * 0.55, my = L.base[1] + Math.sin(dir) * len * 0.55;
    c.beginPath(); c.moveTo(L.base[0], L.base[1]); c.quadraticCurveTo(mx, my, ex, ey);
    c.lineWidth = 9; c.strokeStyle = L.cs > 0.4 ? STC.leaf : STC.leafDk; c.lineCap = 'round'; c.stroke();
    if (L.cs > 0.3) paint(() => { c.beginPath(); c.moveTo(L.base[0], L.base[1]); c.quadraticCurveTo(mx, my - 2, ex, ey - 1); c.lineWidth = 2.5; c.strokeStyle = STC.leafHi; c.stroke(); });
  }
  return { pluckBase, at };
}

// ---------------------------------------------------------------- a giant dragonfly (Meganeura: wings 70 cm across)
// x, y its middle; s scale (1 = true size against the hiker); ang heading (0 = flying +x); flap phase from t
function stDragonfly(c, x, y, s, t, ang = 0, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const fl = Math.sin(t * 60), fl2 = Math.sin(t * 60 + 1.2);
  // wings: thin, veined, see-through (paint: no edges)
  paint(() => {
    for (const [wx, sgn, f] of [[-6, -1, fl], [10, -1, fl2], [-6, 1, fl2], [10, 1, fl]]) {
      const sc = 0.35 + 0.65 * Math.abs(f);
      c.save(); c.translate(wx, 0); c.scale(1, sgn * sc);
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(10, -40, 18, -96, 4, -112); c.bezierCurveTo(-10, -104, -16, -40, -8, 0); c.closePath();
      c.fillStyle = 'rgba(210,236,240,0.38)'; c.fill();
      c.lineWidth = 1.6; c.strokeStyle = 'rgba(70,90,80,0.55)'; c.stroke();
      for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(-2, -k * 20); c.lineTo(10, -k * 20 - 8); c.stroke(); }
      c.restore();
    }
  });
  // body: a long segmented abdomen behind, thorax, big eyes ahead
  for (let k = 0; k < 9; k++) ellipse(c, -26 - k * 15, 0, 9 - k * 0.35, 6.5 - k * 0.3, k % 2 ? '#2F7A6A' : '#3E9A82');
  ellipse(c, 2, 0, 22, 14, '#2F6E5E');
  circle(c, 26, -7, 11, '#1E3E44'); circle(c, 26, 7, 11, '#1E3E44');
  paint(() => { circle(c, 29, -10, 3.5, '#9FD8E8'); circle(c, 29, 4, 3.5, '#9FD8E8'); });
  c.restore();
}

// ---------------------------------------------------------------- a splash where something hits the water (world units)
function stSplash(c, x, y, k, s = 1, seed = 1) {
  if (k <= 0 || k >= 1) return;
  const r = mulberry32(seed);
  paint(() => {
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = (180 + 260 * r()) * s;
      const px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 900 * s * k * k;
      circle(ctx, px, py, (10 + 10 * r()) * s * (1 - k * 0.6), rgba('#D8E8D0', 0.85 * (1 - k)));
    }
    ellipse(ctx, x, y + 6, 160 * s * (0.3 + k), 26 * s * (0.3 + k), rgba('#C8D8C0', 0.5 * (1 - k)));
  });
}
