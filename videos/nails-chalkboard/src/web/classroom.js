// Why Do Nails on a CHALKBOARD Make You Cringe? Short: an empty classroom after hours, and the hero at its blackboard.
// He stands square to us in front of the board and reaches out sideways onto it, like a teacher facing the class.
//   initClass()                        paints the room once (wall, a window's light, the board with three lines of detention)
//   clsRoom(cam, t)                    the room and the board
//   clsHero(cam, t, A)                 him, from a description A (see below); returns points in world coords
//   clsPalm(u, x), clsTips(P)          where his palm is at drag fraction u, and the four nail tips for a palm
//   clsScratch(u, x, k)                the four chalk lines his nails leave, down to drag fraction u
//   clsDust, clsSqueal                 chalk dust off the nails; the squeal as jagged marks at the nails
//   clsRings(t, a, b, o)               the screech on its way from the nails to his ear (it swells near the ear)
//   clsRuler(t, o)                     a pitch ruler chalked on the board: low to high, one narrow band in red
//   clsEar(c, o)                       his right ear again, larger, in head units; canalMini: a round window on it
'use strict';

const CLS = { hx: 430, hy: 1640, hs: 1.25, bx0: 150, bx1: 1050, by0: 430, by1: 1180, x: 690, y0: 995, y1: 1205 };
const CLS_HEAD = [CLS.hx, CLS.hy - 470 * CLS.hs];           // the middle of his head (world)
const CLS_EAR = [66, 3];                                    // his right ear, in head units
const CHALK = '#EEF0E6';
let CLS_IMG = null;

// ---------------------------------------------------------------- the room (painted once, at twice the size: the camera goes close)
function clsPaintRoom() {
  const Q = 2, cv = mkCanvas(W * Q, H * Q), c = cv.getContext('2d');
  c.scale(Q, Q);
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#3A5A6C'); g.addColorStop(0.5, '#24404F'); g.addColorStop(1, '#162B38');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the low sun through a window we cannot see, as a warm patch on the wall, upper left
  const wg = c.createLinearGradient(0, 200, 420, 620);
  wg.addColorStop(0, 'rgba(255,196,120,0.34)'); wg.addColorStop(1, 'rgba(255,196,120,0)');
  c.beginPath(); c.moveTo(0, 150); c.lineTo(330, 250); c.lineTo(330, 420); c.lineTo(0, 560); c.closePath(); c.fillStyle = wg; c.fill();
  // panelling under the board, and the floor
  c.fillStyle = '#3F2C27'; c.fillRect(0, 1300, W, 620);
  c.fillStyle = '#56392E'; c.fillRect(0, 1300, W, 20);
  for (let x = 60; x < W; x += 172) { rrect(c, x, 1352, 132, 250, 10); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill(); }
  c.fillStyle = '#231712'; c.fillRect(0, 1640, W, 280);
  for (let x = -40; x < W; x += 210) line(c, x, 1640, x - 60, 1920, 4, 'rgba(0,0,0,0.3)');
  c.fillStyle = 'rgba(255,214,150,0.07)'; c.fillRect(0, 1640, W, 8);
  // the board: a wooden frame, slate, a ledge with chalk and a duster
  const bw = CLS.bx1 - CLS.bx0, bh = CLS.by1 - CLS.by0;
  rrect(c, CLS.bx0 - 26, CLS.by0 - 26, bw + 52, bh + 52, 16); c.fillStyle = '#7A4B26'; c.fill();
  rrect(c, CLS.bx0 - 16, CLS.by0 - 16, bw + 32, bh + 32, 10); c.fillStyle = '#A26A38'; c.fill();
  const sg = c.createLinearGradient(CLS.bx0, CLS.by0, CLS.bx1, CLS.by1);
  sg.addColorStop(0, '#2C6450'); sg.addColorStop(0.5, '#215241'); sg.addColorStop(1, '#173B2F');
  c.fillStyle = sg; c.fillRect(CLS.bx0, CLS.by0, bw, bh);
  const rng = mulberry32(31);
  for (let i = 0; i < 46; i++) {   // the ghosts of old lessons
    const x = CLS.bx0 + 40 + rng() * (bw - 80), y = CLS.by0 + 30 + rng() * (bh - 60), rx = 60 + rng() * 150, ry = 14 + rng() * 34;
    c.save(); c.translate(x, y); c.rotate((rng() - 0.5) * 0.5); c.scale(1, ry / rx);
    const sm = c.createRadialGradient(0, 0, 0, 0, 0, rx); sm.addColorStop(0, `rgba(235,245,235,${0.035 + 0.045 * rng()})`); sm.addColorStop(1, 'rgba(235,245,235,0)');
    c.fillStyle = sm; c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill(); c.restore();
  }
  // three lines of detention, top left
  c.save(); c.transform(1, 0, -0.2, 1, 0, 0);
  c.font = '700 31px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(238,240,230,${0.6 - 0.1 * i})`; c.fillText('I will not scratch the board.', CLS.bx0 + 150 + 5 * i, CLS.by0 + 54 + i * 50); }
  c.restore();
  // the ledge
  rrect(c, CLS.bx0 - 34, CLS.by1 + 22, bw + 68, 26, 8); c.fillStyle = '#8A5A30'; c.fill();
  rrect(c, CLS.bx0 - 34, CLS.by1 + 40, bw + 68, 12, 6); c.fillStyle = '#5E3B1E'; c.fill();
  for (const [x, w, col] of [[250, 62, '#F4F2EA'], [330, 44, '#FFD98A'], [900, 54, '#F4F2EA']]) { rrect(c, x, CLS.by1 + 8, w, 15, 6); c.fillStyle = col; c.fill(); }
  rrect(c, 760, CLS.by1 - 8, 108, 32, 8); c.fillStyle = '#3A2A55'; c.fill(); rrect(c, 760, CLS.by1 + 10, 108, 14, 6); c.fillStyle = '#D8D4C8'; c.fill();
  return cv;
}
function initClass() { CLS_IMG = clsPaintRoom(); }

function clsRoom(cam, t) {
  screenSpace(); ctx.fillStyle = '#162B38'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  ctx.drawImage(CLS_IMG, 0, 0, W, H);
  softDot(gctx, 40, 330, 420, '#FFC27A', 0.2);
}

// ---------------------------------------------------------------- chalk
function chalkText(c, txt, x, y, size, o = {}) {
  c.save();
  c.font = `${o.weight || 800} ${size}px Montserrat`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  c.fillStyle = rgba(o.col || CHALK, (o.a === undefined ? 0.92 : o.a) * 0.3); c.fillText(txt, x + 1.2, y + 1.4);
  c.fillStyle = rgba(o.col || CHALK, o.a === undefined ? 0.92 : o.a); c.fillText(txt, x, y);
  c.restore();
}
// a chalk stroke along points P, drawn on up to fraction k (a little rough: two passes)
function chalkLine(c, P, w, col, k = 1, a = 0.9) {
  if (k <= 0.001 || P.length < 2) return;
  const n = Math.max(2, Math.ceil(P.length * clamp(k)));
  const Q = P.slice(0, n);
  poly(c, Q, w * 2.2, rgba(col, 0.1 * a));
  poly(c, Q, w, rgba(col, a));
}

// where his palm is (world) at drag fraction u (0 = the nails land, 1 = the bottom of the scrape); x = which scrape
function clsPalm(u, x = CLS.x) { return [x + 0.5 * Math.sin(u * 61), lerp(CLS.y0, CLS.y1, u)]; }
// the four nail tips for a palm at P (world)
function clsTips(P) {
  const s = CLS.hs;
  return [0, 1, 2, 3].map((i) => [P[0] + (-19 + i * 12.6) * s, P[1] - (50 + [0, 5, 5, 0][i]) * s]);
}
// the four lines his nails leave: from where they landed down to drag fraction u. k = how much of them is left (1 = all)
function clsScratch(u, x = CLS.x, k = 1) {
  if (u <= 0.001 || k <= 0.01) return;
  paint(() => {
    for (let i = 0; i < 4; i++) {
      const P = [];
      for (let j = 0; j <= 30; j++) { const v = (u * j) / 30, T = clsTips(clsPalm(v, x))[i]; P.push([T[0] + 0.4 * Math.sin(v * 47 + i * 2), T[1]]); }
      chalkLine(ctx, P, 3.7, CHALK, 1, 0.94 * k);
    }
  });
}
// chalk dust falling off the nails while they move (u = drag fraction now, t = seconds; a = how much)
function clsDust(t, u, x = CLS.x, a = 1) {
  if (a <= 0.01 || u <= 0 || u >= 1) return;
  const T = clsTips(clsPalm(u, x));
  for (let j = 0; j < 22; j++) {
    const life = 0.55, ph = ((t * 1.7 + j / 22) % 1) * life, P = T[j % 4], h = hash(j * 7.3);
    const px = P[0] + (h - 0.5) * 46 * (ph / life) + 6 * Math.sin(j), py = P[1] + 8 + 240 * ph * ph + 30 * ph;
    circle(ctx, px, py, 1.4 + 1.6 * hash(j + 3), rgba(CHALK, 0.75 * a * (1 - ph / life)));
  }
}
// the squeal itself: jagged marks jumping off the nails (f = frame number, so they flicker)
function clsSqueal(P, f, a = 1, s = 1) {
  if (a <= 0.01) return;
  const rng = mulberry32(900 + f * 7);
  for (let i = 0; i < 6; i++) {   // two fans, left and right of the nails: straight up is where the chalk lines are
    const an = (i < 3 ? -3.05 + i * 0.36 : -0.81 + (i - 3) * 0.36) + (rng() - 0.5) * 0.24, r0 = (22 + rng() * 8) * s, r1 = r0 + (20 + rng() * 26) * s;
    const J = jagged(rng, P[0] + Math.cos(an) * r0, P[1] + Math.sin(an) * r0, P[0] + Math.cos(an) * r1, P[1] + Math.sin(an) * r1, 13 * s, 2);
    poly(ctx, J, 5.4 * s, rgba('#141A2A', 0.5 * a)); poly(ctx, J, 3.2 * s, rgba('#FFF8DC', 0.97 * a)); poly(gctx, J, 6 * s, rgba('#FFE08A', 0.2 * a));
  }
}

// the screech on its way from a (the nails) to b (his ear): arcs that leave a and close in on b. o: {k: how much,
// loud 0..1: near the ear they get fat and red, speed, n}
function clsRings(t, a, b, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), n = o.n || 6, sp = o.speed || 1.5, loud = o.loud || 0;
  for (let i = 0; i < n; i++) {
    const p = ((t * sp + i / n) % 1 + 1) % 1, r = 14 + p * (L - 20);
    const near = clamp((p - 0.5) / 0.5), fat = 1 + 2.6 * loud * near;
    const half = lerp(0.62, 0.2, p) * (1 + 0.5 * loud * near);
    const al = k * Math.sin(Math.PI * clamp(p * 1.25)) * (0.55 + 0.45 * near * loud + 0.3 * (1 - p));
    const col = mixH('#FFF1B8', '#FF4D5E', loud * near);
    for (const [cc, w, aa] of [[ctx, 4.2 * fat, al], [gctx, 9 * fat, 0.4 * al]]) {
      cc.beginPath(); cc.arc(a[0], a[1], r, ang - half, ang + half); cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = rgba(col, aa); cc.stroke();
    }
  }
}

// ---------------------------------------------------------------- the pitch ruler, chalked on the board
const RUL = { x0: 330, x1: 890, y: 800, b0: 2 / 3, b1: (Math.log10(4000) - Math.log10(20)) / 3 };   // 20 Hz .. 20 kHz on a log scale
const rulX = (f) => lerp(RUL.x0, RUL.x1, f);
// the wave above the line: slow and wide on the left, tight on the right
function rulWave(f0, f1, n = 80, amp = 30) {
  const P = [], a = 2.5, N = 30;
  for (let i = 0; i <= n; i++) {
    const f = lerp(f0, f1, i / n), ph = (2 * Math.PI * N * (Math.exp(a * f) - 1)) / (Math.exp(a) - 1);
    P.push([rulX(f), RUL.y - 48 - amp * Math.sin(ph)]);
  }
  return P;
}
// o: {line 0..1 (it draws on from the left), band 0..1 (one narrow band turns red), label 0..1, mute 0..1 (the band is
// struck out and goes grey), door 0..1 (a scream looks out of it), q 0..1 (a question mark beside it), pulse}
function clsRuler(t, o = {}) {
  const ln = clamp(o.line || 0);
  if (ln <= 0.001) return;
  const bx0 = rulX(RUL.b0), bx1 = rulX(RUL.b1), bm = (bx0 + bx1) / 2, mute = clamp(o.mute || 0);
  paint(() => {
    chalkLine(ctx, [[RUL.x0, RUL.y], [lerp(RUL.x0, RUL.x1, ln), RUL.y]], 4, CHALK, 1);
    for (let i = 0; i <= 12; i++) { const f = i / 12; if (f <= ln) line(ctx, rulX(f), RUL.y - 7, rulX(f), RUL.y + 7, 3, rgba(CHALK, 0.8)); }
    chalkLine(ctx, rulWave(0, ln, Math.ceil(240 * ln) + 2), 3.4, CHALK, 1, 0.85);
    if (ln > 0.1) chalkText(ctx, 'LOW', RUL.x0, RUL.y + 40, 27, { align: 'left', a: 0.8 * clamp((ln - 0.1) * 5) });
    if (ln > 0.9) chalkText(ctx, 'HIGH', RUL.x1, RUL.y + 40, 27, { align: 'right', a: 0.8 * clamp((ln - 0.9) * 10) });
  });
  const bk = clamp(o.band || 0);
  if (bk > 0.001) {
    const s = E.outBack(bk, 2.2) * (1 + 0.08 * (o.pulse || 0)), col = mixH('#FF4D5E', '#8E9A96', mute), top = RUL.y - 104, h = 116;
    ctx.save(); ctx.translate(bm, RUL.y - 46); ctx.scale(s, s); ctx.translate(-bm, -(RUL.y - 46));
    paint(() => {
      rrect(ctx, bx0 - 5, top, bx1 - bx0 + 10, h, 8); ctx.fillStyle = rgba(col, 0.34); ctx.fill();
      ctx.lineWidth = 4.5; ctx.strokeStyle = rgba(col, 0.96); ctx.stroke();
      chalkLine(ctx, rulWave(RUL.b0, RUL.b1, 40), 4.6, mixH('#FFD0D4', '#C9D2CE', mute), 1, 1);
    });
    gctx.save(); gctx.translate(bm, RUL.y - 46); gctx.scale(s, s); gctx.translate(-bm, -(RUL.y - 46));
    rrect(gctx, bx0 - 5, top, bx1 - bx0 + 10, h, 8); gctx.fillStyle = rgba('#FF3A50', 0.5 * (1 - mute)); gctx.fill(); gctx.restore();
    if (mute > 0.01) paint(() => {   // struck out
      const m = E.outCubic(mute);
      line(ctx, bx0 - 16, top - 10, lerp(bx0 - 16, bx1 + 16, m), lerp(top - 10, top + h + 10, m), 8, '#FFFFFF');
    });
    ctx.restore();
  }
  const lk = clamp(o.label || 0);
  if (lk > 0.001) paint(() => {
    ctx.save(); ctx.globalAlpha = lk;
    line(ctx, bm, RUL.y + 18, bm, RUL.y + 64, 3, rgba('#FF8A96', 0.9));
    chalkText(ctx, '2,000 – 4,000 Hz', bm, RUL.y + 90, 34, { col: '#FFB3BB', weight: 900, a: 1 });
    ctx.restore();
  });
  const qk = clamp(o.q || 0);
  if (qk > 0.001) paint(() => {
    ctx.save(); ctx.translate(bm + 4, RUL.y - 176); ctx.rotate(0.1 + 0.05 * Math.sin(t * 5)); ctx.scale(E.outBack(qk, 2.4), E.outBack(qk, 2.4));
    chalkText(ctx, '?', 0, 0, 120, { weight: 900, a: 0.95 });
    ctx.restore();
  });
}
// the band's middle and top (world): where a scream looks out, where a mute icon sits
function rulBand() { return { x: (rulX(RUL.b0) + rulX(RUL.b1)) / 2, top: RUL.y - 104, bot: RUL.y + 12, w: rulX(RUL.b1) - rulX(RUL.b0) + 10 }; }

// ---------------------------------------------------------------- the hero
// a point of his head (head units: origin at the head's middle) in rig-local units and in world units
function clsHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function clsHeadPt(st, lx, ly) { const p = clsHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function clsInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}
const clsLocal = (P) => [(P[0] - CLS.hx) / CLS.hs, (P[1] - CLS.hy) / CLS.hs];

// his right ear again, in head units, a good deal larger than the rig's. o: {throb 0..1, red 0..1}
function clsEar(c, o = {}) {
  const th = o.throb || 0, s = 1 + 0.2 * th;
  c.save(); c.translate(CLS_EAR[0], CLS_EAR[1]); c.scale(s, s);
  ellipse(c, 1, 0, 15, 22, mixH('#EDAA86', '#FF6A5E', 0.75 * (o.red || 0)));
  paint(() => {
    ellipse(c, 2, 1, 8.4, 14, mixH('#C97A58', '#D8342E', 0.6 * (o.red || 0)));
    c.beginPath(); c.arc(3, -1, 8, -2.2, 1.3); c.lineWidth = 2.3; c.strokeStyle = 'rgba(120,56,36,0.6)'; c.lineCap = 'round'; c.stroke();
    circle(c, -0.5, 4, 4.1, '#4A2018');
  });
  c.restore();
}
// the ear canal, small, in a round window (any units): a tube, a wave on its way down it, a drum at the end
function canalMini(c, x, y, r, t, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, r * 1.1, '#FFF3D6');
  paint(() => {
    c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip();
    c.fillStyle = '#E39A82'; c.fillRect(-r, -r, 2 * r, 2 * r);
    c.fillStyle = '#3A1430'; c.fillRect(-r, -r * 0.3, 2 * r, r * 0.6);
    c.beginPath();
    for (let i = 0; i <= 24; i++) { const u = i / 24, xx = -r + u * 1.72 * r, yy = Math.sin(u * 13 - t * 16) * r * (0.06 + 0.17 * u); if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
    c.lineWidth = r * 0.085; c.lineCap = 'round'; c.strokeStyle = '#FF5A6E'; c.stroke();
    ellipse(c, r * 0.78, 0, r * 0.07, r * 0.3, '#FFE1D8');
    c.restore();
  });
  c.restore();
}

// his rig state for a description A (no drawing)
function clsSt(A = {}) {
  const cr = A.cringe || 0, fl = A.flinch === undefined ? cr : A.flinch;
  let p = { hipY: -222 + (A.bob || 0) + 9 * cr, lean: A.lean || 0,
    armL: { a: lerp(0.16, 0.66, fl), b: lerp(0.1, 1.55, fl) }, armR: { a: lerp(0.16, 0.72, fl), b: lerp(0.1, 1.35, fl) },
    legL: { a: 0.07 - 0.32 * cr, b: 0.6 * cr }, legR: { a: 0.07 - 0.32 * cr, b: 0.6 * cr }, hand: 'fist', feetFront: 0 };
  if (A.shrug) { p.armL = { a: lerp(p.armL.a, 0.95, A.shrug), b: lerp(p.armL.b, 1.15, A.shrug) }; p.armR = { a: lerp(p.armR.a, 0.95, A.shrug), b: lerp(p.armR.b, 1.15, A.shrug) }; }
  if (A.palm && (A.reach === undefined ? 1 : A.reach) > 0.001) {
    const L = clsLocal(A.palm);
    let q = ikReach(p, 'R', [L[0] - 5, L[1] + 13], A.bend || 1);
    for (let it = 0; it < 3; it++) { const d = rig(q).armDirR; q = ikReach(p, 'R', [L[0] - d[0] * 14, L[1] - d[1] * 14], A.bend || 1); }   // the palm, not the wrist, lands on the point
    p = lerpPose(p, q, clamp(A.reach === undefined ? 1 : A.reach));
    p.hand = 'fist';
  }
  return { x: CLS.hx + (A.dx || 0), y: CLS.hy, s: CLS.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: (A.headDY || 0) + 7 * cr,
    headRot: A.headRot || 0, frizz: A.frizz || 0, seed: 4 };
}
// A: {face, palm: [x, y] world (his right palm on the board), reach 0..1, claw 0..1 (four fingers up, nails on the slate),
//   point 0..1 + pointAt: [x, y] world (a finger out from that hand toward a thing on the board),
//   cringe 0..1 (knees knock, hips drop, arms in), flinch, shrug 0..1, frizz, headDX/DY/Rot, bob, dx, ear: {throb, red},
//   win 0..1 (the round window on his ear), post(lc, r, st), ambient}
// Returns {st, r, head, ear, mouth, top, palm} in world coords
function clsHero(cam, t, A = {}) {
  const st = clsSt(A), pal = A.pal || PAL, out = {};
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.03 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      clsInHead(lc, s2, (c) => {
        actor(() => clsEar(c, A.ear || {}));
        if (A.win > 0.01) canalMini(c, CLS_EAR[0], CLS_EAR[1] + 2, CLS_WIN, t, A.win);
      });
      const cl = clamp(A.claw || 0);
      if (cl > 0.01) {   // the hand on the board: the palm, four fingers up, a nail at the end of each
        const wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14;
        for (let i = 0; i < 4; i++) {   // each finger: up from the palm, then hooked over onto the slate
          const bx = hx - 15.5 + i * 10.4, by = hy - 12, tx = hx - 19 + i * 12.6, ty = hy - 12 - (38 + [0, 5, 5, 0][i]) * cl;
          const kx = lerp(bx, tx, 0.56) + (i - 1.5) * 1.6, ky = lerp(by, ty, 0.56) - 3;
          line(lc, bx, by, kx, ky, 10.8, pal.skin); line(lc, kx, ky, tx, ty + 5, 10.2, pal.skin);
          paint(() => {
            circle(lc, kx, ky, 3.1, 'rgba(170,88,60,0.34)');
            rrect(lc, tx - 4.6, ty - 2.2, 9.2, 10.4, 3.6); lc.fillStyle = '#FFF6EE'; lc.fill(); lc.lineWidth = 1.1; lc.strokeStyle = 'rgba(150,80,60,0.7)'; lc.stroke();
          });
        }
        circle(lc, hx, hy, 22.5, pal.skin);
        line(lc, hx - 20, hy + 6, hx - 31, hy - 9, 10.5, pal.skin);   // the thumb
        paint(() => { for (let i = 0; i < 3; i++) line(lc, hx - 10 + i * 10.4, hy - 16, hx - 10.6 + i * 10.6, hy - 22, 1.8, 'rgba(170,88,60,0.45)'); });
        out.palmLocal = [hx, hy];
      }
      const pk = clamp(A.point || 0);
      if (pk > 0.01 && A.pointAt) {   // a finger out toward a thing on the board
        const wr = rr.wrR, d = rr.armDirR, hx = wr[0] + d[0] * 14, hy = wr[1] + d[1] * 14, T = clsLocal(A.pointAt);
        const dx = T[0] - hx, dy = T[1] - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, len = 44 * pk;
        line(lc, hx + ux * 8, hy + uy * 8, hx + ux * len, hy + uy * len, 10.8, pal.skin);
        circle(lc, hx, hy, 22, pal.skin);
        paint(() => { circle(lc, hx + ux * (len + 1), hy + uy * (len + 1), 3.6, '#FFF6EE'); for (let i = 0; i < 3; i++) { const a = Math.atan2(uy, ux) + 1.0 + i * 0.5; line(lc, hx + Math.cos(a) * 8, hy + Math.sin(a) * 8, hx + Math.cos(a) * 19, hy + Math.sin(a) * 19, 2.2, 'rgba(170,88,60,0.45)'); } });
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => clsHeadPt(st, lx, ly);
  out.st = st; out.r = r; out.head = P(0, 0); out.ear = P(CLS_EAR[0], CLS_EAR[1] + 2); out.mouth = P(0, 40); out.top = P(0, -84);
  if (out.palmLocal) out.palm = [st.x + out.palmLocal[0] * st.s, st.y + out.palmLocal[1] * st.s];
  return out;
}
const CLS_WIN = 21;                                         // the window on his ear, in head units
