// Why Does Your Voice Sound DEEPER With Fingers in Your Ears? Short: the ear canal in section (after nails-chalkboard's
// earcanal.js), with a fingertip plugging its mouth. Screen space; V = {x, y, s} puts the section's point (0, 0) (the middle
// of the canal) on screen. The canal runs from its mouth at x = -300 (outer ear, left) to the eardrum at x = 220.
//   vdCanal(V, t, o)   the side of his head cut through, the canal, the drum, three little bones, the snail; the canal's
//                      walls hum (violet), the low hum as a fat slow wave inside: it leaks out of the open mouth, or the
//                      finger stops it and it piles up and booms on the drum
//   vdCanalPt(V, x, y) a section point on screen
'use strict';

const VC = { x0: -300, x1: 220, r: 60, lam: 330, v: 260 };
const vdCanalPt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
function vdCanOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.scale(V.s, V.s); }
  try { fn(); } finally { ctx.restore(); gctx.restore(); }
}

// the fingertip from the left: a rounded finger with a nail on top, k = 0 (outside) .. 1 (in the canal's mouth)
function vdFingertip(c, k, t, tremble = 0) {
  const x = lerp(-560, -268, E.outCubic(clamp(k))) + tremble * 3 * Math.sin(t * 2 * Math.PI * 25);
  rrect(c, x - 420, -56, 420 + 20, 112, 56); c.fillStyle = '#F2B892'; c.fill();
  paint(() => {
    rrect(c, x - 96, -56, 64, 30, 14); c.fillStyle = '#FBD7C6'; c.fill();                      // the nail, on top
    c.beginPath(); c.moveTo(x - 92, -24); c.lineTo(x - 34, -24); c.lineWidth = 2.2; c.strokeStyle = 'rgba(190,110,90,0.5)'; c.stroke();
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x - 210 - i * 14, 0, 30, -0.5, 0.5); c.lineWidth = 2.2; c.strokeStyle = 'rgba(190,110,90,0.4)'; c.stroke(); }   // the knuckle's creases
  });
}

// o: {plug 0..1 (the finger), hum 0..1 (the walls hum), leak 0..1 (the wave pours out of the open mouth), trap 0..1 (it piles up
//   between the finger and the drum), hit 0..1 (the drum is hammered), nerve 0..1, tremble 0..1, label: fn}
function vdCanal(V, t, o = {}) {
  const hum = clamp(o.hum || 0), plug = clamp(o.plug || 0), trap = clamp(o.trap || 0), leak = clamp(o.leak || 0), hit = clamp(o.hit || 0);
  const jit = hit * 3 * Math.sin(t * 61);
  screenSpace();
  vdCanOn(V, () => {
    const c = ctx;
    // the side of his head, cut through: skin and fat, then bone deeper in
    rrect(c, -380, -250, 840, 500, 70); c.fillStyle = '#E9A68C'; c.fill();
    const bw = 2.2 * hum * Math.sin(t * 2 * Math.PI * 3.1);
    rrect(c, -120, -226 - bw, 520, 164, 40); c.fillStyle = '#F4DFCB'; c.fill();
    rrect(c, -120, 62 + bw, 520, 164, 40); c.fillStyle = '#F4DFCB'; c.fill();
    paint(() => {
      for (const [x, y] of [[-40, -160], [60, -130], [170, -170], [290, -120], [-20, 140], [110, 170], [230, 130], [330, 170]]) circle(c, x, y, 9, 'rgba(214,170,140,0.5)');
      // BONE tags: the walls round the inner half of the canal are skull
      if (hum > 0.01) for (const sy of [-1, 1]) {
        for (let i = 0; i < 4; i++) {   // the bone hums: short violet shiver lines along it
          const x = -80 + i * 110, y = sy * 144 + 6 * Math.sin(t * 19 + i);
          c.beginPath(); c.moveTo(x - 22, y); c.quadraticCurveTo(x - 11, y - 9, x, y); c.quadraticCurveTo(x + 11, y + 9, x + 22, y);
          c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = rgba(VD.bassDk, 0.85 * hum); c.stroke();
        }
      }
    });
    // the outer ear
    ellipse(c, -400, -8, 96, 210, '#F2B892');
    ellipse(c, -388, -4, 58, 156, '#DB9272');
    ellipse(c, -362, 0, 44, 90, '#C7785A');
    // the canal, and the middle ear behind the drum
    rrect(c, -330, -VC.r, 330 + VC.x1 + 6, VC.r * 2, 46); c.fillStyle = '#2E1640'; c.fill();
    rrect(c, VC.x1 + 12, -70, 122, 140, 34); c.fillStyle = '#4E2458'; c.fill();
    paint(() => {   // the walls' lining: violet when they hum
      const a = 0.12 + 0.55 * hum * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 3.1));
      c.fillStyle = rgba(VD.bass, a); c.fillRect(-120, -VC.r, VC.x1 + 120, 9); c.fillRect(-120, VC.r - 9, VC.x1 + 120, 9);
    });
    // the snail and its nerve
    line(c, 396, -30, 520, -150, 20, '#F0B63C'); line(c, 520, -150, 640, -330, 20, '#F0B63C');
    circle(c, 392, -6, 60, '#8E66D6');
    paint(() => { for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(392 + i * 5, -6 + i * 3, 46 - i * 15, 0.4 + i, 5.6 + i); c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = '#C3A4F6'; c.stroke(); } });
    // three little bones from the drum to the snail (they rattle when the drum is hit)
    const B = [[VC.x1 + 16, -8 + jit], [VC.x1 + 48, -34 - jit], [VC.x1 + 78, -6 + jit], [VC.x1 + 118, -20 - jit * 0.6]];
    for (let i = 0; i < 3; i++) line(c, B[i][0], B[i][1], B[i + 1][0], B[i + 1][1], 11, '#FBEBD6');
    // the drum: it bows in under the boom
    const bow = hit * (12 + 10 * Math.sin(t * 61)) + trap * 4 * Math.sin(t * 2 * Math.PI * 3.1);
    c.beginPath(); c.moveTo(VC.x1 - 4, -VC.r + 2); c.quadraticCurveTo(VC.x1 + 14 + bow, 0, VC.x1 - 4, VC.r - 2); c.quadraticCurveTo(VC.x1 - 16 + bow, 0, VC.x1 - 4, -VC.r + 2); c.closePath();
    c.fillStyle = mixH('#FFE6DC', '#FFB0D0', 0.7 * hit); c.fill();
    // the fingertip, then the outer ear's two halves over it: it goes in between them
    if (plug > 0.001) vdFingertip(c, plug, t, o.tremble || 0);
    c.beginPath(); c.moveTo(-330, -64); c.quadraticCurveTo(-372, -70, -392, -120); c.quadraticCurveTo(-430, -230, -360, -262); c.quadraticCurveTo(-300, -270, -306, -200);
    c.quadraticCurveTo(-312, -120, -300, -64); c.closePath(); c.fillStyle = '#E8A280'; c.fill();
    c.beginPath(); c.moveTo(-330, 64); c.quadraticCurveTo(-372, 70, -392, 120); c.quadraticCurveTo(-420, 210, -352, 236); c.quadraticCurveTo(-298, 246, -304, 180);
    c.quadraticCurveTo(-310, 112, -300, 64); c.closePath(); c.fillStyle = '#E8A280'; c.fill();
  });
  // the hum inside the canal: a fat slow wave. Open: it travels out of the mouth (left) and away. Plugged: the finger
  // turns it round, and it piles up toward the drum (taller, brighter)
  const amp0 = 10 + 14 * hum, ampT = amp0 * (1 + 1.6 * trap) + 10 * hit;
  if (hum > 0.01) vdCanOn(V, () => {
    const right = -268 * plug + (1 - plug) * -330;
    const xa = lerp(-120, right + 6, Math.max(leak, plug)), xb = VC.x1 - 8, P = [];
    for (let x = xa; x <= xb; x += 5) {
      const u = clamp((x - xa) / (xb - xa));
      const travel = Math.sin((2 * Math.PI * (x + VC.v * t)) / VC.lam);            // moving left (out)
      const stand = Math.sin((2 * Math.PI * (x - VC.x1)) / VC.lam) * Math.cos(2 * Math.PI * 3.1 * t);   // trapped: a standing wave
      const a = lerp(amp0, ampT * (0.75 + 0.25 * u), trap);
      P.push([x, a * lerp(travel, stand, trap)]);
    }
    const col = mixH(VD.bass, '#F2E8FF', 0.4 * trap + 0.4 * hit);
    poly(ctx, P, 18 + 8 * trap, 'rgba(16,6,30,0.5)'); poly(ctx, P, 11 + 6 * trap, col);
    poly(gctx, P, 20 + 12 * trap, rgba(VD.bassGlow, 0.45 + 0.35 * trap));
    // open: the wave pours out of the mouth and spreads, fading
    if (leak > 0.01 && plug < 0.5) for (let i = 0; i < 3; i++) {
      const p = ((t * 0.9 + i / 3) % 1), R = 40 + 160 * p, cx = -330 - R * 0.55;
      for (const [cc, w, al] of [[ctx, 10, 0.85], [gctx, 20, 0.45]]) { cc.beginPath(); cc.arc(cx + R * 0.55, 0, R, Math.PI - 0.8, Math.PI + 0.8); cc.lineWidth = w * (1 - 0.5 * p); cc.lineCap = 'round'; cc.strokeStyle = rgba(VD.bass, al * leak * (1 - p) * (1 - plug * 2)); cc.stroke(); }
    }
    // plugged: chevrons at the fingertip pointing back in (it bounces)
    if (plug > 0.6 && trap > 0.01) for (let i = 0; i < 2; i++) {
      const p = ((t * 1.6 + i / 2) % 1), x = -250 + 120 * p, a = trap * Math.sin(Math.PI * p);
      for (const [cc, w, al] of [[ctx, 7, 1], [gctx, 14, 0.5]]) poly(cc, [[x - 16, -26], [x + 6, 0], [x - 16, 26]], w, rgba('#FFFFFF', a * al));
    }
  });
  // the drum takes it
  if (hit > 0.02) vdCanOn(V, () => {
    const rng = mulberry32(40 + Math.floor(t * 15));
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.4 + (rng() - 0.5) * 0.2, r0 = 34 + rng() * 10, r1 = r0 + (30 + rng() * 30) * hit;
      for (const [cc, w, al] of [[ctx, 7, 0.95], [gctx, 14, 0.5]]) line(cc, VC.x1 + 24 + Math.cos(a) * r0, Math.sin(a) * r0 * 1.5, VC.x1 + 24 + Math.cos(a) * r1, Math.sin(a) * r1 * 1.5, w, rgba('#FFE08A', al * hit));
    }
  });
  // the signal leaving for the brain
  if ((o.nerve || 0) > 0.01) vdCanOn(V, () => {
    for (let i = 0; i < 5; i++) { const p = (t * 1.8 + i / 5) % 1, x = lerp(396, 640, p), y = p < 0.5 ? lerp(-30, -150, p * 2) : lerp(-150, -330, (p - 0.5) * 2); circle(ctx, x, y, 8, rgba(VD.bass, o.nerve)); softDot(gctx, x, y, 26, VD.bassGlow, 0.7 * o.nerve); }
  });
}
