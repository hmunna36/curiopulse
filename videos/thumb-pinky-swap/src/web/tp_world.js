// tp_world.js — Can You SWAP Your Thumb and Pinky? (25 Nov 2026). A wooden dock on a mountain lake on a bright morning;
// the hiker sits on it with two fists up, his ginger copycat across the planks. Built on fist-edge-palm's fp_world.js
// (the 3D camera `fpCam` / `fpP` / `fpKeys`, `fp2D`, the plate drawn at the camera's heading), one-finger's fist3d.js (the
// 3D hand), bent-wrist-fist's bwhand.js (the forearm), sign-seven's s7_world.js (s7Geo: every joint set by hand; tags,
// bursts, rings) and cats-purr's purrcat.js (the cat). New here (borrow it):
// - `initTp`: a 360-degree LAKE plate painted once (morning sky, snowy ranges, a pine shore with a cabin and a red canoe,
//   the lake mirroring all of it in broken bands, ripples that grow toward us, a sun glitter path); `tpBack` draws it with
//   a live sparkle on the glitter path;
// - `tpDock`: dock planks in true perspective (grain as 3D lines, the side face, pilings with rope, a tackle box, a rope
//   coil, a bucket), water lapping round the pilings;
// - TWO hands: `tpHandGeo` (a fist with the thumb 0 tucked .. 1 out sideways, the little finger 0 curled .. 1 out and
//   splayed), `tpXf` (each hand placed palm down in the air in front of his chest; the left hand is the same rig mirrored),
//   `tpDrawHand`; `tpTip` (the thumb's or the little finger's tip in the world);
// - `tpTie`: a glowing elastic between two fingertips (the twin's string), with slack, a yank and travelling beads.
// World frame (cm): X to his right, Y up (the dock's planks are Y = 0), Z toward him (he sits at +Z, the cat at -Z).
'use strict';

const TP = { tx: [-62, 62], tz: [-290, 110], plank: 14, gap: 0.8, water: -34, heroZ: 46, catZ: -74 };
const TP_SUN = [0.5, 0.55, -0.66];        // the morning sun: up and to the right of the cat (the key light comes from there)
const TP_COL = { thumb: '#FFD447', pinky: '#FF86A6' };   // the thumb's colour and the little finger's (the captions use them)

// ---------------------------------------------------------------- the lake (a 360-degree plate, painted once)
function initTp() {
  const PXR = FPB.PXR, w = Math.round(Math.PI * 2 * PXR), h = Math.round(FPB.EL * 2 * PXR), hy = h / 2;
  const cv = mkCanvas(w, h), c = cv.getContext('2d');
  const rng = mulberry32(2511);
  const shore = hy + 24;
  // sky
  const g = c.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, '#1257C9'); g.addColorStop(0.5, '#3D8DE8'); g.addColorStop(1, '#B6E2FF');
  c.fillStyle = g; c.fillRect(0, 0, w, hy + 30);
  for (let i = 0; i < 12; i++) {
    const x0 = rng() * w, y = hy * (0.16 + rng() * 0.42), s = 0.6 + rng() * 0.9;
    for (const x of [x0 - w, x0, x0 + w]) {
      for (let j = 0; j < 6; j++) ellipse(c, x + (j - 2.5) * 46 * s, y + Math.sin(j * 1.7) * 10 * s, 70 * s, 34 * s, rgba('#FFFFFF', 0.86));
      ellipse(c, x, y + 18 * s, 170 * s, 22 * s, rgba('#DDEEFF', 0.8));
    }
  }
  // ridges (wavy lines with peaks; snow caps on the high ones), seamless round the plate
  const range = (base, amp, col, snow, seed, peaks) => {
    const r2 = mulberry32(seed), P = [], pk = [];
    for (let i = 0; i < peaks; i++) pk.push([r2() * w, amp * (0.55 + 0.45 * r2()), 120 + r2() * 160]);
    for (let x = -10; x <= w + 10; x += 8) {
      let y = base;
      for (const [px, a, sp] of pk) for (const off of [-w, 0, w]) { const d = Math.abs(x - px - off) / sp; if (d < 1.6) y -= a * Math.max(0, 1 - d * 0.62) * (1 - 0.18 * Math.abs(Math.sin(x * 0.05 + px))); }
      y += 6 * Math.sin(x * 0.031 + seed) + 3 * Math.sin(x * 0.11);
      P.push([x, y]);
    }
    c.beginPath(); c.moveTo(-10, shore + 2); for (const p of P) c.lineTo(p[0], p[1]); c.lineTo(w + 10, shore + 2); c.closePath();
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
  range(hy - 30, 230, '#7FA0CF', '#F4F8FF', 81, 9);       // far: blue-grey peaks with snow
  range(hy - 10, 140, '#5C88BC', '#E9F2FF', 82, 11);      // middle
  const near = range(shore - 4, 64, '#2F7E45', null, 83, 16);   // the pine shore's hills
  // pines along the shore
  for (let i = 0; i < 260; i++) {
    const x = rng() * w, j = Math.floor((x + 10) / 8), top = near[clamp(j, 0, near.length - 1)][1];
    const y = lerp(top + 10, shore + 2, Math.pow(rng(), 0.6)), s = 0.45 + rng() * 0.6;
    c.fillStyle = ['#1E5A30', '#245F35', '#1A4F2A'][Math.floor(rng() * 3)];
    for (const xx of [x - w, x, x + w]) { c.beginPath(); c.moveTo(xx, y - 52 * s); c.lineTo(xx + 15 * s, y); c.lineTo(xx - 15 * s, y); c.closePath(); c.fill(); }
  }
  // a cabin with a red roof and a little jetty on the far shore (heading about 0.55 rad: right of the cat), a red canoe
  const hx = 0.55 * PXR + w / 2, hyy = shore - 4;
  c.fillStyle = '#8A5630'; c.fillRect(hx - 54, hyy - 58, 108, 58);
  c.fillStyle = '#C8452E'; c.beginPath(); c.moveTo(hx - 70, hyy - 54); c.lineTo(hx, hyy - 100); c.lineTo(hx + 70, hyy - 54); c.closePath(); c.fill();
  c.fillStyle = '#FFE6A8'; c.fillRect(hx - 30, hyy - 42, 20, 18); c.fillRect(hx + 12, hyy - 42, 20, 18);
  c.fillStyle = '#5A341C'; c.fillRect(hx + 28, hyy - 106, 12, 30);
  c.fillStyle = '#7A4E2C'; c.fillRect(hx + 40, hyy - 6, 110, 7);
  const cx2 = hx - 190; c.fillStyle = '#E0412E'; c.beginPath(); c.moveTo(cx2 - 52, hyy + 6); c.quadraticCurveTo(cx2, hyy + 18, cx2 + 52, hyy + 6); c.quadraticCurveTo(cx2, hyy + 9, cx2 - 52, hyy + 6); c.fill();
  // behind him (heading PI): a boathouse where the dock starts
  const bx = w / 2 + Math.PI * PXR * 0.999 - w, bx2 = bx + w;
  for (const xx of [bx, bx2]) {
    c.fillStyle = '#7B4B2A'; c.fillRect(xx - 120, shore - 120, 240, 124);
    c.fillStyle = '#2E5E8C'; c.beginPath(); c.moveTo(xx - 140, shore - 114); c.lineTo(xx, shore - 190); c.lineTo(xx + 140, shore - 114); c.closePath(); c.fill();
    c.fillStyle = '#3B2414'; c.fillRect(xx - 60, shore - 84, 120, 88);
    c.fillStyle = '#FFE6A8'; c.fillRect(xx - 104, shore - 96, 26, 22); c.fillRect(xx + 78, shore - 96, 26, 22);
  }
  // ---- the lake: the shore mirrored in broken bands, then the water's own colour over it
  const rh = 380;   // how much of the picture above the shore line is mirrored
  const mir = mkCanvas(w, rh), mc = mir.getContext('2d');
  mc.drawImage(cv, 0, shore - rh, w, rh, 0, 0, w, rh);
  const wg = c.createLinearGradient(0, shore, 0, h);
  wg.addColorStop(0, '#6FB3EA'); wg.addColorStop(0.25, '#3F92D6'); wg.addColorStop(0.7, '#1F72B8'); wg.addColorStop(1, '#16609F');
  c.fillStyle = wg; c.fillRect(0, shore, w, h - shore);
  for (let y = 0; y < rh * 1.15; y += 5) {
    const sy = rh - 1 - y / 1.15, dx = 6 * Math.sin(y * 0.37) + 3 * Math.sin(y * 1.3);
    if (sy < 0) break;
    c.globalAlpha = 0.5 * (1 - y / (rh * 1.3));
    c.drawImage(mir, 0, sy, w, 1, dx, shore + y, w, 5);
    c.drawImage(mir, 0, sy, w, 1, dx - w, shore + y, w, 5);
  }
  c.globalAlpha = 1;
  // a band of mist on the shore line
  const mg2 = c.createLinearGradient(0, shore - 14, 0, shore + 16);
  mg2.addColorStop(0, rgba('#EAF6FF', 0)); mg2.addColorStop(0.5, rgba('#EAF6FF', 0.55)); mg2.addColorStop(1, rgba('#EAF6FF', 0));
  c.fillStyle = mg2; c.fillRect(0, shore - 14, w, 30);
  // ripples: thin light dashes that grow toward us
  for (let i = 0; i < 2400; i++) {
    const u = Math.pow(rng(), 0.8), y = shore + 8 + u * (h - shore - 8), x = rng() * w, len = 10 + 90 * u * u + rng() * 30;
    const a = 0.16 + 0.22 * rng();
    c.strokeStyle = rgba(rng() < 0.7 ? '#CFEAFF' : '#0F4E86', a); c.lineWidth = 1 + 2.4 * u;
    for (const xx of [x - w, x, x + w]) { c.beginPath(); c.moveTo(xx - len / 2, y); c.quadraticCurveTo(xx, y - 2 - 3 * u, xx + len / 2, y); c.stroke(); }
  }
  // the sun's glitter path on the water (heading of the sun, below the horizon)
  const sh = Math.atan2(TP_SUN[0], -TP_SUN[2]), gx = w / 2 + sh * PXR;
  for (let i = 0; i < 520; i++) {
    const u = Math.pow(rng(), 0.7), y = shore + 6 + u * (h - shore - 6) * 0.9, sp = 26 + 260 * u;
    const x = gx + (rng() + rng() - 1) * sp, len = 6 + 40 * u * rng();
    c.strokeStyle = rgba('#FFF6D6', 0.35 + 0.5 * rng()); c.lineWidth = 1.5 + 2.5 * u;
    c.beginPath(); c.moveTo(x - len / 2, y); c.lineTo(x + len / 2, y); c.stroke();
  }
  // lily pads in the near water, here and there
  for (let i = 0; i < 46; i++) {
    const u = 0.35 + 0.65 * rng(), y = shore + u * (h - shore), x = rng() * w, r = 8 + 34 * u;
    for (const xx of [x - w, x, x + w]) {
      ellipse(c, xx, y, r, r * 0.32, '#3E9A4A');
      c.fillStyle = '#2E7E3A'; c.beginPath(); c.moveTo(xx, y); c.lineTo(xx + r, y - r * 0.08); c.lineTo(xx + r * 0.8, y + r * 0.16); c.closePath(); c.fill();
      if (rng() < 0.3) { circle(c, xx - r * 0.3, y - r * 0.12, r * 0.18, '#FF9ACD'); circle(c, xx - r * 0.3, y - r * 0.16, r * 0.08, '#FFE36A'); }
    }
  }
  FP_BG = cv;
  // the soft copy: blurred from a wrapped, padded copy, so the plate's seam (behind him) does not show
  const pad = 40, wide = mkCanvas(w + pad * 2, h), wc = wide.getContext('2d');
  for (const off of [-w, 0, w]) wc.drawImage(cv, pad + off, 0);
  const sv = mkCanvas(w, h), s = sv.getContext('2d');
  s.filter = 'blur(4px)'; s.drawImage(wide, -pad, 0); s.filter = 'none';
  FP_BGS = sv;
}
// the plate at the camera's heading and pitch (screen space), the sun's glow and a live sparkle on the glitter path
function tpBack(V, t, o = {}) {
  const PXR = FPB.PXR, img = (o.soft === undefined ? 1 : o.soft) > 0.5 ? FP_BGS : FP_BG;
  const w = img.width, h = img.height, sc = V.f / PXR;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#16609F'; ctx.fillRect(0, 0, W, H);
  ctx.translate(V.cx, V.cy); if (V.roll) ctx.rotate(V.roll);
  { const yT = -(h / 2 - V.pitch * PXR) * sc; ctx.fillStyle = '#1257C9'; ctx.fillRect(-3 * W, yT - 4 * H, 6 * W, 4 * H + 2); }
  let x0 = -(w / 2 + V.head * PXR) * sc;
  const y0 = -(h / 2 - V.pitch * PXR) * sc;
  x0 = ((x0 % (w * sc)) + w * sc) % (w * sc) - w * sc;
  for (let i = -1; i < 3; i++) ctx.drawImage(img, x0 + i * w * sc, y0, w * sc, h * sc);
  ctx.restore();
  screenSpace();
  const sd = fv.norm(TP_SUN), sun = fpP(V, fv.add(V.C, fv.mul(sd, 5000)));
  if (fv.dot(sd, V.F) > 0.2) { softDot(gctx, sun[0], sun[1], 280, '#FFF2C0', 0.55); softDot(ctx, sun[0], sun[1], 150, '#FFFBEA', 0.55); }
  // sparkle on the glitter path: little stars that wink on a loop-safe clock
  const gd = fv.norm([sd[0], -sd[1], sd[2]]);
  if (fv.dot(gd, V.F) > 0.35) {
    const r2 = mulberry32(77);
    for (let i = 0; i < 26; i++) {
      const el = 0.05 + 0.5 * r2(), hd = (r2() - 0.5) * (0.06 + el * 0.5);
      const dir = fv.norm([gd[0] + Math.cos(Math.atan2(gd[0], -gd[2])) * hd, -Math.sin(el), gd[2] + Math.sin(Math.atan2(gd[0], -gd[2])) * hd]);
      const q = fpP(V, fv.add(V.C, fv.mul(dir, 3000)));
      const k = Math.max(0, Math.sin(t * loopW(1.6 + r2() * 1.2) + r2() * 6.28));
      if (k > 0.75) { const a = (k - 0.75) * 4; softDot(gctx, q[0], q[1], 26, '#FFF4C8', 0.6 * a); paint(() => { line(ctx, q[0] - 14 * a, q[1], q[0] + 14 * a, q[1], 2.5, rgba('#FFFFFF', 0.85 * a)); line(ctx, q[0], q[1] - 9 * a, q[0], q[1] + 9 * a, 2, rgba('#FFFFFF', 0.7 * a)); }); }
    }
  }
}

// a world polygon clipped at the camera's near plane (so planks behind the camera never project), then filled
function tpQuad(V, P, col) {
  const near = 4, cz = (p) => fv.dot(fv.sub(p, V.C), V.F), out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], za = cz(a), zb = cz(b);
    if (za >= near) out.push(a);
    if ((za >= near) !== (zb >= near)) { const u = (near - za) / (zb - za); out.push(fv.lerp(a, b, u)); }
  }
  if (out.length < 3) return null;
  const Q = out.map((p) => fpP(V, p));
  ctx.beginPath(); ctx.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) ctx.lineTo(Q[i][0], Q[i][1]); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  return Q;
}
// ---------------------------------------------------------------- the dock
const TP_WOOD = ['#A8703F', '#B27A47', '#9E6A3C', '#AC7444', '#A06A3A', '#B07848'];
function tpDock(V, t, o = {}) {
  screenSpace();
  const [x0, x1] = TP.tx, [z0, z1] = TP.tz, dz = TP.plank + TP.gap;
  const n = Math.floor((z1 - z0) / dz);
  // the water lapping under the dock's edges, and the side faces (the side nearest the camera)
  const sx = V.C[0] > 0 ? x1 : x0;
  tpQuad(V, [[x0, -0.3, z0], [x1, -0.3, z0], [x1, -0.3, z1], [x0, -0.3, z1]], '#3A2212');
  actor(() => tpQuad(V, [[sx, 0, z0], [sx, 0, z1], [sx, -9, z1], [sx, -9, z0]], '#6A4022'));
  if (V.C[2] < z0 + 40) actor(() => tpQuad(V, [[x0, 0, z0], [x1, 0, z0], [x1, -9, z0], [x0, -9, z0]], '#6E4324'));
  for (let i = 0; i < n; i++) {
    const za = z0 + i * dz, zb = za + TP.plank;
    if (V.C[2] < zb - 400) continue;
    if (fv.dot(fv.sub([0, 0, za], V.C), V.F) < 4 && fv.dot(fv.sub([0, 0, zb], V.C), V.F) < 4 && fv.dot(fv.sub([x0, 0, za], V.C), V.F) < 4 && fv.dot(fv.sub([x1, 0, za], V.C), V.F) < 4) continue;
    actor(() => tpQuad(V, [[x0, 0, za], [x1, 0, za], [x1, 0, zb], [x0, 0, zb]], TP_WOOD[i % TP_WOOD.length]));
    paint(() => {
      const r2 = mulberry32(140 + i);
      for (let j = 0; j < 3; j++) {
        const z = lerp(za, zb, 0.15 + 0.7 * r2()), Q = [];
        for (let x = x0; x <= x1; x += 8) { const q = fpP(V, [x, 0, z + 0.5 * Math.sin(x * 0.08 + j * 2 + i)]); if (fv.dot(fv.sub([x, 0, z], V.C), V.F) > 4) Q.push(q); }
        if (Q.length < 2) continue;
        const k = Q[Math.floor(Q.length / 2)][2];
        poly(ctx, Q.map((q) => [q[0], q[1]]), Math.max(1, k * 0.1), rgba('#5A3016', 0.3));
      }
      for (const nx of [x0 + 5, x1 - 5]) { const q = fpP(V, [nx, 0, (za + zb) / 2]); if (q[3] > 4) circle(ctx, q[0], q[1], Math.max(1, q[2] * 0.45), rgba('#3A2A20', 0.7)); }
    });
  }
  // the sun's warm wash on the planks
  const c0 = fpP(V, [10, 0, -30]);
  if (c0[3] > 4) softDot(ctx, c0[0], c0[1], 900 * c0[2] / 20, '#FFE6B0', 0.1);
}
// a piling: a round post from under the water up past the planks, a rope round it (drawn from the camera)
function tpPost(V, x, z, top = 26) {
  const a = fpP(V, [x, top, z]), b = fpP(V, [x, TP.water - 10, z]);
  if (a[3] < 3) return;
  const r = 6.5 * a[2], rb = 6.5 * b[2];
  actor(() => {
    ctx.fillStyle = '#7A4A26'; ctx.beginPath(); ctx.moveTo(a[0] - r, a[1]); ctx.lineTo(a[0] + r, a[1]); ctx.lineTo(b[0] + rb, b[1]); ctx.lineTo(b[0] - rb, b[1]); ctx.closePath(); ctx.fill();
    ellipse(ctx, a[0], a[1], r, r * 0.42, '#9A6236');
  });
  paint(() => {
    ellipse(ctx, a[0], a[1], r * 0.6, r * 0.22, rgba('#5A3A20', 0.6));
    const ry = fpP(V, [x, top - 8, z]);
    for (let i = 0; i < 3; i++) line(ctx, ry[0] - r * 1.02, ry[1] + i * r * 0.3, ry[0] + r * 1.02, ry[1] + i * r * 0.3 + r * 0.12, Math.max(2, r * 0.22), '#E8D3A2');
    const wq = fpP(V, [x, TP.water, z]);
    if (wq[3] > 3) ellipse(ctx, wq[0], wq[1], r * 1.5, r * 0.4, rgba('#DDF0FF', 0.35));
  });
}
// props on the planks (2D sprites stood up at a world point, scaled by the camera)
function tpTackle(V, P) {
  const q = fpP(V, P); if (q[3] < 4) return;
  const s = q[2] / 9;
  actor(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
    ellipse(ctx, 0, 4, 70, 12, 'rgba(40,20,8,0.3)');
    rrect(ctx, -66, -64, 132, 66, 8); ctx.fillStyle = '#D93A30'; ctx.fill();
    rrect(ctx, -66, -74, 132, 16, 6); ctx.fillStyle = '#B22A22'; ctx.fill();
    ctx.fillStyle = '#E8E2D2'; ctx.fillRect(-14, -84, 28, 12);
    ctx.restore(); });
  paint(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s); ctx.fillStyle = '#F4D46A'; ctx.fillRect(-8, -50, 16, 12); ctx.restore(); });
}
function tpCoil(V, P) {
  const q = fpP(V, P); if (q[3] < 4) return;
  const s = q[2] / 9;
  actor(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, -4 - i * 6, 52 - i * 3, 18 - i, 0, 0, 7); ctx.lineWidth = 9; ctx.strokeStyle = i % 2 ? '#E2CC98' : '#D6BE88'; ctx.stroke(); }
    ctx.restore(); });
}
function tpBucket(V, P) {
  const q = fpP(V, P); if (q[3] < 4) return;
  const s = q[2] / 9;
  actor(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
    ellipse(ctx, 0, 4, 46, 10, 'rgba(40,20,8,0.3)');
    ctx.fillStyle = '#4C8FD8'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-42, -72); ctx.lineTo(42, -72); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill();
    ellipse(ctx, 0, -72, 42, 11, '#3A72B4');
    ctx.restore(); });
  paint(() => { ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s); ellipse(ctx, 0, -71, 34, 7, '#7CC6F0'); ctx.beginPath(); ctx.arc(0, -72, 44, Math.PI * 1.08, Math.PI * 1.92); ctx.lineWidth = 3; ctx.strokeStyle = '#C8D0DA'; ctx.stroke(); ctx.restore(); });
}

// ---------------------------------------------------------------- the two hands
// thumb: tucked over the curled fingers .. out to the side (palm down, it points across at the other hand)
const TP_THUMB = {
  wrap: [[2.85, 2.2, 0.7], [4.25, 4.95, 2.35], [3.25, 6.75, 4.55], [1.15, 7.25, 5.75]],
  out: [[2.85, 2.2, 0.7], [5.0, 3.55, 0.35], [7.05, 4.25, -0.1], [8.85, 4.7, -0.45]],
};
// h: {thumb 0..1, pinky 0..1, open 0..1 (the whole hand opens for a wave), t, tr (a tremble 0..1)}
function tpHandGeo(h) {
  const b = {}, lean = {}, pk = E.inOutSine(clamp(h.pinky || 0)), tr = h.tr || 0, op = E.inOutSine(clamp(h.open || 0));
  for (const k of FK_ORD) { b[k] = s7Mix(S7P.fist, S7P.straight, op); lean[k] = lerp({ I: -0.02, M: 0, R: 0.03, L: 0.06 }[k], S7_SPREAD[k], op); }
  b.L = s7Mix(b.L, [0.06, 0.1, 0.05], pk);
  lean.L = lerp(lean.L, 0.5, pk * (1 - op));
  const G = s7Geo({ b, lean, thumb: 0, t: h.t || 0, chunk: 1.14, tremble: tr ? { I: tr * 0.3, M: tr * 0.3, R: tr * 0.3, L: tr } : {} });
  const tu = E.inOutSine(clamp(Math.max(h.thumb || 0, op)));
  const shk = tr * 0.25 * vnoise((h.t || 0) * 23, 5);
  G.thumb.pts = TP_THUMB.wrap.map((p, i) => { const q = fkLerp(p, TP_THUMB.out[i], tu); return i ? [q[0], q[1] + shk * i, q[2]] : q; });
  return G;
}
// side: 1 = his right hand, -1 = his left. o: {x, y, z (the wrist), head (the forearm's heading: + toward his right),
// pitch (the forearm rises toward the fingers), roll (turns the fist about the forearm: + lifts the thumb side)}
function tpXf(side, o) {
  const hd = o.head || 0, pt = o.pitch || 0;
  const fwd = fv.norm([Math.sin(hd) * Math.cos(pt), Math.sin(pt), -Math.cos(hd) * Math.cos(pt)]);
  const dn0 = [0, -1, 0], dn1 = fv.norm(fv.sub(dn0, fv.mul(fwd, fv.dot(dn0, fwd))));
  const xa0 = fv.cross(fwd, dn1);                     // toward the thumb of a right hand (his left)
  const rl = (o.roll || 0) * side, cr = Math.cos(rl), sr = Math.sin(rl);
  const xa = fv.norm(fv.add(fv.mul(xa0, cr), fv.mul(dn1, sr))), dn = fv.norm(fv.sub(fv.mul(dn1, cr), fv.mul(xa0, sr)));
  const wrist = [o.x, o.y, o.z], sc = o.sc || 1;     // sc: the hand's size (a kid's: 0.7)
  const toW = (p) => fv.add(wrist, fv.mul(fv.add(fv.add(fv.mul(xa, p[0] * side), fv.mul(fwd, p[1])), fv.mul(dn, p[2])), sc));
  return { wrist, toW, fwd, side, sc, elbow: fv.sub(wrist, fv.mul(fwd, BWK.L * sc)) };
}
function tpProj(V, X) { const pa = (p) => fpP(V, X.toW(p)); return { pa, ph: pa, th: 0, X }; }
function tpDrawHand(c, P2, G, o = {}) {
  // a kid's red jumper over the forearm (the coat's colours swapped for this hand, then put back)
  const keep = [PAL.coat, PAL.coatSh];
  if (o.kid) { PAL.coat = '#E8504A'; PAL.coatSh = '#B8322E'; }
  const items = bwArmItems(c, P2, {}).concat(fpSleeveItems(c, P2, o)).concat(o.items || []);
  fkDraw(c, P2.ph, G, { noArm: true, items });
  if (o.kid) { PAL.coat = keep[0]; PAL.coatSh = keep[1]; }
}
// the tip of the thumb ('T') or the little finger ('L') in the world, a little beyond the pad
function tpTip(G, X, k) {
  if (k === 'T') { const P = G.thumb.pts, a = P[2], b = P[3], d = fv.norm(fv.sub(b, a)); return X.toW(fv.add(b, fv.mul(d, 0.7))); }
  return X.toW(fkTip(G, 'L', 0.5));
}
// the twin's string: a glowing elastic from world point A to B. k: 0..1 (drawn on from both ends), slack 0..1 (it sags),
// taut 0..1 (straight and thin, quivering), beads: travelling lights (the order leaking across), col
function tpTie(V, A, B, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k); if (k <= 0.01) return;
  const t = o.t || 0, col = o.col || '#FFD447', n = 28, P = [];
  const a = fpP(V, A), b = fpP(V, B), d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const sag = (o.slack === undefined ? 0.35 : o.slack) * d * 0.22 * (1 - (o.taut || 0)), qv = (o.taut || 0) * 7 * Math.sin(t * 60);
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + sag * Math.sin(Math.PI * u) + qv * Math.sin(Math.PI * u * 3);
    P.push([x, y]);
  }
  const m = Math.floor(n / 2), half = Math.round(m * k);
  const seg = P.slice(m - half, m + half + 1);
  if (seg.length < 2) return;
  const wd = Math.max(5, lerp(a[2], b[2], 0.5) * 0.62) * (1 - 0.35 * (o.taut || 0)) * (o.w || 1);
  const ch = clamp(o.chain || 0);
  paint(() => {
    poly(ctx, P.length && k >= 1 ? P : seg, wd + 6, rgba('#1A0F2A', 0.55));
    poly(ctx, k >= 1 ? P : seg, wd, ch > 0.5 ? '#9AA7B8' : col);
    poly(ctx, k >= 1 ? P : seg, wd * 0.35, rgba('#FFFFFF', 0.75));
    if (ch > 0.01) {
      // a steel chain: links along the line (the gene's version: for life)
      const L = []; let acc = 0;
      for (let i = 1; i < P.length; i++) acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      const step = Math.max(18, wd * 3.2), nL = Math.max(3, Math.floor(acc / step));
      let i = 1, run = 0;
      for (let j = 0; j <= nL; j++) {
        const want = (j / nL) * acc;
        while (i < P.length - 1 && run + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) < want) { run += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); i++; }
        const sl = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) || 1, f = clamp((want - run) / sl);
        const x = lerp(P[i - 1][0], P[i][0], f), y = lerp(P[i - 1][1], P[i][1], f), an = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]);
        ctx.save(); ctx.translate(x, y); ctx.rotate(an + (j % 2 ? 0 : 0)); ctx.globalAlpha = ch;
        ctx.beginPath(); ctx.ellipse(0, 0, step * 0.62, j % 2 ? wd * 0.55 : wd * 1.05, 0, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(4, wd * 0.55); ctx.strokeStyle = '#4A5566'; ctx.stroke();
        ctx.lineWidth = Math.max(2.5, wd * 0.36); ctx.strokeStyle = j % 2 ? '#C9D3E0' : '#E8EEF6'; ctx.stroke();
        ctx.restore();
      }
    }
  });
  const gw = Math.min(wd, wd / (o.w || 1) * 1.1) * 2.2;
  gctx.save(); poly(gctx, k >= 1 ? P : seg, gw, rgba(ch > 0.5 ? '#CFE2FF' : col, 0.55 * (1 - 0.6 * ch) / Math.max(1, (o.w || 1) * 0.8))); gctx.restore();
  if ((o.w || 1) > 1.3 && ch < 0.5) paint(() => {
    // a rope's twist: short slanted strokes along it
    const Q = k >= 1 ? P : seg;
    for (let i = 1; i < Q.length; i++) {
      const an = Math.atan2(Q[i][1] - Q[i - 1][1], Q[i][0] - Q[i - 1][0]), dl = Math.hypot(Q[i][1] - Q[i - 1][1], Q[i][0] - Q[i - 1][0]);
      for (let j = 0; j < dl; j += wd * 0.9) {
        const x = Q[i - 1][0] + Math.cos(an) * j, y = Q[i - 1][1] + Math.sin(an) * j, ca = Math.cos(an + 0.9), sa = Math.sin(an + 0.9);
        line(ctx, x - ca * wd * 0.42, y - sa * wd * 0.42, x + ca * wd * 0.42, y + sa * wd * 0.42, Math.max(2, wd * 0.12), rgba('#8A5A10', 0.45));
      }
    }
  });
  if (k >= 1) {
    // the knots on the fingertips
    const w0 = wd / (o.w || 1);
    for (const q of [P[0], P[n]]) { circle(ctx, q[0], q[1], Math.max(w0, wd * 0.6) * 0.95, ch > 0.5 ? '#C9D3E0' : col); softDot(gctx, q[0], q[1], w0 * 3, col, 0.6 * (1 - 0.6 * ch)); }
    // beads: the order travelling across (dir 1: A -> B)
    for (const bd of (o.beads || [])) {
      const u = clamp(bd.u), i = Math.floor(u * n), f = u * n - i, q = [lerp(P[i][0], P[Math.min(n, i + 1)][0], f), lerp(P[i][1], P[Math.min(n, i + 1)][1], f)];
      paint(() => circle(ctx, q[0], q[1], wd * 1.25, '#FFFFFF'));
      softDot(gctx, q[0], q[1], wd * 4.5, col, 0.9);
    }
  }
}

// ---------------------------------------------------------------- him, seen from in front of the dock
// the hiker seated cross-legged on the planks (hips at Y = 4, at TP.heroZ), his upper arms out to the two 3D elbows
const TP_RU = 0.28;                       // cm per rig unit
function tpHero(V, t, S, X) {
  const pose = JSON.parse(JSON.stringify(POSES.sit)); pose.lean = 0.0;
  const rr = rig(pose);
  const oY = 4 - 34 * TP_RU;
  const q = fpP(V, [0, oY, TP.heroZ]), z = q[2] * TP_RU;
  const cam = fp2D(q[0], q[1], z);
  const st = { x: 0, y: 0, s: 1, pose, face: S.face, noArms: true, noLegs: true, headRot: S.hrot || 0, headDY: S.hdy || 0, headDX: S.hdx || 0 };
  const r = charLayer(cam, st, t, { pal: PAL, ambient: 0.03 });
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.drawImage(layerC, 0, 0, W / 2, H / 2); gctx.restore();
  const hero = { r, st, cam, z, head: toScreen(cam, r.head[0], r.head[1]) };
  // the upper arms: the rig's screen-left shoulder is his right
  const shR = toScreen(cam, r.shL[0], r.shL[1]), shL = toScreen(cam, r.shR[0], r.shR[1]);
  const w = 46 * z;
  screenSpace();
  actor(() => {
    for (const [sh, Xs] of [[shR, X.R], [shL, X.L]]) {
      const el = fpP(V, Xs.elbow);
      line(ctx, sh[0], sh[1], el[0], el[1], w, PAL.coat);
      circle(ctx, el[0], el[1], w * 0.52, PAL.coatSh);
    }
  });
  return hero;
}
// from his own eyes: the sleeves run on from the elbows out of the bottom of the frame
function tpPovUpper(V, X, kid = false) {
  screenSpace();
  for (const Xs of [X.L, X.R]) {
    const el = fpP(V, Xs.elbow), below = fpP(V, fv.add(Xs.elbow, [Xs.side * 4, -8, 22]));
    if (el[3] > 3) actor(() => line(ctx, el[0], el[1], below[0], below[1], 8.5 * el[2] * (kid ? 0.75 : 1), kid ? '#E8504A' : PAL.coat));
  }
}

// a padlock hanging on the twin's chain (screen space): s = scale, shut 0 (open shackle) .. 1 (snapped shut), with a
// flash when it shuts
function tpPadlock(x, y, s, shut, t) {
  if (s <= 0.01) return;
  screenSpace();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  const up = 26 * (1 - E.outBack(clamp(shut), 3));
  actor(() => {
    ctx.beginPath(); ctx.arc(0, -40 - up, 30, Math.PI, 0); ctx.lineWidth = 15; ctx.strokeStyle = '#8C97A8'; ctx.stroke();
    line(ctx, -30, -40 - up, -30, -18 - up * 0.2, 15, '#8C97A8');
    line(ctx, 30, -40 - up, 30, -18 + (up > 2 ? -up : 0), 15, '#8C97A8');
    rrect(ctx, -50, -26, 100, 82, 14); ctx.fillStyle = '#E8B930'; ctx.fill();
  });
  paint(() => {
    ctx.beginPath(); ctx.arc(0, -40 - up, 30, Math.PI, 0); ctx.lineWidth = 5; ctx.strokeStyle = '#D9E2EE'; ctx.stroke();
    rrect(ctx, -50, -26, 100, 16, 8); ctx.fillStyle = '#FFD95A'; ctx.fill();
    circle(ctx, 0, 10, 11, '#4A3410'); ctx.fillStyle = '#4A3410'; ctx.fillRect(-4, 12, 8, 22);
  });
  if (shut > 0 && shut < 1) softDot(gctx, 0 * s + x, y, 140 * s, '#FFF6C8', 0.8 * (1 - shut));
  ctx.restore();
}
