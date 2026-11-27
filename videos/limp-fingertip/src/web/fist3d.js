// fist3d.js — his hand in 3D (centimetres): a fist whose fingers lift one at a time, seen from any side by an orbiting
// camera. Hand-local frame: origin = the middle of the wrist, +y toward the fingers, +x toward the thumb, +z out of the
// palm (so with the camera at yaw 0 we look at his palm, thumb on the right: the viewer's own view of their right fist).
// The forearm runs down and back (-y, -z): orbit the camera to yaw ~PI and we look over his shoulder at the back of his
// hand. What is in it: the hand (`fkGeo` + `fkDraw`: fist, lift, creep, squeeze, tremble), handcuffs round two fingers
// (`fkFingerCuffs`), the hand as glass (`fkGlass`), the cords on the back of the hand with cuffs between them
// (`fkInside`), and helpers to find points on it (`fkTip`, `fkSegPt`). The left hand is the same rig mirrored (`side`).
'use strict';

// ---------------------------------------------------------------- the camera
// V: {tx, ty, tz: the point it looks at (cm, hand frame), yaw (0: at the palm; +: round to the thumb side), pitch
// (+: from above), D: distance (cm), f: px per cm at distance 1, cx, cy: where the target lands, roll (rad)}.
// pr(p) -> [x, y, k (px per cm there), depth (cm; larger = farther)]
function fkCam(V) {
  const cy = Math.cos(V.yaw || 0), sy = Math.sin(V.yaw || 0), cp = Math.cos(V.pitch || 0), sp = Math.sin(V.pitch || 0);
  const cr = Math.cos(V.roll || 0), sr = Math.sin(V.roll || 0), mir = V.mirror ? -1 : 1;
  const ca = Math.cos(V.rotX || 0), sa = Math.sin(V.rotX || 0);   // rotX: the hand turned about its x axis first (PI/2: palm down, fingers at us)
  return (p) => {
    const py = p[1] * ca - p[2] * sa, pz = p[1] * sa + p[2] * ca;
    let x = (p[0] * mir) - V.tx, y = py - V.ty, z = pz - V.tz;
    const x1 = x * cy - z * sy, z1 = x * sy + z * cy;                   // turn round the vertical axis
    const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;                 // then look down
    const zc = Math.max(1.5, V.D - z2), k = V.f / zc;
    const dx = x1 * k, dy = -y2 * k;
    return [V.cx + dx * cr - dy * sr, V.cy + dx * sr + dy * cr, k, zc];
  };
}
// keyed: keys [[t, yaw, pitch, tx, ty, tz, D, cx, cy, roll], ...] eased in-out; f fixed
const FK_F0 = 1900;
function fkKeys(t, keys, f = FK_F0, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return { yaw: k[1], pitch: k[2], tx: k[3], ty: k[4], tz: k[5], D: k[6], cx: k[7], cy: k[8], roll: k[9] || 0, f };
}
// blend two camera descriptions
function fkMix(a, b, u) {
  const o = {};
  for (const key of Object.keys(a)) o[key] = typeof a[key] === 'number' && typeof b[key] === 'number' ? lerp(a[key], b[key], u) : (u < 0.5 ? a[key] : b[key]);
  return o;
}

// ---------------------------------------------------------------- the hand
// knuckle (x, y), radius, bone lengths, a sideways lean when straight, and a colour each (a hair apart, so the light sees
// four things and draws the shadow between them)
const FK_F = {
  I: { x: 3.05, y: 8.55, r: 0.86, len: [4.25, 2.5, 2.05], lean: -0.07, col: '#F2B793' },
  M: { x: 1.02, y: 9.05, r: 0.9, len: [4.7, 2.95, 2.2], lean: 0.0, col: '#F1B790' },
  R: { x: -1.04, y: 8.8, r: 0.86, len: [4.35, 2.8, 2.1], lean: 0.05, col: '#F2B892' },
  L: { x: -2.95, y: 7.95, r: 0.76, len: [3.45, 2.15, 1.85], lean: 0.13, col: '#F1B691' },
};
const FK_ORD = ['I', 'M', 'R', 'L'];
const FK_FIST = [1.5, 1.74, 1.05];          // the joints' bend in a closed fist (knuckle, middle, end), rad
const FKC = { palm: '#EFB28C', thumb: '#F0B48F', arm: '#EDB08A', nail: '#FAD9CC', nailEdge: '#E7AE9B',
  crease: 'rgba(160,86,62,0.55)', sleeve: '#FFC23A', sleeveDk: '#DE8C16' };

// A: {lift: {I, M, R, L} 0 fist .. 1 straight, creep: {R, ...} (a lift at the knuckle only, the tip still curled),
// squeeze 0..1 (tighter), tremble: {M, R, ...} 0..1, thumb 0 (wrapped over the curled fingers) .. 1 (out, relaxed), t}
function fkGeo(A = {}) {
  const L = A.lift || {}, C = A.creep || {}, TR = A.tremble || {}, t = A.t || 0, sq = A.squeeze || 0;
  const G = { f: {} };
  for (const k of FK_ORD) {
    const F = FK_F[k], u = clamp(L[k] || 0), cr = clamp(C[k] || 0), tr = TR[k] || 0;
    const shk = tr * (0.05 * vnoise(t * 29 + F.x * 3, 3) + 0.03 * vnoise(t * 53, 7));
    const uE = E.inOutSine(u);
    // knuckle first, the other two joints follow a little later (a finger unrolls)
    const b0 = FK_FIST[0] * (1 - Math.sin(u * Math.PI / 2)) - cr * 1.05 + 0.08 * sq + shk;
    const b1 = FK_FIST[1] * (1 - uE) - cr * 0.3 + 0.06 * sq + shk * 0.6;
    const b2 = FK_FIST[2] * (1 - (1 - Math.cos(u * Math.PI / 2))) - cr * 0.15 + shk * 0.4;
    const lean = F.lean * (0.35 + 0.65 * u);
    const r = F.r, rad = [r, r * 0.93, r * 0.85, r * 0.74];
    const pts = [[F.x, F.y, 0]], dirs = [];
    let th = 0, p = pts[0];
    for (let i = 0; i < 3; i++) {
      th += [b0, b1, b2][i];
      const d = [-Math.sin(lean) * Math.cos(th), Math.cos(lean) * Math.cos(th), Math.sin(th)];
      dirs.push({ d, th });
      p = [p[0] + d[0] * F.len[i], p[1] + d[1] * F.len[i], p[2] + d[2] * F.len[i]];
      pts.push(p);
    }
    G.f[k] = { pts, rad, dirs, lift: u };
  }
  // the thumb: wrapped over the curled index and middle fingers, or out to the side
  const th = clamp(A.thumb || 0);
  const wrap = [[2.85, 2.2, 0.7], [4.25, 4.95, 2.35], [3.25, 6.75, 4.55], [1.15, 7.25, 5.75]];
  const out = [[2.85, 2.2, 0.7], [4.7, 4.6, 1.6], [5.9, 6.6, 2.0], [6.6, 8.3, 2.2]];
  G.thumb = { pts: wrap.map((p, i) => p.map((v, j) => lerp(v, out[i][j], E.inOutSine(th)))), rad: [1.3, 1.08, 0.97, 0.8] };
  return G;
}
// the palm as a cloud of points (its hull is drawn): wrist ring, knuckle line, the pads at the thumb and little-finger sides
function fkPalmPts() {
  const P = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; P.push([0.15 + 2.65 * Math.cos(a), 0.2, 1.25 * Math.sin(a)]); }
  for (const k of FK_ORD) { const F = FK_F[k]; P.push([F.x, F.y - 0.15, 1.15], [F.x, F.y - 0.15, -1.2], [F.x, F.y + F.r * 0.55, 0]); }
  P.push([3.95, 6.2, 0.2], [3.9, 7.6, -0.4], [-3.75, 6.3, 0.1], [-3.6, 7.3, -0.5], [-3.3, 2.8, 0.4]);
  P.push([3.15, 3.0, 1.95], [3.75, 4.7, 1.55], [-3.0, 3.6, 1.65], [-2.4, 5.6, 1.6], [0.6, 5.0, 1.5], [0.4, 4.5, -1.45]);
  return P;
}
// a convex hull of 2D points (monotone chain)
function fkHull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  lo.pop(); hi.pop();
  return lo.concat(hi);
}
// a closed outline through points, smoothed (quadratic curves through the midpoints)
function fkSmooth(c, P, begin = true) {
  const n = P.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (begin) c.beginPath();
  const m0 = mid(P[n - 1], P[0]); c.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const m = mid(P[i], P[(i + 1) % n]); c.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); }
  c.closePath();
}
// a tapered capsule between two projected points
function fkCap(c, a, b, ra, rb, col) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  c.fillStyle = col;
  if (L < Math.abs(ra - rb) + 0.5) { c.beginPath(); c.arc(a[0], a[1], Math.max(ra, 0.5), 0, 7); c.arc(b[0], b[1], Math.max(rb, 0.5), 0, 7); c.fill(); return; }
  const an = Math.atan2(dy, dx), d = Math.acos(clamp((ra - rb) / L, -1, 1));
  c.beginPath();
  c.arc(a[0], a[1], ra, an + d, an - d + 2 * Math.PI);
  c.arc(b[0], b[1], rb, an - d, an + d);
  c.closePath(); c.fill();
}
function fkLerp(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
// a point on finger k's surface: segment i (0..2), u along it, `side` = 'back' | 'front' (palm side), s = how far out
function fkSegPt(G, k, i, u, side = 'back', s = 1) {
  const F = G.f[k], p = fkLerp(F.pts[i], F.pts[i + 1], u), th = F.dirs[i].th, r = lerp(F.rad[i], F.rad[i + 1], u) * s;
  const n = side === 'back' ? [0, Math.sin(th), -Math.cos(th)] : [0, -Math.sin(th), Math.cos(th)];
  return [p[0] + n[0] * r, p[1] + n[1] * r, p[2] + n[2] * r];
}
function fkTip(G, k, out = 0.4) {   // just beyond the fingertip, along the last bone
  const F = G.f[k], d = F.dirs[2].d;
  return [F.pts[3][0] + d[0] * out, F.pts[3][1] + d[1] * out, F.pts[3][2] + d[2] * out];
}
// is a surface normal n (hand frame) turned toward the camera at point p? (dot of n with the way to the camera)
function fkFacing(pr, p, n) {
  const a = pr(p), b = pr([p[0] + n[0] * 0.5, p[1] + n[1] * 0.5, p[2] + n[2] * 0.5]);
  return a[3] - b[3];   // > 0: the normal points at the camera
}

// the forearm and sleeve as 3D capsules from the wrist (-y, -z), and where the sleeve's cuff is
const FK_ARM = { dir: [0, -0.86, -0.51], len: 30, cuffAt: 3.6 };
function fkArmPts(G) {
  const d = FK_ARM.dir, at = (s) => [0.15 + d[0] * s, d[1] * s, d[2] * s];
  return { w0: [0.15, 0.6, 0], w1: at(FK_ARM.cuffAt), w2: at(FK_ARM.len) };
}

// his forearm seen from behind his own shoulder (the camera at his eye): from the wrist down out of the frame, getting
// wider toward us; skin, then the coat's cuff and sleeve (screen space)
function fkPovArm(c, pr, o = {}) {
  const w0 = pr([0.15, 0.4, -0.2]), w = 2.5 * w0[2], x1 = w0[0] + (o.lean || 60), y1 = H + 260, w1 = w * 2.6;
  const cuffU = 0.3, at = (u) => [lerp(w0[0], x1, u), lerp(w0[1], y1, u), lerp(w, w1, u)];
  const quad = (u0, u1, col) => { const a = at(u0), b = at(u1); c.fillStyle = col; c.beginPath(); c.moveTo(a[0] - a[2], a[1]); c.lineTo(a[0] + a[2], a[1]); c.lineTo(b[0] + b[2], b[1]); c.lineTo(b[0] - b[2], b[1]); c.closePath(); c.fill(); };
  quad(-0.02, cuffU + 0.01, FKC.arm);
  quad(cuffU, cuffU + 0.07, o.sleeveDk || FKC.sleeveDk);
  quad(cuffU + 0.065, 1, o.sleeve || FKC.sleeve);
  const a = at(-0.02); c.fillStyle = FKC.arm; c.beginPath(); c.ellipse(a[0], a[1], a[2], a[2] * 0.45, 0, 0, 7); c.fill();
}

// draw the hand. pr = fkCam(V). o: {glass: 0..1 (drawn by fkGlass instead), noArm, sleeve, sleeveDk, hidden: {k: true}
// (fingers left out), pre(items), post(items): extra depth-sorted items [{z, fn}], flat (no paint details)}
function fkDraw(c, pr, G, o = {}) {
  const items = [];
  const add = (z, fn) => items.push({ z, fn });
  // the forearm and the sleeve (or, from behind his shoulder, the 2D one)
  if (o.povArm) add(1e6, () => fkPovArm(c, pr, o));
  else if (!o.noArm) {
    const A = fkArmPts(G), w0 = pr(A.w0), w1 = pr(A.w1), w2 = pr(A.w2);
    add((w1[3] + w2[3]) / 2 + 0.5, () => {
      fkCap(c, w1, w2, 3.05 * w1[2], 3.3 * w2[2], o.sleeve || FKC.sleeve);
      const q = pr(fkLerp(A.w1, A.w2, 0.04));
      fkCap(c, w1, q, 3.2 * w1[2], 3.2 * q[2], o.sleeveDk || FKC.sleeveDk);   // the cuff's band
    });
    add((w0[3] + w1[3]) / 2 + 0.2, () => fkCap(c, w0, w1, 2.45 * w0[2], 2.75 * w1[2], FKC.arm));
  }
  // the palm (its hull)
  const PP = fkPalmPts(), PPp = PP.map(pr), pz = pr([0.2, 5.2, 0])[3];
  add(pz, () => { c.fillStyle = FKC.palm; fkSmooth(c, fkHull(PPp.map((q) => [q[0], q[1]]))); c.fill(); });
  // palm details as paint (only when the palm faces us), knuckle bumps when the back does
  if (!o.flat) {
    const pf = fkFacing(pr, [0.3, 5, 1.3], [0, 0, 1]);
    add(pz - 0.05, () => paint(() => {
      if (pf > 0.05) {
        const a = clamp(pf * 3);
        const cr = (P, w) => { const Q = P.map(pr); c.beginPath(); c.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) c.lineTo(Q[i][0], Q[i][1]); c.lineWidth = Math.max(1.5, Q[0][2] * w); c.strokeStyle = rgba('#B36A4E', 0.5 * a); c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
        cr([[3.2, 3.4, 1.5], [2.4, 4.9, 1.45], [1.2, 6.2, 1.4]], 0.06);              // round the thumb's pad
        cr([[3.6, 6.4, 1.3], [1.4, 6.7, 1.4], [-0.6, 6.3, 1.45]], 0.05);
        cr([[-3.6, 6.9, 1.2], [-1.6, 7.4, 1.35], [0.4, 7.7, 1.35]], 0.05);
      } else if (pf < -0.05) {
        const a = clamp(-pf * 3);
        for (const k of FK_ORD) {
          const F = FK_F[k], q = pr([F.x, F.y, -0.95]);
          ellipse(c, q[0], q[1], F.r * q[2] * 0.62, F.r * q[2] * 0.42, rgba('#FFE2CE', 0.42 * a));
        }
        // the cords showing faintly under the skin, wrist to knuckles
        for (const k of FK_ORD) {
          const F = FK_F[k], a0 = pr([F.x * 0.35, 1.2, -1.3]), m = pr([F.x * 0.7, 5.0, -1.4]), b = pr([F.x, F.y - 0.5, -1.25]);
          c.beginPath(); c.moveTo(a0[0], a0[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]);
          c.lineWidth = Math.max(2, m[2] * 0.2); c.strokeStyle = rgba('#FFE8D6', 0.3 * a); c.lineCap = 'round'; c.stroke();
        }
      }
    }));
  }
  // the thumb
  const T = G.thumb, Tp = T.pts.map(pr);
  for (let i = 0; i < 3; i++) {
    add((Tp[i][3] + Tp[i + 1][3]) / 2 - 0.05 * i, () => fkCap(c, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], FKC.thumb));
  }
  if (!o.flat) {   // the thumb's nail
    const np = fkLerp(T.pts[2], T.pts[3], 0.62), dir = [T.pts[3][0] - T.pts[2][0], T.pts[3][1] - T.pts[2][1], T.pts[3][2] - T.pts[2][2]];
    const dl = Math.hypot(...dir), dn = dir.map((v) => v / dl), nrm = [-dn[1] * 0.3, dn[0] * 0.3, 0.95];
    const f = fkFacing(pr, np, nrm);
    if (f > 0.02) add(Tp[3][3] - 0.2, () => paint(() => {
      const q = pr([np[0] + nrm[0] * 0.75, np[1] + nrm[1] * 0.75, np[2] + nrm[2] * 0.75]), a2 = pr(T.pts[2]), b2 = pr(T.pts[3]);
      const an = Math.atan2(b2[1] - a2[1], b2[0] - a2[0]);
      ellipse(c, q[0], q[1], 0.62 * q[2], 0.5 * q[2] * clamp(f * 4), FKC.nailEdge, an);
      ellipse(c, q[0], q[1], 0.5 * q[2], 0.4 * q[2] * clamp(f * 4), FKC.nail, an);
    }));
  }
  // the fingers, bone by bone
  for (const k of FK_ORD) {
    if (o.hidden && o.hidden[k]) continue;
    const F = G.f[k], Pp = F.pts.map(pr), col = FK_F[k].col;
    for (let i = 0; i < 3; i++) {
      const z = (Pp[i][3] + Pp[i + 1][3]) / 2;
      add(z, () => fkCap(c, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], col));
    }
    if (o.flat) continue;
    // the nail (on the back of the last bone) and the creases over the two outer joints, as paint
    const th2 = F.dirs[2].th, nrm = [0, Math.sin(th2), -Math.cos(th2)];
    const np = fkLerp(F.pts[2], F.pts[3], 0.62), f = fkFacing(pr, np, nrm);
    if (f > 0.02) add((Pp[2][3] + Pp[3][3]) / 2 - 0.02, () => paint(() => {
      const n0 = pr(fkSegPt(G, k, 2, 0.4, 'back', 0.9)), n1 = pr(fkSegPt(G, k, 2, 0.97, 'back', 0.84));
      const w = F.rad[3] * 0.62 * (n0[2] + n1[2]) / 2 * (0.5 + 0.5 * clamp(f * 3));
      fkCap(c, n0, n1, w, w * 0.92, FKC.nailEdge); fkCap(c, n0, n1, w * 0.8, w * 0.74, FKC.nail);
    }));
    for (let i = 1; i <= 2; i++) {
      const thm = (F.dirs[i - 1].th + F.dirs[i].th) / 2, n2 = [0, Math.sin(thm), -Math.cos(thm)];
      const f2 = fkFacing(pr, F.pts[i], n2);
      if (f2 < 0.02) continue;
      add(Pp[i][3] - 0.03, () => paint(() => {
        const q = pr(fkSegPt(G, k, i - 1, 0.98, 'back', 0.96)), d0 = pr(F.pts[i - 1]), d1 = pr(F.pts[i]);
        const an = Math.atan2(d1[1] - d0[1], d1[0] - d0[0]) + Math.PI / 2, w = F.rad[i] * q[2] * 0.42;
        c.strokeStyle = FKC.crease; c.lineWidth = Math.max(1.5, q[2] * 0.07); c.lineCap = 'round';
        c.beginPath(); c.moveTo(q[0] - Math.cos(an) * w, q[1] - Math.sin(an) * w); c.lineTo(q[0] + Math.cos(an) * w, q[1] + Math.sin(an) * w); c.stroke();
      }));
    }
  }
  if (o.items) for (const it of o.items) items.push(it);
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.fn();
}

// ---------------------------------------------------------------- handcuffs round two fingers
// a cuff = a steel band round finger k's first bone at u, with a lock box on the side facing the other cuff; a short chain
// joins the boxes. o: {k: in (0..1; they swing in from `from`, a screen offset), ua, ub, taut, shine}
function fkCuffRing(pr, G, k, u) {
  const F = G.f[k], p = fkLerp(F.pts[0], F.pts[1], u), d = F.dirs[0].d, r = lerp(F.rad[0], F.rad[1], u) + 0.3;
  const a1 = [1, 0, 0], a2 = [d[1] * a1[2] - d[2] * a1[1], d[2] * a1[0] - d[0] * a1[2], d[0] * a1[1] - d[1] * a1[0]];
  const n2 = Math.hypot(...a2), b2 = a2.map((v) => v / n2);
  const ring = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    ring.push([p[0] + (a1[0] * Math.cos(a) + b2[0] * Math.sin(a)) * r, p[1] + (a1[1] * Math.cos(a) + b2[1] * Math.sin(a)) * r, p[2] + (a1[2] * Math.cos(a) + b2[2] * Math.sin(a)) * r]);
  }
  return { ring, ringP: ring.map(pr), centre: pr(p), r };
}
function fkCuffItems(c, pr, G, ka, kb, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return [];
  const items = [], s = E.outBack(k, 1.8), off = o.from || [0, 0], dx = off[0] * (1 - s), dy = off[1] * (1 - s);
  const A = fkCuffRing(pr, G, ka, o.ua || 0.55), B = fkCuffRing(pr, G, kb, o.ub || 0.5);
  const steel = '#B9C1CE', steelDk = '#3E4656', hi = '#F6F9FF';
  const band = (R, front) => {
    const n = R.ringP.length, cz = R.centre[3], w = Math.max(7, 0.62 * R.centre[2]);
    c.save(); c.translate(dx, dy); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [col, ww] of [[steelDk, w * 1.45], [steel, w]]) {
      c.strokeStyle = col; c.lineWidth = ww; c.beginPath();
      let pen = false;
      for (let i = 0; i < n - 1; i++) {
        const a = R.ringP[i], b = R.ringP[i + 1];
        if (((a[3] + b[3]) / 2 < cz) !== front) { pen = false; continue; }
        if (!pen) { c.moveTo(a[0], a[1]); pen = true; }
        c.lineTo(b[0], b[1]);
      }
      c.stroke();
    }
    c.restore();
  };
  // where each lock box sits: the ring point nearest the other cuff (on screen), on the near half
  const nearTo = (R, P) => R.ringP.slice(0, -1).filter((q) => q[3] <= R.centre[3] + 0.2).reduce((m, q) => (Math.hypot(q[0] - P[0], q[1] - P[1]) < Math.hypot(m[0] - P[0], m[1] - P[1]) ? q : m), R.ringP[0]);
  const bA = nearTo(A, B.centre), bB = nearTo(B, A.centre);
  const box = (q, other) => {
    const an = Math.atan2(other[1] - q[1], other[0] - q[0]), w = 0.95 * q[2], h = 0.62 * q[2];
    c.save(); c.translate(q[0] + dx, q[1] + dy); c.rotate(an);
    c.fillStyle = steelDk; rrect(c, -w * 0.15 - 3, -h / 2 - 3, w + 6, h + 6, h * 0.3); c.fill();
    c.fillStyle = steel; rrect(c, -w * 0.15, -h / 2, w, h, h * 0.25); c.fill();
    paint(() => { c.fillStyle = steelDk; c.beginPath(); c.arc(w * 0.3, 0, h * 0.16, 0, 7); c.fill(); c.fillRect(w * 0.3 - h * 0.05, 0, h * 0.1, h * 0.26); });
    c.restore();
  };
  const chain = () => {
    const pa = [bA[0] + Math.cos(Math.atan2(bB[1] - bA[1], bB[0] - bA[0])) * bA[2] * 0.8, bA[1] + Math.sin(Math.atan2(bB[1] - bA[1], bB[0] - bA[0])) * bA[2] * 0.8];
    const pb = [bB[0] + Math.cos(Math.atan2(bA[1] - bB[1], bA[0] - bB[0])) * bB[2] * 0.8, bB[1] + Math.sin(Math.atan2(bA[1] - bB[1], bA[0] - bB[0])) * bB[2] * 0.8];
    const sag = (o.taut ? 0.15 : 1) * 0.16 * Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) + 4;
    const L = 2, lw = Math.max(5, (bA[2] + bB[2]) * 0.09), an0 = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
    c.save(); c.translate(dx, dy);
    for (let i = 0; i < L; i++) {
      const u0 = (i + 0.5) / L, x = lerp(pa[0], pb[0], u0), y = lerp(pa[1], pb[1], u0) + sag * Math.sin(Math.PI * u0);
      c.save(); c.translate(x, y); c.rotate(an0 + (i % 2 ? 0.5 : -0.3));
      const rx = Math.max(10, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / L * 0.62), ry = rx * 0.5;
      c.lineWidth = lw * 1.6; c.strokeStyle = steelDk; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.stroke();
      c.lineWidth = lw; c.strokeStyle = steel; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.stroke();
      c.restore();
    }
    c.restore();
  };
  for (const R of [A, B]) items.push({ z: R.centre[3] + 0.9, fn: () => band(R, false) });
  for (const R of [A, B]) items.push({ z: R.centre[3] - 1.4, fn: () => {
    band(R, true);
    paint(() => {
      const fr = R.ringP.filter((q) => q[3] < R.centre[3]);
      const q = fr[Math.floor(fr.length * 0.3)];
      if (q) { c.save(); c.translate(dx, dy); circle(c, q[0], q[1], Math.max(3, 0.18 * q[2]), rgba(hi, 0.95 * (o.shine === undefined ? 1 : o.shine))); c.restore(); }
    });
  } });
  items.push({ z: Math.min(A.centre[3], B.centre[3]) - 1.7, fn: () => { chain(); box(bA, bB); box(bB, bA); } });
  return items;
}

// ---------------------------------------------------------------- glass and what is inside
// the same hand again on a scratch layer in one colour, laid over at one alpha: see-through skin that never darkens
// where two parts overlap. k 0..1. The glass is rosy (#93507C) with a lighter heart; an outline of light round it
function fkGlass(c, pr, G, k, o = {}) {
  if (k <= 0.01) return;
  const m = c.getTransform();
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
  tctx.setTransform(m);
  const col = '#93507C';
  if (!o.noArm) {
    const A = fkArmPts(G), w0 = pr(A.w0), w1 = pr(A.w1);
    fkCap(tctx, w0, w1, 2.45 * w0[2], 2.75 * w1[2], col);
  }
  tctx.fillStyle = col; fkSmooth(tctx, fkHull(fkPalmPts().map(pr).map((q) => [q[0], q[1]]))); tctx.fill();
  const T = G.thumb, Tp = T.pts.map(pr);
  for (let i = 0; i < 3; i++) fkCap(tctx, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], col);
  for (const kk of FK_ORD) {
    const F = G.f[kk], Pp = F.pts.map(pr);
    for (let i = 0; i < 3; i++) fkCap(tctx, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], col);
  }
  // a lighter heart (the middle of the hand)
  tctx.globalCompositeOperation = 'source-atop';
  const q = pr([0.2, 6.0, -1.3]), g = tctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], q[2] * 7);
  g.addColorStop(0, 'rgba(232,170,205,0.75)'); g.addColorStop(1, 'rgba(232,170,205,0)');
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
  tctx.globalCompositeOperation = 'source-over';
  paint(() => {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.6 * k; c.drawImage(tintC, 0, 0); c.restore();
    c.save(); c.lineWidth = 4; c.strokeStyle = `rgba(255,214,236,${0.55 * k})`; fkSmooth(c, fkHull(fkPalmPts().map(pr).map((q) => [q[0], q[1]]))); c.stroke(); c.restore();
  });
}
// the cords on the back of the hand: from the forearm over the back of the hand to each knuckle and along the top of the
// finger. o: {k, glow: {I, M, R, L}, slide: {..} (beads moving toward the wrist when it pulls), cuffs: [{a, b, k, lock,
// taut}] (handcuffs between two cords, just behind the knuckles), t}
function fkCordPath(G, k) {
  const F = FK_F[k], f = G.f[k];
  const pts = [[F.x * 0.25, -3.5, -2.2], [F.x * 0.45, 1.4, -1.55], [F.x * 0.82, 5.2, -1.6], [F.x, F.y - 0.35, -1.3]];
  pts.push(fkSegPt(G, k, 0, 0.0, 'back', 1.0), fkSegPt(G, k, 0, 0.5, 'back', 0.98), fkSegPt(G, k, 0, 1.0, 'back', 0.98), fkSegPt(G, k, 1, 0.35, 'back', 0.96));
  return pts;
}
function fkDense(P, n = 6) { const out = []; for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < n; j++) out.push(fkLerp(P[i], P[i + 1], j / n)); out.push(P[P.length - 1]); return out; }
// where on a cord its junction (the cuff) sits: y on the back of the hand
const FK_JY = { MR: 6.9, RL: 6.3 };
function fkCordAt(G, k, y) {
  const S = fkDense(fkCordPath(G, k), 10);
  let best = S[0];
  for (const p of S) if (Math.abs(p[1] - y) < Math.abs(best[1] - y) && p[1] < FK_F[k].y) best = p;
  return best;
}
function fkInside(c, g, pr, G, o = {}) {
  const k = clamp(o.k || 0);
  if (k <= 0.01) return;
  paint(() => {
    for (const kk of FK_ORD) {
      const S = fkDense(fkCordPath(G, kk)).map(pr), gl = (o.glow && o.glow[kk]) || 0;
      const wpx = Math.max(5, S[Math.floor(S.length / 2)][2] * 0.36);
      poly(c, S.map((q) => [q[0], q[1]]), wpx * 1.45, rgba('#4A2440', 0.6 * k));
      poly(c, S.map((q) => [q[0], q[1]]), wpx, rgba(mixH('#FFF1D9', '#FFF3A0', gl), k));
      if (gl > 0.01) poly(g, S.map((q) => [q[0], q[1]]), wpx * 1.7, rgba('#FFE38A', 0.3 * gl * k));
      const sl = (o.slide && o.slide[kk]) || 0;
      if (Math.abs(sl) > 0.01) {
        const P2 = S.map((q) => [q[0], q[1]]), acc = polyLen(P2), Lc = acc[acc.length - 1];
        for (let i = 0; i < 5; i++) {
          const u = ((i / 5 - (o.t || 0) * 0.8 * Math.sign(sl)) % 1 + 1) % 1, q = polyAt(P2, acc, u * Lc);
          circle(c, q[0], q[1], wpx * 0.55, rgba('#FFFFFF', 0.9 * Math.min(1, Math.abs(sl)) * k));
          circle(g, q[0], q[1], wpx * 1.0, rgba('#FFE38A', 0.3 * Math.min(1, Math.abs(sl)) * k));
        }
      }
    }
    for (const cf of o.cuffs || []) fkCordCuffs(c, g, pr, G, cf, k);
  });
}
// tiny handcuffs between two cords: cf = {a: 'R', b: 'M', y, k, lock, taut, glow}
function fkCordCuffs(c, g, pr, G, cf, kk = 1) {
  const k = clamp(cf.k === undefined ? 1 : cf.k) * kk;
  if (k <= 0.01) return;
  const pa = pr(fkCordAt(G, cf.a, cf.y)), pb = pr(fkCordAt(G, cf.b, cf.y));
  const s = E.outBack(clamp(k), 2.2), r = Math.max(13, pa[2] * 0.66) * s;
  const steel = '#C3CAD6', steelDk = '#4E5666';
  // the chain first, then a ring round each cord
  const sag = (1 - (cf.taut || 0)) * 0.22 * Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const u0 = (i + 0.5) / n, x = lerp(pa[0], pb[0], u0), y = lerp(pa[1], pb[1], u0) + sag * Math.sin(Math.PI * u0);
    const an = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) + (i % 2 ? 0.6 : -0.3), lw = r * 0.26;
    c.save(); c.translate(x, y); c.rotate(an);
    c.lineWidth = lw * 1.7; c.strokeStyle = steelDk; c.beginPath(); c.ellipse(0, 0, r * 0.62, r * 0.34, 0, 0, 7); c.stroke();
    c.lineWidth = lw; c.strokeStyle = steel; c.beginPath(); c.ellipse(0, 0, r * 0.62, r * 0.34, 0, 0, 7); c.stroke();
    c.restore();
  }
  for (const p of [pa, pb]) {
    const lock = clamp(cf.lock === undefined ? 1 : cf.lock), gap = (1 - lock) * 1.1;
    circle(c, p[0], p[1], r * 1.32, rgba('#1A1028', 0.55));
    c.lineCap = 'round';
    c.lineWidth = r * 0.42; c.strokeStyle = steelDk; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2 + gap, Math.PI * 1.5 - 0.05); c.stroke();
    c.lineWidth = r * 0.26; c.strokeStyle = steel; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2 + gap, Math.PI * 1.5 - 0.05); c.stroke();
    circle(c, p[0] + r * 0.62, p[1] - r * 0.62, r * 0.13, '#FFFFFF');
    if ((cf.glow || 0) > 0.01) circle(g, p[0], p[1], r * 1.6, rgba('#BFF0FF', 0.35 * cf.glow * k));
  }
}
