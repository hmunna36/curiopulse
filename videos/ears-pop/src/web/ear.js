// The ear in section (ears-pop): the outer ear and its canal, the eardrum, the little air pocket behind it (the middle
// ear) with its three tiny bones, the snail of the inner ear, and the eustachian tube that runs down from the pocket to
// the back of the nose, with the small muscle that pulls it open. Air is drawn as drifting particles: how many there
// are in a space is its pressure.
// World coords: the eardrum's centre is (0, 0). The canal runs left to the outside (x < -800), the pocket is on the
// right, the tube leaves the pocket's lower right corner (EAR.A) and ends at the back of the nose (EAR.Z).
// Nothing here is timed: scenes.js passes every state in (bulge, tube, densities, flow times from cues).
'use strict';

const EAR = {
  ox: -1340, oy: -760, w: 2900, h: 2300,           // the static layer's world rectangle
  T: [24, -96], B: [-24, 96],                       // the eardrum's rim (top, bottom)
  nrm: [-0.970, -0.243],                            // the eardrum's unit normal pointing OUT (into the canal)
  A: [222, 100], Z: [560, 600],                     // the tube's axis: from the pocket (A) to the back of the nose (Z)
  u: [0, 1], n: [1, 0], L: 1,                       // its direction, its normal (the upper-right side) and length (initEar)
  air: '#0A1730', airIn: '#0D2244', airNose: '#170F30',
  lining: '#F29AAA', skin: '#F2B892', muscleAt: [0.52, 0.78], anchor: [286, 742],
};
let EAR_STATIC = null, EAR_PART = null;

// ---------------------------------------------------------------- geometry
function earCanalTop(x) { return -64 - 32 * smooth(inv(-320, 24, x)) + 7 * Math.sin(x / 95) * (1 - smooth(inv(-240, 0, x))); }
function earCanalBot(x) { return 64 + 32 * smooth(inv(-320, -24, x)) + 7 * Math.sin(x / 110 + 1) * (1 - smooth(inv(-240, 0, x))); }
// the eardrum bows: b = +1 bulges out into the canal, -1 is sucked in toward the pocket (its centre moves 50 px)
function earDrumCtl(b) { return [EAR.nrm[0] * 100 * b, EAR.nrm[1] * 100 * b]; }
function earDrumMid(b) { return [EAR.nrm[0] * 50 * b, EAR.nrm[1] * 50 * b]; }
function earCanalPath(c, b) {
  const q = earDrumCtl(b);
  c.beginPath(); c.moveTo(-810, earCanalTop(-810));
  for (let x = -770; x <= 0; x += 35) c.lineTo(x, earCanalTop(x));
  c.lineTo(EAR.T[0], EAR.T[1]);
  c.quadraticCurveTo(q[0], q[1], EAR.B[0], EAR.B[1]);
  for (let x = -35; x >= -810; x -= 35) c.lineTo(x, earCanalBot(x));
  c.closePath();
}
function earPocketPath(c, b) {
  const q = earDrumCtl(b), n = EAR.n, A = EAR.A;
  c.beginPath(); c.moveTo(EAR.T[0], EAR.T[1]);
  c.bezierCurveTo(60, -170, 200, -180, 244, -100);                              // the roof
  c.bezierCurveTo(270, -56, 264, 30, A[0] + n[0] * 34, A[1] + n[1] * 34);       // the far wall, down to the tube's upper lip
  c.lineTo(A[0] - n[0] * 34, A[1] - n[1] * 34);                                // across the tube's mouth
  c.bezierCurveTo(150, 142, 50, 136, EAR.B[0], EAR.B[1]);                      // the floor
  c.quadraticCurveTo(q[0], q[1], EAR.T[0], EAR.T[1]);                          // the eardrum
  c.closePath();
}
// a point on the tube's centre line: s 0 (the pocket) .. 1 (the back of the nose); it bows a little
function earTubeP(s) {
  const bow = -22 * Math.sin(Math.PI * clamp(s));
  return [EAR.A[0] + EAR.u[0] * EAR.L * s + EAR.n[0] * bow, EAR.A[1] + EAR.u[1] * EAR.L * s + EAR.n[1] * bow];
}
// half-width of the tube's air channel at s. k = 0: the soft lower two thirds lie collapsed; k = 1: pulled open.
// The first third runs through bone and is always open.
function earTubeH(s, k) {
  if (s <= 0.34) return lerp(34, 13, smooth(inv(0, 0.34, s)));
  const open = lerp(13, 30, smooth(inv(0.34, 1, s)));
  const shut = s < 0.5 ? lerp(13, 2, smooth(inv(0.34, 0.5, s))) : (s < 0.9 ? 2 : lerp(2, 16, smooth(inv(0.9, 1, s))));
  return lerp(shut, open, clamp(k));
}
function earTubeWalls(k, pull = 0) {
  const N = 30, up = [], lo = [], [m0, m1] = EAR.muscleAt;
  for (let i = 0; i <= N; i++) {
    const s = i / N, p = earTubeP(s), h = earTubeH(s, k);
    // the muscle tugs the lower wall down where it is attached
    const tug = pull * 9 * Math.sin(Math.PI * inv(m0 - 0.1, m1 + 0.1, s));
    up.push([p[0] + EAR.n[0] * h, p[1] + EAR.n[1] * h]);
    lo.push([p[0] - EAR.n[0] * (h + tug), p[1] - EAR.n[1] * (h + tug)]);
  }
  return { up, lo };
}
function earTubePath(c, wl) {
  c.beginPath(); c.moveTo(wl.up[0][0], wl.up[0][1]);
  for (const p of wl.up) c.lineTo(p[0], p[1]);
  for (let i = wl.lo.length - 1; i >= 0; i--) c.lineTo(wl.lo[i][0], wl.lo[i][1]);
  c.closePath();
}
// the back of the nose: the big airway the tube opens into (off to the right: the nostrils; down: the throat)
function earNosePath(c) {
  const z = EAR.Z, n = EAR.n;
  c.beginPath(); c.moveTo(z[0] + n[0] * 30, z[1] + n[1] * 30);
  c.bezierCurveTo(650, 500, 780, 436, 980, 424);
  c.lineTo(1560, 392); c.lineTo(1560, 770);
  c.bezierCurveTo(1230, 800, 1090, 900, 1050, 1110);
  c.lineTo(1050, 1540); c.lineTo(650, 1540);
  c.bezierCurveTo(650, 1120, 612, 820, z[0] - n[0] * 30, z[1] - n[1] * 30);
  c.closePath();
}

// ---------------------------------------------------------------- the static layer + the particles
function initEar() {
  const dx = EAR.Z[0] - EAR.A[0], dy = EAR.Z[1] - EAR.A[1], L = Math.hypot(dx, dy);
  EAR.u = [dx / L, dy / L]; EAR.n = [dy / L, -dx / L]; EAR.L = L;
  const cv = mkCanvas(EAR.w, EAR.h), c = cv.getContext('2d'), rng = mulberry32(31);
  c.translate(-EAR.ox, -EAR.oy);
  const X0 = EAR.ox, Y0 = EAR.oy, X1 = EAR.ox + EAR.w, Y1 = EAR.oy + EAR.h;
  // soft tissue
  const g = c.createLinearGradient(0, Y0, 0, Y1);
  g.addColorStop(0, '#B94C63'); g.addColorStop(0.45, '#A43D59'); g.addColorStop(1, '#7A2845');
  c.fillStyle = g; c.fillRect(X0, Y0, EAR.w, EAR.h);
  for (let i = 0; i < 260; i++) {
    const x = lerp(X0, X1, rng()), y = lerp(Y0, Y1, rng()), r = 40 + rng() * 150;
    softDot(c, x, y, r, rng() < 0.5 ? '#D0667A' : '#6E2140', 0.10 + rng() * 0.08);
  }
  for (let i = 0; i < 46; i++) {                     // a few fine vessels
    let x = lerp(X0, X1, rng()), y = lerp(Y0, Y1, rng()), a = rng() * 6.28;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 7; k++) { a += (rng() - 0.5) * 1.1; x += Math.cos(a) * 46; y += Math.sin(a) * 46; c.lineTo(x, y); }
    c.lineWidth = 2 + rng() * 3; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = `rgba(120,26,58,${0.25 + rng() * 0.2})`; c.stroke();
  }
  // bone: the skull round the inner canal, the pocket and the inner ear
  const bone = new Path2D();
  const BP = [[-470, -150], [-430, -420], [-180, -520], [180, -548], [520, -500], [700, -330], [716, -40], [640, 150], [470, 292], [330, 336], [150, 312], [-110, 268], [-420, 262], [-486, 60]];
  bone.moveTo((BP[0][0] + BP[13][0]) / 2, (BP[0][1] + BP[13][1]) / 2);
  for (let i = 0; i < BP.length; i++) { const p = BP[i], q = BP[(i + 1) % BP.length]; bone.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  bone.closePath();
  const bg = c.createLinearGradient(0, -540, 0, 340); bg.addColorStop(0, '#F0D9B2'); bg.addColorStop(1, '#CDAA7C');
  c.fillStyle = bg; c.fill(bone);
  c.save(); c.clip(bone);
  for (let i = 0; i < 230; i++) {                    // spongy bone: pores
    const x = lerp(-490, 720, rng()), y = lerp(-550, 340, rng());
    ellipse(c, x, y, 6 + rng() * 15, 4 + rng() * 9, `rgba(160,118,74,${0.22 + rng() * 0.22})`, rng() * 3);
  }
  c.lineWidth = 26; c.strokeStyle = 'rgba(150,108,66,0.5)'; c.stroke(bone);
  c.restore();
  c.lineWidth = 6; c.strokeStyle = '#9A7448'; c.stroke(bone);
  // the inner ear: balance canals, the snail, the nerve
  const lil = '#9A7CEB', lilHi = '#CDBBFF', lilSh = '#6A4FC0';
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(430, -64); c.bezierCurveTo(560, -90, 640, -40, 760, -80); c.lineWidth = 34; c.strokeStyle = '#D9A93A'; c.stroke();
  c.lineWidth = 14; c.strokeStyle = '#F5D36E'; c.stroke();
  for (const [x, y, rx, ry, rot] of [[322, -214, 62, 96, -0.35], [404, -232, 60, 92, 0.3], [356, -178, 96, 50, 0.1]]) {
    c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); c.lineWidth = 26; c.strokeStyle = lilSh; c.stroke();
    c.lineWidth = 19; c.strokeStyle = lil; c.stroke(); c.lineWidth = 6; c.strokeStyle = lilHi; c.stroke();
  }
  ellipse(c, 318, -86, 58, 62, lilSh); ellipse(c, 316, -88, 52, 56, lil);                 // the vestibule
  const spiral = (w, col, r0) => {
    c.beginPath();
    for (let i = 0; i <= 90; i++) { const a = (i / 90) * Math.PI * 5.2, r = r0 * (1 - 0.74 * i / 90); const x = 404 + Math.cos(a + 2.6) * r, y = -44 + Math.sin(a + 2.6) * r * 0.92; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
    c.lineWidth = w; c.strokeStyle = col; c.lineJoin = 'round'; c.stroke();
  };
  ellipse(c, 404, -44, 86, 80, lilSh);
  spiral(30, lil, 70); spiral(9, lilHi, 70);
  // the outside (beyond the skin of the head, x < -800): the cabin, far out of focus
  c.fillStyle = '#131A3A'; c.fillRect(X0, Y0, -806 - X0, EAR.h);
  for (let i = 0; i < 22; i++) softDot(c, lerp(X0, -860, rng()), lerp(Y0, Y1, rng()), 60 + rng() * 150, ['#FFB870', '#6FA6FF', '#FF8FA6'][i % 3], 0.10 + rng() * 0.1);
  // the outer ear in section: two folds of skin round the canal's mouth
  for (const [x, y, rx, ry, rot] of [[-900, -250, 96, 214, -0.3], [-872, 206, 74, 132, 0.22]]) {
    ellipse(c, x, y, rx, ry, '#CF8663', rot); ellipse(c, x + 6, y - 4, rx - 12, ry - 12, EAR.skin, rot);
    ellipse(c, x + 14, y, rx * 0.34, ry * 0.7, '#F7D8BC', rot);                            // cartilage inside
  }
  // the skin of the head and the fat under it
  c.fillStyle = '#F6D9A6'; c.fillRect(-792, Y0, 46, EAR.h);
  const sg = c.createLinearGradient(-820, 0, -786, 0); sg.addColorStop(0, '#FFDCC4'); sg.addColorStop(1, '#E3A27E');
  c.fillStyle = sg; c.fillRect(-822, Y0, 36, EAR.h);
  EAR_STATIC = cv;

  // air particles, seeded inside each space (tested against the resting shapes)
  const probe = mkCanvas(4, 4).getContext('2d');
  const fill = (pathFn, n, x0, x1, y0, y1, seed) => {
    const r2 = mulberry32(seed), out = [];
    pathFn(probe);
    let guard = 0;
    while (out.length < n && guard++ < 20000) {
      const x = lerp(x0, x1, r2()), y = lerp(y0, y1, r2());
      if (probe.isPointInPath(x, y)) out.push({ x, y, ph: r2() * 6.28, w: 0.8 + r2() * 1.4, r: 4.2 + r2() * 2.6, rank: 0 });
    }
    // spread the ranks so a rising density fills the space evenly
    const order = out.map((_, i) => i).sort(() => r2() - 0.5);
    order.forEach((idx, k) => { out[idx].rank = (k + 0.5) / out.length; });
    return out;
  };
  probe.setTransform(1, 0, 0, 1, 0, 0);
  EAR_PART = {
    canal: fill((p) => earCanalPath(p, 0), 74, -800, -30, -92, 92, 5),
    pocket: fill((p) => earPocketPath(p, 0), 44, 12, 256, -166, 132, 9),
    nose: fill((p) => earNosePath(p), 60, 600, 1400, 440, 1300, 13),
  };
}

// ---------------------------------------------------------------- air
// dens: 1 = the pressure on the ground. Particles appear in rank order up to dens / 1.7.
// o: {push: [dx, dy] bias, jit: extra agitation, col, squash: fn(p) -> [x, y] remap}
function earAir(set, dens, t, o = {}) {
  const jit = 1 + (o.jit || 0), col = o.col || '#9FEAFF';
  for (const p of set) {
    const a = clamp((dens / 1.7 - p.rank) * 9);
    if (a <= 0.01) continue;
    let x = p.x + 9 * jit * Math.sin(t * p.w * 1.3 * jit + p.ph), y = p.y + 8 * jit * Math.cos(t * p.w * 1.1 * jit + p.ph * 1.7);
    if (o.map) [x, y] = o.map(x, y, p);
    circle(ctx, x, y, p.r, rgba(col, 0.85 * a)); circle(ctx, x - 1, y - 1, p.r * 0.42, rgba('#FFFFFF', 0.9 * a));
    softDot(gctx, x, y, p.r * 3.2, col, 0.5 * a);
  }
}
// particles streaming along the tube. dir +1: out of the pocket and into the nose; -1: from the nose up into the pocket
function earFlow(t, t0, dir, n = 12, dur = 0.55, col = '#C8F6FF') {
  for (let i = 0; i < n; i++) {
    const tau = (t - t0 - i * 0.04) / dur;
    if (tau <= 0 || tau >= 1.5) continue;
    const s = dir > 0 ? -0.12 + 1.45 * tau : 1.25 - 1.45 * tau;
    const sc = clamp(s), p = earTubeP(sc), h = Math.max(4, earTubeH(sc, 1)) * 0.6;
    let x = p[0] + EAR.n[0] * (hash(i * 3.1 + 2) - 0.5) * 2 * h, y = p[1] + EAR.n[1] * (hash(i * 3.1 + 2) - 0.5) * 2 * h;
    if (s > 1) { const k = s - 1; x += EAR.u[0] * k * 520 + (hash(i + 20) - 0.3) * 330 * k; y += EAR.u[1] * k * 420 + (hash(i + 31) - 0.5) * 300 * k; }
    if (s < 0) { const k = -s; x += -EAR.u[0] * k * 300 - 220 * k * hash(i + 5); y += -EAR.u[1] * k * 300 - (hash(i + 9) - 0.2) * 420 * k; }
    const a = Math.min(1, tau * 6, (1.5 - tau) * 3);
    const q = earTubeP(clamp(s - dir * 0.05));
    line(ctx, x, y, x + (q[0] - p[0]) * 0.9, y + (q[1] - p[1]) * 0.9, 5, rgba(col, 0.45 * a));
    circle(ctx, x, y, 7, rgba(col, a)); circle(ctx, x - 1.5, y - 1.5, 3, rgba('#FFFFFF', a));
    softDot(gctx, x, y, 26, '#7FE9FF', 0.8 * a);
  }
}

// ---------------------------------------------------------------- the three tiny bones (they ride on the eardrum)
function earBones(c, b) {
  const m = earDrumMid(b), ivory = '#FBEFD2', sh = '#B9976A';
  const dx = m[0] * 0.55, dy = m[1] * 0.55;
  c.save(); c.translate(dx, dy); c.lineCap = 'round'; c.lineJoin = 'round';
  const bone = (pts, w) => { poly(c, pts, w + 5, sh); poly(c, pts, w, ivory); };
  // the stirrup: a neck, two legs, a footplate on the inner ear's little window
  bone([[118, -44], [170, -42]], 9); bone([[170, -42], [214, -62], [246, -54]], 7); bone([[170, -42], [214, -24], [246, -30]], 7); bone([[248, -62], [250, -24]], 10);
  // the anvil
  bone([[96, -92], [118, -44]], 12); ellipse(c, 92, -94, 25, 21, sh, 0.3); ellipse(c, 91, -95, 21, 17, ivory, 0.3);
  // the hammer: its handle lies on the eardrum
  bone([[m[0] * 0.45 + 2, m[1] * 0.45 + 6], [34, -58], [54, -90]], 12); ellipse(c, 56, -96, 22, 19, sh, -0.3); ellipse(c, 55, -97, 18, 15, ivory, -0.3);
  c.restore();
}

// ---------------------------------------------------------------- the little muscle that opens the tube
// k = contraction 0..1: it shortens and thickens, and pulls the tube's lower wall down
function earMuscle(c, wl, k, glow = 0) {
  const N = wl.lo.length - 1, [m0, m1] = EAR.muscleAt, K = EAR.anchor;
  const a1 = wl.lo[Math.round(m0 * N)], a2 = wl.lo[Math.round(m1 * N)];
  const mid = [(a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2];
  const ax = K[0] - mid[0], ay = K[1] - mid[1], Lm = Math.hypot(ax, ay), ux = ax / Lm, uy = ay / Lm, px = -uy, py = ux;
  const belly = 46 + 30 * k, at = 0.42;
  const shape = () => {
    c.beginPath(); c.moveTo(a1[0], a1[1]);
    c.quadraticCurveTo(mid[0] + ux * Lm * at + px * belly, mid[1] + uy * Lm * at + py * belly, K[0] + px * 9, K[1] + py * 9);
    c.lineTo(K[0] - px * 9, K[1] - py * 9);
    c.quadraticCurveTo(mid[0] + ux * Lm * at - px * belly, mid[1] + uy * Lm * at - py * belly, a2[0], a2[1]);
    c.closePath();
  };
  shape(); c.fillStyle = '#8E1730'; c.fill();
  c.save(); shape(); c.clip();
  const g = c.createLinearGradient(mid[0] + px * 70, mid[1] + py * 70, mid[0] - px * 70, mid[1] - py * 70);
  g.addColorStop(0, '#B8243F'); g.addColorStop(0.5, mixHex('#E8415C', '#FF8A9A', 0.7 * k)); g.addColorStop(1, '#A51C38');
  c.fillStyle = g; c.fillRect(mid[0] - 400, mid[1] - 400, 800, 800);
  for (let i = -4; i <= 4; i++) {                      // the fibres
    const o = i * 9 * (1 + 0.45 * k);
    c.beginPath(); c.moveTo(mid[0] + px * o * 1.2, mid[1] + py * o * 1.2);
    c.quadraticCurveTo(mid[0] + ux * Lm * at + px * o * 1.6, mid[1] + uy * Lm * at + py * o * 1.6, K[0] + px * o * 0.15, K[1] + py * o * 0.15);
    c.lineWidth = 3; c.strokeStyle = 'rgba(110,14,36,0.5)'; c.stroke();
  }
  c.restore();
  shape(); c.lineWidth = 5; c.strokeStyle = '#6E0E24'; c.lineJoin = 'round'; c.stroke();
  // the tendon's anchor on the bone below
  ellipse(c, K[0], K[1], 22, 15, '#F0E0C0', Math.atan2(py, px)); ellipse(c, K[0], K[1], 14, 9, '#FFFFFF', Math.atan2(py, px));
  if (glow > 0.01) softDot(gctx, mid[0] + ux * Lm * 0.4, mid[1] + uy * Lm * 0.4, 150, '#FF5A78', 0.5 * glow);
  return { mid: [mid[0] + ux * Lm * 0.45, mid[1] + uy * Lm * 0.45] };
}

// ---------------------------------------------------------------- the whole section
// o: {bulge -1..1, tube 0..1 (open), pull 0..1 (the muscle contracting), canal, pocket, nose (densities, 1 = ground),
//     jit (agitation in the pocket), hiPocket, hiDrum, hiTube, hiNose (0..1 highlights), squeeze 0..1 (suction marks on
//     the tube), push (+1: the pocket pushes the drum out, -1: the canal pushes it in; 0..1 strength in pushK),
//     flows: [[t0, dir, n, dur]], shrink 0..1 (the pocket's air packs up when the drum is sucked in)}
function earSection(cam, t, o = {}) {
  const c = ctx, b = o.bulge || 0, tk = clamp(o.tube || 0), pull = clamp(o.pull || 0);
  applyCam(cam);
  c.drawImage(EAR_STATIC, EAR.ox, EAR.oy);
  const wl = earTubeWalls(tk, pull);
  // the tube's fleshy walls (under the air), then the muscle
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i <= 30; i++) { const p = earTubeP(i / 30); if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }
  c.lineWidth = 104; c.strokeStyle = '#8A2A48'; c.stroke();
  c.lineWidth = 92; c.strokeStyle = '#C95A74'; c.stroke();
  c.lineWidth = 60; c.strokeStyle = '#DB7088'; c.stroke();
  const mus = earMuscle(c, wl, pull, o.hiMuscle || 0);
  // the airways: the nose, the canal, the pocket, the tube
  earNosePath(c); c.fillStyle = EAR.airNose; c.fill(); c.lineWidth = 14; c.strokeStyle = '#B04A68'; c.stroke(); c.lineWidth = 6; c.strokeStyle = EAR.lining; c.stroke();
  earCanalPath(c, b);
  const cg = c.createLinearGradient(-800, 0, 0, 0); cg.addColorStop(0, '#16274E'); cg.addColorStop(1, EAR.air);
  c.fillStyle = cg; c.fill();
  // the canal is lined with skin (not across the eardrum, not across its mouth)
  for (const f of [earCanalTop, earCanalBot]) {
    c.beginPath(); for (let x = -810; x <= (f === earCanalTop ? 24 : -24); x += 30) { const y = f(x) + (f === earCanalTop ? -6 : 6); if (x === -810) c.moveTo(x, y); else c.lineTo(x, y); }
    c.lineTo(f === earCanalTop ? EAR.T[0] : EAR.B[0], (f === earCanalTop ? EAR.T[1] - 6 : EAR.B[1] + 6));
    c.lineWidth = 18; c.strokeStyle = '#CF8663'; c.stroke(); c.lineWidth = 10; c.strokeStyle = EAR.skin; c.stroke();
  }
  earPocketPath(c, b); c.fillStyle = EAR.airIn; c.fill();
  if (o.hiPocket > 0.01) { c.save(); earPocketPath(c, b); c.clip(); softDot(c, 130, -10, 260, '#3FB8FF', 0.42 * o.hiPocket); c.restore(); softDot(gctx, 130, -10, 250, '#3FB8FF', 0.5 * o.hiPocket); }
  // the pocket's lining (everything but the eardrum)
  { const n = EAR.n, A = EAR.A;
    c.beginPath(); c.moveTo(EAR.T[0], EAR.T[1]); c.bezierCurveTo(60, -170, 200, -180, 244, -100); c.bezierCurveTo(270, -56, 264, 30, A[0] + n[0] * 34, A[1] + n[1] * 34);
    c.moveTo(A[0] - n[0] * 34, A[1] - n[1] * 34); c.bezierCurveTo(150, 142, 50, 136, EAR.B[0], EAR.B[1]);
    c.lineWidth = 15; c.strokeStyle = '#B04A68'; c.stroke(); c.lineWidth = 7; c.strokeStyle = EAR.lining; c.stroke(); }
  earTubePath(c, wl); c.fillStyle = mixHex(EAR.airIn, EAR.airNose, 0.5); c.fill();
  for (const side of [wl.up, wl.lo]) { poly(c, side, 13, '#B04A68'); poly(c, side, 6, o.squeeze > 0.01 ? mixHex(EAR.lining, '#FF5A6E', 0.6 * o.squeeze) : EAR.lining); }
  if (o.hiTube > 0.01) { poly(gctx, wl.up, 26, rgba('#FF9A3C', 0.55 * o.hiTube)); poly(gctx, wl.lo, 26, rgba('#FF9A3C', 0.55 * o.hiTube)); }
  if (o.hiNose > 0.01) softDot(gctx, 800, 760, 420, '#FF86A6', 0.3 * o.hiNose);
  // the three little bones, then the eardrum over the hammer's handle
  earBones(c, b);
  const q = earDrumCtl(b);
  for (const [cc, w, col] of [[gctx, 30, rgba('#FFE3D0', 0.25 + 0.3 * (o.hiDrum || 0))], [c, 17, '#C98A78'], [c, 11, '#FFE9DA'], [c, 3.5, '#FFFFFF']]) {
    cc.beginPath(); cc.moveTo(EAR.T[0], EAR.T[1]); cc.quadraticCurveTo(q[0] + (w === 3.5 ? EAR.nrm[0] * 5 : 0), q[1], EAR.B[0], EAR.B[1]);
    cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col; cc.stroke();
  }
  // air
  const m = earDrumMid(b);
  earAir(EAR_PART.canal, o.canal === undefined ? 1 : o.canal, t, {
    map: (x, y) => { const near = smooth(inv(-170, -10, x)); return [x + Math.min(0, m[0]) * 1.25 * near + Math.max(0, m[0]) * 0.5 * near, y]; },   // the drum pushes the air next to it
  });
  earAir(EAR_PART.pocket, o.pocket === undefined ? 1 : o.pocket, t, {
    jit: o.jit || 0,
    map: (x, y) => { const near = 1 - smooth(inv(20, 200, x)); const sq = o.shrink || 0; return [x + m[0] * 0.9 * near + sq * 26 * near, lerp(y, y * 0.86, sq)]; },
  });
  earAir(EAR_PART.nose, o.nose === undefined ? 1 : o.nose, t, { col: '#FFC9DA' });
  for (const f of (o.flows || [])) earFlow(t, f[0], f[1], f[2], f[3]);
  // pressure pushing on the eardrum: little arrows marching at it
  const pk = o.pushK || 0;
  if (pk > 0.01 && o.push) {
    const dir = o.push, col = dir > 0 ? '#FFC24D' : '#FF5A6E';
    for (let i = -1; i <= 1; i++) {
      const ph = ((t * 1.6 + i * 0.21) % 1 + 1) % 1, along = i * 52;
      // start 150 px from the drum on the pushing side, march to it
      const side = dir > 0 ? -1 : 1, d0 = 150 - 104 * ph;
      const bx = m[0] + EAR.nrm[0] * side * d0 + -EAR.nrm[1] * along, by = m[1] + EAR.nrm[1] * side * d0 + EAR.nrm[0] * along;
      const hx = -EAR.nrm[0] * side, hy = -EAR.nrm[1] * side, a = pk * Math.sin(Math.PI * ph);
      for (const [cc, w] of [[c, 9], [gctx, 18]]) {
        line(cc, bx, by, bx + hx * 40, by + hy * 40, w, rgba(col, (cc === c ? 0.95 : 0.5) * a));
        line(cc, bx + hx * 40, by + hy * 40, bx + hx * 20 - hy * 17, by + hy * 20 + hx * 17, w, rgba(col, (cc === c ? 0.95 : 0.5) * a));
        line(cc, bx + hx * 40, by + hy * 40, bx + hx * 20 + hy * 17, by + hy * 20 - hx * 17, w, rgba(col, (cc === c ? 0.95 : 0.5) * a));
      }
    }
  }
  // suction: chevrons squeezing the tube's soft part from both sides
  if (o.squeeze > 0.01) {
    for (let i = 0; i < 4; i++) {
      const s = 0.50 + i * 0.105, p = earTubeP(s), ph = 0.5 + 0.5 * Math.sin(t * 9 - i * 0.9);
      for (const sd of [-1, 1]) {
        const d = 62 - 20 * ph, x = p[0] + EAR.n[0] * sd * d, y = p[1] + EAR.n[1] * sd * d, hx = -EAR.n[0] * sd, hy = -EAR.n[1] * sd;
        for (const [cc, w] of [[c, 8], [gctx, 16]]) for (const q2 of [-1, 1]) line(cc, x + hx * 18, y + hy * 18, x - hx * 2 + EAR.u[0] * 18 * q2, y - hy * 2 + EAR.u[1] * 18 * q2, w, rgba('#FF5A6E', (cc === c ? 0.95 : 0.5) * o.squeeze));
      }
    }
  }
  return { wl, mus, drum: m };
}

// ---------------------------------------------------------------- props for the section (screen space)
// a padlock; k = pop-in, open 0..1 = sprung (it falls away), ajar 0..1 = the shackle not pushed home yet
function padlock(x, y, s, k, open = 0, t = 0, ajar = 0) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.2) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y + 260 * open * open); ctx.rotate(0.5 * open); ctx.scale(sc, sc); ctx.globalAlpha = clamp(1.6 - open * 1.6);
  ctx.save(); ctx.translate(-22, -22 - 15 * ajar); ctx.rotate(-0.9 * clamp(open * 3)); ctx.translate(22, 22);
  ctx.beginPath(); ctx.arc(0, -24, 24, Math.PI, 0); ctx.lineTo(24, -4); ctx.moveTo(-24, -24); ctx.lineTo(-24, -4);
  ctx.lineWidth = 15; ctx.strokeStyle = '#59607A'; ctx.lineCap = 'butt'; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#C9D0E4'; ctx.stroke();
  ctx.restore();
  rrect(ctx, -40, -8, 80, 66, 14); const g = ctx.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#FFE07A'); g.addColorStop(0.5, '#FFC23A'); g.addColorStop(1, '#D98F12');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#8A5A08'; ctx.stroke();
  circle(ctx, 0, 18, 9, '#6A4406'); rrect(ctx, -4, 20, 8, 20, 3); ctx.fillStyle = '#6A4406'; ctx.fill();
  ctx.restore();
  softDot(gctx, x, y + 20, 80 * s, '#FFC23A', 0.5 * clamp(k) * (1 - open));
}
// a small front view of his head with the route from the ear to the back of the nose (k = pop-in, prog 0..1 = where we are)
function headMap(x, y, s, k, prog, t) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 1.8) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(sc, sc);
  circle(ctx, 0, 0, 104, 'rgba(8,12,34,0.9)'); ctx.beginPath(); ctx.arc(0, 0, 104, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = '#7FE9FF'; ctx.stroke();
  for (const sd of [-1, 1]) { ellipse(ctx, sd * 62, 6, 13, 18, PAL.skinSh); ellipse(ctx, sd * 62, 6, 7, 11, '#B8704F'); }
  ellipse(ctx, 0, 4, 62, 68, PAL.skin);
  ctx.beginPath(); ctx.moveTo(-64, 12); ctx.quadraticCurveTo(-72, -52, -30, -66); ctx.quadraticCurveTo(12, -84, 48, -60); ctx.quadraticCurveTo(74, -42, 64, 12);
  ctx.quadraticCurveTo(58, -20, 30, -32); ctx.quadraticCurveTo(2, -22, -20, -38); ctx.quadraticCurveTo(-50, -28, -64, 12); ctx.closePath(); ctx.fillStyle = PAL.hair; ctx.fill();
  for (const sd of [-1, 1]) { ellipse(ctx, sd * 23, 2, 8, 10, '#FFFFFF'); circle(ctx, sd * 23, 3, 4.5, PAL.pupil); }
  ellipse(ctx, 0, 22, 9, 7, 'rgba(190,110,80,0.75)');
  ctx.beginPath(); ctx.moveTo(-12, 44); ctx.quadraticCurveTo(0, 50, 12, 44); ctx.lineWidth = 4; ctx.strokeStyle = PAL.mouth; ctx.lineCap = 'round'; ctx.stroke();
  // the route: from the ear (left) in to the eardrum, then down the tube to behind the nose
  const R = [[-62, 6], [-36, 6], [-4, 26]];
  ctx.setLineDash([7, 6]); poly(ctx, R, 5, 'rgba(255,255,255,0.95)'); ctx.setLineDash([]);
  const seg = prog < 0.5 ? [R[0], R[1], prog * 2] : [R[1], R[2], (prog - 0.5) * 2];
  const px = lerp(seg[0][0], seg[1][0], seg[2]), py = lerp(seg[0][1], seg[1][1], seg[2]);
  circle(ctx, px, py, 10 + 2 * Math.sin(t * 9), '#FF9A3C'); circle(ctx, px, py, 4.5, '#FFFFFF');
  ctx.restore();
  softDot(gctx, x + (px) * sc, y + py * sc, 22 * s, '#FF9A3C', 0.4 * clamp(k));
}
