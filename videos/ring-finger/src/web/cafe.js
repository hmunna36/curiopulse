// cafe.js — a café at night, from across his table: the room behind him painted once and out of focus (a counter with
// an espresso machine, shelves of cups, a chalkboard menu, a rainy window with the street's lights, pendant lamps),
// the round wooden table in 3D (hand3d.js's camera), a cup of coffee on its saucer, and the hero leaning over the
// table in a green jumper with the sleeves pushed up (his arms are drawn by the scene: his right forearm and hand by
// hand3d.js).
'use strict';

const CAFEPAL = Object.assign({}, PAL, {
  coat: '#3E8E5E', coatSh: '#2C6B45', coatHi: '#62B07E', coatDk: '#245A3A',
  strap: '#3E8E5E', strapSh: '#2C6B45',
});
let CAFE_BG = null;
const CAFE_W = 1400, CAFE_H = 1300;   // the painted room (screen px at its rest position)

function initCafe() {
  const c0 = mkCanvas(CAFE_W, CAFE_H), x = c0.getContext('2d'), rng = mulberry32(41);
  // the back wall: warm dark wood below, deep teal tiles above
  let g = x.createLinearGradient(0, 0, 0, CAFE_H);
  g.addColorStop(0, '#163236'); g.addColorStop(0.55, '#1C3E40'); g.addColorStop(0.56, '#3A2418'); g.addColorStop(1, '#24150E');
  x.fillStyle = g; x.fillRect(0, 0, CAFE_W, CAFE_H);
  for (let yy = 40; yy < 700; yy += 46) for (let xx = (yy / 46) % 2 ? 0 : 30; xx < CAFE_W; xx += 60) {   // tiles
    x.fillStyle = rng() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)'; x.fillRect(xx, yy, 56, 42);
  }
  for (let xx = 0; xx < CAFE_W; xx += 90) { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(xx, 730, 4, CAFE_H); }   // panels
  // the rainy window on the right: night street, bokeh of car lights and signs, rain streaks
  const wx = 860, wy = 120, ww = 460, wh = 640;
  g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#0B1630'); g.addColorStop(1, '#1A2850');
  x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 40; i++) {
    const cx = wx + rng() * ww, cy = wy + wh * (0.35 + rng() * 0.6), r = 14 + rng() * 34;
    const col = ['#FFB45A', '#FF6B5A', '#7FC8FF', '#FFE08A', '#C8A8FF'][Math.floor(rng() * 5)];
    const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r); gg.addColorStop(0, rgba(col, 0.55)); gg.addColorStop(1, rgba(col, 0));
    x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  }
  x.strokeStyle = 'rgba(190,220,255,0.18)'; x.lineWidth = 2;
  for (let i = 0; i < 70; i++) { const sx = wx + rng() * ww, sy = wy + rng() * wh; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx - 4, sy + 30 + rng() * 40); x.stroke(); }
  x.fillStyle = '#2A1A10'; x.fillRect(wx - 22, wy - 22, ww + 44, 22); x.fillRect(wx - 22, wy + wh, ww + 44, 26); x.fillRect(wx - 22, wy, 22, wh); x.fillRect(wx + ww / 2 - 8, wy, 16, wh);
  // the counter on the left with an espresso machine, cups on a shelf, a chalkboard menu
  x.fillStyle = '#2E1C12'; x.fillRect(0, 780, 560, 520); x.fillStyle = '#4A2E1C'; x.fillRect(0, 770, 580, 26);
  rrect(x, 150, 600, 250, 180, 18); x.fillStyle = '#B8BCC8'; x.fill();
  rrect(x, 170, 620, 210, 60, 10); x.fillStyle = '#7A808E'; x.fill();
  for (const px of [205, 300]) { x.fillStyle = '#3A3C44'; x.fillRect(px, 690, 30, 50); }
  x.fillStyle = '#4A2E1C'; x.fillRect(40, 420, 520, 16);
  for (let i = 0; i < 9; i++) { rrect(x, 60 + i * 54, 378, 40, 42, 8); x.fillStyle = ['#F4EEE4', '#E07A5F', '#81B29A', '#F2CC8F'][i % 4]; x.fill(); }
  rrect(x, 60, 120, 420, 250, 12); x.fillStyle = '#1D2420'; x.fill(); x.lineWidth = 12; x.strokeStyle = '#6B4A2E'; x.stroke();
  x.fillStyle = 'rgba(240,240,230,0.55)'; x.font = '700 40px Montserrat'; x.fillText('MENU', 210, 180);
  for (let i = 0; i < 4; i++) { x.fillRect(100, 215 + i * 34, 200 + rng() * 120, 8); x.fillRect(400, 215 + i * 34, 50, 8); }
  // a plant and far tables
  for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(20,12,8,0.6)'; x.beginPath(); x.ellipse(620 + i * 170, 1000, 120, 26, 0, 0, 7); x.fill(); }
  x.fillStyle = '#2F5A3A'; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(1300 + Math.cos(i) * 40, 820 - i * 14, 26, 70, -0.6 + i * 0.12, 0, 7); x.fill(); }
  // soften: it is far behind him
  const c1 = mkCanvas(CAFE_W, CAFE_H), y = c1.getContext('2d');
  y.filter = 'blur(9px)'; y.drawImage(c0, 0, 0); y.filter = 'none';
  CAFE_BG = c1;
}
// the room behind him; shift = how far the camera has risen (0 at the table, 1 looking down at the hand): the room
// slides down and darkens. dim 0..1 darkens it further (the inside shots)
const CAFE_LAMPS = [[170, 250, '#FFB45A'], [930, 230, '#FFC27A']];
function cafeRoom(shift = 0, dim = 0, t = 0) {
  screenSpace();
  const ox = -160 + 30 * shift, oy = -40 + 900 * shift;
  ctx.drawImage(CAFE_BG, ox, oy);
  if (oy > 0) { ctx.fillStyle = '#163236'; ctx.fillRect(0, 0, W, oy + 2); }
  // pendant lamps: a shade, a warm bulb in the glow layer
  for (const [lx, ly, col] of CAFE_LAMPS) {
    const X = lx + ox + 160, Y2 = ly + oy + 40;
    line(ctx, X, Y2 - 400, X, Y2 - 40, 3, '#1A1210');
    ctx.fillStyle = '#2A1C14'; ctx.beginPath(); ctx.moveTo(X - 70, Y2); ctx.lineTo(X - 30, Y2 - 52); ctx.lineTo(X + 30, Y2 - 52); ctx.lineTo(X + 70, Y2); ctx.closePath(); ctx.fill();
    ellipse(ctx, X, Y2 + 4, 26, 14, '#FFE3B0');
    softDot(gctx, X / 1, Y2 + 10, 150, col, 0.55 * (1 - dim));
    softDot(gctx, X, Y2 + 6, 40, '#FFF3D6', 0.9 * (1 - dim));
  }
  const d = clamp(0.12 + 0.55 * dim);
  ctx.fillStyle = `rgba(4,6,14,${d})`; ctx.fillRect(0, 0, W, H);
}
// the table top in 3D: a wooden plank top from just behind his wrist (z = -14, its far edge, where he sits) toward us
function cafeTable(pr) {
  const n = 24, top = [];
  for (let i = 0; i <= n; i++) top.push(pr([-46 + (92 * i) / n, 0, -14]));
  for (let i = 0; i <= n; i++) top.push(pr([46 - (92 * i) / n, 0, 40]));
  const ys = top.map((q) => q[1]);
  const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
  g.addColorStop(0, '#6A3F26'); g.addColorStop(0.5, '#87522F'); g.addColorStop(1, '#93603A');
  ctx.fillStyle = g; ctx.beginPath(); top.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.closePath(); ctx.fill();
  paint(() => {   // planks and grain, and the far edge's lit lip
    ctx.save(); ctx.beginPath(); top.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.closePath(); ctx.clip();
    for (let j = 0; j < 9; j++) {   // plank seams run toward us
      const x = -42 + j * 11, a = pr([x, 0, -14]), b = pr([x, 0, 40]);
      line(ctx, a[0], a[1], b[0], b[1], Math.max(2, a[2] * 0.08), 'rgba(40,18,8,0.45)');
    }
    for (let j = 0; j < 30; j++) {
      const x = -44 + j * 3.1 + 0.7 * Math.sin(j * 1.7), row = [];
      for (let i = 0; i <= 18; i++) { const z = -14 + i * 3; row.push(pr([x + 0.35 * Math.sin(i * 0.8 + j), 0, z])); }
      poly(ctx, row.map((q) => [q[0], q[1]]), 1.6, 'rgba(60,30,14,0.28)');
    }
    const a = pr([-46, 0, -14]), b = pr([46, 0, -14]);
    line(ctx, a[0], a[1], b[0], b[1], 5, 'rgba(255,200,150,0.35)');
    ctx.restore();
  });
}
// a cup of coffee on its saucer at (x, z) on the table
function cafeCup(pr, x0, z0, t) {
  const ring = (y, r, n = 40) => { const a = []; for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 2; a.push(pr([x0 + Math.cos(an) * r, y, z0 + Math.sin(an) * r])); } return a; };
  const fillP = (P, col) => { ctx.fillStyle = col; ctx.beginPath(); P.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.closePath(); ctx.fill(); };
  paint(() => fillP(ring(0.02, 8.2).map((q) => [q[0] + 10, q[1] + 4]), 'rgba(30,12,6,0.3)'));
  fillP(ring(0.4, 7.6), '#E9E4DA'); fillP(ring(0.7, 6.0), '#F6F2EA');
  // the cup: a tapered body between two rings
  const b = ring(0.8, 3.6), tp = ring(7.2, 4.6), L = b.reduce((m, q) => q[0] < m[0] ? q : m), R = b.reduce((m, q) => q[0] > m[0] ? q : m);
  const L2 = tp.reduce((m, q) => q[0] < m[0] ? q : m), R2 = tp.reduce((m, q) => q[0] > m[0] ? q : m);
  // handle on the right
  const h0 = pr([x0 + 4.4, 5.6, z0 + 0.4]), h1 = pr([x0 + 6.6, 4.0, z0 + 0.4]), h2 = pr([x0 + 4.0, 2.4, z0 + 0.4]);
  ctx.beginPath(); ctx.moveTo(h0[0], h0[1]); ctx.quadraticCurveTo(h1[0] + 10, h1[1], h2[0], h2[1]); ctx.lineWidth = h0[2] * 1.1; ctx.strokeStyle = '#F4EEE4'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.fillStyle = '#F4EEE4';
  ctx.beginPath(); ctx.moveTo(L2[0], L2[1]); ctx.lineTo(L[0], L[1]);
  b.filter((q) => q[1] >= (L[1] + R[1]) / 2 - 1).sort((p, q) => p[0] - q[0]).forEach((q) => ctx.lineTo(q[0], q[1]));
  ctx.lineTo(R[0], R[1]); ctx.lineTo(R2[0], R2[1]); ctx.closePath(); ctx.fill();
  fillP(tp, '#FFFFFF'); fillP(ring(6.9, 4.1), '#5A3218');
  paint(() => { const c2 = pr([x0 - 1, 6.95, z0 - 1]); ellipse(ctx, c2[0], c2[1], 18, 6, 'rgba(230,190,140,0.55)'); });
  // steam (paint, see-through)
  paint(() => {
    for (let i = 0; i < 3; i++) {
      const base = pr([x0 - 1.5 + i * 1.5, 8, z0]), ph = t * 1.3 + i * 2.1;
      ctx.beginPath();
      for (let j = 0; j <= 12; j++) { const yy = base[1] - j * 16, xx = base[0] + Math.sin(ph + j * 0.5) * 10; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,255,255,${0.10 + 0.04 * Math.sin(ph)})`; ctx.stroke();
    }
  });
}
// his body behind the table: the rig without arms, leaning in, on his own layer; his left arm hangs by his side (it is
// covered by the table); returns his rig points in world coordinates. A = {x, y, s, face, lean, headRot, headDX, headDY}
function cafeHero(cam, t, A) {
  const pose = JSON.parse(JSON.stringify(POSES.sit));
  pose.lean = A.lean || 0;
  const st = { x: A.x, y: A.y, s: A.s, pose, face: A.face, noLegs: true, noArms: true, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0 };
  const r = charLayer(cam, st, t, {
    pal: CAFEPAL, ambient: 0.04,
    pre: (lc) => {   // his left arm, hanging by his side behind the table, and his right shoulder's sleeve start
      const rr = rig(pose), P = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
      const sh = P(rr.shR), el = [sh[0] + 30 * st.s, sh[1] + 100 * st.s];
      line(lc, sh[0], sh[1], el[0], el[1], 42 * st.s, CAFEPAL.coat);
    },
    post: (lc, rr) => { if (A.post) A.post(lc, rr, st); },
  });
  const P = (p) => [st.x + p[0] * st.s, st.y + p[1] * st.s];
  return { st, r, shL: P(r.shL), shR: P(r.shR), head: P(r.head), s: st.s };
}
