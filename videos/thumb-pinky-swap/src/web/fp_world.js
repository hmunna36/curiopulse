// fp_world.js — Can You Do Fist, EDGE, Palm? (24 Nov 2026). A picnic table on an alpine meadow, his right hand tapping
// the planks, a mountain goat across the table. Built on one-finger's fist3d.js (the 3D hand), bent-wrist-fist's
// bwhand.js (the forearm) and sign-seven's s7_world.js (s7Geo: every joint set by hand; tags, bursts, rings). New here
// (borrow it):
// - `fpCam` / `fpP`: a real 3D camera in centimetres (position, look-at, focal length in px, roll) for the table world;
//   `fpBack` draws a 360-degree meadow plate painted once (sky, three ranges of snowy peaks, a hut, pines, flowers) at
//   the camera's heading and pitch, so every angle sees the same place, softly out of focus;
// - `fpTable`: the planks in true perspective (grain as 3D lines), with a tin mug, a trail map and a daisy;
// - the hand on the table: `fpXf` turns the hand about the forearm's own axis (`rot` 0 palm down .. 1 upright: the edge
//   and the fist) and drops it onto the planks by its lowest point (`lift` above the contact), the elbow resting behind;
//   `fpHandGeo` (curl 0 open .. 1 fist, the thumb along the index or wrapped over the fist); `fpTaps` turns a list of
//   [time, shape] taps into the hand's state (arcs between taps, the shape changing in the air, a squash on landing);
//   `fpDrawHand` (skin, the coat's sleeve), `fpGhost` (a shape left behind, as a white silhouette that fades);
// - `fpStop`: a little red STOP sign planted on his wrist (pop, flash, sputter, off); `fpNinja`: a ghost fist in a black
//   ninja mask that tiptoes up the forearm; `fpSkid` (skid marks on the planks) and `fpSmoke`;
// - `fpGoat`: a mountain goat sitting behind the table, front view (shaggy white coat, black horns, beard, eyes with
//   sideways pupils; moods chew / stop / smug / shock / cross / focus; a hoof that taps fist, edge or palm; a daisy in
//   its mouth, a doctor's head mirror, a clipboard BRAIN TEST, big round glasses, a sweat drop).
// World frame (cm): X to his right, Y up (the table top is Y = 0), Z toward him (he sits at +Z, the goat at -Z).
'use strict';

const FP = { tx: [-72, 72], tz: [-46, 46], planks: 6, heroZ: 66, goatZ: -66, elbowY: [3.4, 4.7] };
const FP_SHAPES = { F: { curl: 1, rot: 1 }, E: { curl: 0, rot: 1 }, P: { curl: 0, rot: 0 } };
const FP_COL = { F: '#FF9A3C', E: '#FFD447', P: '#7FE9FF' };   // the shapes' colours (the captions use the same)

// ---------------------------------------------------------------- vectors and the camera
const fv = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)],
};
// C: the eye (cm), L: what it looks at, f: focal length in px, o: {roll, cx, cy}
function fpCam(C, L, f, o = {}) {
  const F = fv.norm(fv.sub(L, C));
  const up = Math.abs(F[1]) > 0.985 ? [0, 0, -1] : [0, 1, 0];
  const R = fv.norm(fv.cross(F, up)), U = fv.cross(R, F);
  return { C, L, F, R, U, f, roll: o.roll || 0, cx: o.cx === undefined ? W / 2 : o.cx, cy: o.cy === undefined ? H / 2 : o.cy,
    head: Math.atan2(F[0], -F[2]), pitch: Math.asin(clamp(F[1], -1, 1)) };
}
// a world point -> [x, y, k (px per cm there), depth (cm)]
function fpP(V, P) {
  const d = fv.sub(P, V.C), x = fv.dot(d, V.R), y = fv.dot(d, V.U), z = Math.max(1, fv.dot(d, V.F)), k = V.f / z;
  let sx = x * k, sy = -y * k;
  if (V.roll) { const c = Math.cos(V.roll), s = Math.sin(V.roll); const a = sx * c - sy * s; sy = sx * s + sy * c; sx = a; }
  return [V.cx + sx, V.cy + sy, k, z];
}
// keyed: [[t, Cx, Cy, Cz, Lx, Ly, Lz, f, roll], ...] eased in-out
function fpKeys(t, keys, ease = E.inOutSine) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = a.map((v, j) => lerp(v, b[j], u)); }
    break;
  }
  return fpCam([k[1], k[2], k[3]], [k[4], k[5], k[6]], k[7], { roll: k[8] || 0 });
}
// a 2D camera that puts a rig (or any 2D drawing at world origin, scale 1) at a screen point with a size
function fp2D(sx, sy, z) { return { x: (W / 2 - sx) / z, y: (H / 2 - sy) / z, zoom: z, rot: 0 }; }

// ---------------------------------------------------------------- the meadow (a 360-degree plate, painted once)
const FPB = { PXR: 640, EL: 0.72 };          // px per radian; elevation covered: -EL .. +EL
let FP_BG = null, FP_BGS = null;
function initFp() {
  const PXR = FPB.PXR, w = Math.round(Math.PI * 2 * PXR), h = Math.round(FPB.EL * 2 * PXR), hy = h / 2;
  const cv = mkCanvas(w, h), c = cv.getContext('2d');
  const rng = mulberry32(2411);
  // sky: deep blue at the top, pale at the horizon
  const g = c.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, '#1257C9'); g.addColorStop(0.55, '#3C8BE6'); g.addColorStop(1, '#A9DBFF');
  c.fillStyle = g; c.fillRect(0, 0, w, hy + 2);
  // clouds
  for (let i = 0; i < 14; i++) {
    const x0 = rng() * w, y = hy * (0.18 + rng() * 0.45), s = 0.6 + rng() * 0.9;
    for (const x of [x0 - w, x0, x0 + w]) {
      for (let j = 0; j < 6; j++) ellipse(c, x + (j - 2.5) * 46 * s, y + Math.sin(j * 1.7) * 10 * s, 70 * s, 34 * s, rgba('#FFFFFF', 0.85));
      ellipse(c, x, y + 18 * s, 170 * s, 22 * s, rgba('#D9ECFF', 0.8));
    }
  }
  // a ridge as a wavy line: n bumps, peaks with snow caps
  const range = (base, amp, col, snow, seed, peaks) => {
    const r2 = mulberry32(seed), P = [];
    const pk = [];
    for (let i = 0; i < peaks; i++) pk.push([r2() * w, amp * (0.55 + 0.45 * r2()), 120 + r2() * 160]);
    for (let x = -10; x <= w + 10; x += 8) {
      let y = base;
      for (const [px, a, sp] of pk) {
        for (const off of [-w, 0, w]) { const d = Math.abs(x - px - off) / sp; if (d < 1.6) y -= a * Math.max(0, 1 - d * 0.62) * (1 - 0.18 * Math.abs(Math.sin(x * 0.05 + px))); }
      }
      y += 6 * Math.sin(x * 0.031 + seed) + 3 * Math.sin(x * 0.11);
      P.push([x, y]);
    }
    c.beginPath(); c.moveTo(-10, h); for (const p of P) c.lineTo(p[0], p[1]); c.lineTo(w + 10, h); c.closePath();
    c.fillStyle = col; c.fill();
    if (snow) {
      c.save(); c.clip();
      const topAt = (x) => { const j = clamp(Math.round((((x % w) + w) % w + 10) / 8), 0, P.length - 1); return P[j][1]; };
      for (const [px, a, sp] of pk) for (const off of [-w, 0, w]) {
        const tx = px + off;
        if (a < 60) continue;
        let ty = 1e9; for (let x = tx - sp * 0.5; x <= tx + sp * 0.5; x += 8) ty = Math.min(ty, topAt(x));
        const line0 = ty + a * 0.38;
        c.beginPath(); c.moveTo(tx - sp * 0.6, line0);
        for (let i = 0; i <= 10; i++) { const u = i / 10; c.lineTo(tx - sp * 0.6 + sp * 1.2 * u, line0 + (i % 2 ? 16 : -6) + 10 * Math.sin(u * 9 + px)); }
        c.lineTo(tx + sp * 0.6, ty - 400); c.lineTo(tx - sp * 0.6, ty - 400); c.closePath();
        c.fillStyle = snow; c.fill();
      }
      c.restore();
    }
    return P;
  };
  range(hy - 8, 200, '#7E9CC8', '#F4F8FF', 71, 9);       // far: blue-grey peaks, snow
  range(hy + 4, 130, '#5E86B5', '#E9F1FF', 72, 11);      // middle
  const near = range(hy + 22, 70, '#3F8A4A', null, 73, 14);   // green hills
  // pines on the green hills
  for (let i = 0; i < 160; i++) {
    const x = rng() * w, j = Math.floor((x + 10) / 8), y = near[clamp(j, 0, near.length - 1)][1] + 6 + rng() * 26, s = 0.5 + rng() * 0.6;
    c.fillStyle = rng() < 0.5 ? '#245C33' : '#1E4E2C';
    for (const xx of [x - w, x, x + w]) { c.beginPath(); c.moveTo(xx, y - 46 * s); c.lineTo(xx + 14 * s, y); c.lineTo(xx - 14 * s, y); c.closePath(); c.fill(); }
  }
  // the meadow below the horizon: green, lighter toward us, flowers
  const mg = c.createLinearGradient(0, hy + 30, 0, h);
  mg.addColorStop(0, '#4FA24A'); mg.addColorStop(0.5, '#62B655'); mg.addColorStop(1, '#78C863');
  c.fillStyle = mg; c.fillRect(0, hy + 34, w, h - hy - 34);
  for (let i = 0; i < 2600; i++) {
    const x = rng() * w, y = hy + 40 + Math.pow(rng(), 0.7) * (h - hy - 40), d = (y - hy) / (h - hy), r = 1.2 + 4 * d;
    const col = ['#FFE35A', '#FFFFFF', '#C79BFF', '#FF8FB0', '#2F7E36', '#3E9440'][Math.floor(rng() * 6)];
    circle(c, x, y, r, col); if (x < 20) circle(c, x + w, y, r, col); if (x > w - 20) circle(c, x - w, y, r, col);
  }
  // the hut, far off (heading about 0.9 rad: right of the goat), and a fence
  const hx = 0.9 * PXR + w / 2, hyy = hy + 40;
  c.fillStyle = '#7A4A2A'; c.fillRect(hx - 60, hyy - 70, 120, 70);
  c.fillStyle = '#B0442E'; c.beginPath(); c.moveTo(hx - 78, hyy - 66); c.lineTo(hx, hyy - 120); c.lineTo(hx + 78, hyy - 66); c.closePath(); c.fill();
  c.fillStyle = '#FFE4A0'; c.fillRect(hx - 30, hyy - 48, 22, 20); c.fillRect(hx + 12, hyy - 48, 22, 20);
  c.fillStyle = '#5A341C'; c.fillRect(hx + 30, hyy - 128, 14, 34);
  for (let i = 0; i < 16; i++) { const x = hx - 300 + i * 40; line(c, x, hyy + 4, x, hyy - 26, 5, '#8A5A34'); }
  line(c, hx - 300, hyy - 16, hx + 300, hyy - 16, 4, '#8A5A34');
  FP_BG = cv;
  // the soft copy (out of focus)
  const sv = mkCanvas(w, h), s = sv.getContext('2d');
  s.filter = 'blur(5px)'; s.drawImage(cv, 0, 0); s.filter = 'none';
  FP_BGS = sv;
}
// the plate at the camera's heading and pitch (screen space). o: {soft 0..1}
function fpBack(V, o = {}) {
  const PXR = FPB.PXR, img = (o.soft === undefined ? 1 : o.soft) > 0.5 ? FP_BGS : FP_BG;
  const w = img.width, h = img.height, sc = V.f / PXR;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#78C863'; ctx.fillRect(0, 0, W, H);
  ctx.translate(V.cx, V.cy); if (V.roll) ctx.rotate(V.roll);
  { const yT = -(h / 2 - V.pitch * PXR) * sc; ctx.fillStyle = '#1257C9'; ctx.fillRect(-3 * W, yT - 4 * H, 6 * W, 4 * H + 2); }
  // heading 0 (toward the goat, -Z) sits at the middle of the plate
  let x0 = -(w / 2 + V.head * PXR) * sc;
  const y0 = -(h / 2 - V.pitch * PXR) * sc;
  x0 = ((x0 % (w * sc)) + w * sc) % (w * sc) - w * sc;
  for (let i = -1; i < 3; i++) ctx.drawImage(img, x0 + i * w * sc, y0, w * sc, h * sc);
  ctx.restore();
  // a soft sun glow up left
  screenSpace();
  const sun = fpP(V, fv.add(V.C, fv.mul(fv.norm([-0.5, 0.55, -0.66]), 5000)));
  if (fv.dot(fv.norm([-0.5, 0.55, -0.66]), V.F) > 0.2) { softDot(gctx, sun[0], sun[1], 260, '#FFF2C0', 0.5); softDot(ctx, sun[0], sun[1], 140, '#FFFBEA', 0.5); }
}

// ---------------------------------------------------------------- the picnic table
function fpQuad(V, P, col) {
  const Q = P.map((p) => fpP(V, p));
  ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  return Q;
}
const FP_WOOD = ['#9C6438', '#A86E3F', '#94603A', '#A26A3B', '#996236', '#A56C3E'];
function fpTable(V, o = {}) {
  screenSpace();
  const [x0, x1] = FP.tx, [z0, z1] = FP.tz, n = FP.planks, dz = (z1 - z0) / n, gap = 0.5;
  // the front face (thickness) on the side nearest the camera, then the planks
  const nearZ = V.C[2] > 0 ? z1 : z0;
  fpQuad(V, [[x0, 0, nearZ], [x1, 0, nearZ], [x1, -4, nearZ], [x0, -4, nearZ]], '#6E4122');
  if (Math.abs(V.C[0]) > 40) { const sx = V.C[0] > 0 ? x1 : x0; fpQuad(V, [[sx, 0, z0], [sx, 0, z1], [sx, -4, z1], [sx, -4, z0]], '#6A3E20'); }
  fpQuad(V, [[x0, -0.2, z0], [x1, -0.2, z0], [x1, -0.2, z1], [x0, -0.2, z1]], '#3D2412');   // the dark gaps
  for (let i = 0; i < n; i++) {
    const za = z0 + i * dz + gap / 2, zb = z0 + (i + 1) * dz - gap / 2;
    actor(() => fpQuad(V, [[x0, 0, za], [x1, 0, za], [x1, 0, zb], [x0, 0, zb]], FP_WOOD[i % FP_WOOD.length]));
    // grain: a few long lines along the plank, and a knot
    paint(() => {
      const r2 = mulberry32(90 + i);
      for (let j = 0; j < 4; j++) {
        const z = lerp(za, zb, 0.15 + 0.7 * r2()), Q = [];
        for (let x = x0; x <= x1; x += 6) Q.push(fpP(V, [x, 0, z + 0.6 * Math.sin(x * 0.08 + j * 2 + i)]));
        const k = Q[Math.floor(Q.length / 2)][2];
        poly(ctx, Q.map((q) => [q[0], q[1]]), Math.max(1, k * 0.12), rgba('#5A3016', 0.32));
      }
      const kx = lerp(x0, x1, 0.15 + 0.7 * r2()), kq = fpP(V, [kx, 0, (za + zb) / 2]);
      if (kq[3] > 5) ellipse(ctx, kq[0], kq[1], kq[2] * 1.4, kq[2] * 0.55 * Math.abs(fv.dot(V.F, [0, -1, 0])) + 1, rgba('#4A2410', 0.45));
    });
  }
  // the sun's warm wash on the planks, a little shade near him
  const c0 = fpP(V, [-20, 0, -10]);
  softDot(ctx, c0[0], c0[1], 900 * c0[2] / 20, '#FFE0A0', 0.12);
}
// things on the table (2D sprites stood up at a world point, scaled by the camera)
function fpMug(V, P, t) {
  const q = fpP(V, P); if (q[3] < 4) return;
  const s = q[2] / 9;
  actor(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
    ellipse(ctx, 0, 4, 44, 10, 'rgba(40,20,8,0.35)');
    rrect(ctx, -32, -70, 64, 72, 10); ctx.fillStyle = '#E7EDF4'; ctx.fill();
    ctx.fillStyle = '#2E6FD6'; ctx.fillRect(-32, -58, 64, 8);
    ellipse(ctx, 0, -70, 32, 9, '#C9D2DD'); ellipse(ctx, 0, -69, 26, 6, '#5A3418');
    ctx.beginPath(); ctx.arc(34, -38, 16, -1.2, 1.2); ctx.lineWidth = 8; ctx.strokeStyle = '#C9D2DD'; ctx.stroke();
    ctx.restore(); });
  paint(() => { for (let i = 0; i < 3; i++) { const u = ((t * 0.45 + i / 3) % 1); ctx.strokeStyle = rgba('#FFFFFF', 0.3 * (1 - u)); ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(q[0] + (-8 + i * 8) * s, q[1] - (78 + u * 60) * s); ctx.quadraticCurveTo(q[0] + (4 + i * 8) * s, q[1] - (96 + u * 60) * s, q[0] + (-6 + i * 8) * s, q[1] - (116 + u * 60) * s); ctx.stroke(); } });
}
// a trail map lying flat (3D quad with a printed route)
function fpMap(V, x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot), at = (u, v) => [x + u * c - v * s, 0.05, z + u * s + v * c];
  actor(() => fpQuad(V, [at(-14, -10), at(14, -10), at(14, 10), at(-14, 10)], '#F3E8C8'));
  paint(() => {
    const route = []; for (let i = 0; i <= 12; i++) { const u = -12 + i * 2; route.push(fpP(V, at(u, 5 * Math.sin(i * 0.9)))); }
    const k = route[6][2];
    poly(ctx, route.map((q) => [q[0], q[1]]), Math.max(2, k * 0.5), rgba('#E0402A', 0.85));
    for (const [u, v, col] of [[-9, 6, '#3E9440'], [6, -5, '#2E6FD6'], [10, 5, '#3E9440']]) { const q = fpP(V, at(u, v)); ellipse(ctx, q[0], q[1], q[2] * 2.2, q[2] * 1.1, rgba(col, 0.6)); }
    const f1 = fpP(V, at(-2, -10)), f2 = fpP(V, at(-2, 10)); line(ctx, f1[0], f1[1], f2[0], f2[1], Math.max(1, k * 0.15), rgba('#9C8A60', 0.6));
  });
}
function fpDaisy(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  line(c, 0, 0, 0, 60, 5, '#3E9440');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ellipse(c, Math.cos(a) * 15, Math.sin(a) * 15, 11, 4.5, '#FFFFFF', a); }
  circle(c, 0, 0, 8, '#FFC21A');
  c.restore();
}

// ---------------------------------------------------------------- the hand on the table
// joints [knuckle, middle, end] (rad, + toward the palm)
const FPJ = { open: [0.03, 0.05, 0.03], fist: [1.52, 1.78, 1.05] };
const FP_THUMB = {
  along: [[2.85, 2.2, 0.7], [4.05, 4.55, 0.95], [4.35, 6.35, 0.85], [4.25, 8.05, 0.7]],      // beside the index, flat
  wrap: [[2.85, 2.2, 0.7], [4.25, 4.95, 2.35], [3.25, 6.75, 4.55], [1.15, 7.25, 5.75]],       // over the curled fingers
};
// S: {curl 0 open .. 1 fist, t}
function fpHandGeo(S) {
  const b = {}, lean = {}, cu = clamp(S.curl || 0);
  FK_ORD.forEach((k, i) => {
    const u = clamp(cu * 1.12 - (3 - i) * 0.04);          // the little finger curls a hair first
    b[k] = [lerp(FPJ.open[0], FPJ.fist[0], E.inOutSine(u)), lerp(FPJ.open[1], FPJ.fist[1], E.inOutSine(u)), lerp(FPJ.open[2], FPJ.fist[2], E.inOutSine(u))];
    lean[k] = { I: -0.02, M: 0, R: 0.02, L: 0.05 }[k] * (1 - u) + (S.spread || 0) * { I: -0.12, M: -0.03, R: 0.03, L: 0.15 }[k];
  });
  const G = s7Geo({ b, lean, thumb: 0, t: S.t || 0, chunk: 1.12 });
  const tu = E.inOutSine(clamp(cu * 1.25 - 0.2));
  G.thumb.pts = FP_THUMB.along.map((p, i) => fkLerp(p, FP_THUMB.wrap[i], tu));
  return G;
}
// the hand's placement: S: {x, z (the wrist on the table plan), head (the forearm's heading: 0 = toward -Z, + to his
// right), rot 0 palm down .. 1 upright, curl, lift (cm above the contact), slide: [dx, dz]}
function fpXf(S, G) {
  const a = clamp(S.rot || 0) * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
  const hd = S.head || 0, hdir = [Math.sin(hd), 0, -Math.cos(hd)], L = BWK.L;
  const elbowY = lerp(FP.elbowY[0], FP.elbowY[1], clamp(S.rot || 0));
  const sl = S.slide || [0, 0];
  let wy = 4.5, basis = null;
  const samples = [];
  for (const k of FK_ORD) { const F = G.f[k]; F.pts.forEach((p, i) => samples.push([p, F.rad[Math.min(i, 3)]])); }
  G.thumb.pts.forEach((p, i) => samples.push([p, G.thumb.rad[i]]));
  for (const p of fkPalmPts()) samples.push([p, 0]);
  const mk = (y) => {
    const pitch = Math.asin(clamp((y - elbowY) / L, -0.6, 0.6));
    const fwd = fv.norm([hdir[0] * Math.cos(pitch), Math.sin(pitch), hdir[2] * Math.cos(pitch)]);
    const dn0 = [0, -1, 0], dn = fv.norm(fv.sub(dn0, fv.mul(fwd, fv.dot(dn0, fwd))));
    const xa = fv.cross(fwd, dn);
    return { fwd, dn, xa };
  };
  const rel = (B, p) => { const x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca; return fv.add(fv.add(fv.mul(B.xa, x), fv.mul(B.fwd, p[1])), fv.mul(B.dn, z)); };
  for (let it = 0; it < 3; it++) {
    basis = mk(wy);
    let m = 1e9;
    for (const [p, r] of samples) { const q = rel(basis, p); m = Math.min(m, q[1] - r); }
    wy = -m + (S.lift || 0);
  }
  const wrist = [(S.x || 0) + sl[0], wy, (S.z || 0) + sl[1]];
  const toW = (p) => fv.add(wrist, rel(basis, p));
  return { wrist, basis, toW, elbow: fv.sub(wrist, fv.mul(basis.fwd, L)), a };
}
// the two projectors bwhand.js and fist3d.js want (arm frame = hand frame here: the wrist does not bend)
function fpProj(V, X) {
  const pa = (p) => fpP(V, X.toW(p));
  return { pa, ph: pa, th: 0, X };
}
// the coat's sleeve over the forearm (yellow, a darker cuff band), as depth-sorted items
function fpSleeveItems(c, P2, o = {}) {
  const u0 = o.u0 === undefined ? 0.5 : o.u0, items = [];
  const hullOf = (a, b, grow) => {
    const P = [];
    for (let i = 0; i <= 8; i++) for (const q of bwArmRing(lerp(a, b, i / 8), 0)) P.push(P2.pa([q[0] * grow, q[1], q[2] * grow]));
    return fkHull(P.map((q) => [q[0], q[1]]));
  };
  const zw = P2.pa([0, -BWK.L * (u0 + 0.25), 0])[3];
  items.push({ z: zw + 3.4, fn: () => { c.fillStyle = PAL.coat; fkSmooth(c, hullOf(u0 + 0.04, 1.02, 1.22)); c.fill(); } });
  items.push({ z: zw + 3.3, fn: () => { c.fillStyle = PAL.coatSh; fkSmooth(c, hullOf(u0, u0 + 0.07, 1.26)); c.fill(); } });
  return items;
}
// draw the hand + forearm + sleeve. o: {items, flat}
function fpDrawHand(c, P2, G, o = {}) {
  const items = bwArmItems(c, P2, {}).concat(fpSleeveItems(c, P2, o)).concat(o.items || []);
  fkDraw(c, P2.ph, G, { noArm: true, items });
}
// the shape left behind: the same hand in one colour on the scratch layer, laid over as a white glow that fades
function fpGhost(c, P2, G, k, col = '#FFFFFF') {
  if (k <= 0.01) return;
  const m = c.getTransform();
  tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.globalCompositeOperation = 'source-over'; tctx.globalAlpha = 1; tctx.clearRect(0, 0, W, H);
  tctx.setTransform(m);
  tctx.fillStyle = col; fkSmooth(tctx, fkHull(fkPalmPts().map(P2.ph).map((q) => [q[0], q[1]]))); tctx.fill();
  const T = G.thumb, Tp = T.pts.map(P2.ph);
  for (let i = 0; i < 3; i++) fkCap(tctx, Tp[i], Tp[i + 1], T.rad[i] * Tp[i][2], T.rad[i + 1] * Tp[i + 1][2], col);
  for (const kk of FK_ORD) { const F = G.f[kk], Pp = F.pts.map(P2.ph); for (let i = 0; i < 3; i++) fkCap(tctx, Pp[i], Pp[i + 1], F.rad[i] * Pp[i][2], F.rad[i + 1] * Pp[i + 1][2], col); }
  paint(() => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.42 * k; c.drawImage(tintC, 0, 0); c.restore(); });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalAlpha = 0.35 * k; gctx.drawImage(tintC, 0, 0, W / 2, H / 2); gctx.restore();
}

// ---------------------------------------------------------------- the taps
// taps: [[time, 'F' | 'E' | 'P', {hold, h}], ...] sorted. Returns the hand's state at time tt.
function fpTaps(tt, taps) {
  let i = -1;
  for (let j = 0; j < taps.length; j++) if (taps[j][0] <= tt) i = j;
  const shp = (s) => FP_SHAPES[s];
  if (i < 0) { const s = shp(taps[0][1]); return { curl: s.curl, rot: s.rot, lift: 0, since: 99, prev: taps[0][1], cur: taps[0][1], next: taps[0][1] }; }
  const a = taps[i], b = taps[i + 1];
  const since = tt - a[0];
  if (!b || (a[2] && a[2].hold)) {
    const s = shp(a[1]);
    return { curl: s.curl, rot: s.rot, lift: 0, since, prev: i > 0 ? taps[i - 1][1] : a[1], cur: a[1], next: b ? b[1] : a[1], squash: clamp(1 - since / 0.12) };
  }
  const dt = b[0] - a[0], u = clamp(since / dt), Hm = (a[2] && a[2].h) || Math.min(6.5, 1.2 + 7.5 * dt);
  // up fast, hang, down fast
  const lift = Hm * Math.pow(Math.sin(Math.PI * u), 0.75);
  const sA = shp(a[1]), sB = shp(b[1]), m = E.inOutSine(clamp((u - 0.28) / 0.56));
  return { curl: lerp(sA.curl, sB.curl, m), rot: lerp(sA.rot, sB.rot, m), lift, since, prev: i > 0 ? taps[i - 1][1] : a[1],
    cur: a[1], next: b[1], u, squash: clamp(1 - since / 0.12) };
}

// ---------------------------------------------------------------- the STOP sign, the ninja, skids, smoke, impacts
// a little road sign planted on the wrist: P = its foot on screen, s = px per cm. o: {k pop, flash 0..1, off 0..1 (dark
// and grey), flicker}
function fpStop(P, s, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return null;
  const pop = E.outBack(k, 2.4), r = 3.6 * s * pop, h = 7.2 * s * pop;
  const off = clamp(o.off || 0), fl = clamp(o.flash || 0);
  const top = [P[0], P[1] - h];
  actor(() => {
    line(ctx, P[0], P[1], top[0], top[1], Math.max(4, 0.55 * s), '#8C96A6');
    ctx.save(); ctx.translate(top[0], top[1] - r * 0.95); ctx.scale(1 + 0.12 * fl, 1 + 0.12 * fl);
    const oct = (rr) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); };
    oct(r * 1.08); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    oct(r); ctx.fillStyle = mixH(mixH('#D8202E', '#FF4A4A', fl), '#5A4A50', off * 0.85); ctx.fill();
    paint(() => {
      ctx.font = `900 ${Math.max(8, r * 0.62)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = mixH('#FFFFFF', '#9A9098', off); ctx.fillText('STOP', 0, r * 0.04);
    });
    ctx.restore();
  });
  if (fl > 0.01 && off < 0.5) { softDot(gctx, top[0], top[1] - r * 0.95, r * 2.6, '#FF3A3A', 0.38 * fl); softDot(ctx, top[0], top[1] - r * 0.95, r * 2.0, '#FF5A5A', 0.1 * fl); }
  return { top: [top[0], top[1] - r * 0.95], r };
}
// a ghost fist in a ninja mask, tiptoeing: (x, y) its middle, s scale (px per unit; it is about 80 units wide), dir
// +1 / -1 (which way it creeps), k alpha, t a clock
function fpNinja(x, y, s, dir, k, t, o = {}) {
  if (k <= 0.01) return;
  const bob = Math.abs(Math.sin(t * 9)) * 6, tilt = 0.12 * Math.sin(t * 9);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y - bob * s); ctx.rotate(tilt); ctx.scale(s * dir, s);
  ctx.globalAlpha = 0.82 * k;
  // the fist: a rounded block with four knuckles and a thumb across the front
  rrect(ctx, -40, -34, 80, 66, 24); ctx.fillStyle = '#E8F4FF'; ctx.fill();
  for (let i = 0; i < 4; i++) circle(ctx, -27 + i * 18, -30, 12, '#E8F4FF');
  rrect(ctx, -34, 4, 56, 20, 10); ctx.fillStyle = '#CFE4FF'; ctx.fill();
  // tiptoes: two little legs
  line(ctx, -14, 32, -18 - 6 * Math.sin(t * 18), 52, 6, '#E8F4FF'); line(ctx, 12, 32, 16 + 6 * Math.sin(t * 18), 52, 6, '#E8F4FF');
  // the ninja mask: a black band with two eye holes, the knot's tails flying behind
  ctx.globalAlpha = 0.95 * k;
  rrect(ctx, -42, -22, 84, 22, 10); ctx.fillStyle = '#16131F'; ctx.fill();
  ellipse(ctx, -12, -11, 9, 6, '#FFFFFF'); ellipse(ctx, 14, -11, 9, 6, '#FFFFFF');
  circle(ctx, -9 + (o.look || 2), -11, 3.5, '#16131F'); circle(ctx, 17 + (o.look || 2), -11, 3.5, '#16131F');
  line(ctx, -16, -21, -6, -17, 3, '#16131F'); line(ctx, 18, -21, 8, -17, 3, '#16131F');   // shifty brows
  ctx.beginPath(); ctx.moveTo(-40, -12); ctx.quadraticCurveTo(-62, -18 + 6 * Math.sin(t * 12), -78, -6 + 6 * Math.sin(t * 12 + 1)); ctx.lineWidth = 7; ctx.strokeStyle = '#16131F'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, -8); ctx.quadraticCurveTo(-60, 2 + 6 * Math.sin(t * 12 + 2), -74, 10 + 6 * Math.sin(t * 12 + 3)); ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, 70 * s, '#BFE4FF', 0.35 * k);
}
// skid marks on the planks behind a contact point (world), dir = the slide's direction (unit, XZ), len cm, k 0..1
function fpSkid(V, P, dir, len, k) {
  if (k <= 0.01) return;
  const side = [-dir[1], dir[0]];
  paint(() => {
    for (const off of [-5.5, 5.5]) {
      const Q = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10 * k; Q.push(fpP(V, [P[0] - dir[0] * len * u + side[0] * off, 0.05, P[2] - dir[1] * len * u + side[1] * off])); }
      const w = Q[0][2] * 1.1;
      poly(ctx, Q.map((q) => [q[0], q[1]]), w, rgba('#2A160A', 0.62));
    }
  });
}
// puffs of smoke rising from a screen point; k 0..1 (age), s size
function fpSmoke(x, y, s, k, seed = 1) {
  if (k <= 0.01 || k >= 1) return;
  const r2 = mulberry32(seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (r2() - 0.5) * 2.2, d = (30 + 120 * r2()) * k * s, rr = (22 + 30 * r2()) * s * (0.5 + k);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d - 60 * k * s;
    circle(ctx, px, py, rr, rgba('#E8E4E0', 0.7 * (1 - k)));
  }
}
// impact lines round a contact point (screen space); k 0..1 fades
function fpImpact(x, y, s, k, col = '#FFFFFF') {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 6; i++) {
      const a = Math.PI + (i / 5) * Math.PI, r0 = (40 + 30 * (1 - k)) * s, r1 = r0 + 34 * s * k;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.6); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.6);
      ctx.lineWidth = 7 * s; ctx.strokeStyle = rgba(col, 0.9 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- the goat (front view, sitting behind the table)
// origin: the middle of its chest where it meets the table top; units: about 1 = 0.1 cm (it is ~700 units tall).
// o: {mood: chew | stop | smug | shock | cross | focus, chew (a clock), look: [x, y], tap: {shape 'F'|'E'|'P', lift 0..1}
// (its right hoof, on our left), mirror 0..1 (the doctor's head mirror), board 0..1 (the clipboard), glasses 0..1,
// daisy 0..1, sweat 0..1, blink 0..1, tilt (head), t}
const GOAT = { fur: '#F4F1EA', furSh: '#D8D1C4', furHi: '#FFFFFF', horn: '#2B2622', hornHi: '#5C534C', hoof: '#2B2622',
  nose: '#C9A39A', noseDk: '#7E5A52', eye: '#F2C447', pupil: '#141018', earIn: '#F0B3B0', beard: '#ECE7DD' };
function fpGoat(c, x, y, s, o = {}) {
  const t = o.t || 0, mood = o.mood || 'chew', tilt = o.tilt || 0, part = o.part || 'all';
  const BK = part !== 'front', FR = part !== 'back', hb = o.hoofY === undefined ? -8 : o.hoofY;
  c.save(); c.translate(x, y); c.scale(s, s);
  // the body: a shaggy white mass behind the table
  if (BK) actor(() => {
    c.fillStyle = GOAT.fur;
    c.beginPath(); c.moveTo(-190, 40); c.bezierCurveTo(-215, -120, -170, -250, -80, -285); c.lineTo(80, -285);
    c.bezierCurveTo(170, -250, 215, -120, 190, 40); c.closePath(); c.fill();
  });
  if (BK) paint(() => {
    for (let i = 0; i < 18; i++) { const a = i / 17, px = lerp(-180, 180, a), py = -40 - 160 * Math.sin(a * Math.PI); c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 8, py + 24, px - 4, py + 44); c.lineWidth = 5; c.strokeStyle = rgba(GOAT.furSh, 0.8); c.lineCap = 'round'; c.stroke(); }
  });
  // the front legs, hooves on the table: the left one (screen right) rests; the right one (screen left) taps
  const leg = (sx, shape, lift) => {
    const hx = sx * 112, hy = hb - lift * 70;
    const legPath = (g) => { c.beginPath(); c.moveTo(sx * (78 + g), -175); c.quadraticCurveTo(sx * (132 + g), -96, hx + sx * (24 + g), hy - 22); c.lineTo(hx - sx * (28 + g), hy - 26); c.quadraticCurveTo(sx * (62 - g), -104, sx * (36 - g), -175); c.closePath(); };
    actor(() => { legPath(5); c.fillStyle = GOAT.furSh; c.fill(); legPath(0); c.fillStyle = GOAT.fur; c.fill(); });
    paint(() => { const kx = lerp(sx * 98, hx, 0.45), ky = lerp(-130, hy, 0.45); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(kx - 18 + i * 14, ky - 8); c.quadraticCurveTo(kx - 22 + i * 14, ky + 10, kx - 12 + i * 14, ky + 20); c.lineWidth = 5; c.strokeStyle = GOAT.furSh; c.lineCap = 'round'; c.stroke(); } });
    // the hoof: a black split hoof; 'F' upright (its front to us), 'E' on its side, 'P' flat
    actor(() => {
      c.save(); c.translate(hx, hy);
      const sh = shape || 'P';
      if (sh === 'P') { rrect(c, -34, -26, 68, 30, 12); c.fillStyle = GOAT.hoof; c.fill(); line(c, 0, -22, 0, 2, 4, '#55504A'); }
      else if (sh === 'E') { c.rotate(sx * 0.15); rrect(c, -16, -44, 32, 48, 10); c.fillStyle = GOAT.hoof; c.fill(); }
      else { rrect(c, -30, -46, 60, 50, 18); c.fillStyle = GOAT.hoof; c.fill(); line(c, 0, -40, 0, 0, 4, '#55504A'); }
      c.restore();
    });
  };
  const tp = o.tap || {};
  if (FR) { leg(-1, tp.shape, clamp(tp.lift || 0)); if (!(o.board > 0.01)) leg(1, 'P', 0); }
  // the neck and head (tilted about the neck)
  if (BK) {
  c.save(); c.translate(0, -300); c.rotate(tilt); c.translate(0, 300);
  actor(() => { c.fillStyle = GOAT.fur; c.beginPath(); c.moveTo(-85, -270); c.quadraticCurveTo(-95, -360, -70, -400); c.lineTo(70, -400); c.quadraticCurveTo(95, -360, 85, -270); c.closePath(); c.fill(); });
  // horns (behind the head)
  actor(() => {
    for (const sx of [-1, 1]) {
      c.beginPath(); c.moveTo(sx * 30, -560); c.quadraticCurveTo(sx * 40, -650, sx * 92, -660); c.quadraticCurveTo(sx * 66, -640, sx * 58, -556); c.closePath();
      c.fillStyle = GOAT.horn; c.fill();
    }
  });
  // ears
  actor(() => { for (const sx of [-1, 1]) { c.save(); c.translate(sx * 98, -500); c.rotate(sx * (0.25 + 0.05 * Math.sin(t * 2.3))); ellipse(c, sx * 46, 0, 58, 22, GOAT.fur); ellipse(c, sx * 50, 2, 40, 12, GOAT.earIn); c.restore(); } });
  // the head: wide at the eyes, a long muzzle
  actor(() => {
    c.fillStyle = GOAT.fur; c.beginPath(); c.moveTo(-100, -500); c.bezierCurveTo(-110, -590, 110, -590, 100, -500);
    c.bezierCurveTo(98, -420, 62, -330, 40, -300); c.quadraticCurveTo(0, -278, -40, -300); c.bezierCurveTo(-62, -330, -98, -420, -100, -500);
    c.closePath(); c.fill();
  });
  // the beard
  actor(() => { c.fillStyle = GOAT.beard; c.beginPath(); c.moveTo(-34, -300); c.quadraticCurveTo(-24, -230, 0, -205 + 6 * Math.sin(t * 3)); c.quadraticCurveTo(24, -230, 34, -300); c.closePath(); c.fill(); });
  // the face
  paint(() => {
    // tuft on the forehead
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-40 + i * 20, -560); c.quadraticCurveTo(-30 + i * 20, -540, -44 + i * 20, -520); c.lineWidth = 6; c.strokeStyle = GOAT.furSh; c.lineCap = 'round'; c.stroke(); }
    // eyes: amber with a sideways bar pupil
    const look = o.look || [0, 0], blink = clamp(o.blink || 0);
    let open = 1, browL = 0, browR = 0, pupW = 1;
    if (mood === 'stop') { browL = -26; open = 1.08; }
    if (mood === 'smug') { open = 0.55; browL = 6; browR = 6; }
    if (mood === 'shock') { open = 1.3; browL = -20; browR = -20; pupW = 0.6; }
    if (mood === 'focus') { open = 0.8; browL = 12; browR = 12; }
    if (mood === 'cross') { open = 1.05; browL = -10; browR = 10; }
    for (const sx of [-1, 1]) {
      const ex = sx * 52, ey = -478, rx = 30, ry = 27 * open * (1 - blink);
      ellipse(c, ex, ey, rx + 5, Math.max(4, ry + 5), '#3A332E');
      if (ry > 2) {
        ellipse(c, ex, ey, rx, ry, '#FFFFFF');
        let lx = look[0] * 9, ly = look[1] * 7;
        if (mood === 'cross') lx = -sx * 11;
        c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, 7); c.clip();
        circle(c, ex + lx, ey + ly, 19, GOAT.eye);
        rrect(c, ex + lx - 13 * pupW, ey + ly - 5, 26 * pupW, 10, 5); c.fillStyle = GOAT.pupil; c.fill();
        circle(c, ex + lx - 7, ey + ly - 8, 4.5, '#FFFFFF');
        c.restore();
        if (open < 0.8) { c.fillStyle = GOAT.furSh; c.beginPath(); c.ellipse(ex, ey - ry * 0.4, rx + 4, ry * 0.75, 0, Math.PI, 2 * Math.PI); c.fill(); }
      }
      const by = sx < 0 ? browL : browR;
      line(c, ex - 26, ey - 40 + by + (mood === 'focus' ? sx * 6 : 0), ex + 22, ey - 44 + by - (mood === 'focus' ? sx * 6 : 0), 9, '#9C948A');
    }
    // the nose and the mouth (chewing: the lower lip slides side to side)
    ellipse(c, 0, -332, 34, 20, GOAT.nose);
    ellipse(c, -13, -334, 6, 4, GOAT.noseDk); ellipse(c, 13, -334, 6, 4, GOAT.noseDk);
    const ch = mood === 'chew' ? Math.sin((o.chew || t) * 11) * 10 : 0;
    c.beginPath();
    if (mood === 'shock') { ellipse(c, 0, -300, 16, 20, '#5A2A2A'); }
    else if (mood === 'smug') { c.moveTo(-26, -306); c.quadraticCurveTo(0 + ch, -294, 28, -310); c.lineWidth = 6; c.strokeStyle = GOAT.noseDk; c.lineCap = 'round'; c.stroke(); }
    else if (mood === 'cross') { c.moveTo(-22, -304); c.lineTo(22, -304); c.lineWidth = 6; c.strokeStyle = GOAT.noseDk; c.stroke(); ellipse(c, 10, -296, 9, 12, '#E87A86'); }
    else { c.moveTo(-24 + ch, -303); c.quadraticCurveTo(ch, -296, 24 + ch, -303); c.lineWidth = 6; c.strokeStyle = GOAT.noseDk; c.lineCap = 'round'; c.stroke(); }
    // the daisy in the corner of its mouth
    if ((o.daisy || 0) > 0.01) fpDaisy(c, 34 + ch, -312, 0.9 * clamp(o.daisy), -0.9 + 0.08 * Math.sin((o.chew || t) * 11));
    if ((o.sweat || 0) > 0.01) { c.fillStyle = rgba('#8FD8FF', clamp(o.sweat)); c.beginPath(); c.moveTo(96, -540); c.quadraticCurveTo(112, -510, 96, -500); c.quadraticCurveTo(80, -510, 96, -540); c.fill(); }
  });
  // the doctor's head mirror: a band round the forehead, a silver disc with a hole and a glint
  const mk = clamp(o.mirror || 0);
  if (mk > 0.01) {
    const pop = E.outBack(mk, 2.2);
    actor(() => { c.save(); c.translate(0, -540); c.scale(pop, pop);
      c.beginPath(); c.ellipse(0, 8, 110, 26, 0, Math.PI * 0.05, Math.PI * 0.95, true); c.lineWidth = 14; c.strokeStyle = '#2B2F3A'; c.stroke();
      circle(c, -22, -26, 50, '#8A93A3'); circle(c, -22, -26, 43, '#D9E1EC'); circle(c, -22, -26, 9, '#3A404C');
      c.restore(); });
    paint(() => { const g2 = Math.max(0, Math.sin(t * 3.1)); circle(c, -40, -584, 10 * (0.6 + g2), rgba('#FFFFFF', 0.9)); });
    softDot(gctx, x + (-22) * s, y + (-566) * s, 60 * s, '#FFFFFF', 0.3 * mk);
  }
  // big round glasses
  const gk = clamp(o.glasses || 0);
  if (gk > 0.01) {
    const gy = -478 - (1 - E.outBack(gk, 2)) * 160;
    paint(() => {
      for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 52, gy, 46, 0, 7); c.lineWidth = 11; c.strokeStyle = '#1B1820'; c.stroke(); c.fillStyle = rgba('#CFEFFF', 0.22); c.fill(); }
      line(c, -8, gy - 4, 8, gy - 4, 9, '#1B1820'); line(c, -98, gy - 8, -120, gy - 16, 8, '#1B1820'); line(c, 98, gy - 8, 120, gy - 16, 8, '#1B1820');
      circle(c, -68, gy - 18, 7, rgba('#FFFFFF', 0.85)); circle(c, 36, gy - 18, 7, rgba('#FFFFFF', 0.85));
    });
  }
  c.restore();   // the head's tilt
  }
  // the clipboard, held up in its left hoof (screen right)
  const bk = clamp(o.board || 0);
  if (FR && bk > 0.01) {
    const by = 40 - E.outBack(bk, 1.8) * 300;
    actor(() => { c.save(); c.translate(116, by); c.rotate(0.08);
      rrect(c, -95, -130, 190, 250, 14); c.fillStyle = '#9A6A3A'; c.fill();
      rrect(c, -80, -110, 160, 218, 6); c.fillStyle = '#FBF8F0'; c.fill();
      rrect(c, -34, -142, 68, 34, 8); c.fillStyle = '#AEB6C2'; c.fill();
      c.restore(); });
    paint(() => { c.save(); c.translate(116, by); c.rotate(0.08);
      c.fillStyle = '#1A1430'; c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('BRAIN', 0, -72); c.fillText('TEST', 0, -26);
      for (let i = 0; i < 3; i++) { rrect(c, -60, 12 + i * 30, 22, 22, 4); c.lineWidth = 4; c.strokeStyle = '#1A1430'; c.stroke(); line(c, -28, 23 + i * 30, 58, 23 + i * 30, 5, '#B8B0A4'); }
      line(c, -56, 26, -50, 32, 5, '#2FAE5A'); line(c, -50, 32, -38, 16, 5, '#2FAE5A');
      c.restore(); });
    // the hoof holding it
    actor(() => { rrect(c, 53, by + 60, 56, 40, 14); c.fillStyle = GOAT.hoof; c.fill(); });
  }
  c.restore();
}
