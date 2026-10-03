// The skin in section (goosebumps): epidermis, dermis, fat; hair follicles that lean, each with its own little
// muscle (the arrector pili) running from the follicle up to the underside of the skin; a nerve with a branch to every
// muscle. When a muscle shortens, its follicle swings upright and the skin around the hair bunches into a bump.
// Section coords: x to the right, y down, the resting skin surface at y = 0. Loaded before scenes.js.
'use strict';

const SKIN = { xs: [-1140, -760, -380, 0, 380, 760, 1140], aRel: 0.92, aUp: 0.07, fol: 330, hair: 262, mAt: 196, ax: 236, ay: 84, epi: 62 };
let SKIN_FAT = null, SKIN_COLL = null;

function initSkin() {
  const rng = mulberry32(51);
  SKIN_FAT = [...Array(110)].map(() => ({ x: -1700 + rng() * 3400, y: 590 + rng() * 700, r: 44 + rng() * 40 }));
  SKIN_COLL = [...Array(90)].map(() => ({ x: -1700 + rng() * 3400, y: 120 + rng() * 360, l: 50 + rng() * 80, a: (rng() - 0.5) * 0.9 }));
}

// the surface: a bump around each hair, a little dimple where its muscle pulls on the skin
function skinSurfY(x, bump) {
  let y = 0;
  for (let i = 0; i < SKIN.xs.length; i++) {
    const b = bump(i);
    if (b > 0.001) { const x0 = SKIN.xs[i]; y += -44 * b * Math.exp(-(((x - x0 - 8) / 92) ** 2)) + 13 * b * Math.exp(-(((x - x0 - SKIN.ax) / 60) ** 2)); }
  }
  return y;
}
const nerveY = (x) => 452 + 12 * Math.sin(x / 140);

// geometry of follicle i for contraction k: pore P, direction d (into the skin), root R, muscle ends B (on the follicle) and A
function follicle(i, k, bump) {
  const x0 = SKIN.xs[i], a = lerp(SKIN.aRel, SKIN.aUp, k);
  const P = [x0, skinSurfY(x0, bump)], d = [-Math.sin(a), Math.cos(a)], n = [Math.cos(a), Math.sin(a)];
  const R = [P[0] + d[0] * SKIN.fol, P[1] + d[1] * SKIN.fol];
  const B = [P[0] + d[0] * SKIN.mAt + n[0] * 20, P[1] + d[1] * SKIN.mAt + n[1] * 20];
  const A = [x0 + SKIN.ax, skinSurfY(x0 + SKIN.ax, bump) + SKIN.ay];
  const T = [P[0] - d[0] * SKIN.hair, P[1] - d[1] * SKIN.hair];
  return { x0, a, P, d, n, R, B, A, T, M: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] };
}

// o: {k: (i) => contraction 0..1, bump: (i) => 0..1, fire: time the nerve signal reaches the muscles (or undefined),
//  nerveGlow 0..1, hot: index of the follicle whose muscle is highlighted, hotK 0..1}
function skinSection(cam, t, o) {
  const c = ctx, kf = o.k || (() => 0), bump = o.bump || (() => 0);
  screenSpace();
  const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0B1233'); sky.addColorStop(0.5, '#152050'); sky.addColorStop(1, '#0A0F2A');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  softDot(c, 540, 520, 620, '#3E58B8', 0.18);
  applyCam(cam);
  const X0 = cam.x - 640 / cam.zoom, X1 = cam.x + 640 / cam.zoom, YB = cam.y + 1100 / cam.zoom;
  const surf = (x) => skinSurfY(x, bump);
  // dermis
  c.beginPath(); c.moveTo(X0, YB);
  for (let x = X0; x <= X1 + 12; x += 12) c.lineTo(x, surf(x) + 20);
  c.lineTo(X1 + 12, YB); c.closePath();
  const dg = c.createLinearGradient(0, 0, 0, 560); dg.addColorStop(0, '#F5ACA0'); dg.addColorStop(1, '#D97C78');
  c.fillStyle = dg; c.fill();
  // collagen: pale squiggles
  for (const q of SKIN_COLL) {
    if (q.x < X0 - 100 || q.x > X1 + 100) continue;
    c.beginPath(); c.moveTo(q.x - Math.cos(q.a) * q.l, q.y - Math.sin(q.a) * q.l);
    c.quadraticCurveTo(q.x, q.y + 16, q.x + Math.cos(q.a) * q.l, q.y + Math.sin(q.a) * q.l);
    c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,220,210,0.13)'; c.stroke();
  }
  // fat
  c.beginPath(); c.moveTo(X0, YB);
  for (let x = X0; x <= X1 + 24; x += 24) c.lineTo(x, 548 + 16 * Math.sin(x / 80) + 8 * Math.sin(x / 31));
  c.lineTo(X1 + 24, YB); c.closePath(); c.fillStyle = '#EDBE62'; c.fill();
  for (const f of SKIN_FAT) {
    if (f.x < X0 - 100 || f.x > X1 + 100) continue;
    circle(c, f.x, f.y, f.r, '#E3AE50'); circle(c, f.x - 3, f.y - 4, f.r - 5, '#F6D584'); ellipse(c, f.x - f.r * 0.3, f.y - f.r * 0.35, f.r * 0.3, f.r * 0.2, 'rgba(255,245,210,0.55)', -0.5);
  }
  // the nerve: a trunk through the deep dermis, one branch up to every muscle
  const F = SKIN.xs.map((_, i) => follicle(i, kf(i), bump));
  const ng = o.nerveGlow || 0, ncol = '#FFB83D';
  c.beginPath(); for (let x = X0; x <= X1 + 20; x += 20) c.lineTo(x, nerveY(x));
  c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#C97E16'; c.stroke(); c.lineWidth = 8; c.strokeStyle = ncol; c.stroke();
  const branch = (f, u) => {           // a point on follicle f's nerve branch, u 0 (at the trunk) .. 1 (on the muscle)
    const sx = f.x0 + 150, sy = nerveY(sx), m = 1 - u, cx = f.M[0] + 70, cy = (sy + f.M[1]) / 2 + 30;
    return [m * m * sx + 2 * m * u * cx + u * u * f.M[0], m * m * sy + 2 * m * u * cy + u * u * f.M[1]];
  };
  for (const f of F) {
    c.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const p = branch(f, u); u ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }
    c.lineWidth = 9; c.strokeStyle = '#C97E16'; c.stroke(); c.lineWidth = 5; c.strokeStyle = ncol; c.stroke();
  }
  if (ng > 0.01) {
    gctx.beginPath(); for (let x = X0; x <= X1 + 20; x += 20) gctx.lineTo(x, nerveY(x));
    gctx.lineWidth = 26; gctx.lineCap = 'round'; gctx.strokeStyle = rgba('#FFA020', 0.7 * ng); gctx.stroke();
  }
  // the signal: a pulse runs along the trunk, then up every branch at once, and lands on the muscles at o.fire
  if (o.fire !== undefined) {
    const tr = inv(o.fire - 0.62, o.fire - 0.24, t);
    if (tr > 0 && tr < 1) {
      for (let j = 0; j < 4; j++) {
        const x = lerp(X0 - 60, X1 + 60, tr) - j * 46;
        softDot(c, x, nerveY(x), 26 - j * 4, '#FFFFFF', 0.95 - j * 0.2); softDot(gctx, x, nerveY(x), 80 - j * 12, '#FFD060', 0.9 - j * 0.2);
      }
    }
    const br = inv(o.fire - 0.26, o.fire, t);
    if (br > 0 && br < 1) for (const f of F) for (let j = 0; j < 3; j++) {
      const p = branch(f, clamp(br - j * 0.09));
      softDot(c, p[0], p[1], 20 - j * 4, '#FFFFFF', 0.95 - j * 0.25); softDot(gctx, p[0], p[1], 64 - j * 12, '#FFD060', 0.9 - j * 0.25);
    }
  }
  // follicles: muscle, gland, sheath, bulb
  F.forEach((f, i) => {
    const k = kf(i), hot = (o.hot === i ? o.hotK || 0 : 0);
    // the muscle: a band that gets shorter and fatter, and lights up, as it pulls
    const w = lerp(26, 46, clamp(k)) * (1 + 0.14 * hot), col = mixHex('#D4587A', '#FF3F72', clamp(k + 0.6 * hot));
    const dx = f.A[0] - f.B[0], dy = f.A[1] - f.B[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const band = (cc, ww, style) => {
      cc.beginPath();
      for (let s = 0; s <= 1.001; s += 0.05) { const h = ww * (0.3 + 0.7 * Math.sin(Math.PI * s) ** 0.8) / 2; cc.lineTo(f.B[0] + dx * s + nx * h, f.B[1] + dy * s + ny * h); }
      for (let s = 1; s >= -0.001; s -= 0.05) { const h = ww * (0.3 + 0.7 * Math.sin(Math.PI * s) ** 0.8) / 2; cc.lineTo(f.B[0] + dx * s - nx * h, f.B[1] + dy * s - ny * h); }
      cc.closePath(); cc.fillStyle = style; cc.fill();
    };
    band(c, w + 9, '#A63A5C'); band(c, w, col);
    for (const q of [-0.26, 0, 0.26]) { c.beginPath(); c.moveTo(f.B[0] + dx * 0.08 + nx * w * q * 0.5, f.B[1] + dy * 0.08 + ny * w * q * 0.5); c.quadraticCurveTo(f.M[0] + nx * w * q, f.M[1] + ny * w * q, f.A[0] - dx * 0.08 + nx * w * q * 0.5, f.A[1] - dy * 0.08 + ny * w * q * 0.5); c.lineWidth = 3; c.strokeStyle = 'rgba(255,210,220,0.45)'; c.stroke(); }
    const act = clamp(k * 1.4) * 0.75 + hot * 0.8;
    if (act > 0.02) band(gctx, w + 16, rgba('#FF4A80', clamp(act)));
    // the nerve ending on it
    circle(c, f.M[0], f.M[1], 9, '#C97E16'); circle(c, f.M[0], f.M[1], 6, ncol);
    // sebaceous gland (in the angle between hair and muscle)
    const gx = f.P[0] + f.d[0] * 112 + f.n[0] * 46, gy = f.P[1] + f.d[1] * 112 + f.n[1] * 46;
    for (const [ox, oy, r] of [[0, 0, 30], [22, 12, 24], [-10, 22, 24], [14, -16, 20]]) { circle(c, gx + ox, gy + oy, r, '#D9A040'); }
    for (const [ox, oy, r] of [[0, 0, 30], [22, 12, 24], [-10, 22, 24], [14, -16, 20]]) { circle(c, gx + ox - 1, gy + oy - 1, r - 5, '#F7D774'); }
    // the follicle: a sheath from just under the surface down to the bulb
    const s0 = [f.P[0] + f.d[0] * 30, f.P[1] + f.d[1] * 30];
    line(c, s0[0], s0[1], f.R[0], f.R[1], 54, '#B9605E'); line(c, s0[0], s0[1], f.R[0], f.R[1], 42, '#E79D93');
    circle(c, f.R[0], f.R[1], 40, '#B9605E'); circle(c, f.R[0], f.R[1], 33, '#E79D93');
    ellipse(c, f.R[0] + f.d[0] * 20, f.R[1] + f.d[1] * 20, 15, 12, '#F9C7BC');
  });
  // epidermis: a band that follows the surface, with a pale top and rete ridges underneath
  c.beginPath();
  for (let x = X0; x <= X1 + 12; x += 12) c.lineTo(x, surf(x));
  for (let x = X1 + 12; x >= X0; x -= 12) c.lineTo(x, surf(x) + SKIN.epi + 7 * Math.sin(x / 21));
  c.closePath(); c.fillStyle = '#F6C7A4'; c.fill();
  c.beginPath(); for (let x = X1 + 12; x >= X0; x -= 12) c.lineTo(x, surf(x) + SKIN.epi + 7 * Math.sin(x / 21));
  c.lineWidth = 5; c.strokeStyle = '#E3A07E'; c.stroke();
  c.beginPath(); for (let x = X0; x <= X1 + 12; x += 12) c.lineTo(x, surf(x) + 7);
  c.lineWidth = 14; c.strokeStyle = '#FFE3CF'; c.stroke();
  // the hairs: root to tip, straight through the pore
  for (const f of F) {
    const r0 = [f.R[0] - f.d[0] * 34, f.R[1] - f.d[1] * 34];
    const px = f.n[0], py = f.n[1];
    c.beginPath();
    c.moveTo(r0[0] + px * 9, r0[1] + py * 9); c.lineTo(f.P[0] + px * 8, f.P[1] + py * 8); c.lineTo(f.T[0] + px * 2, f.T[1] + py * 2);
    c.lineTo(f.T[0] - px * 2, f.T[1] - py * 2); c.lineTo(f.P[0] - px * 8, f.P[1] - py * 8); c.lineTo(r0[0] - px * 9, r0[1] - py * 9); c.closePath();
    c.fillStyle = '#3B2416'; c.fill();
    line(c, f.P[0] - px * 3 + f.d[0] * 60, f.P[1] - py * 3 + f.d[1] * 60, f.T[0] - px * 0.5 + f.d[0] * 30, f.T[1] - py * 0.5 + f.d[1] * 30, 3, 'rgba(140,96,64,0.8)');
    // the pore: a soft dark collar where the hair leaves the skin
    ellipse(c, f.P[0], f.P[1] + 5, 17, 7, 'rgba(150,80,60,0.45)');
  }
  return F;
}

// a little ghost (screen space): "scared"
function ghostIcon(x, y, s, k, t) {
  if (k <= 0) return;
  const c = ctx, sc = E.outBack(clamp(k), 2) * s, wob = 6 * Math.sin(t * 5);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y + wob); c.rotate(0.08 * Math.sin(t * 3)); c.scale(sc, sc);
  c.beginPath(); c.moveTo(-52, 60); c.lineTo(-52, -10); c.bezierCurveTo(-52, -84, 52, -84, 52, -10); c.lineTo(52, 60);
  for (let i = 0; i < 4; i++) c.quadraticCurveTo(52 - i * 26 - 13, 60 + (i % 2 ? -22 : 22), 52 - (i + 1) * 26, 60);
  c.closePath(); c.fillStyle = '#F2F4FF'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A92C8'; c.stroke();
  ellipse(c, -18, -14, 9, 13, '#1A1C3A'); ellipse(c, 18, -14, 9, 13, '#1A1C3A'); ellipse(c, 0, 18, 10, 14, '#1A1C3A');
  c.restore();
  softDot(gctx, x, y, 110 * sc, '#C8A8FF', 0.6 * clamp(k));
}
// a snowflake (screen space): "cold"
function flakeIcon(x, y, s, k, t) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2) * s;
  for (const [c, w, col, f] of [[ctx, 10, '#DDF6FF', 1], [gctx, 20, 'rgba(140,220,255,0.75)', 0.5]]) {
    c.save(); c.setTransform(f, 0, 0, f, 0, 0); c.translate(x, y); c.rotate(t * 0.9); c.scale(sc, sc);
    c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = col;
    for (let i = 0; i < 6; i++) {
      c.rotate(Math.PI / 3);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -64); c.moveTo(0, -38); c.lineTo(-17, -55); c.moveTo(0, -38); c.lineTo(17, -55); c.stroke();
    }
    c.restore();
  }
}
