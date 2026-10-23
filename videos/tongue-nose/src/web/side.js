// Why Can't Your Tongue Touch Your NOSE? Short: his head from the side, as glass, nose to the right, his tongue out and
// curled up at his nose. Drawn in SECTION units (the origin between his lips; x forward, y down), placed in the world
// by SDW: world = SDW.o + SDW.s * section. The shots move the camera over it with camKeys, or show it in a window.
//   sdSection(t, o)    the whole cutaway. o: {reach 0..1 (1 = touching), squeeze 0..1 (rings squeeze it skinny: it gets
//                      thinner and longer), rings 0..1 (the squeeze rings shown), front 0..1 (the strap underneath lit),
//                      back 0..1 (the ties at the back lit: the fan to the chin bone, the cords to the throat bone),
//                      taut 0..1 (the ties pulled tight), noBone 0..1 (a dashed bone in it, struck out), quiver 0..1,
//                      gapMark 0..1, eye: {lookX, lookY}}. Returns world points: tip, nose, front, back, hyoid, chin
//   sdW(p)             a section point -> world
'use strict';

const SDW = { o: [700, 1000], s: 1.15 };
const SDC = { glass: '#0E1A3E', rim: '#9FE6FF', bone: '#EFE6CC', boneEdge: '#BCAE86', muscle: '#D9506A', musc2: '#B83A56', yel: '#FFD447', tongue: '#EF6F7E', tongueSh: '#D4566A', hair: '#2A1B14' };
const sdW = (p) => [SDW.o[0] + SDW.s * p[0], SDW.o[1] + SDW.s * p[1]];
const SD_NOSE_UNDER = [30, -110];          // the underside of his nose tip: the summit
const SD_HYOID = [-150, 172], SD_CHIN_IN = [-20, 74], SD_FLOOR = [-34, 30];

// the head and neck (one outline: stroke, then fill)
function sdHeadPath(c) {
  c.beginPath();
  c.moveTo(-150, 700);
  c.bezierCurveTo(-146, 420, -140, 260, -128, 210);              // the front of the neck
  c.bezierCurveTo(-112, 162, -60, 132, -22, 122);                 // under the chin
  c.bezierCurveTo(10, 112, 22, 84, 14, 60);                       // the chin
  c.bezierCurveTo(8, 42, 4, 30, 14, 20);                          // the lower lip, out
  c.bezierCurveTo(24, 12, 14, 4, 4, 4);
  c.lineTo(2, -40);                                               // the open mouth (the tongue comes out here)
  c.bezierCurveTo(14, -44, 18, -54, 10, -66);                     // the upper lip
  c.bezierCurveTo(4, -80, 0, -92, -6, -96);                       // up to the nose
  c.bezierCurveTo(10, -100, 30, -104, 44, -110);                  // under the nose
  c.bezierCurveTo(62, -118, 62, -142, 44, -152);                  // the tip
  c.bezierCurveTo(16, -176, -28, -228, -38, -268);                // the bridge
  c.bezierCurveTo(-46, -300, -40, -330, -52, -360);               // the brow
  c.bezierCurveTo(-80, -470, -200, -540, -320, -520);             // the forehead, the top of the head
  c.bezierCurveTo(-450, -500, -520, -360, -500, -200);            // the back of the head
  c.bezierCurveTo(-490, -60, -450, 40, -420, 120);
  c.bezierCurveTo(-404, 180, -398, 300, -400, 700);               // the back of the neck
  c.closePath();
}
// the tongue's middle line, root -> tip, and its half thickness along it (section units)
function sdTongueLine(reach, sq) {
  const r = clamp(reach, 0, 1.04), tip = [lerp(44, 31, r) - 2 * sq, lerp(-62, -111, r) - 9 * sq];
  const P = [[-196, 96], [-166, 24], [-96, -8], [-30, -18], [10, -22], [34, -34], [lerp(46, 44, r), lerp(-46, -62, r) - 4 * sq], tip];
  const pts = swDenseLocal(P, 8), acc = polyLen(pts), L = acc[acc.length - 1];
  const H = (u) => {   // half thickness at fraction u of its length
    const k = [[0, 22], [0.06, 40], [0.18, 50], [0.4, 40], [0.62, 18], [0.72, 14], [0.86, 11], [0.95, 8], [1, 0]];
    let i = 0; while (i < k.length - 2 && u > k[i + 1][0]) i++;
    const v = lerp(k[i][1], k[i + 1][1], clamp((u - k[i][0]) / (k[i + 1][0] - k[i][0])));
    return u < 0.55 ? v : v * (1 - 0.34 * sq);
  };
  return { pts, acc, L, H, tip };
}
function swDenseLocal(P, n = 10) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// a point at fraction u along the line, with its normal (pointing to the tongue's top side) and half thickness
function sdAt(TL, u) {
  const p = polyAt(TL.pts, TL.acc, clamp(u) * TL.L), q = polyAt(TL.pts, TL.acc, clamp(u + 0.01) * TL.L);
  let dx = q[0] - p[0], dy = q[1] - p[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  return { p: [p[0], p[1]], n: [dy, -dx], h: TL.H(u) };
}
function sdTonguePath(c, TL) {
  const top = [], bot = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60, A = sdAt(TL, u); top.push([A.p[0] + A.n[0] * A.h, A.p[1] + A.n[1] * A.h]); bot.push([A.p[0] - A.n[0] * A.h, A.p[1] - A.n[1] * A.h]); }
  c.beginPath(); top.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  for (let i = bot.length - 1; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
  c.closePath();
}

function sdSection(t, o = {}) {
  const c = ctx, reach = o.reach === undefined ? 0.8 : o.reach, sq = clamp(o.squeeze || 0);
  const q = (o.quiver || 0) * (0.6 * Math.sin(t * 44) + 0.4 * Math.sin(t * 71));
  const TL = sdTongueLine(reach + 0.012 * q, sq);
  const fr = clamp(o.front || 0), bk = clamp(o.back || 0), taut = clamp(o.taut || 0);
  c.save(); c.translate(SDW.o[0], SDW.o[1]); c.scale(SDW.s, SDW.s);
  // ---- the glass head and neck
  sdHeadPath(c); c.lineWidth = 6; c.strokeStyle = SDC.rim; c.stroke();
  sdHeadPath(c); c.fillStyle = SDC.glass; c.fill();
  paint(() => {
    // who this is: his hair, his eye (down at his tongue), his brow, his ear, a blue pyjama collar
    c.save(); sdHeadPath(c); c.clip();
    c.fillStyle = SDC.hair;
    c.beginPath(); c.moveTo(-520, -150); c.bezierCurveTo(-540, -420, -380, -560, -230, -540); c.bezierCurveTo(-120, -526, -60, -470, -44, -400);
    c.bezierCurveTo(-100, -440, -170, -446, -230, -430); c.bezierCurveTo(-330, -410, -400, -330, -420, -200); c.closePath(); c.fill();
    c.fillStyle = '#5C8FE0'; c.fillRect(-420, 560, 300, 160);
    line(c, -420, 560, -126, 548, 10, '#3F6BB8');
    c.restore();
    const ey = o.eye || {};
    ellipse(c, -62, -238, 15, 19, '#FFFFFF');
    circle(c, -56 + 4 * (ey.lookX === undefined ? 1 : ey.lookX), -232 + 6 * (ey.lookY === undefined ? 1 : ey.lookY), 8, '#15132A');
    circle(c, -54 + 4 * (ey.lookX === undefined ? 1 : ey.lookX), -236 + 6 * (ey.lookY === undefined ? 1 : ey.lookY), 2.6, '#FFFFFF');
    line(c, -84, -272, -36, -276 - 6 * (ey.brow || 0), 6, SDC.hair);
    ellipse(c, -300, -190, 30, 48, 'rgba(242,184,146,0.42)');
    c.beginPath(); c.ellipse(-300, -190, 18, 32, 0, -1.2, 1.9); c.lineWidth = 4; c.strokeStyle = 'rgba(160,96,70,0.5)'; c.stroke();
    // his nostril
    ellipse(c, 22, -112, 12, 5.5, 'rgba(70,20,32,0.85)', -0.25);
  });
  // ---- the roof of the mouth, the teeth
  paint(() => {
    c.beginPath(); c.moveTo(4, -40); c.bezierCurveTo(-40, -56, -150, -64, -236, -48); c.lineTo(-236, -32); c.bezierCurveTo(-150, -48, -40, -42, 4, -30); c.closePath(); c.fillStyle = '#E88AA0'; c.fill();
    rrect(c, -16, -44, 15, 18, 5); c.fillStyle = '#FFFFFF'; c.fill();          // the top front tooth
    rrect(c, -18, -2, 14, 16, 5); c.fillStyle = '#FFFFFF'; c.fill();           // the bottom front tooth
  });
  // ---- the bones: the lower jaw (chin to the hinge), the little bone in the throat
  const bone = (fn, w) => { paint(() => { fn(); c.lineWidth = w + 4; c.strokeStyle = SDC.boneEdge; c.stroke(); fn(); c.lineWidth = w; c.strokeStyle = SDC.bone; c.stroke(); }); };
  const jaw = () => { c.beginPath(); c.moveTo(-4, 30); c.bezierCurveTo(4, 70, -10, 104, -60, 112); c.bezierCurveTo(-140, 120, -220, 112, -262, 92); c.bezierCurveTo(-286, 60, -292, -10, -296, -66); };
  c.globalAlpha = 0.85; bone(jaw, 22); c.globalAlpha = 1;
  const hy = () => { c.beginPath(); c.moveTo(SD_HYOID[0] - 36, SD_HYOID[1] + 2); c.quadraticCurveTo(SD_HYOID[0] + 6, SD_HYOID[1] - 8, SD_HYOID[0] + 34, SD_HYOID[1] + 4); };
  bone(hy, 14);
  // ---- the ties at the BACK: a fan of muscle from the inside of the chin bone into the tongue, cords from the throat bone
  const ties = [];   // {a, b, g: which beat lights it}
  for (const u of [0.14, 0.24, 0.34, 0.44, 0.54]) { const A = sdAt(TL, u); ties.push({ a: SD_CHIN_IN, b: [A.p[0] - A.n[0] * A.h * 0.85, A.p[1] - A.n[1] * A.h * 0.85], g: fr, w: 5.5 }); }
  for (const [u, dx] of [[0.0, -24], [0.05, 0], [0.12, 26]]) { const A = sdAt(TL, u); ties.push({ a: [SD_HYOID[0] + dx, SD_HYOID[1] - 4], b: [A.p[0] - A.n[0] * A.h * 0.7, A.p[1] - A.n[1] * A.h * 0.7], g: bk, w: 7 }); }
  paint(() => {
    for (const T of ties) {
      const mx = (T.a[0] + T.b[0]) / 2 - 8 * (1 - taut), my = (T.a[1] + T.b[1]) / 2 + 6 * (1 - taut);
      c.beginPath(); c.moveTo(T.a[0], T.a[1]); c.quadraticCurveTo(mx, my, T.b[0], T.b[1]);
      c.lineWidth = T.w + 3.5; c.lineCap = 'round'; c.strokeStyle = rgba('#3A0C24', 0.6); c.stroke();
      c.lineWidth = T.w; c.strokeStyle = rgba(mixH(SDC.muscle, SDC.yel, T.g), 0.75 + 0.25 * T.g); c.stroke();
    }
  });
  for (const T of ties) if (T.g > 0.02) { const m = [(T.a[0] + T.b[0]) / 2, (T.a[1] + T.b[1]) / 2], W = sdW(m); softDot(gctx, W[0], W[1], 60, SDC.yel, 0.2 * T.g); }
  // ---- the tongue: muscle all through (no bone), lit edge
  actor(() => { sdTonguePath(c, TL); c.fillStyle = SDC.tongue; c.fill(); });
  paint(() => {
    c.save(); sdTonguePath(c, TL); c.clip();
    // muscle fibres along it (faint), the shine on top
    for (let j = -2; j <= 2; j++) {
      const P = []; for (let i = 0; i <= 40; i++) { const A = sdAt(TL, i / 40); P.push([A.p[0] + A.n[0] * A.h * j * 0.38, A.p[1] + A.n[1] * A.h * j * 0.38]); }
      poly(c, P, 2.2, rgba('#B23A55', 0.35));
    }
    const S = []; for (let i = 6; i <= 52; i++) { const A = sdAt(TL, i / 60); S.push([A.p[0] + A.n[0] * A.h * 0.62, A.p[1] + A.n[1] * A.h * 0.62]); }
    poly(c, S, 4, rgba('#FFFFFF', 0.2));
    c.restore();
  });
  // ---- the strap at the FRONT: from under the tongue down to the floor of the mouth, behind the bottom teeth
  const FA = sdAt(TL, 0.6), FT = [FA.p[0] - FA.n[0] * FA.h * 0.9, FA.p[1] - FA.n[1] * FA.h * 0.9];
  paint(() => {
    const bow = 5 * (1 - taut);
    c.beginPath(); c.moveTo(SD_FLOOR[0], SD_FLOOR[1]); c.quadraticCurveTo((SD_FLOOR[0] + FT[0]) / 2 - bow, (SD_FLOOR[1] + FT[1]) / 2, FT[0], FT[1]);
    c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = rgba('#5A1028', 0.7); c.stroke();
    c.lineWidth = 6; c.strokeStyle = mixH('#F49AAE', SDC.yel, fr); c.stroke();
    ellipse(c, SD_FLOOR[0] - 4, SD_FLOOR[1] + 6, 26, 8, '#C8526A');                 // the floor of the mouth
  });
  if (fr > 0.02) { const W = sdW([(SD_FLOOR[0] + FT[0]) / 2, (SD_FLOOR[1] + FT[1]) / 2]); softDot(gctx, W[0], W[1], 60, SDC.yel, 0.5 * fr); }
  // tension marks by the ties when they are pulled tight
  if (taut > 0.05) paint(() => {
    const marks = (p, n0) => { for (let i = 0; i < 3; i++) { const a = n0 + (i - 1) * 0.5, j = 1.5 * Math.sin(t * 40 + i * 2); line(c, p[0] + Math.cos(a) * (12 + j), p[1] + Math.sin(a) * (12 + j), p[0] + Math.cos(a) * (22 + j), p[1] + Math.sin(a) * (22 + j), 2.6, rgba('#FFFFFF', 0.9 * taut)); } };
    marks([(SD_FLOOR[0] + FT[0]) / 2 - 6, (SD_FLOOR[1] + FT[1]) / 2], Math.PI);
    marks([SD_HYOID[0] - 10, SD_HYOID[1] - 40], Math.PI * 1.15);
  });
  // ---- no bone inside: a dashed bone, struck out
  const nb = clamp(o.noBone || 0);
  if (nb > 0.01) {
    const A = sdAt(TL, 0.3), ang = Math.atan2(-A.n[0], A.n[1]);
    paint(() => {
      c.save(); c.translate(A.p[0], A.p[1]); c.rotate(ang + Math.PI / 2); c.scale(nb, nb);
      c.setLineDash([7, 5]); c.lineWidth = 3.4; c.strokeStyle = 'rgba(255,255,255,0.95)';
      c.beginPath(); c.moveTo(-58, -7); c.lineTo(58, -7); c.moveTo(-58, 7); c.lineTo(58, 7); c.stroke();
      for (const e of [-1, 1]) for (const sd of [-1, 1]) { c.beginPath(); c.arc(e * 66, sd * 9, 10, 0, 7); c.stroke(); }
      c.setLineDash([]);
      const xk = clamp((nb - 0.45) / 0.55);
      if (xk > 0) for (const s of [-1, 1]) line(c, -30 * xk, -30 * s * xk, 30 * xk, 30 * s * xk, 9, '#E8344A');
      c.restore();
    });
  }
  // ---- the squeeze: rings across the front of the tongue that tighten (it gets thinner, so it gets longer)
  const rg = clamp(o.rings || 0);
  if (rg > 0.01) {
    const ph = o.ringPh || 0;
    for (let i = 0; i < 6; i++) {
      const u = 0.5 + i * 0.075; if (u > 0.95) continue;
      const A = sdAt(TL, u), pulse = 0.5 + 0.5 * Math.sin(ph - i * 0.9), w = A.h * (1.06 - 0.12 * pulse);
      paint(() => {
        c.save(); c.translate(A.p[0], A.p[1]); c.rotate(Math.atan2(A.n[1], A.n[0]));
        c.beginPath(); c.ellipse(0, 0, w + 3, 4 + 2 * pulse, 0, 0, Math.PI * 2);
        c.lineWidth = 3.2; c.strokeStyle = rgba(SDC.yel, rg * (0.6 + 0.4 * pulse)); c.stroke();
        for (const e of [-1, 1]) line(c, e * (w + 10), 0, e * (w + 3), 0, 2.4, rgba(SDC.yel, rg * pulse));   // inward ticks
        c.restore();
      });
      const W = sdW(A.p); softDot(gctx, W[0], W[1], 46, SDC.yel, 0.22 * rg * pulse);
    }
  }
  // ---- the gap to the nose: a little measuring mark
  const gm = clamp(o.gapMark || 0), tip = TL.tip;
  if (gm > 0.01 && tip[1] > SD_NOSE_UNDER[1] + 4) paint(() => {
    const x = tip[0] + 22, a = SD_NOSE_UNDER[1] + 2, b = tip[1] - 2;
    c.globalAlpha = gm;
    for (const [w, col] of [[6, '#0B0B1A'], [3, '#FFD447']]) { line(c, x, a, x, b, w, col); line(c, x - 7, a, x + 7, a, w, col); line(c, x - 7, b, x + 7, b, w, col); }
    c.globalAlpha = 1;
  });
  c.restore();
  return { tip: sdW(tip), nose: sdW(SD_NOSE_UNDER), front: sdW([(SD_FLOOR[0] + FT[0]) / 2, (SD_FLOOR[1] + FT[1]) / 2]), back: sdW([SD_HYOID[0] + 10, SD_HYOID[1] - 50]),
    hyoid: sdW(SD_HYOID), chin: sdW(SD_CHIN_IN), mid: sdW(sdAt(TL, 0.3).p), front2: sdW(sdAt(TL, 0.75).p), gap: Math.max(0, tip[1] - SD_NOSE_UNDER[1]) };
}
// the dark field behind the glass head
function sdBg(cam, t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0A1030'); g.addColorStop(1, '#03050F');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  paint(() => { for (let i = 0; i < 34; i++) { const x = -300 + 1700 * hash(i * 3.1), y = -100 + 2300 * hash(i * 7.7 + 1); circle(ctx, x, y, 2 + 3 * hash(i + 5), rgba('#6FA8FF', 0.15 + 0.2 * hash(i * 1.3))); } });
}
