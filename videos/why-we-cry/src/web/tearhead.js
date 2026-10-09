// Inside his head, from the front (why-we-cry): the head goes see-through where he sits, and the plumbing of a tear
// shows. Drawn in the rig's own head units (hu): the middle of the head is 0, 0, it is 64 wide and 70 tall each way,
// the eyes are at x = +-24, y = -2, the nose at y = 16, the mouth at y = 40. So it can be laid exactly over his head in
// the scene (K = px per hu = his scale times the camera's zoom) and the camera can carry on into it.
//   the feeling (a heart deep in the brain)  ->  an alarm bell  ->  a signal down a nerve to each side  ->
//   a tank with a tap above the outer corner of each eye (the tear gland)  ->  water over the eye  ->
//   a plughole in the inner corner (the drain)  ->  a pipe down into the nose  ->  drips
'use strict';

const TH = {
  glass: '#101C44', glassHi: '#1B2C63', line: '#7FE9FF', hair: '#182656', brain: '#E98BA8', brainSh: '#B85C7E', core: '#FF3F74',
  nerve: '#FFB03A', nerveDim: '#5E5340', tank: '#2F62D8', tankHi: '#6FA0FF', wheel: '#FF5A6E', water: '#8FD8FF', waterDeep: '#3FA0F0',
  bell: '#FFD447', bellSh: '#C89A1E', pipe: '#9FB6E8', skin: '#F2B892',
  GL: [44, -19], CORE: [0, -33], BELL: [0, -52], DRAIN: [9.6, 4.2], NOSTRIL: [4.4, 20.2],
};
// the nerve from the feeling to the gland on side sd (hu), as a dense polyline, and the pipe from the drain to the nose
function thNerve(sd) {
  const P = [[0, -30], [sd * 9, -26], [sd * 20, -27.5], [sd * 31, -30], [sd * 40, -27], [sd * 44, -24.5]], out = [];
  for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 8; k++) { const u = k / 8; out.push([lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)]); }
  out.push(P[P.length - 1]);
  return out;
}
function thDuct(sd) {
  const P = [[sd * 9.6, 4.2], [sd * 9.9, 8], [sd * 9.2, 12], [sd * 7.4, 15.5], [sd * 5.2, 17.8], [sd * 4.4, 19.2]], out = [];
  for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 6; k++) { const u = k / 6; out.push([lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)]); }
  out.push(P[P.length - 1]);
  return out;
}
// a point given in head units -> screen px, for a head whose middle is at (cx, cy) with K px per unit
const thPt = (V, x, y) => [V.cx + x * V.K, V.cy + y * V.K];

// V: {cx, cy, K, a (0..1: how far the head has gone see-through)}
// o: {core 0..1 (the feeling swells), beat, ring 0..1 (the bell), sig 0..1 (the signal along the nerves), open 0..1 (the
//  taps), flow 0..1 (water out of the spouts), fill 0..1 (water standing in the eyes), spill 0..1 (over the lids),
//  swirl 0..1 (the plugholes drink), duct 0..1 (water down the pipes), drip 0..1 (out of the nose), look: [x, y], blink,
//  lip (trembling mouth), pulseDrain 0..1}
function thDraw(V, t, o = {}) {
  const a = V.a === undefined ? 1 : V.a;
  if (a <= 0.01) return;
  const set = (c) => { const sc = c === gctx ? 0.5 : 1; c.setTransform(sc * V.K, 0, 0, sc * V.K, sc * V.cx, sc * V.cy); };
  const c = ctx;
  c.save(); set(c); c.globalAlpha = a;
  gctx.save(); set(gctx); gctx.globalAlpha = a;
  // ---- the glass head: neck, ears, skull, the cap of his hair
  rrect(c, -17, 58, 34, 40, 8); c.fillStyle = TH.glass; c.fill();
  for (const sd of [-1, 1]) ellipse(c, sd * 62, 2, 13, 18, TH.glassHi);
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.fillStyle = TH.glass; c.fill();
  paint(() => {
    c.lineWidth = 1.1; c.strokeStyle = rgba(TH.line, 0.85); c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2); c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 62, 2, 13, 18, 0, sd > 0 ? -1.2 : Math.PI - 1.2, sd > 0 ? 1.2 : Math.PI + 1.2); c.stroke(); }
    // his hair, as a faint cap, so it is still him
    c.beginPath(); c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
    c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
    c.fillStyle = rgba(TH.hair, 0.55); c.fill(); c.lineWidth = 0.7; c.strokeStyle = rgba(TH.line, 0.35); c.stroke();
  });
  // ---- the brain
  const bx = 0, by = -41;
  c.fillStyle = TH.brain;
  c.beginPath(); c.ellipse(bx, by, 45, 21, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, x = -40 + 80 * u; c.beginPath(); c.arc(x, by - 15 - 7 * Math.sin(Math.PI * u), 9.5, 0, Math.PI * 2); c.fill(); }
  paint(() => {
    c.lineCap = 'round'; c.lineWidth = 1.5; c.strokeStyle = rgba(TH.brainSh, 0.8);
    c.beginPath(); c.moveTo(0, by - 25); c.lineTo(0, by + 4); c.stroke();
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
      const x = sd * (10 + i * 9.5), y = by - 12 + (i % 2) * 6;
      c.beginPath(); c.moveTo(x - 4, y - 6); c.bezierCurveTo(x + 4, y - 8, x - 4, y + 2, x + 4, y + 6 + 2 * (i % 3)); c.stroke();
    }
  });
  // ---- the nerves, the signal on them
  const sig = o.sig || 0;
  for (const sd of [-1, 1]) {
    const N = thNerve(sd), acc = polyLen(N), L = acc[acc.length - 1];
    paint(() => {
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.lineWidth = 2.3; c.strokeStyle = TH.nerveDim; c.beginPath(); N.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
      if (sig > 0.01) {
        c.lineWidth = 2.3; c.strokeStyle = TH.nerve; c.beginPath();
        for (let s = 0; s <= L * clamp(sig); s += 1.2) { const p = polyAt(N, acc, s); if (s === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
        c.stroke();
      }
    });
    if (sig > 0.01 && sig < 1.6) for (let i = 0; i < 3; i++) {
      const u = sig - i * 0.16;
      if (u <= 0 || u >= 1) continue;
      const p = polyAt(N, acc, L * u);
      paint(() => circle(c, p[0], p[1], 2.5, '#FFF2C8'));
      softDot(gctx, p[0], p[1], 9, TH.nerve, 0.9);
    }
  }
  // ---- the feeling: a heart in the middle of the brain; it beats
  const core = o.core === undefined ? 0.5 : o.core, beat = 1 + 0.16 * (o.beat === undefined ? Math.pow(Math.max(0, Math.sin(t * 7.2)), 6) : o.beat);
  const hs = (0.55 + 0.75 * core) * beat * 0.36;
  const heart = (cc) => {
    cc.beginPath(); cc.moveTo(TH.CORE[0], TH.CORE[1] + 26 * hs);
    cc.bezierCurveTo(TH.CORE[0] - 44 * hs, TH.CORE[1] - 2 * hs, TH.CORE[0] - 30 * hs, TH.CORE[1] - 38 * hs, TH.CORE[0], TH.CORE[1] - 18 * hs);
    cc.bezierCurveTo(TH.CORE[0] + 30 * hs, TH.CORE[1] - 38 * hs, TH.CORE[0] + 44 * hs, TH.CORE[1] - 2 * hs, TH.CORE[0], TH.CORE[1] + 26 * hs);
  };
  paint(() => { heart(c); c.fillStyle = mixHex('#B8405E', TH.core, core); c.fill(); c.lineWidth = 0.8; c.strokeStyle = '#7A1030'; c.stroke(); circle(c, TH.CORE[0] - 5 * hs * 2.2, TH.CORE[1] - 7 * hs * 2.2, 1.6 * hs * 2.6, 'rgba(255,220,230,0.8)'); });
  softDot(gctx, TH.CORE[0], TH.CORE[1], 9 + 11 * core, TH.core, (0.2 + 0.4 * core) * (0.75 + 0.25 * beat));
  // ---- the alarm bell on top of it
  const ring = o.ring || 0, bk = o.bellK === undefined ? 1 : o.bellK;
  if (bk > 0.01) {
    c.save(); c.translate(TH.BELL[0], TH.BELL[1]); c.rotate(0.3 * ring * Math.sin(t * 46)); c.scale(bk, bk);
    c.beginPath(); c.moveTo(-7.4, 4); c.quadraticCurveTo(-6.6, -8.4, 0, -8.6); c.quadraticCurveTo(6.6, -8.4, 7.4, 4); c.closePath(); c.fillStyle = TH.bell; c.fill();
    rrect(c, -8.6, 3.2, 17.2, 2.6, 1.3); c.fillStyle = TH.bellSh; c.fill();
    paint(() => { circle(c, 0, -9.3, 1.5, TH.bellSh); circle(c, 2.6 * Math.sin(t * 46) * ring, 7, 1.9, '#7A5A10'); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-3, -3, 1.3, 3.4, 0.3, 0, Math.PI * 2); c.fill(); });
    c.restore();
    if (ring > 0.02) {
      paint(() => { c.lineCap = 'round'; c.lineWidth = 1.2; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const r = 12 + i * 4.2 + 2.5 * ((t * 5) % 1); c.strokeStyle = rgba(TH.bell, 0.85 * ring * (1 - i * 0.28)); c.beginPath(); c.arc(TH.BELL[0], TH.BELL[1] - 1, r, sd > 0 ? -0.75 : Math.PI - 0.75 + 0.0, sd > 0 ? 0.15 : Math.PI + 0.15 - 0.0 + 0.6, false); c.stroke(); } });
      softDot(gctx, TH.BELL[0], TH.BELL[1], 20, '#FF5A4A', 0.55 * ring * (0.5 + 0.5 * Math.sin(t * 23)));
    }
  }
  // ---- his face: brows, eyes, nose, mouth (what the water runs over)
  const lk = o.look || [0, 0.2], fill = o.fill || 0, flow = o.flow || 0, spill = o.spill || 0;
  paint(() => {
    for (const sd of [-1, 1]) {
      const ex = sd * 24, ey = -2;
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, ey, 14.4, 17, 0, 0, Math.PI * 2); c.fill();
      circle(c, ex + lk[0] * 5, ey + lk[1] * 6, 8.6, '#15132A'); circle(c, ex + lk[0] * 5 - 2.6, ey + lk[1] * 6 - 3.2, 3, '#FFFFFF'); circle(c, ex + lk[0] * 5 + 3, ey + lk[1] * 6 + 2.6, 1.4, 'rgba(255,255,255,0.8)');
      if (fill > 0.01 || flow > 0.01) {   // water in the eye: it runs down from the top outer corner and stands at the lid
        c.save(); c.beginPath(); c.ellipse(ex, ey, 14.4, 17, 0, 0, Math.PI * 2); c.clip();
        if (flow > 0.01) { c.fillStyle = rgba(TH.water, 0.42 * flow); c.beginPath(); c.moveTo(ex + sd * 15, ey - 14); c.quadraticCurveTo(ex + sd * 2, ey - 12, ex - sd * 2, ey + 18); c.lineTo(ex + sd * 16, ey + 18); c.closePath(); c.fill(); }
        const lvl = ey + 17 - 34 * 0.62 * fill;
        c.fillStyle = rgba(TH.water, 0.72); c.beginPath(); c.moveTo(ex - 16, 20);
        for (let i = 0; i <= 8; i++) c.lineTo(ex - 16 + i * 4, lvl + 0.9 * Math.sin(t * 9 + i * 1.3 + sd));
        c.lineTo(ex + 16, 20); c.closePath(); c.fill();
        c.lineWidth = 0.9; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.beginPath();
        for (let i = 0; i <= 8; i++) { const x = ex - 16 + i * 4, y = lvl + 0.9 * Math.sin(t * 9 + i * 1.3 + sd); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
        c.stroke(); c.restore();
      }
      c.lineWidth = 1.6; c.strokeStyle = '#3A2418'; c.beginPath(); c.ellipse(ex, ey, 14.4, 17, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();   // the lid
      c.lineCap = 'round'; c.lineWidth = 4.4; c.strokeStyle = '#2A1B14'; c.beginPath(); c.moveTo(sd * 11, -25.5); c.lineTo(sd * 37, -19); c.stroke();   // brow, up in the middle
    }
    // nose and the trembling mouth
    c.fillStyle = rgba(TH.skin, 0.5); c.beginPath(); c.ellipse(0, 16.4, 8.6, 6.2, 0, 0, Math.PI * 2); c.fill();
    c.lineWidth = 0.8; c.strokeStyle = rgba(TH.line, 0.5); c.stroke();
    for (const sd of [-1, 1]) circle(c, sd * TH.NOSTRIL[0], TH.NOSTRIL[1], 1.9, '#0A1230');
    const lip = o.lip === undefined ? 1 : o.lip;
    c.lineCap = 'round'; c.lineWidth = 3; c.strokeStyle = '#B84A62'; c.beginPath(); c.moveTo(-17, 40);
    c.bezierCurveTo(-9, 40 - 7 * lip + 1.5 * Math.sin(t * 17), -4, 40 + 7 * lip, 2, 40); c.bezierCurveTo(8, 40 - 7 * lip - 1.5 * Math.sin(t * 17), 14, 40 + 7 * lip, 19, 40); c.stroke();
  });
  // ---- the glands: a tank with a tap above the outer corner of each eye
  const open = o.open || 0, gk = o.glandK === undefined ? 1 : o.glandK;
  if (gk > 0.01) for (const sd of [-1, 1]) {
    const gx = sd * TH.GL[0], gy = TH.GL[1];
    // the spout, down and in to the top of the eye
    paint(() => { c.lineCap = 'round'; c.lineWidth = 3.6; c.strokeStyle = TH.pipe; c.beginPath(); c.moveTo(gx - sd * 4, gy + 4); c.lineTo(gx - sd * 9.5, gy + 7.5); c.lineTo(gx - sd * 9.5, gy + 10.5); c.stroke(); });
    rrect(c, gx - 8.4, gy - 6, 16.8, 11.4, 3.2); c.fillStyle = TH.tank; c.fill();
    paint(() => {
      rrect(c, gx - 6, gy - 3.8, 12, 5.2, 1.8); c.fillStyle = TH.waterDeep; c.fill();
      c.fillStyle = TH.water; c.fillRect(gx - 6, gy - 3.8 + 5.2 * 0.25 * open, 12, 1);
      // the hand-wheel on top
      c.save(); c.translate(gx, gy - 8.2); c.rotate(sd * open * 5.2);
      c.lineWidth = 1.5; c.strokeStyle = TH.wheel; c.beginPath(); c.arc(0, 0, 3.7, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(-3.7 * Math.cos(i * 1.5708), -3.7 * Math.sin(i * 1.5708)); c.lineTo(3.7 * Math.cos(i * 1.5708), 3.7 * Math.sin(i * 1.5708)); c.stroke(); }
      circle(c, 0, 0, 1.2, '#FFFFFF'); c.restore();
    });
    if (flow > 0.01) {   // the water falls from the spout
      paint(() => {
        const x = gx - sd * 9.5, y0 = gy + 11;
        c.lineCap = 'round'; c.lineWidth = 3.2 * flow; c.strokeStyle = rgba(TH.water, 0.95); c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x - sd * 1.5, y0 + 4, x - sd * 4, y0 + 7.5); c.stroke();
        c.lineWidth = 1 * flow; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.setLineDash([1.6, 2.2]); c.lineDashOffset = -t * 26; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x - sd * 1.5, y0 + 4, x - sd * 4, y0 + 7.5); c.stroke(); c.setLineDash([]);
      });
      softDot(gctx, gx - sd * 11, gy + 15, 7, TH.water, 0.4 * flow);
    }
  }
  // ---- over the lid and down the cheek
  if (spill > 0.01) paint(() => {
    for (const sd of [-1, 1]) {
      const x0 = sd * 27, L = 40 * spill;
      c.lineCap = 'round'; c.lineWidth = 5.2; c.strokeStyle = rgba(TH.water, 0.9); c.beginPath(); c.moveTo(x0, 14); c.quadraticCurveTo(x0 + sd * 4, 14 + L * 0.5, x0 + sd * 1, 14 + L); c.stroke();
      c.lineWidth = 1.3; c.strokeStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.moveTo(x0 - 1.2, 16); c.quadraticCurveTo(x0 + sd * 4 - 1.2, 14 + L * 0.5, x0 + sd * 1 - 1.2, 14 + L * 0.9); c.stroke();
    }
  });
  // ---- the drains: a plughole in the inner corner of each eye, and its pipe down into the nose
  const swirl = o.swirl || 0, duct = o.duct || 0, dk = o.drainK === undefined ? 1 : o.drainK, pd = o.pulseDrain || 0;
  if (dk > 0.01) for (const sd of [-1, 1]) {
    const D = [sd * TH.DRAIN[0], TH.DRAIN[1]], P = thDuct(sd), acc = polyLen(P), L = acc[acc.length - 1];
    paint(() => {
      c.globalAlpha = a * dk;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.lineWidth = 3.4; c.strokeStyle = rgba(TH.pipe, 0.9); c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
      c.lineWidth = 2.0; c.strokeStyle = '#0C1638'; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
      if (duct > 0.01) {   // water marching down it
        c.lineWidth = 1.7; c.strokeStyle = TH.water; c.setLineDash([1.5, 1.3]); c.lineDashOffset = -t * 9; c.beginPath();
        for (let s = 0; s <= L * clamp(duct); s += 0.6) { const p = polyAt(P, acc, s); if (s === 0) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
        c.stroke(); c.setLineDash([]);
      }
      // the plughole: a ring, a dark hole, the water going round it
      circle(c, D[0], D[1], 3.1 + 0.9 * pd, TH.pipe); circle(c, D[0], D[1], 1.9, '#060A1E');
      if (swirl > 0.01) { c.lineWidth = 0.9; for (let i = 0; i < 3; i++) { const a0 = -t * 9 * sd + i * 2.094; c.strokeStyle = rgba(TH.water, 0.95 * swirl); c.beginPath(); c.arc(D[0], D[1], 4.6 + 1.3 * i * 0.4, a0, a0 + 1.5); c.stroke(); } }
      c.globalAlpha = a;
    });
    if (pd > 0.02) softDot(gctx, D[0], D[1], 9, TH.line, 0.7 * pd);
  }
  // ---- and out of the nose
  const drip = o.drip || 0;
  if (drip > 0.01) paint(() => {
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const p = ((t * 1.5 + i / 3 + (sd > 0 ? 0.2 : 0)) % 1 + 1) % 1;
      if (i / 3 > drip * 1.2) continue;
      tearDrop(c, sd * TH.NOSTRIL[0] + sd * 0.5 * p, TH.NOSTRIL[1] + 2.4 + 15 * p * p, 1.25 + 0.7 * Math.min(1, p * 5), drip * (1 - p * 0.6));
    }
  });
  gctx.restore(); c.restore();
}

// a pill label with a dotted leader to a point (screen px). k = pop 0..1
function thLabel(text, x, y, tx, ty, col, k, size = 44) {
  if (k <= 0.01) return;
  screenSpace();
  paint(() => {
    ctx.setLineDash([9, 9]); line(ctx, x, y, lerp(x, tx, clamp(k * 1.3)), lerp(y, ty, clamp(k * 1.3)), 4, rgba(col, 0.9)); ctx.setLineDash([]);
    if (k > 0.75) circle(ctx, tx, ty, 8, col);
  });
  pill(x, y, text, col, k, size);
}
