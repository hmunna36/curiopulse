// If You Fell Into JUPITER: the props. NASA's probe under its parachute (it can be crushed), a diamond, the soup and
// syrup things that drift past him, the gauge AIR / SOUP / SYRUP / OCEAN, a clock pill, tags, a comic burst, speed
// lines, lightning inside a deck, his silhouette (the hole he leaves in a cloud deck).
'use strict';

// ---------------------------------------------------------------- a diamond (a brilliant, side on), centred at (x, y), s = half-width
function jpGem(c, x, y, s, rot = 0, k = 1, o = {}) {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  const T = -0.36, G = -0.06, B = 0.86;                      // table, girdle, the pavilion's point (in half-widths)
  // pavilion and crown, each in facets
  const facets = [
    [[-1, G], [-0.5, G], [0, B], '#BDEBFF'], [[-0.5, G], [0, G], [0, B], '#7FD2F2'], [[0, G], [0.5, G], [0, B], '#E4F8FF'],
    [[0.5, G], [1, G], [0, B], '#94DAF5'], [[-1, G], [-0.62, T], [-0.3, T], '#E9FAFF'], [[-1, G], [-0.3, T], [-0.5, G], '#A6E2F8'],
    [[-0.5, G], [-0.3, T], [0.3, T], '#F8FDFF'], [[-0.5, G], [0.3, T], [0.5, G], '#CFF1FF'], [[0.5, G], [0.3, T], [0.62, T], '#9EDDF5'],
    [[0.5, G], [0.62, T], [1, G], '#7CCCEC'],
  ];
  for (const [a, b, d, col] of facets) { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.closePath(); c.fillStyle = col; c.fill(); }
  paint(() => {
    c.beginPath(); c.moveTo(-1, G); c.lineTo(-0.62, T); c.lineTo(0.62, T); c.lineTo(1, G); c.lineTo(0, B); c.closePath();
    c.lineJoin = 'round'; c.lineWidth = 0.07; c.strokeStyle = o.edge || '#1A3A5C'; c.stroke();
    c.lineWidth = 0.025; c.strokeStyle = 'rgba(26,58,92,0.55)';
    c.beginPath(); c.moveTo(-1, G); c.lineTo(1, G); c.moveTo(-0.5, G); c.lineTo(0, B); c.lineTo(0.5, G); c.moveTo(-0.5, G); c.lineTo(-0.3, T);
    c.moveTo(0.5, G); c.lineTo(0.3, T); c.moveTo(-0.5, G); c.lineTo(0.3, T); c.stroke();
  });
  c.restore();
}
// its sparkle: a four-point star into both layers (screen space), tw = 0..1 twinkle
function jpGlint(x, y, r, tw = 1) {
  if (tw <= 0.02) return;
  both((c, g) => {
    c.save(); c.translate(x, y); c.globalAlpha = (g ? 0.95 : 0.85) * tw;
    c.fillStyle = '#FFFFFF';
    for (const a of [0, Math.PI / 2]) { c.save(); c.rotate(a + 0.3); c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r * 0.09, r, 0); c.quadraticCurveTo(0, r * 0.09, -r, 0); c.fill(); c.restore(); }
    c.beginPath(); c.arc(0, 0, r * 0.16, 0, 7); c.fill();
    c.restore();
  });
}

// ---------------------------------------------------------------- NASA's probe (the Galileo probe's descent module, 1995)
// (x, y) = the module's middle; s = scale (1: the module 120 px wide). o: {chute 0..1 open, crush 0..1, sway, t, blink}
function jpProbe(c, x, y, s, t, o = {}) {
  const crush = o.crush || 0, chute = o.chute === undefined ? 1 : o.chute, sway = o.sway || 0;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(sway);
  // the parachute: a dome of striped gores above, its lines to the module
  if (chute > 0.01) {
    const top = -330, Rw = 150 * chute + 40 * (1 - chute), Rh = 92 * chute + 30;
    const deflate = crush * 0.7;
    c.save(); c.translate(0, top + 20 * deflate); c.scale(1 - 0.35 * deflate, 1 - 0.5 * deflate);
    const N = 8;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + (i / N) * Math.PI, a1 = Math.PI + ((i + 1) / N) * Math.PI;
      c.beginPath(); c.moveTo(0, 0);
      c.lineTo(Math.cos(a0) * Rw, Math.sin(a0) * Rh);
      c.quadraticCurveTo(Math.cos((a0 + a1) / 2) * Rw * 1.04, Math.sin((a0 + a1) / 2) * Rh * 1.04 + 8, Math.cos(a1) * Rw, Math.sin(a1) * Rh);
      c.closePath(); c.fillStyle = i % 2 ? '#F2F2EE' : '#E8792E'; c.fill();
    }
    // the skirt's scallops
    c.beginPath();
    for (let i = 0; i <= N; i++) { const xx = -Rw + (2 * Rw * i) / N; c.lineTo(xx, 0); if (i < N) c.quadraticCurveTo(xx + Rw / N, 16, xx + (2 * Rw) / N, 0); }
    c.lineWidth = 6; c.strokeStyle = '#C8642A'; c.stroke();
    c.restore();
    // lines
    c.lineWidth = 2.2; c.strokeStyle = 'rgba(60,50,40,0.85)';
    for (let i = 0; i <= 6; i++) { const xx = -Rw * (1 - 0.35 * deflate) + (2 * Rw * (1 - 0.35 * deflate) * i) / 6; c.beginPath(); c.moveTo(xx, top + 20 * deflate); c.lineTo(0, -64 + 20 * crush); c.stroke(); }
  }
  // the module: a squat drum wrapped in gold foil, a dark band, a top deck with an antenna and two booms
  const sqY = 1 - 0.52 * crush, sqX = 1 + 0.22 * crush;
  c.save(); c.scale(sqX, sqY);
  const rng = mulberry32(5);
  const outline = (j) => {                                    // a crumpled outline when crushed
    c.beginPath();
    const pts = [[-62, -42], [62, -42], [66, 38], [-66, 38]];
    for (let i = 0; i < 4; i++) {
      const a = pts[i], b = pts[(i + 1) % 4];
      for (let k = 0; k < 6; k++) {
        const u = k / 6, jx = crush * (rng() - 0.5) * 18, jy = crush * (rng() - 0.5) * 16;
        c.lineTo(lerp(a[0], b[0], u) + jx * j, lerp(a[1], b[1], u) + jy * j);
      }
    }
    c.closePath();
  };
  outline(1);
  const g = c.createLinearGradient(-66, 0, 66, 0);
  g.addColorStop(0, '#E8B85A'); g.addColorStop(0.35, '#F6D88A'); g.addColorStop(0.7, '#C9922E'); g.addColorStop(1, '#8E6218');
  c.fillStyle = g; c.fill();
  paint(() => {
    // foil crinkles
    c.lineWidth = 1.6; c.strokeStyle = 'rgba(110,70,10,0.5)';
    const r2 = mulberry32(9);
    for (let i = 0; i < 9; i++) { const xx = -56 + r2() * 112, yy = -34 + r2() * 64; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 10 + r2() * 14, yy + (r2() - 0.5) * 14); c.lineTo(xx + 20 + r2() * 12, yy + (r2() - 0.5) * 10); c.stroke(); }
    rrect(c, -66, -6, 132, 14, 3); c.fillStyle = '#3A3A42'; c.fill();
    if (crush > 0.3) {                                       // crush lines
      c.lineWidth = 3; c.strokeStyle = 'rgba(60,30,0,0.75)';
      for (const xx of [-40, -10, 22, 48]) { c.beginPath(); c.moveTo(xx, -40); c.lineTo(xx + 8, -10); c.lineTo(xx - 6, 12); c.lineTo(xx + 6, 36); c.stroke(); }
    }
  });
  c.restore();
  // the top deck, antenna, booms
  const ty = -42 * sqY;
  rrect(c, -48 * sqX, ty - 14, 96 * sqX, 16, 5); c.fillStyle = '#B8BCC6'; c.fill();
  line(c, 18, ty - 14, 26 - 20 * crush, ty - 60 + 24 * crush, 4, '#9AA0AE');
  circle(c, 26 - 20 * crush, ty - 62 + 24 * crush, 7, '#D8DCE6');
  if (o.blink !== undefined) {
    const on = o.blink > 0.5 && crush < 0.5 ? 1 : 0;
    both((cc, gl) => { if (on) { if (gl) { cc.save(); cc.setTransform(0.5, 0, 0, 0.5, 0, 0); } } });
    if (on) { circle(c, 26, ty - 62, 5, '#FF3B3B'); }
  }
  line(c, -48 * sqX, ty - 4, -84 * sqX, ty - 16 + 10 * crush, 4, '#9AA0AE');
  c.restore();
}
// the probe's red light in the glow layer (screen point)
function jpProbeLamp(x, y, s, on) {
  if (!on) return;
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, 34 * s, '#FF4A3A', 0.9); gctx.restore();
}

// ---------------------------------------------------------------- the soup: noodles, carrot coins, peas, pasta letters
function jpNoodle(c, x, y, s, rot, t, ph = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath();
  for (let i = 0; i <= 24; i++) { const u = i / 24; c.lineTo(-90 + 180 * u, 14 * Math.sin(u * 9 + t * 2 + ph)); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = 15; c.strokeStyle = '#C99A3A'; c.stroke();
  c.lineWidth = 10; c.strokeStyle = '#F2D07A'; c.stroke();
  c.restore();
}
function jpCarrot(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s * 0.82);
  circle(c, 0, 0, 30, '#E8641E'); circle(c, 0, 0, 22, '#FF8A3A');
  paint(() => { c.lineWidth = 2; c.strokeStyle = 'rgba(180,70,10,0.6)'; for (let i = 0; i < 6; i++) { const a = i * 1.047; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); c.stroke(); } });
  c.restore();
}
function jpPea(c, x, y, s) { circle(c, x, y, 14 * s, '#3E9A2E'); circle(c, x - 4 * s, y - 4 * s, 8 * s, '#6FCB4A'); }
function jpLetter(c, x, y, s, rot, ch) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.font = '900 64px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 10; c.strokeStyle = '#C99A3A'; c.lineJoin = 'round'; c.strokeText(ch, 0, 0);
  c.fillStyle = '#F6DA8C'; c.fillText(ch, 0, 0);
  c.restore();
}
// ---------------------------------------------------------------- the syrup: a stack of pancakes with butter, a bubble
function jpPancakes(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  for (let i = 0; i < 3; i++) {
    const yy = -i * 26;
    ellipse(c, 0, yy + 8, 112, 30, '#9A5A1C');
    ellipse(c, 0, yy, 112, 28, '#E8A956');
    ellipse(c, -10, yy - 6, 80, 15, '#F4C47A');
  }
  rrect(c, -26, -96, 52, 26, 6); c.fillStyle = '#FFE38A'; c.fill();
  rrect(c, -26, -96, 52, 9, 4); c.fillStyle = '#FFF2C0'; c.fill();
  c.restore();
}
function jpBubble(c, x, y, r, a = 1) {
  c.save(); c.globalAlpha = a;
  paint(() => {
    c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = Math.max(1.5, r * 0.09); c.strokeStyle = 'rgba(255,240,210,0.75)'; c.stroke();
    c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  });
  c.restore();
}

// ---------------------------------------------------------------- the gauge: how thick the "sky" is where he is
// (x, y) = the top of the bar (screen); u = 0..1 his place on it; k = 0..1 pop in
const GAUGE = [['AIR', '#BFE3FF'], ['SOUP', '#FF9A3C'], ['SYRUP', '#FFC23A'], ['OCEAN', '#FF4A2A']];
function jpGauge(x, y, k, u, t) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8), Hh = 520, w = 34;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2 - 8, -8, w + 16, Hh + 16, 22); ctx.fillStyle = 'rgba(8,8,20,0.78)'; ctx.fill();
  const g = ctx.createLinearGradient(0, 0, 0, Hh);
  g.addColorStop(0, '#BFE3FF'); g.addColorStop(0.36, '#FF9A3C'); g.addColorStop(0.66, '#FFC23A'); g.addColorStop(1, '#C8200A');
  rrect(ctx, -w / 2, 0, w, Hh, 16); ctx.fillStyle = g; ctx.fill();
  ctx.font = '400 40px Anton'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  GAUGE.forEach(([lab, col], i) => {
    const yy = 40 + i * ((Hh - 80) / 3), on = clamp(1 - Math.abs(u * 3 - i) * 1.4);
    ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.55 + 0.45 * on;
    ctx.strokeText(lab, w / 2 + 18, yy); ctx.fillStyle = on > 0.5 ? col : '#FFFFFF'; ctx.fillText(lab, w / 2 + 18, yy);
    ctx.globalAlpha = 1;
  });
  // the marker: a little helmet
  const my = 40 + clamp(u) * (Hh - 80);
  ctx.beginPath(); ctx.moveTo(-w / 2 - 10, my); ctx.lineTo(-w / 2 - 34, my - 16); ctx.lineTo(-w / 2 - 34, my + 16); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.beginPath(); ctx.arc(-w / 2 - 62, my, 24, 0, 7); ctx.fillStyle = '#2F7FE0'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-w / 2 - 62, my - 4, 15, 0, 7); ctx.fillStyle = '#F2C6A0'; ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- pills, tags, bursts (screen space)
function jpPill(txt, x, y, k, col = '#FFD447', size = 64, rot = -0.04, sub = null) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = Math.max(ctx.measureText(txt).width, sub ? sub.length * size * 0.24 : 0) + size * 0.9, h = size * (sub ? 1.95 : 1.45);
  rrect(ctx, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, h * 0.32); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, h * 0.28); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = '#0B0B1A'; ctx.fillText(txt, 0, sub ? -size * 0.26 : size * 0.04);
  if (sub) { ctx.font = `800 ${Math.round(size * 0.36)}px Montserrat`; ctx.fillText(sub, 0, size * 0.52); }
  ctx.restore();
}
function jpBurst(txt, x, y, size, col, k, rot = -0.08) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; const w = ctx.measureText(txt).width;
  ctx.beginPath();
  for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283, R = (i % 2 ? 0.62 : 0.86) * (w * 0.62 + 30); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.62); }
  ctx.closePath(); ctx.fillStyle = '#FFF2C4'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  ctx.restore();
  bigWord(txt, x, y + 2, size, col, s, rot);
}
// speed lines: thin streaks rushing up past him (screen space), k = 0..1 speed
function jpSpeedLines(t, k, seed = 3, col = '#FFFFFF', avoid = null) {
  if (k <= 0.01) return;
  screenSpace();
  const rng = mulberry32(seed);
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, len = 260 + rng() * 520, sp = 2400 + rng() * 2200, ph = rng() * 3000, wd = 3 + 5 * rng(), al = 0.08 + 0.16 * rng();
    if (avoid && Math.abs(x - avoid[0]) < avoid[1]) continue;
    const y = H + 600 - ((t * sp * (0.4 + 0.6 * k) + ph) % (H + 1200));
    const g = ctx.createLinearGradient(0, y, 0, y + len * k);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.5, rgba(col, al * k)); g.addColorStop(1, rgba(col, 0));
    ctx.lineWidth = wd; ctx.strokeStyle = g;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len * k); ctx.stroke();
  }
  ctx.restore();
}
// a lightning flash inside a deck: a bright patch with a jagged bolt (screen space), k = 0..1
function jpFlash(x, y, r, k, seed = 1) {
  if (k <= 0.02) return;
  both((c, g) => {
    softDot(c, x, y, r, g ? '#DDE8FF' : '#C8D6FF', (g ? 0.9 : 0.55) * k);
  });
  const rng = mulberry32(seed), pts = jagged(rng, x - r * 0.15, y - r * 0.25, x + r * 0.1, y + r * 0.3, r * 0.12, 4);
  both((c, g) => { c.save(); c.globalAlpha = k; c.lineJoin = 'round'; c.lineWidth = g ? 10 : 4; c.strokeStyle = '#FFFFFF'; c.beginPath(); pts.forEach((p) => c.lineTo(p[0], p[1])); c.stroke(); c.restore(); });
}
// his silhouette, spread-eagle (the hole he punches through a deck): a path in rig-ish units about (0, 0) = his middle
function jpManPath(c, x, y, s, sq = 1) {
  c.save(); c.translate(x, y); c.scale(s, s * sq);
  c.beginPath();
  c.arc(0, -150, 70, 0, 7);
  c.moveTo(-58, -90); c.lineTo(58, -90); c.lineTo(52, 40); c.lineTo(-52, 40); c.closePath();
  for (const sd of [-1, 1]) {
    c.moveTo(sd * 40, -88); c.lineTo(sd * 150, -200); c.lineTo(sd * 182, -178); c.lineTo(sd * 66, -40); c.closePath();
    c.moveTo(sd * 10, 30); c.lineTo(sd * 60, 30); c.lineTo(sd * 110, 190); c.lineTo(sd * 66, 200); c.closePath();
  }
  c.restore();
}
