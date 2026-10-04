// The folded leg as an x-ray, in profile: thigh, the knee folded tight, the shin tucked back under it, the foot.
// A nerve runs down the back of the leg and through the fold (where it gets squashed), with the tiny vessels that feed
// it; an artery down the front keeps flowing. Signals travel foot -> hip. Then the macro view: the nerve's fibres firing
// by themselves, a needle electrode, a scope trace and a counter.
'use strict';

let XR_GK = 1;                                           // glow scale for the x-ray shots (a shot sets it to about 1 / zoom: bloom grows with the zoom)
function crDense(P, per = 14) {                          // Catmull-Rom through the points -> a dense polyline
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < per; j++) {
      const u = j / per, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
const vadd = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];

// the leg for a fold `open` (0 = folded tight, 1 = swung open): joints, unit vectors, the nerve and artery paths
function legGeo(open) {
  const Hp = [150, 770], th = 0.10, tu = [Math.cos(th), Math.sin(th)], nt = [-tu[1], tu[0]];
  const K = vadd(Hp, tu, 560);
  const al = lerp(2.62, 1.45, open), su = [Math.cos(al), Math.sin(al)], ns = [-su[1], su[0]];
  const A = vadd(K, su, 470);
  const be = al + lerp(-0.78, -1.35, open), fu = [Math.cos(be), Math.sin(be)];
  const T = vadd(A, fu, 200);
  let bis = [-tu[0] + su[0], -tu[1] + su[1]]; const bl = Math.hypot(bis[0], bis[1]) || 1; bis = [bis[0] / bl, bis[1] / bl];
  const nerve = crDense([
    vadd(Hp, [-90, 14]), vadd(vadd(Hp, tu, 140), nt, 34), vadd(vadd(Hp, tu, 330), nt, 42), vadd(vadd(K, tu, -130), nt, 48),
    vadd(K, bis, 78), vadd(vadd(K, su, 130), ns, 40), vadd(vadd(K, su, 300), ns, 32), vadd(vadd(A, su, -30), ns, 22),
    vadd(A, fu, 62), vadd(T, fu, -18),
  ], 16);
  const artery = crDense([
    vadd(Hp, [-90, -40]), vadd(vadd(Hp, tu, 200), nt, -34), vadd(vadd(K, tu, -90), nt, -40), vadd(K, bis, -44),
    vadd(vadd(K, su, 120), ns, -30), vadd(vadd(A, su, -40), ns, -20), vadd(A, fu, 70), vadd(T, fu, -40),
  ], 14);
  const Q = vadd(K, bis, 118);                            // where the fold bites
  let iq = 0, best = 1e9;
  nerve.forEach((p, i) => { const d = Math.hypot(p[0] - Q[0], p[1] - Q[1]); if (d < best) { best = d; iq = i; } });
  return { Hp, K, A, T, tu, nt, su, ns, fu, bis, Q, nerve, acc: polyLen(nerve), artery, aacc: polyLen(artery), uq: iq / (nerve.length - 1), open };
}
function taperPath(c, a, b, wa, wb) {                    // a limb: a tapered capsule from a (half-width wa) to b (wb)
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  c.beginPath(); c.arc(a[0], a[1], wa, ang + Math.PI / 2, ang - Math.PI / 2); c.arc(b[0], b[1], wb, ang - Math.PI / 2, ang + Math.PI / 2); c.closePath();
}
// the leg itself: skin as blue glass with a bright outline, bones inside
function xrayLeg(G, t, a = 1) {
  const fill = `rgba(46,104,214,${0.26 * a})`, edge = `rgba(127,233,255,${0.85 * a})`;
  const limb = (p, q, wa, wb) => {
    taperPath(ctx, p, q, wa, wb); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = edge; ctx.stroke();
    taperPath(gctx, p, q, wa, wb); gctx.lineWidth = 5; gctx.strokeStyle = `rgba(90,190,255,${0.3 * a * XR_GK})`; gctx.stroke();
  };
  // the body it belongs to: he is sitting, seen from the side (the torso runs up and off the frame), spine inside
  limb([G.Hp[0] - 40, G.Hp[1] + 30], [G.Hp[0] - 96, G.Hp[1] - 620], 132, 118);
  for (let i = 0; i < 9; i++) { const u = i / 8, bx = lerp(G.Hp[0] - 78, G.Hp[0] - 134, u), by = lerp(G.Hp[1] - 40, G.Hp[1] - 560, u); rrect(ctx, bx - 20, by - 22, 40, 44, 12); ctx.fillStyle = `rgba(220,236,255,${0.3 * a})`; ctx.fill(); }
  // the foot: instep, toes, sole, heel (x along the foot, y toward the sole)
  const fn = [-G.fu[1], G.fu[0]], fp = (x, y) => [G.A[0] + G.fu[0] * x + fn[0] * y, G.A[1] + G.fu[1] * x + fn[1] * y];
  const footPath = (c) => {
    const P = [fp(-10, -50), fp(90, -46), fp(170, -34), fp(214, -14), fp(222, 14), fp(196, 36), fp(130, 34), fp(70, 20), fp(20, 46), fp(-34, 54), fp(-62, 26), fp(-56, -22)];
    c.beginPath(); c.moveTo((P[0][0] + P[11][0]) / 2, (P[0][1] + P[11][1]) / 2);
    for (let i = 0; i < 12; i++) { const q = P[i], n = P[(i + 1) % 12]; c.quadraticCurveTo(q[0], q[1], (q[0] + n[0]) / 2, (q[1] + n[1]) / 2); }
    c.closePath();
  };
  footPath(ctx); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = edge; ctx.stroke();
  footPath(gctx); gctx.lineWidth = 5; gctx.strokeStyle = `rgba(90,190,255,${0.3 * a * XR_GK})`; gctx.stroke();
  for (let i = 0; i < 5; i++) {                           // toes, the big one on the sole side
    const p = fp(226 - i * 5, 22 - i * 13);
    ctx.beginPath(); ctx.arc(p[0], p[1], 15 - i * 1.5, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = edge; ctx.stroke();
  }
  limb(G.K, G.A, 78, 50);
  limb(G.Hp, G.K, 100, 82);
  // bones
  const bone = (p, q, w) => {
    line(ctx, p[0], p[1], q[0], q[1], w, `rgba(220,236,255,${0.42 * a})`);
    circle(ctx, p[0], p[1], w * 0.72, `rgba(220,236,255,${0.42 * a})`); circle(ctx, q[0], q[1], w * 0.72, `rgba(220,236,255,${0.42 * a})`);
  };
  bone(vadd(G.Hp, G.tu, 10), vadd(G.K, G.tu, -34), 30);
  bone(vadd(G.K, G.su, 34), vadd(G.A, G.su, -14), 24);
  bone(vadd(G.A, G.fu, 20), vadd(G.A, G.fu, 180), 14);
  circle(ctx, G.K[0] + G.bis[0] * -52, G.K[1] + G.bis[1] * -52, 22, `rgba(220,236,255,${0.38 * a})`);   // kneecap
}
// the artery: red, with blood marching toward the foot. flow 0..1
function legArtery(G, t, a = 1, flow = 1) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; poly(ctx, G.artery, 15, '#7A1830'); poly(ctx, G.artery, 9, '#E0354F'); ctx.restore();
  gctx.save(); gctx.globalAlpha = 0.5 * a * XR_GK; poly(gctx, G.artery, 12, '#FF3A5A'); gctx.restore();
  const L = G.aacc[G.aacc.length - 1], n = 16;
  for (let i = 0; i < n; i++) {
    const s = ((t * 0.34 * flow + i / n) % 1) * L, p = polyAt(G.artery, G.aacc, s);
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(p[2]); ellipse(ctx, 0, 0, 9, 4.2, `rgba(255,190,200,${0.9 * a})`); ctx.restore();
  }
}
// the nerve. o: {a, dead 0..1 (below the fold it greys out), pinch 0..1 (squashed thin at the fold), flick 0..1
// (a faulty-tube flicker below the fold), hot 0..1 (extra glow below the fold), vess 0..1 (the tiny vessels shown),
// drain 0..1 (they pale below the fold), refill 0..1 (red runs back down them)}
function legNerve(G, t, o = {}) {
  const a = o.a === undefined ? 1 : o.a, N = G.nerve.length - 1, dead = o.dead || 0, pinch = o.pinch || 0;
  const fr = Math.floor(t * FPS), seg = [];
  for (let i = 0; i < N; i++) {
    const u = i / N, down = u > G.uq;
    const sq = pinch * Math.exp(-Math.pow((u - G.uq) / 0.035, 2));
    let al = a;
    if (down && o.flick > 0) { const on = hash(fr * 0.37 + Math.floor(u * 9) * 3.1) > 0.45 * o.flick ? 1 : 0.25; al *= lerp(1, on, o.flick); }
    seg.push({ p: G.nerve[i], q: G.nerve[i + 1], w: 17 * (1 - 0.62 * sq), al, down });
  }
  const liveCol = '#FFB23F', deadCol = mixHex('#FFB23F', '#56627F', dead), deadCore = mixHex('#FFE9A8', '#8A93AD', dead);
  for (const g of seg) line(ctx, g.p[0], g.p[1], g.q[0], g.q[1], g.w + 6, rgba('#3A1A08', 0.75 * g.al));
  for (const g of seg) { ctx.globalAlpha = g.al; line(ctx, g.p[0], g.p[1], g.q[0], g.q[1], g.w, g.down ? deadCol : liveCol); }
  for (const g of seg) { ctx.globalAlpha = g.al; line(ctx, g.p[0], g.p[1], g.q[0], g.q[1], g.w * 0.3, g.down ? deadCore : '#FFE9A8'); }
  ctx.globalAlpha = 1;
  for (const g of seg) {
    const gl = (g.down ? (1 - dead) + (o.hot || 0) : 1) * g.al;
    if (gl > 0.02) line(gctx, g.p[0], g.p[1], g.q[0], g.q[1], g.w * 1.5, rgba('#FF9A2A', 0.42 * Math.min(1.6, gl) * XR_GK));
  }
  // toe branches
  const end = G.nerve[N], dcol = mixHex('#FFB23F', '#56627F', dead);
  for (const k of [-1, 0, 1]) { const tip = vadd(vadd(end, G.fu, 34), [-G.fu[1], G.fu[0]], k * 16); line(ctx, end[0], end[1], tip[0], tip[1], 7, dcol); }
  // the tiny vessels wrapped around it
  const vs = o.vess || 0;
  if (vs > 0.01) {
    const drain = o.drain || 0, refill = o.refill || 0;
    for (const sgn of [-1, 1]) {
      let prev = null;
      for (let i = 0; i <= N; i += 1) {
        const u = i / N, p = G.nerve[i], q = G.nerve[Math.min(N, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]);
        const off = sgn * (13 + 5 * Math.sin(u * 60 + sgn));
        const pt = [p[0] - Math.sin(an) * off, p[1] + Math.cos(an) * off];
        if (prev) {
          const down = u > G.uq, back = down && refill > 0 && (u - G.uq) / (1 - G.uq) < refill;
          const pale = down && !back ? drain : 0;
          line(ctx, prev[0], prev[1], pt[0], pt[1], 6.5, rgba(pale > 0.5 ? '#8E9AB8' : '#FF4A62', vs * (pale > 0.5 ? 0.8 : 1)));
          if (sgn > 0 && i % 7 === 3) {                     // a capillary looping over the nerve to the vessel on the other side
            const o2 = -(13 + 5 * Math.sin(u * 60 - 1)), p2 = [p[0] - Math.sin(an) * o2, p[1] + Math.cos(an) * o2];
            line(ctx, pt[0], pt[1], p2[0], p2[1], 4, rgba(pale > 0.5 ? '#8E9AB8' : '#FF4A62', vs * 0.9));
          }
          if (!pale) line(gctx, prev[0], prev[1], pt[0], pt[1], 7, rgba('#FF3A5A', 0.3 * vs * (back ? 2 : 1) * XR_GK));
        }
        prev = pt;
      }
    }
    if (refill > 0 && refill < 1) {                       // the front of the returning blood
      const p = polyAt(G.nerve, G.acc, lerp(G.uq, 1, refill) * G.acc[N]);
      softDot(gctx, p[0], p[1], 70, '#FF3A5A', 0.9 * XR_GK); circle(ctx, p[0], p[1], 9, '#FFD0D6');
    }
  }
}
// signals: bright beads running foot -> hip. block 0..1: they die at the fold; dead 0..1: below the fold they stop coming
function legPulses(G, t, o = {}) {
  const a = o.a === undefined ? 1 : o.a, block = o.block || 0, dead = o.dead || 0, n = o.n || 7, L = G.acc[G.acc.length - 1];
  for (let i = 0; i < n; i++) {
    const u = 1 - ((t * (o.speed || 0.42) + i / n) % 1);
    let al = a;
    if (u < G.uq) al *= 1 - block;
    else al *= lerp(1, clamp((u - G.uq) * 7) * (1 - dead), block);
    if (al <= 0.02) continue;
    const p = polyAt(G.nerve, G.acc, u * L);
    circle(ctx, p[0], p[1], 9, rgba('#FFFFFF', al)); softDot(gctx, p[0], p[1], 42, '#FFE08A', al * XR_GK * (o.gk === undefined ? 1 : o.gk));
    for (let k = 1; k <= 3; k++) { const q = polyAt(G.nerve, G.acc, Math.min(L, (u + k * 0.012) * L)); circle(ctx, q[0], q[1], 8 - k * 1.8, rgba('#FFE9A8', al * (0.6 - k * 0.15))); }
  }
}
// the fold bites: pressure chevrons from the thigh and the calf, a red throb, little squeeze marks. k 0..1
function legSqueeze(G, t, k) {
  if (k <= 0.01) return;
  const Q = G.Q, pu = 0.5 + 0.5 * Math.sin(t * 9);
  softDot(gctx, Q[0], Q[1], 120, '#FF3A4A', 0.5 * k * (0.6 + 0.4 * pu) * XR_GK); softDot(ctx, Q[0], Q[1], 90, '#FF3A4A', 0.2 * k);
  const nrm = [-G.bis[1], G.bis[0]];
  for (const sgn of [-1, 1]) for (let j = 0; j < 2; j++) {
    const d = 66 + j * 34 - 14 * pu * k + (1 - k) * 80, c0 = vadd(Q, nrm, sgn * d);
    both((c, glow) => {
      c.beginPath(); c.moveTo(c0[0] - G.bis[0] * 26 + nrm[0] * sgn * 20, c0[1] - G.bis[1] * 26 + nrm[1] * sgn * 20); c.lineTo(c0[0], c0[1]);
      c.lineTo(c0[0] + G.bis[0] * 26 + nrm[0] * sgn * 20, c0[1] + G.bis[1] * 26 + nrm[1] * sgn * 20);
      c.lineWidth = glow ? 16 : 10; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba(glow ? '#FF3A4A' : '#FF6A78', k * (1 - j * 0.4) * (glow ? 0.5 * XR_GK : 1)); c.stroke();
    });
  }
}
// the reboot goes wrong: sparks jumping off the nerve below the fold. k 0..1
function legSparks(G, t, k, seed = 5) {
  if (k <= 0.01) return;
  const fr = Math.floor(t * FPS / 2), L = G.acc[G.acc.length - 1], n = Math.round(7 * k);
  for (let i = 0; i < n; i++) {
    const rng = mulberry32(seed * 131 + fr * 17 + i * 7), u = lerp(G.uq + 0.03, 1, rng()), p = polyAt(G.nerve, G.acc, u * L);
    const an = p[2] + (rng() < 0.5 ? 1 : -1) * (Math.PI / 2 + (rng() - 0.5) * 0.9), len = 40 + rng() * 80;
    const pts = jagged(rng, p[0], p[1], p[0] + Math.cos(an) * len, p[1] + Math.sin(an) * len, 30, 3);
    poly(ctx, pts, 5, rgba('#FFF6C8', 0.95 * k)); poly(gctx, pts, 8, rgba('#FFD447', 0.6 * k * XR_GK));
    softDot(gctx, p[0], p[1], 40, '#FFE08A', 0.6 * k * XR_GK);
  }
}

// ---------------------------------------------------------------- macro: the nerve's fibres, firing by themselves
const FIB = { n: 6, y0: 940, gap: 64, rot: -0.1 };
function fibY(i, x) { return FIB.y0 + (i - (FIB.n - 1) / 2) * FIB.gap + 9 * Math.sin(x * 0.006 + i * 1.7); }
// act 0..1 = how much of the bundle is misfiring. Returns the y of fibre 2 at x (for the electrode's tip)
function fibreBundle(t, act = 1) {
  const c = ctx;
  c.save(); c.translate(540, FIB.y0); c.rotate(FIB.rot); c.translate(-540, -FIB.y0);
  gctx.save(); gctx.translate(540, FIB.y0); gctx.rotate(FIB.rot); gctx.translate(-540, -FIB.y0);
  // the sheath
  const hh = FIB.n * FIB.gap / 2 + 52;
  const sg = c.createLinearGradient(0, FIB.y0 - hh, 0, FIB.y0 + hh);
  sg.addColorStop(0, '#6A3A12'); sg.addColorStop(0.5, '#3A1D0A'); sg.addColorStop(1, '#58300F');
  c.fillStyle = sg; c.fillRect(-300, FIB.y0 - hh, 1700, 2 * hh);
  line(c, -300, FIB.y0 - hh, 1400, FIB.y0 - hh, 10, '#FFB23F'); line(c, -300, FIB.y0 + hh, 1400, FIB.y0 + hh, 10, '#C97A1E');
  line(gctx, -300, FIB.y0 - hh, 1400, FIB.y0 - hh, 14, 'rgba(255,154,42,0.5)'); line(gctx, -300, FIB.y0 + hh, 1400, FIB.y0 + hh, 14, 'rgba(255,154,42,0.35)');
  // fibres: insulated links (myelin), a thin bright core
  for (let i = 0; i < FIB.n; i++) {
    for (let x = -260 + ((i * 53) % 96); x < 1360; x += 96) {
      const y1 = fibY(i, x), y2 = fibY(i, x + 80);
      line(c, x, y1, x + 80, y2, 30, '#8E6A3A'); line(c, x, y1 - 3, x + 80, y2 - 3, 20, '#F0D9A6');
      line(c, x + 80, y2, x + 96, fibY(i, x + 96), 8, '#FFB23F');
    }
  }
  // bursts: each fibre fires from a spot of its own, in fits: beads run both ways from it
  const sp = 1500;
  for (let i = 0; i < FIB.n; i++) {
    const per = 1.15 + 0.5 * hash(i * 3.3);
    for (let b = Math.floor(t / per) - 1; b <= Math.floor(t / per); b++) {
      if (b < 0) continue;
      const h1 = hash(i * 17.1 + b * 5.3), h2 = hash(i * 7.7 + b * 11.9);
      if (h1 > act) continue;
      const t0 = b * per + h2 * per * 0.6, dur = 0.42 + 0.5 * hash(i + b * 2.1), x0 = 170 + 740 * hash(i * 2.9 + b * 3.7);
      if (t < t0) continue;
      const on = t < t0 + dur;
      if (on) { const y = fibY(i, x0), fl = 0.6 + 0.4 * Math.sin(t * 70 + i); softDot(gctx, x0, y, 70, '#FFF3B0', 0.9 * fl); fizzStarAt(c, x0, y, 26 * fl, '#FFFFFF'); }
      for (let k = 0; k * 0.05 < dur; k++) {
        const te = t0 + k * 0.05; if (t < te) break;
        const d = (t - te) * sp; if (d > 1500) continue;
        for (const s of [-1, 1]) { const x = x0 + s * d, y = fibY(i, x); circle(c, x, y, 8, '#FFFFFF'); softDot(gctx, x, y, 30, '#FFE08A', 0.9); }
      }
    }
  }
  c.restore(); gctx.restore();
}
function fizzStarAt(c, x, y, r, col) {
  c.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  c.closePath(); c.fillStyle = col; c.fill();
}
// the needle electrode: slides in to tip (x, y) from the upper right; k 0..1. Returns its far end (for the wire)
function electrode(x, y, k, t) {
  const kk = E.outCubic(clamp(k)), ux = 0.62, uy = -0.785, back = (1 - kk) * 520;
  const tx = x + ux * back, ty = y + uy * back, ex = tx + ux * 430, ey = ty + uy * 430;
  line(ctx, tx, ty, ex, ey, 6, '#9AA4C0'); line(ctx, tx, ty, ex, ey, 2, '#F3F6FF');
  line(ctx, tx + ux * 300, ty + uy * 300, ex, ey, 22, '#2B3350'); line(ctx, tx + ux * 310, ty + uy * 310, ex - ux * 8, ey - uy * 8, 12, '#4B5884');
  if (kk > 0.95) softDot(gctx, x, y, 40, '#7FE9FF', 0.8 * (0.6 + 0.4 * Math.sin(t * 30)));
  return [ex, ey];
}
// the scope (screen space): a trace of spike bursts scrolling left, live. k = pop-in
function scopePanel(x, y, w, h, t, k, act = 1) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  rrect(ctx, 0, 0, w, h, 26); ctx.fillStyle = '#0A1622'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2E4A66'; ctx.stroke();
  ctx.save(); rrect(ctx, 10, 10, w - 20, h - 20, 18); ctx.clip();
  for (let gx = 0; gx < w; gx += 52) line(ctx, gx, 0, gx, h, 1.5, 'rgba(77,255,180,0.10)');
  for (let gy = 0; gy < h; gy += 52) line(ctx, 0, gy, w, gy, 1.5, 'rgba(77,255,180,0.10)');
  const base = h * 0.62, pps = 330, step = 5;
  ctx.beginPath(); ctx.moveTo(0, base);
  for (let px = 0; px <= w; px += step) {
    const tt = t - (w - px) / pps, idx = Math.floor(tt * pps / step);
    const per = 0.62, b = Math.floor(tt / per), ph = (tt / per) - b, on = tt > 0 && ph < (0.35 + 0.4 * hash(b * 3.1)) && hash(b * 1.7 + 2) < act;
    const hgt = on ? (0.55 + 0.45 * hash(idx * 0.77)) * h * 0.46 : 3 * (hash(idx * 1.3) - 0.5);
    ctx.lineTo(px, base - (on && idx % 2 === 0 ? hgt : (on ? -hgt * 0.22 : hgt)));
  }
  ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeStyle = '#4DFFB4'; ctx.stroke();
  ctx.restore();
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); rrect(gctx, x + 14, y + 14, w - 28, h - 28, 18); gctx.fillStyle = `rgba(77,255,180,${0.14 * clamp(k)})`; gctx.fill(); gctx.restore();
}
