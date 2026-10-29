// toes.js (toes-one-at-a-time, 30 Oct 2026): the hero on a lake dock at sunset, his chin on his knee, and his bare right
// foot as a small 3D rig in centimetres whose five toes lift and curl one by one or together.
// Frame (cm): origin on the dock under the ball of the foot; +x toward the big toe (his left, the screen's right),
// +y up, +z forward along the toes (toward the camera). A view V = {cx, cy, S, D, yaw, pitch, tx, ty, tz} looks at
// (tx, ty, tz) from D cm away, S px per cm there; `tsP(V, p)` -> [sx, sy, px per cm, depth]. Everything is drawn in
// screen space (screenSpace()), so a camera move is a change of V.
// Toes: TS_TOES (big toe first), each with a pose {lift, curl, wig, look} in `tsFoot(c, V, A)`; A.glass 0..1 turns the
// leg see-through from the knee down (bones, the three muscles, their strings: orange = the big toe's own lifter, cyan =
// the ONE lifter of the other four, violet = the ONE curler of the four), A.pull* squeeze them.
'use strict';

const TSK = { skin: '#F2B892', sh: '#CF8663', hi: '#FFDCC4', line: '#8E4E36', nail: '#FFEDE3', nailSh: '#E8B49C' };
const TS_OR = '#FF9A3C', TS_CY = '#7FE9FF', TS_VI = '#C8A8FF', TS_YE = '#FFD447', TS_GLASS = '#93507C';
// big toe first, then toes 2..5 (outward). b = the knuckle (base) in cm, len = bones, r = radius per bone, spl = splay
const TS_TOES = [
  { b: [3.2, 1.75, 0.5], len: [2.9, 2.4], r: [1.55, 1.42], spl: 0.07 },
  { b: [0.85, 1.45, 0.7], len: [2.2, 1.4, 1.05], r: [1.02, 0.98, 0.92], spl: -0.02 },
  { b: [-1.05, 1.36, 0.1], len: [2.0, 1.25, 0.95], r: [0.96, 0.92, 0.86], spl: -0.09 },
  { b: [-2.75, 1.26, -0.8], len: [1.8, 1.05, 0.85], r: [0.9, 0.86, 0.8], spl: -0.17 },
  { b: [-4.2, 1.16, -1.95], len: [1.45, 0.9, 0.72], r: [0.85, 0.8, 0.74], spl: -0.27 },
];
const TS_ANKLE = [0, 7, -13], TS_KNEE = [0, 16, -13];
// the foot seen from its inner side, as (y, z): heel, sole, arch, ball, the toes' base, the instep, the ankle, the heel's back
const TS_PROFILE = [[0.5, -17.0], [0, -15.4], [0.15, -13], [1.5, -10], [1.3, -6.5], [0.1, -2.6], [0.4, 0.4], [3.0, 0.8], [4.6, -5.3],
  [6.4, -9.4], [8.6, -10.9], [11.5, -11.1], [11.5, -15.3], [6.2, -16.4], [3.2, -18.4], [1.3, -18.3]];   // a cartoon shin: short, so his face and his foot share the frame

function tsView(o) { return Object.assign({ cx: 540, cy: 900, S: 22, D: 60, yaw: 0, pitch: 0.3, tx: 0, ty: 12, tz: -10 }, o); }
function tsP(V, p) {
  const x = p[0] - V.tx, y = p[1] - V.ty, z = p[2] - V.tz;
  const cyw = Math.cos(V.yaw), syw = Math.sin(V.yaw);
  const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
  const cp = Math.cos(V.pitch), sp = Math.sin(V.pitch);
  const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  const f = V.D / Math.max(6, V.D - z2);
  return [V.cx + x1 * V.S * f, V.cy - y2 * V.S * f, V.S * f, z2];
}
const tsAdd = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const tsLerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const tsNorm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const tsCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// a tapered capsule between two screen circles, added to the current path
function tsCapsule(c, x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d <= Math.abs(r1 - r2) + 0.5) { const [x, y, r] = r1 > r2 ? [x1, y1, r1] : [x2, y2, r2]; c.moveTo(x + r, y); c.arc(x, y, r, 0, 7); return; }
  const a = Math.atan2(dy, dx), th = Math.acos(clamp((r1 - r2) / d, -1, 1));
  c.moveTo(x1 + r1 * Math.cos(a + th), y1 + r1 * Math.sin(a + th));
  c.arc(x1, y1, r1, a + th, a + 2 * Math.PI - th);
  c.arc(x2, y2, r2, a - th, a + th);
  c.closePath();
}
// convex hull of screen points (monotone chain)
function tsHull(pts) {
  const P = pts.map((p) => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function tsPath(c, pts) { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }

// ---------------------------------------------------------------- the toes' joints
// pose: {lift: 0..1 (up at the knuckle), curl: 0..1 (down and scrunched), wig: wobble}; returns joints (3D) + radii
function tsToeJoints(i, pose, t) {
  const T = TS_TOES[i], big = i === 0, n = T.len.length;
  const lift = pose.lift || 0, curl = pose.curl || 0, wig = pose.wig || 0;
  const liftA = (big ? 1.0 : 0.88) * lift + wig * 0.07 * Math.sin(t * 34 + i * 1.9);
  // segment pitch (+ = down): the toe hugs the dock at rest
  const rest = big ? [-0.12, 0.2] : [-0.18, 0.12, 0.34];
  const curlA = big ? [0.1, 1.0] : [0.32, 1.25, 1.0];
  const spl = T.spl + (pose.spread || 0) * (i - 1.5) * -0.05;
  const J = [T.b.slice()];
  let a = 0;
  for (let s = 0; s < n; s++) {
    a += rest[s] + curl * curlA[s] - (s === 0 ? liftA : 0) + (s === 0 ? -curl * 0.15 : 0);
    const d = [Math.sin(spl) * Math.cos(a), -Math.sin(a), Math.cos(spl) * Math.cos(a)];
    J.push(tsAdd(J[s], d, T.len[s]));
  }
  return { J, r: T.r, a, spl };
}

// ---------------------------------------------------------------- the foot, the shin, the toes
// A: {toes: [pose x5], glass, pullO, pullC, pullV, split (cyan string forks 0..1), cyanOn, violetOn, orangeOn,
//     faces 0..1, look [x, y], happy, strings (the puppet string) 0..1, yank 0..1, knee: true to draw the knee + shin top}
function tsFootGeo(V, A, t) {
  const toes = TS_TOES.map((T, i) => tsToeJoints(i, (A.toes && A.toes[i]) || {}, t));
  const sole = [[-4.9, 0, -1.5], [-5.1, 0, -5], [-4.6, 0, -9.5], [-3.8, 0, -13.5], [-2.2, 0, -16.5], [0, 0, -17.5], [2.4, 0, -16.5],
    [3.6, 0, -13], [3.4, 0, -8.5], [4.1, 0, -4.5], [4.6, 0, 0], [4.3, 0, 1.5], [1.6, 0, 1.8], [-1.4, 0, 1.0], [-4.0, 0, -0.9]];
  const top = [[4.4, 3.0, 0.2], [2.2, 2.7, 0.6], [0.2, 2.5, 0.4], [-1.9, 2.3, -0.2], [-4.0, 2.0, -1.4],
    [2.8, 4.6, -5.5], [-2.0, 4.1, -5.5], [1.0, 6.0, -9.5], [-2.4, 5.3, -9.5]];
  const ank = [];
  for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; ank.push([3.5 * Math.cos(a), 8.2, -13 + 3.3 * Math.sin(a)]); }
  return { toes, body: [...sole, ...top, ...ank] };
}

function tsShin(c, V, A, col, edge) {
  const a = tsP(V, TS_ANKLE), k = tsP(V, TS_KNEE);
  if (A.noShin) return { a, k };
  c.beginPath(); tsCapsule(c, a[0], a[1], 3.7 * a[2] + 3, k[0], k[1], 4.7 * k[2] + 3); c.fillStyle = edge; c.fill();
  c.beginPath(); tsCapsule(c, a[0], a[1], 3.7 * a[2], k[0], k[1], 4.7 * k[2]); c.fillStyle = col; c.fill();
  if (A.knee !== false) {           // the knee cap
    const kc = tsP(V, [0.4, 15.8, -9.7]);
    ellipse(c, kc[0], kc[1], 3.1 * kc[2], 2.6 * kc[2], col === TSK.skin ? '#F6C29E' : col);
  }
  return { a, k };
}

// one toe: a dark rim (the outline), the skin, a nail, the pad's little crease; eyes when A.faces
function tsToe(c, V, i, G, A, t, glassK) {
  const { J, r } = G;
  const P = J.map((p) => tsP(V, p));
  const R = (s, add) => r[Math.min(s, r.length - 1)] * P[s][2] + add;
  const skin = glassK > 0.5 ? '#A8668F' : TSK.skin;
  const rim = glassK > 0.5 ? '#5A2346' : TSK.line;
  c.beginPath();
  for (let s = 0; s < J.length - 1; s++) tsCapsule(c, P[s][0], P[s][1], R(s, 3.2), P[s + 1][0], P[s + 1][1], R(s + 1 < r.length ? s + 1 : s, 3.2) * 0.98);
  c.fillStyle = rim; c.fill('nonzero');
  c.beginPath();
  for (let s = 0; s < J.length - 1; s++) tsCapsule(c, P[s][0], P[s][1], R(s, 0), P[s + 1][0], P[s + 1][1], R(s + 1 < r.length ? s + 1 : s, 0) * 0.98);
  c.fillStyle = skin; c.fill('nonzero');
  // the nail on the last bone's top
  const n = J.length - 1, d = tsNorm([J[n][0] - J[n - 1][0], J[n][1] - J[n - 1][1], J[n][2] - J[n - 1][2]]);
  const side = tsNorm([Math.cos(G.spl), 0, -Math.sin(G.spl)]);
  let up = tsCross(d, side); if (up[1] < 0) up = [-up[0], -up[1], -up[2]];
  const rl = r[r.length - 1], cen = tsAdd(tsAdd(J[n], d, -0.42 * TS_TOES[i].len[n - 1]), up, rl * 0.72);
  const pc = tsP(V, cen), pa = tsP(V, tsAdd(cen, side, rl * 0.62)), pb = tsP(V, tsAdd(cen, d, rl * 0.62));
  // only when the nail faces the camera: the toe's up vector against the view
  const pu = tsP(V, tsAdd(cen, up, 1));
  const facing = clamp(((pc[1] - pu[1]) / pc[2] + 0.15) * 2.2);
  if (facing > 0.02 && glassK < 0.9) paint(() => {
    c.save(); c.transform(pa[0] - pc[0], pa[1] - pc[1], pb[0] - pc[0], pb[1] - pc[1], pc[0], pc[1]);
    c.beginPath(); c.arc(0, 0, 1, 0, 7); c.fillStyle = rgba(TSK.nailSh, 0.9 * facing); c.fill();
    c.beginPath(); c.arc(-0.12, -0.1, 0.78, 0, 7); c.fillStyle = rgba(TSK.nail, 0.95 * facing); c.fill();
    c.restore();
  });
  // a soft highlight along the top of the toe
  if (glassK < 0.5) paint(() => {
    for (let s = 0; s < J.length - 1; s++) {
      const a = tsP(V, tsAdd(J[s], up, r[Math.min(s, r.length - 1)] * 0.55)), b = tsP(V, tsAdd(J[s + 1], up, r[Math.min(s, r.length - 1)] * 0.5));
      line(c, a[0], a[1], b[0], b[1], Math.max(2, r[0] * a[2] * 0.35), 'rgba(255,226,206,0.45)');
    }
  });
  // the little face of a small toe: two eyes on the front of the tip
  const fk = i > 0 ? clamp(A.faces || 0) : clamp(A.bigFace || 0);
  if (fk > 0.01) paint(() => {
    const tip = P[n], s = r[r.length - 1] * tip[2], lk = A.look || [0, 0];
    const ex = s * 0.36, ey = tip[1] - s * 0.18, er = s * 0.27 * E.outBack(fk, 2);
    for (const sd of [-1, 1]) {
      const x = tip[0] + sd * ex;
      if (A.happy) { c.beginPath(); c.arc(x, ey + er * 0.3, er * 0.8, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = Math.max(2, er * 0.45); c.strokeStyle = '#3A1A12'; c.lineCap = 'round'; c.stroke(); }
      else {
        ellipse(c, x, ey, er, er * 1.15, '#FFFFFF');
        c.beginPath(); c.ellipse(x, ey, er, er * 1.15, 0, 0, 7); c.lineWidth = Math.max(1.2, er * 0.16); c.strokeStyle = '#6A3526'; c.stroke();
        circle(c, x + lk[0] * er * 0.42, ey + lk[1] * er * 0.45, er * 0.52, '#15132A');
        circle(c, x + lk[0] * er * 0.42 - er * 0.18, ey + lk[1] * er * 0.45 - er * 0.2, er * 0.18, '#FFFFFF');
      }
    }
    if (A.mouths) { c.beginPath(); c.arc(tip[0], ey + er * 1.55, er * 0.55, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = Math.max(1.5, er * 0.3); c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
  });
  return P;
}

// the whole foot (and the shin up to the knee). Returns screen points for labels.
function tsFoot(c, V, A, t) {
  const G = tsFootGeo(V, A, t), gk = clamp(A.glass || 0);
  const out = {};
  // the shin (behind the foot)
  const shinCol = TSK.skin, shinEdge = TSK.line;
  out.shin = tsShin(c, V, A, shinCol, shinEdge);
  // the foot's body: the hull of its points, or its side profile (with the arch and the heel) when A.profile
  const hp = A.profile ? TS_PROFILE.map(([y, z]) => tsP(V, [1.2, y, z])) : tsHull(G.body.map((p) => tsP(V, p)));
  c.beginPath(); tsPath(c, hp); c.lineJoin = 'round'; c.lineWidth = 6; c.strokeStyle = TSK.line; c.stroke();
  const tp = tsP(V, [0, 7, -11]), fp = tsP(V, [0, 0, 2]);
  const g = c.createLinearGradient(tp[0], tp[1], fp[0], fp[1]);
  g.addColorStop(0, '#E9A985'); g.addColorStop(0.55, TSK.skin); g.addColorStop(1, '#F6C4A2');
  c.beginPath(); tsPath(c, hp); c.fillStyle = g; c.fill();
  paint(() => {   // the ankle bones and the knuckle line
    const m1 = tsP(V, [3.4, 7.2, -13]), m2 = tsP(V, [-3.5, 6.6, -14]);
    ellipse(c, m1[0], m1[1], 1.3 * m1[2], 1.6 * m1[2], 'rgba(207,134,99,0.35)');
    ellipse(c, m2[0], m2[1], 1.2 * m2[2], 1.5 * m2[2], 'rgba(207,134,99,0.30)');
    const kn = [[3.4, 2.9, -0.4], [1.0, 2.6, 0.0], [-1.0, 2.4, -0.5], [-2.8, 2.2, -1.3], [-4.2, 2.0, -2.4]].map((p) => tsP(V, p));
    c.beginPath(); c.moveTo(kn[0][0], kn[0][1]); for (const p of kn.slice(1)) c.lineTo(p[0], p[1]);
    c.lineWidth = Math.max(2, 0.18 * kn[0][2]); c.strokeStyle = 'rgba(190,110,80,0.28)'; c.stroke();
  });
  // the glass (bones, muscles, strings) is drawn over the skin, revealed downward from the knee
  if (gk > 0.001) out.glass = tsGlass(c, V, A, G, t, gk);
  // the toes, far first
  const order = [0, 1, 2, 3, 4].sort((a, b) => tsP(V, TS_TOES[a].b)[3] - tsP(V, TS_TOES[b].b)[3]);
  out.toe = [];
  for (const i of order) out.toe[i] = tsToe(c, V, i, G.toes[i], A, t, gk > 0.5 ? 1 : 0);
  if (gk > 0.001 && out.glass) tsGlassFront(c, V, A, G, t, gk, out);
  out.G = G;
  return out;
}

// ---------------------------------------------------------------- the glass: the strings and muscles (3D polylines)
function tsTipTop(G, i, k = 0.5) {   // a point on the top of toe i's last bone, k from the tip
  const { J, r } = G.toes[i], n = J.length - 1, d = tsNorm([J[n][0] - J[n - 1][0], J[n][1] - J[n - 1][1], J[n][2] - J[n - 1][2]]);
  return tsAdd(tsAdd(J[n], d, -k * r[r.length - 1]), [0, 1, 0], r[r.length - 1] * 0.6);
}
function tsTipUnder(G, i) {
  const { J, r } = G.toes[i], n = J.length - 1;
  return tsAdd(J[n], [0, -1, 0], r[r.length - 1] * 0.55);
}
// the three strings as 3D polylines. pull* slides them (beads) and lifts the muscle's lower end
function tsStrings(G, A) {
  const pO = clamp(A.pullO || 0), pC = clamp(A.pullC || 0);
  const big = [[1.2, 9.6 - 0.8 * pO, -10.4], [1.6, 8.6, -10.6], [2.0, 7.4, -10.2], [2.3, 5.8, -8.4], [2.8, 4.3, -5.0], [3.2, 3.3, -1.8], tsTipTop(G, 0, 0.9)];
  const fork = [-1.4, 3.9, -4.6];
  const trunk = [[-1.6, 9.4 - 0.8 * pC, -10.6], [-1.6, 8.4, -10.7], [-1.4, 7.2, -10.2], [-1.3, 5.6, -8.2], fork];
  const branches = [1, 2, 3, 4].map((i) => [fork, tsLerp3(fork, TS_TOES[i].b, 0.5).map((v, j) => j === 1 ? v + 0.8 : v), tsAdd(TS_TOES[i].b, [0, 1.0, 0.2]), tsTipTop(G, i, 0.8)]);
  // the curler: down the back of the calf, behind the inner ankle, under the sole, splitting under the ball
  const vfork = [0.2, 0.15, -3.2];
  const vtrunk = [[0.6, 9.4, -15.6], [1.0, 8.4, -15.6], [2.4, 7.0, -15.0], [3.7, 5.4, -13.0], [3.3, 1.0, -9.6], [1.0, 0.2, -6], vfork];
  const vbr = [1, 2, 3, 4].map((i) => [vfork, [TS_TOES[i].b[0] * 0.7, 0.1, TS_TOES[i].b[2] - 1.0], tsTipUnder(G, i)]);
  return { big, trunk, branches, vtrunk, vbr, fork, vfork };
}
function tsRun(c, V, pts, w, col, k = 1, slide = 0, beads = true) {
  const P = pts.map((p) => tsP(V, p));
  let L = 0; const seg = []; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); L += l; }
  const end = L * clamp(k);
  const run = [[P[0][0], P[0][1]]]; let acc = 0;
  for (let i = 1; i < P.length; i++) {
    if (acc + seg[i - 1] >= end) { const u = (end - acc) / Math.max(1e-3, seg[i - 1]); run.push([lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]); break; }
    acc += seg[i - 1]; run.push([P[i][0], P[i][1]]);
  }
  if (run.length < 2) return;
  const s = P[0][2] / 22;
  c.lineCap = 'round'; c.lineJoin = 'round';
  poly(c, run, (w + 3.4) * s, 'rgba(40,10,24,0.7)'); poly(c, run, w * s, col); poly(c, run, w * 0.22 * s, 'rgba(255,255,255,0.6)');
  if (!beads) return;
  const step = 15 * s, off = ((-slide * 26 * s) % step + step) % step;
  let a2 = 0, si = 0;
  for (let d = off; d < end - 4; d += step) {
    while (si < seg.length && a2 + seg[si] < d) { a2 += seg[si]; si++; }
    if (si >= seg.length) break;
    const u = (d - a2) / Math.max(1e-3, seg[si]);
    circle(c, lerp(P[si][0], P[si + 1][0], u), lerp(P[si][1], P[si + 1][1], u), w * 0.36 * s, 'rgba(255,255,255,0.88)');
  }
}
// a muscle: a fat spindle between two 3D points that shortens and fattens when it squeezes, with a face when asked
function tsMuscle(c, V, a3, b3, rw, col, sq, k = 1, face = 0, mood = 'calm') {
  if (k <= 0.01) return null;
  const b2 = tsLerp3(a3, b3, 1 - 0.18 * sq);
  const A = tsP(V, a3), B = tsP(V, b2), w = rw * (1 + 0.35 * sq) * A[2] * E.outBack(clamp(k), 1.6);
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, ang = Math.atan2(B[1] - A[1], B[0] - A[0]), len = Math.hypot(B[0] - A[0], B[1] - A[1]) / 2 + w * 0.3;
  c.save(); c.translate(mx, my); c.rotate(ang);
  c.beginPath(); c.moveTo(-len, 0); c.bezierCurveTo(-len * 0.4, -w * 1.25, len * 0.4, -w * 1.25, len, 0); c.bezierCurveTo(len * 0.4, w * 1.25, -len * 0.4, w * 1.25, -len, 0);
  c.fillStyle = 'rgba(40,10,24,0.65)'; c.lineWidth = 4; c.strokeStyle = 'rgba(40,10,24,0.65)'; c.stroke();
  const g = c.createLinearGradient(0, -w, 0, w); g.addColorStop(0, mixH(col, '#FFFFFF', 0.35)); g.addColorStop(1, mixH(col, '#40102A', 0.25));
  c.fillStyle = g; c.fill();
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-len * 0.7, i * w * 0.22); c.quadraticCurveTo(0, i * w * 0.32, len * 0.7, i * w * 0.22); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.28)'; c.stroke(); }
  c.restore();
  if (face > 0.01) paint(() => {
    const er = w * 0.32 * face, sx = mx, sy = my;
    for (const sd of [-1, 1]) {
      if (mood === 'strain') { line(c, sx + sd * w * 0.5 - er, sy - er * 0.4, sx + sd * w * 0.5 + er, sy + er * 0.1 * sd, Math.max(2, er * 0.35), '#3A0E22'); }
      else { ellipse(c, sx + sd * w * 0.42, sy - er * 0.2, er, er * 1.2, '#FFFFFF'); circle(c, sx + sd * w * 0.42, sy - er * 0.1, er * 0.5, '#15132A'); }
    }
    if (mood === 'strain') { rrect(c, sx - w * 0.36, sy + er * 0.9, w * 0.72, er * 0.9, er * 0.3); c.fillStyle = '#FFFFFF'; c.fill(); }
    else { c.beginPath(); c.arc(sx, sy + er * 0.9, er * 0.7, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = Math.max(1.5, er * 0.3); c.strokeStyle = '#3A0E22'; c.stroke(); }
  });
  return [mx, my, w];
}
// the glass body and what lies behind the toes (muscles, the strings' upper parts). Revealed from the knee down.
function tsGlass(c, V, A, G, t, gk) {
  const k = tsP(V, TS_KNEE), f = tsP(V, [0, 0, 2]);
  const sweep = lerp(k[1] - 80, f[1] + 120, E.inOutSine(gk));
  c.save(); c.beginPath(); c.rect(0, 0, W, sweep); c.clip();
  // the glass: the shin and the foot again, see-through
  const hp = tsHull(G.body.map((p) => tsP(V, p))), a = tsP(V, TS_ANKLE);
  c.beginPath(); tsCapsule(c, a[0], a[1], 3.7 * a[2] + 3, k[0], k[1], 4.7 * k[2] + 3); tsPath(c, hp); c.fillStyle = TS_GLASS; c.fill('nonzero');
  paint(() => {
    const g = c.createLinearGradient(0, k[1], 0, f[1]); g.addColorStop(0, 'rgba(255,190,226,0.32)'); g.addColorStop(1, 'rgba(120,40,90,0.22)');
    c.beginPath(); tsCapsule(c, a[0], a[1], 3.7 * a[2], k[0], k[1], 4.7 * k[2]); tsPath(c, hp); c.fillStyle = g; c.fill('nonzero');
    // the bones, faint: the shin bone, the foot's long bones
    const b1 = tsP(V, [0.8, 15.4, -12.5]), b2 = tsP(V, [0.9, 8, -12.8]);
    line(c, b1[0], b1[1], b2[0], b2[1], 1.7 * b1[2], 'rgba(255,236,246,0.16)');
    for (const i of [0, 1, 2, 3, 4]) { const q0 = tsP(V, [TS_TOES[i].b[0] * 0.55, 5.2, -9]), q1 = tsP(V, TS_TOES[i].b); line(c, q0[0], q0[1], q1[0], q1[1], 0.75 * q1[2], 'rgba(255,236,246,0.14)'); }
    // the muscles: the curler first (it is at the back), then the four's lifter (cyan), then the big toe's own (orange)
    const S = tsStrings(G, A);
    if ((A.violetOn || 0) > 0.01) {
      c.save(); c.globalAlpha = 0.9 * clamp(A.violetOn);
      tsMuscle(c, V, [0.4, 13.4, -16.4], [0.6, 9.0, -16.0], 2.1, TS_VI, clamp(A.pullV || 0), A.violetOn, A.vFace || 0, A.vMood);
      c.restore();
    }
    const cOn = clamp(A.cyanOn === undefined ? 1 : A.cyanOn), oOn = clamp(A.orangeOn === undefined ? 1 : A.orangeOn);
    out_m = {};
    out_m.cyan = tsMuscle(c, V, [-1.7, 13.2, -10.6], [-1.5, 9.2, -10.6], 1.75, TS_CY, clamp(A.pullC || 0), cOn, A.cFace || 0, A.cMood);
    out_m.orange = tsMuscle(c, V, [1.5, 13.0, -10.4], [1.2, 9.4, -10.4], 1.45, TS_OR, clamp(A.pullO || 0), oOn, A.oFace || 0, A.oMood);
    out_m.S = S;
  });
  c.restore();
  return out_m;
}
let out_m = {};
// the strings in front of the toes' roots (drawn after the toes so they read on the toes' tops)
function tsGlassFront(c, V, A, G, t, gk, out) {
  const S = out.glass.S || tsStrings(G, A);
  const k = tsP(V, TS_KNEE), f = tsP(V, [0, 0, 2]);
  const sweep = lerp(k[1] - 80, f[1] + 120, E.inOutSine(gk));
  c.save(); c.beginPath(); c.rect(0, 0, W, sweep); c.clip();
  paint(() => {
    const vOn = clamp(A.violetOn || 0);
    if (vOn > 0.01) {
      c.save(); c.setLineDash([]);
      tsRun(c, V, S.vtrunk, 4.2, TS_VI, vOn, A.slideV || 0);
      for (const b of S.vbr) tsRun(c, V, b, 3.2, TS_VI, clamp((vOn - 0.4) / 0.6), A.slideV || 0, false);
      c.restore();
    }
    const cOn = clamp(A.cyanOn === undefined ? 1 : A.cyanOn), oOn = clamp(A.orangeOn === undefined ? 1 : A.orangeOn);
    if (cOn > 0.01) {
      tsRun(c, V, S.trunk, 4.6, TS_CY, cOn, A.slideC || 0);
      const sp = clamp(A.split === undefined ? 1 : A.split);
      if (sp > 0.01) for (const b of S.branches) tsRun(c, V, b, 3.4, TS_CY, sp, A.slideC || 0, false);
      if (sp > 0.01) { const fp = tsP(V, S.fork); circle(c, fp[0], fp[1], 0.42 * fp[2] * E.outBack(sp), '#FFFFFF'); }
    }
    if (oOn > 0.01) tsRun(c, V, S.big, 5.0, TS_OR, oOn, A.slideO || 0);
  });
  c.restore();
}

// ---------------------------------------------------------------- the hero: chin on his knee, arms round his shin
// H: {face, headRot, headDX, headDY, sweat, hands: 'clasp' | 'thumb' (his left hand up beside his head, thumbs up), thumbK}
const TS_HEAD = [0, 26.5, -14], TS_HEAD_R = 8.2;
function tsHero(c, V, H, t) {
  const P = (p) => tsP(V, p);
  const coat = PAL.coat, coatSh = PAL.coatSh, pants = PAL.pants;
  // the torso behind the knee: a soft coat shape between the shoulders and the hips
  c.beginPath(); tsPath(c, tsHull([P([-12, 19, -22]), P([12, 19, -22]), P([-10, 2, -28]), P([10, 2, -28]), P([0, 22, -21]), P([-15, 10, -26]), P([15, 10, -26])]));
  c.fillStyle = coat; c.fill(); c.lineWidth = 5; c.strokeStyle = coatSh; c.stroke();
  for (const sd of [-1, 1]) { const a = P([sd * 7.5, 20, -21]), b = P([sd * 8.5, 7, -26]); line(c, a[0], a[1], b[0], b[1], 1.8 * a[2], PAL.strap); }
  // the other leg: folded flat, its knee out to the side (his right: the screen's left)
  { const hipL = P([-6, 3, -27]), kneeL = P([-21, 4, -13]), ankL = P([-9, 3, -20]);
    c.beginPath(); tsCapsule(c, hipL[0], hipL[1], 5.4 * hipL[2], kneeL[0], kneeL[1], 4.6 * kneeL[2]); c.fillStyle = pants; c.fill();
    c.beginPath(); tsCapsule(c, kneeL[0], kneeL[1], 3.9 * kneeL[2], ankL[0], ankL[1], 3.0 * ankL[2]); c.fillStyle = TSK.sh; c.fill();
    c.beginPath(); tsCapsule(c, kneeL[0], kneeL[1], 3.5 * kneeL[2], ankL[0], ankL[1], 2.7 * ankL[2]); c.fillStyle = TSK.skin; c.fill();
    const cuf = P([-17, 4, -15.5]); c.beginPath(); tsCapsule(c, kneeL[0], kneeL[1], 4.6 * kneeL[2], cuf[0], cuf[1], 4.4 * kneeL[2]); c.fillStyle = PAL.pantsSh; c.fill(); }
  // the raised thigh (shorts), from the hip to just above the knee
  { const h = P([3, 5, -28]), k = P([0, 15.5, -13.5]);
    c.beginPath(); tsCapsule(c, h[0], h[1], 6.2 * h[2], k[0], k[1], 5.2 * k[2]); c.fillStyle = pants; c.fill(); }
  // the head, behind the knee: chin on it
  const hc = P([TS_HEAD[0] + (H.headDX || 0), TS_HEAD[1] + (H.headDY || 0), TS_HEAD[2]]), hs = hc[2] * TS_HEAD_R / 64;
  if (!H.noHead) {
  c.save(); c.translate(hc[0], hc[1]); c.scale(hs, hs);
  drawHead(c, { head: [0, 0], lean: 0 }, H.face || FACES.calm, { headRot: H.headRot || 0, seed: 3, frizz: H.frizz || 0 }, PAL, t);
  if ((H.sweat || 0) > 0.01) sweatDrop(c, 58, -40, 1.0, H.sweat);
  c.restore();
  }
  // the upper arms (sleeves) behind the shin
  for (const sd of [-1, 1]) {
    if (H.hands === 'thumb' && sd === -1 && (H.thumbK || 0) > 0.5) continue;
    const cl = H.clasp || 10.8, s = P([sd * 12.5, 18.5, -21]), e = P([sd * 8.6, cl - 2.2, -9.5]);
    c.beginPath(); tsCapsule(c, s[0], s[1], 3.6 * s[2], e[0], e[1], 3.0 * e[2]); c.fillStyle = coatSh; c.fill();
    c.beginPath(); tsCapsule(c, s[0], s[1], 3.15 * s[2], e[0], e[1], 2.6 * e[2]); c.fillStyle = coat; c.fill();
  }
  return { hc, hs };
}
function tsHeroFront(c, V, H, t) {   // after the shin: the forearms wrap round it, the hands clasp in front
  const P = (p) => tsP(V, p);
  const k = clamp(H.thumbK || 0), thumb = H.hands === 'thumb' && k > 0.01;
  for (const sd of [-1, 1]) {
    if (thumb && sd === -1 && k > 0.5) continue;
    const cl = H.clasp || 10.8, e = P([sd * 8.6, cl - 2.2, -9.5]), w = P([sd * 2.2, cl, -7.0]);
    c.beginPath(); tsCapsule(c, e[0], e[1], 2.7 * e[2], w[0], w[1], 2.2 * w[2]); c.fillStyle = PAL.coatSh; c.fill();
    c.beginPath(); tsCapsule(c, e[0], e[1], 2.35 * e[2], w[0], w[1], 1.9 * w[2]); c.fillStyle = PAL.coat; c.fill();
  }
  const hc = P([0, H.clasp || 10.8, -6.3]);
  circle(c, hc[0], hc[1], 2.3 * hc[2], TSK.sh); circle(c, hc[0], hc[1] - 0.2 * hc[2], 2.0 * hc[2], TSK.skin);
  paint(() => { for (let i = -1; i <= 1; i++) line(c, hc[0] + i * 0.7 * hc[2], hc[1] - 1.3 * hc[2], hc[0] + i * 0.7 * hc[2], hc[1] + 0.4 * hc[2], Math.max(1.5, 0.15 * hc[2]), 'rgba(160,90,60,0.45)'); });
  if (thumb && k > 0.5) {
    // his right arm comes off the shin and up beside his head: a thumbs-up
    const s = P([-12.5, 22, -21]), e = P([-15, 16, -15]), w = P([-11.5, 25, -12]), u = E.outBack(clamp((k - 0.5) * 2));
    const w2 = [lerp(e[0], w[0], u), lerp(e[1], w[1], u)], sc = w[2] * 1.3;
    c.beginPath(); tsCapsule(c, s[0], s[1], 3.6 * s[2], e[0], e[1], 3.0 * e[2]); c.fillStyle = PAL.coatSh; c.fill();
    c.beginPath(); tsCapsule(c, e[0], e[1], 2.7 * e[2], w2[0], w2[1], 2.2 * sc); c.fillStyle = PAL.coatSh; c.fill();
    c.beginPath(); tsCapsule(c, e[0], e[1], 2.35 * e[2], w2[0], w2[1], 1.9 * sc); c.fillStyle = PAL.coat; c.fill();
    rrect(c, w2[0] - 2.1 * sc, w2[1] - 3.4 * sc, 4.2 * sc, 3.6 * sc, 1.4 * sc); c.fillStyle = TSK.skin; c.fill(); c.lineWidth = 3; c.strokeStyle = TSK.line; c.stroke();
    rrect(c, w2[0] - 0.85 * sc, w2[1] - 6.4 * sc, 1.7 * sc, 3.4 * sc, 0.85 * sc); c.fillStyle = TSK.skin; c.fill(); c.stroke();
  }
}

// ---------------------------------------------------------------- the lake at sunset (painted once) and the dock
let TS_PLATE = null;
function tsInitLake() {
  const cv = mkCanvas(W, H * 1.4), c = cv.getContext('2d'), HZ = 1100;   // the horizon at y 1100 in the plate
  const rng = mulberry32(31);
  const sky = c.createLinearGradient(0, 0, 0, HZ);
  sky.addColorStop(0, '#2B2A6B'); sky.addColorStop(0.42, '#8A4F92'); sky.addColorStop(0.72, '#F07F6A'); sky.addColorStop(0.92, '#FFC16E'); sky.addColorStop(1, '#FFE2A0');
  c.fillStyle = sky; c.fillRect(0, 0, W, HZ);
  // clouds: long soft bands lit from below
  for (let i = 0; i < 9; i++) {
    const y = 320 + rng() * 620, x = rng() * W, w = 260 + rng() * 420, h = 22 + rng() * 26;
    const g = c.createLinearGradient(0, y - h, 0, y + h); g.addColorStop(0, 'rgba(120,70,140,0.0)'); g.addColorStop(0.5, 'rgba(255,170,150,0.55)'); g.addColorStop(1, 'rgba(255,210,160,0.0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w, h, 0, 0, 7); c.fill();
  }
  // the sun, low on the right
  const sx = 810, sy = HZ - 110;
  const sg = c.createRadialGradient(sx, sy, 10, sx, sy, 420); sg.addColorStop(0, 'rgba(255,240,200,0.95)'); sg.addColorStop(0.18, 'rgba(255,200,120,0.55)'); sg.addColorStop(1, 'rgba(255,160,90,0)');
  c.fillStyle = sg; c.fillRect(0, 0, W, HZ);
  c.beginPath(); c.arc(sx, sy, 62, 0, 7); c.fillStyle = '#FFF2C8'; c.fill();
  // the far shore: two layers of hills with pines
  const hills = (base, amp, col, seed, pines) => {
    const r = mulberry32(seed); c.beginPath(); c.moveTo(0, HZ);
    for (let x = 0; x <= W; x += 20) c.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + seed)) - amp * 0.3 * Math.sin(x * 0.017 + seed * 2));
    c.lineTo(W, HZ); c.closePath(); c.fillStyle = col; c.fill();
    if (pines) for (let x = 10; x < W; x += 14 + r() * 18) {
      const y = base - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + seed)) - amp * 0.3 * Math.sin(x * 0.017 + seed * 2) + 6, h = 26 + r() * 30;
      c.beginPath(); c.moveTo(x, y - h); c.lineTo(x - h * 0.3, y + 2); c.lineTo(x + h * 0.3, y + 2); c.closePath(); c.fill();
    }
  };
  hills(HZ - 40, 90, '#7A4A7E', 3, false);
  hills(HZ - 8, 50, '#4A2E5A', 7, true);
  // the water: the sky mirrored and darker, glitter under the sun
  const wg = c.createLinearGradient(0, HZ, 0, H * 1.4); wg.addColorStop(0, '#E9A27A'); wg.addColorStop(0.12, '#B06A84'); wg.addColorStop(0.5, '#4E3470'); wg.addColorStop(1, '#22194A');
  c.fillStyle = wg; c.fillRect(0, HZ, W, H * 1.4 - HZ);
  for (let i = 0; i < 220; i++) {
    const y = HZ + 6 + Math.pow(rng(), 1.7) * 900, spread = 60 + (y - HZ) * 0.55, x = sx + (rng() - 0.5) * 2 * spread, w = 8 + rng() * 40 * (1 + (y - HZ) / 400);
    c.fillStyle = `rgba(255,${200 + rng() * 40 | 0},150,${0.25 + rng() * 0.5})`; c.fillRect(x - w / 2, y, w, 2 + (y - HZ) / 260);
  }
  for (let i = 0; i < 140; i++) {
    const y = HZ + 10 + rng() * 900, x = rng() * W, w = 30 + rng() * 120;
    c.fillStyle = `rgba(255,190,200,${0.05 + rng() * 0.08})`; c.fillRect(x, y, w, 2);
  }
  // a little sailboat far out on the left
  { const bx = 230, by = HZ + 18; c.fillStyle = '#3A2348'; c.beginPath(); c.moveTo(bx - 34, by); c.lineTo(bx + 34, by); c.lineTo(bx + 24, by + 10); c.lineTo(bx - 24, by + 10); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(bx - 2, by - 2); c.lineTo(bx - 2, by - 78); c.lineTo(bx + 30, by - 6); c.closePath(); c.fillStyle = '#FFE6C8'; c.fill();
    c.beginPath(); c.moveTo(bx - 6, by - 2); c.lineTo(bx - 6, by - 62); c.lineTo(bx - 30, by - 6); c.closePath(); c.fillStyle = '#F7B79A'; c.fill(); }
  TS_PLATE = { cv, HZ, sx, sy };
}
// the plate placed so its horizon sits at the view's horizon
function tsLakeBg(V, t, o = {}) {
  screenSpace();
  if (!TS_PLATE) tsInitLake();
  const hy = V.cy - V.S * V.D * Math.tan(V.pitch) + (o.dy || 0);
  const sc = o.scale || 1, ox = (W - W * sc) / 2 + (o.dx || 0);
  ctx.fillStyle = '#22194A'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(TS_PLATE.cv, ox, hy - TS_PLATE.HZ * sc, W * sc, TS_PLATE.cv.height * sc);
  // the sun's glow in the glow layer
  const sxs = ox + TS_PLATE.sx * sc, sys = hy - (TS_PLATE.HZ - TS_PLATE.sy) * sc;
  const sg = o.sun === undefined ? 1 : o.sun;
  softDot(gctx, sxs, sys, 300 * sc, '#FFC870', 0.55 * sg); softDot(gctx, sxs, sys, 90 * sc, '#FFF0C8', 0.8 * sg);
  // ripples drifting
  for (let i = 0; i < 18; i++) {
    const y = hy + 30 + i * 46 * sc, ph = (t * 18 + i * 37) % W;
    ctx.fillStyle = 'rgba(255,200,210,0.08)'; ctx.fillRect(ph - 60, y, 120, 2);
  }
  return { hy, sun: [sxs, sys] };
}
// the dock: planks along z under him, a front beam, two posts at the far corners
function tsDock(V, t) {
  const c = ctx, P = (p) => tsP(V, p), x0 = -70, x1 = 70, zf = -46, zn = 12;
  const quad = [P([x0, 0, zf]), P([x1, 0, zf]), P([x1, 0, zn]), P([x0, 0, zn])];
  // the dock's side faces (its thickness) on the near corners
  c.beginPath(); tsPath(c, [P([x0, 0, zf]), P([x1, 0, zf]), P([x1, -7, zf]), P([x0, -7, zf])]); c.fillStyle = '#5A3424'; c.fill();
  c.beginPath(); tsPath(c, quad);
  const g = c.createLinearGradient(0, quad[0][1], 0, quad[2][1]); g.addColorStop(0, '#B07656'); g.addColorStop(1, '#D9966A');
  c.fillStyle = g; c.fill();
  paint(() => {
    const rng = mulberry32(5);
    for (let z = zn - 0.6; z > zf; z -= 9) {           // the gaps between the planks, across the dock
      const a = P([x0, 0, z]), b = P([x1, 0, z]); line(c, a[0], a[1], b[0], b[1], Math.max(1.5, 0.32 * a[2]), 'rgba(70,36,24,0.7)');
      // each plank's own tone and a little grain
      for (let i = 0; i < 5; i++) { const x = x0 + rng() * (x1 - x0), zz = z - 1.5 - rng() * 6, g1 = P([x, 0, zz]), g2 = P([x + 6 + rng() * 14, 0, zz]); line(c, g1[0], g1[1], g2[0], g2[1], Math.max(1, 0.08 * g1[2]), 'rgba(120,64,40,0.35)'); }
      for (const x of [-52, -18, 18, 52]) { const n = P([x, 0, z - 1.6]); circle(c, n[0], n[1], Math.max(1.2, 0.2 * n[2]), 'rgba(60,40,40,0.55)'); }
    }
    // warm light on the planks from the low sun
    const s1 = P([20, 0, -30]), s2 = P([60, 0, 20]);
    const lg = c.createLinearGradient(s1[0], s1[1], s2[0], s2[1]); lg.addColorStop(0, 'rgba(255,200,130,0.0)'); lg.addColorStop(1, 'rgba(255,190,120,0.18)');
    c.beginPath(); tsPath(c, quad); c.fillStyle = lg; c.fill();
  });
  for (const x of [x0 + 4, x1 - 4]) { const a = P([x, 0, zf - 1]), b = P([x, 22, zf - 1]); line(c, a[0], a[1], b[0], b[1], 4.2 * a[2], '#4A2A1E'); circle(c, b[0], b[1], 2.1 * a[2], '#5E3828'); }
}
// the soft shadow under the foot and the hero on the planks
function tsContact(V) {
  const c = ctx, a = tsP(V, [-1, 0, -8]);
  paint(() => { c.save(); c.translate(a[0], a[1]); c.scale(1, 0.32); const g = c.createRadialGradient(0, 0, 4, 0, 0, 16 * a[2]); g.addColorStop(0, 'rgba(40,16,30,0.45)'); g.addColorStop(1, 'rgba(40,16,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 16 * a[2], 0, 7); c.fill(); c.restore(); });
}

// ---------------------------------------------------------------- the puppet string (the answer)
// from the four small toes' tips to a knot above the foot, then one string up into the sky to a little wooden handle
function tsPuppet(c, V, G, k, yank, t, topY = 120) {
  if (k <= 0.01) return;
  const knot3 = [-2.2, 9.5 + 1.5 * yank, 3.5], knot = tsP(V, knot3);
  const drop = E.outCubic(clamp(k));
  const top = [880 + 8 * Math.sin(t * 2.2), lerp(-200, topY, drop)];
  const kn = [lerp(top[0], knot[0], drop), lerp(top[1], knot[1], drop)];
  c.save(); c.lineCap = 'round';
  // the handle: a little wooden cross
  paint(() => {
    c.save(); c.translate(top[0], top[1]); c.rotate(0.12 * Math.sin(t * 2.2) - 0.2 * yank);
    rrect(c, -70, -9, 140, 18, 8); c.fillStyle = '#8A5434'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#4A2A1E'; c.stroke();
    rrect(c, -9, -40, 18, 80, 8); c.fillStyle = '#A0633E'; c.fill(); c.stroke();
    c.restore();
  });
  const tension = 0.6 + 0.4 * yank;
  line(c, top[0], top[1] + 30, kn[0], kn[1], 7, 'rgba(60,30,20,0.6)'); line(c, top[0], top[1] + 30, kn[0], kn[1], 4.2, TS_YE);
  softDot(gctx, (top[0] + kn[0]) / 2, (top[1] + kn[1]) / 2, 120, TS_YE, 0.12 + 0.3 * yank);
  if (drop > 0.6) {
    const bk = clamp((drop - 0.6) / 0.4);
    for (const i of [1, 2, 3, 4]) {
      const tp = tsP(V, tsTipTop(G, i, 0.6));
      const mx = lerp(kn[0], tp[0], 0.5), my = lerp(kn[1], tp[1], 0.5) + (1 - tension) * 18;
      c.beginPath(); c.moveTo(kn[0], kn[1]); c.quadraticCurveTo(mx, my, lerp(kn[0], tp[0], bk), lerp(kn[1], tp[1], bk));
      c.lineWidth = 3.6; c.strokeStyle = 'rgba(60,30,20,0.55)'; c.stroke(); c.lineWidth = 2.0; c.strokeStyle = TS_YE; c.stroke();
    }
    circle(c, kn[0], kn[1], 6, '#FFE68A'); circle(c, kn[0], kn[1], 3, '#B07A10');
    softDot(gctx, kn[0], kn[1], 30, TS_YE, 0.5);
  }
  c.restore();
}
