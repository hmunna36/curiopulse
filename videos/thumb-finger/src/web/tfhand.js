// Does Your Finger Move When You Bend Your THUMB? Short: his raised hand AND forearm, palm to us, in HAND units (the middle
// of the wrist is the origin, y down, the fingers point up, the forearm runs down to the elbow at y = D.fa). Built on
// wrist-tendon's wrist.js (vulcan-salute's hand), with the thumb that bends across the palm and the pointer whose tip curls.
//   wtHandPts(D)              where its parts are (hand units, before the flip): knuckles, tips, the index's bones, the thumb's
//   wtHand(c, pal, D, t)      draw it (the context already in hand units); returns the points
// Canonical layout = the BACK of the hand to us, the thumb on the right: little, ring, middle, index, thumb, left to right.
// D.view: 0 = the palm to us (drawn mirrored: the thumb on the left), 1 = the back to us. D.mirror = -1 flips it all (his
// other hand). D = {view, mirror,
//   tb 0..1 (the thumb bends all the way across the palm), curl 0..1 (the pointer's tip curls: foreshortened, leaning a
//   little to the thumb's side), face 0..1 (the pointer's tip opens a face: the sidekick) with mood ('happy' | 'love' |
//   'whee' | 'sad' | 'shrug') and look (-1..1), wave 0..1 (the pointer wags),
//   glass 0..1 (the palm and forearm turn see-through from the wrist: the two strings and their muscles), pull 0..1 (the
//   thumb's muscle squeezes and its string slides toward the elbow), strap 0..1 (the strap that ties the strings), ghost
//   0..1 (the strap is only a dashed outline: no strap), strapGlow 0..1, fork 0..1 (the gorilla: ONE string that splits
//   to the pointer and the thumb), tremble, rot, s, fa (the forearm's length to the elbow, hand units)}
// pal: the hero's palette (skin), or a gorilla's ({skin, line, pad, fcol, glass})
'use strict';

const WH = {
  k: { L: [-33, -80], R: [-12, -89], M: [10, -92], I: [32, -88] },
  w: { L: 17, R: 19.5, M: 20.5, I: 19.5 },
  len: { L: 58, R: 74, M: 80, I: 72 },
  rest: { L: -0.075, R: -0.028, M: 0.0, I: 0.03 },
  wristW: 34,
};
const TF_IDX = [31, 22, 19];                                   // the pointer's three bones
const TF_TH = { base: [30, -30], l: [24, 22, 21], rest: [0.80, 0.84, 0.88], bent: [-0.22, -0.98, -1.92], w: 23 };
const WH_ORD = ['L', 'R', 'M', 'I'];
const WH_SKIN = '#F2B892', WH_SKIN2 = '#F0B48D', WH_LINE = 'rgba(150,76,50,0.85)', WH_NAIL = '#F9D6CC';
const WH_GLASS = '#93507C';
const TF_TH_COL = '#FF9A3C', TF_IX_COL = '#7FE9FF', TF_STRAP = '#FFD447';
const WH_FCOL = { L: '#F1B691', R: '#F2B993', M: '#F1B790', I: '#F3B894' };
const whDir = (a) => [Math.sin(a), -Math.cos(a)];
const whAdd = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];

function wtHandPts(D = {}, t = 0) {
  const tb = E.inOutSine(clamp(D.tb || 0)), cu = clamp(D.curl || 0), tr = D.tremble || 0, P = { tip: {}, kn: {}, a: {}, len: {} };
  for (const [i, k] of WH_ORD.entries()) {
    let a = WH.rest[k] + ((D.spread && D.spread[k]) || 0);
    if (tr > 0) a += 0.03 * tr * vnoise(t * (23 + 4 * i), 3 + 2 * i);
    P.kn[k] = WH.k[k]; P.a[k] = a; P.len[k] = WH.len[k];
    P.tip[k] = whAdd(WH.k[k], whDir(a), WH.len[k]);
  }
  // the little finger: two straight segments (a jointed stroke, as in wrist.js)
  P.pinkyMid = whAdd(P.kn.L, whDir(P.a.L), 30);
  P.pinkyTip = whAdd(P.pinkyMid, whDir(P.a.L), 28);
  P.tip.L = P.pinkyTip;
  // the pointer: three bones; the curl bends the tip joint most, toward the thumb's side, and foreshortens it (it folds
  // toward us); a wag (wave) swings the whole finger a little
  const wv = (D.wave || 0) * 0.16 * Math.sin(t * 14);
  // (it leans in toward the middle finger, the way a bending finger heads for the palm, and its tip folds toward us)
  const a1 = P.a.I - 0.04 * cu + wv, a2 = a1 - 0.42 * cu, a3 = a2 - 1.18 * cu;
  P.idx = [P.kn.I];
  P.idx.push(whAdd(P.idx[0], whDir(a1), TF_IDX[0] * (1 - 0.04 * cu)));
  P.idx.push(whAdd(P.idx[1], whDir(a2), TF_IDX[1] * (1 - 0.16 * cu)));
  P.idx.push(whAdd(P.idx[2], whDir(a3), TF_IDX[2] * (1 - 0.48 * cu)));
  P.tip.I = P.idx[3]; P.idxA = [a1, a2, a3];
  // the thumb: base, its first joint (by the palm), its last joint, the tip; it folds across the palm as tb goes 0 -> 1
  const T = TF_TH, B = [lerp(T.base[0], 28, tb), lerp(T.base[1], -31, tb)];
  const ang = T.rest.map((r, i) => lerp(r, T.bent[i], tb));
  P.th = [B];
  for (let i = 0; i < 3; i++) P.th.push(whAdd(P.th[i], whDir(ang[i]), T.l[i]));
  P.thA = ang; P.thumbBase = B; P.thumbKnuckle = P.th[1]; P.thumbTip = P.th[3];
  P.wrist = [0, 0];
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
function wtStroke(c, pts, w, col, cap = 'round') {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
}
function wtG(c, p) { const m = c.getTransform(); return [(m.a * p[0] + m.c * p[1] + m.e) * 0.5, (m.b * p[0] + m.d * p[1] + m.f) * 0.5]; }
function wtGScale(c) { const m = c.getTransform(); return Math.hypot(m.a, m.b) * 0.5; }
function wtGlowPoly(c, pts, w, col, a) {
  if (a <= 0.01) return;
  const q = pts.map((p) => wtG(c, p)), s = wtGScale(c);
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); poly(gctx, q, w * s, rgba(col, a)); gctx.restore();
}
function wtGlowDot(c, p, r, col, a) {
  if (a <= 0.01) return;
  const q = wtG(c, p), s = wtGScale(c);
  softDot(gctx, q[0], q[1], r * s * 2, col, a);
}
// the creases across the wrist (palm side)
function wtCreases(c) {
  paint(() => {
    for (const [y, a] of [[2, 0.55], [10, 0.42], [17, 0.22]]) {
      c.beginPath();
      for (let i = 0; i <= 16; i++) { const x = lerp(-27, 27, i / 16); c.lineTo(x, y - 2.5 * Math.cos((x / 27) * 1.4)); }
      c.lineWidth = 1.5; c.lineCap = 'round'; c.strokeStyle = `rgba(170,90,62,${a})`; c.stroke();
    }
  });
}

// ---------------------------------------------------------------- polylines: arclength, a point at a length, a sub-run
function tfLens(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; }
function tfAt(pts, L, s) {
  s = clamp(s, 0, L[L.length - 1]);
  for (let i = 1; i < pts.length; i++) if (s <= L[i] || i === pts.length - 1) {
    const u = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
  }
  return pts[pts.length - 1];
}
function tfRun(pts, L, s0, s1, n = 24) { const o = []; for (let i = 0; i <= n; i++) o.push(tfAt(pts, L, lerp(s0, s1, i / n))); return o; }

// the two strings (the tendons that bend the thumb and the pointer), from their muscles by the elbow to the fingertips.
// Each runs from the muscle end (index 0) to the tip (last). Hand units, canonical.
function tfStrings(P, fa) {
  const th = P.th, ix = P.idx;
  const thumb = [[19, fa * 0.40], [18, fa * 0.24], [14, fa * 0.10], [10, 0], [18, -16], th[0], th[1], th[2],
    [lerp(th[2][0], th[3][0], 0.78), lerp(th[2][1], th[3][1], 0.78)]];
  const point = [[-7, fa * 0.36], [-4, fa * 0.21], [0, fa * 0.08], [3, 0], [13, -36], [27, -66], ix[0], ix[1], ix[2],
    [lerp(ix[2][0], ix[3][0], 0.75), lerp(ix[2][1], ix[3][1], 0.75)]];
  return { thumb, point, strapY: fa * 0.22 };
}
// the x of a string at height y (on its forearm run)
function tfXAt(pts, y) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if ((y - a[1]) * (y - b[1]) <= 0 && a[1] !== b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
  }
  return pts[0][0];
}
// a muscle: a spindle between y0 and y1 at x, width w (fat when it squeezes), its tendon leaving from the top
function tfMuscle(c, x, y0, y1, w, col, sq) {
  const ww = w * (1 + 0.35 * sq), sh = (y1 - y0) * 0.1 * sq;   // it shortens and fattens
  const a = y0 + sh, b = y1 - sh * 0.3;
  c.beginPath(); c.moveTo(x, a - 8);
  c.bezierCurveTo(x - ww, a + (b - a) * 0.25, x - ww * 0.9, b - (b - a) * 0.2, x - 3, b);
  c.lineTo(x + 3, b);
  c.bezierCurveTo(x + ww * 0.9, b - (b - a) * 0.2, x + ww, a + (b - a) * 0.25, x, a - 8);
  c.closePath(); c.fillStyle = col; c.fill();
  for (let i = 0; i < 5; i++) { const y = lerp(a + 8, b - 8, i / 4); line(c, x - ww * 0.45, y, x + ww * 0.45, y + 5, 1.2, 'rgba(120,30,60,0.45)'); }
  return [x, a - 6];
}

// ---------------------------------------------------------------- the glass: bones, two muscles, two strings, the strap
function tfGlass(c, P, D, gk, t, fa, pal) {
  const R = lerp(0, fa + 240, E.inOutSine(gk)), cx = 0, cy = -10, full = gk >= 0.999;
  const body = (cc) => {
    cc.beginPath(); wtForearmPath(cc, fa); wtPalmPath(cc, P);
    for (const k of ['R', 'M']) wtFingerPath(cc, P.kn[k], P.tip[k], WH.w[k]);
  };
  const glassCol = (pal && pal.glass) || WH_GLASS;
  const fillBody = (col) => {
    c.fillStyle = col; body(c); c.fill('nonzero');
    wtStroke(c, [P.kn.L, P.pinkyMid, P.tip.L], WH.w.L, col); wtStroke(c, P.idx, WH.w.I, col); wtStroke(c, P.th, TF_TH.w, col);
  };
  const S = tfStrings(P, fa), fork = clamp(D.fork || 0);
  const pull = clamp(D.pull || 0), strapK = clamp(D.strap || 0) * (1 - fork), ghost = clamp(D.ghost || 0);
  const tied = strapK * (1 - ghost);
  // the pointer's string slides with the thumb's when they are tied (D.pullI overrides: the strap takes up its slack first)
  const pullI = D.pullI === undefined ? pull * (D.link === undefined ? tied : D.link) : clamp(D.pullI);
  c.save();
  if (!full) { c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); }
  fillBody(glassCol);
  const out = {};
  paint(() => {
    const g = c.createRadialGradient(0, fa * 0.25, 10, 0, fa * 0.25, fa * 0.9);
    g.addColorStop(0, 'rgba(255,190,226,0.30)'); g.addColorStop(1, 'rgba(120,40,90,0.22)');
    c.fillStyle = g; body(c); c.fill('nonzero');
    // the forearm's two bones and the wrist's little bones, faint
    for (const [x0, x1, w] of [[-20, -16, 10], [19, 15, 12]]) line(c, x0, fa - 4, x1, 8, w, 'rgba(255,236,246,0.14)');
    for (const [x, y] of [[-14, -6], [0, -9], [14, -6], [-8, -18], [8, -18]]) circle(c, x, y, 6.5, 'rgba(255,236,246,0.11)');
    // the muscles by the elbow: the thumb's (orange-red, on the thumb's side) and the pointer's (pink)
    const sqT = pull, sqI = fork > 0.5 ? pull : pullI;
    if (fork < 0.99) {
      c.save(); c.globalAlpha = 1 - fork;
      tfMuscle(c, 19, fa * 0.42, fa * 0.84, 12, '#FF7A5C', sqT);
      c.restore();
    }
    tfMuscle(c, fork > 0.5 ? 4 : -7, fa * 0.38, fa * 0.88, 13, '#FF7A9C', sqI);
    // the strings: dark edge, colour, a fine bright core; beads that slide toward the elbow when pulled
    const drawString = (pts, col, slide, w, s0f = 0) => {
      const L = tfLens(pts), tot = L[L.length - 1], run = tfRun(pts, L, s0f * tot, tot, 40);
      poly(c, run, w + 3.2, 'rgba(40,10,24,0.7)'); poly(c, run, w, col); poly(c, run, w * 0.2, 'rgba(255,255,255,0.55)');
      const step = 13, off = (-slide * 16) % step;
      for (let s = s0f * tot + ((off + step) % step); s < tot - 4; s += step) { const q = tfAt(pts, L, s); circle(c, q[0], q[1], w * 0.36, 'rgba(255,255,255,0.85)'); }
      return { L, tot };
    };
    if (fork < 0.5) {
      drawString(S.thumb, TF_TH_COL, pull, 6.4);
      drawString(S.point, TF_IX_COL, pullI, 6.2);
      out.thumbS = S.thumb; out.pointS = S.point;
    } else {
      // the gorilla: one string from one muscle; it splits in the palm: one branch to the pointer, one to the thumb
      const split = [14, -40];
      const trunk = [[4, fa * 0.36], [4, fa * 0.2], [5, fa * 0.06], [6, 0], split];
      const toPtr = [split, [27, -66], P.idx[0], P.idx[1], P.idx[2], [lerp(P.idx[2][0], P.idx[3][0], 0.75), lerp(P.idx[2][1], P.idx[3][1], 0.75)]];
      const toTh = [split, [24, -34], P.th[0], P.th[1], P.th[2], [lerp(P.th[2][0], P.th[3][0], 0.78), lerp(P.th[2][1], P.th[3][1], 0.78)]];
      const fk = clamp((fork - 0.5) * 2);
      drawString(trunk, TF_IX_COL, pull, 5.6);
      drawString(toPtr, TF_IX_COL, pull, 4.6);
      if (fk > 0.01) {
        const L = tfLens(toTh), tot = L[L.length - 1], run = tfRun(toTh, L, 0, tot * fk, 30);
        poly(c, run, 7.2, 'rgba(50,16,30,0.55)'); poly(c, run, 4.6, TF_TH_COL); poly(c, run, 1.5, 'rgba(255,255,255,0.75)');
      }
      circle(c, split[0], split[1], 5.5, '#FFFFFF');
      out.trunk = trunk; out.toPtr = toPtr; out.toTh = toTh; out.split = split;
    }
    // the strap: a little band across the two strings, just above the wrist, with a loop round each
    if (fork < 0.5 && (strapK > 0.01 || ghost > 0.01)) {
      const y = S.strapY, sl = pull * 16 * 0.55;
      const xa = tfXAt(S.thumb, y) , xb = tfXAt(S.point, y);
      const ya = y + sl, yb = y + pullI * 16 * 0.55;           // the ends ride with their strings
      out.strapA = [xa, ya]; out.strapB = [xb, yb]; out.strapMid = [(xa + xb) / 2, (ya + yb) / 2];
      if (ghost < 0.99) {
        c.save(); c.globalAlpha = strapK * (1 - ghost);
        const gl = clamp(D.strapGlow || 0);
        // a chunky little belt: dark edge, yellow band, a loop round each string, a buckle in the middle
        line(c, xa, ya, xb, yb, 13, 'rgba(70,40,0,0.85)');
        line(c, xa, ya, xb, yb, 9.5, gl > 0.3 ? '#FFF3A8' : TF_STRAP);
        line(c, xa, ya - 2.4, xb, yb - 2.4, 1.6, 'rgba(255,255,255,0.7)');
        for (const [x, yy] of [[xa, ya], [xb, yb]]) { c.beginPath(); c.ellipse(x, yy, 7.4, 6.6, 0, 0, 7); c.lineWidth = 3.4; c.strokeStyle = '#C8920E'; c.stroke(); }
        const bm = [lerp(xa, xb, 0.5), lerp(ya, yb, 0.5)];
        c.save(); c.translate(bm[0], bm[1]); c.rotate(Math.atan2(yb - ya, xb - xa));
        c.lineWidth = 2.2; c.strokeStyle = '#7A5200'; c.strokeRect(-3.6, -6.4, 7.2, 12.8); line(c, 0, -6.4, 0, 6.4, 1.6, '#7A5200');
        c.restore();
        c.restore();
      }
      if (ghost > 0.01) {
        c.save(); c.globalAlpha = ghost * Math.max(strapK, 0.6); c.setLineDash([3.5, 3]);
        c.beginPath(); c.moveTo(xa, ya - 4); c.lineTo(xb, yb - 4); c.lineTo(xb, yb + 4); c.lineTo(xa, ya + 4); c.closePath();
        c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,0.85)'; c.stroke(); c.setLineDash([]);
        c.restore();
      }
    }
  });
  // the glow of the strings and the strap (only the glow layer blooms)
  const ga = clamp(gk * 2);
  if (fork < 0.5) {
    wtGlowPoly(c, S.thumb, 9, TF_TH_COL, (0.20 + 0.25 * pull) * ga);
    wtGlowPoly(c, S.point, 9, TF_IX_COL, (0.18 + 0.25 * pullI) * ga);
    if (out.strapMid && strapK * (1 - ghost) > 0.01) wtGlowDot(c, out.strapMid, 16, TF_STRAP, (0.35 + 0.55 * clamp(D.strapGlow || 0)) * strapK * (1 - ghost) * ga);
  } else if (out.trunk) {
    wtGlowPoly(c, out.trunk, 9, TF_IX_COL, 0.4 * ga); wtGlowPoly(c, out.toPtr, 8, TF_IX_COL, 0.35 * ga);
    if (fork > 0.6) wtGlowPoly(c, out.toTh, 8, TF_TH_COL, 0.4 * ga * clamp((fork - 0.5) * 2));
    wtGlowDot(c, out.split, 12, '#FFFFFF', 0.4 * ga);
  }
  c.restore();
  if (!full && R > 2) paint(() => {
    c.save(); body(c); c.clip();
    c.beginPath(); c.arc(cx, cy, R, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(255,200,240,0.9)'; c.stroke();
    c.restore();
  });
  return out;
}

// ---------------------------------------------------------------- the sidekick: a face on the pointer's tip (paint)
function tfFace(c, P, D, t, front) {
  const k = clamp(D.face || 0);
  if (k <= 0.01) return;
  const a = P.idx[2], b = P.idx[3], d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]) || 1;
  const m = [lerp(a[0], b[0], 0.46), lerp(a[1], b[1], 0.46)], ang = Math.atan2(d[0], -d[1]);
  const mood = D.mood || 'happy', s = E.outBack(k, 2.2) * 1.0, look = D.look || 0;
  paint(() => {
    c.save(); c.translate(m[0], m[1]); c.rotate(ang);
    if (!front) c.scale(-1, 1);
    c.scale(s, s);
    const bl = clamp(D.blink || 0);
    for (const ex of [-1, 1]) {
      const x = ex * 4.6, y = -1.5;
      if (mood === 'whee' || bl > 0.9) {   // happy squints
        c.beginPath(); c.arc(x, y + 1.2, 2.6, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 1.3; c.strokeStyle = '#2A1410'; c.stroke();
      } else {
        ellipse(c, x, y, 3.3, mood === 'sad' ? 3.0 : 3.9, '#FFFFFF');
        c.beginPath(); c.ellipse(x, y, 3.3, mood === 'sad' ? 3.0 : 3.9, 0, 0, 7); c.lineWidth = 0.8; c.strokeStyle = 'rgba(60,20,10,0.8)'; c.stroke();
        circle(c, x + 1.3 * look, y + 0.6, 1.75, '#1A0E0A');
        circle(c, x + 1.3 * look + 0.6, y - 0.2, 0.55, '#FFFFFF');
        if (mood === 'sad') line(c, x - 2.6, y - 4.6 + ex * 0.9, x + 2.6, y - 4.6 - ex * 0.9, 1.0, '#5A2A18');
      }
    }
    // the mouth
    c.beginPath();
    if (mood === 'sad') { c.arc(0, 6.4, 2.8, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 1.2; c.strokeStyle = '#4A1A10'; c.stroke(); }
    else if (mood === 'whee' || mood === 'love') { c.moveTo(-3.2, 3.2); c.quadraticCurveTo(0, 8.6, 3.2, 3.2); c.closePath(); c.fillStyle = '#7A2016'; c.fill(); }
    else { c.arc(0, 3.0, 3.1, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 1.3; c.strokeStyle = '#4A1A10'; c.stroke(); }
    // cheeks
    if (mood !== 'sad') for (const ex of [-1, 1]) ellipse(c, ex * 6.6, 3.0, 1.9, 1.2, 'rgba(255,110,120,0.45)');
    c.restore();
  });
}

// ---------------------------------------------------------------- the hand and forearm
function wtHand(c, pal, D = {}, t = 0) {
  const P = wtHandPts(D, t), v = clamp(D.view || 0), sx = -Math.cos(Math.PI * v), back = sx >= 0;
  const skin = (pal && (pal.handSkin || pal.skin)) || WH_SKIN, s = D.s || 1, fa = D.fa || 220;
  const lineCol = (pal && pal.handLine) || WH_LINE, fcol = (k) => (pal && pal.handSkin) ? pal.handSkin : WH_FCOL[k];
  const pad = (pal && pal.handPad) || 'rgba(255,214,190,0.55)', crease = (pal && pal.handCrease) || 'rgba(160,82,56,0.55)';
  const front = !back;
  c.save();
  c.rotate(D.rot || 0);
  c.scale(s * (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx) * (D.mirror || 1), s);
  // the forearm (bare)
  c.beginPath(); wtForearmPath(c, fa); c.fillStyle = skin; c.fill();
  paint(() => {
    c.beginPath(); wtForearmPath(c, fa); c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = lineCol; c.stroke();
    if (front && !(pal && pal.handSkin)) {   // the soft inner forearm: a lighter middle, a vein or two
      const g = c.createLinearGradient(-40, 0, 40, 0);
      g.addColorStop(0, 'rgba(255,214,190,0)'); g.addColorStop(0.5, 'rgba(255,222,200,0.32)'); g.addColorStop(1, 'rgba(255,214,190,0)');
      c.beginPath(); wtForearmPath(c, fa); c.fillStyle = g; c.fill();
      c.beginPath(); c.moveTo(-15, fa * 0.92); c.bezierCurveTo(-19, fa * 0.6, -12, fa * 0.36, -18, 22); c.lineWidth = 2.2; c.strokeStyle = 'rgba(120,130,190,0.2)'; c.stroke();
      c.beginPath(); c.moveTo(18, fa * 0.9); c.bezierCurveTo(22, fa * 0.55, 13, fa * 0.3, 21, 26); c.lineWidth = 1.8; c.strokeStyle = 'rgba(120,130,190,0.16)'; c.stroke();
    }
    if (pal && pal.fur) {   // a gorilla: fur on the forearm (short strokes along it)
      for (let i = 0; i < 46; i++) {
        const r = mulberry32(300 + i), y = lerp(fa * 0.08, fa * 0.96, r()), xw = (WH.wristW - 2) + 10 * (y / fa), x = lerp(-xw, xw, r());
        line(c, x, y, x + (r() - 0.5) * 6, y - 7 - 5 * r(), 1.6, pal.fur);
      }
    }
  });
  if (front) wtCreases(c);
  const pinky = [P.kn.L, P.pinkyMid, P.tip.L];
  const thumb = () => {   // its outline only from halfway up its first bone, so its base melts into the heel of the hand
    const p0 = [lerp(P.th[0][0], P.th[1][0], 0.45), lerp(P.th[0][1], P.th[1][1], 0.45)];
    wtStroke(c, [p0, P.th[1], P.th[2], P.th[3]], TF_TH.w + 4.4, lineCol);
    wtStroke(c, P.th, TF_TH.w, (pal && pal.handSkin) || WH_SKIN2);
    paint(() => {
      for (const j of [1, 2]) {   // the joints' creases
        const kk = P.th[j], d = [P.th[j + 1][0] - kk[0], P.th[j + 1][1] - kk[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L];
        line(c, kk[0] - n[0] * 7, kk[1] - n[1] * 7, kk[0] + n[0] * 7, kk[1] + n[1] * 7, 1.5, crease);
      }
      const tp = P.th[3], d = [tp[0] - P.th[2][0], tp[1] - P.th[2][1]], L = Math.hypot(d[0], d[1]) || 1, q = [tp[0] - (d[0] / L) * 6, tp[1] - (d[1] / L) * 6];
      if (front) ellipse(c, q[0], q[1], 6, 8, pad, Math.atan2(d[0], -d[1]));
      else ellipse(c, q[0], q[1], 6.5, 8.5, WH_NAIL, Math.atan2(d[0], -d[1]));
    });
  };
  if (back) thumb();
  // two straight fingers (ring, middle)
  for (const k of ['R', 'M']) { c.beginPath(); wtFingerPath(c, P.kn[k], P.tip[k], WH.w[k]); c.fillStyle = fcol(k); c.fill(); }
  paint(() => {
    c.lineJoin = 'round';
    for (const k of ['R', 'M']) {
      c.beginPath(); wtFingerPath(c, P.kn[k], P.tip[k], WH.w[k]); c.lineWidth = 2.2; c.strokeStyle = lineCol; c.stroke();
      for (const u of [0.36, 0.67]) {
        const a = wtAlong(P, k, u, -WH.w[k] * 0.3), b = wtAlong(P, k, u, WH.w[k] * 0.3), m = wtAlong(P, k, u + (back ? -0.025 : 0.02), 0);
        c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]); c.lineWidth = 1.4; c.lineCap = 'round'; c.strokeStyle = crease; c.stroke();
      }
      const n = wtAlong(P, k, back ? 0.84 : 0.86);
      if (back) ellipse(c, n[0], n[1], WH.w[k] * 0.3, WH.w[k] * 0.42, WH_NAIL, P.a[k]);
      else ellipse(c, n[0], n[1], WH.w[k] * 0.26, WH.w[k] * 0.36, pad, P.a[k]);
    }
  });
  // the pointer and the little finger: outlines first, then the palm over their bases, then their fills
  wtStroke(c, pinky, WH.w.L + 4.4, lineCol);
  wtStroke(c, P.idx, WH.w.I + 4.4, lineCol);
  c.beginPath(); wtPalmPath(c, P); c.fillStyle = skin; c.fill();
  paint(() => {
    c.beginPath(); wtPalmPath(c, P); c.lineWidth = 2.2; c.strokeStyle = lineCol; c.stroke();
    if (front) {   // palm lines
      c.lineCap = 'round'; c.strokeStyle = (pal && pal.handCrease) || 'rgba(170,92,64,0.5)'; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-30, -62); c.quadraticCurveTo(-4, -70, 26, -58); c.stroke();
      c.beginPath(); c.moveTo(-28, -46); c.quadraticCurveTo(0, -52, 22, -40); c.stroke();
      c.beginPath(); c.moveTo(24, -46); c.quadraticCurveTo(2, -30, 8, -2); c.stroke();
    }
  });
  wtStroke(c, pinky, WH.w.L, fcol('L'));
  wtStroke(c, P.idx, WH.w.I, fcol('I'));
  paint(() => {
    // the little finger's joint and pad
    const m = P.pinkyMid, d = [P.tip.L[0] - m[0], P.tip.L[1] - m[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L];
    line(c, m[0] - n[0] * 6, m[1] - n[1] * 6, m[0] + n[0] * 6, m[1] + n[1] * 6, 1.4, crease);
    const q = [P.tip.L[0] - (d[0] / L) * 4, P.tip.L[1] - (d[1] / L) * 4];
    if (front) ellipse(c, q[0], q[1], 4.6, 6, pad, Math.atan2(d[0], -d[1]));
    else ellipse(c, q[0], q[1], 5, 6.5, WH_NAIL, Math.atan2(d[0], -d[1]));
    // the pointer's two joints (the tip one darkens as it bends) and its pad (rounder as it folds toward us)
    const cu = clamp(D.curl || 0);
    for (const j of [1, 2]) {
      const kk = P.idx[j], dd = [P.idx[j + 1][0] - kk[0], P.idx[j + 1][1] - kk[1]], LL = Math.hypot(dd[0], dd[1]) || 1, nn = [-dd[1] / LL, dd[0] / LL];
      line(c, kk[0] - nn[0] * 7, kk[1] - nn[1] * 7, kk[0] + nn[0] * 7, kk[1] + nn[1] * 7, 1.4 + (j === 2 ? 1.4 * cu : 0), j === 2 ? `rgba(140,66,44,${0.55 + 0.35 * cu})` : crease);
    }
    if (!(D.face > 0.3)) {
      const a = P.idx[2], b = P.idx[3], dd = [b[0] - a[0], b[1] - a[1]], LL = Math.hypot(dd[0], dd[1]) || 1;
      const q2 = [b[0] - (dd[0] / LL) * 4, b[1] - (dd[1] / LL) * 4];
      if (front) ellipse(c, q2[0], q2[1], 6 + 1.2 * cu, 7 - 1.5 * cu, pad, Math.atan2(dd[0], -dd[1]));
      else ellipse(c, q2[0], q2[1], 6.5, 8.5, WH_NAIL, Math.atan2(dd[0], -dd[1]));
    }
  });
  tfFace(c, P, D, t, front);
  if (front) thumb();
  // the glass
  const gk = clamp(D.glass || 0);
  let G = null;
  if (gk > 0.01 && front) G = tfGlass(c, P, D, gk, t, fa, pal);
  if (G && D.face > 0.01 && gk > 0.5) tfFace(c, P, D, t, front);   // the sidekick's face stays on the glass
  c.restore();
  P.glass = G;
  return P;
}
// a hand-unit point of a hand drawn with wtHand at (o, ang, s) on a layer with the transform of hp(): hand units -> world
// is wtroom.js's hp(); this helper gives a point on a polyline returned in P.glass (strap, split) the same way
function tfPt(P, key) { return P && P.glass && P.glass[key] ? P.glass[key] : null; }
