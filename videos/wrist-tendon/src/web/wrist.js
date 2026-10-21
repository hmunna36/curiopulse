// Why Do Some People Have NO Wrist Tendon? Short: his raised hand AND forearm, flat, seen from the front, in HAND units
// (the middle of the wrist is the origin, y down, the fingers point up, the forearm runs down from the wrist to the elbow
// at y = H.fa; the hand is about 175 units tall). Built on vulcan-salute's hand.js (the same hand, the same layout).
//   wtHandPts(H)              where its parts are (hand units, before the flip): knuckles, tips, the thumb, the cord
//   wtHand(c, pal, H, t)      draw it (the context already in hand units)
//   wtGlove(c, G, t)          a surgeon's gloved hand pinching the cord and pulling it out (hand units of the same hand)
//   wtPalmIcon(x, y, s, t, o) a small palm with its wrist, for the row of seven (screen space)
// Canonical layout = the BACK of the hand to us, the thumb on the right: little, ring, middle, index, thumb, left to right.
// H.view: 0 = the palm to us (drawn mirrored: the thumb on the left), 1 = the back to us. H.mirror = -1 flips it all
// (his other hand). H = {view, mirror, opp 0..1 (the thumb bends across to the little finger's tip, the little finger
//   curls over to meet it), flex 0..1 (the wrist bends: the hand tips toward us and looks shorter), cord 0..1 (the tendon
//   stands up in the middle of the wrist), pop 0..1 (marks beside it as it pops up), fa (the forearm's length to the
//   elbow, hand units), glass 0..1 (the forearm and palm turn see-through from the wrist: the bones, the little muscle
//   and its long tendon), ghost 0..1 (inside the glass the muscle is only a dashed outline: deleted), squeeze 0..1
//   (the muscle tightens), pulled {k, at, snap} (the cord is out of the skin, stretched to `at`: the glove has it),
//   gone 0..1 (no cord left in the wrist at all), tremble, rot, s}
// The little finger and the thumb are drawn as jointed strokes (they bend); the other three fingers as before.
'use strict';

const WH = {
  k: { L: [-33, -80], R: [-12, -89], M: [10, -92], I: [32, -88] },
  w: { L: 17, R: 19.5, M: 20.5, I: 19.5 },
  len: { L: 58, R: 74, M: 80, I: 72 },
  rest: { L: -0.075, R: -0.028, M: 0.0, I: 0.03 },
  thumb: { base: [30, -30], a: 0.78, len: 60, w: 23 },
  wristW: 34,
};
const WH_ORD = ['L', 'R', 'M', 'I'];
const WH_SKIN = '#F2B892', WH_SKIN2 = '#F0B48D', WH_LINE = 'rgba(150,76,50,0.85)', WH_NAIL = '#F9D6CC';
const WH_GLASS = '#93507C', WH_TEND = '#FFE7A8', WH_MUSC = '#FF7A8C';
const WH_FCOL = { L: '#F1B691', R: '#F2B993', M: '#F1B790', I: '#F3B894' };
const whDir = (a) => [Math.sin(a), -Math.cos(a)];
const whAdd = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];

function wtHandPts(H = {}, t = 0) {
  const op = clamp(H.opp || 0), e = E.inOutSine(op), tr = H.tremble || 0, P = { tip: {}, kn: {}, a: {}, len: {} };
  for (const [i, k] of WH_ORD.entries()) {
    let a = WH.rest[k] + ((H.spread && H.spread[k]) || 0) + (k === 'R' ? 0.08 * op : k === 'M' ? 0.02 * op : 0);
    if (tr > 0) a += 0.03 * tr * vnoise(t * (23 + 4 * i), 3 + 2 * i);
    const L = WH.len[k] * (k === 'R' ? 1 - 0.06 * op : 1);
    P.kn[k] = WH.k[k]; P.a[k] = a; P.len[k] = L;
    P.tip[k] = whAdd(WH.k[k], whDir(a), L);
  }
  // the little finger: two segments, the outer one curls over toward the thumb
  const aL = P.a.L + 0.22 * op, K = WH.k.L;
  P.pinkyMid = whAdd(K, whDir(aL), 30);
  P.pinkyTip = whAdd(P.pinkyMid, whDir(aL + 1.30 * op), lerp(28, 22, op));
  P.tip.L = P.pinkyTip;
  // the thumb: from its base by the heel of the hand, a knuckle, and the tip, which goes over to the little finger's tip
  const T = WH.thumb, B = [lerp(T.base[0], 25, e), lerp(T.base[1], -33, e)];
  const K0 = whAdd(B, whDir(T.a), 30), T0 = whAdd(B, whDir(T.a), T.len);
  const K1 = whAdd(B, whDir(-0.05), 32), T1 = [P.pinkyTip[0] + 5, P.pinkyTip[1] + 1];
  P.thumbBase = B; P.thumbKnuckle = [lerp(K0[0], K1[0], e), lerp(K0[1], K1[1], e)];
  P.thumbTip = [lerp(T0[0], T1[0], e), lerp(T0[1], T1[1], e)];
  P.wrist = [0, 0];
  P.cordTop = [0, -12]; P.cordMid = [0, 0.16 * (H.fa || 220)]; P.cordBot = [0, 0.48 * (H.fa || 220)];
  return P;
}
function wtFingerPath(c, kn, tip, w) {
  const ux = tip[0] - kn[0], uy = tip[1] - kn[1], L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L;
  const a = [kn[0] - (ux / L) * 16, kn[1] - (uy / L) * 16], wb = w * 0.52, wt = w * 0.44;
  c.moveTo(a[0] - nx * wb, a[1] - ny * wb);
  c.lineTo(tip[0] - nx * wt, tip[1] - ny * wt);
  c.arc(tip[0], tip[1], wt, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, false);
  c.lineTo(a[0] + nx * wb, a[1] + ny * wb);
  c.closePath();
}
function wtPalmPath(c, P) {
  const w = WH.wristW, k = P.kn;
  c.moveTo(-w, 4);
  c.quadraticCurveTo(-w - 8, -44, k.L[0] - 8, k.L[1] + 4);
  c.quadraticCurveTo(k.L[0] - 4, k.L[1] - 12, k.L[0] + 6, k.L[1] - 10);
  c.quadraticCurveTo(k.R[0], k.R[1] - 12, k.M[0] - 2, k.M[1] - 10);
  c.quadraticCurveTo(k.I[0] + 2, k.I[1] - 12, k.I[0] + 10, k.I[1] - 4);
  c.quadraticCurveTo(k.I[0] + 16, k.I[1] + 20, 38, -40);
  c.quadraticCurveTo(w + 4, -14, w, 4);
  c.closePath();
}
// the forearm from the wrist down to the elbow: slim at the wrist, fuller in its upper half (more on the thumb's side),
// and a rounded elbow at the end (it covers the end of the upper arm)
function wtForearmPath(c, fa) {
  const w = WH.wristW - 4, r = 30;
  c.moveTo(-w, -2);
  c.bezierCurveTo(-w - 2, fa * 0.32, -w - 12, fa * 0.56, -r, fa - 6);
  c.arc(0, fa - 6, r, Math.PI, 0, true);
  c.bezierCurveTo(w + 16, fa * 0.52, w + 4, fa * 0.3, w, -2);
  c.closePath();
}
function wtAlong(P, k, u, off = 0) {
  const kn = P.kn[k], tp = k === 'L' ? P.pinkyMid : P.tip[k], uu = k === 'L' ? u * 2 : u;
  const ux = tp[0] - kn[0], uy = tp[1] - kn[1], L = Math.hypot(ux, uy) || 1;
  return [kn[0] + ux * uu + (-uy / L) * off, kn[1] + uy * uu + (ux / L) * off];
}
// a jointed stroke (a bent finger): pts, width w, colour
function wtStroke(c, pts, w, col, cap = 'round') {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
}
// map a point of context c (its current transform) into the glow layer (half size, screen space)
function wtG(c, p) { const m = c.getTransform(); return [(m.a * p[0] + m.c * p[1] + m.e) * 0.5, (m.b * p[0] + m.d * p[1] + m.f) * 0.5]; }
function wtGScale(c) { const m = c.getTransform(); return Math.hypot(m.a, m.b) * 0.5; }
function wtGlowPoly(c, pts, w, col, a) {
  if (a <= 0.01) return;
  const q = pts.map((p) => wtG(c, p)), s = wtGScale(c);
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); poly(gctx, q, w * s, rgba(col, a)); gctx.restore();
}

// ---------------------------------------------------------------- the cord in the wrist (palm side)
// k = how far it stands up: a raised ridge down the middle of the wrist, the skin dipping either side of it, its shaded
// side and its lit edge, fading out into the forearm. Paint (the light stage leaves it as drawn).
function wtCord(c, P, H, k, t) {
  if (k <= 0.01) return;
  const y0 = -16, y1 = P.cordBot[1];
  const hw = (y) => { const u = clamp((y - y0) / (y1 - y0)); return (3.0 + 4.4 * Math.sin(Math.PI * Math.min(1, u * 1.8 + 0.1))) * Math.pow(1 - u, 0.5) * k; };
  const xs = (y) => 0.8 * Math.sin((y - y0) * 0.012);
  const side = (f, a0, a1) => { c.beginPath(); for (let i = 0; i <= 30; i++) { const y = lerp(a0, a1, i / 30); c.lineTo(xs(y) + f(y), y); } };
  paint(() => {
    // the shadow it casts on the far side, and the skin dipping on the near side
    side((y) => hw(y) + 4.2, y0 + 4, y1 * 0.9); c.lineWidth = 6.5; c.lineCap = 'round'; c.strokeStyle = `rgba(150,72,46,${0.38 * k})`; c.stroke();
    side((y) => -(hw(y) + 2.6), y0 + 4, y1 * 0.85); c.lineWidth = 2.8; c.strokeStyle = `rgba(160,84,58,${0.3 * k})`; c.stroke();
    c.beginPath();
    for (let i = 0; i <= 30; i++) { const y = lerp(y0, y1, i / 30); c.lineTo(xs(y) - hw(y), y); }
    for (let i = 30; i >= 0; i--) { const y = lerp(y0, y1, i / 30); c.lineTo(xs(y) + hw(y), y); }
    c.closePath();
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, rgba('#FFE8D6', 0.98 * k)); g.addColorStop(0.55, rgba('#FFE0CA', 0.85 * k)); g.addColorStop(1, 'rgba(255,216,190,0)');
    c.fillStyle = g; c.fill();
    side((y) => hw(y) * 0.95, y0 + 3, y1 * 0.82); c.lineWidth = 2.8; c.strokeStyle = `rgba(150,74,48,${0.9 * k})`; c.stroke();
    side((y) => -hw(y) * 0.4, y0 + 4, y1 * 0.66); c.lineWidth = 1.8; c.strokeStyle = `rgba(255,252,246,${0.9 * k})`; c.stroke();
  });
  // it pops up: little marks either side of it, at the wrist
  const pk = clamp(H.pop || 0);
  if (pk > 0.02) {
    paint(() => {
      for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
        const y = -4 + i * 12, r0 = 11 + 2 * (1 - pk), r1 = r0 + 9 * pk;
        line(c, sd * r0, y, sd * r1, y - 3 + i * 2, 2.6, `rgba(255,255,255,${0.95 * pk})`);
      }
    });
    wtGlowPoly(c, [[0, -6], [0, 14]], 7, '#FFF1D8', 0.25 * pk);
  }
}
// the creases across the wrist (palm side); they bend up over the cord
function wtCreases(c, k) {
  paint(() => {
    for (const [y, a] of [[2, 0.55], [10, 0.42], [17, 0.22]]) {
      c.beginPath();
      for (let i = 0; i <= 16; i++) { const x = lerp(-27, 27, i / 16); c.lineTo(x, y - 2.5 * Math.cos((x / 27) * 1.4) - 3.2 * k * Math.exp(-(x * x) / 30)); }
      c.lineWidth = 1.5; c.lineCap = 'round'; c.strokeStyle = `rgba(170,90,62,${a})`; c.stroke();
    }
  });
}

// ---------------------------------------------------------------- the glass: bones, the little muscle and its long tendon
function wtGlass(c, P, H, gk, t, fa, fl) {
  const R = lerp(0, fa + 230, E.inOutSine(gk)), cx = 0, cy = -6, full = gk >= 0.999;
  const sy = 1 - 0.2 * fl, HS = (p) => [p[0], sy * (p[1] - 2 * fl)];   // the hand part is drawn tipped toward us (wtHand)
  const pinky = [P.kn.L, P.pinkyMid, P.tip.L].map(HS), thumb = [P.thumbBase, P.thumbKnuckle, P.thumbTip].map(HS);
  const body = (cc) => {   // one path: the forearm as it is, the palm and three fingers tipped (a path keeps each point's transform)
    cc.beginPath(); wtForearmPath(cc, fa);
    cc.save(); cc.scale(1, sy); cc.translate(0, -2 * fl);
    wtPalmPath(cc, P); for (const k of ['R', 'M', 'I']) wtFingerPath(cc, P.kn[k], P.tip[k], WH.w[k]);
    cc.restore();
  };
  const fillBody = (col) => { c.fillStyle = col; body(c); c.fill('nonzero'); wtStroke(c, pinky, WH.w.L, col); wtStroke(c, thumb, WH.thumb.w, col); };
  const ghost = clamp(H.ghost || 0), sq = clamp(H.squeeze || 0);
  c.save();
  if (!full) { c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); }
  fillBody(WH_GLASS);
  paint(() => {
    const g = c.createRadialGradient(0, fa * 0.25, 10, 0, fa * 0.25, fa * 0.9);
    g.addColorStop(0, 'rgba(255,190,226,0.34)'); g.addColorStop(1, 'rgba(120,40,90,0.22)');
    c.fillStyle = g; body(c); c.fill('nonzero');
    // the two forearm bones and the wrist's little bones, faint
    for (const [x0, x1, w] of [[-20, -16, 10], [19, 15, 12]]) line(c, x0, fa - 4, x1, 8, w, 'rgba(255,236,246,0.17)');
    for (const [x, y] of [[-14, -6], [0, -9], [14, -6], [-8, -18], [8, -18]]) { const q = HS([x, y]); circle(c, q[0], q[1], 6.5, 'rgba(255,236,246,0.13)'); }
    for (const k of ['R', 'M', 'I']) { const a = HS(wtAlong(P, k, -0.75)), b = HS(wtAlong(P, k, 0.02)); line(c, a[0], a[1], b[0], b[1], 6.5, 'rgba(255,236,246,0.13)'); }
    // the little muscle: a short spindle up by the elbow, and its long tendon down the middle to the palm, where it fans
    const bTop = fa * 0.6, bBot = fa * 0.94, bw = 11 + 3.5 * sq;
    const spindle = (cc) => { cc.beginPath(); cc.moveTo(-2, bTop - 10); cc.bezierCurveTo(-bw - 2, bTop + 18, -bw, bBot - 22, -5, bBot); cc.lineTo(5, bBot); cc.bezierCurveTo(bw, bBot - 22, bw + 2, bTop + 18, 2, bTop - 10); cc.closePath(); };
    const fan0 = HS([0, -24]);
    const tend = [[0, bTop - 4], [0.6, fa * 0.36], [0.2, fa * 0.12], [0, -6], fan0];
    const fan = ['L', 'R', 'M', 'I'].map((k) => HS(wtAlong(P, k, -0.1)));
    if (ghost < 0.99) {
      c.save(); c.globalAlpha = 1 - ghost;
      spindle(c); c.fillStyle = WH_MUSC; c.fill();
      for (let i = 0; i < 5; i++) { const y = lerp(bTop + 6, bBot - 8, i / 4); line(c, -bw * 0.5, y, bw * 0.5, y + 6, 1.2, 'rgba(160,40,70,0.5)'); }
      poly(c, tend, 6.5 + 1.5 * sq, 'rgba(60,20,30,0.55)'); poly(c, tend, 4.6 + 1.2 * sq, WH_TEND);
      c.beginPath(); c.moveTo(fan0[0], fan0[1]); for (const p of fan) c.lineTo(p[0], p[1]); c.closePath(); c.fillStyle = 'rgba(255,231,168,0.22)'; c.fill();
      for (const p of fan) line(c, fan0[0], fan0[1], p[0], p[1], 2.4, 'rgba(255,231,168,0.75)');
      c.restore();
    }
    if (ghost > 0.01) {   // deleted: only a dashed outline where it would be
      c.save(); c.globalAlpha = ghost; c.setLineDash([5, 5]);
      spindle(c); c.lineWidth = 2.2; c.strokeStyle = 'rgba(220,220,235,0.8)'; c.stroke();
      poly(c, tend, 2.2, 'rgba(220,220,235,0.8)');
      c.setLineDash([]); c.restore();
    }
  });
  if (ghost < 0.99) wtGlowPoly(c, [[0, fa * 0.56], [0.6, fa * 0.36], [0.2, fa * 0.12], [0, -6], HS([0, -24])], 9, '#FFD98A', (0.35 + 0.35 * sq) * (1 - ghost) * clamp(gk * 2));
  c.restore();
  if (!full && R > 2) paint(() => {
    c.save(); body(c); c.clip();
    c.beginPath(); c.arc(cx, cy, R, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(255,200,240,0.9)'; c.stroke();
    c.restore();
  });
}

// ---------------------------------------------------------------- the hand and forearm
function wtHand(c, pal, H = {}, t = 0) {
  const P = wtHandPts(H, t), v = clamp(H.view || 0), sx = -Math.cos(Math.PI * v), back = sx >= 0;
  const skin = (pal && pal.skin) || WH_SKIN, s = H.s || 1, fa = H.fa || 220, op = clamp(H.opp || 0), fl = clamp(H.flex || 0);
  const front = !back, cordK = clamp(H.cord || 0) * (1 - clamp(H.gone || 0));
  c.save();
  c.rotate(H.rot || 0);
  c.scale(s * (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx) * (H.mirror || 1), s);
  // the forearm (bare: his sleeves are short)
  c.beginPath(); wtForearmPath(c, fa); c.fillStyle = skin; c.fill();
  paint(() => {
    c.beginPath(); wtForearmPath(c, fa); c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = WH_LINE; c.stroke();
    if (front) {   // the soft inner forearm: a lighter middle, a vein or two
      const g = c.createLinearGradient(-40, 0, 40, 0);
      g.addColorStop(0, 'rgba(255,214,190,0)'); g.addColorStop(0.5, 'rgba(255,222,200,0.32)'); g.addColorStop(1, 'rgba(255,214,190,0)');
      c.beginPath(); wtForearmPath(c, fa); c.fillStyle = g; c.fill();
      c.beginPath(); c.moveTo(-15, fa * 0.92); c.bezierCurveTo(-19, fa * 0.6, -12, fa * 0.36, -18, 22); c.lineWidth = 2.2; c.strokeStyle = 'rgba(120,130,190,0.2)'; c.stroke();
      c.beginPath(); c.moveTo(18, fa * 0.9); c.bezierCurveTo(22, fa * 0.55, 13, fa * 0.3, 21, 26); c.lineWidth = 1.8; c.strokeStyle = 'rgba(120,130,190,0.16)'; c.stroke();
    }
  });
  if (front) { wtCreases(c, cordK); wtCord(c, P, H, cordK, t); }
  // the hand, above the wrist: it tips toward us as the wrist bends, so it looks shorter
  c.save(); c.scale(1, 1 - 0.2 * fl); c.translate(0, -2 * fl);
  const pinky = [P.kn.L, P.pinkyMid, P.tip.L], thumbPts = [P.thumbBase, P.thumbKnuckle, P.thumbTip];
  const thumb = () => {   // its outline only from halfway up its first bone, so its base melts into the heel of the hand
    const p0 = [lerp(thumbPts[0][0], thumbPts[1][0], 0.45), lerp(thumbPts[0][1], thumbPts[1][1], 0.45)];
    wtStroke(c, [p0, thumbPts[1], thumbPts[2]], WH.thumb.w + 4.4, WH_LINE);
    wtStroke(c, thumbPts, WH.thumb.w, WH_SKIN2);
    paint(() => {
      const kk = thumbPts[1], d = [thumbPts[2][0] - kk[0], thumbPts[2][1] - kk[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L];
      line(c, kk[0] - n[0] * 7, kk[1] - n[1] * 7, kk[0] + n[0] * 7, kk[1] + n[1] * 7, 1.5, 'rgba(160,82,56,0.5)');   // the knuckle's crease
      const tp = thumbPts[2], q = [tp[0] - (d[0] / L) * 6, tp[1] - (d[1] / L) * 6];
      if (front) ellipse(c, q[0], q[1], 6, 8, 'rgba(255,214,190,0.6)', Math.atan2(d[0], -d[1]));
      else ellipse(c, q[0], q[1], 6.5, 8.5, WH_NAIL, Math.atan2(d[0], -d[1]));
    });
  };
  if (back) thumb();                                                     // the back to us: the thumb is behind the palm's edge
  // three straight fingers
  for (const k of ['R', 'M', 'I']) { c.beginPath(); wtFingerPath(c, P.kn[k], P.tip[k], WH.w[k]); c.fillStyle = WH_FCOL[k]; c.fill(); }
  paint(() => {
    c.lineJoin = 'round';
    for (const k of ['R', 'M', 'I']) {
      c.beginPath(); wtFingerPath(c, P.kn[k], P.tip[k], WH.w[k]); c.lineWidth = 2.2; c.strokeStyle = WH_LINE; c.stroke();
      for (const u of [0.36, 0.67]) {
        const a = wtAlong(P, k, u, -WH.w[k] * 0.3), b = wtAlong(P, k, u, WH.w[k] * 0.3), m = wtAlong(P, k, u + (back ? -0.025 : 0.02), 0);
        c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]); c.lineWidth = 1.4; c.lineCap = 'round'; c.strokeStyle = 'rgba(160,82,56,0.55)'; c.stroke();
      }
      const n = wtAlong(P, k, back ? 0.84 : 0.86);
      if (back) ellipse(c, n[0], n[1], WH.w[k] * 0.3, WH.w[k] * 0.42, WH_NAIL, P.a[k]);
      else ellipse(c, n[0], n[1], WH.w[k] * 0.26, WH.w[k] * 0.36, 'rgba(255,214,190,0.55)', P.a[k]);
    }
  });
  // the little finger's outline, then the palm over its base, then the finger itself
  wtStroke(c, pinky, WH.w.L + 4.4, WH_LINE);
  c.beginPath(); wtPalmPath(c, P); c.fillStyle = skin; c.fill();
  paint(() => {
    c.beginPath(); wtPalmPath(c, P); c.lineWidth = 2.2; c.strokeStyle = WH_LINE; c.stroke();
    if (front) {   // palm lines
      c.lineCap = 'round'; c.strokeStyle = 'rgba(170,92,64,0.5)'; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-30, -62); c.quadraticCurveTo(-4, -70, 26, -58); c.stroke();
      c.beginPath(); c.moveTo(-28, -46); c.quadraticCurveTo(0, -52, 22, -40); c.stroke();
      c.beginPath(); c.moveTo(24, -46); c.quadraticCurveTo(2, -30, 8, -2); c.stroke();
    }
  });
  wtStroke(c, pinky, WH.w.L, WH_FCOL.L);
  paint(() => {
    const m = P.pinkyMid, d = [P.tip.L[0] - m[0], P.tip.L[1] - m[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L];
    line(c, m[0] - n[0] * 6, m[1] - n[1] * 6, m[0] + n[0] * 6, m[1] + n[1] * 6, 1.4, 'rgba(160,82,56,0.55)');
    const q = [P.tip.L[0] - (d[0] / L) * 4, P.tip.L[1] - (d[1] / L) * 4];
    if (front) ellipse(c, q[0], q[1], 4.6, 6, 'rgba(255,214,190,0.55)', Math.atan2(d[0], -d[1]));
    else ellipse(c, q[0], q[1], 5, 6.5, WH_NAIL, Math.atan2(d[0], -d[1]));
  });
  if (front) thumb();                                                    // the palm to us: the thumb comes across in front of it
  if (op > 0.85) paint(() => {                                           // the two tips pressed together
    const mpt = [(P.thumbTip[0] + P.tip.L[0]) / 2, (P.thumbTip[1] + P.tip.L[1]) / 2];
    c.beginPath(); c.arc(mpt[0], mpt[1], 7, -2.4, -0.7); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,0.6)'; c.stroke();
  });
  c.restore();
  // the glass (the palm and the forearm turn see-through from the wrist)
  const gk = clamp(H.glass || 0);
  if (gk > 0.01 && front) wtGlass(c, P, H, gk, t, fa, fl);
  // the cord pulled out of the skin by the glove: a rubbery noodle from the wrist to the pinch
  const pl = H.pulled;
  if (pl && (pl.k || 0) > 0.01) {
    const at = pl.at, a0 = [0, -10], a1 = [0, P.cordBot[1] * 0.8], k = clamp(pl.k);
    const snapped = clamp(pl.snap || 0);
    const pts = snapped < 0.5 ? [a0, [lerp(a0[0], at[0], 0.55), lerp(a0[1], at[1], 0.35)], at, [lerp(a1[0], at[0], 0.55), lerp(a1[1], at[1], 0.35)], a1]
      : [[at[0] - 4, at[1] + 2], [at[0] - 6 + 5 * Math.sin(t * 30), at[1] + 34], [at[0] - 2 + 8 * Math.sin(t * 26), at[1] + 70]];
    paint(() => { wtStroke(c, pts, 10, 'rgba(90,30,30,0.55)'); wtStroke(c, pts, 6.4, '#FFE7C6'); wtStroke(c, pts, 2, 'rgba(255,255,255,0.7)'); });
    wtGlowPoly(c, pts, 8, '#FFD98A', 0.4 * k);
  }
  c.restore();
  return P;
}

// a surgeon's gloved hand (blue), pinching at G.at (hand units of the hand it works on): the thumb and the index finger
// meet at the origin, the other three fingers fan out behind; the cuff is down to the upper right
function wtGlove(c, G, t) {
  if (!G || (G.k || 0) <= 0.01) return;
  const at = G.at, k = clamp(G.k), s = G.s || 1;
  c.save(); c.translate(at[0], at[1]); c.rotate(G.rot === undefined ? -0.55 : G.rot); c.scale(s, s);
  const blue = '#5AAAF0', blueSh = '#3C82CC', edge = 'rgba(16,44,96,0.9)';
  const stroke = (pts, w, col) => wtStroke(c, pts, w, col);
  // the palm and wrist behind the pinch (to the upper right of it)
  const palmPts = [[30, 22], [58, 50]], cuff = [[64, 58], [96, 92]];
  stroke(cuff, 40, edge); stroke(palmPts, 48, edge);
  for (const [i, f] of [[[58, 20], [86, 4]], [[60, 34], [92, 26]], [[58, 46], [86, 50]]].entries()) { stroke(f, 15 + 3.4, edge); void i; }
  stroke([[10, -14], [-1, -2]], 15 + 3.4, edge); stroke([[26, 30], [6, 12], [1, 3]], 17 + 3.4, edge);
  stroke(cuff, 36, '#9ED0FA'); stroke(palmPts, 44, blue);
  for (const f of [[[58, 20], [86, 4]], [[60, 34], [92, 26]], [[58, 46], [86, 50]]]) stroke(f, 15, blueSh);
  stroke([[34, 10], [10, -14], [-1, -2]], 15, blue);          // the index finger, curled over to the pinch
  stroke([[26, 30], [6, 12], [1, 3]], 17, blue);             // the thumb, under it
  paint(() => {
    circle(c, 0, 0, 3.2 * k, 'rgba(255,255,255,0.75)');
    line(c, 66, 70, 92, 96, 3, 'rgba(255,255,255,0.55)');
    line(c, 20, 20, 44, 36, 2, 'rgba(255,255,255,0.35)');
  });
  c.restore();
}

// a small palm-up hand with its wrist (screen space), for the row of seven: o = {cord 0..1, deleted 0..1, k pop-in}
function wtPalmIcon(x, y, s, t, o = {}) {
  const k = o.k === undefined ? 1 : clamp(o.k);
  if (k <= 0.01) return;
  const q = E.outBack(k, 1.8) * s;
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  wtHand(ctx, PAL, { view: 0, opp: 1, flex: 0.8, cord: o.cord === undefined ? 1 : o.cord, fa: 120, glass: 0 }, t);
  ctx.restore();
  const del = clamp(o.deleted || 0);
  if (del > 0.01) {   // the deleted one: a red X over its wrist
    ctx.save(); ctx.translate(x, y + 30 * q); ctx.globalAlpha = del;
    ctx.lineCap = 'round'; ctx.lineWidth = 9 * q; ctx.strokeStyle = '#FF5A6E';
    ctx.beginPath(); ctx.moveTo(-22 * q, -22 * q); ctx.lineTo(22 * q, 22 * q); ctx.moveTo(22 * q, -22 * q); ctx.lineTo(-22 * q, 22 * q); ctx.stroke();
    ctx.restore();
  }
}
