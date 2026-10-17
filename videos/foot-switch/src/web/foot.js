// The foot test: the hero in the office chair from a description, his right leg raised with the foot circling, a
// finger that draws a 6 in the air, the trails (orange: the foot's circle; cyan: the 6), the tow rope, his head turned
// to glass with the two halves of his brain, the cords from a half to a hand and a foot, and the shoe's cat ears.
// Rig-local units: his feet at (OF.hx, OF.floor), up = -y (office.js). The picture is the viewer's mirror: his RIGHT
// hand and foot are on the screen's right (the rig's 'R' side), so "clockwise" and the 6 read on screen exactly as the
// viewer does them.
'use strict';

const FS_W = () => 2 * Math.PI * ((window.TLd && TLd.cues.foot_hz) || 0.86);   // rad/s: the foot's circle and the 6's loop
const FS_R6 = 34;                                        // the 6's loop radius (rig units)
const FS_C6 = { R: [158, -415], L: [-158, -415] };       // the middle of the 6's loop, for the right / left hand
const FS_ELB = { R: [176, -298], L: [-176, -298] };      // the elbow while that hand draws
const FS_ANK = [76, -140];                               // the raised foot's ankle: the shoe circles round it
const FS_RF = 21, FS_SHOE = 1.6;                         // the toe's circle (rig units) and the shoe's size (it is near us)
const FS_RING = 64;                                      // the trail's ring round the shoe (rig units)

// ---------------------------------------------------------------- the 6
// the top stroke (u 0..1) runs from the 6's top right corner down the left side into the loop; the loop is then drawn
// from its left point (angle PI) with the angle DECREASING: counter-clockwise on screen (y points down)
function sixTail(C, u) {
  const R = FS_R6, P0 = [C[0] + 0.62 * R, C[1] - 3.05 * R], Q = [C[0] - 1.3 * R, C[1] - 2.2 * R], P1 = [C[0] - R, C[1]];
  const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u;
  return [a * P0[0] + b * Q[0] + d * P1[0], a * P0[1] + b * Q[1] + d * P1[1]];
}
const sixLoop = (C, th) => [C[0] + FS_R6 * Math.cos(th), C[1] + FS_R6 * Math.sin(th)];
// where the fingertip is, and how much of the 6 is drawn: t0 = the stroke starts; loops go on round the loop
// (rest = before t0: the finger up at the 6's start, a small idle bob)
function sixState(side, t, t0, o = {}) {
  const C = FS_C6[side], TAIL = 0.46, w = FS_W();
  if (t < t0) { const P = sixTail(C, 0); return { F: [P[0] + 1.5 * Math.sin(t * 4.1), P[1] - 2 + 2 * Math.sin(t * 3.3)], u: 0, sweep: 0, th: Math.PI, C }; }
  if (t < t0 + TAIL) { const u = E.inOutSine((t - t0) / TAIL); return { F: sixTail(C, u), u, sweep: 0, th: Math.PI, C }; }
  const sweep = w * (t - t0 - TAIL) * (o.speed || 1), th = Math.PI - sweep;
  return { F: sixLoop(C, th), u: 1, sweep, th, C };
}
// the 6 drawn so far, as a glowing stroke (world points from rig points via P)
function sixTrail(P, S, k, col = '#7FE9FF', o = {}) {
  if (k <= 0.01 || (S.u <= 0 && S.sweep <= 0)) return;
  const pts = [];
  const n1 = Math.max(2, Math.round(26 * S.u));
  for (let i = 0; i <= n1; i++) pts.push(P(...sixTail(S.C, (i / n1) * S.u)));
  const sw = Math.min(S.sweep, 2 * Math.PI);
  const n2 = Math.round(48 * sw / (2 * Math.PI));
  for (let i = 1; i <= n2; i++) pts.push(P(...sixLoop(S.C, Math.PI - (i / n2) * sw)));
  const lw = (o.w || 11) * (o.zoom || 1);
  for (const [cc, w, cl] of [[ctx, lw * 1.9, '#0B0B1A'], [ctx, lw, col], [gctx, lw * 2.2, rgba(col, 0.55)]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0); else cc.setTransform(1, 0, 0, 1, 0, 0);
    cc.globalAlpha = clamp(k);
    cc.beginPath(); pts.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
    cc.lineWidth = w; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = cl; cc.stroke();
    cc.restore();
  }
  // after the first full turn, a bright comet runs round the loop where the finger is
  if (S.sweep > 2 * Math.PI) {
    const cm = [];
    for (let i = 0; i <= 16; i++) cm.push(P(...sixLoop(S.C, S.th + (i / 16) * 2.2)));
    for (const [cc, w, cl] of [[ctx, lw * 1.25, '#FFFFFF'], [gctx, lw * 3, rgba(col, 0.7)]]) {
      cc.save(); cc.setTransform(cc === gctx ? 0.5 : 1, 0, 0, cc === gctx ? 0.5 : 1, 0, 0); cc.globalAlpha = clamp(k);
      cc.beginPath(); cm.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
      cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
    }
  }
}

// ---------------------------------------------------------------- the foot's circle
// the hook's foot: clockwise (the angle grows: clockwise on screen) until flip0, then it stutters and from flip1 goes
// the 6's way at the 6's speed. Valid at negative time (the last frames of the Short run into frame 1).
function footPhaseHook(tt) {
  const c = TLd.cues, w = FS_W(), f0 = c.flip0, f1 = c.flip1, PH0 = 0.7;
  if (tt <= f0) return PH0 + w * tt;
  let ph = PH0 + w * f0;
  const end = Math.min(tt, f1), dt = 1 / 480;
  for (let x = f0; x < end; x += dt) { const s = E.inOutSine(inv(f0, f1, x)); ph += w * (1 - 2 * s) * dt + 0.9 * Math.sin((x - f0) * 46) * (1 - Math.abs(2 * s - 1)) * dt * 6; }
  if (tt > f1) ph -= w * (tt - f1);
  return ph;
}
// how much the foot shakes in the stutter (0..1)
function footStutter(tt) { const c = TLd.cues; return tt > c.flip0 && tt < c.flip1 ? Math.sin(Math.PI * inv(c.flip0, c.flip1, tt)) : 0; }
// the ring round the shoe: a tail of the circle it is drawing, and an arrowhead the way it goes (dir +1 = clockwise)
function footRing(P, ph, dir, col, k, o = {}) {
  if (k <= 0.01) return;
  const Rr = FS_RING * (o.s || 1), zoom = o.zoom || 1, n = 30, span = 4.4;
  const C = P(FS_ANK[0], FS_ANK[1] + 18);
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = ph - dir * span * (1 - i / n); pts.push([C[0] + Math.cos(a) * Rr * zoom, C[1] + Math.sin(a) * Rr * zoom * 0.86]); }
  screenSpace();
  for (let i = 1; i <= n; i++) {
    const a = clamp(k) * (0.15 + 0.85 * (i / n));
    for (const [cc, w, cl] of [[ctx, 10 * zoom, rgba(col, a)], [gctx, 22 * zoom, rgba(col, 0.42 * a)]]) {
      cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
      cc.beginPath(); cc.moveTo(pts[i - 1][0], pts[i - 1][1]); cc.lineTo(pts[i][0], pts[i][1]);
      cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
    }
  }
  // the arrowhead
  const a = ph, tx = -Math.sin(a) * dir, ty = Math.cos(a) * dir * 0.86, L = Math.hypot(tx, ty) || 1;
  const H = pts[n], ux = tx / L, uy = ty / L, s = 26 * zoom * clamp(k * 1.4);
  for (const [cc, cl, gw] of [[ctx, '#0B0B1A', 1.35], [ctx, col, 1], [gctx, rgba(col, 0.6), 1.6]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.beginPath(); cc.moveTo(H[0] + ux * s * gw, H[1] + uy * s * gw);
    cc.lineTo(H[0] - uy * s * 0.75 * gw - ux * s * 0.3, H[1] + ux * s * 0.75 * gw - uy * s * 0.3);
    cc.lineTo(H[0] + uy * s * 0.75 * gw - ux * s * 0.3, H[1] - ux * s * 0.75 * gw - uy * s * 0.3);
    cc.closePath(); cc.fillStyle = cl; cc.fill(); cc.restore();
  }
}

// ---------------------------------------------------------------- the shoe, seen from the front (toe toward us), rig units
// o: {cat 0..1 (ears, whiskers, a face), look [-1..1, -1..1], meow 0..1 (mouth open), blink}
function fsShoe(c, x, y, s, rot, pal, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const cat = clamp(o.cat || 0);
  // cat ears behind the top of the shoe
  if (cat > 0.01) {
    const e = E.outBack(cat, 2.2);
    for (const sd of [-1, 1]) {
      c.save(); c.translate(sd * 26, -14); c.scale(e, e); c.rotate(sd * 0.25);
      c.beginPath(); c.moveTo(-15, 4); c.lineTo(0, -34); c.lineTo(15, 4); c.closePath(); c.fillStyle = pal.shoe; c.fill();
      paint(() => { c.beginPath(); c.moveTo(-8, 0); c.lineTo(0, -22); c.lineTo(8, 0); c.closePath(); c.fillStyle = '#FF9FB4'; c.fill(); });
      c.restore();
    }
  }
  // the sock and the laces' top, then the toe cap, then the sole's rim
  rrect(c, -16, -31, 32, 18, 7); c.fillStyle = pal.sock; c.fill();
  rrect(c, -30, -18, 60, 30, 13); c.fillStyle = pal.shoe; c.fill();
  ellipse(c, 0, 12, 39, 24, pal.shoe);
  rrect(c, -41, 22, 82, 15, 7); c.fillStyle = pal.sole; c.fill();
  paint(() => {
    rrect(c, -13, -17, 26, 18, 6); c.fillStyle = '#F7EFE6'; c.fill();                     // the tongue
    for (let i = 0; i < 3; i++) line(c, -11, -12 + i * 6, 11, -12 + i * 6, 2.6, '#C9312A'); // laces
    for (let i = -3; i <= 3; i++) line(c, i * 10, 30, i * 10 + 3, 35, 2.2, 'rgba(120,110,100,0.55)');   // tread on the rim
    line(c, -38, 25, 38, 25, 2, 'rgba(0,0,0,0.18)');
    if (cat > 0.01) {                                                                       // the cat's face on the toe cap
      const k = E.outBack(cat, 1.8), lk = o.look || [0, 0], bl = clamp(o.blink || 0);
      c.save(); c.scale(k, k);
      for (const sd of [-1, 1]) {
        if (bl > 0.9) { c.beginPath(); c.moveTo(sd * 13 - 6, 8); c.quadraticCurveTo(sd * 13, 13, sd * 13 + 6, 8); c.lineWidth = 2.6; c.strokeStyle = '#2A1020'; c.stroke(); }
        else { ellipse(c, sd * 13, 8, 6, 7.5, '#FFFFFF'); ellipse(c, sd * 13 + lk[0] * 2, 9 + lk[1] * 2, 3.4, 5, '#1A0C18'); circle(c, sd * 13 + lk[0] * 2 - 1, 6.5 + lk[1] * 2, 1.2, '#FFFFFF'); }
        for (const dy of [-3, 3]) line(c, sd * 22, 17 + dy * 0.6, sd * 44, 15 + dy * 1.6, 1.8, '#FFFFFF');
      }
      c.beginPath(); c.moveTo(-3, 15); c.lineTo(3, 15); c.lineTo(0, 18.5); c.closePath(); c.fillStyle = '#FF7FA0'; c.fill();
      const mo = clamp(o.meow || 0);
      if (mo > 0.05) ellipse(c, 0, 23, 4 + 2 * mo, 2 + 5 * mo, '#5A1522');
      else { c.beginPath(); c.moveTo(-6, 20); c.quadraticCurveTo(-3, 23, 0, 20); c.quadraticCurveTo(3, 23, 6, 20); c.lineWidth = 2; c.strokeStyle = '#2A1020'; c.stroke(); }
      c.restore();
    }
  });
  c.restore();
}

// ---------------------------------------------------------------- his legs (rig units, on his layer after him)
// up 0..1: his right leg from seated (shin down, the shoe on the floor) to raised toward us; ph = the toe's angle
function fsLegs(c, pal, A) {
  // his left leg, seated (screen-left)
  line(c, -56, -178, -62, -46, 44, pal.pants);
  ellipse(c, -50, -196, 50, 40, pal.pants);
  drawShoe(c, [-62, -40], -1, pal, 1, false);
  // his right leg
  const up = clamp(A.legUp === undefined ? 1 : A.legUp), sk = A.shake || 0;
  const ank = [lerp(62, FS_ANK[0], up) + sk * 3 * Math.sin(A.t * 61), lerp(-46, FS_ANK[1], up) + sk * 2 * Math.cos(A.t * 53)];
  const knee = [lerp(56, 66, up), lerp(-178, -172, up)];
  ellipse(c, lerp(50, 56, up), lerp(-196, -192, up), lerp(50, 56, up), lerp(40, 46, up), pal.pants);
  line(c, knee[0], knee[1], ank[0], ank[1], lerp(44, 56, up), pal.pants);
  const ph = A.ph || 0, sc = lerp(1, FS_SHOE, up), rf = FS_RF * up;
  const toe = [ank[0] + rf * Math.cos(ph), ank[1] + 18 * up + rf * Math.sin(ph) * 0.85];
  // the trouser hem over the top of the sock, toward the toe
  line(c, ank[0], ank[1], lerp(ank[0], toe[0], 0.35), lerp(ank[1], toe[1] - 20, 0.35), lerp(44, 54, up), pal.pants);
  if (up < 0.02) drawShoe(c, [62, -40], 1, pal, 1, false);
  else fsShoe(c, toe[0], toe[1], sc, 0.16 * Math.cos(ph) * up, pal, A.shoe || {});
  return { ank, toe };
}

// ---------------------------------------------------------------- the hero in the chair
// A: {face, draw: 'R' | 'L' | null (which hand draws the 6), six (sixState of that hand), rest: {L, R} arm positions,
//     legUp, ph, shake, shoe, bob, lean, headRot, headDX, headDY, tie, glass ({k, left, right, faceL, faceR}),
//     tongue (a tip of tongue at the corner of his mouth: concentrating), post(lc, r, st)}
const FSPAL = Object.assign({}, OFPAL, { shoe: '#EF4638', shoeSh: '#B02A22', sole: '#F4F0E6', sock: '#E4E7F0' });
function fsArmFor(side, F) {
  const E0 = FS_ELB[side], dx = F[0] - E0[0], dy = F[1] - E0[1];
  const e = [E0[0] + 0.22 * (F[0] - FS_C6[side][0]), E0[1] + 0.18 * (F[1] - FS_C6[side][1])];
  const ux = F[0] - e[0], uy = F[1] - e[1], L = Math.hypot(ux, uy) || 1;
  return { e, w: [F[0] - (ux / L) * 70, F[1] - (uy / L) * 70] };
}
function fsSt(A) {
  let p = { hipY: OF_HIP + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'fist', feetFront: 1 };
  for (const side of ['L', 'R']) {
    let arm = (A.rest && A.rest[side]) || (side === 'L' ? OF_ARM.gripL : OF_ARM.gripR);
    if (A.arms && A.arms[side]) arm = A.arms[side];
    p = armAt(p, side, arm.e, arm.w);
  }
  if (A.handL) p.handL = A.handL;
  if (A.handR) p.handR = A.handR;
  return { x: OF.hx + (A.dx || 0), y: OF.floor + (A.dy || 0), s: OF.s, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, frizz: 0, noLegs: true, seed: 4 };
}
// draw fn in his head's own units (the head's middle at 0, 0; it turns with him)
function fsInHead(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c, r); c.restore();
}
function fsHero(cam, t, A) {
  const pal = A.pal || FSPAL, st = fsSt(A);
  let legs = null;
  const r = charLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.04 : A.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      ofTie(lc, A.tie || 0);
      legs = fsLegs(lc, pal, Object.assign({ t }, A));
      if (A.tongue > 0.01) fsInHead(lc, s2, (c) => paint(() => { ellipse(c, 15, 44, 7 * A.tongue, 5 * A.tongue, '#E0616C'); line(c, 15, 41, 15, 46, 1.6, 'rgba(150,40,60,0.6)'); }));
      if (A.glass && A.glass.k > 0.01) fsInHead(lc, s2, (c) => glassHead(c, t, A.glass));
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => [st.x + lx * st.s, st.y + ly * st.s];             // rig units -> world
  const HP = (lx, ly) => ofHeadPt(st, lx, ly);                              // head units -> world
  const S = (lx, ly) => toScreen(cam, ...P(lx, ly)), HS = (lx, ly) => toScreen(cam, ...HP(lx, ly));   // -> screen
  const finger = (side) => { const d = r['armDir' + side], w = r['wr' + side]; return P(w[0] + d[0] * 70, w[1] + d[1] * 70); };
  return { st, r, P, HP, S, HS, cam, head: HP(0, 0), top: HP(0, -84), legs, toeW: legs ? P(...legs.toe) : null,
    toeS: legs ? S(...legs.toe) : null, finger, fingerS: (side) => toScreen(cam, ...finger(side)) };
}

// ---------------------------------------------------------------- his head as glass, the two halves of his brain
// in head units. g: {k (the glass), left / right (how lit each half is, 0..1), faceL / faceR (0..1: the half has a face),
// tie (the left half wears a tie: the boss), moodL / moodR ('smile' | 'strain' | 'calm')}
const HEMI = { L: [-25, -14], R: [25, -14] };
function hemiPath(c, side, s = 1) {
  const sd = side === 'L' ? -1 : 1, [cx, cy] = HEMI[side];
  c.beginPath();
  c.moveTo(cx - sd * 22 * s, cy - 33 * s);
  c.bezierCurveTo(cx + sd * 8 * s, cy - 42 * s, cx + sd * 30 * s, cy - 26 * s, cx + sd * 31 * s, cy - 2 * s);
  c.bezierCurveTo(cx + sd * 32 * s, cy + 22 * s, cx + sd * 14 * s, cy + 34 * s, cx - sd * 6 * s, cy + 33 * s);
  c.bezierCurveTo(cx - sd * 20 * s, cy + 32 * s, cx - sd * 23 * s, cy + 20 * s, cx - sd * 23 * s, cy + 2 * s);
  c.lineTo(cx - sd * 23 * s, cy - 22 * s);
  c.quadraticCurveTo(cx - sd * 24 * s, cy - 32 * s, cx - sd * 22 * s, cy - 33 * s);
  c.closePath();
}
function hemiFace(c, side, mood, k, t) {
  if (k <= 0.01) return;
  const [cx, cy] = HEMI[side], s = E.outBack(clamp(k), 2);
  c.save(); c.translate(cx, cy + 2); c.scale(s, s);
  const strain = mood === 'strain', calm = mood === 'calm';
  for (const sd of [-1, 1]) {
    ellipse(c, sd * 8, -4, 4.6, calm ? 1.6 : 5.6, '#FFFFFF');
    if (!calm) { circle(c, sd * 8 + (strain ? 0 : 0.6), -3, 2.6, '#1A0C18'); }
    line(c, sd * 3.5, -12 - (strain ? -1.5 : 1) * 1.5, sd * 12.5, -12 + (strain ? -3 : 0.5), 2.2, '#3A1530');
  }
  if (strain) { rrect(c, -7, 6, 14, 6, 2.5); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = '#3A1530'; c.stroke(); }
  else { c.beginPath(); c.moveTo(-6, 6); c.quadraticCurveTo(0, calm ? 9 : 12, 6, 6); c.lineWidth = 2.2; c.strokeStyle = '#3A1530'; c.lineCap = 'round'; c.stroke(); }
  c.restore();
}
function glassHead(c, t, g) {
  const k = clamp(g.k);
  // the glass: the head's shape over his face (see-through, so the light leaves it as drawn), the skull's outline
  c.save();
  c.beginPath(); c.ellipse(0, 0, 65, 71, 0, 0, 7);
  c.fillStyle = rgba('#0C1636', 0.9 * k); c.fill();
  c.lineWidth = 3; c.strokeStyle = rgba('#7FE9FF', 0.85 * k); c.stroke();
  c.restore();
  if (k < 0.2) return;
  const a = clamp((k - 0.2) / 0.5);
  paint(() => {
    c.save(); c.globalAlpha = a;
    for (const side of ['L', 'R']) {
      const lit = clamp(side === 'L' ? g.left : g.right);
      const base = mixHex('#5E4A7A', '#FF93B0', lit);
      hemiPath(c, side); c.fillStyle = base; c.fill();
      c.lineWidth = 2; c.strokeStyle = rgba('#FFFFFF', 0.35); c.stroke();
      // folds
      const [cx, cy] = HEMI[side], sd = side === 'L' ? -1 : 1;
      c.lineWidth = 1.8; c.strokeStyle = rgba('#7E2748', 0.55); c.lineCap = 'round';
      for (const [y, w] of [[-24, 14], [-8, 18], [8, 15], [22, 10]]) { c.beginPath(); c.moveTo(cx - sd * 12, cy + y); c.quadraticCurveTo(cx + sd * (w - 6), cy + y - 6, cx + sd * w, cy + y + 2); c.stroke(); }
      hemiFace(c, side, side === 'L' ? (g.moodL || 'smile') : (g.moodR || 'smile'), side === 'L' ? g.faceL : g.faceR, t);
    }
    // the boss's tie, under the left half
    if (g.tie > 0.01) {
      const s = E.outBack(clamp(g.tie), 2);
      c.save(); c.translate(HEMI.L[0] - 4, HEMI.L[1] + 32); c.scale(s, s);
      c.beginPath(); c.moveTo(-4, 0); c.lineTo(4, 0); c.lineTo(6, 6); c.lineTo(0, 22); c.lineTo(-6, 6); c.closePath(); c.fillStyle = '#E2384C'; c.fill();
      c.restore();
    }
    c.restore();
  });
  // the lit halves shine
  for (const side of ['L', 'R']) {
    const lit = clamp(side === 'L' ? g.left : g.right);
    if (lit > 0.02) {
      const m = c.getTransform(), [cx, cy] = HEMI[side];
      const X = m.a * cx + m.c * cy + m.e, Y = m.b * cx + m.d * cy + m.f;
      gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0);
      softDot(gctx, X / 2, Y / 2, 20 * Math.hypot(m.a, m.b), '#FFD447', 0.4 * lit * a);
      gctx.restore();
    }
  }
}

// ---------------------------------------------------------------- the cords: from a half of the brain to a hand or a foot
// world polylines through his joints (H = fsHero's result); beads of signal run down them
// screen points: from the half of the brain that runs that side (the other side's half: the cords cross in the neck)
function cordPts(H, which, side) {
  const r = H.r, P = H.S, half = HEMI[side === 'R' ? 'L' : 'R'];
  const start = H.HS(half[0], half[1] + 30), neck = P(r.neck[0], r.neck[1] + 6);
  if (which === 'hand') {
    const sh = r['sh' + side], el = r['el' + side], wr = r['wr' + side];
    return [start, neck, P(sh[0] * 0.55, sh[1] + 8), P(...sh), P(...el), P(...wr), H.fingerS(side)];
  }
  const leg = H.legs || { ank: FS_ANK, toe: FS_ANK };
  return [start, neck, P(10, -300), P(30, -232), P(48, -196), P(66, -172), P(...leg.ank), P(leg.toe[0], leg.toe[1] - 6)];
}
function cord(pts, col, k, t, o = {}) {
  if (k <= 0.01) return;
  const acc = polyLen(pts), L = acc[acc.length - 1], Lk = L * clamp(k);
  const cut = [];
  for (let i = 0; i < pts.length; i++) {
    if (acc[i] <= Lk) cut.push(pts[i]);
    else { cut.push(polyAt(pts, acc, Lk)); break; }
  }
  const zw = o.w || 7;
  screenSpace();
  for (const [cc, w, cl] of [[ctx, zw * 2.1, 'rgba(8,8,26,0.85)'], [ctx, zw, col], [gctx, zw * 2.6, rgba(col, 0.5)]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.beginPath(); cut.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
    cc.lineWidth = w; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
  }
  // beads of signal on their way down
  if (o.beads !== false) for (let i = 0; i < 4; i++) {
    const s = ((t * (o.speed || 520) + i * L / 4) % L);
    if (s > Lk) continue;
    const p = polyAt(pts, acc, s);
    circle(ctx, p[0], p[1], zw * 0.9, '#FFFFFF');
    softDot(gctx, p[0], p[1], zw * 2.2, col, 0.8);
  }
}

// ---------------------------------------------------------------- the tow rope from his fingertip to his toe (world points)
function towRope(A, B, k, t) {
  if (k <= 0.01) return;
  screenSpace();
  const mx = (A[0] + B[0]) / 2 + 30, my = (A[1] + B[1]) / 2 + 60 * (1 - clamp(k));
  for (const [cc, w, cl] of [[ctx, 12, 'rgba(8,8,26,0.8)'], [ctx, 6, '#BFF6FF'], [gctx, 14, 'rgba(127,233,255,0.5)']]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.setLineDash([22, 14]); cc.lineDashOffset = -t * 160;
    cc.beginPath(); cc.moveTo(A[0], A[1]); cc.quadraticCurveTo(mx, my, lerp(A[0], B[0], clamp(k * 1.3)), lerp(A[1], B[1], clamp(k * 1.3)));
    cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
  }
}

// a word in a jagged comic burst (screen space; s = size)
function fsBurst(txt, x, y, s, col, k, rot = -0.08, seed = 3) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2.2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e);
  const rng = mulberry32(seed), n = 18, R0 = 1.0;
  ctx.font = `400 ${s}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(txt).width;
  const rx = tw * 0.62 + s * 0.4, ry = s * 0.95;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, R = i % 2 ? 0.8 + 0.08 * rng() : R0 + 0.12 * rng(); ctx.lineTo(Math.cos(a) * rx * R, Math.sin(a) * ry * R); }
  ctx.closePath(); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.save(); ctx.scale(0.9, 0.86); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 4);
  ctx.restore();
}
