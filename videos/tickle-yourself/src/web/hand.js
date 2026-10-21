// Borrowed from vulcan-salute (20 Oct 2026), unchanged but this line. his raised hand, flat, seen from the front, in HAND units (the middle of the
// wrist is the origin, y down, the fingers point up; the whole hand is about 175 units tall).
//   vsHandPts(H)                 where its parts are (hand units, before the flip): knuckles, tips, the strap, the wrist
//   vsHand(c, pal, H, t)         draw it (call it with the context already in hand units)
//   vsHelper(c, pal, Hp, t)      the OTHER hand, pinching the ring and little fingers and pulling them out (hand units)
// Canonical layout = the BACK of the hand to us, the thumb on the right: little, ring, middle, index, thumb, left to
// right. H.view: 0 = the palm to us (drawn mirrored: the thumb on the left), 1 = the back to us; it can go between (the
// hand turns over: it squeezes to an edge and opens out the other side).
// H = {view, spread: {L, R, M, I} (rad, + = toward the thumb), split 0..1 (the salute: index+middle one way, ring+little
//      the other), wrong 0..1 (the little finger splits off alone), stuck 0..1 (the ring finger is dragged along with the
//      middle), tremble 0..1, glass 0..1 (the back turns to glass from the knuckles down: the cords and the strap),
//      strapPull 0..1 (the strap goes taut and glows), faces 0..1 (faces on the middle and ring nails), love 0..1 (they
//      look at each other), lean 0..1 (they lean together), glowM / glowR 0..1 (their outlines glow), glove 0..1 (lab
//      sensor dots and a cable), rot (rad), s (scale)}
'use strict';

const VH = {
  // knuckles (hand units, canonical): little, ring, middle, index; finger widths and lengths
  k: { L: [-33, -80], R: [-12, -89], M: [10, -92], I: [32, -88] },
  w: { L: 17, R: 19.5, M: 20.5, I: 19.5 },
  len: { L: 58, R: 74, M: 80, I: 72 },
  rest: { L: -0.075, R: -0.028, M: 0.0, I: 0.03 },         // together: a hair of fan, the sides touching
  vee: { L: -0.19, R: -0.155, M: 0.105, I: 0.12 },         // the salute: two and two
  thumb: { base: [30, -30], a: 0.78, len: 60, w: 23 },
  wristW: 34,
};
const VH_ORD = ['L', 'R', 'M', 'I'];
const VH_SKIN = '#F2B892', VH_SKIN2 = '#F0B48D', VH_LINE = 'rgba(150,76,50,0.85)', VH_NAIL = '#F9D6CC';
const VH_GLASS = '#93507C', VH_GLASS_IN = '#B86A94', VH_CORD = '#FFF1D9';

// each finger's angle for a hand state
function vsAngles(H, t) {
  const A = {};
  const sp = clamp(H.split || 0), wr = clamp(H.wrong || 0), stk = clamp(H.stuck || 0), tr = H.tremble || 0;
  for (const k of VH_ORD) {
    let a = lerp(VH.rest[k], VH.vee[k], sp);
    if (H.spread && H.spread[k] !== undefined) a += H.spread[k];
    A[k] = a;
  }
  // the little finger splits off alone (the wrong split): the other three stay together
  A.L += -0.30 * wr; A.R += -0.02 * wr;
  // the ring finger is dragged along with the middle: the gap opens between ring and little instead
  A.R = lerp(A.R, A.M - 0.035, stk);
  // tremble: the strain
  if (tr > 0) {
    const t0 = t || 0;
    A.L += 0.035 * tr * vnoise(t0 * 27, 3); A.R += 0.045 * tr * vnoise(t0 * 31, 5); A.M += 0.03 * tr * vnoise(t0 * 29, 7); A.I += 0.025 * tr * vnoise(t0 * 23, 9);
  }
  // lean: the middle and ring fingers lean their tips toward each other (love)
  const ln = clamp(H.lean || 0);
  A.M -= 0.05 * ln; A.R += 0.05 * ln;
  return A;
}
function vsHandPts(H = {}, t = 0) {
  const A = vsAngles(H, t), P = { tip: {}, kn: {}, mid: {}, a: A };
  for (const k of VH_ORD) {
    const kn = VH.k[k], L = VH.len[k], a = A[k];
    P.kn[k] = kn;
    P.tip[k] = [kn[0] + Math.sin(a) * L, kn[1] - Math.cos(a) * L];
    P.mid[k] = [kn[0] + Math.sin(a) * L * 0.5, kn[1] - Math.cos(a) * L * 0.5];
  }
  const th = VH.thumb;
  P.thumbBase = th.base; P.thumbTip = [th.base[0] + Math.sin(th.a) * th.len, th.base[1] - Math.cos(th.a) * th.len];
  P.strap = [(VH.k.M[0] + VH.k.R[0]) / 2, -70];
  P.wrist = [0, 0];
  return P;
}
// a tapered finger as a path (from a point a little inside the palm to the tip)
function vsFingerPath(c, kn, tip, w) {
  const ux = tip[0] - kn[0], uy = tip[1] - kn[1], L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L;
  const a = [kn[0] - (ux / L) * 16, kn[1] - (uy / L) * 16], wb = w * 0.52, wt = w * 0.44;
  // up the left side, over the tip, down the right side: the same turning as the palm's outline (clockwise on screen),
  // so palm, fingers and thumb fill as ONE shape with nonzero winding (opposite turnings left holes in the glass)
  c.moveTo(a[0] - nx * wb, a[1] - ny * wb);
  c.lineTo(tip[0] - nx * wt, tip[1] - ny * wt);
  c.arc(tip[0], tip[1], wt, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, false);
  c.lineTo(a[0] + nx * wb, a[1] + ny * wb);
  c.closePath();
}
// the back of the hand / the palm: from the wrist up to the knuckle line
function vsPalmPath(c, P) {
  const w = VH.wristW, k = P.kn;
  c.moveTo(-w, 4);
  c.quadraticCurveTo(-w - 8, -44, k.L[0] - 8, k.L[1] + 4);
  c.quadraticCurveTo(k.L[0] - 4, k.L[1] - 12, k.L[0] + 6, k.L[1] - 10);
  c.quadraticCurveTo(k.R[0], k.R[1] - 12, k.M[0] - 2, k.M[1] - 10);
  c.quadraticCurveTo(k.I[0] + 2, k.I[1] - 12, k.I[0] + 10, k.I[1] - 4);
  c.quadraticCurveTo(k.I[0] + 16, k.I[1] + 20, 38, -40);
  c.quadraticCurveTo(w + 4, -14, w, 4);
  c.closePath();
}
function vsThumbPath(c, P) {
  const th = VH.thumb, b = P.thumbBase, tp = P.thumbTip;
  const ux = tp[0] - b[0], uy = tp[1] - b[1], L = Math.hypot(ux, uy), nx = -uy / L, ny = ux / L;
  const a = [b[0] - (ux / L) * 26, b[1] - (uy / L) * 26];
  c.moveTo(a[0] - nx * th.w * 0.62, a[1] - ny * th.w * 0.62);
  c.lineTo(tp[0] - nx * th.w * 0.45, tp[1] - ny * th.w * 0.45);
  c.arc(tp[0], tp[1], th.w * 0.45, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, false);
  c.lineTo(a[0] + nx * th.w * 0.62, a[1] + ny * th.w * 0.62);
  c.closePath();
}
// a point along a finger: u = 0 at the knuckle .. 1 at the tip, off = sideways (hand units)
function vsAlong(P, k, u, off = 0) {
  const kn = P.kn[k], tp = P.tip[k], ux = tp[0] - kn[0], uy = tp[1] - kn[1], L = Math.hypot(ux, uy) || 1;
  return [kn[0] + ux * u + (-uy / L) * off, kn[1] + uy * u + (ux / L) * off];
}

// small faces on the middle and ring nails (back view): o = {k, love, blush}
function vsNailFace(c, P, k, f, love, side, t, mood) {
  if (f <= 0.01) return;
  const p = vsAlong(P, k, 0.84), a = P.a[k];
  c.save(); c.translate(p[0], p[1]); c.rotate(a); c.scale(f * 1.55, f * 1.55);
  const look = side * 1.6 * love;
  if (mood === 'dead') {   // X eyes and a flat mouth: dead last
    paint(() => {
      for (const ex of [-3.6, 3.6]) { line(c, ex - 2.2, -3.2, ex + 2.2, 1.2, 1.3, '#15132A'); line(c, ex + 2.2, -3.2, ex - 2.2, 1.2, 1.3, '#15132A'); }
      line(c, -2.4, 4.4, 2.4, 4.4, 1.2, '#5A1522');
    });
    c.restore();
    return;
  }
  paint(() => {
    for (const ex of [-3.6, 3.6]) { ellipse(c, ex, -1, 2.6, 3.1, '#FFFFFF'); circle(c, ex + look * 0.7, -0.6, 1.5, '#15132A'); }
    c.beginPath(); c.arc(0 + look * 0.4, 3.4, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 1.1; c.lineCap = 'round'; c.strokeStyle = '#5A1522'; c.stroke();
    if (love > 0.05) for (const ex of [-5.6, 5.6]) ellipse(c, ex, 2.6, 2.2, 1.3, `rgba(255,96,130,${0.7 * love})`);
  });
  c.restore();
}

// ---------------------------------------------------------------- the hand
function vsHand(c, pal, H = {}, t = 0) {
  const P = vsHandPts(H, t), v = clamp(H.view || 0), sx = -Math.cos(Math.PI * v), back = sx >= 0;
  const skin = (pal && pal.skin) || VH_SKIN, s = H.s || 1;
  c.save();
  c.rotate(H.rot || 0);
  c.scale(s * (Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx), s);
  // the thumb (behind the palm's edge on the back, in front of it on the palm: draw it first either way)
  c.beginPath(); vsThumbPath(c, P); c.fillStyle = VH_SKIN2; c.fill();
  paint(() => { c.lineWidth = 2.2; c.lineJoin = 'round'; c.strokeStyle = VH_LINE; c.stroke(); });
  // the palm / the back
  c.beginPath(); vsPalmPath(c, P); c.fillStyle = skin; c.fill();
  // the fingers: each a hair of a different colour (the light sees four things)
  const fcol = { L: '#F1B691', R: '#F2B993', M: '#F1B790', I: '#F3B894' };
  for (const k of VH_ORD) { c.beginPath(); vsFingerPath(c, P.kn[k], P.tip[k], VH.w[k]); c.fillStyle = fcol[k]; c.fill(); }
  // outlines, creases, nails
  paint(() => {
    c.lineJoin = 'round';
    for (const k of VH_ORD) {
      c.beginPath(); vsFingerPath(c, P.kn[k], P.tip[k], VH.w[k]); c.lineWidth = 2.2; c.strokeStyle = VH_LINE; c.stroke();
      const gk = k === 'M' ? (H.glowM || 0) : k === 'R' ? (H.glowR || 0) : 0;
      if (gk > 0.01) {
        const col = k === 'M' ? '#FF9A3C' : '#FFD447';
        c.beginPath(); vsFingerPath(c, P.kn[k], P.tip[k], VH.w[k] + 4); c.lineWidth = 5.5 * gk; c.strokeStyle = col; c.stroke();
      }
      // joint creases
      for (const u of [0.36, 0.67]) {
        const a = vsAlong(P, k, u, -VH.w[k] * 0.3), b = vsAlong(P, k, u, VH.w[k] * 0.3), m = vsAlong(P, k, u + (back ? -0.025 : 0.02), 0);
        c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(m[0], m[1], b[0], b[1]); c.lineWidth = 1.4; c.lineCap = 'round';
        c.strokeStyle = 'rgba(160,82,56,0.55)'; c.stroke();
      }
      if (back) {   // the nail
        const n = vsAlong(P, k, 0.84);
        ellipse(c, n[0], n[1], VH.w[k] * 0.3, VH.w[k] * 0.42, VH_NAIL, P.a[k]);
        c.beginPath(); c.ellipse(n[0], n[1], VH.w[k] * 0.3, VH.w[k] * 0.42, P.a[k], 0, 7); c.lineWidth = 1; c.strokeStyle = 'rgba(200,120,100,0.6)'; c.stroke();
      } else {      // the pad
        const n = vsAlong(P, k, 0.86);
        ellipse(c, n[0], n[1], VH.w[k] * 0.26, VH.w[k] * 0.36, 'rgba(255,214,190,0.55)', P.a[k]);
      }
    }
    c.beginPath(); vsPalmPath(c, P); c.lineWidth = 2.2; c.strokeStyle = VH_LINE; c.stroke();
    if (back) {
      // knuckle bumps and the faint cords on the back of the hand
      for (const k of VH_ORD) {
        const kn = P.kn[k];
        c.beginPath(); c.arc(kn[0], kn[1] + 6, VH.w[k] * 0.36, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 1.5; c.strokeStyle = 'rgba(160,82,56,0.45)'; c.stroke();
        line(c, kn[0] * 0.8, kn[1] + 16, kn[0] * 0.25, -8, 1.3, 'rgba(176,96,66,0.22)');
      }
      // the thumb's nail
      const tn = [lerp(P.thumbBase[0], P.thumbTip[0], 0.82), lerp(P.thumbBase[1], P.thumbTip[1], 0.82)];
      ellipse(c, tn[0], tn[1], 6.5, 8.5, VH_NAIL, VH.thumb.a);
    } else {
      // palm lines
      c.lineCap = 'round'; c.strokeStyle = 'rgba(170,92,64,0.5)'; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-30, -62); c.quadraticCurveTo(-4, -70, 26, -58); c.stroke();
      c.beginPath(); c.moveTo(-28, -46); c.quadraticCurveTo(0, -52, 22, -40); c.stroke();
      c.beginPath(); c.moveTo(24, -46); c.quadraticCurveTo(2, -30, 8, -2); c.stroke();
    }
  });
  // the glass: the back of the hand turns see-through from the knuckles down, and shows the cords and the strap
  const gk = clamp(H.glass || 0);
  if (gk > 0.01 && back) vsGlass(c, P, H, gk, t);
  // faces on the middle and ring nails
  if (back) {
    vsNailFace(c, P, 'M', H.faces || 0, H.love || 0, -1, t);
    if ((H.deadR || 0) > 0.01) vsNailFace(c, P, 'R', H.deadR, 0, 1, t, 'dead'); else vsNailFace(c, P, 'R', H.faces || 0, H.love || 0, 1, t);
  }
  // the lab glove: sensor dots on every joint and a cable from the wrist
  const gl = H.glove || 0;
  if (gl > 0.01) {
    paint(() => {
      c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(-10, 40, 30, 70, 10, 120); c.lineWidth = 5; c.strokeStyle = '#2B2F44'; c.stroke();
      for (const k of VH_ORD) for (const u of [0, 0.36, 0.67, 1]) {
        const p = vsAlong(P, k, u === 1 ? 0.95 : u);
        circle(c, p[0], p[1], 3.6, '#1D2238'); circle(c, p[0], p[1], 2.3, '#7FE9FF');
      }
    });
    for (const k of VH_ORD) for (const u of [0.36, 0.67, 0.95]) {
      const p = vsAlong(P, k, u);
      const m = c.getTransform();   // the glow layer is in screen space at half size: map the point
      const X = m.a * p[0] + m.c * p[1] + m.e, Y = m.b * p[0] + m.d * p[1] + m.f;
      gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); softDot(gctx, X * 0.5, Y * 0.5, 7, '#7FE9FF', 0.8 * gl); gctx.restore();
    }
  }
  c.restore();
  return P;
}

// the cords (the tendons that straighten the fingers, on the back of the hand) and the strap between middle and ring
function vsGlass(c, P, H, gk, t) {
  const R = lerp(0, 230, E.inOutSine(gk)), cx = 0, cy = -78;
  const full = gk >= 0.999;
  const body = (cc) => { cc.beginPath(); vsPalmPath(cc, P); for (const k of VH_ORD) vsFingerPath(cc, P.kn[k], P.tip[k], VH.w[k]); vsThumbPath(cc, P); };
  c.save();
  if (!full) { c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); }
  // the inside: a deep glassy violet, the skin's edge kept as a bright line
  c.fillStyle = VH_GLASS;
  body(c); c.fill('nonzero');
  paint(() => {
    // soft inner light so it reads as glass, not as a dark glove
    const g = c.createRadialGradient(0, -60, 10, 0, -60, 150);
    g.addColorStop(0, 'rgba(255,190,226,0.38)'); g.addColorStop(1, 'rgba(120,40,90,0.25)');
    body(c); c.fillStyle = g; c.fill('nonzero');
    // the bones, faint
    for (const k of VH_ORD) {
      const a = vsAlong(P, k, -0.75), b = vsAlong(P, k, 0.02), d = vsAlong(P, k, 0.33), e = vsAlong(P, k, 0.62), f = vsAlong(P, k, 0.9);
      for (const [p, q, w] of [[a, b, 7.5], [b, d, 6.5], [d, e, 5.5], [e, f, 4.6]]) line(c, p[0], p[1], q[0], q[1], w, 'rgba(255,236,246,0.16)');
    }
    // the cords: from the wrist, over the knuckle, up the finger
    const pull = clamp(H.strapPull || 0);
    for (const k of VH_ORD) {
      const col = k === 'M' ? '#FF9A3C' : k === 'R' ? '#FFD447' : VH_CORD;
      const w0 = [lerp(-14, 14, (VH_ORD.indexOf(k)) / 3), 4];
      const kn = vsAlong(P, k, 0.0), u1 = vsAlong(P, k, 0.45), u2 = vsAlong(P, k, 0.86);
      // the ring cord is dragged toward the middle cord where the strap holds it
      const st = k === 'R' ? 4.5 * pull : k === 'M' ? -2.5 * pull : 0;
      const sp = [P.strap[0] + (k === 'R' ? -9 : k === 'M' ? 9 : 0) + st, P.strap[1]];
      c.beginPath(); c.moveTo(w0[0], w0[1]);
      if (k === 'R' || k === 'M') c.quadraticCurveTo(lerp(w0[0], sp[0], 0.6), lerp(w0[1], sp[1], 0.65), sp[0], sp[1]), c.quadraticCurveTo(lerp(sp[0], kn[0], 0.5), lerp(sp[1], kn[1], 0.3), kn[0], kn[1]);
      else c.quadraticCurveTo(lerp(w0[0], kn[0], 0.6), lerp(w0[1], kn[1], 0.8), kn[0], kn[1]);
      c.lineTo(u1[0], u1[1]); c.lineTo(u2[0], u2[1]);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.lineWidth = 6.4; c.strokeStyle = 'rgba(40,10,40,0.55)'; c.stroke();
      c.lineWidth = 4.2; c.strokeStyle = col; c.stroke();
    }
    // the other straps, thin and dim (index-middle, ring-little)
    for (const [a, b, y] of [['I', 'M', -62], ['R', 'L', -60]]) {
      const pa = [lerp(P.kn[a][0], 0, 0.3), y], pb = [lerp(P.kn[b][0], 0, 0.3), y + 6];
      line(c, pa[0], pa[1], pb[0], pb[1], 2.4, 'rgba(200,168,255,0.38)');
    }
    // THE strap: two little arms reaching from the middle cord and the ring cord, their hands clasped in the middle
    const sp = P.strap, half = 11, st = 4.5 * pull;
    const aM = [sp[0] + half - 2.5 * pull, sp[1]], aR = [sp[0] - half + st, sp[1]], mid = [sp[0] + st * 0.3, sp[1] - 1 - 2 * Math.sin(t * 9) * 0.3];
    const sag = 3.5 * (1 - pull);
    c.lineCap = 'round';
    for (const a of [aM, aR]) {
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + mid[0]) / 2, mid[1] + sag, mid[0], mid[1]);
      c.lineWidth = 6.5; c.strokeStyle = '#3B1C55'; c.stroke(); c.lineWidth = 4.4; c.strokeStyle = '#C8A8FF'; c.stroke();
    }
    circle(c, mid[0] - 2.4, mid[1], 4.6, '#3B1C55'); circle(c, mid[0] + 2.4, mid[1] + 0.4, 4.6, '#3B1C55');
    circle(c, mid[0] - 2.4, mid[1], 3.6, '#F1E6FF'); circle(c, mid[0] + 2.4, mid[1] + 0.4, 3.6, '#E2D0FF');
    for (const dx of [-1.2, 0.6, 2.4]) line(c, mid[0] + dx, mid[1] - 2.6, mid[0] + dx + 0.4, mid[1] + 2.4, 0.8, 'rgba(90,50,130,0.7)');
  });
  // the strap glows when it pulls (screen-space glow layer)
  const pull = clamp(H.strapPull || 0), m = c.getTransform();
  const X = m.a * P.strap[0] + m.c * P.strap[1] + m.e, Y = m.b * P.strap[0] + m.d * P.strap[1] + m.f;
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0);
  softDot(gctx, X * 0.5, Y * 0.5, 10 * Math.hypot(m.a, m.b) / 2 + 4, '#C8A8FF', 0.12 + 0.3 * pull);
  gctx.restore();
  c.restore();
  // the edge where the skin is turning to glass: a bright ring that sweeps out
  if (!full && R > 2) paint(() => {
    c.save(); c.beginPath(); vsPalmPath(c, P); for (const k of VH_ORD) vsFingerPath(c, P.kn[k], P.tip[k], VH.w[k]); vsThumbPath(c, P); c.clip();
    c.beginPath(); c.arc(cx, cy, R, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(255,200,240,0.9)'; c.stroke();
    c.restore();
  });
}

// the OTHER hand, gripping the index and middle fingers from the thumb's side and pulling them over: the V made by hand.
// Hp = {k: 0..1 how far it has pulled, at: [x, y] the grip (hand units of the saluting hand, canonical)}. Drawn on top,
// in the same hand units (vsHero mirrors it with the hand). Returns the helper's wrist (hand units), for its arm.
const VH_HELP_WRIST = [12, 60];   // the helper's wrist, from its grip (hand units): below it, a little to the thumb's side
function vsHelper(c, pal, Hp, t) {
  if (!Hp) return;
  const skin = (pal && pal.skin) || VH_SKIN, at = Hp.at || [20, -128], k = clamp(Hp.k === undefined ? 1 : Hp.k);
  c.save(); c.translate(at[0] + 7 * k, at[1]);
  // its palm, below the grip on the thumb's side, and the wrist
  ellipse(c, 8, 28, 25, 24, skin, 0.2);
  // the thumb, up along the outside
  c.beginPath(); c.moveTo(20, 4); c.quadraticCurveTo(30, -18, 22, -34); c.lineWidth = 14; c.lineCap = 'round'; c.strokeStyle = VH_SKIN2; c.stroke();
  // three fingers wrapped across the front of the two fingers
  const fc = ['#F1B590', '#F0B28C', '#EFB089'];
  for (let i = 0; i < 3; i++) { rrect(c, -30, -20 + i * 12.5, 56, 12.5, 6.2); c.fillStyle = fc[i]; c.fill(); }
  paint(() => {
    c.lineWidth = 1.8; c.strokeStyle = VH_LINE; c.lineJoin = 'round';
    for (let i = 0; i < 3; i++) { rrect(c, -30, -20 + i * 12.5, 56, 12.5, 6.2); c.stroke(); }
    c.beginPath(); c.ellipse(8, 28, 25, 24, 0.2, 0.15, 2.9); c.stroke();
    ellipse(c, 23, -31, 4.2, 5.4, VH_NAIL, -0.3);
    for (let i = 0; i < 3; i++) ellipse(c, -26, -14 + i * 12.5, 3, 3.6, VH_NAIL);
  });
  c.restore();
}
