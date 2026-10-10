// Inside her throat (cats-purr): the windpipe from the front, in section, with the voice box across it: two vocal
// folds, each with a soft pad in it (Herbst et al. 2023), that flutter shut and open while the air goes down (breathing
// in) and comes back up (breathing out). Drawn in screen space with flat shapes; the air and the sound are in the glow
// layer. Also: the cat in a round window, to say where we are.
'use strict';

const THR = { x: 490, top: 300, foldY: 800, split: 1110, half: 172, wall: 38, G: 78 };
// how far the folds are apart (0 shut .. 1 open), in slow motion: a beat of six frames
const THR_BEAT = [0, 0.72, 1, 0.62, 0.12, 0];
function thrGap(t) { const f = Math.round(t * 30); return THR_BEAT[((f % 6) + 6) % 6]; }
// the moments the folds have just clapped shut, before t (for the rings of sound)
function thrClaps(t, n = 3) { const f = Math.round(t * 30), f0 = f - ((((f - 5) % 6) + 6) % 6); return [...Array(n)].map((_, i) => (f0 - i * 6) / 30); }

// o: {gap 0..1, flow (px the air has travelled: grows on the way in, shrinks on the way out), dir: 1 in | -1 out,
//     lung 0..1 (how full), sound 0..1 (rings), air 0..1}
function thrDraw(t, o = {}) {
  const c = ctx, X = THR.x, gap = o.gap === undefined ? thrGap(t) : o.gap, g = gap * THR.G, dir = o.dir || 1, FY = THR.foldY;
  const lung = o.lung === undefined ? 0.5 : o.lung, air = o.air === undefined ? 1 : o.air;
  screenSpace();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // ---- the lungs (they fill and empty) and the two pipes down to them
  for (const sd of [-1, 1]) {
    const lx = X + sd * 290, ly = 1420, rx = 205 * (0.9 + 0.12 * lung), ry = 235 * (0.9 + 0.12 * lung);
    ellipse(c, lx, ly, rx, ry, '#D9728F');
    paint(() => { for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(lx - sd * 60, ly - 130); c.quadraticCurveTo(lx + sd * (10 + i * 30), ly - 60 + i * 12, lx + sd * (50 + i * 34) * (0.9 + 0.1 * lung), ly - 20 + i * 44); c.lineWidth = 7; c.strokeStyle = 'rgba(140,40,80,0.35)'; c.stroke(); } });
  }
  for (const [w, col] of [[178, '#B04870'], [104, '#2B0F2E']]) for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(X + sd * 46, THR.split - 60); c.quadraticCurveTo(X + sd * 70, THR.split + 110, X + sd * 250, THR.split + 190); c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }
  // ---- the windpipe: wall, then the dark inside
  c.fillStyle = '#B04870'; c.fillRect(X - THR.half - THR.wall, THR.top - 60, 2 * (THR.half + THR.wall), THR.split - THR.top + 60);
  c.fillStyle = '#2B0F2E'; c.fillRect(X - THR.half, THR.top - 60, 2 * THR.half, THR.split - THR.top + 62);
  paint(() => {
    for (const sd of [-1, 1]) line(c, X + sd * (THR.half - 5), THR.top - 40, X + sd * (THR.half - 5), THR.split - 30, 10, 'rgba(255,170,190,0.55)');
    for (let y = THR.top + 30; y < THR.split - 20; y += 74) if (Math.abs(y - FY) > 150) for (const sd of [-1, 1]) line(c, X + sd * (THR.half + 9), y, X + sd * (THR.half + THR.wall - 9), y, 9, 'rgba(255,200,215,0.32)');
  });
  // ---- air: soft beads that ride down (in) or up (out); the folds chop the stream
  if (air > 0.02) {
    const L = THR.split - THR.top + 40, N = 10, sp = L / N, col = dir > 0 ? '#9EE8FF' : '#FFD08A';
    for (let i = 0; i < N; i++) {
      const u = (((i * sp + (o.flow || 0)) % L) + L) % L, y = THR.top - 40 + u;
      const near = Math.abs(y - FY), sq = clamp(near / 120), dx = (THR.half - 44) * Math.sin(i * 2.4 + 0.7) * (0.25 + 0.75 * sq);
      let a = air * clamp(u / 60) * clamp((L - u) / 60);
      if (near < 34) a *= clamp(gap * 1.6);
      if (a < 0.03) continue;
      softDot(c, X + dx * (near < 60 ? g / THR.G : 1), y, 24, col, 0.95 * a); circle(c, X + dx * (near < 60 ? g / THR.G : 1), y, 8, rgba('#FFFFFF', 0.8 * a));
      softDot(gctx, X + dx * (near < 60 ? g / THR.G : 1), y, 34, col, 0.5 * a);
    }
  }
  // ---- the voice box: a collar of cartilage, and the two folds with their pads
  for (const sd of [-1, 1]) { rrect(c, X + sd * (THR.half + THR.wall + 6) - 36, FY - 128, 72, 256, 30); c.fillStyle = '#D9CFF5'; c.fill(); }
  const sh = gap < 0.2 ? (Math.round(t * 30) % 2 ? 2 : -2) : 0;
  for (const sd of [-1, 1]) {
    const tip = X + sd * (g / 2), wallX = X + sd * (THR.half + 4);
    c.beginPath(); c.moveTo(wallX, FY - 104); c.quadraticCurveTo(X + sd * (THR.half * 0.5), FY - 66, tip + sd * 10, FY - 16 + sh);
    c.quadraticCurveTo(tip - sd * 2, FY + 4 + sh, tip + sd * 12, FY + 26 + sh); c.quadraticCurveTo(X + sd * (THR.half * 0.55), FY + 62, wallX, FY + 88); c.closePath();
    c.fillStyle = '#FFD9CC'; c.fill();
    paint(() => { ellipse(c, tip + sd * 62, FY + 4 + sh, 34, 27, '#FFF4CC'); ellipse(c, tip + sd * 55, FY - 3 + sh, 11, 8, 'rgba(255,255,255,0.75)'); });
  }
  // ---- sound: a ring leaves the folds each time they clap shut
  const snd = o.sound === undefined ? 1 : o.sound;
  if (snd > 0.02) for (const tc of thrClaps(t)) {
    const age = t - tc; if (age < 0 || age > 0.55) continue;
    const r = 40 + 520 * age, a = snd * (1 - age / 0.55);
    for (const cc of [c, gctx]) for (const sd of [-1, 1]) {
      cc.beginPath(); cc.arc(X, FY, r, sd > 0 ? -0.5 : Math.PI - 0.5, sd > 0 ? 0.5 : Math.PI + 0.5);
      cc.lineWidth = cc === c ? 7 : 12; cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,232,170,${(cc === c ? 0.7 : 0.4) * a})`; cc.stroke();
    }
  }
}

// which way the air is going: three chevrons in the pipe, above the folds. k = pop, dir 1 = down
function thrChevrons(t, dir, k, y0 = 470) {
  if (k <= 0.02) return;
  const c = ctx, X = THR.x, col = dir > 0 ? '#7FE9FF' : '#FF9A3C';
  screenSpace();
  for (let i = 0; i < 3; i++) {
    const p = ((t * 2.2 + i / 3) % 1 + 1) % 1, y = y0 + (dir > 0 ? p : 1 - p) * 190, a = k * Math.sin(Math.PI * p);
    for (const cc of [c, gctx]) { cc.beginPath(); cc.moveTo(X - 46, y - dir * 20); cc.lineTo(X, y + dir * 20); cc.lineTo(X + 46, y - dir * 20); cc.lineWidth = cc === c ? 15 : 22; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = rgba(col, (cc === c ? 0.95 : 0.4) * a); cc.stroke(); }
  }
}

// the cat in a round window (screen space): where we are. k = pop
function thrInset(x, y, r, t, k, o = {}) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8);
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, r + 9, '#F4F7FF');
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#243A7A'; c.fillRect(-r, -r, 2 * r, 2 * r);
  purCat(c, 0, r * 1.28, r / 132, t, Object.assign({ eyes: 'happy', purr: 1, chin: 0.7, noTail: true, mouth: 'w' }, o));
  const py = r * 1.28 - 120 * r / 132, pk = 0.5 + 0.5 * Math.sin(t * 9);
  c.beginPath(); c.arc(0, py, 15 + 7 * pk, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = `rgba(127,233,255,${0.95 - 0.4 * pk})`; c.stroke(); circle(c, 0, py, 6, '#7FE9FF');
  c.restore();
  c.restore();
}

// a label: a dark pill with a coloured edge and a dotted leader to (tx, ty)
function thrLabel(txt, x, y, tx, ty, col, k, size = 44) {
  if (k <= 0.01) return;
  screenSpace();
  paint(() => { ctx.setLineDash([9, 9]); line(ctx, x, y, lerp(x, tx, clamp(k * 1.3)), lerp(y, ty, clamp(k * 1.3)), 4, rgba(col, 0.9)); ctx.setLineDash([]); if (k > 0.75) circle(ctx, tx, ty, 8, col); });
  pill(x, y, txt, col, k, size);
}

// the voice box seen through her fur, small: a round window on her throat (any context, any units). k = pop
function thrMini(c, x, y, r, t, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.2), gap = thrGap(t);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.arc(0, 0, r + 3.2, 0, Math.PI * 2); c.fillStyle = '#7FE9FF'; c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#2B0F2E'; c.fillRect(-r, -r, 2 * r, 2 * r);
  c.fillStyle = '#B04870'; c.fillRect(-r, -r, r * 0.4, 2 * r); c.fillRect(r * 0.6, -r, r * 0.4, 2 * r);
  for (let i = 0; i < 4; i++) { const u = (((t * 1.6 + i / 4) % 1) + 1) % 1, yy = -r + 2 * r * u; if (Math.abs(yy) < r * 0.2 && gap < 0.3) continue; c.beginPath(); c.arc(r * 0.3 * Math.sin(i * 2.4) * clamp(Math.abs(yy) / (r * 0.5)), yy, r * 0.085, 0, Math.PI * 2); c.fillStyle = 'rgba(158,232,255,0.95)'; c.fill(); }
  for (const sd of [-1, 1]) {
    const tip = sd * gap * r * 0.2;
    c.beginPath(); c.moveTo(sd * r * 0.62, -r * 0.5); c.quadraticCurveTo(sd * r * 0.3, -r * 0.3, tip + sd * r * 0.04, -r * 0.06); c.quadraticCurveTo(tip, 0, tip + sd * r * 0.05, r * 0.1); c.quadraticCurveTo(sd * r * 0.32, r * 0.3, sd * r * 0.62, r * 0.44); c.closePath();
    c.fillStyle = '#FFD9CC'; c.fill();
    c.beginPath(); c.ellipse(tip + sd * r * 0.3, 0, r * 0.15, r * 0.12, 0, 0, Math.PI * 2); c.fillStyle = '#FFF4CC'; c.fill();
  }
  c.restore();
  c.restore();
}
