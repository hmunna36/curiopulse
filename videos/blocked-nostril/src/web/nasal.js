// Why Is One Nostril ALWAYS Blocked? Short: the inside of his nose, cut across and seen from the front.
// Two passages with a wall between them (the septum). On each side three shelves of spongy tissue (the turbinates)
// grow from the outer wall; each side's shelves can fill with blood and swell until the passage is nearly shut, or
// shrink and leave it wide open. The lowest shelf on each side has a face: asleep when it is swollen (on its break),
// awake under a hard hat when it is working. Air is drawn as beads that ride up each passage, fast where it is wide.
//   nasDraw(c, t, o, g)      the section in its own units (origin at its middle, about ±340 x, -410..+380 y); g = the glow
//                            context with the same transform, or null
//   nasOn(V, t, o)           the same on screen: V = {x, y, s} (where the origin is, and the scale)
//   nasPt(V, x, y)           a point of the section on screen
//   nasMini(c, x, y, r, t, o, k)   the section in a round window (any units): the way in from the scene
// o: {k: {L, R} swell 0..1.2, blood: {L, R} 0..1 (blood on its way in), sleep: {L, R} 0..1, hat: {L, R} 0..1,
//     air 0..1, faces (default true), signs: {L, R} (the options of mirSign),
//     pulse(li, sd): a shelf's extra thickness (a bounce when it is named), li 0 = the lowest}
'use strict';

const NAS = { cx: 540, cy: 830, sept: 14 };
// the three shelves of a side: height, where the outer wall is, the gap to the septum when shrunk and when swollen,
// and how thick the shelf is, shrunk and swollen
const NAS_T = [
  { y: 172, wall: 272, g0: 124, g1: 13, h0: 84, h1: 136 },
  { y: 6, wall: 214, g0: 96, g1: 12, h0: 64, h1: 104 },
  { y: -150, wall: 132, g0: 56, g1: 10, h0: 44, h1: 66 },
];
const NAS_OUT = [[0, -412], [72, -392], [122, -300], [176, -170], [246, -40], [312, 92], [338, 212], [316, 318], [236, 368], [150, 384]];
const NAS_CAV = [[14, -338], [58, -324], [96, -246], [142, -132], [206, -12], [262, 108], [284, 204], [264, 284], [214, 308], [152, 314], [150, 392], [40, 392], [40, 304], [14, 292]];
const nasGap = (L, k) => Math.max(-4, lerp(L.g0, L.g1, k));
const nasSwell = (k) => mixH('#F8A9B6', '#D2254A', clamp(k));

function nasPoly(c, pts, s) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(s * p[0], p[1]) : c.moveTo(s * p[0], p[1]))); c.closePath(); }

function nasDraw(c, t, o = {}, g = null) {
  const K = o.k || { L: 0.5, R: 0.5 }, air = o.air === undefined ? 1 : o.air;
  c.lineCap = 'round'; c.lineJoin = 'round';
  // ---- the flesh of the nose, cut through
  c.beginPath();
  NAS_OUT.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  for (let i = NAS_OUT.length - 1; i >= 0; i--) c.lineTo(-NAS_OUT[i][0], NAS_OUT[i][1]);
  c.closePath(); c.fillStyle = '#F2A98F'; c.fill(); c.lineWidth = 16; c.strokeStyle = '#F2A98F'; c.stroke();
  paint(() => {   // a vessel down each outer wall: it feeds the shelves
    for (const [s, sd] of [[-1, 'L'], [1, 'R']]) {
      const b = (o.blood && o.blood[sd]) || 0;
      c.beginPath(); c.moveTo(s * 104, -330); c.quadraticCurveTo(s * 232, -120, s * 306, 100); c.quadraticCurveTo(s * 322, 190, s * 306, 270);
      c.lineWidth = 9; c.strokeStyle = mixH('#E47B78', '#E0203F', 0.35 + 0.65 * b); c.stroke();
      if (b > 0.03) { c.setLineDash([10, 22]); c.lineDashOffset = -t * 150; c.lineWidth = 5; c.strokeStyle = `rgba(255,214,214,${0.85 * b})`; c.stroke(); c.setLineDash([]); }
    }
  });
  // ---- the two passages
  for (const s of [-1, 1]) { nasPoly(c, NAS_CAV, s); c.fillStyle = '#35102A'; c.fill(); }
  paint(() => { for (const s of [-1, 1]) { nasPoly(c, NAS_CAV.slice(0, 10), s); c.lineWidth = 9; c.strokeStyle = '#E8809A'; c.stroke(); } });
  // ---- the wall between them
  rrect(c, -NAS.sept, -356, 2 * NAS.sept, 662, 12); c.fillStyle = '#FBE3D8'; c.fill();
  c.beginPath(); c.moveTo(-NAS.sept, 250); c.quadraticCurveTo(-42, 330, -40, 392); c.lineTo(40, 392); c.quadraticCurveTo(42, 330, NAS.sept, 250); c.closePath(); c.fillStyle = '#F2A98F'; c.fill();
  // ---- air: beads that ride up each passage (wide = many and fast, narrow = a few that creep, shut = they pile up)
  if (air > 0.02) for (const [s, sd] of [[-1, 'L'], [1, 'R']]) {
    const gp = NAS_T.map((L) => Math.max(0, nasGap(L, K[sd]))), open = clamp(gp[0] / NAS_T[0].g0);
    const WP = [[95, 430, 40], [95, 340, 40], [NAS.sept + Math.max(gp[0], 12) / 2 + 2, 172, Math.max(gp[0] - 16, 3) / 2], [NAS.sept + Math.max(gp[1], 12) / 2 + 2, 6, Math.max(gp[1] - 16, 3) / 2],
      [NAS.sept + Math.max(gp[2], 10) / 2 + 2, -150, Math.max(gp[2] - 12, 2) / 2], [30, -326, 8]];
    const n = Math.round(lerp(5, 26, open)), sp = lerp(0.07, 0.6, open);
    for (let i = 0; i < n; i++) {
      const h1 = hash(i * 9.1 + (s > 0 ? 3 : 17)), h2 = hash(i * 5.3 + 11);
      let u = ((t * sp * (0.8 + 0.4 * h2) + h1) % 1 + 1) % 1;
      if (open < 0.16 && i % 2 === 0) u = 0.1 + 0.07 * Math.sin(t * 4.2 + i * 2.1);   // stuck at the door
      const at = (uu) => { const f = clamp(uu) * (WP.length - 1), j = Math.min(WP.length - 2, Math.floor(f)), q = f - j, A = WP[j], B = WP[j + 1]; return [s * (lerp(A[0], B[0], q) + (h2 - 0.5) * 2 * lerp(A[2], B[2], q)), lerp(A[1], B[1], q)]; };
      const P = at(u), Q = at(u - 0.022), al = air * clamp(u / 0.07) * clamp((1 - u) / 0.1);
      if (al < 0.03) continue;
      line(c, Q[0], Q[1], P[0], P[1], 5, `rgba(160,232,255,${0.5 * al})`);
      circle(c, P[0], P[1], 5.6, `rgba(222,248,255,${0.95 * al})`);
      if (g) softDot(g, P[0], P[1], 20, '#7FE9FF', 0.5 * al);
    }
  }
  // ---- the shelves of spongy tissue
  for (const [s, sd] of [[-1, 'L'], [1, 'R']]) {
    const k = K[sd], kk = clamp(k), col = nasSwell(k), b = (o.blood && o.blood[sd]) || 0;
    for (let li = NAS_T.length - 1; li >= 0; li--) {
      const L = NAS_T[li], gap = nasGap(L, k), len = L.wall - NAS.sept - gap, pw = o.pulse ? o.pulse(li, sd) : 0, h = lerp(L.h0, L.h1, kk) * (1 + pw), cx = L.wall - len / 2 + 6, tipX = NAS.sept + gap;
      const wob = 1 + 0.018 * Math.sin(t * 5 + li * 2 + (s > 0 ? 1 : 0)) * kk;
      c.fillStyle = col;
      c.beginPath(); c.ellipse(s * cx, L.y + 5 * kk, len / 2 + 9, (h / 2) * wob, s * 0.07, 0, 7); c.fill();
      c.beginPath(); c.ellipse(s * (tipX + h * 0.36), L.y + h * 0.3, h * 0.4, h * 0.42 * wob, 0, 0, 7); c.fill();   // the curl at its free end
      c.fillRect(s > 0 ? L.wall - 26 : -L.wall - 6, L.y - h * 0.3, 32, h * 0.62);                                     // its root in the wall
      paint(() => {
        c.beginPath(); c.ellipse(s * cx, L.y - h * 0.2 + 5 * kk, len / 2 - 8, h * 0.17, s * 0.07, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 6; c.strokeStyle = `rgba(255,226,232,${Math.min(1, 0.5 + 4 * Math.abs(pw))})`; c.stroke();
        if (Math.abs(pw) > 0.01 && g) softDot(g, s * cx, L.y, len * 0.7, '#FF9AB4', Math.min(0.6, 5 * Math.abs(pw)));
        const va = clamp((k - 0.3) * 1.5);
        if (va > 0.03) for (let j = 0; j < 3; j++) {   // vessels show as it fills
          const y0 = L.y + (j - 1) * h * 0.2 + 5 * kk;
          c.beginPath(); c.moveTo(s * (L.wall - 4), y0); c.quadraticCurveTo(s * (cx + len * 0.1), y0 + (j - 1) * 9, s * (tipX + h * 0.3), y0 + (j - 1) * 5 + h * 0.12);
          c.lineWidth = 4; c.strokeStyle = `rgba(150,16,48,${0.45 * va})`; c.stroke();
        }
        if (b > 0.03) for (let j = 0; j < 5; j++) {   // blood on its way in
          const p = ((t * 1.3 + j / 5 + li * 0.13) % 1 + 1) % 1, x = s * lerp(L.wall + 10, tipX + h * 0.3, p), y = L.y + 5 * kk + 0.16 * h * Math.sin(p * 9 + j);
          const al = b * Math.sin(Math.PI * p);
          circle(c, x, y, 8.5, `rgba(255,70,96,${al})`); circle(c, x - 2, y - 2, 3.4, `rgba(255,200,206,${al})`);
          if (g) softDot(g, x, y, 22, '#FF4D6A', 0.5 * al);
        }
      });
    }
    // ---- the face of the lowest shelf: asleep when it is swollen, at work when it is not
    if (o.faces !== false) {
      const L = NAS_T[0], gap = nasGap(L, k), len = L.wall - NAS.sept - gap, h = lerp(L.h0, L.h1, kk), fx = s * (L.wall - len / 2 + 2), fy = L.y + 5 * kk + 2;
      const sl = clamp((o.sleep && o.sleep[sd]) || 0), hat = clamp((o.hat && o.hat[sd]) || 0, 0, 1.15), es = 0.82 + 0.3 * kk;
      if (hat > 0.02) {   // a hard hat
        c.save(); c.translate(fx, fy - h * 0.4 - 4); c.scale(hat, hat); c.rotate(-s * 0.1);
        c.beginPath(); c.ellipse(0, 0, 33, 25, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#FFD447'; c.fill();
        rrect(c, -42, -5, 84, 11, 5); c.fillStyle = '#F2B01E'; c.fill();
        paint(() => { rrect(c, -5, -25, 10, 22, 4); c.fillStyle = '#FFE99A'; c.fill(); });
        c.restore();
      }
      paint(() => {
        for (const e of [-1, 1]) {
          const ex = fx + e * 17 * es, ey = fy - 3;
          if (sl > 0.5) { c.beginPath(); c.moveTo(ex - 9 * es, ey); c.quadraticCurveTo(ex, ey + 8 * es, ex + 9 * es, ey); c.lineWidth = 3.6; c.strokeStyle = '#6A1228'; c.stroke(); }
          else { ellipse(c, ex, ey, 8.6 * es, 10 * es, '#FFFFFF'); circle(c, ex - s * 2.4, ey + 1.2, 4.6 * es, '#2A0A16'); circle(c, ex - s * 2.4 - 1.4, ey - 0.6, 1.5 * es, '#FFFFFF');
            line(c, ex - 9 * es, ey - 14 * es + e * 2 * s, ex + 9 * es, ey - 14 * es - e * 2 * s, 3.6, '#8A1A34'); }
        }
        if (sl > 0.5) { ellipse(c, fx, fy + 15 * es, 5 * es, (5 + 2 * Math.sin(t * 3.2)) * es, '#6A1228'); for (const e of [-1, 1]) ellipse(c, fx + e * 30 * es, fy + 9 * es, 8 * es, 5 * es, 'rgba(255,255,255,0.22)'); }
        else { c.beginPath(); c.moveTo(fx - 9 * es, fy + 13 * es); c.quadraticCurveTo(fx, fy + 20 * es, fx + 9 * es, fy + 13 * es); c.lineWidth = 3.6; c.strokeStyle = '#6A1228'; c.stroke(); }
      });
    }
  }
  // ---- the signs at the two doors
  if (o.signs) for (const [s, sd] of [[-1, 'L'], [1, 'R']]) {
    const S = o.signs[sd];
    if (!S || S.k <= 0.01) continue;
    c.save(); c.translate(s * 95 - s * NZ.nost * 3.4, 392 - (NZ.nostY + 1.5) * 3.4); c.scale(3.4, 3.4); mirSign(c, s, S, t); c.restore();
  }
}

function nasOn(V, t, o) {
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y); gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
  nasDraw(ctx, t, o, gctx);
  screenSpace();
}
const nasPt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
// the middle of the lowest shelf's face on a side (section units)
function nasFace(sd, k) { const s = sd === 'L' ? -1 : 1, L = NAS_T[0], len = L.wall - NAS.sept - nasGap(L, k); return [s * (L.wall - len / 2 + 2), L.y + 5 * clamp(k) + 2]; }

// the section in a round window of radius r at (x, y), in the units of context c; k = 0..1 popped open
const NAS_MINI = 440;   // the section units that fit the window's radius
function nasMini(c, x, y, r, t, o, k = 1, ring = '#BFF0FF') {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(k, k);
  paint(() => {
    c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip();
    c.fillStyle = '#4A1840'; c.fillRect(-r, -r, 2 * r, 2 * r);
    c.scale(r / NAS_MINI, r / NAS_MINI); c.translate(0, 12);
    nasDraw(c, t, o, null);
    c.restore();
    c.beginPath(); c.arc(0, 0, r, 0, 7); c.lineWidth = r * 0.075; c.strokeStyle = ring; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 1.06, 0, 7); c.lineWidth = r * 0.025; c.strokeStyle = 'rgba(10,14,40,0.75)'; c.stroke();
  });
  c.restore();
}

// a wall clock whose hands go round (screen space). spin = hours gone by
function nasClock(x, y, r, spin, k = 1) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8);
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, r + 9, '#2A2440'); circle(c, 0, 0, r, '#FFF4DC');
  paint(() => {
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92, i % 3 ? 3 : 6, '#2A2440'); }
    const ah = spin / 12 * Math.PI * 2 - Math.PI / 2, am = spin * Math.PI * 2 - Math.PI / 2;
    line(c, 0, 0, Math.cos(ah) * r * 0.5, Math.sin(ah) * r * 0.5, 9, '#2A2440');
    line(c, 0, 0, Math.cos(am) * r * 0.76, Math.sin(am) * r * 0.76, 6, '#E2463C');
    circle(c, 0, 0, 7, '#2A2440');
  });
  c.restore();
  softDot(gctx, x, y, r * 1.6, '#FFE9B0', 0.22 * clamp(k));
}
