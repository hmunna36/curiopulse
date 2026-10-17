// Why Do You Feel TWO Noses? Short: his right hand at his nose, the middle finger crossed over the index (Aristotle's
// illusion), seen in the bathroom mirror: the back of the hand is to us, the thumb on the outside (screen right), the
// index next to it, then the middle, ring and little fingers toward the middle of his face.
//   xHand(c, pal, H, t)      the hand in HEAD units (the nose tip is at (0, 20); call it inside mirInHead)
//   xHandPts(H)              where its parts are (head units): wrist, knuckles, tips, the two outside edges
//   feltNose(x, y, s, k, t)  the "felt" second nose: a dashed ghost of his nose tip (world units, camera applied)
// H = {cross: 0 (side by side) .. 1 (crossed), dx, dy (the whole hand, head units), edges: 0..1 (the two OUTSIDE edges
//      glow), tape: 0..1 (a strip of white tape round both fingers: the six-month volunteers), lift: 0..1 (the fingers
//      raised up off the nose, for luck)}
'use strict';

const XF = {
  wrist: [16, 136],
  kI: [34, 84], kM: [6, 82], kR: [-14, 88], kL: [-30, 96],     // knuckles: index, middle, ring, little (wide apart: the X shows mid-finger)
  tipI0: [38, 28], tipI1: [-15, 26],                            // the index's tip: side by side .. crossed (behind the middle)
  tipM0: [4, 22], tipM1: [17, 24],                              // the middle's tip
  wI: 14.5, wM: 15.5,                                           // finger widths
};
const XF_SKIN = '#F2B48C', XF_SH = '#D98E6A', XF_NAIL = '#F9D6CC';

function xHandPts(H = {}) {
  const k = clamp(H.cross === undefined ? 1 : H.cross), dx = H.dx || 0, dy = H.dy || 0, lf = H.lift || 0;
  const P = (p) => [p[0] + dx + 58 * lf, p[1] + dy - 18 * lf];   // lift: up beside his cheek, for luck
  const tipI = P(lerp2x(XF.tipI0, XF.tipI1, E.inOutSine(k))), tipM = P(lerp2x(XF.tipM0, XF.tipM1, k));
  const kI = P(XF.kI), kM = P(XF.kM);
  // the side of each fingertip that faces OUT when the fingers sit side by side: the index's thumb side (its right),
  // the middle's ring side (its left). Crossed, both face the gap between the tips: the nose.
  const nrm = (a, b, side) => { const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy) || 1; return [side * -uy / L, side * ux / L]; };
  const nI = nrm(kI, tipI, -1), nM = nrm(kM, tipM, 1);
  return {
    wrist: P(XF.wrist), kI, kM, kR: P(XF.kR), kL: P(XF.kL), tipI, tipM,
    edgeI: [tipI[0] + nI[0] * XF.wI / 2, tipI[1] + nI[1] * XF.wI / 2], edgeM: [tipM[0] + nM[0] * XF.wM / 2, tipM[1] + nM[1] * XF.wM / 2],
    nI, nM,
  };
}
function lerp2x(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }

// one finger: a tapered capsule from the knuckle to the tip, with a nail and two creases (back of the hand to us)
function xFinger(c, a, b, w, col, glow) {
  const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L;
  c.beginPath();
  c.moveTo(a[0] + nx * w * 0.56, a[1] + ny * w * 0.56);
  c.lineTo(b[0] + nx * w * 0.47, b[1] + ny * w * 0.47);
  c.arc(b[0], b[1], w * 0.47, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  c.lineTo(a[0] - nx * w * 0.56, a[1] - ny * w * 0.56);
  c.arc(a[0], a[1], w * 0.56, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
  c.closePath(); c.fillStyle = col; c.fill();
  paint(() => {
    c.lineWidth = 1.8; c.lineJoin = 'round'; c.strokeStyle = 'rgba(150,76,50,0.85)'; c.stroke();   // its outline: the X must read
    // the nail, near the tip
    const nxp = b[0] - (ux / L) * w * 0.55, nyp = b[1] - (uy / L) * w * 0.55;
    ellipse(c, nxp, nyp, w * 0.27, w * 0.42, XF_NAIL, Math.atan2(uy, ux) + Math.PI / 2);
    ellipse(c, nxp - nx * w * 0.06, nyp - ny * w * 0.06 - 1, w * 0.1, w * 0.2, 'rgba(255,255,255,0.75)', Math.atan2(uy, ux) + Math.PI / 2);
    // knuckle creases across the finger
    for (const f of [0.36, 0.64]) {
      const px = a[0] + ux * f, py = a[1] + uy * f;
      for (const o of [-0.09, 0.09]) c.beginPath(), c.moveTo(px + nx * w * 0.3 + (ux / L) * o * w, py + ny * w * 0.3 + (uy / L) * o * w),
        c.quadraticCurveTo(px + (ux / L) * (o * w + 1.5), py + (uy / L) * (o * w + 1.5), px - nx * w * 0.3 + (ux / L) * o * w, py - ny * w * 0.3 + (uy / L) * o * w),
        c.lineWidth = 1.1, c.lineCap = 'round', c.strokeStyle = 'rgba(160,82,56,0.55)', c.stroke();
    }
  });
  void glow;
}

// the hand, in head units
function xHand(c, pal, H = {}, t = 0) {
  const p = xHandPts(H), skin = pal && pal.skin ? pal.skin : XF_SKIN, sh = pal && pal.skinSh ? pal.skinSh : XF_SH;
  const lf = H.lift || 0;
  // the back of the hand: from the wrist up to the knuckle line
  c.beginPath();
  c.moveTo(p.wrist[0] - 22, p.wrist[1] + 2);
  c.quadraticCurveTo(p.kL[0] - 12, p.kL[1] + 22, p.kL[0] - 6, p.kL[1] - 2);
  c.quadraticCurveTo(p.kR[0] - 4, p.kR[1] - 10, p.kM[0], p.kM[1] - 8);
  c.quadraticCurveTo(p.kI[0] + 4, p.kI[1] - 10, p.kI[0] + 10, p.kI[1] + 2);
  c.quadraticCurveTo(p.kI[0] + 20, p.kI[1] + 24, p.wrist[0] + 20, p.wrist[1] + 2);
  c.closePath(); c.fillStyle = skin; c.fill();
  paint(() => { c.lineWidth = 1.8; c.lineJoin = 'round'; c.strokeStyle = 'rgba(150,76,50,0.7)'; c.stroke(); });
  // the ring and little fingers, curled into the palm: from behind they are two rounded knuckle rows
  for (const [kk, w] of [[p.kL, 14], [p.kR, 15]]) {
    rrect(c, kk[0] - w / 2, kk[1] - 6, w, 26, w / 2); c.fillStyle = mixH(skin, sh, 0.12); c.fill();
    paint(() => { c.lineWidth = 1.6; c.strokeStyle = 'rgba(150,76,50,0.6)'; c.stroke(); });
  }
  // the thumb, along the outside, tucked over the curled fingers
  const th0 = [p.wrist[0] + 18, p.wrist[1] - 18], th1 = [p.kI[0] + 12, p.kI[1] + 6 + 8 * lf];
  line(c, th0[0], th0[1], th1[0], th1[1], 16, skin);
  paint(() => {
    // tendons on the back of the hand, and the curled fingers' creases
    for (const kk of [p.kI, p.kM, p.kR, p.kL]) line(c, kk[0] * 0.75 + p.wrist[0] * 0.25, kk[1] * 0.75 + p.wrist[1] * 0.25 + 4, kk[0] * 0.25 + p.wrist[0] * 0.75, kk[1] * 0.25 + p.wrist[1] * 0.75 - 6, 1.1, 'rgba(176,96,66,0.18)');
    for (const kk of [p.kL, p.kR]) { c.beginPath(); c.moveTo(kk[0] - 6, kk[1] + 10); c.quadraticCurveTo(kk[0], kk[1] + 13, kk[0] + 6, kk[1] + 10); c.lineWidth = 1.4; c.strokeStyle = 'rgba(160,82,56,0.5)'; c.stroke(); }
    ellipse(c, th1[0] - 1, th1[1] + 3, 4.5, 6, XF_NAIL, -0.3);
  });
  // the index finger (behind), then the middle finger over it
  xFinger(c, p.kI, p.tipI, XF.wI, mixH(skin, sh, 0.22));
  // the index's shade where the middle lies on it
  paint(() => {
    const k = clamp(H.cross === undefined ? 1 : H.cross);
    if (k > 0.2) { c.save(); c.globalAlpha = 0.28 * k; xFingerPath(c, p.kM, p.tipM, XF.wM + 5); c.fillStyle = sh; c.fill(); c.restore(); }
  });
  xFinger(c, p.kM, p.tipM, XF.wM, skin);
  // the tape (the volunteers kept them crossed for months)
  const tp = H.tape || 0;
  if (tp > 0.01) {
    const cx = lerp(p.kM[0], p.tipM[0], 0.42), cy = lerp(p.kM[1], p.tipM[1], 0.42);
    c.save(); c.translate(cx, cy); c.rotate(-0.12); c.scale(1, clamp(tp * 1.4, 0, 1));
    rrect(c, -27, -8, 54, 16, 4); c.fillStyle = '#F4F1E8'; c.fill();
    paint(() => { for (let i = -2; i <= 2; i++) line(c, -24, i * 2.6, 24, i * 2.6, 0.7, 'rgba(150,140,120,0.35)'); line(c, 20, -8, 23, 8, 1.2, 'rgba(150,140,120,0.6)'); });
    c.restore();
  }
  // the two OUTSIDE edges, glowing (the bit the brain reads): a bright line along each tip's outer side
  const ek = H.edges || 0;
  if (ek > 0.01) paint(() => {
    for (const [kk, tip, n, w] of [[p.kI, p.tipI, p.nI, XF.wI], [p.kM, p.tipM, p.nM, XF.wM]]) {
      const ux = tip[0] - kk[0], uy = tip[1] - kk[1], L = Math.hypot(ux, uy) || 1;
      const a = [tip[0] + n[0] * w * 0.5 - (ux / L) * 22, tip[1] + n[1] * w * 0.5 - (uy / L) * 22], b = [tip[0] + n[0] * w * 0.5, tip[1] + n[1] * w * 0.5];
      line(c, a[0], a[1], b[0], b[1], 5.2 * ek, '#1A1030');
      line(c, a[0], a[1], b[0], b[1], 3.4 * ek, '#FFD447');
    }
  });
  return p;
}
function xFingerPath(c, a, b, w) {
  const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L;
  c.beginPath();
  c.moveTo(a[0] + nx * w * 0.5, a[1] + ny * w * 0.5); c.lineTo(b[0] + nx * w * 0.5, b[1] + ny * w * 0.5);
  c.arc(b[0], b[1], w * 0.5, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  c.lineTo(a[0] - nx * w * 0.5, a[1] - ny * w * 0.5); c.closePath();
}

// the felt second nose: a see-through copy of his nose tip and wings with a dashed yellow outline (world units, the
// camera applied). k 0..1 pops it in.
function feltNose(x, y, s, k, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.2) * s, wob = 1 + 0.035 * Math.sin(t * 17);
  const skin = '#F2B48C', tip = mixH(skin, '#EE7E5E', 0.42), wing = mixH(skin, '#DC6848', 0.52);
  ctx.save(); ctx.translate(x, y); ctx.scale(q * wob, q / wob);
  ctx.globalAlpha = 0.62;
  for (const sd of [-1, 1]) ellipse(ctx, sd * 15, 6, 9, 8.5, wing);
  ellipse(ctx, 0, 0, 15, 13.2, tip);
  for (const sd of [-1, 1]) ellipse(ctx, sd * 8.5, 10, 6.2, 4.3, '#451420', sd * 0.24);
  ellipse(ctx, -4.4, -6.5, 5, 3.2, 'rgba(255,246,236,0.9)');
  ctx.globalAlpha = 1;
  ctx.setLineDash([5, 3.6]); ctx.lineDashOffset = -t * 26;
  const outline = (w, col) => {
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, 15.5, 13.7, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 15, 6, 9.6, 9.1, 0, sd > 0 ? -1.3 : Math.PI * 0.55, sd > 0 ? Math.PI * 0.45 : Math.PI + 1.3); ctx.stroke(); }
  };
  outline(3.6, '#1A1030'); outline(2.2, '#FFD447');
  ctx.setLineDash([]);
  ctx.restore();
  gctx.save(); gctx.translate(x, y); gctx.scale(q, q); ellipse(gctx, 0, 4, 26, 18, 'rgba(255,212,71,0.09)'); gctx.restore();
}
