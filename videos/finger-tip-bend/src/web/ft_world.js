// ft_world.js — Can You Bend Just the TIP of Your Finger? (10 Nov 2026). Built on one-finger's fist3d.js (the 3D hand),
// bent-wrist-fist's bwhand.js (the forearm, the glass, the puller in the forearm) and humanity-sugar-cube's cafe.js (the
// trail cafe at dusk). What is new here:
// - `ftGeo`: his left hand pointing UP (a fist with the index finger out), the index's three joints set one by one
//   (mcp, pip = the middle joint, dip = the tip's joint, in radians; + bends toward the palm);
// - `ftString`: the ONE string that bends the tip: from the puller's bar in the forearm, over the palm side of the wrist,
//   along the palm side of the index finger, right across the middle joint, tied on at the tip (`pull` glows it, `hotTip`
//   and `hotMid` light the two joints it pulls);
// - `ftPinHand`: his other hand holding the middle joint still (screen space: the arm from his shoulder, the palm, the
//   fingers behind the finger, the thumb across its near side);
// - `ftMenu`: the cafe's menu card: FINGER TIP ... COMBO ONLY (comes with: MIDDLE JOINT);
// - `ftRing` (a ring round a joint), `ftMirror` (a doctor's head mirror on his forehead), `ftTag`, `ftBurst`, `ftShake`.
// Hand frame (fist3d.js): origin = the middle of the wrist, +y toward the fingers, +x toward the thumb, +z out of the palm.
'use strict';

// ---------------------------------------------------------------- the hand: pointing up, the index's joints one by one
// A: {mcp, pip, dip (rad), tremble 0..1, t, thumb 0 (wrapped over the curled fingers) .. 1 (out)}
function ftGeo(A = {}) {
  const t = A.t || 0, G = { f: {} };
  for (const k of FK_ORD) {
    const F = FK_F[k];
    let b0, b1, b2, lean;
    if (k === 'I') {
      const tr = A.tremble || 0, shk = tr * (0.045 * vnoise(t * 29 + 3, 3) + 0.03 * vnoise(t * 53, 7));
      b0 = (A.mcp || 0) + shk * 0.4; b1 = (A.pip || 0) + shk; b2 = (A.dip || 0) + shk * 0.7;
      lean = F.lean * 0.4;
    } else {
      b0 = FK_FIST[0]; b1 = FK_FIST[1]; b2 = FK_FIST[2]; lean = F.lean * 0.35;
    }
    const r = F.r * (k === 'I' ? 1.3 : 1.12), rad = [r, r * 0.95, r * 0.88, r * 0.78];   // cartoon-chunky fingers, the index most
    const pts = [[F.x, F.y, 0]], dirs = [];
    let th = 0, p = pts[0];
    for (let i = 0; i < 3; i++) {
      th += [b0, b1, b2][i];
      const d = [-Math.sin(lean) * Math.cos(th), Math.cos(lean) * Math.cos(th), Math.sin(th)];
      dirs.push({ d, th });
      p = [p[0] + d[0] * F.len[i], p[1] + d[1] * F.len[i], p[2] + d[2] * F.len[i]];
      pts.push(p);
    }
    G.f[k] = { pts, rad, dirs, lift: k === 'I' ? 1 : 0 };
  }
  const th = clamp(A.thumb || 0);
  const wrap = [[2.85, 2.2, 0.7], [4.25, 4.95, 2.35], [3.25, 6.75, 4.55], [1.15, 7.25, 5.75]];
  const out = [[2.85, 2.2, 0.7], [4.7, 4.6, 1.6], [5.9, 6.6, 2.0], [6.6, 8.3, 2.2]];
  G.thumb = { pts: wrap.map((p, i) => p.map((v, j) => lerp(v, out[i][j], E.inOutSine(th)))), rad: [1.3, 1.08, 0.97, 0.8] };
  return G;
}

// ---------------------------------------------------------------- the one string that bends the tip
// the path on screen: from the bar (barS cm from the wrist, in the forearm) to the tie on the last bone
function ftStringPath(P2, G, barS) {
  const b = P2.pa([0, -barS, 0.55]);
  const F = FK_F.I;
  const armEnd = P2.pa([F.x * 0.22, -0.6, 0.95]);
  const hand = [[F.x * 0.25, 0.7, 0.98], [F.x * 0.5, 3.4, 0.98], [F.x * 0.82, 6.4, 0.9], [F.x, F.y - 0.25, 0.78]].map(P2.ph);
  for (const [i, u] of [[0, 0.15], [0, 0.6], [0, 0.97], [1, 0.08], [1, 0.6], [1, 0.97], [2, 0.08], [2, 0.42]]) hand.push(P2.ph(fkSegPt(G, 'I', i, u, 'front', 0.45)));
  return { pts: [[b[0], b[1]], [armEnd[0], armEnd[1]]].concat(hand.map((q) => [q[0], q[1]])), k: b[2],
    tie: P2.ph(fkSegPt(G, 'I', 2, 0.42, 'front', 0.45)), mid: P2.ph(fkSegPt(G, 'I', 0, 0.99, 'front', 0.45)),
    midJ: P2.ph(G.f.I.pts[1]), tipJ: P2.ph(G.f.I.pts[2]) };
}
// o: {k (0..1 shown), barS, pull 0..1 (glow), slack 0..1, hotTip, hotMid 0..1, t}
function ftString(c, g, P2, G, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return null;
  const S = ftStringPath(P2, G, o.barS === undefined ? BWK.barRest : o.barS);
  let P = S.pts;
  const sl = o.slack || 0;
  if (sl > 0.01) {   // the forearm stretch hangs in a wave when nothing pulls
    const a = P[0], b = P[1], n = 18, out = [], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    for (let i = 0; i <= n; i++) { const v = i / n, w = sl * S.k * 1.2 * Math.sin(Math.PI * v) * Math.sin(v * Math.PI * 3 + (o.t || 0) * 3); out.push([a[0] + dx * v + nx * w, a[1] + dy * v + ny * w]); }
    P = out.concat(P.slice(2));
  }
  const wpx = Math.max(6, S.k * 0.34), hot = clamp(o.pull || 0);
  // draw it growing from the bar to the tip with k
  const acc = polyLen(P), L = acc[acc.length - 1] * E.outCubic(k), Q = [];
  for (let i = 0; i < P.length; i++) { if (acc[i] <= L) Q.push(P[i]); else { Q.push(polyAt(P, acc, L)); break; } }
  paint(() => {
    poly(c, Q, wpx * 1.7, rgba('#4A2440', 0.7));
    poly(c, Q, wpx, mixH('#FFF1D9', '#FFE45C', hot));
    poly(g, Q, wpx * 2.2, rgba('#FFD45C', 0.18 + 0.2 * hot));
    if (k > 0.97) {   // the knot at the tip
      circle(c, S.tie[0], S.tie[1], wpx * 1.25, '#4A2440'); circle(c, S.tie[0], S.tie[1], wpx * 0.9, mixH('#FFF1D9', '#FFE45C', hot));
    }
  });
  // the two joints it pulls, lit when named
  for (const [q, h, col] of [[S.tipJ, o.hotTip || 0, '#FFD447'], [S.midJ, o.hotMid || 0, '#7FE9FF']]) {
    if (h <= 0.01) continue;
    const r = S.k * 1.75 * (0.8 + 0.2 * E.outBack(clamp(h), 2));
    paint(() => { ctx.save(); ctx.lineWidth = Math.max(4, S.k * 0.2); ctx.strokeStyle = rgba(col, 0.95 * h); ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.stroke(); ctx.restore(); });
    softDot(g, q[0], q[1], r * 1.2, col, 0.16 * h);
  }
  return S;
}

// ---------------------------------------------------------------- his other hand holding the middle joint still
// screen space. P2, G: the 3D hand; k 0..1 (comes in from the lower left), sh: his shoulder on screen, w: the arm's width
// (px), part: 'back' (the fingers behind the finger, drawn before the hand) | 'front' (arm, palm and thumb, after it)
function ftPinGeom(P2, G, k, sh) {
  const F = G.f.I, A = P2.ph(F.pts[1]), B = P2.ph(F.pts[2]);
  const M = [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5)], r = F.rad[1] * (A[2] + B[2]) / 2;
  let ux = B[0] - A[0], uy = B[1] - A[1]; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
  let nx = -uy, ny = ux; if (nx > 0) { nx = -nx; ny = -ny; }       // n points to the LEFT of the finger (where the hand is)
  const kk = E.outCubic(clamp(k)), away = (1 - kk) * 9 * r;       // it slides in from the lower left
  const off = [-away * 0.75, away * 0.9];
  const Hc = [M[0] + nx * r * 2.3 - ux * r * 0.4 + off[0], M[1] + ny * r * 2.3 - uy * r * 0.4 + off[1]];
  return { M, r, u: [ux, uy], n: [nx, ny], Hc, off, kk, sh };
}
function ftPinHand(P2, G, k, sh, part, o = {}) {
  if (k <= 0.01) return;
  const g = ftPinGeom(P2, G, k, sh), { M, r, u, n, Hc, off } = g;
  const skin = '#EDB08A', skinDk = '#D39068', nail = '#FAD9CC';
  const side = [-n[0], -n[1]];                                    // toward the right of the finger
  const ang = Math.atan2(u[1], u[0]);                             // along the finger (toward the tip)
  if (part === 'back') {
    // the holding hand's curled fingers wrapped round the far side of the middle bone: two rounded bumps peeking out on
    // the finger's right, one above the other
    actor(() => {
      for (let i = 0; i < 2; i++) {
        const along = (i - 0.5) * r * 1.15;
        const a = [Hc[0] + u[0] * along, Hc[1] + u[1] * along];
        const b = [M[0] + side[0] * r * 1.45 + u[0] * along + off[0], M[1] + side[1] * r * 1.45 + u[1] * along + off[1]];
        line(ctx, a[0], a[1], b[0], b[1], r * 1.08, i ? skin : '#E9AA84');
      }
    });
    return;
  }
  // the arm: the forearm rises from his elbow on the table to the wrist; the upper arm in the rolled-up sleeve
  const wr = [Hc[0] - u[0] * r * 1.6 + n[0] * r * 0.9, Hc[1] - u[1] * r * 1.6 + n[1] * r * 0.9];
  if (sh) {
    const el0 = o.el || [(sh[0] + wr[0]) / 2, (sh[1] + wr[1]) / 2 + r * 4];
    const el = [el0[0] + off[0], el0[1] + off[1] * 0.3];
    actor(() => {
      line(ctx, sh[0], sh[1], el[0], el[1], r * 3.0, PAL.coat);
      line(ctx, el[0], el[1], wr[0], wr[1], r * 2.25, skin);
      const ex = el[0] - sh[0], ey = el[1] - sh[1], el2 = Math.hypot(ex, ey) || 1;
      line(ctx, el[0] - ex / el2 * r * 1.3, el[1] - ey / el2 * r * 1.3, el[0] - ex / el2 * r * 0.25, el[1] - ey / el2 * r * 0.25, r * 3.2, PAL.coatSh);
    });
  }
  actor(() => {
    // the back of the hand: a rounded block beside the finger, wider than the wrist
    ctx.save(); ctx.translate(Hc[0], Hc[1]); ctx.rotate(ang);
    ctx.beginPath(); ctx.ellipse(-r * 0.5, 0, r * 2.2, r * 1.85, 0, 0, 7); ctx.fillStyle = skin; ctx.fill();
    ctx.restore();
  });
  // the thumb across the near side of the middle bone (it is drawn as its own shape: a fat capsule, the pad on the finger)
  const t0 = [Hc[0] + u[0] * r * 0.15 + side[0] * r * 0.4, Hc[1] + u[1] * r * 0.15 + side[1] * r * 0.4];
  const t1 = [M[0] + side[0] * r * 0.6 + off[0], M[1] + side[1] * r * 0.6 + off[1]];
  actor(() => { line(ctx, t0[0], t0[1], t1[0], t1[1], r * 1.18, skinDk); line(ctx, t0[0], t0[1], t1[0], t1[1], r * 1.05, skin); });
  paint(() => {
    const an = Math.atan2(t1[1] - t0[1], t1[0] - t0[0]);
    ellipse(ctx, t1[0] - Math.cos(an) * r * 0.2 - Math.sin(an) * r * 0.12, t1[1] - Math.sin(an) * r * 0.2 + Math.cos(an) * r * 0.12, r * 0.4, r * 0.3, nail, an);
    // the knuckles of the curled fingers on the back of the hand
    ctx.save(); ctx.strokeStyle = 'rgba(160,86,62,0.45)'; ctx.lineWidth = Math.max(2, r * 0.08); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const q = [Hc[0] + side[0] * r * 0.85 + u[0] * (i - 1) * r * 0.75, Hc[1] + side[1] * r * 0.85 + u[1] * (i - 1) * r * 0.75];
      ctx.beginPath(); ctx.arc(q[0], q[1], r * 0.32, ang + Math.PI * 0.6, ang + Math.PI * 1.4); ctx.stroke();
    }
    ctx.restore();
  });
  return g;
}

// ---------------------------------------------------------------- the cafe's menu card (screen space)
// (x, y) its centre, k 0..1 (pops in), combo 0..1 (the COMBO ONLY stamp), w its width
function ftMenu(x, y, k, combo, w = 560) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.0), h = w * 0.62;
  actor(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.04); ctx.scale(s, s);
    rrect(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 18); ctx.fillStyle = '#6E4424'; ctx.fill();
    rrect(ctx, -w / 2, -h / 2, w, h, 10); ctx.fillStyle = '#20302A'; ctx.fill();
    ctx.restore();
  });
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(-0.04); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 14; i++) ctx.fillRect(-w / 2 + ((i * 97) % (w - 60)), -h / 2 + ((i * 53) % (h - 10)), 40 + (i % 3) * 20, 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(w * 0.082)}px Montserrat`; ctx.fillStyle = '#F4F1E6'; ctx.fillText('TRAIL CAFE MENU', 0, -h * 0.34);
    line(ctx, -w * 0.36, -h * 0.22, w * 0.36, -h * 0.22, 3, 'rgba(244,241,230,0.6)');
    ctx.font = `900 ${Math.round(w * 0.1)}px Montserrat`; ctx.textAlign = 'left'; ctx.fillStyle = '#FFD447';
    ctx.fillText('FINGER TIP', -w * 0.42, -h * 0.03);
    ctx.font = `800 ${Math.round(w * 0.066)}px Montserrat`; ctx.fillStyle = '#E8E4D8';
    ctx.fillText('alone ...... SOLD OUT', -w * 0.42, h * 0.15);
    ctx.font = `800 ${Math.round(w * 0.064)}px Montserrat`; ctx.fillStyle = '#7FE9FF';
    ctx.fillText('+ MIDDLE JOINT', -w * 0.42, h * 0.32);
    ctx.restore();
  });
  if (combo > 0.01) {   // the stamp across the card
    const cs = E.outBack(clamp(combo), 2.6);
    paint(() => {
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x + w * 0.17, y + h * 0.15); ctx.rotate(-0.1); ctx.scale(s * cs * 1, s * cs * 1);
      ctx.font = `400 ${Math.round(w * 0.11)}px Anton`; const tw = ctx.measureText('COMBO ONLY').width + w * 0.08, th = w * 0.18;
      rrect(ctx, -tw / 2, -th / 2, tw, th, 12); ctx.fillStyle = '#C8A8FF'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#2A1650'; ctx.stroke();
      ctx.fillStyle = '#2A1650'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COMBO ONLY', 0, w * 0.006);
      ctx.restore();
    });
  }
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = `rgba(0,0,0,${0.9 * clamp(k)})`; gctx.translate(x, y); gctx.scale(s, s); rrect(gctx, -w / 2 - 20, -h / 2 - 20, w + 40, h + 40, 18); gctx.fill();
  gctx.restore();
}

// ---------------------------------------------------------------- small things
// a ring round a joint on screen (k pops it, pulse breathes it)
function ftRing(x, y, r, k, col = '#FF9A3C', t = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4) * (1 + 0.05 * Math.sin(t * 9));
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineWidth = 9; ctx.strokeStyle = rgba(col, clamp(k));
    ctx.beginPath(); ctx.arc(x, y, r * s, 0, 7); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba('#FFFFFF', 0.6 * clamp(k)); ctx.beginPath(); ctx.arc(x, y, r * s + 9, 0, 7); ctx.stroke();
    ctx.restore();
  });
}
// a doctor's head mirror on a band round his forehead. (x, y) the middle of his forehead on screen, s = head px per unit,
// rot = his head's turn, k pops it in from above
function ftMirror(x, y, s, rot, k) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2.2), drop = (1 - clamp(k * 1.4)) * 140 * s;
  actor(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y - drop); ctx.rotate(rot); ctx.scale(kk, kk);
    // the band across the forehead
    rrect(ctx, -64 * s, -8 * s, 128 * s, 15 * s, 7 * s); ctx.fillStyle = '#2E3A52'; ctx.fill();
    ctx.restore();
  });
  actor(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y - drop - 12 * s); ctx.rotate(rot); ctx.scale(kk, kk);
    ctx.beginPath(); ctx.arc(0, -10 * s, 30 * s, 0, 7); ctx.fillStyle = '#7C8AA0'; ctx.fill();
    ctx.restore();
  });
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y - drop - 12 * s); ctx.rotate(rot); ctx.scale(kk, kk);
    const g = ctx.createRadialGradient(-8 * s, -18 * s, 2 * s, 0, -10 * s, 26 * s);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, '#D8E6F4'); g.addColorStop(1, '#8EA4BE');
    ctx.beginPath(); ctx.arc(0, -10 * s, 25 * s, 0, 7); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10 * s, 6 * s, 0, 7); ctx.fillStyle = '#3A4A60'; ctx.fill();
    ctx.restore();
  });
  softDot(gctx, x - 8 * s, y - drop - 30 * s, 34 * s, '#FFFFFF', 0.4 * clamp(k));
}
// a pill tag with an optional leader to a point (screen space; knuckle-lock's klTag)
function ftTag(txt, x, y, k, col, to, size = 46) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = E.outBack(clamp(k), 2.2);
  ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  ctx.restore();
  if (to) { screenSpace(); thinLeader([x, y + h * 0.5 * Math.sign(to[1] - y)], to, clamp(k * 1.5 - 0.3), col); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#141428'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(txt, 0, size * 0.05);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = 'rgba(0,0,0,0.85)'; rrect(gctx, x - w * s / 2 - 8, y - h * s / 2 - 8, w * s + 16, h * s + 16, h * s / 2); gctx.fill();
  gctx.restore();
}
// a comic burst with a word (screen space; knuckle-lock's klBurst)
function ftBurst(x, y, s, k, word, col = '#4DFFB4', rot = -0.12, size = 104) {
  if (k <= 0) return;
  const sc = E.outBack(clamp(k), 2.6) * s;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 150 : 96 + 14 * (i % 3); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); }
  ctx.closePath(); ctx.fillStyle = '#FFF6DC'; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A1030'; ctx.stroke();
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#1A1030'; ctx.strokeText(word, 0, 6); ctx.fillText(word, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.globalCompositeOperation = 'destination-out';
  gctx.fillStyle = 'rgba(0,0,0,0.8)'; gctx.beginPath(); gctx.ellipse(x, y, 190 * sc, 125 * sc, rot, 0, 7); gctx.fill();
  gctx.restore();
}
// motion marks round a point (screen space)
function ftShake(x, y, r, k, t) {
  if (k <= 0.01) return;
  paint(() => {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
      const rr = r * (1 + 0.22 * i) + 6 * Math.sin(t * 40 + i);
      ctx.beginPath(); ctx.arc(x, y, rr, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5);
      ctx.lineWidth = 6 - 2 * i; ctx.strokeStyle = rgba('#FFFFFF', 0.8 * k); ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  });
}
