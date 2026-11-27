// tb_world.js — Can Your Hands Tap Two DIFFERENT Beats? (28 Nov 2026). A picnic table at a campsite at dusk: two upturned
// cooking pots for drums (his LEFT hand on the big blue one, TWO beats; his RIGHT on the small orange one, THREE), a kettle
// with a face on a camp stove across the table (the running device: it does the rhythm without trying), a lantern, a tin
// mug, a campfire beyond, his tent and a string of bulbs behind him. Built on thumb-pinky-swap's tp_world.js (tpXf, the
// two hands; tpQuad), fist-edge-palm's fp_world.js (the 3D camera fpCam / fpP / fpKeys, fpHandGeo, fp2D) and one-finger's
// fist3d.js + bent-wrist-fist's bwhand.js (the hand, the forearm). New here (borrow it):
// - `initTb` / `tbBack`: a 360-degree DUSK CAMP plate (indigo-to-coral sky with stars and a crescent moon, lilac ranges,
//   teal pine hills, a meadow; behind him his lit tent and a string of bulbs that glow live);
// - `tbTable` (planks + a red gingham cloth), `tbPot` (an upturned enamel pot in true perspective: body, lip, handles,
//   speckles, a number sticker, a hit ring), `tbLantern`, `tbMug` (fills with tea, steams), `tbStove`, `tbFire`;
// - `tbKettle`: the kettle as a character (front view sprite at a world point): eyes, brows, a lid that hops, boil,
//   whistle, a pour into the mug;
// - `tbDrummer`: a tiny marching drummer (shako, plume, bass drum, two mallets) for the window into his head: moods happy /
//   focus / panic / slump / sly, arms by angle, a tangle, a cheat card; `tbHeadWin`: the round window, opaque disc first;
// - `tbLanes`: the beat lanes (LEFT 2 / RIGHT 3 rows, a playhead, lit targets, red misses, the glue into ONE row with the
//   syllables NICE · CUP · OF · TEA).
// World frame (cm): X to his right, Y up (the table top is Y = 0), Z toward him (he sits at +Z, the kettle at -Z).
'use strict';

const TB = { tx: [-64, 64], tz: [-44, 44], planks: 6, heroZ: 60,
  potL: { x: -13, z: 12, r0: 10.6, r1: 9.4, h: 10.5, col: '#2F86E8', dk: '#1F5FB0', hi: '#7CC0FF', rim: '#183F7A', num: '2', numCol: '#7FE9FF' },
  potR: { x: 13, z: 12, r0: 8.8, r1: 7.7, h: 8.5, col: '#FF8A2A', dk: '#C8601A', hi: '#FFC08A', rim: '#8A3A0E', num: '3', numCol: '#FF9A3C' },
  kettle: [32, 0, -28], mug: [15, 0, -24], lantern: [-40, 0, -26], fire: [-30, -72, -170] };
const TB_COL = { L: '#7FE9FF', R: '#FF9A3C', both: '#FFD447', bad: '#FF5A6E', ok: '#4DFFB4' };
const TB_WOOD = ['#A66A3A', '#B07443', '#9C6236', '#AA6E3E', '#A06635', '#AE7240'];
let TB_BG = null, TB_BGS = null;
const TB_BULBS = [];       // the string of bulbs behind him: [heading, elevation] (filled by initTb)
const TB_TENT = { head: Math.PI - 0.32, el: -0.035 };

// ---------------------------------------------------------------- the dusk camp (a 360-degree plate, painted once)
function initTb() {
  const PXR = FPB.PXR, w = Math.round(Math.PI * 2 * PXR), h = Math.round(FPB.EL * 2 * PXR), hy = h / 2;
  const cv = mkCanvas(w, h), c = cv.getContext('2d');
  const rng = mulberry32(2811);
  const shore = hy + 18;
  const X = (hd) => w / 2 + hd * PXR;                 // heading 0 (toward the kettle, -Z) at the middle of the plate
  // sky: indigo at the top, violet, coral, gold at the horizon
  const g = c.createLinearGradient(0, 0, 0, hy + 20);
  g.addColorStop(0, '#1C2C78'); g.addColorStop(0.34, '#3E3BA8'); g.addColorStop(0.6, '#9351B8'); g.addColorStop(0.82, '#FF7C6E'); g.addColorStop(1, '#FFC47A');
  c.fillStyle = g; c.fillRect(0, 0, w, hy + 40);
  // the sunset glow: brighter gold low in the sky, left of the kettle (heading about -0.9) and wrapped round
  for (const off of [-w, 0, w]) {
    const sx = X(-0.9) + off, rg = c.createRadialGradient(sx, hy, 0, sx, hy, 900);
    rg.addColorStop(0, rgba('#FFE39A', 0.85)); rg.addColorStop(0.35, rgba('#FFB070', 0.45)); rg.addColorStop(1, rgba('#FF8A70', 0));
    c.fillStyle = rg; c.fillRect(sx - 900, hy - 900, 1800, 940);
  }
  // stars in the upper sky
  for (let i = 0; i < 220; i++) {
    const x = rng() * w, y = Math.pow(rng(), 1.6) * hy * 0.62, r = 0.8 + rng() * 1.9;
    circle(c, x, y, r, rgba('#FFFFFF', 0.35 + 0.55 * rng() * (1 - y / (hy * 0.7))));
  }
  // thin long clouds lit pink from below
  for (let i = 0; i < 10; i++) {
    const x0 = rng() * w, y = hy * (0.45 + rng() * 0.33), s = 0.7 + rng() * 0.9;
    for (const x of [x0 - w, x0, x0 + w]) {
      ellipse(c, x, y, 220 * s, 13 * s, rgba('#FF9DB5', 0.55));
      ellipse(c, x + 40 * s, y + 6 * s, 160 * s, 7 * s, rgba('#FFD0A0', 0.6));
    }
  }
  // ridges (seamless): lilac far peaks with pink snow, a violet middle range, teal near hills
  const range = (base, amp, col, snow, seed, peaks) => {
    const r2 = mulberry32(seed), P = [], pk = [];
    for (let i = 0; i < peaks; i++) pk.push([r2() * w, amp * (0.55 + 0.45 * r2()), 120 + r2() * 160]);
    for (let x = -10; x <= w + 10; x += 8) {
      let y = base;
      for (const [px, a, sp] of pk) for (const off of [-w, 0, w]) { const d = Math.abs(x - px - off) / sp; if (d < 1.6) y -= a * Math.max(0, 1 - d * 0.62) * (1 - 0.18 * Math.abs(Math.sin(x * 0.05 + px))); }
      y += 6 * Math.sin(x * 0.031 + seed) + 3 * Math.sin(x * 0.11);
      P.push([x, y]);
    }
    c.beginPath(); c.moveTo(-10, shore + 2); for (const p of P) c.lineTo(p[0], p[1]); c.lineTo(w + 10, shore + 2); c.closePath();
    c.fillStyle = col; c.fill();
    if (snow) {
      c.save(); c.clip();
      for (const [px, a, sp] of pk) for (const off of [-w, 0, w]) {
        if (a < 70) continue;
        const tx = px + off; let ty = 1e9;
        for (let x = tx - sp * 0.5; x <= tx + sp * 0.5; x += 8) { const j = clamp(Math.round((((x % w) + w) % w + 10) / 8), 0, P.length - 1); ty = Math.min(ty, P[j][1]); }
        const l0 = ty + a * 0.36;
        c.beginPath(); c.moveTo(tx - sp * 0.6, l0);
        for (let i = 0; i <= 10; i++) { const u = i / 10; c.lineTo(tx - sp * 0.6 + sp * 1.2 * u, l0 + (i % 2 ? 15 : -6) + 9 * Math.sin(u * 9 + px)); }
        c.lineTo(tx + sp * 0.6, ty - 400); c.lineTo(tx - sp * 0.6, ty - 400); c.closePath();
        c.fillStyle = snow; c.fill();
      }
      c.restore();
    }
    return P;
  };
  range(hy - 26, 220, '#8C63C9', '#FFD6E6', 91, 9);
  range(hy - 8, 130, '#6447A8', '#F3C4E0', 92, 11);
  const near = range(shore - 4, 70, '#2A6B7A', null, 93, 16);
  // the meadow below the horizon: teal-green at dusk, warmer toward us
  const mg = c.createLinearGradient(0, shore, 0, h);
  mg.addColorStop(0, '#2D7A68'); mg.addColorStop(0.4, '#2E8A5C'); mg.addColorStop(1, '#2A7A48');
  c.fillStyle = mg; c.fillRect(0, shore, w, h - shore);
  // pines on the near hills and down to the meadow
  for (let i = 0; i < 300; i++) {
    const x = rng() * w, j = Math.floor((x + 10) / 8), top = near[clamp(j, 0, near.length - 1)][1];
    const y = lerp(top + 8, shore + 4, Math.pow(rng(), 0.6)), s = 0.5 + rng() * 0.7;
    c.fillStyle = ['#1F5566', '#1A4A5C', '#24606E'][Math.floor(rng() * 3)];
    for (const xx of [x - w, x, x + w]) { c.beginPath(); c.moveTo(xx, y - 56 * s); c.lineTo(xx + 16 * s, y); c.lineTo(xx - 16 * s, y); c.closePath(); c.fill(); }
  }
  // grass tufts and flowers in the meadow
  for (let i = 0; i < 900; i++) {
    const u = Math.pow(rng(), 0.8), y = shore + 6 + u * (h - shore - 6), x = rng() * w, s = 0.4 + 1.6 * u;
    c.strokeStyle = rgba(rng() < 0.6 ? '#4FB06A' : '#1F6A44', 0.55); c.lineWidth = 1 + 1.3 * u;
    c.beginPath(); c.moveTo(x - 4 * s, y); c.lineTo(x - 6 * s, y - 9 * s); c.moveTo(x, y); c.lineTo(x + 1 * s, y - 12 * s); c.moveTo(x + 4 * s, y); c.lineTo(x + 7 * s, y - 8 * s); c.stroke();
    if (rng() < 0.12) circle(c, x, y - 10 * s, 2.2 * s, ['#FFD447', '#FF86A6', '#FFFFFF', '#C8A8FF'][Math.floor(rng() * 4)]);
  }
  // beyond the table (heading 0, below the horizon): a woodpile, a stump with an axe, his backpack on a log, rocks
  {
    const gy = (el) => hy - el * PXR;
    for (const off of [-w, 0, w]) {
      // the woodpile (left of the kettle)
      const wx = X(-0.62) + off, wy = gy(-0.2);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - r; k++) { const cx = wx - 60 + k * 26 + r * 13, cy = wy - 12 - r * 22; circle(c, cx, cy, 12, '#8A5630'); circle(c, cx, cy, 8, '#D9A066'); circle(c, cx, cy, 3, '#B57B45'); }
      // the stump and axe
      const sx2 = X(0.42) + off, sy2 = gy(-0.17);
      c.fillStyle = '#7A4A26'; c.fillRect(sx2 - 34, sy2 - 40, 68, 40); ellipse(c, sx2, sy2 - 40, 34, 10, '#D9A066'); ellipse(c, sx2, sy2 - 40, 20, 6, '#B57B45');
      c.strokeStyle = '#5A3A22'; c.lineWidth = 7; c.beginPath(); c.moveTo(sx2 + 6, sy2 - 44); c.lineTo(sx2 + 40, sy2 - 96); c.stroke();
      c.fillStyle = '#C8CDD6'; c.beginPath(); c.moveTo(sx2 - 8, sy2 - 50); c.lineTo(sx2 + 16, sy2 - 36); c.lineTo(sx2 + 22, sy2 - 52); c.closePath(); c.fill();
      // a log with his backpack (red, a rolled blue mat on top)
      const lx = X(-0.12) + off, ly = gy(-0.26);
      c.fillStyle = '#7A4A26'; rrect(c, lx - 110, ly - 22, 220, 26, 12); c.fill(); ellipse(c, lx + 110, ly - 9, 9, 13, '#D9A066');
      c.fillStyle = '#E8384F'; rrect(c, lx - 40, ly - 96, 70, 78, 18); c.fill();
      c.fillStyle = '#B8283A'; rrect(c, lx - 30, ly - 62, 50, 30, 8); c.fill();
      c.fillStyle = '#2F86E8'; rrect(c, lx - 48, ly - 116, 86, 24, 12); c.fill();
      // rocks
      const r3 = mulberry32(57);
      for (let i = 0; i < 14; i++) { const x = X(-0.9 + 1.8 * r3()) + off, y = gy(-0.12 - 0.3 * r3()), rr = 8 + 14 * r3(); ellipse(c, x, y, rr * 1.3, rr * 0.8, '#7E7A92'); ellipse(c, x - rr * 0.3, y - rr * 0.3, rr * 0.6, rr * 0.3, '#A5A1B8'); }
    }
  }
  // behind him: big pines framing the camp, his orange dome tent lit from inside, the string of bulbs
  for (const [hd, s] of [[Math.PI - 0.95, 1.5], [Math.PI + 0.62, 1.7], [Math.PI - 1.35, 1.1], [Math.PI + 1.05, 1.25], [0.95, 1.3], [-1.25, 1.2]]) {
    for (const off of [-w, 0, w]) {
      const x = X(hd) + off, y = shore + 30;
      c.fillStyle = '#5A3A22'; c.fillRect(x - 6 * s, y - 40 * s, 12 * s, 44 * s);
      for (let k = 0; k < 5; k++) {
        const yy = y - 36 * s - k * 44 * s, ww = (78 - k * 13) * s;
        c.fillStyle = k % 2 ? '#1E5A52' : '#236A5C';
        c.beginPath(); c.moveTo(x, yy - 70 * s); c.lineTo(x + ww, yy); c.lineTo(x - ww, yy); c.closePath(); c.fill();
      }
    }
  }
  {
    const tx = X(TB_TENT.head), ty = shore + 26;
    for (const off of [-w, 0, w]) {
      const x = tx + off;
      c.fillStyle = '#E0621E'; c.beginPath(); c.moveTo(x - 120, ty); c.quadraticCurveTo(x - 100, ty - 150, x, ty - 158); c.quadraticCurveTo(x + 100, ty - 150, x + 120, ty); c.closePath(); c.fill();
      const lg = c.createRadialGradient(x, ty - 60, 4, x, ty - 60, 120);
      lg.addColorStop(0, '#FFE6A0'); lg.addColorStop(0.5, '#FFB04A'); lg.addColorStop(1, '#E0621E');
      c.fillStyle = lg; c.beginPath(); c.moveTo(x - 46, ty); c.quadraticCurveTo(x - 40, ty - 100, x, ty - 118); c.quadraticCurveTo(x + 40, ty - 100, x + 46, ty); c.closePath(); c.fill();
      c.strokeStyle = '#9A3A10'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, ty - 158); c.lineTo(x, ty); c.stroke();
      c.strokeStyle = rgba('#7A2A08', 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(x - 120, ty); c.quadraticCurveTo(x - 60, ty - 70, x, ty - 158); c.moveTo(x + 120, ty); c.quadraticCurveTo(x + 60, ty - 70, x, ty - 158); c.stroke();
    }
  }
  // the bulbs: a sagging string between the two big pines behind him (their directions are kept for the live glow)
  TB_BULBS.length = 0;
  {
    const a = [Math.PI - 0.95, 0.21], b = [Math.PI + 0.62, 0.23];
    for (const off of [-w, 0, w]) {
      c.strokeStyle = '#2A2030'; c.lineWidth = 2.5; c.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40, hd = lerp(a[0], b[0], u), el = lerp(a[1], b[1], u) - 0.12 * 4 * u * (1 - u); const x = X(hd) + off, y = hy - el * PXR; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
    }
    for (let i = 1; i < 18; i++) {
      const u = i / 18, hd = lerp(a[0], b[0], u), el = lerp(a[1], b[1], u) - 0.12 * 4 * u * (1 - u) - 0.012;
      TB_BULBS.push([hd, el, ['#FFE08A', '#FFB86B', '#FF8FA8', '#9FE8FF'][i % 4]]);
      for (const off of [-w, 0, w]) circle(c, X(hd) + off, hy - el * PXR, 6, ['#FFE08A', '#FFB86B', '#FF8FA8', '#9FE8FF'][i % 4]);
    }
  }
  // the moon: a crescent right of the kettle
  {
    const mx = X(0.72), my = hy - 0.42 * PXR;
    for (const off of [-w, 0, w]) {
      circle(c, mx + off, my, 34, '#FFF4C8');
      circle(c, mx + off + 14, my - 8, 30, '#3F3BA6');
    }
  }
  TB_BG = cv;
  const pad = 40, wide = mkCanvas(w + pad * 2, h + pad * 2), wc = wide.getContext('2d');
  wc.fillStyle = '#1C2C78'; wc.fillRect(0, 0, w + pad * 2, pad + 2);
  wc.fillStyle = '#2A7A48'; wc.fillRect(0, h + pad - 2, w + pad * 2, pad + 2);
  for (const off of [-w, 0, w]) wc.drawImage(cv, pad + off, pad);
  const sv = mkCanvas(w, h), s = sv.getContext('2d');
  s.filter = 'blur(3.5px)'; s.drawImage(wide, -pad, -pad); s.filter = 'none';
  TB_BGS = sv;
}
// a direction (heading, elevation) -> a far world point seen from the camera
function tbDir(V, hd, el, dist = 4000) {
  const d = [Math.sin(hd) * Math.cos(el), Math.sin(el), -Math.cos(hd) * Math.cos(el)];
  return fpP(V, fv.add(V.C, fv.mul(d, dist)));
}
function tbInView(V, hd, el) {
  const d = [Math.sin(hd) * Math.cos(el), Math.sin(el), -Math.cos(hd) * Math.cos(el)];
  return fv.dot(d, V.F) > 0.25;
}
// the plate at the camera's heading and pitch (screen space), and the live glows: the bulbs, the tent, the moon
function tbBack(V, t, o = {}) {
  const PXR = FPB.PXR, img = (o.soft === undefined ? 1 : o.soft) > 0.5 ? TB_BGS : TB_BG;
  const w = img.width, h = img.height, sc = V.f / PXR;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2A7A48'; ctx.fillRect(0, 0, W, H);
  ctx.translate(V.cx, V.cy); if (V.roll) ctx.rotate(V.roll);
  { const yT = -(h / 2 - V.pitch * PXR) * sc; ctx.fillStyle = '#1C2C78'; ctx.fillRect(-3 * W, yT - 4 * H, 6 * W, 4 * H + 2); }
  let x0 = -(w / 2 + V.head * PXR) * sc;
  const y0 = -(h / 2 - V.pitch * PXR) * sc;
  x0 = ((x0 % (w * sc)) + w * sc) % (w * sc) - w * sc;
  for (let i = -1; i < 3; i++) ctx.drawImage(img, Math.floor(x0 + i * w * sc), y0, Math.ceil(w * sc) + 2, h * sc);
  ctx.restore();
  screenSpace();
  const zs = V.f / 1300;
  for (const [hd, el, col] of TB_BULBS) {
    if (!tbInView(V, hd, el)) continue;
    const q = tbDir(V, hd, el), tw = 0.8 + 0.2 * Math.sin(t * loopW(2.2) + hd * 40);
    softDot(gctx, q[0], q[1], 34 * zs, col, 0.55 * tw);
  }
  if (tbInView(V, TB_TENT.head, 0.06)) { const q = tbDir(V, TB_TENT.head, 0.06); softDot(gctx, q[0], q[1], 150 * zs, '#FFB04A', 0.5); }
  if (tbInView(V, 0.72, 0.42)) { const q = tbDir(V, 0.72, 0.42); softDot(gctx, q[0] - 6 * zs, q[1] + 4 * zs, 70 * zs, '#FFF4C8', 0.45); }
  if (tbInView(V, -0.9, 0.02)) { const q = tbDir(V, -0.9, 0.02); softDot(gctx, q[0], q[1], 300 * zs, '#FFC98A', 0.22); }
}

// ---------------------------------------------------------------- small 3D helpers
function tbDepth(V, P) { return fv.dot(fv.sub(P, V.C), V.F); }
// a ring of points round a vertical axis at (x, y, z), radius r
function tbRing(x, y, z, r, n = 28) { const P = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; P.push([x + r * Math.cos(a), y, z + r * Math.sin(a)]); } return P; }
function tbPoly(Q, col) { ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }

// ---------------------------------------------------------------- the table and its cloth
function tbTable(V, o = {}) {
  screenSpace();
  const [x0, x1] = TB.tx, [z0, z1] = TB.tz, n = TB.planks, dz = (z1 - z0) / n, gap = 0.6;
  const nearZ = V.C[2] > 0 ? z1 : z0;
  actor(() => tpQuad(V, [[x0, 0, nearZ], [x1, 0, nearZ], [x1, -5, nearZ], [x0, -5, nearZ]], '#6E4122'));
  if (Math.abs(V.C[0]) > 50) { const sx = V.C[0] > 0 ? x1 : x0; actor(() => tpQuad(V, [[sx, 0, z0], [sx, 0, z1], [sx, -5, z1], [sx, -5, z0]], '#6A3E20')); }
  tpQuad(V, [[x0, -0.2, z0], [x1, -0.2, z0], [x1, -0.2, z1], [x0, -0.2, z1]], '#3D2412');
  for (let i = 0; i < n; i++) {
    const za = z0 + i * dz + gap / 2, zb = z0 + (i + 1) * dz - gap / 2;
    actor(() => tpQuad(V, [[x0, 0, za], [x1, 0, za], [x1, 0, zb], [x0, 0, zb]], TB_WOOD[i % TB_WOOD.length]));
    paint(() => {
      const r2 = mulberry32(190 + i);
      for (let j = 0; j < 3; j++) {
        const z = lerp(za, zb, 0.15 + 0.7 * r2()), Q = [];
        for (let x = x0; x <= x1; x += 7) if (tbDepth(V, [x, 0, z]) > 4) Q.push(fpP(V, [x, 0, z + 0.5 * Math.sin(x * 0.08 + j * 2 + i)]));
        if (Q.length < 2) continue;
        poly(ctx, Q.map((q) => [q[0], q[1]]), Math.max(1, Q[Math.floor(Q.length / 2)][2] * 0.1), rgba('#5A3016', 0.3));
      }
    });
  }
  // the gingham cloth under the pots (red and white checks, a frayed hem)
  const cx0 = -40, cx1 = 40, cz0 = -6, cz1 = 36, N = 10;
  actor(() => tpQuad(V, [[cx0, 0.15, cz0], [cx1, 0.15, cz0], [cx1, 0.15, cz1], [cx0, 0.15, cz1]], '#FFF1E6'));
  paint(() => {
    const sx = (cx1 - cx0) / N, sz = (cz1 - cz0) / (N * 0.55);
    for (let i = 0; i < N; i++) {
      const xa = cx0 + i * sx;
      if (i % 2 === 0) tpQuad(V, [[xa, 0.2, cz0], [xa + sx, 0.2, cz0], [xa + sx, 0.2, cz1], [xa, 0.2, cz1]], rgba('#E8384F', 0.55));
    }
    for (let j = 0; j < Math.ceil(N * 0.55); j++) {
      const za = cz0 + j * sz;
      if (j % 2 === 0) tpQuad(V, [[cx0, 0.22, za], [cx1, 0.22, za], [cx1, 0.22, Math.min(cz1, za + sz)], [cx0, 0.22, Math.min(cz1, za + sz)]], rgba('#E8384F', 0.55));
    }
  });
  // the warm wash of the lantern and the fire on the planks
  const c0 = fpP(V, TB.lantern);
  if (c0[3] > 4) softDot(ctx, c0[0], c0[1], 16 * c0[2], '#FFD08A', 0.1);
}

// ---------------------------------------------------------------- an upturned enamel pot (the drums)
// p: TB.potL / TB.potR. o: {hit 0..1 (a flash on its top, a ring), squash 0..1, shake}
function tbPot(V, p, t, o = {}) {
  screenSpace();
  const sq = o.squash || 0, hTop = p.h * (1 - 0.06 * sq), jx = (o.shake || 0) * Math.sin(t * 61);
  const x = p.x + jx, z = p.z;
  const B = tbRing(x, 0, z, p.r0).map((q) => fpP(V, q)), T = tbRing(x, hTop, z, p.r1).map((q) => fpP(V, q));
  const Lp = tbRing(x, 1.6, z, p.r0 + 0.7).map((q) => fpP(V, q)), Lb = tbRing(x, 0, z, p.r0 + 0.7).map((q) => fpP(V, q));
  // the body (the hull of both rings), the lip band at the table, the handles
  actor(() => { ctx.fillStyle = p.col; fkSmooth(ctx, fkHull(B.concat(T).map((q) => [q[0], q[1]]))); ctx.fill(); });
  actor(() => { ctx.fillStyle = p.rim; fkSmooth(ctx, fkHull(Lp.concat(Lb).map((q) => [q[0], q[1]]))); ctx.fill(); });
  for (const sd of [-1, 1]) {
    const a = fpP(V, [x + sd * (p.r0 - 0.2), hTop * 0.62, z]), b = fpP(V, [x + sd * (p.r0 + 2.6), hTop * 0.52, z]), c2 = fpP(V, [x + sd * (p.r0 - 0.1), hTop * 0.38, z]);
    if (Math.min(a[3], b[3]) < 4) continue;
    actor(() => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c2[0], c2[1]); ctx.lineWidth = Math.max(3, b[2] * 1.3); ctx.strokeStyle = p.rim; ctx.lineCap = 'round'; ctx.stroke(); });
  }
  // the top (the pot's bottom: the drum head), lighter, with a ring where it is struck
  const top = fpP(V, [x, hTop, z]);
  if (V.C[1] > hTop) {
    actor(() => { ctx.fillStyle = p.hi; fkSmooth(ctx, T.map((q) => [q[0], q[1]])); ctx.fill(); });
    paint(() => {
      const In = tbRing(x, hTop + 0.05, z, p.r1 * 0.72).map((q) => fpP(V, q));
      ctx.lineWidth = Math.max(1.5, top[2] * 0.35); ctx.strokeStyle = rgba('#FFFFFF', 0.35); fkSmooth(ctx, In.map((q) => [q[0], q[1]])); ctx.stroke();
    });
  }
  // enamel speckles and a shine down the side that faces the camera; the number sticker on that side
  const toC = fv.norm([V.C[0] - x, 0, V.C[2] - z]);
  paint(() => {
    const r2 = mulberry32(p.num === '2' ? 11 : 12);
    for (let i = 0; i < 26; i++) {
      const a = Math.atan2(toC[2], toC[0]) + (r2() - 0.5) * 2.4, yy = 1.5 + r2() * (hTop - 2.5), rr = lerp(p.r0, p.r1, yy / hTop) + 0.05;
      const q = fpP(V, [x + rr * Math.cos(a), yy, z + rr * Math.sin(a)]);
      if (q[3] > 4) circle(ctx, q[0], q[1], Math.max(1, q[2] * 0.28), rgba('#FFFFFF', 0.5));
    }
    const sa = Math.atan2(toC[2], toC[0]) - 0.55, s0 = fpP(V, [x + p.r0 * 0.99 * Math.cos(sa), 1.5, z + p.r0 * 0.99 * Math.sin(sa)]), s1 = fpP(V, [x + p.r1 * 0.99 * Math.cos(sa), hTop - 1, z + p.r1 * 0.99 * Math.sin(sa)]);
    line(ctx, s0[0], s0[1], s1[0], s1[1], Math.max(2, s0[2] * 1.1), rgba('#FFFFFF', 0.3));
  });
  const st = fpP(V, [x + toC[0] * lerp(p.r0, p.r1, 0.5), hTop * 0.5, z + toC[2] * lerp(p.r0, p.r1, 0.5)]);
  if (o.sticker !== false && st[3] > 4) paint(() => {
    const r = 4.4 * st[2];
    circle(ctx, st[0], st[1], r * 1.08, '#141428'); circle(ctx, st[0], st[1], r, '#FFFFFF');
    ctx.save(); ctx.font = `900 ${Math.round(r * 1.5)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#141428';
    ctx.fillText(p.num, st[0], st[1] + r * 0.06); ctx.restore();
  });
  // a hit: the head flashes and a ring runs out over it; a soft glow in the glow layer
  const hk = o.hit || 0;
  if (hk > 0.01 && V.C[1] > hTop) {
    const Rr = tbRing(x, hTop + 0.1, z, p.r1 * (0.35 + 0.95 * (1 - hk))).map((q) => fpP(V, q));
    paint(() => { ctx.lineWidth = Math.max(2, top[2] * 0.9 * hk); ctx.strokeStyle = rgba('#FFFFFF', 0.85 * hk); fkSmooth(ctx, Rr.map((q) => [q[0], q[1]])); ctx.stroke(); });
    softDot(gctx, top[0], top[1], top[2] * p.r1 * 0.8, p.numCol, 0.22 * hk);
  }
  return { top, hTop, st };
}

// ---------------------------------------------------------------- the lantern, the mug, the stove, the fire
function tbLantern(V, P, t) {
  const q = fpP(V, P);
  if (q[3] < 6) return;
  const s = q[2];
  screenSpace();
  actor(() => {
    rrect(ctx, q[0] - 6 * s, q[1] - 3 * s, 12 * s, 3 * s, 1.2 * s); ctx.fillStyle = '#2E3A46'; ctx.fill();
    rrect(ctx, q[0] - 5 * s, q[1] - 17 * s, 10 * s, 14 * s, 2 * s); ctx.fillStyle = '#FFE2A0'; ctx.fill();
    rrect(ctx, q[0] - 6 * s, q[1] - 20 * s, 12 * s, 3.2 * s, 1.2 * s); ctx.fillStyle = '#2E3A46'; ctx.fill();
  });
  paint(() => {
    for (const dx of [-3.4, 3.4]) line(ctx, q[0] + dx * s, q[1] - 17 * s, q[0] + dx * s, q[1] - 3 * s, Math.max(1.5, 0.7 * s), '#3E4A56');
    ctx.beginPath(); ctx.arc(q[0], q[1] - 20 * s, 4 * s, Math.PI, 0); ctx.lineWidth = Math.max(1.5, 0.8 * s); ctx.strokeStyle = '#3E4A56'; ctx.stroke();
    ellipse(ctx, q[0], q[1] - 10 * s, 2.4 * s, 4 * s, '#FFF8E0');
  });
  const fl = 0.9 + 0.1 * Math.sin(t * loopW(0.37)) * Math.sin(t * loopW(0.91));
  softDot(gctx, q[0], q[1] - 10 * s, 9 * s, '#FFC860', 0.6 * fl);
  softDot(gctx, q[0], q[1] - 10 * s, 4 * s, '#FFF6D0', 0.8);
}
// fill 0..1 (tea), steam 0..1
function tbMug(V, P, t, o = {}) {
  const q = fpP(V, P);
  if (q[3] < 6) return null;
  const s = q[2], top = q[1] - 9 * s, fill = clamp(o.fill || 0);
  screenSpace();
  actor(() => {
    rrect(ctx, q[0] - 4.6 * s, top, 9.2 * s, 9 * s, 1.6 * s); ctx.fillStyle = '#F4F1EA'; ctx.fill();
    ctx.beginPath(); ctx.arc(q[0] + 5.2 * s, top + 4.2 * s, 2.6 * s, -1.3, 1.3); ctx.lineWidth = 1.3 * s; ctx.strokeStyle = '#F4F1EA'; ctx.stroke();
  });
  paint(() => {
    ellipse(ctx, q[0], top, 4.6 * s, 1.4 * s, '#2B6CB0');
    ellipse(ctx, q[0], top + 0.2 * s, 3.9 * s, 1.05 * s, fill > 0.05 ? mixH('#3A2418', '#B8662A', fill) : '#1E2A3A');
    for (let i = 0; i < 5; i++) circle(ctx, q[0] - 3 * s + i * 1.4 * s, top + 3 * s + (i % 2) * 3 * s, 0.35 * s, rgba('#2B6CB0', 0.6));
  });
  const stm = clamp(o.steam || 0);
  if (stm > 0.02) for (let i = 0; i < 3; i++) {
    const u = ((t * 0.7 + i / 3) % 1), y = top - u * 16 * s, x = q[0] + Math.sin(u * 6 + i * 2) * 2 * s;
    softDot(ctx, x, y, (2 + u * 4) * s, '#FFFFFF', 0.28 * stm * (1 - u));
  }
  return { x: q[0], y: top, s };
}
function tbStove(V, P, t) {
  const q = fpP(V, P);
  if (q[3] < 6) return;
  const s = q[2];
  screenSpace();
  actor(() => {
    rrect(ctx, q[0] - 11 * s, q[1] - 5 * s, 22 * s, 5 * s, 1.5 * s); ctx.fillStyle = '#C8CDD6'; ctx.fill();
    rrect(ctx, q[0] - 11 * s, q[1] - 5.2 * s, 22 * s, 1.3 * s, 0.6 * s); ctx.fillStyle = '#8E96A6'; ctx.fill();
  });
  paint(() => { circle(ctx, q[0] + 8 * s, q[1] - 2.5 * s, 1.1 * s, '#E8384F'); });
  for (let i = 0; i < 7; i++) {
    const x = q[0] + (i - 3) * 2.2 * s, k = 0.8 + 0.2 * Math.sin(t * loopW(0.13 + i * 0.01) + i);
    paint(() => ellipse(ctx, x, q[1] - 6.2 * s, 0.8 * s, 1.6 * s * k, '#7FD0FF'));
    softDot(gctx, x, q[1] - 6.2 * s, 3 * s, '#5AB8FF', 0.5);
  }
}
// the campfire beyond the table (stones, logs, flames, embers; glow)
function tbFire(V, t, k = 1) {
  const P = TB.fire, q = fpP(V, P);
  if (q[3] < 20) return;
  const s = q[2];
  screenSpace();
  actor(() => {
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; ellipse(ctx, q[0] + Math.cos(a) * 22 * s, q[1] + Math.sin(a) * 5 * s, 5 * s, 3.4 * s, i % 2 ? '#7A7480' : '#8E8894'); }
    ctx.save(); ctx.translate(q[0], q[1] - 3 * s);
    for (const r of [-0.35, 0.35]) { ctx.save(); ctx.rotate(r); rrect(ctx, -17 * s, -2.6 * s, 34 * s, 5.2 * s, 2.5 * s); ctx.fillStyle = '#6A3A1C'; ctx.fill(); ctx.restore(); }
    ctx.restore();
  });
  const fl = (x, y, w, h, seed, col) => {
    const sw = 0.25 * Math.sin(t * loopW(0.31) * 1 + seed) + 0.15 * Math.sin(t * loopW(0.17) + seed * 2);
    ctx.beginPath(); ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w * 0.9, y - h * 0.55, x + sw * w * 2, y - h);
    ctx.quadraticCurveTo(x + w * 0.9, y - h * 0.55, x + w, y); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  const fh = 30 * s * k;
  paint(() => {
    for (let i = 0; i < 5; i++) fl(q[0] + (i - 2) * 6 * s, q[1] - 2 * s, 6 * s, fh * (0.7 + 0.3 * Math.sin(t * loopW(0.23 + i * 0.03) + i)), i, '#FF7A2A');
    for (let i = 0; i < 3; i++) fl(q[0] + (i - 1) * 5 * s, q[1] - 2 * s, 4 * s, fh * 0.65, i + 7, '#FFD447');
  });
  gctx.save();
  for (let i = 0; i < 3; i++) { const yy = q[1] - fh * 0.4; softDot(gctx, q[0], yy, (12 + i * 8) * s, '#FF9A3C', 0.2); }
  gctx.restore();
  for (let i = 0; i < 10; i++) {
    const u = ((t * loopW(0.6) / (Math.PI * 2) + i / 10) % 1);
    const x = q[0] + Math.sin(u * 7 + i * 3) * 10 * s, y = q[1] - 8 * s - u * 70 * s;
    softDot(gctx, x, y, 2.2 * s, '#FFB050', 0.8 * (1 - u));
  }
}

// ---------------------------------------------------------------- the kettle (a character; front view sprite)
// (x, y) = the middle of its base on screen, s = px per cm. o: {look [x, y] (-1..1), mood 'calm' | 'watch' | 'boil' | 'happy' |
// 'wow', lid 0..1 (hop), shake 0..1, steam 0..1, whistle 0..1, pour 0..1 (tilts toward +x on screen: dir), dir 1 | -1, blink}
function tbKettle(c, x, y, s, t, o = {}) {
  const tilt = -(o.pour || 0) * 0.62 * (o.dir || 1), sh = (o.shake || 0) * 1.4 * s;
  const jx = sh * Math.sin(t * 57), jy = sh * 0.5 * Math.abs(Math.sin(t * 43));
  c.save(); c.translate(x + jx, y - jy); c.rotate(tilt); c.scale(s, s);
  const body = '#33C08A', bodyDk = '#21946A', bodyHi = '#8DF0C4', metal = '#D9DEE8', metalDk = '#8E96A6';
  // spout (to -x in its own frame, so it points left; dir flips the whole kettle), handle arc, body, lid, knob
  c.save(); if ((o.dir || 1) < 0) c.scale(-1, 1);
  actor(() => {
    c.beginPath(); c.moveTo(-9.5, -7); c.quadraticCurveTo(-15, -9, -17.5, -17); c.lineTo(-15.2, -18); c.quadraticCurveTo(-12.5, -11, -8.5, -11.5); c.closePath();
    c.fillStyle = bodyDk; c.fill();
  });
  actor(() => { c.beginPath(); c.ellipse(0, -9.5, 11.5, 10, 0, 0, Math.PI * 2); c.fillStyle = body; c.fill(); });
  actor(() => { c.beginPath(); c.ellipse(0, -0.8, 10.4, 1.6, 0, 0, Math.PI * 2); c.fillStyle = bodyDk; c.fill(); });
  const lh = (o.lid || 0) * 2.6, lr = (o.lid || 0) * 0.14 * Math.sin(t * 40);
  c.save(); c.translate(0, -19.2 - lh); c.rotate(lr);
  actor(() => { c.beginPath(); c.ellipse(0, 0, 6.2, 1.8, 0, 0, Math.PI * 2); c.fillStyle = metal; c.fill(); });
  actor(() => { c.beginPath(); c.arc(0, -1.6, 1.7, 0, Math.PI * 2); c.fillStyle = '#FFD447'; c.fill(); });
  c.restore();
  paint(() => {
    c.beginPath(); c.moveTo(-8.5, -17.5); c.quadraticCurveTo(0, -31, 8.5, -17.5); c.lineWidth = 1.5; c.strokeStyle = '#2B2F3A'; c.stroke();
    c.beginPath(); c.ellipse(-4.5, -14, 3, 1.4, -0.5, 0, Math.PI * 2); c.fillStyle = rgba(bodyHi, 0.6); c.fill();
  });
  c.restore();
  // the face (paint): eyes, brows, mouth
  const mood = o.mood || 'calm', lk = o.look || [0, 0.4];
  const eo = mood === 'boil' || mood === 'wow' ? 1.35 : (mood === 'calm' ? 0.75 : 1);
  paint(() => {
    for (const sd of [-1, 1]) {
      const ex = sd * 4.2, ey = -10.5;
      if (mood === 'happy') {
        c.beginPath(); c.arc(ex, ey + 0.4, 1.9, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 0.9; c.strokeStyle = '#141428'; c.stroke();
      } else {
        const bl = clamp(o.blink || 0);
        c.beginPath(); c.ellipse(ex, ey, 2.3, 2.6 * eo * (1 - 0.9 * bl), 0, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill();
        if (bl < 0.7) { c.beginPath(); c.arc(ex + lk[0] * 0.9, ey + lk[1] * 1.0, 1.15, 0, Math.PI * 2); c.fillStyle = '#141428'; c.fill(); }
        if (mood === 'calm') { c.fillStyle = body; c.fillRect(ex - 2.6, ey - 3.2 * eo - 0.2, 5.2, 2.2 * eo); }
      }
      // brows
      const by = ey - 3.4 * eo - (mood === 'wow' || mood === 'boil' ? 1.0 : 0), bt = mood === 'boil' ? -sd * 0.35 : (mood === 'watch' ? sd * 0.12 : 0);
      c.save(); c.translate(ex, by); c.rotate(bt); c.fillStyle = '#141428'; c.fillRect(-1.8, -0.4, 3.6, 0.8); c.restore();
    }
    // mouth
    c.lineWidth = 0.9; c.strokeStyle = '#141428'; c.beginPath();
    if (mood === 'happy') { c.arc(0, -6.2, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    else if (mood === 'boil' || mood === 'wow') { c.ellipse(0, -5.5, 1.3, 1.6, 0, 0, Math.PI * 2); c.fillStyle = '#3A1020'; c.fill(); }
    else if (mood === 'watch') { c.moveTo(-1.6, -5.6); c.lineTo(1.6, -5.9); c.stroke(); }
    else { c.arc(0, -6.6, 1.8, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    if (mood === 'boil') for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 9.5, -14, 0.9, 1.4, 0, 0, Math.PI * 2); c.fillStyle = '#9FE8FF'; c.fill(); }
  });
  c.restore();
  // steam from the spout (screen space): puffs, or the whistle's jet
  const dir = o.dir || 1;
  const lx = -16.3 * dir, ly = -17.5, ca = Math.cos(tilt), sa = Math.sin(tilt);
  const sp = [x + jx + s * (lx * ca - ly * sa), y - jy + s * (lx * sa + ly * ca)];
  const stm = clamp(o.steam || 0), wh = clamp(o.whistle || 0);
  if (stm > 0.02) for (let i = 0; i < 5; i++) {
    const u = ((t * 1.3 + i / 5) % 1);
    softDot(ctx, sp[0] - dir * u * 10 * s + Math.sin(u * 7 + i) * 2 * s, sp[1] - u * 22 * s, (1.5 + u * 5) * s, '#FFFFFF', 0.4 * stm * (1 - u));
  }
  if (wh > 0.02) {
    for (let i = 0; i < 9; i++) {
      const u = ((t * 3.1 + i / 9) % 1);
      softDot(ctx, sp[0] - dir * u * 6 * s, sp[1] - u * 34 * s, (1.2 + u * 3.5) * s, '#FFFFFF', 0.7 * wh * (1 - u));
    }
    softDot(gctx, sp[0], sp[1] - 12 * s, 14 * s, '#FFFFFF', 0.35 * wh);
  }
  return { spout: sp, top: [x + jx, y - jy - 24 * s] };
}

// ---------------------------------------------------------------- the tiny drummer (in the window into his head)
// (x, y) = his feet, s = scale (he is about 300 units tall). o: {mood 'happy' | 'focus' | 'panic' | 'slump' | 'sly' | 'proud',
// aL, aR: the arms' angles (0 = mallet down on the drum's skin, 1 = raised), tangle 0..1, slump 0..1, card 0..1, sweat 0..1,
// look [x, y], bob}. Returns the mallet heads (screen) for the strings.
function tbDrummer(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'happy', sl = clamp(o.slump || 0), tg = clamp(o.tangle || 0);
  c.save(); c.translate(x, y + (o.bob || 0)); c.scale(s, s);
  const jac = '#2F5FD0', jacDk = '#1E3F96', gold = '#FFD447', skin = '#F2B793', red = '#E8384F', white = '#FFF4E4';
  const lean = sl * 0.18;
  c.rotate(lean);
  // legs and boots
  actor(() => {
    c.fillStyle = white; c.fillRect(-30, -96, 24, 84); c.fillRect(6, -96, 24, 84);
    c.fillStyle = '#141428'; rrect(c, -36, -18, 34, 18, 8); c.fill(); rrect(c, 2, -18, 34, 18, 8); c.fill();
  });
  // body
  actor(() => { rrect(c, -48, -206 + sl * 14, 96, 118, 30); c.fillStyle = jac; c.fill(); });
  paint(() => {
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-30, -190 + i * 22 + sl * 14); c.quadraticCurveTo(0, -178 + i * 22 + sl * 14, 30, -190 + i * 22 + sl * 14); c.lineWidth = 4; c.strokeStyle = gold; c.stroke(); }
  });
  // head and shako
  const hy = -258 + sl * 26, lk = o.look || [0, 0];
  actor(() => { c.beginPath(); c.arc(0, hy, 46, 0, Math.PI * 2); c.fillStyle = skin; c.fill(); });
  actor(() => {
    c.beginPath(); c.moveTo(-40, hy - 30); c.lineTo(-34, hy - 106); c.lineTo(34, hy - 106); c.lineTo(40, hy - 30); c.closePath(); c.fillStyle = '#1E3A8A'; c.fill();
    rrect(c, -44, hy - 40, 88, 14, 6); c.fillStyle = '#141428'; c.fill();
  });
  paint(() => {
    c.beginPath(); c.arc(0, hy - 70, 13, 0, Math.PI * 2); c.fillStyle = gold; c.fill();
    c.beginPath(); c.arc(0, hy - 70, 6, 0, Math.PI * 2); c.fillStyle = red; c.fill();
    // the plume (wobbles)
    const pw = 0.2 * Math.sin(t * 9) + (mood === 'panic' ? 0.4 * Math.sin(t * 31) : 0);
    c.save(); c.translate(0, hy - 106); c.rotate(pw);
    c.beginPath(); c.ellipse(0, -26, 12, 30, 0, 0, Math.PI * 2); c.fillStyle = '#FF5A6E'; c.fill();
    c.beginPath(); c.ellipse(0, -30, 6, 20, 0, 0, Math.PI * 2); c.fillStyle = '#FF9DB0'; c.fill();
    c.restore();
    // the face
    const eo = mood === 'panic' ? 1.45 : (mood === 'slump' ? 0.45 : 1);
    for (const sd of [-1, 1]) {
      const ex = sd * 17, ey = hy - 4;
      if (mood === 'sly' && sd < 0) { c.beginPath(); c.arc(ex, ey + 2, 8, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 4; c.strokeStyle = '#141428'; c.stroke(); continue; }
      if (mood === 'proud' || mood === 'happy' && o.squint) { c.beginPath(); c.arc(ex, ey + 3, 8, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 4; c.strokeStyle = '#141428'; c.stroke(); continue; }
      c.beginPath(); c.ellipse(ex, ey, 10, 12 * eo, 0, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill();
      c.beginPath(); c.arc(ex + lk[0] * 4, ey + lk[1] * 4 + (mood === 'slump' ? 3 : 0), mood === 'panic' ? 3.5 : 5, 0, Math.PI * 2); c.fillStyle = '#141428'; c.fill();
      if (mood === 'slump') { c.fillStyle = skin; c.fillRect(ex - 12, ey - 14, 24, 10); }
      const bt = mood === 'focus' ? sd * 0.3 : (mood === 'panic' ? -sd * 0.35 : (mood === 'slump' ? -sd * 0.2 : 0));
      c.save(); c.translate(ex, ey - 17 * eo - 2); c.rotate(bt); c.fillStyle = '#5A3A22'; c.fillRect(-9, -2.5, 18, 5); c.restore();
    }
    c.lineWidth = 4; c.strokeStyle = '#7A2A30'; c.beginPath();
    if (mood === 'panic') { c.ellipse(0, hy + 24, 9, 12, 0, 0, Math.PI * 2); c.fillStyle = '#5A1020'; c.fill(); }
    else if (mood === 'focus') { c.moveTo(-10, hy + 22); c.lineTo(10, hy + 22); c.stroke(); c.beginPath(); c.ellipse(8, hy + 27, 5, 6, 0.3, 0, Math.PI * 2); c.fillStyle = '#FF7A90'; c.fill(); }
    else if (mood === 'slump') { c.arc(0, hy + 32, 10, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
    else if (mood === 'sly') { c.moveTo(-10, hy + 22); c.quadraticCurveTo(4, hy + 30, 14, hy + 16); c.stroke(); }
    else { c.arc(0, hy + 16, 13, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    c.beginPath(); c.arc(-28, hy + 12, 6, 0, Math.PI * 2); c.fillStyle = rgba('#FF7A90', 0.45); c.fill();
    c.beginPath(); c.arc(28, hy + 12, 6, 0, Math.PI * 2); c.fill();
  });
  // the bass drum on his belly
  const dy = -142 + sl * 14;
  actor(() => { c.beginPath(); c.arc(0, dy, 62, 0, Math.PI * 2); c.fillStyle = red; c.fill(); });
  actor(() => { c.beginPath(); c.arc(0, dy, 50, 0, Math.PI * 2); c.fillStyle = white; c.fill(); });
  paint(() => {
    c.beginPath(); c.arc(0, dy, 57, 0, Math.PI * 2); c.lineWidth = 6; c.strokeStyle = gold; c.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(a) * 52, dy + Math.sin(a) * 52); c.lineTo(Math.cos(a) * 62, dy + Math.sin(a) * 62); c.lineWidth = 3; c.strokeStyle = gold; c.stroke(); }
    c.save(); c.font = '900 44px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E8384F'; c.fillText('1', 0, dy + 3); c.restore();
  });
  // the arms and mallets: from the shoulders, a raise angle each; crossed when tangled
  const heads = [];
  for (const [sd, a] of [[-1, o.aR || 0], [1, o.aL || 0]]) {
    const shx = sd * 42, shy = -194 + sl * 14;
    const ang = lerp(0.35, -1.1, clamp(a)) * sd * -1 + tg * sd * 0.9 * Math.sin(t * 13 + sd);
    // the hand: down-in toward the drum when a = 0, up and out when raised; crossed over to the other side when tangled
    const hx = shx + sd * (14 + 26 * a) - tg * sd * 64, hyy = shy + 44 - 70 * a + tg * 20 * Math.sin(t * 11 + sd * 2);
    actor(() => { line(c, shx, shy, hx, hyy, 20, jac); circle(c, hx, hyy, 11, skin); });
    // the mallet: a stick toward the drum's skin, a white fuzzy head
    const mx = hx + Math.cos(ang - Math.PI / 2 * sd) * 0, my = hyy;
    const tipx = mx - sd * 30 + sd * a * 10 - tg * sd * 10 * Math.sin(t * 17), tipy = my + 34 - a * 72;
    actor(() => { line(c, mx, my, tipx, tipy, 6, '#C08A4A'); circle(c, tipx, tipy, 12, '#FFFFFF'); });
    const m = c.getTransform(), hp = m.transformPoint(new DOMPoint(tipx, tipy));
    heads.push([hp.x, hp.y]);
  }
  // sweat, the cheat card
  if ((o.sweat || 0) > 0.02) paint(() => { for (const sd of [-1, 1]) sweatDrop(c, sd * 54, hy - 18 + 6 * Math.sin(t * 9 + sd), 1.3, o.sweat); });
  const cd = clamp(o.card || 0);
  if (cd > 0.01) {
    c.save(); c.translate(-96, hy + 40 - 40 * E.outBack(cd, 1.6)); c.rotate(-0.12 + 0.1 * cd); c.scale(0.85 * E.outBack(cd, 1.8), 0.85 * E.outBack(cd, 1.8));
    actor(() => { rrect(c, -78, -52, 156, 104, 12); c.fillStyle = '#FFF8E0'; c.fill(); });
    paint(() => {
      c.font = '900 28px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E8384F'; c.fillText('CHEAT', 0, -26);
      const xs = [-50, -10, 12, 34];
      xs.forEach((dx, i) => { c.beginPath(); c.arc(dx, 18, i === 0 ? 12 : 9, 0, Math.PI * 2); c.fillStyle = i === 0 ? '#FFD447' : (i === 2 ? '#2F86E8' : '#FF8A2A'); c.fill(); });
    });
    c.restore();
  }
  c.restore();
  return { heads, R: heads[0], L: heads[1] };
}

// a round window into his head at screen point wc, radius R: the opaque disc first (outside any clip), then the room inside
// (a warm little stage: a spotlit floor, a velvet curtain) and the drummer, then a brass rim
function tbHeadWin(wc, R, t, fn) {
  if (R <= 1) return null;
  screenSpace();
  ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.fillStyle = '#3A1E5A'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(wc[0], wc[1], R, 0, 7); gctx.clip();
  const g = ctx.createLinearGradient(0, wc[1] - R, 0, wc[1] + R);
  g.addColorStop(0, '#5A2A8A'); g.addColorStop(0.62, '#8A3A9A'); g.addColorStop(0.63, '#C46A4A'); g.addColorStop(1, '#8A4A30');
  ctx.fillStyle = g; ctx.fillRect(wc[0] - R, wc[1] - R, 2 * R, 2 * R);
  for (let i = -3; i <= 3; i++) { ctx.fillStyle = rgba('#3A1050', 0.35); ctx.fillRect(wc[0] + i * R * 0.3 - R * 0.04, wc[1] - R, R * 0.08, R * 1.25); }
  softDot(ctx, wc[0], wc[1] + R * 0.5, R * 0.9, '#FFE6A0', 0.35);
  softDot(gctx, wc[0], wc[1] - R * 0.2, R * 0.7, '#FFD0F0', 0.2);
  const out = fn ? fn() : null;
  ctx.restore(); gctx.restore();
  screenSpace();
  ctx.lineWidth = Math.max(8, R * 0.08); ctx.strokeStyle = '#E8B930'; ctx.beginPath(); ctx.arc(wc[0], wc[1], R, 0, 7); ctx.stroke();
  paint(() => { ctx.lineWidth = Math.max(3, R * 0.022); ctx.strokeStyle = '#9A7418'; ctx.beginPath(); ctx.arc(wc[0], wc[1], R * 1.03, 0, 7); ctx.stroke(); });
  return out;
}

// ---------------------------------------------------------------- the beat lanes (screen space)
// L: {k (shown), u (the playhead 0..1 or null), litL [0..1 x2], litR [0..1 x3], bad [{row 'L'|'R', u, k}], merge 0..1 (the rows
// glue into one), litM [0..1 x4] (NICE CUP OF TEA), words 0..1 (the syllables under the merged dots), tagL, tagR (0..1 the
// LEFT/RIGHT labels), y (the top row's y), glue 0..1 (the glue blob between the rows), ok 0..1 (a green tick), x 0..1 (a red X)}
const TB_LANE = { x0: 290, x1: 690, lx: 182, row: 104, bx1: 770 };
const TB_POS = { L: [0, 1 / 2], R: [0, 1 / 3, 2 / 3], M: [0, 1 / 3, 1 / 2, 2 / 3] };
function tbLanes(Ls, t) {
  const k = clamp(Ls.k || 0);
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(k, 1.8), y0 = Ls.y || 520, mg = E.inOutCubic(clamp(Ls.merge || 0)), RW = TB_LANE.row;
  const yL = lerp(y0, y0 + RW / 2, mg), yR = lerp(y0 + RW, y0 + RW / 2, mg);
  const X = (u) => lerp(TB_LANE.x0, TB_LANE.x1, u);
  ctx.save(); ctx.translate(540, y0 + RW / 2); ctx.scale(s, s); ctx.translate(-540, -(y0 + RW / 2));
  // the track boxes
  const box = (y, col) => { rrect(ctx, 130, y - 42, TB_LANE.bx1 - 130, 84, 42); ctx.fillStyle = rgba('#141428', 0.82); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = rgba(col, 0.9); ctx.stroke(); };
  if (mg < 0.98) { ctx.globalAlpha = 1; box(yL, TB_COL.L); box(yR, TB_COL.R); }
  else box(y0 + RW / 2, TB_COL.both);
  // the labels: a hand icon pill with the count
  const pill = (y, txt, col, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    circle(ctx, TB_LANE.lx, y, 34, col);
    ctx.font = '900 44px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#141428'; ctx.fillText(txt, TB_LANE.lx, y + 2);
    ctx.restore();
  };
  const nums = tbLanes.__nums || ['2', '3'];
  if (mg < 0.5) { pill(yL, nums[0], TB_COL.L, 1 - mg * 2); pill(yR, nums[1], TB_COL.R, 1 - mg * 2); }
  else pill(y0 + RW / 2, '1', TB_COL.both, (mg - 0.5) * 2);
  // the targets
  const dot = (x, y, r, col, lit) => {
    circle(ctx, x, y, r + 4, rgba(col, 0.35 + 0.65 * lit));
    circle(ctx, x, y, r, lit > 0.5 ? col : '#141428');
    if (lit > 0.05) softDot(gctx, x, y, r * 2.2, col, 0.55 * lit);
  };
  if (mg < 0.98) {
    TB_POS.L.forEach((u, i) => dot(X(u), yL, 20, TB_COL.L, (Ls.litL || [])[i] || 0));
    TB_POS.R.forEach((u, i) => dot(X(u), yR, 20, TB_COL.R, (Ls.litR || [])[i] || 0));
  } else {
    const cols = [TB_COL.both, TB_COL.R, TB_COL.L, TB_COL.R];
    TB_POS.M.forEach((u, i) => dot(X(u), y0 + RW / 2, i === 0 ? 28 : 22, cols[i], (Ls.litM || [])[i] || 0));
    const wk = clamp(Ls.words || 0);
    if (wk > 0.01) {
      const words = ['NICE', 'CUP', 'OF', 'TEA'];
      ctx.save(); ctx.font = '900 40px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      TB_POS.M.forEach((u, i) => {
        const lit = (Ls.litM || [])[i] || 0, above = i === 1 || i === 3, yy = y0 + RW / 2 + (above ? -72 : 74) - 6 * lit;
        ctx.globalAlpha = wk; ctx.lineWidth = 8; ctx.strokeStyle = '#141428'; ctx.strokeText(words[i], X(u), yy);
        ctx.fillStyle = lit > 0.5 ? cols[i] : '#FFFFFF'; ctx.fillText(words[i], X(u), yy);
      });
      ctx.restore();
    }
  }
  // red misses (a hand that hit where it should not), the glue blob
  for (const b of Ls.bad || []) {
    if (b.k <= 0.01) continue;
    const y = b.row === 'L' ? yL : yR, x = X(b.u);
    ctx.save(); ctx.globalAlpha = b.k;
    circle(ctx, x, y, 22, TB_COL.bad);
    ctx.lineWidth = 6; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9); ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9); ctx.stroke();
    ctx.restore();
  }
  // the playhead
  if (Ls.u !== null && Ls.u !== undefined && Ls.u >= 0) {
    const x = X(clamp(Ls.u, 0, 1.02)), ya = mg < 0.98 ? yL - 48 : y0 + RW / 2 - 50, yb = mg < 0.98 ? yR + 48 : y0 + RW / 2 + 50;
    line(ctx, x, ya, x, yb, 6, rgba('#FFFFFF', 0.95));
    softDot(gctx, x, (ya + yb) / 2, 50, '#FFFFFF', 0.25);
  }
  const gl = clamp(Ls.glue || 0);
  if (gl > 0.01 && mg < 0.98) {
    ctx.save(); ctx.globalAlpha = Math.min(1, gl * 2);
    const gy = (yL + yR) / 2;
    for (let i = 0; i < 6; i++) { const gx = lerp(240, 740, i / 5); ellipse(ctx, gx, gy, 40 * gl, 14 + 10 * gl, '#F4F6FF'); }
    ctx.restore();
  }
  ctx.restore();
}
