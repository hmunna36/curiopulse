// Can You Say MIT's HARDEST Tongue Twister? 👅 Short: his head from the side as glass, facing right, the mouth in
// section (after tongue-nose's side.js). SECTION units: the origin between his lips, x forward, y down; placed in the
// world by TWSW (world = o + s * section).
//   twSection(t, o)   o: {lips 0..1 (pressed shut: a P), back 0..1 (the back of the tongue up against the soft palate:
//                     a K), tip 0..1 (the tip up behind the top teeth: a D), open 0..1 (the jaw drops), glowP / glowK /
//                     glowD 0..1 (that spot lit), puffP / puffK 0..1 (a puff of air on its way out), mic 0..1 (the mic in
//                     front of his lips), eye: {lookX, lookY}}. Returns world points: lips, back, tip, throat, nose
//   twSecBg(cam, t)   the dark field behind the glass head
//   twSW(p)           a section point -> world
'use strict';

const TWSW = { o: [700, 1000], s: 1.15 };
const TWC = { glass: '#0E1A3E', rim: '#9FE6FF', hair: '#2A1B14', roof: '#E88AA0', velum: '#D86C8C', tongue: '#EF6F7E', tongueDk: '#B23A55', lip: '#E07A86', P: '#FFD447', K: '#7FE9FF', D: '#4DFFB4' };
const twSW = (p) => [TWSW.o[0] + TWSW.s * p[0], TWSW.o[1] + TWSW.s * p[1]];
const TW_VEL = [-150, -56];                         // where the back of the tongue meets the soft palate (a K)
const TW_RIDGE = [-14, -40];                        // the ridge behind the top teeth (a D)

// the head and neck, one outline; the lips meet at y = -18 when shut, part by g, the jaw drops d
function twHeadPath(c, g, d) {
  const ul = -18 - g / 2, ll = -18 + g / 2 + d;
  c.beginPath();
  c.moveTo(-150, 700);
  c.bezierCurveTo(-146, 420, -140, 260, -128, 210 + d * 0.3);              // the front of the neck
  c.bezierCurveTo(-112, 162 + d * 0.6, -60, 132 + d, -22, 122 + d);        // under the chin
  c.bezierCurveTo(10, 112 + d, 22, 84 + d, 14, 60 + d);                    // the chin
  c.bezierCurveTo(8, 42 + d, 6, 28 + d, 16, 14 + d);                       // the lower lip, out
  c.bezierCurveTo(24, 4 + d, 20, ll + 2, 8, ll);
  c.lineTo(2, ll); c.lineTo(2, ul);                                        // the gap between the lips
  c.bezierCurveTo(16, ul - 2, 22, -40, 16, -54);                           // the upper lip
  c.bezierCurveTo(8, -74, 0, -90, -6, -96);                                // up to the nose
  c.bezierCurveTo(10, -100, 30, -104, 44, -110);                           // under the nose
  c.bezierCurveTo(62, -118, 62, -142, 44, -152);                           // the tip
  c.bezierCurveTo(16, -176, -28, -228, -38, -268);                         // the bridge
  c.bezierCurveTo(-46, -300, -40, -330, -52, -360);                        // the brow
  c.bezierCurveTo(-80, -470, -200, -540, -320, -520);                      // the forehead, the top of the head
  c.bezierCurveTo(-450, -500, -520, -360, -500, -200);                     // the back of the head
  c.bezierCurveTo(-490, -60, -450, 40, -420, 120);
  c.bezierCurveTo(-404, 180, -398, 300, -400, 700);                        // the back of the neck
  c.closePath();
}

// the tongue's upper surface y at x (section units), with the back and tip raised and the jaw dropped
function twTongueY(x, back, tip, d) {
  const K = [[-20, -6], [-40, -14], [-70, -19], [-100, -21], [-130, -19], [-160, -13], [-190, 2], [-215, 32], [-232, 72]];
  let i = 0; while (i < K.length - 2 && x < K[i + 1][0]) i++;
  const u = clamp((x - K[i][0]) / (K[i + 1][0] - K[i][0])), base = lerp(K[i][1], K[i + 1][1], smooth(u));
  const bump = -back * 41 * Math.exp(-Math.pow((x + 142) / 36, 2));
  const tp = -tip * 30 * Math.exp(-Math.pow((x + 20) / 18, 2));
  return base + bump + tp + d * clamp((x + 232) / 212);
}
function twTonguePath(c, back, tip, d) {
  const xt = -20 + 4 * tip;                                               // the tip moves up and a little forward
  c.beginPath();
  c.moveTo(xt, twTongueY(xt, back, tip, d) + 4);
  for (let x = xt; x >= -232; x -= 6) c.lineTo(x, twTongueY(x, back, tip, d));
  c.lineTo(-236, 140); c.lineTo(-170, 120 + d * 0.5);
  c.bezierCurveTo(-110, 60 + d, -50, 34 + d, -26, 22 + d);                // the floor of the mouth
  c.bezierCurveTo(-16, 16 + d, xt + 6, 6 + tip * -14 + d * 0.6, xt, twTongueY(xt, back, tip, d) + 4);
  c.closePath();
}

function twSection(t, o = {}) {
  const c = ctx, lips = clamp(o.lips || 0), back = clamp(o.back || 0), tip = clamp(o.tip || 0), op = clamp(o.open || 0);
  const d = 20 * op * (1 - lips * 0.85), g = (1 - lips) * (4 + 10 * op);
  c.save(); c.translate(TWSW.o[0], TWSW.o[1]); c.scale(TWSW.s, TWSW.s);
  // ---- the glass head and neck
  twHeadPath(c, g, d); c.lineWidth = 6; c.strokeStyle = TWC.rim; c.stroke();
  twHeadPath(c, g, d); c.fillStyle = TWC.glass; c.fill();
  paint(() => {
    // who this is: his hair, his eye, his brow, his ear, the teal collar
    c.save(); twHeadPath(c, g, d); c.clip();
    c.fillStyle = TWC.hair;
    c.beginPath(); c.moveTo(-520, -150); c.bezierCurveTo(-540, -420, -380, -560, -230, -540); c.bezierCurveTo(-120, -526, -60, -470, -44, -400);
    c.bezierCurveTo(-100, -440, -170, -446, -230, -430); c.bezierCurveTo(-330, -410, -400, -330, -420, -200); c.closePath(); c.fill();
    c.fillStyle = '#1E9C9A'; c.fillRect(-420, 560, 300, 160);
    line(c, -420, 560, -126, 548, 10, '#137270');
    c.restore();
    const ey = o.eye || {};
    ellipse(c, -62, -238, 15, 19, '#FFFFFF');
    circle(c, -56 + 4 * (ey.lookX === undefined ? 1 : ey.lookX), -234 + 5 * (ey.lookY === undefined ? 0 : ey.lookY), 8, '#15132A');
    circle(c, -54 + 4 * (ey.lookX === undefined ? 1 : ey.lookX), -238 + 5 * (ey.lookY === undefined ? 0 : ey.lookY), 2.6, '#FFFFFF');
    line(c, -84, -272 - 6 * (ey.brow || 0), -36, -276 - 6 * (ey.brow || 0), 6, TWC.hair);
    ellipse(c, -300, -190, 30, 48, 'rgba(242,184,146,0.42)');
    c.beginPath(); c.ellipse(-300, -190, 18, 32, 0, -1.2, 1.9); c.lineWidth = 4; c.strokeStyle = 'rgba(160,96,70,0.5)'; c.stroke();
    ellipse(c, 22, -112, 12, 5.5, 'rgba(70,20,32,0.85)', -0.25);           // his nostril
  });
  // ---- the roof of the mouth and the soft palate, the throat behind
  paint(() => {
    c.beginPath(); c.moveTo(-4, -38); c.bezierCurveTo(-40, -58, -110, -66, -150, -60);
    c.bezierCurveTo(-190, -56, -222, -46, -238, -26);                        // the soft palate, hanging back
    c.lineTo(-246, -30); c.bezierCurveTo(-228, -62, -190, -76, -150, -78); c.bezierCurveTo(-100, -82, -40, -74, -4, -50); c.closePath();
    c.fillStyle = TWC.roof; c.fill();
    ellipse(c, -240, -18, 7, 14, TWC.velum);                                // the uvula
    // the throat: a dark tube down the back
    c.beginPath(); c.moveTo(-250, -30); c.bezierCurveTo(-262, 40, -256, 160, -246, 320); c.lineWidth = 16; c.strokeStyle = 'rgba(120,40,70,0.55)'; c.lineCap = 'round'; c.stroke();
  });
  // the spots that light up: the lips (P), the back (K), the tip (D)
  const gP = clamp(o.glowP || 0), gK = clamp(o.glowK || 0), gD = clamp(o.glowD || 0);
  if (gK > 0.02) { softDot(gctx, ...twSW([TW_VEL[0], TW_VEL[1] + 8]), 110, TWC.K, 0.5 * gK); }
  if (gP > 0.02) { softDot(gctx, ...twSW([10, -18]), 100, TWC.P, 0.5 * gP); }
  if (gD > 0.02) { softDot(gctx, ...twSW(TW_RIDGE), 60, TWC.D, 0.45 * gD); }
  // ---- the teeth (front, top and bottom: the bottom ones ride on the jaw)
  paint(() => {
    rrect(c, -16, -46, 15, 22, 5); c.fillStyle = '#FFFFFF'; c.fill();
    rrect(c, -18, -12 + d, 14, 18, 5); c.fillStyle = '#FFFFFF'; c.fill();
  });
  // ---- the tongue (a shape: it gets the light), its spots painted on
  actor(() => { twTonguePath(c, back, tip, d); c.fillStyle = TWC.tongue; c.fill(); });
  paint(() => {
    c.save(); twTonguePath(c, back, tip, d); c.clip();
    for (let j = 1; j <= 3; j++) { const P = []; for (let x = -24; x >= -220; x -= 8) P.push([x, twTongueY(x, back, tip, d) + j * 11]); poly(c, P, 2, rgba('#B23A55', 0.32)); }
    const S = []; for (let x = -40; x >= -190; x -= 8) S.push([x, twTongueY(x, back, tip, d) + 5]); poly(c, S, 4, rgba('#FFFFFF', 0.2));
    c.restore();
    // the lit spots as rings on the surface
    if (gK > 0.02) { const y = twTongueY(-142, back, tip, d); c.beginPath(); c.ellipse(-142, y + 2, 30, 9, 0, 0, 7); c.lineWidth = 4; c.strokeStyle = rgba(TWC.K, gK); c.stroke(); }
    if (gD > 0.02) { const x = -20 + 4 * tip, y = twTongueY(x, back, tip, d); circle(c, x - 2, y + 2, 7, rgba(TWC.D, gD)); }
  });
  // ---- the lips: painted over the glass edge, lit when they are the spot
  paint(() => {
    const ul = -18 - g / 2, ll = -18 + g / 2 + d;
    c.beginPath(); c.moveTo(2, ul); c.bezierCurveTo(16, ul - 2, 22, -40, 16, -54); c.lineTo(4, -54); c.lineTo(2, ul); c.closePath();
    c.fillStyle = mixH(TWC.lip, TWC.P, 0.75 * gP); c.fill();
    c.beginPath(); c.moveTo(2, ll); c.lineTo(8, ll); c.bezierCurveTo(20, ll + 2, 24, 4 + d, 16, 14 + d); c.lineTo(4, 14 + d); c.closePath();
    c.fillStyle = mixH(TWC.lip, TWC.P, 0.75 * gP); c.fill();
    if (lips > 0.6) line(c, 2, -18, 12, -18, 2.4, rgba('#8E3440', lips));
  });
  // ---- air on its way out: a P from the lips, a K from the back along the roof and out
  const air = (pts, k, col) => {
    if (k <= 0.01 || k >= 0.99) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = clamp(k * 1.25 - i * 0.04), q = polyAt(pts.pts, pts.acc, u * pts.L), a = (1 - k) * (1 - i / n);
      paint(() => circle(c, q[0] + 9 * Math.sin(i * 2.1) * (1 + k), q[1] + 10 * Math.cos(i * 1.7) * (1 + k), 11 - 0.8 * i, rgba('#FFFFFF', 0.9 * a)));
      const Wd = twSW(q); softDot(gctx, Wd[0], Wd[1], 40, col, 0.6 * a);
    }
  };
  const mk = (P) => { const acc = polyLen(P); return { pts: P, acc, L: acc[acc.length - 1] }; };
  air(mk([[4, -18], [40, -22], [90, -26], [150, -30]]), clamp(o.puffP || 0), TWC.P);
  air(mk([[-142, -44], [-100, -36], [-50, -30], [4, -22], [60, -22], [130, -26]]), clamp(o.puffK || 0), TWC.K);
  // ---- the mic in front of his lips
  if ((o.mic || 0) > 0.01) {
    c.save(); c.translate(72, 6); c.rotate(-1.15); c.globalAlpha = 1;
    rrect(c, -10, 10, 20, 120, 8); c.fillStyle = '#1C2030'; c.fill();
    circle(c, 0, -16, 30, '#2E3450'); circle(c, 0, -16, 26, '#AEB7CF');
    c.restore();
  }
  c.restore();
  const xt = -20 + 4 * tip;
  return {
    lips: twSW([10, -18]), back: twSW([TW_VEL[0], twTongueY(TW_VEL[0], back, tip, d)]), tip: twSW([xt, twTongueY(xt, back, tip, d)]),
    velum: twSW(TW_VEL), ridge: twSW(TW_RIDGE), throat: twSW([-250, 40]), nose: twSW([44, -130]),
  };
}

// the dark field behind the glass head, with faint motes
function twSecBg(cam, t) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#120A30'); g.addColorStop(1, '#05030F');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { const rng = mulberry32(300 + i); softDot(ctx, rng() * W, 300 + rng() * 1400, 200 + 160 * rng(), i % 2 ? '#FF4D9A' : '#5A7CFF', 0.05); }
  applyCam(cam);
  paint(() => { for (let i = 0; i < 34; i++) { const x = -300 + 1700 * hash(i * 3.1), y = -100 + 2300 * hash(i * 7.7 + 1); circle(ctx, x, y, 2 + 3 * hash(i + 5), rgba('#6FA8FF', 0.15 + 0.2 * hash(i * 1.3))); } });
}
