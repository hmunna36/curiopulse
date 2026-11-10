// Your HONEY Could Outlive You: the burial chamber (tomb, button) and the pyramids at dusk (pyramid).
// The oldest honey ever found was traces in clay jars from a tomb about 5,500 years old (Georgia, reported 2012);
// the chamber here is a generic stone tomb, not Egypt: the pyramids only stand in for the comparison of ages.
'use strict';

// ---------------------------------------------------------------- the burial chamber
// o: {hz (camera height), flick (torch flicker scale)}
function hnTombBack(cam, t, o = {}) {
  // far: a dark stone wall of big blocks (parallax 0.8)
  const C = hnParCam(cam, 0.85, o.hz || 0);
  applyCam(C);
  ctx.fillStyle = '#3B2C22'; ctx.fillRect(-900, -600, 2900, 2400);
  const rng = mulberry32(77);
  for (let r = 0; r < 18; r++) {
    const y = -400 + r * 118, off = (r % 2) * 110;
    for (let x = -900 - off; x < 2000; x += 220) {
      const v = rng();
      rrect(ctx, x + 6, y + 6, 208, 106, 10); ctx.fillStyle = v < 0.33 ? '#6E5440' : v < 0.66 ? '#7A5E47' : '#644B39'; ctx.fill();
    }
  }
  // a carved band with bees and zigzags (paint) at y 640
  paint(() => {
    ctx.fillStyle = 'rgba(40,26,18,0.45)'; ctx.fillRect(-900, 610, 2900, 70);
    for (let x = -880; x < 2000; x += 140) {
      ctx.beginPath(); ctx.moveTo(x, 670); ctx.lineTo(x + 35, 620); ctx.lineTo(x + 70, 670); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(200,160,110,0.55)'; ctx.stroke();
      ellipse(ctx, x + 105, 645, 14, 10, 'rgba(210,170,90,0.6)'); ellipse(ctx, x + 98, 634, 8, 5, 'rgba(230,220,200,0.5)', -0.5); ellipse(ctx, x + 112, 634, 8, 5, 'rgba(230,220,200,0.5)', 0.5);
    }
  });
  // a niche with pots on the right
  rrect(ctx, 760, 900, 360, 300, 14); ctx.fillStyle = '#2A1E17'; ctx.fill();
  for (const [x, s] of [[820, 0.55], [920, 0.7], [1030, 0.5]]) hnOldJar(ctx, x, 1196, s, { dust: 1, crust: 0, plain: true });
  // the floor: dusty sand
  applyCam(hnParCam(cam, 1, o.hz || 0));
  const g = ctx.createLinearGradient(0, 1500, 0, 2400);
  g.addColorStop(0, '#8C6B48'); g.addColorStop(1, '#5E452E');
  ctx.fillStyle = g; ctx.fillRect(-900, 1500, 2900, 1200);
  paint(() => { for (let i = 0; i < 30; i++) ellipse(ctx, -600 + (i * 137) % 2400, 1530 + (i * 61) % 600, 30, 6, 'rgba(60,40,26,0.35)'); });
  // the torches
  hnTorch(ctx, 170, 1000, 1, t, o.flick);
  hnTorch(ctx, 1000, 880, 0.9, t + 1.3, o.flick);
}
// a wall torch: bracket, a wrapped stick, the flame (both layers), sparks
function hnTorch(c, x, y, s, t, flick = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -30, 30, 60, 18, 6); c.fillStyle = '#3A3330'; c.fill();
  c.beginPath(); c.moveTo(-14, 30); c.lineTo(14, 30); c.lineTo(8, 150); c.lineTo(-8, 150); c.closePath(); c.fillStyle = '#6A4A2E'; c.fill();
  rrect(c, -18, -6, 36, 40, 8); c.fillStyle = '#4A3624'; c.fill();
  c.restore();
  const w = loopW(11), fl = 1 + 0.12 * Math.sin(t * w) * (flick == null ? 1 : flick) + 0.06 * Math.sin(t * w * 1.7 + 1);
  paint(() => {
    c.save(); c.translate(x, y - 10 * s); c.scale(s * fl, s * fl);
    c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-30, -60, 0, -110); c.quadraticCurveTo(30, -60, 26, 0); c.closePath(); c.fillStyle = '#FF8A2A'; c.fill();
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-16, -40, 0, -70); c.quadraticCurveTo(16, -40, 14, 0); c.closePath(); c.fillStyle = '#FFE08A'; c.fill();
    c.restore();
  });
  softDot(gctx, x, y - 50 * s, 120 * s, '#FFB04A', 0.9);
  softDot(gctx, x, y - 30 * s, 300 * s, '#FF8A30', 0.28);
}
// the ancient clay jar (base centre x, y; scale s). o: {dust 0..1 (brushed off from the top down), crust 1 (the dark
// residue at the mouth), plain (no residue), glow 0..1 (a reverent glint)}
function hnOldJar(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const body = (inset) => {
    c.beginPath();
    c.moveTo(-34 + inset, -238); c.lineTo(34 - inset, -238);
    c.quadraticCurveTo(30 - inset, -200, 70 - inset, -170);
    c.bezierCurveTo(118 - inset, -130, 112 - inset, -40, 60 - inset, -8 + inset);
    c.lineTo(-60 + inset, -8 + inset);
    c.bezierCurveTo(-112 + inset, -40, -118 + inset, -130, -70 + inset, -170);
    c.quadraticCurveTo(-30 + inset, -200, -34 + inset, -238);
    c.closePath();
  };
  body(0); c.fillStyle = '#8E4E2C'; c.fill();
  // the foot and the rim
  rrect(c, -46, -14, 92, 16, 6); c.fillStyle = '#6E3A20'; c.fill();
  rrect(c, -44, -252, 88, 20, 8); c.fillStyle = '#7A4226'; c.fill();
  // painted bands (paint)
  paint(() => {
    c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(-90 + i * 22.5, -120 + (i % 2 ? -14 : 14)); c.lineWidth = 6; c.strokeStyle = 'rgba(30,18,12,0.6)'; c.stroke();
    line(c, -96, -88, 96, -88, 5, 'rgba(30,18,12,0.5)');
    line(c, -84, -150, 84, -150, 5, 'rgba(30,18,12,0.5)');
    // cracks
    c.beginPath(); c.moveTo(40, -60); c.lineTo(52, -40); c.lineTo(46, -24); c.lineWidth = 3; c.strokeStyle = 'rgba(40,20,10,0.7)'; c.stroke();
  });
  // the dark crusty residue round the mouth
  if (!o.plain && (o.crust == null ? 1 : o.crust) > 0.01) {
    ellipse(c, 0, -250, 30, 8, '#24180F');
    paint(() => { for (const [px, py, pr] of [[-26, -238, 7], [24, -232, 8], [10, -226, 5]]) ellipse(c, px, py, pr, pr * 1.4, '#2E2016'); });
  }
  // dust: a pale coat that the brush clears from the top down (o.dust 1 = all dusty)
  const du = clamp(o.dust == null ? 0 : o.dust);
  if (du > 0.01) paint(() => {
    c.save(); body(0); c.clip();
    const top = -252 + (1 - du) * 250;
    c.fillStyle = 'rgba(214,196,160,0.78)'; c.fillRect(-130, top, 260, 260);
    for (let i = 0; i < 14; i++) ellipse(c, -80 + (i * 37) % 160, top + 20 + (i * 53) % 200, 12, 5, 'rgba(240,226,196,0.6)');
    c.restore();
  });
  c.restore();
  if ((o.glow || 0) > 0.01) softDot(gctx, x, y - 130 * s, 160 * s, '#FFC870', 0.4 * o.glow);
}
// a puff of dust (world)
function hnDustPuff(c, x, y, k, s = 1) {
  if (k <= 0.01 || k >= 0.99) return;
  paint(() => { for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.1 + i * 0.11); circle(c, x + Math.cos(a) * 70 * s * k, y + Math.sin(a) * 50 * s * k, 16 * s * (1 - k) + 4, `rgba(230,214,180,${0.7 * (1 - k)})`); } });
}

// ---------------------------------------------------------------- the pyramids at dusk
// o: {hz}
function hnPyramidBack(cam, t, o = {}) {
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2C2466'); g.addColorStop(0.3, '#6A3A86'); g.addColorStop(0.5, '#D0607A'); g.addColorStop(0.62, '#F7934A'); g.addColorStop(1, '#F7B064');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // stars high up
  paint(() => { for (let i = 0; i < 24; i++) circle(ctx, (i * 197) % W, 120 + (i * 83) % 420, 2 + (i % 3), `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * loopW(2) + i)})`); });
  const C0 = hnParCam(cam, 0.3, o.hz || 0);
  applyCam(C0);
  // the low Sun on the right, half set
  softDot(ctx, 1010, 1010, 260, '#FFD08A', 0.8);
  circle(ctx, 1010, 1010, 86, '#FFE6B0');
  softDot(gctx, 1010, 1010, 200, '#FFC070', 0.9);
  // far dunes
  ctx.fillStyle = '#C46A44'; ctx.beginPath(); ctx.moveTo(-600, 1060); for (let x = -600; x <= 1800; x += 40) ctx.lineTo(x, 1040 - 22 * Math.sin(x * 0.006 + 1)); ctx.lineTo(1800, 1400); ctx.lineTo(-600, 1400); ctx.closePath(); ctx.fill();
  // the pyramids: a lit face toward the Sun (right) and a face in shadow
  const C1 = hnParCam(cam, 0.5, o.hz || 0);
  applyCam(C1);
  for (const [px, w, h] of [[440, 330, 210], [770, 600, 400], [1080, 200, 120]]) hnPyramid(ctx, px, 1070, w, h);
  // near dunes
  applyCam(hnParCam(cam, 1, o.hz || 0));
  const g2 = ctx.createLinearGradient(0, 1150, 0, 2300);
  g2.addColorStop(0, '#E39A55'); g2.addColorStop(1, '#B8693A');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(-900, 1260);
  for (let x = -900; x <= 2000; x += 30) ctx.lineTo(x, 1230 - 40 * Math.sin(x * 0.004 + 0.6) - 16 * Math.sin(x * 0.011));
  ctx.lineTo(2000, 2600); ctx.lineTo(-900, 2600); ctx.closePath(); ctx.fill();
  paint(() => { for (let i = 0; i < 9; i++) { const x = -200 + i * 170; ctx.beginPath(); ctx.moveTo(x, 1420 + (i % 3) * 60); ctx.quadraticCurveTo(x + 60, 1400 + (i % 3) * 60, x + 130, 1430 + (i % 3) * 60); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,220,170,0.35)'; ctx.stroke(); } });
}
function hnPyramid(c, x, base, w, h) {
  c.beginPath(); c.moveTo(x - w / 2, base); c.lineTo(x, base - h); c.lineTo(x + w * 0.12, base); c.closePath(); c.fillStyle = '#B4683E'; c.fill();
  c.beginPath(); c.moveTo(x + w * 0.12, base); c.lineTo(x, base - h); c.lineTo(x + w / 2, base); c.closePath(); c.fillStyle = '#F0AE62'; c.fill();
  paint(() => {
    for (let i = 1; i < 9; i++) {
      const u = i / 9, y = base - h * u;
      line(c, x - (w / 2) * (1 - u), y, x + (w / 2) * (1 - u), y, 2, 'rgba(120,60,30,0.35)');
    }
  });
}
