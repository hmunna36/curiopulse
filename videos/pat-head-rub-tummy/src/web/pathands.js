// The pat and the rub: his right hand (the rig's 'R', the screen's right) pats the crown of his head, his left hand
// (the rig's 'L') rubs circles on his tummy. A real hand for both (the rig's hand is a ball): a flat hand seen from the
// back, drawn in rig units; the patting arm is drawn again in front of his head. Motion as functions of time, so any
// frame renders on its own (and the hook is valid at negative time for the loop).
// Rig-local units as in office.js: his feet at (OF.hx, OF.floor), up = -y, the head's middle at (0, OF_HIP - 248).
'use strict';

const PH_HEAD = [0, OF_HIP - 248];          // the head's middle (rig)
const PH_CROWN = [10, OF_HIP - 248 - 92];    // where the patting palm lands on his hair (rig)
const PH_TUM = [-16, OF_HIP - 62];           // the middle of the rub circle on his tummy (rig)
const PH_RUB_R = [30, 19];                   // the rub's radii (the tummy is round: flatter up and down)
const PH_LIFT = 34;                          // how high a pat lifts the hand off his head
const PH_HAND_S = 1.18;                      // his hands, a little larger than life (they are the test)
const PH_CYAN = '#7FE9FF', PH_GOLD = '#FFD447';
// a coral shirt with a collar and buttons (office.js's pyjama-top cut), the house trousers
const PHPAL = Object.assign({}, FSPAL, { coat: '#F2845C', coatSh: '#C95F3D', coatHi: '#FFC2A6', coatDk: '#9A3F26' });

// ---------------------------------------------------------------- a bounce from a schedule of contacts
// h = 0 at a contact, 1 at the top between two; sq = the squash just after a contact (1 .. 0)
function phBounce(t, tp, tn) {
  const u = clamp((t - tp) / Math.max(0.05, tn - tp));
  const h = Math.pow(Math.sin(Math.PI * u), 0.72) * (u < 0.5 ? 1 : 1 - 0.25 * Math.pow((u - 0.5) * 2, 3));
  return { h, sq: Math.exp(-Math.max(0, t - tp) * 26), u };
}
// the contacts around t in a sorted list (before the first / after the last: the list's own spacing carries on)
function phAround(t, L) {
  if (!L || !L.length) return null;
  const st = L.length > 1 ? L[1] - L[0] : 0.42, en = L.length > 1 ? L[L.length - 1] - L[L.length - 2] : 0.42;
  if (t < L[0]) { const k = Math.ceil((L[0] - t) / st); return [L[0] - k * st, L[0] - (k - 1) * st]; }
  for (let i = 0; i < L.length - 1; i++) if (t < L[i + 1]) return [L[i], L[i + 1]];
  const k = Math.floor((t - L[L.length - 1]) / en);
  return [L[L.length - 1] + k * en, L[L.length - 1] + (k + 1) * en];
}
function phPatAt(t, L) { const a = phAround(t, L); return a ? phBounce(t, a[0], a[1]) : { h: 0.5, sq: 0, u: 0.5 }; }
// the hook's own schedule: a pat on pat0 and every 1 / pat_hz, at any time (negative too)
function phHookPat(tt) {
  const c = TLd.cues, hz = c.pat_hz, p0 = c.pat0;
  const k = Math.floor((tt - p0) * hz), tp = p0 + k / hz;
  return phBounce(tt, tp, tp + 1 / hz);
}

// ---------------------------------------------------------------- where the hands are
// the patting hand: palm on his crown, lifted by h (0..1); tilt = the fingers droop as it rises
function phPatHand(h, o = {}) {
  const lift = PH_LIFT * (o.amp === undefined ? 1 : o.amp) * h;
  const P = [PH_CROWN[0] + (o.dx || 0) + 6 * h, PH_CROWN[1] - lift + (o.dy || 0)];
  const ang = Math.PI - 0.16 - 0.5 * h + (o.ang || 0);   // the fingers lie back over his head, to the screen's left; they droop as the wrist lifts
  return { P, ang, sy: 0.66 - 0.1 * h, s: PH_HAND_S * (1 + 0.04 * h) };
}
// the rubbing hand: palm on his tummy, round the circle at angle th (o.r scales the circle)
function phRubHand(th, o = {}) {
  const r = o.r === undefined ? 1 : o.r;
  const P = [PH_TUM[0] + PH_RUB_R[0] * r * Math.cos(th) + (o.dx || 0), PH_TUM[1] + PH_RUB_R[1] * r * Math.sin(th) + (o.dy || 0)];
  const ang = 0.5 + 0.12 * Math.sin(th) + (o.ang || 0);  // the fingers point across his tummy, a little down
  return { P, ang, sy: 1, s: PH_HAND_S * (1 + (o.near || 0)) };
}
// a pat on his tummy instead (the tangle): the hand comes off toward us and slaps back
function phTumPatHand(h, o = {}) {
  const P = [PH_TUM[0] + 6 * h + (o.dx || 0), PH_TUM[1] - 26 * h + (o.dy || 0)];
  return { P, ang: 0.5 - 0.25 * h, sy: 1, s: PH_HAND_S * (1 + 0.16 * h) };
}
// a circle tried on his head (the tangle): small, and it keeps collapsing into pats
function phHeadRubHand(th, h, o = {}) {
  const P = [PH_CROWN[0] + 30 * Math.cos(th), PH_CROWN[1] - 8 + 10 * Math.sin(th) - PH_LIFT * 0.7 * h];
  return { P, ang: Math.PI - 0.16 - 0.4 * h + 0.15 * Math.sin(th), sy: 0.62, s: PH_HAND_S };
}
// the wrist and the elbow for a hand: the palm's middle sits 30 units past the wrist, along the fingers
function phArm(side, Hd) {
  const d = [Math.cos(Hd.ang), Math.sin(Hd.ang)], k = Hd.s || 1;
  const w = [Hd.P[0] - d[0] * 30 * k, Hd.P[1] - d[1] * 30 * k];
  let e;
  if (side === 'R') e = [150 + 0.25 * (w[0] - 40), -470 + 0.45 * (w[1] + 556)];       // out to the right, up by his ear
  else e = [-112 + 0.3 * (w[0] + 50), -262 + 0.3 * (w[1] + 268)];                      // down by his side, the forearm across his tummy
  return { e, w };
}

// ---------------------------------------------------------------- a hand, from the back (rig units; c already in rig space)
// Hd: {P (the palm's middle), ang (toward the fingertips), sy (foreshortening across), s}; o: {pal, thumb (+1/-1: which
// side the thumb is on), spread (0..1), curl (0..1), squeeze (0..1: a fist round something), blur (0..1)}
function phHand(c, Hd, o = {}) {
  const pal = o.pal || PHPAL, th = o.thumb || 1, sp = o.spread || 0, cu = o.curl || 0;
  c.save(); c.translate(Hd.P[0], Hd.P[1]); c.rotate(Hd.ang); c.scale(Hd.s || 1, (Hd.s || 1) * (Hd.sy || 1) * th);
  // local: +x to the fingertips, +y to the thumb's side; the palm's middle at the origin
  const fingers = [[-12.5, 25, 8.2], [-4.2, 29, 8.8], [4.2, 27.5, 8.6], [12.2, 22, 7.6]];   // [y, length, half width]
  const shapes = [];
  shapes.push((cc) => { cc.beginPath(); cc.ellipse(-2, 0, 21, 18.5, 0, 0, 7); });                                   // the palm
  shapes.push((cc) => { rrect(cc, -34, -13, 22, 26, 11); });                                                           // the wrist
  for (const [y, L, hw] of fingers) {
    const yy = y * (1 + 0.35 * sp), a = (y / 14) * 0.22 * sp, Lc = L * (1 - 0.45 * cu);
    shapes.push((cc) => { cc.save(); cc.translate(12, yy * 0.8); cc.rotate(a); rrect(cc, -4, -hw, Lc + 4, hw * 2, hw); cc.restore(); });
  }
  // the thumb, along the palm on its side
  shapes.push((cc) => { cc.save(); cc.translate(-6, 15); cc.rotate(0.55 + 0.4 * sp); rrect(cc, -2, -7.5, 25 * (1 - 0.3 * cu), 15, 7.5); cc.restore(); });
  // outline: every part a little fatter in the dark skin tone, then the fills on top (one outlined thing)
  c.lineJoin = 'round';
  for (const f of shapes) { f(c); c.lineWidth = 5; c.strokeStyle = pal.skinDk || '#7A3E26'; c.stroke(); }
  for (const f of shapes) { f(c); c.fillStyle = pal.skin; c.fill(); }
  paint(() => {
    // the gaps between the fingers, the knuckles and the nails
    for (let i = 0; i < 3; i++) {
      const y = (fingers[i][0] + fingers[i + 1][0]) / 2 * (1 + 0.35 * sp) * 0.8;
      line(c, 14, y, 14 + 18 * (1 - 0.45 * cu), y + 0.6 * sp * (i - 1), 1.8, rgba(pal.skinDk || '#7A3E26', 0.75));
    }
    for (const [y, L] of fingers) {
      const yy = y * (1 + 0.35 * sp) * 0.8, Lc = L * (1 - 0.45 * cu);
      c.beginPath(); c.arc(12, yy, 3.4, -1.1, 1.1); c.lineWidth = 1.6; c.strokeStyle = rgba(pal.skinSh, 0.9); c.stroke();
      if (cu < 0.5) ellipse(c, 12 + Lc - 4, yy, 3.6, 3.0, rgba('#FFE3D6', 0.85));
    }
  });
  c.restore();
}

// ---------------------------------------------------------------- the patting arm again, in front of his head (rig units)
function phSleeve(c, e, w, pal) {
  line(c, e[0], e[1], w[0], w[1], 40, pal.coatDk);
  line(c, e[0], e[1], w[0], w[1], 36, pal.coat);
  const L = Math.hypot(w[0] - e[0], w[1] - e[1]) || 1, ux = (w[0] - e[0]) / L, uy = (w[1] - e[1]) / L;
  line(c, w[0] - ux * 8, w[1] - uy * 8, w[0] + ux * 2, w[1] + uy * 2, 44, pal.coatSh);
}

// ---------------------------------------------------------------- the trails: what each hand has drawn lately
// a glowing trail through screen points (newest end brightest) and a comet at the end
function phTrail(pts, col, k, w, o = {}) {
  if (k <= 0.01 || pts.length < 2) return;
  const n = pts.length - 1;
  screenSpace();
  for (let i = 1; i <= n; i++) {
    const a = clamp(k) * (0.1 + 0.9 * Math.pow(i / n, 1.5));
    for (const [cc, lw, cl] of [[ctx, w * 1.7, rgba('#0B0B1A', 0.5 * a)], [ctx, w, rgba(col, a)], [gctx, w * 2.4, rgba(col, 0.45 * a)]]) {
      cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
      cc.beginPath(); cc.moveTo(pts[i - 1][0], pts[i - 1][1]); cc.lineTo(pts[i][0], pts[i][1]);
      cc.lineWidth = lw; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
    }
  }
  if (o.noComet) return;
  const Hp = pts[n];
  circle(ctx, Hp[0], Hp[1], w * 0.6, rgba('#FFFFFF', clamp(k)));
  softDot(gctx, Hp[0], Hp[1], w * 3, col, 0.7 * clamp(k));
}
// little impact ticks where a pat lands (screen point, scale s, k = 1 at the contact .. 0)
function phPatTicks(x, y, s, k, col = '#FFFFFF') {
  if (k <= 0.02) return;
  screenSpace();
  const e = 1 - k;
  for (const a of [-2.45, -1.95, -1.2, -0.7]) {
    const r0 = (16 + 26 * e) * s, r1 = (30 + 34 * e) * s;
    line(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, 5 * s, rgba(col, 0.95 * k));
  }
}
// two arrows chasing round (the SWAP), screen space
function phSwapIcon(x, y, r, k, rot) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (const [a0, col] of [[0, PH_GOLD], [Math.PI, PH_CYAN]]) {
    for (const [w, cl] of [[r * 0.34, '#0B0B1A'], [r * 0.2, col]]) {
      ctx.beginPath(); ctx.arc(0, 0, r, a0 + 0.35, a0 + 2.55); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.strokeStyle = cl; ctx.stroke();
    }
    const a = a0 + 2.7, hx = Math.cos(a) * r, hy = Math.sin(a) * r, tx = -Math.sin(a), ty = Math.cos(a);
    ctx.beginPath(); ctx.moveTo(hx + tx * r * 0.42, hy + ty * r * 0.42);
    ctx.lineTo(hx - ty * r * 0.3, hy + tx * r * 0.3); ctx.lineTo(hx + ty * r * 0.3, hy - tx * r * 0.3); ctx.closePath();
    ctx.fillStyle = col; ctx.lineWidth = r * 0.12; ctx.strokeStyle = '#0B0B1A'; ctx.stroke(); ctx.fill();
  }
  ctx.restore();
  softDot(gctx, x, y, r * 1.6, PH_GOLD, 0.35 * clamp(k));
}
