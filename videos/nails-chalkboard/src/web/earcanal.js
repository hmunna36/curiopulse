// Why Do Nails on a CHALKBOARD Make You Cringe? Short: the ear canal in section, and a bottle that works the same way.
// Screen space; V = {x, y, s} puts the section's middle (the middle of the canal) on screen.
//   canalDraw(V, t, o)        outer ear, the canal as a tube, the eardrum, three little bones, the snail and its nerve;
//                             a wave comes in from the left and GROWS on its way down the tube (o.gain)
//   canalPt(V, x, y)          a section point on screen
//   canBottle(x, y, s, t, o)  a bottle lying the same way round: breath across its mouth, the same wave inside, a note
'use strict';

const CAN = { x0: -220, x1: 220, r: 60, lam: 104, v: 330 };
const canalPt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
function canOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.scale(V.s, V.s); }
  try { fn(); } finally { ctx.restore(); gctx.restore(); }
}
// how tall the wave is at x, for a gain at the drum
function canAmp(x, gain, a0 = 13) {
  const u = clamp((x - CAN.x0) / (CAN.x1 - CAN.x0));
  return a0 * (1 + (gain - 1) * u * u * (3 - 2 * u));
}
// o: {wave 0..1 (how far in the wave has come), gain 1..3.6 (how much the tube adds by the drum), red 0..1, hit 0..1
//   (the drum is being hammered), bars 0..1 (a loudness ramp above the tube lights up), glow 0..1 (the tube's walls),
//   nerve 0..1 (signal leaving for the brain), tube 0..1 (the canal's outline lights up: it is a tube)}
function canalDraw(V, t, o = {}) {
  const gain = o.gain || 1, red = clamp(o.red || 0), hit = clamp(o.hit || 0), wave = clamp(o.wave === undefined ? 1 : o.wave);
  const col = mixH('#FFF1B8', '#FF4D5E', red), jit = hit * 3 * Math.sin(t * 61);
  screenSpace();
  canOn(V, () => {
    const c = ctx;
    // the side of his head, cut through: skin and fat, then bone deeper in
    rrect(c, -360, -232, 760, 464, 70); c.fillStyle = '#E9A68C'; c.fill();
    rrect(c, 10, -214, 372, 150, 40); c.fillStyle = '#F4DFCB'; c.fill();
    rrect(c, 10, 64, 372, 150, 40); c.fillStyle = '#F4DFCB'; c.fill();
    paint(() => { for (const [x, y] of [[80, -150], [170, -120], [270, -160], [110, 130], [220, 160], [310, 120]]) circle(c, x, y, 9, 'rgba(214,170,140,0.5)'); });
    // the outer ear
    ellipse(c, -330, -8, 96, 200, '#F2B892');
    ellipse(c, -318, -4, 58, 146, '#DB9272');
    ellipse(c, -292, 0, 44, 86, '#C7785A');
    // the canal, the middle ear behind the drum
    rrect(c, -300, -CAN.r, 300 + CAN.x1 + 6, CAN.r * 2, 46); c.fillStyle = '#3A1430'; c.fill();
    rrect(c, CAN.x1 + 12, -70, 122, 140, 34); c.fillStyle = '#5A2448'; c.fill();
    paint(() => {
      c.fillStyle = `rgba(255,90,110,${0.1 + 0.3 * (o.glow || 0)})`; c.fillRect(CAN.x0, -CAN.r, CAN.x1 - CAN.x0, 9); c.fillRect(CAN.x0, CAN.r - 9, CAN.x1 - CAN.x0, 9);
    });
    if ((o.tube || 0) > 0.01) {   // it is a tube: its outline lights up
      paint(() => { rrect(c, -300, -CAN.r, 300 + CAN.x1 + 6, CAN.r * 2, 46); c.lineWidth = 7; c.strokeStyle = rgba('#7FE9FF', clamp(o.tube)); c.stroke(); });
      rrect(gctx, -300, -CAN.r, 300 + CAN.x1 + 6, CAN.r * 2, 46); gctx.lineWidth = 12; gctx.strokeStyle = rgba('#59D8FF', 0.6 * clamp(o.tube)); gctx.stroke();
    }
    // the snail and its nerve
    line(c, 396, -30, 520, -150, 20, '#F0B63C'); line(c, 520, -150, 640, -330, 20, '#F0B63C');
    circle(c, 392, -6, 60, '#8E66D6');
    paint(() => { for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(392 + i * 5, -6 + i * 3, 46 - i * 15, 0.4 + i, 5.6 + i); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = '#C3A4F6'; c.stroke(); } });
    // three little bones from the drum to the snail (they rattle when the drum is hit)
    const B = [[CAN.x1 + 16, -8 + jit], [CAN.x1 + 48, -34 - jit], [CAN.x1 + 78, -6 + jit], [CAN.x1 + 118, -20 - jit * 0.6]];
    for (let i = 0; i < 3; i++) line(c, B[i][0], B[i][1], B[i + 1][0], B[i + 1][1], 11, '#FBEBD6');
    // the drum: it bows in under the wave
    const bow = hit * (10 + 9 * Math.sin(t * 61));
    c.beginPath(); c.moveTo(CAN.x1 - 4, -CAN.r + 2); c.quadraticCurveTo(CAN.x1 + 14 + bow, 0, CAN.x1 - 4, CAN.r - 2); c.quadraticCurveTo(CAN.x1 - 16 + bow, 0, CAN.x1 - 4, -CAN.r + 2); c.closePath();
    c.fillStyle = mixH('#FFE6DC', '#FF9A9A', 0.6 * hit); c.fill();
  });
  // the wave
  if (wave > 0.001) {
    const xa = -500, xf = lerp(xa, CAN.x1 - 6, wave), P = [];
    for (let x = xa; x <= xf; x += 5) P.push([x, canAmp(x, gain) * Math.sin((2 * Math.PI * (x - CAN.v * t)) / CAN.lam)]);
    if (P.length > 2) canOn(V, () => {
      poly(ctx, P, 15, 'rgba(20,6,24,0.5)'); poly(ctx, P, 9, col);
      poly(gctx, P, 16, rgba(mixH('#FFD447', '#FF3A50', red), 0.55));
    });
  }
  // the drum takes it
  if (hit > 0.02) canOn(V, () => {
    const rng = mulberry32(40 + Math.floor(t * 15));
    for (let i = 0; i < 6; i++) {
      const a = -1.1 + i * 0.44 + (rng() - 0.5) * 0.2, r0 = 30 + rng() * 10, r1 = r0 + (24 + rng() * 26) * hit;
      for (const [cc, w, al] of [[ctx, 6, 0.95], [gctx, 12, 0.5]]) line(cc, CAN.x1 + 20 + Math.cos(a) * r0, Math.sin(a) * r0 * 1.5, CAN.x1 + 20 + Math.cos(a) * r1, Math.sin(a) * r1 * 1.5, w, rgba('#FFE08A', al * hit));
    }
  });
  // signal leaving for the brain
  if ((o.nerve || 0) > 0.01) canOn(V, () => {
    for (let i = 0; i < 5; i++) { const p = (t * 1.8 + i / 5) % 1, x = lerp(396, 640, p), y = p < 0.5 ? lerp(-30, -150, p * 2) : lerp(-150, -330, (p - 0.5) * 2); circle(ctx, x, y, 8, rgba('#FF4D5E', o.nerve)); softDot(gctx, x, y, 26, '#FF4D5E', 0.7 * o.nerve); }
  });
  // a loudness ramp above the tube: each bar taller than the last
  const bars = clamp(o.bars || 0);
  if (bars > 0.001) canOn(V, () => {
    for (let i = 0; i < 9; i++) {
      const on = clamp(bars * 9 - i), h = (16 + i * 8.5) * E.outBack(on, 2), x = CAN.x0 + 20 + i * 50, cl = mixH('#FFD447', '#FF4D5E', i / 8);
      if (on <= 0.01) continue;
      rrect(ctx, x - 16, -262 - h, 32, h, 7); ctx.fillStyle = cl; ctx.fill();
      rrect(gctx, x - 16, -262 - h, 32, h, 7); gctx.fillStyle = rgba(cl, 0.5); gctx.fill();
    }
  });
}

// a musical note (screen space)
function canNote(x, y, s, k, col = '#7FE9FF') {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.4) * s;
  for (const [c, a] of [[ctx, 1], [gctx, 0.5]]) {
    c.save(); c.translate(x, y); c.scale(q, q); c.rotate(-0.12);
    ellipse(c, -14, 26, 17, 12, rgba(col, a), -0.4); line(c, 0, 24, 0, -34, 7, rgba(col, a));
    c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(34, -26, 26, 4); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = rgba(col, a); c.stroke();
    c.restore();
  }
}
// a bottle lying on its side, mouth to the left (screen space; s = its size). o: {k: pop-in, blow 0..1 (breath across
// the mouth), ring 0..1 (the note it gives: the same wave inside, taller toward the closed end), red}
function canBottle(x, y, s, t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const q = E.outBack(k, 1.7) * s, ring = clamp(o.ring || 0), blow = clamp(o.blow || 0);
  screenSpace();
  for (const c of [ctx, gctx]) { c.save(); c.translate(x, y); c.scale(q, q); }
  const shape = (c) => {
    c.beginPath(); c.moveTo(-240, -27); c.lineTo(-150, -27); c.quadraticCurveTo(-110, -27, -92, -60); c.lineTo(196, -60); c.quadraticCurveTo(226, -60, 226, -30);
    c.lineTo(226, 30); c.quadraticCurveTo(226, 60, 196, 60); c.lineTo(-92, 60); c.quadraticCurveTo(-110, 27, -150, 27); c.lineTo(-240, 27); c.closePath();
  };
  paint(() => {
    shape(ctx); ctx.fillStyle = 'rgba(120,220,235,0.2)'; ctx.fill();
    if (ring > 0.01) {   // the air inside rings: the same wave, tallest at the closed end
      const P = [];
      for (let xx = -236; xx <= 218; xx += 5) { const u = clamp((xx + 236) / 454); P.push([xx, (6 + 34 * u * u * (3 - 2 * u)) * ring * Math.sin((2 * Math.PI * (xx - CAN.v * t)) / CAN.lam) * (xx < -150 ? 0.55 : 1)]); }
      poly(ctx, P, 13, 'rgba(8,20,40,0.45)'); poly(ctx, P, 8, o.red ? '#FF5A6E' : '#7FE9FF'); poly(gctx, P, 15, rgba(o.red ? '#FF3A50' : '#59D8FF', 0.5));
    }
    shape(ctx); ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = '#D6F6FF'; ctx.stroke();
    rrect(ctx, -254, -34, 18, 68, 7); ctx.fillStyle = '#D6F6FF'; ctx.fill();
    line(ctx, -70, -44, 150, -44, 7, 'rgba(255,255,255,0.5)');
    // breath across the mouth
    for (let i = 0; i < 5; i++) {
      const p = (t * 2.4 + i / 5) % 1, xx = -292 + 12 * Math.sin(i * 2.1), yy = lerp(-120, 110, p);
      line(ctx, xx - 14 * Math.sin(p * 3), yy, xx - 14 * Math.sin(p * 3 + 0.4), yy + 34, 7, rgba('#E8F8FF', 0.85 * blow * Math.sin(Math.PI * p)));
    }
  });
  ctx.restore(); gctx.restore();
}
