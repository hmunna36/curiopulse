// Props: stopwatch, tires on a wet road, study cards, nerve-test clipboard, scan readout, stamps.
'use strict';

function stopwatch(x, y, s, minutes, t, a = 1) {
  if (a <= 0.01) return;
  const c = ctx;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  rrect(c, -22, -150, 44, 34, 8); c.fillStyle = '#C7CFDA'; c.fill();
  circle(c, 0, 0, 130, '#E8EEF5'); circle(c, 0, 0, 114, '#0E1433');
  for (let i = 0; i < 60; i++) {
    const ang = (i / 60) * Math.PI * 2 - Math.PI / 2, r0 = i % 5 ? 100 : 90;
    line(c, Math.cos(ang) * r0, Math.sin(ang) * r0, Math.cos(ang) * 108, Math.sin(ang) * 108, i % 5 ? 2 : 5, 'rgba(220,230,255,0.8)');
  }
  // sweep: the elapsed arc
  const frac = (minutes % 10) / 10;
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.closePath();
  c.fillStyle = 'rgba(127,233,255,0.25)'; c.fill();
  const ha = -Math.PI / 2 + (minutes % 1) * Math.PI * 2;
  line(c, 0, 0, Math.cos(ha) * 96, Math.sin(ha) * 96, 6, '#FF5A6E');
  circle(c, 0, 0, 10, '#FFFFFF');
  c.font = '400 58px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7FE9FF';
  const mm = Math.floor(minutes), ss = Math.floor((minutes - mm) * 60);
  c.fillText(`${mm}:${String(ss).padStart(2, '0')}`, 0, 54);
  c.restore();
  softDot(gctx, x, y, 170 * s, '#7FE9FF', 0.3 * a);
}

// a tire (side view) rolling on a wet road; kind 'slick' hydroplanes, 'tread' squirts water out
function tire(x, y, R, kind, t, spin) {
  const c = ctx;
  c.save(); c.translate(x, y);
  // water spray
  const rng = mulberry32(kind === 'slick' ? 3 : 4);
  for (let i = 0; i < 26; i++) {
    const k = ((t * 1.6 + i / 26) % 1);
    const ang = kind === 'slick' ? Math.PI + 0.15 + rng() * 0.3 : Math.PI + 0.5 + rng() * 1.2;
    const d = R * (0.9 + k * (kind === 'slick' ? 0.7 : 1.2));
    circle(c, Math.cos(ang) * d * 0.9 + (kind === 'slick' ? -R * 0.3 : 0), R + Math.sin(ang) * d * 0.35 - (kind === 'slick' ? 0 : k * 80), 6 * (1 - k), rgba('#BFE6FF', 0.8 * (1 - k)));
  }
  if (kind === 'slick') { // a sheet of water wedged under the tire
    c.beginPath(); c.moveTo(-R * 1.1, R); c.quadraticCurveTo(-R * 0.3, R - 22, R * 0.2, R - 4); c.lineTo(R * 0.2, R + 8); c.lineTo(-R * 1.1, R + 8); c.closePath();
    c.fillStyle = 'rgba(127,200,255,0.65)'; c.fill();
  }
  c.rotate(kind === 'slick' ? 0 : spin);
  circle(c, 0, 0, R, '#1F1F26');
  if (kind === 'tread') {
    for (let i = 0; i < 28; i++) {
      c.save(); c.rotate((i / 28) * Math.PI * 2);
      rrect(c, -9, -R - 2, 18, 24, 4); c.fillStyle = '#0B0B10'; c.fill();
      c.restore();
    }
  } else {
    c.beginPath(); c.arc(0, 0, R - 4, 0, 7); c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,0.18)'; c.stroke();
  }
  circle(c, 0, 0, R * 0.6, '#2E2E38');
  circle(c, 0, 0, R * 0.46, '#B9C2CE');
  for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * Math.PI * 2 / 5); rrect(c, -8, -R * 0.44, 16, R * 0.36, 6); c.fillStyle = '#8E98A6'; c.fill(); c.restore(); }
  circle(c, 0, 0, R * 0.1, '#5A6270');
  c.restore();
}

function card(x, y, k, lines, verdict, col, t, rot = 0, size = 1) {
  if (k <= 0.001) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8) * size;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -190, -240, 380, 480, 24); c.fillStyle = '#F7F4EC'; c.fill();
  c.lineWidth = 6; c.strokeStyle = col; c.stroke();
  c.font = '900 34px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1A1C2C';
  c.fillText(lines[0], -150, -180);
  c.font = '700 22px Montserrat'; c.fillStyle = '#6A6F85';
  c.fillText(lines[1], -150, -140);
  for (let i = 0; i < 6; i++) { rrect(c, -150, -100 + i * 36, 300 - (i % 3) * 50, 12, 6); c.fillStyle = '#D6D2C6'; c.fill(); }
  // verdict stamp
  c.save(); c.translate(20, 170); c.rotate(-0.12);
  rrect(c, -130, -48, 260, 96, 16); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  c.font = '400 60px Anton'; c.textAlign = 'center'; c.fillStyle = col; c.fillText(verdict, 0, 4);
  c.restore();
  c.restore();
}

function clipboard(x, y, k, t, rows) {
  if (k <= 0.001) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(0.05); c.scale(s, s);
  rrect(c, -220, -280, 440, 560, 30); c.fillStyle = '#8A5A3A'; c.fill();
  rrect(c, -190, -240, 380, 500, 14); c.fillStyle = '#F7F4EC'; c.fill();
  rrect(c, -80, -300, 160, 60, 16); c.fillStyle = '#B9C2CE'; c.fill();
  c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1A1C2C';
  c.fillText('NERVE TEST', 0, -190);
  c.font = '700 24px Montserrat'; c.fillStyle = '#6A6F85'; c.fillText('soak 5+ min, check wrinkles', 0, -148);
  rows.forEach(([label, ok, at], i) => {
    const yy = -80 + i * 76;
    c.textAlign = 'left'; c.font = '800 32px Montserrat'; c.fillStyle = '#1A1C2C'; c.fillText(label, -160, yy);
    rrect(c, 90, yy - 26, 52, 52, 10); c.lineWidth = 5; c.strokeStyle = '#1A1C2C'; c.stroke();
    const kk = clamp((t - at) / 0.15);
    if (kk > 0) {
      c.save(); c.translate(116, yy); c.scale(E.outBack(kk, 2), E.outBack(kk, 2));
      if (ok) { c.beginPath(); c.moveTo(-16, 0); c.lineTo(-4, 14); c.lineTo(20, -16); c.lineWidth = 9; c.strokeStyle = '#18A56B'; c.lineCap = 'round'; c.stroke(); }
      else { line(c, -15, -15, 15, 15, 9, '#E0304A'); line(c, -15, 15, 15, -15, 9, '#E0304A'); }
      c.restore();
    }
  });
  c.restore();
}

function scanReadout(x, y, k, label, pct, col) {
  if (k <= 0.001) return;
  const c = ctx;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = clamp(k * 2);
  rrect(c, x - 250, y - 60, 500, 120, 28); c.fillStyle = 'rgba(6,14,30,0.9)'; c.fill();
  c.lineWidth = 4; c.strokeStyle = col; c.stroke();
  c.font = '800 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(220,235,255,0.8)';
  c.fillText(label, x - 220, y - 18);
  c.font = '400 64px Anton'; c.fillStyle = col; c.textAlign = 'right'; c.fillText(pct, x + 225, y + 6);
  c.restore();
}

function bigX(x, y, s, k) {
  if (k <= 0) return;
  const sc = lerp(2.4, 1, E.outCubic(clamp(k))) * s;
  for (const [cc, w, col] of [[ctx, 60, '#FF3A4A'], [gctx, 90, 'rgba(255,58,74,0.7)']]) {
    cc.save(); cc.setTransform(cc === gctx ? 0.5 : 1, 0, 0, cc === gctx ? 0.5 : 1, 0, 0);
    cc.translate(x, y); cc.scale(sc, sc); cc.globalAlpha = clamp(k * 3);
    cc.lineCap = 'round'; cc.lineWidth = w; cc.strokeStyle = col;
    cc.beginPath(); cc.moveTo(-160, -160); cc.lineTo(160, 160); cc.moveTo(160, -160); cc.lineTo(-160, 160); cc.stroke();
    cc.restore();
  }
}

function neonWord(txt, x, y, size, col, k, t) {
  if (k <= 0) return;
  const flick = k < 1 ? (Math.sin(t * 90) > 0 ? 1 : 0.3) : 0.9 + 0.1 * Math.sin(t * 20);
  for (const [cc, sc, a] of [[gctx, 0.5, 0.9], [ctx, 1, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y);
    cc.font = `400 ${size}px Anton`; cc.textAlign = 'center'; cc.textBaseline = 'middle';
    cc.globalAlpha = clamp(k) * flick * a;
    if (cc === ctx) { cc.lineWidth = size * 0.06; cc.strokeStyle = col; cc.strokeText(txt, 0, 0); cc.fillStyle = '#FFFFFF'; cc.fillText(txt, 0, 0); }
    else { cc.fillStyle = col; cc.fillText(txt, 0, 0); }
    cc.restore();
  }
}

function snowflakes(t, a = 1) {
  screenSpace();
  for (let i = 0; i < 40; i++) {
    const x = (hash(i) * W + 30 * Math.sin(t + i)) % W, y = ((hash(i + 9) * H + t * (80 + 60 * hash(i + 3))) % H);
    const r = 3 + 4 * hash(i + 5);
    circle(ctx, x, y, r, rgba('#FFFFFF', 0.8 * a)); softDot(gctx, x, y, r * 4, '#BFF0FF', 0.6 * a);
  }
}
