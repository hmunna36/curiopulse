// Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: what goes on in the glass head (tongue-twister's side
// view, tw_mouth.js) when he thinks "lemon": his brain, a cord from it to the spit glands, the glands' ducts ending in two
// taps (one inside the cheek, one under the tongue), the jets, the spit coating the tongue and pooling, his tongue out
// for a lick, a ghost lemon in front of his lips, acid drops from it that fizzle out on wet teeth.
// SECTION units (the origin between his lips, x forward, y down), placed by TWSW like twSection.
//   lmInside(t, o)   draw it all over twSection (call twSection first with the same open/lips); o: {
//     open, lips (as given to twSection), brain: lmBrain options or null, glands 0..1 (the glands, ducts and taps pop in),
//     nerve 0..1 (the cord lights up), pulse: 0..1 (a bead of signal running down it) or -1, flow 0..1 (the taps run),
//     blast 0..1 (full blast), hose 0..1 (the jets swing onto the teeth), coat 0..1 (spit over the tongue and teeth),
//     spill 0..1 (a drop runs out over the lower lip), lick 0..1 (the tongue out to the ghost), squint 0..1 (his eye
//     screwed shut), ghost: {k, bite, stamp, stampK, stampCol, acid 0..1 (its ACID drops start)} or null,
//     drops: [{u: 0..1 along the fall, fizz 0..1}], shine 0..1 (the teeth glint)}
//   Returns world points: brain, cheekTap, tongueTap, teeth, ghost, lips, pool.
'use strict';

const LM_BRAIN_P = [-232, -322], LM_BRAIN_S = 0.5;
const LM_PAR = [-236, -128], LM_SUB = [-118, 116];               // the glands: in front of the ear, under the jaw
const LM_TAP_CHEEK = [-122, -54], LM_TAP_TONGUE = [-40, 22];     // where their ducts open
const LM_GHOST = [92, -38];                                     // the ghost lemon in front of his lips
const LMT = { gland: '#D99A7C', glandDk: '#9E5E48', duct: '#D99070', chrome: '#D6E2F0', chromeDk: '#7D8CA3', red: '#E8344A', blue: '#3F8FFF', spit: '#A8ECFF', nerve: '#FF9A3C' };

function lmNervePts() {
  // from the brain's stem down behind the eye to the cheek gland, then down the back of the jaw to the one under it
  return [[-224, -236], [-232, -200], [-236, -168], [-236, -120], [-222, -60], [-200, 6], [-170, 66], [-140, 100], [-122, 112]];
}
function lmDense(P, step = 6) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]) / step));
    for (let j = 0; j < n; j++) out.push([lerp(P[i][0], P[i + 1][0], j / n), lerp(P[i][1], P[i + 1][1], j / n)]);
  }
  out.push(P[P.length - 1]);
  return out;
}
function lmGland(c, P, rx, ry, k, seed) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(P[0], P[1]); c.scale(s, s);
  // a bunch of grapes: lobes in one outline
  const lobes = [];
  for (let i = 0; i < 9; i++) { const a = hash(seed + i * 1.7) * Math.PI * 2, d = Math.sqrt(hash(seed * 3 + i)) * 0.62; lobes.push([Math.cos(a) * rx * d, Math.sin(a) * ry * d, Math.min(rx, ry) * (0.42 + 0.16 * hash(seed + i * 9))]); }
  c.beginPath(); for (const [x, y, r] of lobes) { c.moveTo(x + r, y); c.arc(x, y, r, 0, 7); }
  c.lineWidth = 7; c.strokeStyle = LMT.glandDk; c.stroke(); c.fillStyle = LMT.gland; c.fill();
  paint(() => { for (const [x, y, r] of lobes) circle(c, x - r * 0.3, y - r * 0.32, r * 0.22, 'rgba(255,236,214,0.5)'); });
  c.restore();
}
// a tap at P (the spout's mouth), the water leaving along ang (0 = right, PI/2 = down): a chrome body behind it, a spout
// that bends into the flow, a cross handle on top that turns with open; col = the handle's colour
function lmTap(c, P, ang, k, open, col) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2) * 1.25;
  c.save(); c.translate(P[0], P[1]); c.rotate(ang - Math.PI / 2); c.scale(s, s);   // local +y = the flow
  // the spout: a thick bent pipe from the body to the mouth (0, 0)
  c.beginPath(); c.moveTo(-34, -30); c.quadraticCurveTo(0, -36, 0, -6);
  c.lineCap = 'round'; c.lineWidth = 17; c.strokeStyle = '#4D5A70'; c.stroke();
  c.lineWidth = 12; c.strokeStyle = LMT.chrome; c.stroke();
  // the body
  rrect(c, -50, -46, 30, 34, 9); c.fillStyle = '#4D5A70'; c.fill();
  rrect(c, -47, -43, 24, 28, 7); c.fillStyle = LMT.chrome; c.fill();
  // the mouth ring
  ellipse(c, 0, -4, 9, 4, '#4D5A70');
  // the handle: a stem and a cross seen from the side, turning (its arms shorten and lengthen)
  const tw = Math.cos(open * 3.2);
  line(c, -35, -46, -35, -58, 6, '#4D5A70');
  c.save(); c.translate(-35, -62);
  rrect(c, -20 * Math.abs(tw) - 6, -6, 40 * Math.abs(tw) + 12, 12, 6); c.fillStyle = col; c.fill();
  circle(c, 0, 0, 8, mixH(col, '#FFFFFF', 0.25));
  c.restore();
  paint(() => { c.beginPath(); c.moveTo(-30, -28); c.quadraticCurveTo(-6, -32, -4, -12); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke(); line(c, -44, -38, -44, -20, 3, 'rgba(255,255,255,0.8)'); });
  c.restore();
}
// a jet of spit from A along v (units a second) under gravity: a tapered ribbon along its path, with drops riding it
function lmJet(c, t, A, v, grav, k, len = 0.45, w0 = 9, seed = 1) {
  if (k <= 0.01) return [];
  const N = 16, P = [];
  for (let i = 0; i <= N; i++) { const tt = len * i / N; P.push([A[0] + v[0] * tt, A[1] + v[1] * tt + 0.5 * grav * tt * tt]); }
  paint(() => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (let i = 0; i < N; i++) {
      const u = i / N, w = w0 * Math.sqrt(k) * (1 - 0.45 * u) * (1 + 0.15 * Math.sin(t * 30 + i));
      line(c, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], w, rgba(LMT.spit, 0.85));
    }
    for (let i = 0; i < N; i += 2) line(c, P[i][0] - 1.5, P[i][1] - 1.5, P[i + 1][0] - 1.5, P[i + 1][1] - 1.5, Math.max(1.5, w0 * 0.25), 'rgba(255,255,255,0.85)');
  });
  lmStream(c, t, A, v, grav, k, 7, len, w0 * 0.55, seed);
  return P[N];
}
// a stream of spit drops from A heading along v (units a second), with gravity; n drops on a loop of period per
function lmStream(c, t, A, v, grav, k, n = 10, per = 0.55, r0 = 6, seed = 1) {
  if (k <= 0.01) return [];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ph = (((t + i * per / n + hash(seed + i) * 0.05) / per) % 1 + 1) % 1, tt = ph * per;
    const x = A[0] + v[0] * tt, y = A[1] + v[1] * tt + 0.5 * grav * tt * tt;
    const r = r0 * (0.7 + 0.5 * hash(seed * 3 + i)) * Math.sqrt(k) * (1 - 0.35 * ph);
    pts.push([x, y, r]);
  }
  paint(() => {
    for (const [x, y, r] of pts) { circle(c, x, y, r, rgba(LMT.spit, 0.9)); circle(c, x - r * 0.35, y - r * 0.35, r * 0.4, 'rgba(255,255,255,0.95)'); }
  });
  return pts;
}

function lmInside(t, o = {}) {
  const c = ctx, op = clamp(o.open || 0), lips = clamp(o.lips || 0);
  const d = 20 * op * (1 - lips * 0.85), g = (1 - lips) * (4 + 10 * op);
  const SW = (p) => twSW(p);
  c.save(); c.translate(TWSW.o[0], TWSW.o[1]); c.scale(TWSW.s, TWSW.s);
  // ---- his eye screwed shut (over twSection's eye)
  const sq = clamp(o.squint || 0);
  if (sq > 0.02) paint(() => {
    ellipse(c, -62, -238, 18, 22 * sq, TWC.glass);
    if (sq > 0.5) {
      c.beginPath(); c.moveTo(-78, -240); c.quadraticCurveTo(-62, -230, -44, -242); c.lineWidth = 5; c.strokeStyle = '#F2D4C0'; c.lineCap = 'round'; c.stroke();
      for (let i = -1; i <= 1; i++) line(c, -40, -246 + i * 8, -30, -250 + i * 12, 3, 'rgba(242,212,192,0.7)');
    }
  });
  // ---- the brain in the skull
  if (o.brain) {
    actor(() => lmBrain(c, LM_BRAIN_P[0], LM_BRAIN_P[1], LM_BRAIN_S, t, o.brain));
  }
  const bt = o.btn || 0;
  if (bt > 0.01) {
    // a big red SPIT button on a little box beside the brain (it presses when the brain slaps it)
    const k = E.outBack(clamp(bt), 2), press = clamp(o.press || 0);
    c.save(); c.translate(LM_BRAIN_P[0] + 112, LM_BRAIN_P[1] + 70); c.scale(k, k);
    rrect(c, -30, -6, 60, 34, 6); c.fillStyle = '#3A4256'; c.fill();
    ellipse(c, 0, -6 + 6 * press, 24, 9, '#8E1020');
    rrect(c, -22, -20 + 8 * press, 44, 16, 8); c.fillStyle = '#E8344A'; c.fill();
    paint(() => { c.font = '900 13px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('SPIT', 0, 12); ellipse(c, -8, -15 + 8 * press, 7, 3, 'rgba(255,255,255,0.6)'); });
    c.restore();
  }
  // ---- the cord from the brain to the glands, lit, a bead of signal on it
  const nv = clamp(o.nerve || 0), NP = lmDense(lmNervePts());
  if (nv > 0.01) {
    const acc = polyLen(NP), L = acc[acc.length - 1];
    paint(() => { poly(c, NP, 9, rgba('#5A2A10', 0.6 * nv)); poly(c, NP, 5, rgba(LMT.nerve, 0.9 * nv)); });
    for (let i = 0; i < NP.length; i += 4) { const w = SW(NP[i]); softDot(gctx, w[0], w[1], 26, LMT.nerve, 0.18 * nv); }
    const pu = o.pulse === undefined ? -1 : o.pulse;
    if (pu >= 0 && pu <= 1) {
      for (let j = 0; j < 3; j++) {
        const uu = clamp(pu - j * 0.06); if (uu <= 0) continue;
        const q = polyAt(NP, acc, uu * L), w = SW(q);
        paint(() => circle(c, q[0], q[1], 10 - j * 2.5, rgba('#FFF2C0', 1 - j * 0.3)));
        softDot(gctx, w[0], w[1], 60 - j * 12, '#FFD447', 0.85 - j * 0.25);
      }
    }
  }
  // ---- the glands, their ducts and the taps
  const gk = clamp(o.glands || 0);
  if (gk > 0.01) {
    const ductA = [[-214, -112], [-190, -96], [-160, -78], [-136, -64], LM_TAP_CHEEK];
    const ductB = [[-100, 108], [-80, 92], [-62, 66], [-50, 44], LM_TAP_TONGUE];
    paint(() => { poly(c, ductA, 11 * gk, LMT.glandDk); poly(c, ductA, 6 * gk, LMT.duct); poly(c, ductB, 11 * gk, LMT.glandDk); poly(c, ductB, 6 * gk, LMT.duct); });
    lmGland(c, LM_PAR, 38, 54, gk, 3);
    lmGland(c, LM_SUB, 34, 25, gk, 11);
  }
  // ---- the spit: the jets, the coat on the tongue, the pool, a drop over the lip
  const fl = clamp(o.flow || 0), bl = clamp(o.blast || 0), ho = clamp(o.hose || 0);
  if (fl > 0.01) {
    // the cheek tap pours down onto the tongue; hosing, it swings forward onto the teeth
    // the cheek tap pours down onto the tongue; hosing, it swings forward onto the top teeth
    const vC = [lerp(20, 330, ho) + 60 * bl, lerp(60, -40, ho)];
    const eC = lmJet(c, t, LM_TAP_CHEEK, vC, 900, fl, lerp(0.22, 0.34, ho), 9 + 5 * bl, 5);
    // the under-tongue tap: a fountain up in front of the tongue tip; hosing, onto the back of the bottom teeth
    const vT = [lerp(20, 120, ho) + 30 * bl, lerp(-150, -200, ho) - 70 * bl];
    const eT = lmJet(c, t, LM_TAP_TONGUE, vT, 900, fl, lerp(0.2, 0.24, ho), 8 + 5 * bl, 9);
    for (const [P, E2] of [[LM_TAP_CHEEK, eC], [LM_TAP_TONGUE, eT]]) {
      const w = SW(P); softDot(gctx, w[0], w[1], 80, LMT.spit, 0.28 * fl);
      if (E2 && ho > 0.3) { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5, ph = ((t * 3 + i * 0.17) % 1); paint(() => circle(c, E2[0] + Math.cos(a) * 26 * ph, E2[1] + Math.sin(a) * 26 * ph, 4 * (1 - ph), rgba('#FFFFFF', 0.9 * (1 - ph) * ho))); } }
    }
  }
  const coat = clamp(o.coat || 0);
  if (coat > 0.01) {
    // the mouth's hollow: under the roof, in front of the throat, over the tongue, behind the teeth
    const cav = [[-8, -42], [-40, -57], [-110, -65], [-150, -61], [-200, -51], [-238, -29], [-252, -22], [-254, 24], [-246, 84]];
    for (let x = -232; x <= -20; x += 6) cav.push([x, twTongueY(x, 0, 0, d) + 2]);
    cav.push([-18, -14 + d], [-15, -44]);
    const lvl = lerp(26, -50, coat), wob = (x) => 2.5 * Math.sin(x * 0.07 + t * 7) + 1.5 * Math.sin(x * 0.13 - t * 5);
    paint(() => {
      c.save(); c.beginPath(); c.moveTo(cav[0][0], cav[0][1]); for (const p of cav) c.lineTo(p[0], p[1]); c.closePath(); c.clip();
      c.beginPath(); c.moveTo(-262, lvl + wob(-262));
      for (let x = -262; x <= 4; x += 6) c.lineTo(x, lvl + wob(x));
      c.lineTo(4, 140); c.lineTo(-262, 140); c.closePath();
      const lg = c.createLinearGradient(0, lvl, 0, lvl + 90); lg.addColorStop(0, 'rgba(168,236,255,0.82)'); lg.addColorStop(1, 'rgba(110,200,245,0.72)');
      c.fillStyle = lg; c.fill();
      // the surface line and its glints
      c.beginPath(); for (let x = -262; x <= 4; x += 6) { const y = lvl + wob(x); if (x === -262) c.moveTo(x, y); else c.lineTo(x, y); }
      c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.stroke();
      for (let i = 0; i < 6; i++) { const x = -230 + i * 40 + 8 * Math.sin(t * 2 + i); ellipse(c, x, lvl + wob(x) + 7, 7, 2, 'rgba(255,255,255,0.75)'); }
      // bubbles rising
      for (let i = 0; i < 9; i++) { const ph = ((t * 0.8 + i * 0.13) % 1), x = -230 + i * 26, y = lerp(lvl + 70, lvl + 4, ph); circle(c, x, y, 2.5 + 2 * hash(i * 1.7), rgba('#FFFFFF', 0.75 * (1 - ph))); }
      c.restore();
    });
    const w = SW([-110, lvl]); softDot(gctx, w[0], w[1], 160, LMT.spit, 0.12 * coat);
  }
  const sp = clamp(o.spill || 0);
  if (sp > 0.01) {
    const ll = -18 + g / 2 + d;                                   // the lower lip's top
    const P0 = [10, ll + 6], u = sp;
    const y = P0[1] + 10 + 90 * u * u, r = 7 + 4 * Math.min(1, u * 3);
    paint(() => {
      c.beginPath(); c.moveTo(P0[0] + 2, P0[1]); c.quadraticCurveTo(P0[0] + 12, (P0[1] + y) / 2, P0[0] + 10, y - r); c.lineWidth = 5 * (1 - 0.6 * u); c.strokeStyle = rgba(LMT.spit, 0.85); c.stroke();
      circle(c, P0[0] + 10, y, r, rgba(LMT.spit, 0.92)); circle(c, P0[0] + 7, y - 3, r * 0.4, 'rgba(255,255,255,0.95)');
    });
  }
  // ---- the taps (over the jets' start)
  if (gk > 0.01) {
    lmTap(c, LM_TAP_CHEEK, Math.PI * 0.5 - 0.55 * ho, gk, fl, LMT.red);
    lmTap(c, LM_TAP_TONGUE, -Math.PI * 0.5 + 0.45 * ho, gk, fl, LMT.blue);
  }
  // ---- the teeth glint once they are wet
  const sh = clamp(o.shine || 0);
  if (sh > 0.01) {
    paint(() => {
      rrect(c, -18, -48, 19, 26, 7); c.fillStyle = rgba(LMT.spit, 0.45 * sh); c.fill();
      rrect(c, -20, -14 + d, 18, 22, 7); c.fillStyle = rgba(LMT.spit, 0.45 * sh); c.fill();
    });
    for (const [p, ph] of [[[-6, -40], 0], [[-10, -2 + d], 0.5]]) {
      const tw = 0.5 + 0.5 * Math.sin(t * 9 + ph * 6), w = SW(p);
      paint(() => { const r = 9 * sh * tw; line(c, p[0] - r, p[1], p[0] + r, p[1], 2.5, '#FFFFFF'); line(c, p[0], p[1] - r, p[0], p[1] + r, 2.5, '#FFFFFF'); });
      softDot(gctx, w[0], w[1], 30, '#FFFFFF', 0.6 * sh * tw);
    }
  }
  // ---- his tongue out for a lick
  const lk = clamp(o.lick || 0);
  if (lk > 0.01) {
    const x0 = -16, y0 = -14 + d * 0.4, x1 = 4 + 52 * lk, y1 = -22 - 10 * lk + 3 * Math.sin(t * 5) * lk;
    const thk = 15;
    actor(() => {
      c.beginPath(); c.moveTo(x0, y0 - thk * 0.6); c.quadraticCurveTo((x0 + x1) / 2, y1 - thk * 1.0, x1, y1 - thk * 0.35);
      c.arc(x1, y1, thk * 0.62, -Math.PI / 2, Math.PI / 2);
      c.quadraticCurveTo((x0 + x1) / 2, y1 + thk * 1.15, x0, y0 + thk * 0.75); c.closePath();
      c.fillStyle = TWC.tongue; c.fill();
    });
    paint(() => { c.beginPath(); c.moveTo(x0 + 6, y0); c.quadraticCurveTo((x0 + x1) / 2, y1 - 2, x1 - 6, y1); c.lineWidth = 2.5; c.strokeStyle = rgba('#B23A55', 0.6); c.stroke(); });
  }
  // ---- the ghost lemon in front of his lips, and its acid drops
  if (o.ghost && (o.ghost.k || 0) > 0.01) {
    const G = o.ghost, k = E.outBack(clamp(G.k), 1.8);
    c.save(); c.translate(LM_GHOST[0] + 4 * Math.sin(t * 2.2), LM_GHOST[1] + 5 * Math.sin(t * 1.7)); c.rotate(Math.PI - 0.15); c.scale(0.9 * k, 0.9 * k);
    lmWedge(c, { L: 60, R: 34, bite: G.bite || 0, ghost: 1, t });
    c.restore();
    const w = SW(LM_GHOST); softDot(gctx, w[0], w[1], 90, LMC.ghost, 0.18 * k);
  }
  for (const dr of (o.drops || [])) {
    if (dr.u <= 0 || dr.fizz >= 1) continue;
    const u = clamp(dr.u), A = [LM_GHOST[0] - 26 + (dr.dx || 0), LM_GHOST[1] + 10], B = [-4 + (dr.dx || 0) * 0.2, -2 + d];
    const x = lerp(A[0], B[0], u), y = lerp(A[1], B[1], u) - 30 * Math.sin(u * Math.PI);
    const fz = clamp(dr.fizz || 0), r = 13 * (1 - fz * 0.7);
    paint(() => {
      if (fz < 0.98) {
        c.beginPath(); c.moveTo(x, y - r * 1.7); c.bezierCurveTo(x + r, y - r * 0.4, x + r, y + r, x, y + r); c.bezierCurveTo(x - r, y + r, x - r, y - r * 0.4, x, y - r * 1.7);
        c.fillStyle = mixH('#FF5A3C', LMT.spit, fz); c.fill();
        if (fz < 0.4) { line(c, x - 7, y - 3, x - 2, y, 2.4, '#5A1010'); line(c, x + 7, y - 3, x + 2, y, 2.4, '#5A1010'); circle(c, x - 4, y + 2, 1.8, '#5A1010'); circle(c, x + 4, y + 2, 1.8, '#5A1010'); }   // an angry face
      }
      if (fz > 0.02) for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3, rr = 8 + 30 * fz; circle(c, x + Math.cos(a) * rr, y - Math.abs(Math.sin(a)) * rr, 4.5 * (1 - fz), 'rgba(255,255,255,0.9)'); }
    });
  }
  c.restore();
  return {
    brain: SW(LM_BRAIN_P), cheekTap: SW(LM_TAP_CHEEK), tongueTap: SW(LM_TAP_TONGUE), teeth: SW([-10, -20 + d / 2]),
    ghost: SW(LM_GHOST), lips: SW([10, -18]), pool: SW([-60, twTongueY(-60, 0, 0, d) - 8]), par: SW(LM_PAR), sub: SW(LM_SUB),
  };
}
