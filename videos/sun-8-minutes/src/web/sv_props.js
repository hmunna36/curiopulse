// What If the Sun VANISHED Right Now? ☀️ — props and graphics: the envelope of sunshine, the postmark, the countdown,
// the round window on space, label pills, a tumbleweed.
'use strict';

// ---------------------------------------------------------------- an envelope of sunshine (any canvas, any units)
// (x, y) its centre, s its scale (1 = 120 wide), rot; o: {glow 0..1, open, seal, trail: [dx, dy] (a light streak behind
// it, in its own units), dim (the road's dark end)}
function svEnvelope(c, x, y, s, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const w = 120, h = 80, gl = o.glow === undefined ? 1 : o.glow;
  if (o.trail) {
    const [dx, dy] = o.trail, L = Math.hypot(dx, dy) || 1;
    const g = c.createLinearGradient(0, 0, dx, dy); g.addColorStop(0, `rgba(255,236,160,${0.75 * gl})`); g.addColorStop(1, 'rgba(255,220,120,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-dy / L * 30, dx / L * 30); c.lineTo(dx, dy); c.lineTo(dy / L * 30, -dx / L * 30); c.closePath(); c.fill();
  }
  rrect(c, -w / 2, -h / 2, w, h, 9); c.fillStyle = mixH('#FFF7E2', '#6A6250', o.dim || 0); c.fill();
  paint(() => {
    c.beginPath(); c.moveTo(-w / 2 + 4, -h / 2 + 4); c.lineTo(0, 8); c.lineTo(w / 2 - 4, -h / 2 + 4); c.lineWidth = 4; c.strokeStyle = mixH('#E8C27A', '#4A4436', o.dim || 0); c.stroke();
    c.beginPath(); c.moveTo(-w / 2 + 4, h / 2 - 4); c.lineTo(-10, 0); c.moveTo(w / 2 - 4, h / 2 - 4); c.lineTo(10, 0); c.lineWidth = 3; c.stroke();
    if (o.seal !== false) {                                           // a wax seal with a little sun
      circle(c, 0, 8, 15, mixH('#F0424C', '#4A2A30', o.dim || 0));
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, Math.cos(a) * 5, 8 + Math.sin(a) * 5, Math.cos(a) * 10, 8 + Math.sin(a) * 10, 2.5, '#FFD447'); }
      circle(c, 0, 8, 4.5, '#FFD447');
    }
  });
  c.restore();
}
// its glow, into the glow layer (same coordinates as svEnvelope, call with gctx under the same camera)
function svEnvelopeGlow(x, y, s, a = 1) { softDot(gctx, x, y, 110 * s, '#FFE7A0', 0.55 * a); }

// ---------------------------------------------------------------- the postmark: SENT 8 MIN AGO (screen or world)
function svPostmark(c, x, y, s, k, rot = -0.16) {
  if (k <= 0.01) return;
  const sc = s * (1 + 1.4 * (1 - E.outCubic(clamp(k))));
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
  paint(() => {
    c.globalAlpha = clamp(k * 3);
    c.lineWidth = 7; c.strokeStyle = '#E8293C';
    c.beginPath(); c.arc(0, 0, 92, 0, 7); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 80, 0, 7); c.stroke();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(100, -30 + i * 20); for (let x = 100; x <= 300; x += 20) c.lineTo(x, -30 + i * 20 + 6 * Math.sin(x * 0.06)); c.lineWidth = 5; c.stroke(); }
    c.fillStyle = '#E8293C'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '900 30px Montserrat'; c.fillText('SENT', 0, -42);
    c.font = '400 70px Anton'; c.fillText('8 MIN', 0, 6);
    c.font = '900 30px Montserrat'; c.fillText('AGO', 0, 52);
    c.globalAlpha = 1;
  });
  c.restore();
}

// ---------------------------------------------------------------- the countdown: SUNSHINE LEFT m:ss (screen space)
// secs = seconds left (it can be fractional); k pops it in; zero = 0..1 (red at 0:00); shake
function svTimer(x, y, secs, k, o = {}) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2) * (o.s || 1);
  screenSpace();
  const red = o.zero || 0;
  ctx.save(); ctx.translate(x + (o.dx || 0), y + (o.dy || 0)); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  paint(() => {
    rrect(ctx, -200, -92, 400, 184, 30); ctx.fillStyle = 'rgba(10,12,30,0.88)'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = mixH('#FFD447', '#FF4D5E', red); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 30px Montserrat'; ctx.fillStyle = mixH('#FFE99A', '#FF8A96', red);
    ctx.fillText('☀ SUNSHINE LEFT', 0, -50);
    const S = Math.max(0, Math.ceil(secs - 1e-6)), m = Math.floor(S / 60), ss = S % 60;
    ctx.font = '400 112px Anton'; ctx.fillStyle = mixH('#FFFFFF', '#FF5A6E', red);
    ctx.fillText(`${m}:${String(ss).padStart(2, '0')}`, 0, 26);
  });
  ctx.restore();
  softDot(gctx, x, y, 230 * s, red > 0.5 ? '#FF4D5E' : '#FFD447', 0.18);
}

// ---------------------------------------------------------------- the round window on SPACE (screen space)
// fn(cx, cy, R) draws the inside (screen coords), clipped to the disc; label under it
function svWindow(x, y, R, k, fn, label = 'SPACE · RIGHT NOW') {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.7);
  screenSpace();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#03040C'; ctx.fill();   // opaque first (the light map)
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  paint(() => fn(x, y, r));
  ctx.restore();
  paint(() => {
    ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.lineWidth = 16; ctx.strokeStyle = '#B9C2D6'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = '#6E7790'; ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39; circle(ctx, x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7), 4.5, '#5A637C'); }
    ctx.beginPath(); ctx.arc(x, y, r - 6, Math.PI * 1.1, Math.PI * 1.45); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  });
  if (label) svTag(label, x, y + r + 50, '#7FE9FF', k, 30);
}

// ---------------------------------------------------------------- a label pill (screen space): dark text on colour
function svTag(txt, x, y, col, k, size = 40, rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  paint(() => {
    ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + size * 1.1, h = size * 1.55;
    rrect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, h / 2 + 5); ctx.fillStyle = '#0B0B1A'; ctx.fill();
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, size * 0.04);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- a tumbleweed (any canvas): r radius, rot
function svTumbleweed(c, x, y, r, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const rng = mulberry32(77);
  c.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const a = rng() * 6.28, b = a + (rng() - 0.5) * 2.4, r1 = r * (0.3 + 0.7 * rng()), r2 = r * (0.5 + 0.5 * rng());
    c.beginPath(); c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    c.quadraticCurveTo(Math.cos((a + b) / 2) * r * 1.05, Math.sin((a + b) / 2) * r * 1.05, Math.cos(b) * r2, Math.sin(b) * r2);
    c.lineWidth = 2.5 + 2.5 * rng(); c.strokeStyle = rng() < 0.5 ? '#B98A4E' : '#8E6534'; c.stroke();
  }
  c.restore();
}
