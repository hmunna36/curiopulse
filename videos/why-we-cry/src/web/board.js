// The proof (why-we-cry): a photograph of his crying face, an eraser that takes the tears off it, and two dials that
// show what people then make of the same face. World coords under the shot's camera; the photo itself is drawn inside
// a clip, so it stays unlit, like a print.
'use strict';

const BD = { card: '#F7F3E8', ink: '#1A1C2C', cx: 540, cy: 706, w: 430, h: 530, win: [392, 398] };

// his head and shoulders, for a photograph (0, 0 = the middle of his head). o: {tl, tr: 0..1 the tears on his left and
// right cheek (ours), face}
function bdPortrait(c, s, t, o = {}) {
  c.save(); c.scale(s, s);
  // shoulders + neck
  c.beginPath(); c.moveTo(-150, 190); c.quadraticCurveTo(-140, 96, -58, 86); c.lineTo(58, 86); c.quadraticCurveTo(140, 96, 150, 190); c.closePath(); c.fillStyle = CRYPAL.coat; c.fill();
  ellipse(c, 0, 92, 66, 22, CRYPAL.coatDk);
  rrect(c, -17, 56, 34, 40, 10); c.fillStyle = CRYPAL.skinSh; c.fill();
  drawHead(c, { head: [0, 0], lean: 0 }, o.face || CRYFACE.sad, {}, CRYPAL, t);
  for (const [sd, k] of [[-1, o.tl === undefined ? 1 : o.tl], [1, o.tr === undefined ? 1 : o.tr]]) {
    if (k <= 0.01) continue;
    c.globalAlpha = clamp(k);
    c.fillStyle = TEAR.fill; c.beginPath(); c.ellipse(sd * 24, 12, 13.5, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(sd * 24 - 5, 11, 3.2, 1.3, 0, 0, Math.PI * 2); c.fill();
    const x0 = sd * 27;
    c.lineCap = 'round'; c.lineWidth = 8.5; c.strokeStyle = TEAR.fill; c.beginPath(); c.moveTo(x0, 14); c.quadraticCurveTo(x0 + sd * 5, 40, x0 + sd * 1, 64); c.stroke();
    c.lineWidth = 2.2; c.strokeStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x0 - 1.6, 17); c.quadraticCurveTo(x0 + sd * 5 - 1.6, 40, x0 + sd * 1 - 1.6, 60); c.stroke();
    tearDrop(c, x0 + sd * 1, 76, 5.4, 1);
    c.globalAlpha = 1;
  }
  c.restore();
}

// the photo card, at BD.cx, BD.cy. o: {k: pop 0..1, rot, tl, tr, label: 'WITH TEARS' | ..., flip 0..1 (the label swaps), shine}
function bdCard(t, o = {}) {
  const c = ctx, k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  c.save(); c.translate(o.x === undefined ? BD.cx : o.x, (o.y === undefined ? BD.cy : o.y) + 900 * (1 - E.outCubic(clamp(k)))); c.rotate((o.rot || 0) + 0.25 * (1 - E.outCubic(clamp(k))));
  c.scale(o.s || 1, o.s || 1);
  rrect(c, -BD.w / 2 + 10, -BD.h / 2 + 14, BD.w, BD.h, 12); c.fillStyle = 'rgba(0,0,10,0.4)'; c.fill();
  rrect(c, -BD.w / 2, -BD.h / 2, BD.w, BD.h, 12); c.fillStyle = BD.card; c.fill();
  const wy = -BD.h / 2 + 20;
  c.save(); c.beginPath(); c.rect(-BD.win[0] / 2, wy, BD.win[0], BD.win[1]); c.clip();
  const g = c.createLinearGradient(0, wy, 0, wy + BD.win[1]); g.addColorStop(0, '#2B4A7E'); g.addColorStop(1, '#16284E');
  c.fillStyle = g; c.fillRect(-BD.win[0] / 2, wy, BD.win[0], BD.win[1]);
  c.translate(0, wy + 196); bdPortrait(c, 1.86, t, o);
  c.restore();
  paint(() => {
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fl = o.flip || 0, y = wy + BD.win[1] + 46;
    if (fl < 0.5) { c.fillStyle = BD.ink; c.save(); c.translate(0, y); c.scale(1, 1 - 2 * fl); c.fillText('WITH TEARS', 0, 0); c.restore(); }
    else { c.fillStyle = '#C4122E'; c.save(); c.translate(0, y); c.scale(1, 2 * fl - 1); c.fillText('TEARS ERASED', 0, 0); c.restore(); }
    // a strip of tape
    c.save(); c.translate(0, -BD.h / 2 - 2); c.rotate(-0.04); c.fillStyle = 'rgba(255,224,130,0.82)'; c.fillRect(-70, -18, 140, 36); c.restore();
  });
  c.restore();
}
// a point of the portrait's face (head units) in world coords, for the eraser
function bdFacePt(hx, hy, o = {}) {
  const sc = o.s || 1, rot = o.rot || 0, lx = hx * 1.86 * sc, ly = (-BD.h / 2 + 20 + 196 + hy * 1.86) * sc, cs = Math.cos(rot), sn = Math.sin(rot);
  return [(o.x === undefined ? BD.cx : o.x) + lx * cs - ly * sn, (o.y === undefined ? BD.cy : o.y) + lx * sn + ly * cs];
}
// a rubber eraser (its rubbing end at x, y)
function bdEraser(x, y, rot, k = 1) {
  if (k <= 0.01) return;
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  rrect(c, -34, -150, 68, 150, 12); c.fillStyle = '#FF8FB0'; c.fill();
  rrect(c, -34, -150, 68, 96, 12); c.fillStyle = '#3F6FE0'; c.fill();
  paint(() => { c.fillStyle = '#FFFFFF'; c.fillRect(-34, -82, 68, 8); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-26, -140, 12, 50); });
  c.restore();
}
// crumbs of rubber falling from a spot
function bdCrumbs(x, y, t0, t, seed = 1) {
  const d = t - t0;
  if (d < 0 || d > 0.8) return;
  paint(() => {
    for (let i = 0; i < 9; i++) {
      const a = -1.2 + hash(i + seed * 7) * 2.4 - Math.PI / 2, v = 120 + 200 * hash(i * 3 + seed);
      ctx.fillStyle = `rgba(255,170,195,${clamp(1.2 - d * 1.5)})`;
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * v * d, y + Math.sin(a) * v * d + 900 * d * d, 7, 3.6, i + d * 9, 0, Math.PI * 2); ctx.fill();
    }
  });
}

// a half-round dial. v = needle 0..1 (left to right), ghost = where it stood before (a faint needle), k = pop.
// o: {title, sub, val (text under the hub), col, ticks: [labels], drop 0..1 (flashes red while it falls)}
function bdDial(x, y, r, v, k, o = {}) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6), col = o.col || '#7FE9FF';
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.arc(0, 0, r + 14, Math.PI, 0); c.lineTo(r + 14, 22); c.lineTo(-r - 14, 22); c.closePath(); c.fillStyle = '#0E1436'; c.fill();
  paint(() => {
    c.lineWidth = 5; c.strokeStyle = rgba(col, 0.9); c.beginPath(); c.arc(0, 0, r + 14, Math.PI, 0); c.lineTo(r + 14, 22); c.lineTo(-r - 14, 22); c.closePath(); c.stroke();
    // the scale: a band that runs from cool to hot, and ticks
    for (let i = 0; i < 24; i++) { const a0 = Math.PI + (i / 24) * Math.PI, a1 = Math.PI + ((i + 0.82) / 24) * Math.PI; c.lineWidth = 15; c.strokeStyle = mixHex('#3E5BB8', '#FF5A6E', i / 23); c.beginPath(); c.arc(0, 0, r - 12, a0, a1); c.stroke(); }
    const n = (o.ticks || []).length;
    c.font = `800 ${r * 0.2}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C9D4F5';
    (o.ticks || []).forEach((lab, i) => { const a = Math.PI + (i / (n - 1)) * Math.PI; c.fillText(lab, Math.cos(a) * (r - 44), Math.sin(a) * (r - 44) + 2); });
    if (o.ghost !== undefined && Math.abs(o.ghost - v) > 0.01) {   // where the needle stood with the tears on
      const ag = Math.PI + o.ghost * Math.PI;
      c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,0.3)'; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ag) * (r - 26), Math.sin(ag) * (r - 26)); c.stroke(); c.setLineDash([]);
      c.lineWidth = 7; c.strokeStyle = 'rgba(255,90,110,0.85)'; c.beginPath(); c.arc(0, 0, r - 30, Math.PI + v * Math.PI, ag); c.stroke();
    }
    const a = Math.PI + v * Math.PI;
    c.lineCap = 'round'; c.lineWidth = 9; c.strokeStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-Math.cos(a) * 10, -Math.sin(a) * 10); c.lineTo(Math.cos(a) * (r - 22), Math.sin(a) * (r - 22)); c.stroke();
    circle(c, 0, 0, 13, '#FFFFFF'); circle(c, 0, 0, 6, '#0E1436');
    c.font = `900 ${r * 0.29}px Montserrat`; c.fillStyle = col; c.fillText(o.title || '', 0, -r - 46);
    if (o.val) { c.font = `900 ${r * 0.44}px Montserrat`; c.fillStyle = o.drop > 0.05 ? mixHex('#FFFFFF', '#FF5A6E', clamp(o.drop)) : '#FFFFFF'; c.fillText(o.val, 0, 64); }
    if (o.sub) { c.font = `800 ${r * 0.2}px Montserrat`; c.fillStyle = 'rgba(200,214,255,0.9)'; c.fillText(o.sub, 0, o.val ? 112 : 58); }
  });
  c.restore();
  softDot(gctx, x, y - r * 0.4, r * 1.1, col, 0.1 * clamp(k));
}

// a comic burst with a word in it (screen space). k = pop 0..1 (it holds at 1)
function bdBurst(txt, x, y, size, k, col = '#FFD447', rot = -0.08, fill = '#FFFFFF') {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.font = `400 ${size}px Anton`;
    const w = ctx.measureText(txt).width * 0.62 + size * 0.5, h = size * 0.86;
    ctx.beginPath();
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 1 : 1.3 + 0.12 * hash(i); const px = Math.cos(a) * w * rr, py = Math.sin(a) * h * rr; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
    ctx.restore();
  });
  bigWord(txt, x, y + size * 0.04, size, fill, s, rot);
}
// a pair of eyes in the dark, looking at (lx, ly) (world, under the camera). k = they open 0..1
function peepEyes(x, y, s, lx, ly, k, t, seed = 0) {
  if (k <= 0.01) return;
  const d = Math.hypot(lx - x, ly - y) || 1, ux = (lx - x) / d, uy = (ly - y) / d;
  const bl = Math.sin(t * 1.3 + seed * 2.1) > 0.97 ? 0.12 : 1, op = E.outBack(clamp(k), 2) * bl;
  paint(() => {
    for (const sd of [-1, 1]) {
      ctx.fillStyle = '#F4F8FF'; ctx.beginPath(); ctx.ellipse(x + sd * 17 * s, y, 13 * s, 16 * s * op, 0, 0, Math.PI * 2); ctx.fill();
      if (op > 0.4) circle(ctx, x + sd * 17 * s + ux * 5.5 * s, y + uy * 6 * s * op, 6.4 * s, '#0B0B1A');
    }
  });
  softDot(gctx, x, y, 44 * s, '#DCE8FF', 0.34 * clamp(k));
}
// a targeting bracket (screen space): four corners and a ring; k = lock 0..1 (it closes in as it locks)
function tearScope(x, y, r, k, col = '#7FE9FF', t = 0) {
  screenSpace();
  paint(() => {
    const rr = r * (1.5 - 0.5 * clamp(k));
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = col;
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4 + 0.6 * (1 - clamp(k)); ctx.beginPath(); ctx.arc(x, y, rr, a - 0.42, a + 0.42); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(col.length === 7 ? col : '#7FE9FF', 0.75); ctx.beginPath(); ctx.arc(x, y, rr * 0.55, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * rr * 0.55, y + Math.sin(a) * rr * 0.55); ctx.lineTo(x + Math.cos(a) * rr * 0.8, y + Math.sin(a) * rr * 0.8); ctx.stroke(); }
  });
  softDot(gctx, x, y, r * 1.3, col.length === 7 ? col : '#7FE9FF', 0.22);
}
// a verdict pill with a tick or a cross (screen space)
function verdictPill(x, y, text, ok, k, size = 46) {
  if (k <= 0.01) return;
  const col = ok ? '#4DFFB4' : '#FF5A6E';
  pill(x, y, (ok ? '✓ ' : '') + text, col, k, size);
}
