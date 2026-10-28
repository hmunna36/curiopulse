// head-shake-reading (29 Oct 2026): his head turning "no" and nodding "yes" with his eyes locked on us, the little
// driver in his inner ear who steers his eyes on two cords, and the labels of the Short.
//   st.turn = {yaw, pitch, gaze: [gyaw, gpitch], smear, cross}  on the rig's state: drawHead draws the head turned
//             (a sphere projection of the face), with the pupils pointing along gaze (world angles: [0, 0] = at the
//             camera, i.e. at us: the reflex). gaze [yaw, pitch] = eyes carried with the head (no reflex).
//   hsEyePts(st)                 the two pupils' world points (for the cords)
//   hsEarPt(st)                  the near ear's world point
//   hsWindow(P, R, k, inner)     a round window (world units) with the opaque disc first
//   hsDriver(c, x, y, s, A, t)   the inner ear as a little driver at a steering wheel (moods: drive, speed, doze)
//   hsCord(a, b, k, taut, t)     a glowing cord between two world points
//   hsArrow(...)                 a fat curved arrow with a word on it (screen space)
//   hsStopwatch(...)             a stopwatch reading 0.01 s (screen space)
'use strict';

// ---------------------------------------------------------------- the turned head
const HS_R = 64;                                   // the face's sphere (head units)
const HS_EYE = { lon: 0.36, lat: -0.031, rx: 15.5, ry: 16.6, ball: 24 };   // ball = how far behind the lid the pupil turns
const HS_IRIS = '#6B4A2E', HS_IRIS_DK = '#3C2414', HS_IRIS_HI = '#B07F4A';
// a point on the face: lon/lat on the sphere (rad), R its radius; returns [x, y, fx (cos of the turned lon), fy, front]
function hsProj(lon, lat, ya, pa, R = HS_R) {
  const L = lon + ya, A = lat + pa;
  return [R * Math.cos(A) * Math.sin(L), R * Math.sin(A), Math.cos(L), Math.cos(A), Math.cos(A) * Math.cos(L)];
}
const hsDrawHead0 = window.drawHead;
window.drawHead = function (c, r, face, st, pal, t) {
  if (!st.turn) return hsDrawHead0(c, r, face, st, pal, t);
  return hsDrawHeadTurn(c, r, face, st, pal, t);
};
function hsMouth(c, f, pal, sx) {
  const mo = f.mouthOpen;
  c.save(); c.scale(sx, 1);
  if (f.mouth === 'o') {
    ellipse(c, 0, 0, 7 + 5 * mo, 8 + 8 * mo, pal.mouth);
    ellipse(c, 0, 5 + 3 * mo, 5 + 3 * mo, 3 + 2 * mo, pal.tongue);
  } else if (f.mouth === 'grin') {
    c.beginPath(); c.moveTo(-30, -8); c.quadraticCurveTo(0, 34 * mo + 4, 30, -8); c.closePath();
    c.fillStyle = pal.mouth; c.fill();
    c.save(); c.clip(); c.fillStyle = pal.teeth; c.fillRect(-30, -9, 60, 10);
    ellipse(c, 0, 18 * mo, 12, 7, pal.tongue); c.restore();
  } else if (f.mouth === 'wavy') {
    c.beginPath(); c.moveTo(-18, 0);
    c.bezierCurveTo(-10, -8, -4, 8, 2, 0); c.bezierCurveTo(8, -8, 14, 8, 20, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else if (f.mouth === 'grimace') {
    rrect(c, -24, -9, 48, 19, 8); c.fillStyle = pal.teeth; c.fill();
    c.lineWidth = 3.5; c.strokeStyle = pal.mouth; c.stroke();
    line(c, -22, 0.5, 22, 0.5, 2.5, pal.mouth);
  } else if (f.mouth === 'smirk') {   // one corner up
    c.beginPath(); c.moveTo(-15, 2); c.quadraticCurveTo(2, 7, 16, -6);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  } else {   // flat (mouthOpen curves it into a small smile)
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, 4 + mo * 6, 14, 0);
    c.lineWidth = 5; c.strokeStyle = pal.mouth; c.lineCap = 'round'; c.stroke();
  }
  c.restore();
}
function hsDrawHeadTurn(c, r, face, st, pal, t) {
  const [hx, hy] = r.head, T = st.turn, f = face;
  const ya = T.yaw || 0, pa = T.pitch || 0;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  if (T.squash) c.scale(1 - 0.13 * T.squash, 1 + 0.05 * T.squash);   // squeezed between two bars (ward.js)
  // ears: at the sides of the sphere; the one turning away goes behind the head, the near one is drawn over it
  const earAt = (s) => hsProj(s * Math.PI / 2, 0.03, ya, pa * 0.6, 62);
  const ear = (s) => {
    const e = earAt(s), w = 13 + 9 * Math.abs(Math.sin(ya)) * (e[4] > 0 ? 1 : 0);
    ellipse(c, e[0], e[1], w, 18, pal.skinSh);
    ellipse(c, e[0] - s * 1.5, e[1], w * 0.52, 11, '#B8704F');
  };
  const far = ya >= 0 ? 1 : -1;
  ear(far);
  // the head: the rig's oval and shading
  c.beginPath(); c.ellipse(0, 0, 64, 70, 0, 0, Math.PI * 2);
  const g = c.createRadialGradient(-24 + 18 * Math.sin(ya), -26 + 12 * Math.sin(pa), 8, 0, 0, 78);
  g.addColorStop(0, pal.skinHi); g.addColorStop(0.45, pal.skin); g.addColorStop(1, pal.skinSh);
  c.fillStyle = g; c.fill();
  if (Math.abs(ya) > 0.02) ear(-far);
  // the hair cap with its quiff, carried round with the turn (and down with a nod), kept on the skull
  c.save(); c.beginPath(); c.ellipse(0, 0, 66, 72, 0, 0, Math.PI * 2); c.clip();
  c.translate(34 * Math.sin(ya), 20 * Math.sin(pa));
  c.beginPath();
  c.moveTo(-66, 10); c.quadraticCurveTo(-74, -54, -30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(76, -44, 66, 10);
  c.quadraticCurveTo(60, -22, 32, -36); c.quadraticCurveTo(2, -26, -20, -42); c.quadraticCurveTo(-52, -30, -66, 10); c.closePath();
  c.fillStyle = pal.hair; c.fill();
  line(c, -26, -58, 6, -68, 5, rgba(pal.hairHi, 0.9));
  c.restore();
  // the quiff above the skull keeps its outline outside the clip
  c.save(); c.translate(34 * Math.sin(ya), 20 * Math.sin(pa));
  c.beginPath(); c.moveTo(-30, -70); c.quadraticCurveTo(12, -88, 48, -64); c.quadraticCurveTo(10, -76, -30, -70); c.closePath();
  c.fillStyle = pal.hair; c.fill();
  c.restore();
  paint(() => hsFace(c, f, pal, T, t));
  c.restore();
}
// the face on the sphere: cheeks, eyes (with the pupils along gaze), brows, nose, mouth
function hsFace(c, f, pal, T, t) {
  const ya = T.yaw || 0, pa = T.pitch || 0, gz = T.gaze || [ya, pa];
  for (const s of [-1, 1]) {   // cheeks
    const p = hsProj(s * 0.62, 0.384, ya, pa);
    if (p[4] > 0.1) ellipse(c, p[0], p[1], 11 * p[2], 7 * p[3], 'rgba(255,110,110,0.28)');
  }
  const lid = mixHex(pal.skin, pal.skinSh, 0.28);
  for (const s of [-1, 1]) {
    const p = hsProj(s * HS_EYE.lon, HS_EYE.lat, ya, pa);
    const fx = Math.max(0.3, p[2] / Math.cos(HS_EYE.lon)), fy = Math.max(0.5, p[3]);
    const ex = p[0], ey = p[1], rx = HS_EYE.rx * fx, ry = HS_EYE.ry * fy * (f.eyeOpen || 1);
    const bl = clamp(f.blink || 0), sq = clamp(f.squint || 0);
    if (bl >= 0.93) {   // shut: a lash curve
      c.beginPath(); c.moveTo(ex - rx, ey - 1); c.quadraticCurveTo(ex, ey + 10, ex + rx, ey - 1);
      c.lineWidth = 4.5; c.strokeStyle = '#5A2E22'; c.lineCap = 'round'; c.stroke();
    } else {
      ellipse(c, ex, ey, rx, ry, '#FFFFFF');
      c.save(); c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.clip();
      ellipse(c, ex, ey - ry * 0.55, rx, ry * 0.5, 'rgba(150,170,200,0.16)');
      // the pupil: the eyeball sits straight behind the lid along the way the FACE points (eyes look forward, not out
      // along the skull), and the pupil is on its front, turned along gaze. gaze = the face's own angles: centred.
      let gy = gz[0], gp = gz[1];
      if (T.cross) gy = lerp(gy, -s * 0.5 + ya, T.cross);
      const [px, py] = hsPupil(ex, ey, rx, ry, ya, pa, gy, gp);
      const iris = (x, y, a) => {
        circle(c, x, y, 9.6, rgba(HS_IRIS_DK, a)); circle(c, x, y, 8.4, rgba(HS_IRIS, a));
        circle(c, x - 1.2, y + 1.6, 5.6, rgba(HS_IRIS_HI, 0.5 * a));
        circle(c, x, y, 4.6, rgba('#120A0C', a));
      };
      if (T.smear && T.smear.k > 0.01) {   // the eye chasing: a streak of irises back along its path
        for (let i = 1; i <= 6; i++) iris(px - T.smear.dx * i / 6, py, 0.22 * T.smear.k);
      }
      iris(px, py, 1);
      circle(c, px - 2.8, py - 3.3, 2.6, 'rgba(255,255,255,0.95)'); circle(c, px + 2.6, py + 2.4, 1.1, 'rgba(255,255,255,0.8)');
      if (bl > 0.01) {
        c.fillStyle = lid; c.fillRect(ex - rx - 1, ey - ry - 2, 2 * rx + 2, (2 * ry + 2) * bl + 1);
        line(c, ex - rx, ey - ry + 2 * ry * bl, ex + rx, ey - ry + 2 * ry * bl, 2.6, '#6A3526');
      }
      if (sq > 0.01) {
        const top = ey + ry - 2 * ry * 0.42 * sq;
        c.fillStyle = lid; c.fillRect(ex - rx - 1, top, 2 * rx + 2, ry * 2);
      }
      c.restore();
      c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); c.lineWidth = 1.1; c.strokeStyle = 'rgba(120,60,40,0.45)'; c.stroke();
      if (bl < 0.85) {
        c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, Math.PI * 1.12, Math.PI * 1.88); c.lineWidth = 2.6; c.lineCap = 'round'; c.strokeStyle = '#3A1E16'; c.stroke();
      }
    }
    // the brow
    const b0 = hsProj(s * 0.16, -0.488 - (f.browY || 0) * 0.12 - (f.browTilt || 0) * 0.1, ya, pa);
    const b1 = hsProj(s * 0.6, -0.488 - (f.browY || 0) * 0.12 + (f.browTilt || 0) * 0.05, ya, pa);
    if (b1[4] > 0 || b0[4] > 0) line(c, b0[0], b0[1], b1[0], b1[1], 7.5, pal.hair);
  }
  // the nose stands out of the face: a larger sphere, so it swings further than the eyes
  const n = hsProj(0, 0.2527, ya, pa, 72);
  ellipse(c, n[0], n[1], 8 + 2 * Math.abs(Math.sin(ya)), 6, 'rgba(190,110,80,0.6)');
  ellipse(c, n[0] - 2 - 3 * Math.sin(ya), n[1] - 2, 3, 2, 'rgba(255,230,210,0.8)');
  // the mouth
  const m = hsProj(0, 0.675, ya, pa * 0.8, 64);
  c.save(); c.translate(m[0], m[1]); hsMouth(c, f, pal, Math.max(0.55, m[2])); c.restore();
}
// where the pupil lands in the eye opening (ex, ey, rx, ry) for a face turned (ya, pa) and a gaze (gy, gp): kept inside
function hsPupil(ex, ey, rx, ry, ya, pa, gy, gp) {
  const B = HS_EYE.ball;
  let dx = B * (Math.sin(gy) * Math.cos(gp) - Math.sin(ya) * Math.cos(pa)), dy = B * 0.9 * (Math.sin(gp) - Math.sin(pa));
  dx = clamp(dx, -rx * 0.6, rx * 0.6); dy = clamp(dy, -ry * 0.5, ry * 0.5);
  return [ex + dx, ey + dy];
}
// world points of the pupils and the near ear (st from bdSt: the rig's head transform)
function hsHeadW(st, lx, ly) { return bdHeadPt(st, lx, ly); }
function hsEyePts(st) {
  const T = st.turn || {}, ya = T.yaw || 0, pa = T.pitch || 0, gz = T.gaze || [ya, pa];
  return [-1, 1].map((s) => {
    const p = hsProj(s * HS_EYE.lon, HS_EYE.lat, ya, pa), fx = Math.max(0.3, p[2] / Math.cos(HS_EYE.lon)), fy = Math.max(0.5, p[3]);
    const gy = T.cross ? lerp(gz[0], -s * 0.5 + ya, T.cross) : gz[0];
    const q = hsPupil(p[0], p[1], HS_EYE.rx * fx, HS_EYE.ry * fy, ya, pa, gy, gz[1]);
    return hsHeadW(st, q[0], q[1]);
  });
}
function hsEarPt(st, side = -1) {
  const T = st.turn || {}, e = hsProj(side * Math.PI / 2, 0.03, T.yaw || 0, (T.pitch || 0) * 0.6, 62);
  return hsHeadW(st, e[0], e[1]);
}

// ---------------------------------------------------------------- the window (world units, camera applied)
function hsWindow(P, R0, k, inner, o = {}) {
  if (k <= 0.01) return;
  const R = R0 * E.outBack(clamp(k), 1.6);
  ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.fillStyle = o.bg || '#3A1630'; ctx.fill();   // the opaque disc first
  ctx.save(); ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(P[0], P[1], R, 0, 7); gctx.clip();
  const g = ctx.createRadialGradient(P[0], P[1] - R * 0.3, R * 0.1, P[0], P[1], R);
  g.addColorStop(0, o.bg1 || '#7A2E52'); g.addColorStop(1, o.bg || '#3A1630');
  ctx.fillStyle = g; ctx.fillRect(P[0] - R, P[1] - R, 2 * R, 2 * R);
  inner(R);
  ctx.restore(); gctx.restore();
  paint(() => {
    ctx.beginPath(); ctx.arc(P[0], P[1], R, 0, 7); ctx.lineWidth = Math.max(2.4, R * 0.055); ctx.strokeStyle = '#FFE9D2'; ctx.stroke();
  });
  softDot(gctx, P[0], P[1], R * 1.15, '#FF9AC8', 0.12 * clamp(k));
}

// ---------------------------------------------------------------- the driver: the inner ear at a steering wheel
// (x, y) = the middle of his body, s = scale (his body is about 100 units across at s = 1). A: {wheel (rad), mood:
// 'drive' | 'speed' | 'doze', grip 0..1, look (-1..1), sweat 0..1, blurW (rad/s of the wheel, for the smear)}
const HSD = { body: '#F4A9B8', bodySh: '#D9788E', bodyHi: '#FFD3DC', loop: ['#FF9A3C', '#4DC8FF', '#B98CFF'], wheel: '#2A2440', wheelHi: '#4A4270' };
function hsWheel(c, x, y, R, ang, a = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha = a;
  c.beginPath(); c.arc(0, 0, R, 0, 7); c.arc(0, 0, R * 0.78, 0, 7, true); c.fillStyle = HSD.wheel; c.fill('evenodd');
  for (const k of [0, 2.094, 4.189]) { c.save(); c.rotate(k); rrect(c, -R * 0.07, 0, R * 0.14, R * 0.8, R * 0.05); c.fillStyle = HSD.wheel; c.fill(); c.restore(); }
  circle(c, 0, 0, R * 0.22, HSD.wheelHi);
  paint(() => { c.beginPath(); c.arc(0, 0, R * 0.89, -2.4, -0.9); c.lineWidth = R * 0.05; c.strokeStyle = 'rgba(255,255,255,0.25)'; c.stroke(); circle(c, 0, -R * 0.89, R * 0.07, '#FFD447'); });
  c.restore();
}
function hsDriver(c, x, y, s, A = {}, t = 0) {
  const mood = A.mood || 'drive', wa = A.wheel || 0, sw = A.sweat || 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  const bob = mood === 'doze' ? 2 * Math.sin(t * 2.2) : (mood === 'speed' ? 2.5 * Math.sin(t * 40) : 1.2 * Math.sin(t * 5));
  c.translate(0, bob);
  // the three loops on his head (the balance canals), like a hairdo, each its own colour
  const loops = [[-26, -58, 0.5], [0, -70, 0], [26, -58, -0.5]];
  loops.forEach(([lx, ly, rot], i) => {
    c.save(); c.translate(lx, ly); c.rotate(rot + (mood === 'speed' ? 0.12 * Math.sin(t * 50 + i) : 0));
    c.beginPath(); c.ellipse(0, -10, 15, 22, 0, 0, 7); c.ellipse(0, -10, 8.5, 15, 0, 0, 7, true); c.fillStyle = HSD.loop[i]; c.fill('evenodd');
    c.restore();
  });
  // the snail shell on his back (the hearing part, along for the ride)
  c.save(); c.translate(-46, 6);
  circle(c, 0, 0, 26, '#E98AA0');
  paint(() => { c.beginPath(); for (let a = 0; a < 12; a += 0.2) { const rr = 24 * (1 - a / 13); const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (a === 0) c.moveTo(px, py); else c.lineTo(px, py); } c.lineWidth = 3; c.strokeStyle = 'rgba(140,40,70,0.55)'; c.stroke(); });
  c.restore();
  // the body
  c.beginPath(); c.ellipse(0, 0, 44, 48, 0, 0, 7); c.fillStyle = HSD.body; c.fill();
  // the face
  const lk = (A.look || 0) * 5;
  paint(() => {
    if (mood === 'doze') {
      for (const ex of [-14, 14]) { c.beginPath(); c.moveTo(ex - 8, -6); c.quadraticCurveTo(ex, 0, ex + 8, -6); c.lineWidth = 3.5; c.strokeStyle = '#3A1E2A'; c.lineCap = 'round'; c.stroke(); }
      ellipse(c, 0, 18, 6, 4 + 1.5 * Math.sin(t * 2.2), '#7A2A40');
    } else {
      for (const ex of [-14, 14]) { ellipse(c, ex, -6, 9, mood === 'speed' ? 11 : 10, '#FFFFFF'); circle(c, ex + lk, -5, 4.6, '#1A0E14'); circle(c, ex + lk - 1.6, -7, 1.5, '#FFFFFF'); }
      // brows: focused (down at the middle)
      line(c, -22, -20, -7, -16 + (mood === 'speed' ? 2 : 0), 4, '#8A3A52'); line(c, 22, -20, 7, -16 + (mood === 'speed' ? 2 : 0), 4, '#8A3A52');
      if (mood === 'speed') { c.beginPath(); c.moveTo(-9, 16); c.lineTo(9, 16); c.lineWidth = 4; c.strokeStyle = '#5A1A2E'; c.lineCap = 'round'; c.stroke(); for (const tx of [-5, 0, 5]) line(c, tx, 13, tx, 19, 1.6, '#FFFFFF'); }
      else { c.beginPath(); c.moveTo(-8, 15); c.quadraticCurveTo(0, 20, 8, 15); c.lineWidth = 3.5; c.strokeStyle = '#5A1A2E'; c.stroke(); ellipse(c, 6, 19, 3.5, 3, '#E0616C'); }   // the tongue out: concentration
    }
    ellipse(c, -27, 10, 7, 4.5, 'rgba(255,90,120,0.35)'); ellipse(c, 27, 10, 7, 4.5, 'rgba(255,90,120,0.35)');
  });
  if (sw > 0.02) sweatDrop(c, 30, -26, 0.5, sw);
  // the wheel in front of him, his little arms on it
  const WY = 44, WR = 34;
  if (mood !== 'doze') {
    const hands = [[-0.9, 1], [0.9, 1]].map(([a]) => [Math.sin(wa + a) * WR * 0.92, WY - Math.cos(wa + a) * WR * 0.92]);
    for (const [hx, hy] of hands) line(c, Math.sign(hx) * 30, 18, hx, hy, 9, HSD.bodySh);
    if (mood === 'speed' && (A.blurW || 0) > 0) for (let i = 1; i <= 4; i++) hsWheel(c, 0, WY, WR, wa - i * 0.12 * Math.sign(A.blurW), 0.22);
    hsWheel(c, 0, WY, WR, wa);
    for (const [hx, hy] of hands) circle(c, hx, hy, 7.5, HSD.body);
  } else {
    hsWheel(c, 0, WY + 6, WR, 0.2);
    line(c, -30, 18, -8, 34, 9, HSD.bodySh); line(c, 30, 18, 8, 34, 9, HSD.bodySh);   // arms folded on his tummy
  }
  c.restore();
}
// where the cords leave the wheel (world units, for a driver drawn at (x, y, s) with the wheel turned by wa)
function hsWheelPts(x, y, s, wa) {
  const WY = 44, WR = 34;
  return [-1.35, 1.35].map((a) => [x + s * Math.sin(wa + a) * WR, y + s * (WY - Math.cos(wa + a) * WR)]);
}

// ---------------------------------------------------------------- a glowing cord between two world points
function hsCord(a, b, k, taut = 1, t = 0, col = '#FFB347', w = 5, via = null) {
  if (k <= 0.01) return;
  // via: a point the cord bends toward (over his brow, so it never crosses the other eye)
  const mx = via ? via[0] : (a[0] + b[0]) / 2, my = (via ? via[1] : (a[1] + b[1]) / 2) + (1 - taut) * 0.18 * Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ex = lerp(a[0], b[0], clamp(k)), ey = lerp(a[1], b[1], clamp(k));
  const path = (c) => { c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(lerp(a[0], mx, clamp(k)), lerp(a[1], my, clamp(k)), ex, ey); };
  paint(() => {
    path(ctx); ctx.lineWidth = w + 3; ctx.strokeStyle = 'rgba(40,10,20,0.55)'; ctx.lineCap = 'round'; ctx.stroke();
    path(ctx); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
  });
  path(gctx); gctx.lineWidth = w * 2.2; gctx.strokeStyle = rgba(col, 0.45 * taut); gctx.lineCap = 'round'; gctx.stroke();
  if (k >= 1) circle(ctx, b[0], b[1], w * 0.9, col);
}

// ---------------------------------------------------------------- screen-space labels
// a fat curved arrow over an arc of a circle, with a word riding it. dir = +1 clockwise (to the right over the top)
function hsArrow(cx, cy, R, a0, a1, k, col, word, size = 54) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 1.6), am = lerp(a0, a1, clamp(k * 1.2));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(q, q);
  const w = 30;
  ctx.beginPath(); ctx.arc(0, 0, R, a0, am, a1 < a0); ctx.lineWidth = w + 10; ctx.strokeStyle = '#0B0B1A'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R, a0, am, a1 < a0); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
  // the head of the arrow
  const dirS = a1 > a0 ? 1 : -1, hx = Math.cos(am) * R, hy = Math.sin(am) * R, tx = -Math.sin(am) * dirS, ty = Math.cos(am) * dirS;
  const nx = Math.cos(am), ny = Math.sin(am);
  const tri = (grow, fill) => {
    ctx.beginPath(); ctx.moveTo(hx + tx * (44 + grow), hy + ty * (44 + grow));
    ctx.lineTo(hx + nx * (38 + grow), hy + ny * (38 + grow)); ctx.lineTo(hx - nx * (38 + grow), hy - ny * (38 + grow)); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  };
  tri(7, '#0B0B1A'); tri(0, col);
  if (word) {
    const wa = (a0 + am) / 2, wx = Math.cos(wa) * R, wy = Math.sin(wa) * R;
    ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(word).width;
    rrect(ctx, wx - tw / 2 - 18, wy - size * 0.72, tw + 36, size * 1.44, size * 0.5); ctx.fillStyle = '#0B0B1A'; ctx.fill();
    paint(() => { ctx.fillStyle = col; ctx.fillText(word, wx, wy + 3); });
  }
  ctx.restore();
}
// a straight fat arrow (screen space): from (x, y), pointing dir (+1 right, -1 left), length L
function hsArrowH(x, y, dir, L, k, col, word, size = 48) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q);
  const path = (g) => {
    ctx.beginPath(); ctx.moveTo(-dir * L / 2 - dir * g, -17 - g); ctx.lineTo(dir * (L / 2 - 40), -17 - g); ctx.lineTo(dir * (L / 2 - 40), -40 - g);
    ctx.lineTo(dir * (L / 2 + g * 1.4), 0); ctx.lineTo(dir * (L / 2 - 40), 40 + g); ctx.lineTo(dir * (L / 2 - 40), 17 + g); ctx.lineTo(-dir * L / 2 - dir * g, 17 + g); ctx.closePath();
  };
  path(6); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  path(0); ctx.fillStyle = col; ctx.fill();
  if (word) {
    ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    paint(() => { ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(word, -dir * 18, -66); ctx.fillStyle = col; ctx.fillText(word, -dir * 18, -66); });
  }
  ctx.restore();
}
// a stopwatch with a reading (screen space)
function hsStopwatch(x, y, r, k, txt, t, o = {}) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 1.8);
  ctx.save(); ctx.translate(x, y); ctx.scale(q, q); ctx.rotate(o.rot || -0.06);
  rrect(ctx, -r * 0.16, -r * 1.32, r * 0.32, r * 0.3, 6); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  rrect(ctx, -r * 0.11, -r * 1.27, r * 0.22, r * 0.22, 4); ctx.fillStyle = '#C9D6E8'; ctx.fill();
  circle(ctx, 0, 0, r + 10, '#0B0B1A'); circle(ctx, 0, 0, r, '#EEF3FA');
  paint(() => {
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94, 5, '#2A2440'); }
    const ha = -Math.PI / 2 + (o.hand === undefined ? 0.35 : o.hand);
    line(ctx, 0, 0, Math.cos(ha) * r * 0.72, Math.sin(ha) * r * 0.72, 8, '#FF4D5E');
    circle(ctx, 0, 0, 9, '#2A2440');
  });
  ctx.restore();
  if (txt) bigWord(txt, x, y + r + 86 * q, 112, o.col || '#FFD447', k, -0.04);
}
// a jagged burst with a word (screen space), for TOO SLOW
function hsBurst(txt, x, y, k, col = '#FF5A6E', size = 92, rot = -0.08) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q, q);
  ctx.font = `900 ${size}px Anton, Montserrat`; const tw = ctx.measureText(txt).width;
  const R0 = tw * 0.62 + 30, R1 = R0 * 0.8;
  const star = (g) => { ctx.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, rr = (i % 2 ? R1 : R0) + g; const px = Math.cos(a) * rr, py = Math.sin(a) * rr * 0.5; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); };
  star(10); ctx.fillStyle = '#0B0B1A'; ctx.fill();
  star(0); ctx.fillStyle = col; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  paint(() => { ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 9; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 4); ctx.fillText(txt, 0, 4); });
  ctx.restore();
}
