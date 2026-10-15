// Why Do Your Ears RING After a Concert? Short: inside his ear, close up. A row of five hair cells (pink, with faces)
// standing on the floor of the snail, each with a staircase of stiff little hairs on top; the music arrives as big waves
// that slam the hairs flat; nerve fibres run from the cells down to one cord to the brain, with beads of signal on them.
// Screen space; V = {k, cx, cy} draws it all larger about a point.
//   erCells(t, o)  o: {bend (number or one per cell, 0 up .. 1 flat), mood (string or one per cell), waves [{u, k}] (a
//                  wave on its way: u 0 at the top .. 1 on the hairs), signal 0..1, label 0..1, meter 0..1 (the TO BRAIN
//                  pill), meterLvl 0..1, gone {i, k} (that cell is dead: it greys and a halo floats up), regrow {i, k}
//                  (a new cell pops up where one is missing), missing [i] (no cell there), V, hue: 'ear' | 'bird'}
'use strict';

const ERC = { xs: [190, 365, 540, 715, 890], y: 1000, R: 64, floor: 1072 };
function erCellsBg(t, o = {}) {
  screenSpace();
  const c = ctx, bird = o.hue === 'bird';
  const g = c.createRadialGradient(540, 760, 60, 540, 900, 1250);
  g.addColorStop(0, bird ? '#2E3A6A' : '#4A1A5E'); g.addColorStop(0.55, bird ? '#1A2246' : '#2A0E3C'); g.addColorStop(1, bird ? '#0A0E22' : '#12061E');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // far tissue: soft arches
  for (let i = 0; i < 5; i++) { const x = 100 + i * 220; ellipse(c, x, 1100, 240, 520, bird ? 'rgba(80,110,190,0.10)' : 'rgba(200,90,170,0.09)'); }
  // drifting specks in the liquid
  for (let i = 0; i < 30; i++) {
    const x = (hash(i * 5.1) * 1300 + t * 14 * (0.5 + hash(i))) % 1300 - 110, y = 380 + hash(i * 2.7) * 640 + 10 * Math.sin(t + i);
    softDot(gctx, x, y, 14 + 10 * hash(i * 1.3), bird ? '#8FB8FF' : '#FF86D0', 0.18);
  }
}
function erCells(t, o = {}) {
  const c = ctx, V = o.V || { k: 1, cx: 540, cy: 960 }, bird = o.hue === 'bird';
  screenSpace();
  for (const cc of [ctx, gctx]) { cc.save(); cc.translate(V.cx + (V.dx || 0), V.cy + (V.dy || 0)); cc.scale(V.k, V.k); cc.translate(-V.cx, -V.cy); }
  const cellCol = bird ? '#CFE0FF' : '#FFD3E2', floorCol = bird ? '#8FA8E0' : '#E39CC0', under = bird ? '#4A5E9E' : '#A8507C';
  // the floor of the snail, and the tissue under it
  c.beginPath(); c.moveTo(-200, ERC.floor + 6);
  for (let x = -200; x <= 1280; x += 40) c.lineTo(x, ERC.floor + 6 * Math.sin(x * 0.02 + t * 1.3));
  c.lineTo(1280, 2000); c.lineTo(-200, 2000); c.closePath(); c.fillStyle = under; c.fill();
  rrect(c, -200, ERC.floor - 14, 1480, 34, 16); c.fillStyle = floorCol; c.fill();
  // nerve fibres from each cell down to one cord
  const sig = clamp(o.signal === undefined ? 1 : o.signal), fib = (x) => [[x, ERC.y + 40], [x, ERC.floor + 90], [lerp(x, 560, 0.7), 1380], [600, 1560], [700, 2000]];
  const missing = o.missing || [];
  ERC.xs.forEach((x, i) => { if (!missing.includes(i)) { poly(c, fib(x), 14, '#C98A1E'); poly(c, fib(x), 8, '#F0B63C'); } });
  rrect(c, 560, 1500, 80, 600, 34); c.fillStyle = '#E8A93A'; c.fill();
  if (sig > 0.01) ERC.xs.forEach((x, i) => {
    if (missing.includes(i)) return;
    const P = fib(x), acc = polyLen(P), L = acc[acc.length - 1], n = sig > 0.5 ? 3 : 1;
    for (let j = 0; j < n; j++) {
      const ph = (t * (0.55 + 0.25 * sig) + j / n + i * 0.17) % 1;
      if (sig < 0.5 && ph > 0.5 + sig) continue;   // fewer beads, more gaps
      const p = polyAt(P, acc, ph * L), a = sig < 0.5 ? 0.35 + sig : 1;
      circle(c, p[0], p[1], 9, rgba('#FFF6D0', a)); softDot(gctx, p[0], p[1], 30, '#FFC24A', 0.8 * a);
    }
  });
  // the waves of music, falling on the hairs
  for (const wv of o.waves || []) {
    if (wv.k <= 0.01 || wv.u <= 0 || wv.u >= 1.25) continue;
    const y = lerp(360, ERC.y - 120, Math.min(1, wv.u)), a = wv.k * (wv.u > 1 ? 1 - (wv.u - 1) / 0.25 : 1);
    for (const [cc, w, col] of [[gctx, 60, '#FF6A3C'], [ctx, 26, '#FFB070']]) {
      cc.beginPath();
      for (let x = -120; x <= 1200; x += 20) { const yy = y + 34 * Math.sin(x * 0.012 - wv.u * 9) - 40 * Math.cos((x - 540) / 900); cc[x === -120 ? 'moveTo' : 'lineTo'](x, yy); }
      cc.lineWidth = w * (0.6 + 0.4 * a); cc.strokeStyle = rgba(col, (cc === ctx ? 0.85 : 0.75) * a); cc.lineCap = 'round'; cc.stroke();
    }
    // notes riding it
    for (let i = 0; i < 4; i++) { const x = 170 + i * 250, yy = y - 60 + 30 * Math.sin(i + wv.u * 6); erNote(c, x, yy, 1.2, rgba('#FFE0B0', 0.95 * a), -0.2 + 0.1 * i); }
  }
  // the cells: hairs first, then the body, then the face
  ERC.xs.forEach((x, i) => {
    if (missing.includes(i)) return;
    const b = Array.isArray(o.bend) ? o.bend[i] : (o.bend || 0), mood = Array.isArray(o.mood) ? o.mood[i] : (o.mood || 'calm');
    const gone = o.gone && o.gone.i === i ? clamp(o.gone.k) : 0, grow = o.regrow && o.regrow.i === i ? clamp(o.regrow.k) : 1;
    if (grow <= 0.01) return;
    const sc = E.outBack(grow, 2.2), jig = (mood === 'shout' || mood === 'panic') ? 3 * Math.sin(t * 40 + i * 2) : 0;
    const cy = ERC.y + (1 - sc) * 60 + gone * 26;
    c.save(); c.translate(x + jig, cy); c.scale(sc, sc * (1 - 0.18 * gone));
    paint(() => {
      for (let j = 0; j < 6; j++) {
        const bx = -30 + j * 12, h = 66 + j * 15, root = [bx, -ERC.R + 8];
        const lean = b * 1.45 * (1 + 0.15 * Math.sin(i * 3 + j)) + 0.04 * Math.sin(t * 3 + j + i);
        const tip = [root[0] + Math.sin(lean) * h, root[1] - Math.cos(lean) * h];
        const mid = [root[0] + Math.sin(lean * 0.5) * h * 0.55, root[1] - Math.cos(lean * 0.5) * h * 0.55];
        c.beginPath(); c.moveTo(root[0], root[1]); c.quadraticCurveTo(mid[0], mid[1], tip[0], tip[1]);
        c.lineWidth = 8; c.lineCap = 'round'; c.strokeStyle = gone > 0.3 ? '#7F8496' : (bird ? '#4E6FC4' : '#3E7C6E'); c.stroke();
        circle(c, tip[0], tip[1], 5, gone > 0.3 ? '#9AA0B4' : (bird ? '#9FC0FF' : '#7FE0C8'));
      }
    });
    actor(() => { ellipse(c, 0, 0, ERC.R, ERC.R * 1.02, gone > 0.3 ? mixH(cellCol, '#9AA0B4', gone) : cellCol); });
    paint(() => erCellFace(c, mood, b, t, i, gone));
    c.restore();
    if (gone > 0.05) {   // a little halo floats up from it
      const hy = cy - ERC.R - 40 - 90 * gone;
      c.save(); c.translate(x, hy); c.scale(1, 0.35);
      c.beginPath(); c.arc(0, 0, 34, 0, 7); c.lineWidth = 9; c.strokeStyle = rgba('#FFE27A', 0.95 * Math.min(1, gone * 3)); c.stroke(); c.restore();
      gctx.save(); gctx.translate(x, hy); gctx.scale(1, 0.35); gctx.beginPath(); gctx.arc(0, 0, 34, 0, 7); gctx.lineWidth = 18; gctx.strokeStyle = rgba('#FFD447', 0.7 * Math.min(1, gone * 3)); gctx.stroke(); gctx.restore();
    }
  });
  ctx.restore(); gctx.restore();
  // labels (screen space, outside the view's scale)
  if ((o.label || 0) > 0.01) erTag('HAIR CELLS', 540, 560, o.label, '#FF86A6', [540, 812 + (V.k - 1) * 0]);
  if ((o.meter || 0) > 0.01) erMeter(540, 560, o.meter, o.meterLvl === undefined ? 1 : o.meterLvl, t);
}
function erCellFace(c, mood, bend, t, i, gone) {
  const lx = clamp(bend, -1, 1) * 3;
  if (gone > 0.4) mood = 'dead';
  for (const ex of [-20, 20]) {
    if (mood === 'dazed') {   // a spiral in each eye
      ellipse(c, ex, -8, 14, 15, '#FFFFFF');
      c.beginPath(); for (let k = 0; k <= 26; k++) { const a = k * 0.5 + t * 8 * (ex < 0 ? 1 : -1), r = 1 + k * 0.45; c[k ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * r, -8 + Math.sin(a) * r); }
      c.lineWidth = 2.6; c.strokeStyle = '#231028'; c.stroke(); continue;
    }
    if (mood === 'dead') { line(c, ex - 8, -16, ex + 8, 0, 4.5, '#3A1530'); line(c, ex + 8, -16, ex - 8, 0, 4.5, '#3A1530'); continue; }
    if (mood === 'squash' || mood === 'happy') {
      c.beginPath(); c.moveTo(ex - 10, -6); c.quadraticCurveTo(ex, mood === 'happy' ? -18 : -2, ex + 10, -6); c.lineWidth = 4.5; c.lineCap = 'round'; c.strokeStyle = '#3A1530'; c.stroke(); continue;
    }
    const ry = mood === 'panic' ? 17 : mood === 'shout' || mood === 'alert' ? 15 : mood === 'sad' ? 11 : 13;
    ellipse(c, ex, -8, 12, ry, '#FFFFFF'); circle(c, ex + lx + (mood === 'look' ? (i < 2 ? 6 : -6) : 0), -6, mood === 'panic' ? 4.5 : 6, '#1A0E24');
    if (mood === 'sad') line(c, ex - 12, -26 + (ex < 0 ? -3 : 3) * -1, ex + 12, -26 + (ex < 0 ? 3 : -3) * -1, 4, '#7E2748');
  }
  if (mood === 'shout' || mood === 'panic') { ellipse(c, 0, 26, 15, mood === 'panic' ? 14 : 18, '#5A1522'); ellipse(c, 0, 33, 9, 5, '#E0616C'); }
  else if (mood === 'dead') { c.beginPath(); c.moveTo(-14, 26); c.quadraticCurveTo(0, 20, 14, 26); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); ellipse(c, 6, 32, 6, 8, '#E0616C'); }
  else if (mood === 'dazed') { c.beginPath(); c.moveTo(-16, 26); c.bezierCurveTo(-8, 18, -4, 34, 0, 26); c.bezierCurveTo(4, 18, 8, 34, 16, 26); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); }
  else if (mood === 'happy') { c.beginPath(); c.moveTo(-16, 20); c.quadraticCurveTo(0, 40, 16, 20); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
  else if (mood === 'sad' || mood === 'squash') { c.beginPath(); c.moveTo(-12, 30); c.quadraticCurveTo(0, 20, 12, 30); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); }
  else if (mood === 'alert' || mood === 'look') ellipse(c, 0, 26, 7, 8, '#5A1522');
  else { c.beginPath(); c.moveTo(-10, 22); c.quadraticCurveTo(0, 29, 10, 22); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); }
}
// a music note (screen)
function erNote(c, x, y, s, col, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  ellipse(c, 0, 0, 15, 11, col, -0.4); line(c, 12, -4, 12, -52, 5, col); c.beginPath(); c.moveTo(12, -52); c.quadraticCurveTo(30, -44, 28, -26); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  c.restore();
}
// a label pill with a thin leader to a point (screen space); k pops it
function erTag(txt, x, y, k, col, to) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2), c = ctx;
  if (to) thinLeader([x, y + 34], to, clamp(k * 1.4 - 0.2), col);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.font = '900 46px Montserrat'; const w = c.measureText(txt).width + 56;
  rrect(c, -w / 2, -38, w, 76, 38); c.fillStyle = '#0E0B1E'; c.fill(); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 3);
  c.restore();
  softDot(gctx, x, y, 140, col, 0.25 * k);
}
// the TO YOUR BRAIN pill: five bars that drop as the signal thins (screen)
function erMeter(x, y, k, lvl, t) {
  const s = 1.45 * E.outBack(clamp(k), 2), c = ctx;
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -200, -42, 400, 84, 42); c.fillStyle = '#0E0B1E'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#F0B63C'; c.stroke();
  c.font = '900 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#FFE0A0'; c.fillText('TO BRAIN', -172, 3);
  for (let i = 0; i < 5; i++) { const on = lvl * 5 > i + 0.02; rrect(c, 34 + i * 30, 18 - (i + 1) * 9, 20, (i + 1) * 9 + 6, 4); c.fillStyle = on ? (lvl < 0.35 ? '#FF5A6E' : '#4DFFB4') : '#2A2440'; c.fill(); }
  c.restore();
}
