// hand3d.js — his RIGHT hand lying palm down on a table, in 3D: centimetres, x to the screen's right, y up off the
// table, z toward the camera (the fingers point at us). One perspective camera (hvCam) projects it into world
// coordinates (= the 1080x1920 frame at zoom 1), so a scene's 2D camera (applyCam) can still push or shake on top.
// Seen from in front, the fingers lie left to right: little, ring, middle, index, then the thumb.
// What is in it: the hand (`hdDraw`: lift any finger, fold the middle one under, tremble the ring one), the table
// shadow under it, his forearm with a pushed-up sleeve, the inside of the hand seen through glass (`hdInside`: the
// cords, the lifting muscles in the forearm, the straps between the cords), a leash from the ring finger to the folded
// middle finger's knuckle, and a face on that knuckle.
'use strict';

// ---------------------------------------------------------------- the camera
// V: {phi: how far above the table it looks down (rad), tx, ty, tz: the point it looks at (cm), D: its distance (cm),
// f: focal length (px), cx, cy: where that point lands}. pr(p) -> [x, y, k (px per cm there), depth (cm)]
function hvCam(V) {
  const s = Math.sin(V.phi), c = Math.cos(V.phi);
  const C = [V.tx, V.ty + V.D * s, V.tz + V.D * c];
  return (p) => {
    const vx = p[0] - C[0], vy = p[1] - C[1], vz = p[2] - C[2];
    const z = -vy * s - vz * c, y = vy * c - vz * s, k = V.f / Math.max(2, z);
    return [V.cx + vx * k, V.cy - y * k, k, z];
  };
}
// keyed camera: keys [[t, phi, tx, ty, tz, D, cx, cy], ...] eased in-out; f is fixed
const HV_F = 3700;
function hvKeys(t, keys) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], t)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return { phi: k[1], tx: k[2], ty: k[3], tz: k[4], D: k[5], f: HV_F, cx: k[6], cy: k[7] };
}

// ---------------------------------------------------------------- the hand
// four fingers: knuckle x and z, radius, the three bones' lengths, and a colour each (a hair apart, so the light sees
// four things and draws the shadow between them)
const HF = {
  L: { x: -3.55, z: -0.95, r: 0.70, len: [3.4, 2.1, 1.8], col: '#F1B691' },
  R: { x: -1.25, z: 0.12, r: 0.79, len: [4.3, 2.7, 2.1], col: '#F2B892' },
  M: { x: 1.07, z: 0.34, r: 0.83, len: [4.6, 2.9, 2.2], col: '#F1B790' },
  I: { x: 3.30, z: -0.06, r: 0.81, len: [4.2, 2.5, 2.0], col: '#F2B793' },
};
const HF_ORD = ['L', 'R', 'M', 'I'];
const HD = { dorsum: '#EFB28C', thumb: '#F0B48F', arm: '#EDB08A', nail: '#FAD9CC', nailEdge: '#E9B3A2', crease: 'rgba(170,96,70,0.5)',
  shadow: 'rgba(40,18,10,0.30)' };

// a finger's joints [knuckle, middle joint, end joint, tip] for knuckle height Y: lying with its tip on the table,
// lifted by `lift` (rad), or folded under (fold 0..1: up and curled, then tucked under with the middle joint on the table)
function hdFinger(F, Y, lift = 0, fold = 0) {
  const r = F.r, rt = r * 0.72, Wt = [1, 0.85, 0.6], B = [0, 0.1, 0.16];
  const tipY = (a) => { let y = Y; for (let i = 0; i < 3; i++) y -= F.len[i] * Math.sin(a * Wt[i] + B[i]); return y; };
  let lo = -0.3, hi = 1.5;
  for (let it = 0; it < 20; it++) { const m = (lo + hi) / 2; if (tipY(m) > rt) lo = m; else hi = m; }
  const a = (lo + hi) / 2;
  let P = [a * Wt[0] + B[0] - lift, a * Wt[1] + B[1] * (1 - 0.6 * clamp(lift * 2)) - lift * 0.9, a * Wt[2] + B[2] * (1 - 0.6 * clamp(lift * 2)) - lift * 0.8];
  if (fold > 0) {
    const curl = [-0.25, 1.75, 1.55];                                             // halfway: up off the table and curled
    const tuck = [Math.asin(clamp((Y - r * 1.02) / F.len[0], -1, 1)), Math.PI - 0.12, Math.PI + 0.95];   // tucked under
    const u1 = E.inOutSine(clamp(fold * 2)), u2 = E.inOutSine(clamp(fold * 2 - 1));
    P = P.map((p, i) => lerp(lerp(p, curl[i], u1), tuck[i], u2));
  }
  const pts = [[F.x, Y, F.z]];
  let p = pts[0];
  const rad = [r, r * 0.92, r * 0.84, rt];
  for (let i = 0; i < 3; i++) {
    p = [p[0], p[1] - F.len[i] * Math.sin(P[i]), p[2] + F.len[i] * Math.cos(P[i])];
    p[1] = Math.max(p[1], rad[i + 1] * 0.98);                                     // never through the table
    pts.push(p);
  }
  return { pts, rad, P };
}
function hdThumb(Y, lift = 0) {
  const L = lift;
  return { pts: [[4.2, Y * 0.66, -5.6], [5.85, Y * 0.46 + 0.35 + L * 0.9, -3.1], [6.55, 1.05 + L * 2.5, -1.0 + L * 0.3], [6.85, 0.9 + L * 3.4, 0.85 - L * 0.2]],
    rad: [1.25, 1.0, 0.92, 0.72] };
}
// the hand's state: A = {Y: knuckle height, lift: {L, R, M, I, T}, fold: middle 0..1, tremble: 0..1 (the ring finger's
// strain), t}. Y defaults to 2.3 flat and 3.5 with the middle finger tucked under (the hand tents up over it)
function hdGeo(A) {
  const fold = A.fold || 0, Y = A.Y !== undefined ? A.Y : lerp(2.3, 3.5, E.inOutSine(clamp(fold * 1.4))), L = A.lift || {};
  const tr = A.tremble || 0, t = A.t || 0;
  const shk = tr * 0.035 * (vnoise(t * 31, 3) + 0.5 * vnoise(t * 57, 9));
  const G = { Y, f: {}, fold };
  for (const k of HF_ORD) {
    let lift = L[k] || 0;
    if (k === 'R') lift += Math.max(0, shk + tr * 0.03);
    G.f[k] = hdFinger(HF[k], Y + (k === 'R' ? 0 : tr * 0.02 * vnoise(t * 23, 5)), lift, k === 'M' ? fold : 0);
  }
  G.thumb = hdThumb(Y, L.T || 0);
  G.wrist = [0.15, Y - 0.15, -8.3];
  return G;
}
// the back of the hand as a 3D outline (from the little-finger side of the wrist round to the thumb side)
function hdDorsum(G) {
  const Y = G.Y, f = G.f, top = (k, dz) => [HF[k].x, Y + HF[k].r * 0.78, HF[k].z + dz];
  return [[-2.95, Y - 0.3, -8.4], [-4.0, Y - 0.55, -4.6], [-4.3, Y - 0.6, -1.4], [-4.2, Y - 0.25, -0.7], top('L', -0.35),
    [-2.4, Y + 0.62, -0.1], top('R', 0.05), [-0.05, Y + 0.7, 0.35], top('M', 0.2), [2.2, Y + 0.68, 0.25], top('I', 0.0),
    [4.15, Y - 0.15, -0.4], [4.45, Y - 0.45, -1.9], [4.75, Y * 0.5, -3.3], [3.95, Y * 0.55, -5.9], [3.1, Y - 0.25, -8.4]];
}

// a tapered capsule between two projected points (world coordinates)
function hdCap(c, a, b, ra, rb, col) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  c.fillStyle = col;
  if (L < Math.abs(ra - rb) + 0.5) { c.beginPath(); c.arc(a[0], a[1], Math.max(ra, 0.5), 0, 7); c.arc(b[0], b[1], Math.max(rb, 0.5), 0, 7); c.fill(); return; }
  const an = Math.atan2(dy, dx), d = Math.acos(clamp((ra - rb) / L, -1, 1));
  c.beginPath();
  c.arc(a[0], a[1], ra, an + d, an - d + 2 * Math.PI);
  c.arc(b[0], b[1], rb, an - d, an + d);
  c.closePath(); c.fill();
}
// a capsule added to the current path as its own subpath (always the same winding), so several of them fill as ONE
// shape with nonzero winding (see-through glass that does not darken where two overlap)
function hdCapPath(c, a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  if (L < Math.abs(ra - rb) + 0.5) { const r = Math.max(ra, rb, 0.5), p = ra >= rb ? a : b; c.moveTo(p[0] + r, p[1]); c.arc(p[0], p[1], r, 0, 2 * Math.PI); return; }
  const an = Math.atan2(dy, dx), d = Math.acos(clamp((ra - rb) / L, -1, 1));
  c.moveTo(a[0] + ra * Math.cos(an + d), a[1] + ra * Math.sin(an + d));
  c.arc(a[0], a[1], ra, an + d, an - d + 2 * Math.PI);
  c.arc(b[0], b[1], rb, an - d, an + d);
  c.closePath();
}
// a closed outline through projected points, smoothed (quadratic curves through the midpoints)
function hdSmooth(c, P, begin = true) {
  const n = P.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (begin) c.beginPath();
  const m0 = mid(P[n - 1], P[0]); c.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const m = mid(P[i], P[(i + 1) % n]); c.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); }
  c.closePath();
}
// a point on the top surface of a finger segment (offset up off its centre line, perpendicular to it)
function hdTop(p, pitch, r, s = 1) { return [p[0], p[1] + Math.cos(pitch) * r * s, p[2] + Math.sin(pitch) * r * s]; }

// the hand and his forearm. pr = hvCam(V). o: {sleeve: '#hex' (his sleeve colour), cuffZ, glass (0..1: see-through),
// noArm, nails, shadow (1), shadowFrom: the light's lean on the table}
function hdDraw(c, pr, G, o = {}) {
  const Y = G.Y, prS = pr, hop = o.hop || 0;
  if (hop) pr = (p) => prS([p[0], p[1] + hop, p[2]]);   // the hand lifted off the table (its shadow stays down)
  // the shadow on the table: every finger and the palm, flattened, a little toward the right and away from the lamp
  if (o.shadow !== 0) paint(() => {
    c.save();
    const sh = (p) => prS([p[0] + 0.32 * (p[1] + hop), 0.02, p[2] - 0.12 * (p[1] + hop)]);
    c.globalAlpha = (o.shadow === undefined ? 1 : o.shadow);
    const out = hdDorsum(G).map((p) => sh([p[0], p[1] * 0.6, p[2]]));
    c.fillStyle = HD.shadow; hdSmooth(c, out); c.fill();
    for (const k of HF_ORD) {
      const F = G.f[k];
      for (let i = 0; i < 3; i++) { const a = sh(F.pts[i]), b = sh(F.pts[i + 1]); hdCap(c, a, b, F.rad[i] * a[2] * 0.95, F.rad[i + 1] * b[2] * 0.95, HD.shadow); }
    }
    const T = G.thumb;
    for (let i = 0; i < 3; i++) { const a = sh(T.pts[i]), b = sh(T.pts[i + 1]); hdCap(c, a, b, T.rad[i] * a[2], T.rad[i + 1] * b[2], HD.shadow); }
    c.restore();
  });
  // forearm: bare from the wrist to a pushed-up sleeve, then the sleeve (it runs back toward his shoulder)
  if (o.armTo) {   // seen from across the table: a short bare forearm, then the sleeve back to his shoulder (screen points)
    const w0 = pr(G.wrist), w1 = pr([-0.3, Y + 0.25, -9.4]), w2 = pr([-0.9, Y + 1.0, -12.5]);
    const sw = o.armW || 90, el = o.elbow || [lerp(o.armTo[0], w2[0], 0.45) - 30, Math.max(o.armTo[1], w2[1]) + 40];
    hdCap(c, o.armTo, el, sw * 0.5, sw * 0.5, o.sleeve || '#3E8E5E');
    hdCap(c, el, w2, sw * 0.5, 3.6 * w2[2], o.sleeve || '#3E8E5E');
    hdCap(c, w2, w1, 3.6 * w2[2], 3.3 * w1[2], o.sleeve || '#3E8E5E');
    paint(() => { const q = pr([-0.35, Y + 0.3, -9.7]); c.fillStyle = o.sleeveDk || '#357A50'; c.beginPath(); c.ellipse(q[0], q[1], 3.1 * q[2], 1.1 * q[2], 0, 0, 7); c.fill(); });   // the cuff's rib
    hdCap(c, w1, w0, 2.75 * w1[2], 2.55 * w0[2], HD.arm);
  } else if (!o.noArm) {
    const w0 = pr(G.wrist), cz = o.cuffZ || -17, w1 = pr([-1.6, Y + 1.0, cz]), w2 = pr([-3.4, Y + 2.6, cz - 6]), w3 = pr([-6.2, Y + 5.5, cz - 16]);
    hdCap(c, w3, w2, 4.3 * w3[2], 4.1 * w2[2], o.sleeve || '#3E8E5E');
    hdCap(c, w2, w1, 4.1 * w2[2], 3.6 * w1[2], o.sleeveDk || '#357A50');           // the pushed-up roll
    hdCap(c, w1, w0, 2.95 * w1[2], 2.55 * w0[2], HD.arm);
  }
  // the back of the hand
  const D = hdDorsum(G).map(pr);
  c.fillStyle = HD.dorsum; hdSmooth(c, D); c.fill();
  // the thumb (its own colour)
  const T = G.thumb, Tp = T.pts.map(pr);
  for (let i = 0; i < 3; i++) hdCap(c, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], HD.thumb);
  // the fingers, the farthest first
  const ord = HF_ORD.slice().sort((a, b) => pr(G.f[b].pts[3])[3] - pr(G.f[a].pts[3])[3]);
  for (const k of ord) {
    const F = G.f[k], Pp = F.pts.map(pr);
    if (k === 'M' && G.fold > 0.5) {   // tucked: the two outer bones go under the palm, drawn first, then the near bone over them
      for (let i = 2; i >= 0; i--) hdCap(c, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], HF[k].col);
    } else for (let i = 0; i < 3; i++) hdCap(c, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], HF[k].col);
    // the nail and the creases are paint on the finger
    paint(() => {
      const p2 = F.P[2];
      if (!(k === 'M' && G.fold > 0.35)) {
        const n0 = pr(hdTop(lerpP(F.pts[2], F.pts[3], 0.42), p2, F.rad[3], 0.92)), n1 = pr(hdTop(lerpP(F.pts[2], F.pts[3], 0.98), p2, F.rad[3], 0.86));
        const nw = F.rad[3] * 0.62 * (n0[2] + n1[2]) / 2;
        hdCap(c, n0, n1, nw, nw * 0.92, HD.nailEdge);
        hdCap(c, n0, n1, nw * 0.8, nw * 0.74, HD.nail);
      }
      for (let i = 1; i <= 2; i++) {   // knuckle creases on the top of the middle and end joints
        if (k === 'M' && G.fold > 0.35 && i === 2) continue;
        const q = pr(hdTop(F.pts[i], (F.P[i - 1] + F.P[i]) / 2, F.rad[i], 0.95)), w = F.rad[i] * q[2] * 0.42;
        c.strokeStyle = HD.crease; c.lineWidth = Math.max(1.5, q[2] * 0.07); c.lineCap = 'round';
        c.beginPath(); c.moveTo(q[0] - w, q[1] - w * 0.12); c.quadraticCurveTo(q[0], q[1] + w * 0.25, q[0] + w, q[1] - w * 0.12); c.stroke();
      }
    });
  }
  // knuckle bumps and the cords showing faintly under the skin (paint: soft highlights)
  paint(() => {
    if (!o.noRidges) for (const k of HF_ORD) {
      const x0 = { L: -2.2, R: -0.9, M: 0.35, I: 1.5 }[k];
      const a = pr([x0 * 0.95, Y + 0.05, -7.6]), m = pr([lerp(x0, HF[k].x, 0.6), Y + 0.32, -3.6]), b = pr([HF[k].x, Y + HF[k].r * 0.7, HF[k].z - 0.9]);
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]);
      c.lineWidth = Math.max(3, m[2] * 0.22); c.strokeStyle = 'rgba(255,232,214,0.32)'; c.lineCap = 'round'; c.stroke();
    }
    for (const k of HF_ORD) {
      const q = pr([HF[k].x, Y + HF[k].r * 0.85, HF[k].z - 0.1]);
      c.fillStyle = 'rgba(255,226,206,0.35)'; c.beginPath(); c.ellipse(q[0], q[1], HF[k].r * q[2] * 0.55, HF[k].r * q[2] * 0.3, 0, 0, 7); c.fill();
    }
  });
}
function lerpP(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }

// the same silhouettes again in see-through glass over the hand and forearm (k 0..1): one cool tint over the union of
// every part (filled once, so nothing darkens where two parts overlap), and a rim of light round the back of the hand
function hdGlass(c, pr, G, k, o = {}) {
  if (k <= 0.01) return;
  // every part drawn opaque on a scratch layer, then laid over the hand at one alpha: no part darkens another
  const m = c.getTransform();
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
  tctx.setTransform(m);
  const col = '#10225A', Y = G.Y;
  if (!o.noArm) {
    const w0 = pr(G.wrist), cz = o.cuffZ || -17, w1 = pr([-1.6, Y + 1.0, cz]), w2 = pr([-3.4, Y + 2.6, cz - 6]), w3 = pr([-6.2, Y + 5.5, cz - 16]);
    hdCap(tctx, w3, w2, 4.3 * w3[2], 4.1 * w2[2], col); hdCap(tctx, w2, w1, 4.1 * w2[2], 3.6 * w1[2], col); hdCap(tctx, w1, w0, 2.95 * w1[2], 2.55 * w0[2], col);
  }
  tctx.fillStyle = col; hdSmooth(tctx, hdDorsum(G).map(pr)); tctx.fill();
  const T = G.thumb, Tp = T.pts.map(pr);
  for (let i = 0; i < 3; i++) hdCap(tctx, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], col);
  for (const kk of HF_ORD) {
    const F = G.f[kk], Pp = F.pts.map(pr);
    for (let i = 0; i < 3; i++) hdCap(tctx, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], col);
  }
  paint(() => {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.68 * k; c.drawImage(tintC, 0, 0); c.restore();
    c.save(); hdSmooth(c, hdDorsum(G).map(pr)); c.lineWidth = 3; c.strokeStyle = `rgba(150,225,255,${0.5 * k})`; c.stroke(); c.restore();
  });
}

// ---------------------------------------------------------------- inside the hand
// the cord (tendon) of finger k as a 3D polyline: from the forearm through the wrist, over the knuckle, along the top
// of the finger to the last joint
function hdCordPath(G, k, zFrom = -15) {
  const F = G.f[k], Y = G.Y, x0 = { L: -2.2, R: -0.9, M: 0.35, I: 1.5 }[k];
  const pts = [[x0 * 0.7 - 0.6, Y + 1.2, zFrom], [x0, Y + 0.55, -8.6], [lerp(x0, HF[k].x, 0.55), Y + 0.62, -4.4], hdTop(F.pts[0], F.P[0], F.rad[0], 0.9)];
  for (let i = 1; i < 3; i++) pts.push(hdTop(F.pts[i], (F.P[i - 1] + F.P[i]) / 2, F.rad[i], 0.9));
  if (!(k === 'M' && G.fold > 0.4)) pts.push(hdTop(lerpP(F.pts[2], F.pts[3], 0.45), F.P[2], F.rad[3], 0.85));
  return pts;
}
function dense3(P, n = 6) {   // a few points between each pair, so the projection bends smoothly
  const out = [];
  for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < n; j++) out.push(lerpP(P[i], P[i + 1], j / n));
  out.push(P[P.length - 1]);
  return out;
}
// where along a cord a point at fraction u (0 = forearm end) is, in world coordinates
function hdAlong(S, u) { const acc = polyLen(S); return polyAt(S, acc, u * acc[acc.length - 1]); }

// the lifting muscles in the forearm (3D spindles on its top, under the glass): shared (the four cords), the two
// spares (index, little), and the empty place where a ring-finger spare would be
const HM = {
  shared: { a: [-2.3, 0, -31], b: [-0.6, 0, -14.5], w: 2.6, col: '#E0485C', dk: '#9E2238' },
  spareI: { a: [1.4, 0, -25], b: [1.9, 0, -11.5], w: 1.15, col: '#7DFFC4', dk: '#1F8A5C' },
  spareL: { a: [-4.8, 0, -30], b: [-3.3, 0, -13], w: 1.1, col: '#7DFFC4', dk: '#1F8A5C' },
  ghostR: { a: [-0.9, 0, -24], b: [-0.6, 0, -12.5], w: 1.0 },
};
function hmPt(G, p, lift = 1.2) {   // a point on the forearm's top: the arm rises toward the elbow
  const z = p[2], u = clamp((-z - 8) / 14);
  return [p[0] - 0.6 * u * 6, G.Y + lift + u * 1.9 * 2.2, z];
}
// draw one spindle muscle: k = pump (0..1: fattens, brightens), a = alpha, dashed = the empty place
function hmSpindle(c, g, pr, G, M, o = {}) {
  const n = 18, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = lerpP(M.a, M.b, u), q = pr(hmPt(G, p));
    const wv = M.w * Math.sin(Math.PI * clamp(u * 1.05)) * (1 + 0.35 * (o.k || 0));
    const nxt = pr(hmPt(G, lerpP(M.a, M.b, Math.min(1, u + 0.02)))), prv = pr(hmPt(G, lerpP(M.a, M.b, Math.max(0, u - 0.02))));
    const dx = nxt[0] - prv[0], dy = nxt[1] - prv[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    L.push([q[0] + nx * wv * q[2], q[1] + ny * wv * q[2]]); R.push([q[0] - nx * wv * q[2], q[1] - ny * wv * q[2]]);
  }
  const path = (cc) => { cc.beginPath(); L.forEach((p, i) => cc[i ? 'lineTo' : 'moveTo'](p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) cc.lineTo(R[i][0], R[i][1]); cc.closePath(); };
  const a = o.a === undefined ? 1 : o.a;
  if (a <= 0.01) return;
  c.save(); c.globalAlpha = a;
  if (o.dashed) {
    path(c); c.setLineDash([14, 12]); c.lineWidth = 5; c.strokeStyle = o.col || '#C8A8FF'; c.stroke(); c.setLineDash([]);
  } else {
    path(c); c.fillStyle = M.dk; c.fill();
    c.save(); path(c); c.clip();
    for (let i = 1; i < 7; i++) {   // the fibres
      const s0 = i / 7, row = [];
      for (let j = 0; j <= n; j++) row.push([lerp(R[j][0], L[j][0], s0), lerp(R[j][1], L[j][1], s0)]);
      poly(c, row, 3, rgba(M.col, 0.9));
    }
    c.restore();
    if ((o.k || 0) > 0.02 && g) { path(g); g.fillStyle = rgba(M.col === '#7DFFC4' ? '#7DFFC4' : '#FF9A8A', 0.55 * o.k * a); g.fill(); }
  }
  c.restore();
}

// the cords (and their glow), the straps between them, the muscles. o: {k: see-through 0..1, cords: 0..1, glow:
// {L, R, M, I}: a cord lights up, slide: {L, R, M, I}: beads travel (+ toward the fingertip), muscles: 0..1, pump:
// {shared, spareI, spareL}, ghost: 0..1 (the empty ring-finger place), strap: 0..1 (the straps light up), pull: 0..1
// (the middle cord drags the strap and the ring cord toward the fingertips), t}
function hdInside(pr, G, o = {}) {
  const k = o.k || 0;
  if (k <= 0.01) return;
  paint(() => {
    // muscles first (deepest), then cords over them, then the straps
    const mu = (o.muscles || 0) * k;
    if (mu > 0.01) {
      const P = o.pump || {};
      hmSpindle(ctx, gctx, pr, G, HM.shared, { a: mu, k: P.shared || 0 });
      hmSpindle(ctx, gctx, pr, G, HM.spareL, { a: mu * (o.spares === undefined ? 1 : o.spares), k: P.spareL || 0 });
      hmSpindle(ctx, gctx, pr, G, HM.spareI, { a: mu * (o.spares === undefined ? 1 : o.spares), k: P.spareI || 0 });
      if ((o.ghost || 0) > 0.01) hmSpindle(ctx, null, pr, G, HM.ghostR, { a: mu * o.ghost, dashed: true, col: o.ghostCol || '#C8A8FF' });
      // the spares' cords join their fingers' cords at the wrist
      for (const [M, kk] of [[HM.spareI, 'I'], [HM.spareL, 'L']]) {
        const sp = mu * (o.spares === undefined ? 1 : o.spares);
        if (sp <= 0.01) continue;
        const a = pr(hmPt(G, M.b)), b = pr(hdCordPath(G, kk)[1]);
        line(ctx, a[0], a[1], b[0], b[1], 7, rgba('#F4E7CF', sp));
      }
    }
    const cw = (o.cords || 0) * k;
    if (cw > 0.01) {
      for (const kk of HF_ORD) {
        const S = dense3(hdCordPath(G, kk, mu > 0.05 ? -14.5 : -12)).map(pr);
        const gl = (o.glow && o.glow[kk]) || 0;
        const wpx = S[Math.floor(S.length / 2)][2] * 0.32;
        poly(ctx, S.map((q) => [q[0], q[1]]), Math.max(5, wpx * 1.3), rgba('#5B4A3A', 0.55 * cw));
        poly(ctx, S.map((q) => [q[0], q[1]]), Math.max(4, wpx), rgba(mixH('#F4E7CF', '#FFF6B0', gl), cw));
        if (gl > 0.01) poly(gctx, S.map((q) => [q[0], q[1]]), Math.max(8, wpx * 2.6), rgba('#FFE38A', 0.75 * gl * cw));
        // beads that travel along the cord: the cord sliding (o.slide > 0: toward the fingertip; < 0: toward the arm)
        const sl = (o.slide && o.slide[kk]) || 0;
        if (Math.abs(sl) > 0.01) {
          const acc = polyLen(S.map((q) => [q[0], q[1]])), Lc = acc[acc.length - 1];
          for (let i = 0; i < 6; i++) {
            const u = ((i / 6 + (o.t || 0) * 0.9 * Math.sign(sl)) % 1 + 1) % 1;
            const q = polyAt(S.map((q2) => [q2[0], q2[1]]), acc, u * Lc);
            circle(ctx, q[0], q[1], Math.max(4, wpx * 0.7), rgba('#FFFFFF', 0.9 * Math.min(1, Math.abs(sl)) * cw));
            circle(gctx, q[0], q[1], Math.max(6, wpx * 1.4), rgba('#FFE38A', 0.6 * Math.min(1, Math.abs(sl)) * cw));
          }
        }
      }
    }
    const st = (o.strap || 0) * k;
    if (st > 0.01) {   // the strap between the ring and middle cords, just behind the knuckles; pull drags it toward the fingertips
      const pull = o.pull || 0;
      const at = (kk, z) => { let best = null; for (const p of dense3(hdCordPath(G, kk), 12)) if (!best || Math.abs(p[2] - z) < Math.abs(best[2] - z)) best = p; return best; };
      const pa = pr(at('R', -3.1 + pull * 1.1)), pb = pr(at('M', -2.1 + pull * 1.6));
      const w = Math.max(14, pa[2] * 0.62) * E.outBack(clamp(o.strap || 0), 2);
      const sn = clamp(o.snip || 0);
      if (sn > 0) {   // snipped: two stubs that spring back to their cords and curl
        for (const [p0, p1, sg] of [[pa, pb, 1], [pb, pa, -1]]) {
          const e = [lerp(p0[0], p1[0], 0.45 - 0.22 * E.outBack(sn, 2.5)), lerp(p0[1], p1[1], 0.45 - 0.22 * E.outBack(sn, 2.5)) + sg * 10 * sn];
          line(ctx, p0[0], p0[1], e[0], e[1], w + 8, rgba('#2A1A4A', 0.8 * st));
          line(ctx, p0[0], p0[1], e[0], e[1], w, rgba('#D9C2FF', st));
        }
        return;
      }
      line(ctx, pa[0], pa[1], pb[0], pb[1], w + 8, rgba('#2A1A4A', 0.8 * st));
      line(ctx, pa[0], pa[1], pb[0], pb[1], w, rgba('#D9C2FF', st));
      const n = 4;
      for (let i = 1; i < n; i++) { const u = i / n, x = lerp(pa[0], pb[0], u), y = lerp(pa[1], pb[1], u), an = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) + Math.PI / 2; line(ctx, x - Math.cos(an) * w * 0.3, y - Math.sin(an) * w * 0.3, x + Math.cos(an) * w * 0.3, y + Math.sin(an) * w * 0.3, 2.5, rgba('#8A6BC8', st)); }
      line(gctx, pa[0], pa[1], pb[0], pb[1], w * 2.6, rgba('#C8A8FF', 0.7 * st * (o.strapGlow === undefined ? 1 : o.strapGlow)));
    }
  });
}
// a world point on the strap between the ring and middle cords (for labels)
function hdStrapPt(pr, G, pull = 0) {
  const at = (kk, z) => { let best = null; for (const p of dense3(hdCordPath(G, kk), 12)) if (!best || Math.abs(p[2] - z) < Math.abs(best[2] - z)) best = p; return best; };
  const a = pr(at('R', -3.1 + pull * 1.1)), b = pr(at('M', -2.1 + pull * 1.6));
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// ---------------------------------------------------------------- the leash gag
// a red collar round the ring finger's middle bone, and a leash to the folded middle finger's knuckle. k: in (0..1),
// taut 0..1 (slack -> straight), tie 0..1 (the far end reaches the knuckle)
function hdLeash(c, g, pr, G, o = {}) {
  const k = o.k || 0;
  if (k <= 0.01) return;
  const R = G.f.R, M = G.f.M;
  const col = '#E8343F', dk = '#8E1622';
  const cp = lerpP(R.pts[1], R.pts[2], 0.45), cq = pr(cp), rr = R.rad[1] * cq[2] * 1.08;
  const dir = pr(R.pts[2]), ang = Math.atan2(dir[1] - cq[1], dir[0] - cq[0]);
  const s = E.outBack(clamp(k), 2);
  // the knuckle end: on top of the middle finger's middle joint (its bent knuckle)
  const kn = pr(hdTop(M.pts[1], M.P[0], M.rad[1], 1.35));
  const tie = clamp(o.tie || 0);
  const start = [cq[0] - Math.sin(ang) * rr * 0.2, cq[1] - rr * 0.55];
  const end = [lerp(start[0] + 90, kn[0], tie), lerp(start[1] - 220, kn[1] - 10, tie)];
  const taut = clamp(o.taut || 0), loop = (1 - taut) * (230 + 60 * Math.sin((o.t || 0) * 3)) * s;
  const mid = [(start[0] + end[0]) / 2 + 40 * (1 - taut), Math.min(start[1], end[1]) - loop - (1 - tie) * 60];
  const lw = Math.max(9, rr * 0.34);
  c.save();
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(start[0], start[1]); c.quadraticCurveTo(mid[0], mid[1], end[0], end[1]);
  c.lineWidth = (lw + 6) * s; c.strokeStyle = dk; c.stroke();
  c.lineWidth = lw * s; c.strokeStyle = col; c.stroke();
  // the collar: a short fat band across the finger, with a buckle and a tag
  c.translate(cq[0], cq[1]); c.rotate(ang + Math.PI / 2); c.scale(s, s);
  rrect(c, -rr * 1.12, -rr * 0.32, rr * 2.24, rr * 0.64, rr * 0.3); c.fillStyle = col; c.fill();
  rrect(c, -rr * 0.25, -rr * 0.36, rr * 0.5, rr * 0.72, 4); c.fillStyle = '#F2C94C'; c.fill();
  c.restore();
  // the tag (a gold disc) hanging under the collar
  circle(c, cq[0] + 4, cq[1] + rr * 0.6 * s, rr * 0.3 * s, '#F2C94C');
  // the loop round the knuckle once tied
  if (tie > 0.95) { circle(c, end[0], end[1], lw * 0.9, dk); circle(c, end[0], end[1], lw * 0.6, col); }   // a knot on the knuckle
}
// a smug little face on the folded middle finger's knuckle (paint). k: in, mood: 'smug' | 'proud'
function hdKnuckleFace(c, pr, G, k, t, mood = 'smug') {
  if (k <= 0.01) return;
  const M = G.f.M, q = pr(lerpP(M.pts[1], hdTop(M.pts[1], M.P[0], M.rad[1], 1), 0.35)), s = q[2] * M.rad[1] * 0.78 * E.outBack(clamp(k), 2.2);
  paint(() => {
    c.save(); c.translate(q[0], q[1] + s * 0.25);
    const blink = (t * 0.7) % 1 < 0.06 ? 0.15 : 1;
    for (const sx of [-1, 1]) {
      ellipse(c, sx * s * 0.42, -s * 0.18, s * 0.17, s * 0.2 * blink, '#2A1B14');
      line(c, sx * s * 0.22, -s * 0.55 + (mood === 'smug' ? sx * s * 0.06 : 0), sx * s * 0.62, -s * 0.5 - (mood === 'smug' ? sx * s * 0.08 : 0), Math.max(2, s * 0.09), '#5A3020');
    }
    c.beginPath();
    if (mood === 'smug') { c.moveTo(-s * 0.3, s * 0.3); c.quadraticCurveTo(s * 0.05, s * 0.48, s * 0.42, s * 0.18); }
    else { c.moveTo(-s * 0.35, s * 0.22); c.quadraticCurveTo(0, s * 0.62, s * 0.35, s * 0.22); }
    c.lineWidth = Math.max(2.5, s * 0.1); c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke();
    c.restore();
  });
}
