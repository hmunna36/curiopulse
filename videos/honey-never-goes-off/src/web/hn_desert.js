// Your HONEY Could Outlive You: inside the jar. The honey is a golden desert of glossy dunes under the curved glass
// (the label's letters backwards on it, the kitchen lamp as its sun); a germ in a straw hat pants on a dune; sugar grains
// with faces pop out of the honey and slurp the water out of it through striped straws.
'use strict';

// the dune layers: base height, amplitudes, frequencies, colours (back to front)
const HN_DUNES = [
  { base: 1060, a: 26, f: 0.006, ph: 0.4, a2: 10, f2: 0.017, p: 0.25, top: '#F2B04E', bot: '#D9861E' },
  { base: 1200, a: 40, f: 0.0045, ph: 2.1, a2: 14, f2: 0.013, p: 0.45, top: '#F7BC56', bot: '#DE8C22' },
  { base: 1390, a: 58, f: 0.0036, ph: 4.0, a2: 18, f2: 0.011, p: 0.7, top: '#FFC965', bot: '#E39628' },
  { base: 1610, a: 70, f: 0.003, ph: 1.0, a2: 22, f2: 0.009, p: 1.0, top: '#FFD375', bot: '#EA9F2E' },
];
// the top of dune layer i at world x (in that layer's own frame; the near layer (p 1) is the world)
function hnDuneY(i, x) {
  const d = HN_DUNES[i];
  return d.base - d.a * Math.sin(x * d.f + d.ph) - d.a2 * Math.sin(x * d.f2 + d.ph * 1.7);
}
// a parallax camera for a far layer: p 0 = fixed to the screen, 1 = the world; hz moves the horizon (+ = higher angle)
function hnParCam(cam, p, hz = 0) {
  return { x: lerp(540, cam.x, p), y: lerp(960, cam.y, p) - hz * (1 - p), zoom: lerp(1, cam.zoom, p), rot: 0, sx: cam.sx, sy: cam.sy };
}

// o: {hz (camera height: + high angle, - low), sun [x, y] in screen terms, t}
function hnDesertBack(cam, t, o = {}) {
  const hz = o.hz || 0;
  // the sky: the inside of the glass, warm gold
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FFF0C8'); g.addColorStop(0.45, '#FFD98C'); g.addColorStop(0.75, '#FFC062'); g.addColorStop(1, '#F7A43E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // the kitchen beyond the glass, soft: the window (blue), the counter's teal, the lamp as the sun
  const C0 = hnParCam(cam, 0.08, hz);
  applyCam(C0);
  paint(() => {
    ctx.fillStyle = 'rgba(140,200,240,0.45)'; rrect(ctx, -60, 260, 380, 420, 40); ctx.fill();
    ctx.fillStyle = 'rgba(80,150,140,0.30)'; ctx.fillRect(-300, 1000, 1700, 300);
  });
  const sx = o.sun ? o.sun[0] : 820, sy = o.sun ? o.sun[1] : 420;
  softDot(ctx, sx, sy, 210, '#FFF6DA', 0.9);
  circle(ctx, sx, sy, 62, '#FFFBEA');
  softDot(gctx, sx, sy, 150, '#FFF2C0', 0.9);
  softDot(gctx, sx, sy, 380, '#FFC86A', 0.35);
  // the lid's underside across the top (inside of a gold cap) and the glass wall's curve
  screenSpace();
  ctx.fillStyle = '#B9821E'; ctx.fillRect(0, 0, W, 140);
  paint(() => { for (let x = -20; x < W; x += 36) line(ctx, x, 0, x + 20, 140, 6, 'rgba(255,220,120,0.35)'); });
  // the label from behind, on the curved glass to the right: cream paper, letters backwards
  const C1 = hnParCam(cam, 0.12, hz);
  applyCam(C1);
  ctx.save(); ctx.translate(920, 760); ctx.rotate(0.04);
  rrect(ctx, -260, -170, 560, 340, 30); ctx.fillStyle = 'rgba(250,236,200,0.80)'; ctx.fill();
  paint(() => {
    ctx.save(); ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(122,62,10,0.55)'; ctx.font = '900 150px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('HONEY', -20, -10);
    ctx.restore();
  });
  ctx.restore();
  // the glass's curve: two broad soft highlights (paint: they are on the glass)
  screenSpace();
  paint(() => {
    const hl = ctx.createLinearGradient(0, 0, 160, 0);
    hl.addColorStop(0, 'rgba(255,255,255,0)'); hl.addColorStop(0.5, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl; ctx.fillRect(60, 140, 160, 1100);
    const hr = ctx.createLinearGradient(900, 0, 1000, 0);
    hr.addColorStop(0, 'rgba(255,255,255,0)'); hr.addColorStop(0.5, 'rgba(255,255,255,0.22)'); hr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hr; ctx.fillRect(900, 140, 100, 1000);
  });
  // a far landmark: the wooden dipper standing in the honey like a desert monolith
  const C2 = hnParCam(cam, HN_DUNES[0].p, hz);
  applyCam(C2);
  ctx.save(); ctx.translate(250, 1040); ctx.rotate(-0.12);
  rrect(ctx, -16, -600, 32, 560, 16); ctx.fillStyle = '#C8955A'; ctx.fill();
  ellipse(ctx, 0, -40, 54, 70, '#E8A23C');
  paint(() => { for (let i = -2; i <= 2; i++) line(ctx, -50, -40 + i * 22, 50, -40 + i * 22, 6, 'rgba(160,90,20,0.6)'); });
  ctx.restore();
  // the dunes, back to front (the last one is drawn by hnDesertFront after the characters that stand behind it)
  for (let i = 0; i < 3; i++) hnDune(cam, i, t, hz);
}
function hnDune(cam, i, t, hz) {
  const d = HN_DUNES[i], C = hnParCam(cam, d.p, hz);
  applyCam(C);
  const x0 = -900, x1 = 2000;
  const top = (x) => hnDuneY(i, x);
  const g = ctx.createLinearGradient(0, d.base - d.a - 30, 0, d.base + 420);
  g.addColorStop(0, d.top); g.addColorStop(0.35, d.bot); g.addColorStop(1, mixH(d.bot, '#B4600E', 0.6));
  ctx.beginPath(); ctx.moveTo(x0, 2600);
  for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, top(x));
  ctx.lineTo(x1, 2600); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  // the crest's gloss and a few bubbles in the honey (paint)
  paint(() => {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 20) { const y = top(x) + 6; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.lineWidth = 6 + 2 * i; ctx.strokeStyle = rgba('#FFF4CC', 0.55); ctx.stroke();
    for (let k = 0; k < 7; k++) {
      const bx = -200 + ((k * 331 + i * 97) % 1500), rise = ((t * (12 + k * 3) + k * 40) % 220);
      const by = top(bx) + 60 + 200 - rise;
      if (by > top(bx) + 20) { ctx.beginPath(); ctx.arc(bx, by, 6 + (k % 3) * 4, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,248,220,0.65)'; ctx.stroke(); }
    }
  });
  // glints on the crest (the glow layer)
  for (let k = 0; k < 5; k++) {
    const gx = -300 + ((k * 397 + i * 151) % 1700), tw = 0.5 + 0.5 * Math.sin(t * loopW(3) + k * 1.9 + i);
    softDot(gctx, gx, top(gx) + 4, 26 + 8 * i, '#FFF6D0', 0.35 * tw);
  }
}
// the nearest dune (drawn after whatever stands behind it), plus sugar-crystal rocks and heat shimmer
function hnDesertFront(cam, t, o = {}) {
  hnDune(cam, 3, t, o.hz || 0);
  applyCam(hnParCam(cam, 1, o.hz || 0));
  for (const [x, s, rot] of o.rocks || [[120, 1.0, 0.3], [980, 1.2, -0.2]]) hnCrystal(ctx, x, hnDuneY(3, x) + 14, s, rot);
}
// a sugar crystal as a rock (no face)
function hnCrystal(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-40, 0); c.lineTo(-30, -56); c.lineTo(10, -70); c.lineTo(42, -40); c.lineTo(36, 0); c.closePath(); c.fillStyle = '#F4F7FB'; c.fill();
  c.beginPath(); c.moveTo(10, -70); c.lineTo(42, -40); c.lineTo(36, 0); c.lineTo(4, -10); c.closePath(); c.fillStyle = '#C9D6E6'; c.fill();
  c.restore();
}
// heat shimmer over the dunes (screen space, paint)
function hnShimmer(t, a = 1) {
  screenSpace();
  paint(() => {
    for (let i = 0; i < 9; i++) {
      const x = 80 + i * 112, y = 1180 + (i % 3) * 70;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 1; k <= 6; k++) ctx.lineTo(x + 6 * Math.sin(t * 7 + k + i), y - k * 14);
      ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,250,230,${0.25 * a})`; ctx.stroke();
    }
  });
}

// ---------------------------------------------------------------- the germ
// a germ on the honey (feet at x, y; scale s). o: {shrivel 0..1, pant 0..1, look -1..1, hat 1, sweat 0..1, fear 0..1}
function hnGerm(c, x, y, s, t, o = {}) {
  const sh = clamp(o.shrivel || 0), R = 62 * (1 - 0.46 * sh);
  const body = mixH('#5CCB5F', '#6A4426', clamp(sh * 1.3)), dark = mixH('#3E9E45', '#4A2E18', clamp(sh * 1.3));
  const bob = 4 * Math.sin(t * 9) * (o.pant || 0) * (1 - sh);
  actor(() => {
    c.save(); c.translate(x, y - R - 8 + bob * 0.3); c.scale(s, s);
    // little legs
    for (const lx of [-34, -12, 12, 34]) line(c, lx * (1 - 0.4 * sh), R * 0.8, lx * 1.1 * (1 - 0.4 * sh), R + 10, 9, dark);
    // the body: a wobbly blob (a raisin's wrinkles when it shrivels)
    c.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const rr = R * (1 + 0.06 * Math.sin(a * 5 + t * 3) + 0.12 * sh * Math.sin(a * 9 + 1.3));
      const px = Math.cos(a) * rr * 1.08, py = Math.sin(a) * rr;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath(); c.fillStyle = body; c.fill();
    c.restore();
  });
  c.save(); c.translate(x, y - R - 8 + bob * 0.3); c.scale(s, s);
  paint(() => {
    // spots, or the raisin's wrinkles
    if (sh < 0.5) for (const [px, py, pr] of [[-30, 22, 9], [26, 28, 7], [34, -26, 6], [-40, -18, 5]]) ellipse(c, px * (1 - 0.4 * sh), py * (1 - 0.4 * sh), pr, pr * 0.8, rgba('#2F8A3A', 0.7 * (1 - sh * 2)));
    if (sh > 0.2) for (let i = 0; i < 6; i++) {
      c.beginPath(); const yy = -R * 0.7 + i * R * 0.28;
      c.moveTo(-R * 0.8, yy); c.quadraticCurveTo(0, yy + 10 * Math.sin(i * 2.1), R * 0.8, yy - 6);
      c.lineWidth = 3; c.strokeStyle = rgba('#3A2210', clamp((sh - 0.2) * 2)); c.stroke();
    }
    // eyes
    const ey = -R * 0.22, er = 17 * (1 - 0.35 * sh), lk = (o.look || 0) * 6;
    for (const sx of [-1, 1]) {
      if (sh > 0.8) { line(c, sx * 22 - 7, ey - 7, sx * 22 + 7, ey + 7, 4, '#2A1A10'); line(c, sx * 22 - 7, ey + 7, sx * 22 + 7, ey - 7, 4, '#2A1A10'); }
      else {
        ellipse(c, sx * 24 * (1 - 0.3 * sh), ey, er, er * (1 + 0.25 * (o.fear || 0)), '#FFFFFF');
        circle(c, sx * 24 * (1 - 0.3 * sh) + lk, ey + 2, er * 0.45, '#1A1424');
        circle(c, sx * 24 * (1 - 0.3 * sh) + lk - 3, ey - 2, er * 0.15, '#FFFFFF');
      }
    }
    // the mouth: open, panting, the tongue out
    const pa = (o.pant || 0) * (1 - sh);
    const mo = 0.5 + 0.5 * Math.abs(Math.sin(t * 9));
    ellipse(c, 0, R * 0.32, 14 + 4 * pa, 6 + 10 * pa * mo, '#5A1522');
    if (pa > 0.05) { ellipse(c, 4, R * 0.32 + 10 + 8 * pa * mo, 9, 12 * pa, '#E0616C'); }
  });
  // the straw hat
  if ((o.hat == null ? 1 : o.hat) > 0.01) {
    const hy = -R * 0.95 - 6;
    ellipse(c, 0, hy + 8, 58 * (1 - 0.2 * sh), 12, '#E9C46A');
    c.beginPath(); c.ellipse(0, hy, 30, 26, 0, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = '#F2D27E'; c.fill();
    line(c, -30, hy - 2, 30, hy - 2, 7, '#D9534F');
  }
  // sweat
  if ((o.sweat || 0) > 0.01) paint(() => { for (const [px, ph] of [[-R - 6, 0], [R + 8, 1.7]]) { const dy = ((t * 1.4 + ph) % 1) * 30; sweatDrop(c, px, -R * 0.3 + dy, 1.1, o.sweat); } });
  c.restore();
}

// ---------------------------------------------------------------- the sugar grains
// a grain (centre x, y; scale s). o: {k 0..1 (popping up out of the honey), tx, ty (where its straw points, world),
// straw 0..1 (how far the straw reaches), slurp 0..1 (water flowing up the straw), cheeks 0..1, look -1..1, rot}
function hnGrain(c, x, y, s, t, o = {}) {
  const k = clamp(o.k == null ? 1 : o.k);
  if (k <= 0.01) return;
  const sc = s * E.outBack(k, 2.4), rot = o.rot || 0;
  // the straw first (behind the grain)
  const st0 = [x + 18 * sc, y + 8 * sc];
  if ((o.straw || 0) > 0.01 && o.tx != null) {
    const sk = clamp(o.straw), ex = lerp(st0[0], o.tx, sk), ey = lerp(st0[1], o.ty, sk);
    line(c, st0[0], st0[1], ex, ey, 13 * s, '#FFFFFF');
    paint(() => {
      const L = Math.hypot(ex - st0[0], ey - st0[1]), n = Math.floor(L / (26 * s));
      for (let i = 0; i < n; i += 2) {
        const u0 = i / Math.max(1, L / (26 * s)), u1 = (i + 1) / Math.max(1, L / (26 * s));
        line(c, lerp(st0[0], ex, u0), lerp(st0[1], ey, u0), lerp(st0[0], ex, Math.min(1, u1)), lerp(st0[1], ey, Math.min(1, u1)), 11 * s, '#E2524E');
      }
      // water blobs travelling up the straw toward the grain
      const sl = o.slurp || 0;
      if (sl > 0.01) for (let i = 0; i < 4; i++) {
        const u = 1 - ((t * 2.2 + i / 4) % 1);
        circle(c, lerp(st0[0], ex, u), lerp(st0[1], ey, u), 7 * s * sl, '#5FC8FF');
      }
    });
  }
  actor(() => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
    // a cube seen a little from above: the front face, the top, the side
    c.beginPath(); c.moveTo(-34, -20); c.lineTo(30, -20); c.lineTo(30, 40); c.lineTo(-34, 40); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
    c.beginPath(); c.moveTo(-34, -20); c.lineTo(-18, -38); c.lineTo(46, -38); c.lineTo(30, -20); c.closePath(); c.fillStyle = '#F2F7FF'; c.fill();
    c.beginPath(); c.moveTo(30, -20); c.lineTo(46, -38); c.lineTo(46, 22); c.lineTo(30, 40); c.closePath(); c.fillStyle = '#C9D6EA'; c.fill();
    c.restore();
  });
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
  paint(() => {
    const lk = (o.look || 0) * 4, ch = o.cheeks || 0;
    circle(c, -16 + lk, 4, 6, '#1A1424'); circle(c, 10 + lk, 4, 6, '#1A1424');
    line(c, -24, -6, -8, -2, 4, '#1A1424'); line(c, 2, -2, 18, -6, 4, '#1A1424');   // determined brows
    if (ch > 0.05) { ellipse(c, -22, 22, 9 * ch, 7 * ch, 'rgba(255,140,160,0.5)'); ellipse(c, 16, 22, 9 * ch, 7 * ch, 'rgba(255,140,160,0.5)'); }
    ellipse(c, 4, 22, 7 + 2 * ch, 5 + 3 * ch, '#5A1522');
    // a sparkle on the corner
    line(c, -26, -14, -18, -14, 3, 'rgba(255,255,255,0.95)');
  });
  c.restore();
  softDot(gctx, x - 10 * sc, y - 30 * sc, 24 * sc, '#FFFFFF', 0.35);
}
// a ring of honey around something popping out of it (world)
function hnSplash(c, x, y, k, s = 1) {
  if (k <= 0.01 || k >= 0.99) return;
  const r = 40 * s * k;
  ellipse(c, x, y, r * 1.6, r * 0.35, '#FFD375');
  paint(() => { for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + i * 0.14); circle(c, x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.3, 7 * s * (1 - k), '#FFC965'); } });
}
