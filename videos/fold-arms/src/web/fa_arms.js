// Folded arms for the hiker rig, drawn in his layer's `post` in rig-local units (feet at 0, up = -y, x = screen right).
// The rig's own arms are switched off (st.noArms) and these are drawn instead:
//   f  -1 .. 0 .. 1 : folded with the SCREEN-LEFT forearm on top (-1) .. arms hanging open (0) .. the SCREEN-RIGHT
//                     forearm on top (+1). The top forearm's hand tucks under the other upper arm; the bottom forearm's
//                     hand grips the other upper arm, in front of it.
//   knot 0..1      : the pretzel (a failed fold). Above 0.5 the arms are the knot; the swap hides under smear lines.
//   wob            : fumbling (the wrists wander)
// faArms(c, A, pal, t) draws them; faArmsPts(A, t) gives the hand points (rig-local) for gags.
'use strict';

const FA_SH = { L: [-74, -370], R: [74, -370] };
// hanging close to his sides: the hands stay clear of the like/comment column at the hook's framing (13 Nov)
const FA_OPEN = { L: { e: [-98, -276], w: [-96, -188] }, R: { e: [98, -276], w: [96, -188] } };
// folded with the screen-RIGHT forearm on top (mirror x for the other way)
const FA_FOLD = {
  top: { e: [100, -280], w: [-74, -296] },      // in front, lower; its hand tucks under the other upper arm
  bot: { e: [-100, -292], w: [56, -322] },      // behind, higher; its hand grips the other upper arm (in front of it)
};
const faMix2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

function faArmGeo(A, t) {
  const f = clamp(A.f === undefined ? 1 : A.f, -1, 1), top = f >= 0 ? 1 : -1, k = Math.abs(f);
  const ke = E.inOutCubic(k), kk = clamp((k - 0.15) / 0.85);
  const sideTop = top > 0 ? 'R' : 'L', sideBot = top > 0 ? 'L' : 'R';
  const mir = (p) => [p[0] * top, p[1]];
  const G = {};
  for (const sd of ['L', 'R']) {
    const isTop = sd === sideTop, fold = isTop ? FA_FOLD.top : FA_FOLD.bot;
    // the wrist travels on a little arc (out and up first, then across), so arms never pass through each other flat
    const e = faMix2(FA_OPEN[sd].e, mir(fold.e), ke);
    const w0 = FA_OPEN[sd].w, w1 = mir(fold.w);
    const w = faMix2(w0, w1, E.inOutCubic(kk));
    w[1] -= 34 * Math.sin(Math.PI * kk) * (isTop ? 0.6 : 1.0);
    const wob = A.wob || 0;
    if (wob > 0) {
      const ph = sd === 'L' ? 0 : 2.1;
      w[0] += wob * 22 * Math.sin(t * 13.1 + ph) + wob * 9 * Math.sin(t * 31 + ph * 3);
      w[1] += wob * 16 * Math.sin(t * 11.3 + ph * 1.7);
      e[0] += wob * 8 * Math.sin(t * 9.7 + ph);
    }
    G[sd] = { sh: FA_SH[sd], e, w, isTop };
  }
  G.top = top; G.k = k; G.sideTop = sideTop; G.sideBot = sideBot;
  return G;
}

// one sleeve: an edge in the shade colour, the coat on top (so two sleeves of one colour never merge)
function faSleeve(c, a, b, w, pal) {
  line(c, a[0], a[1], b[0], b[1], w + 7, pal.coatSh);
  line(c, a[0], a[1], b[0], b[1], w, pal.coat);
}
function faCuff(c, e, w, pal) {
  const L = Math.hypot(w[0] - e[0], w[1] - e[1]) || 1, ux = (w[0] - e[0]) / L, uy = (w[1] - e[1]) / L;
  line(c, w[0] - ux * 7, w[1] - uy * 7, w[0] + ux * 2, w[1] + uy * 2, 45, pal.coatSh);
  return [ux, uy];
}
// a hand hanging or reaching (a soft fist with a thumb)
function faFist(c, p, d, pal, side) {
  const hx = p[0] + d[0] * 14, hy = p[1] + d[1] * 14;
  circle(c, hx, hy, 21, pal.skin);
  paint(() => {
    for (let i = -1; i <= 1; i++) line(c, hx - d[1] * 6 * i + d[0] * 8, hy + d[0] * 6 * i + d[1] * 8, hx - d[1] * 6 * i + d[0] * 15, hy + d[0] * 6 * i + d[1] * 15, 2.2, rgba(pal.skinSh, 0.8));
  });
  circle(c, hx - side * 15 * Math.abs(d[1]) - d[0] * 4, hy - 9, 7.5, pal.skin);
}
// the bottom arm's hand, gripping the other upper arm from the front: four fingers wrapped over the sleeve
function faGrip(c, at, dir, pal) {
  const [x, y] = at, sx = dir;                          // dir: +1 = the fingers point screen-right
  c.save(); c.translate(x, y);
  rrect(c, -20, -18, 40, 36, 15); c.fillStyle = pal.skin; c.fill();
  // the fingers, curling round the arm's outer side
  for (let i = 0; i < 4; i++) {
    const fy = -15 + i * 10;
    rrect(c, sx > 0 ? 6 : -30, fy - 4.5, 24, 9.5, 4.7); c.fillStyle = pal.skin; c.fill();
  }
  paint(() => {
    for (let i = 1; i < 4; i++) { const fy = -15 + i * 10 - 5; line(c, sx > 0 ? 8 : -28, fy, sx > 0 ? 28 : -8, fy, 2, rgba(pal.skinSh, 0.85)); }
    line(c, sx > 0 ? -12 : 12, -10, sx > 0 ? -2 : 2, 8, 2.2, rgba(pal.skinSh, 0.6));     // the thumb's crease
  });
  c.restore();
}
// fingertips peeking out behind an upper arm (the tucked hand)
function faPeek(c, at, dir, pal) {
  for (let i = 0; i < 3; i++) ellipse(c, at[0] + dir * (6 + 3 * (i % 2)), at[1] - 9 + i * 9, 9, 5.5, pal.skin);
}

// the folded / open arms (not the knot)
function faArmsPlain(c, G, pal, t, A) {
  const L = G.L, R = G.R, k = G.k;
  if (k < 0.5) {
    // still open: each arm whole, side by side
    for (const [sd, s] of [['L', -1], ['R', 1]]) {
      const a = G[sd];
      faSleeve(c, a.sh, a.e, 42, pal);
      faSleeve(c, a.e, a.w, 38, pal);
      const d = faCuff(c, a.e, a.w, pal);
      faFist(c, a.w, d, pal, s);
    }
    return;
  }
  const T = G[G.sideTop], B = G[G.sideBot], top = G.top;
  const grip = k > 0.82, tuck = k > 0.7;
  // 1. the top arm's upper arm
  faSleeve(c, T.sh, T.e, 42, pal);
  // 2. the bottom forearm (behind), ending at the other upper arm
  faSleeve(c, B.e, B.w, 38, pal);
  const db = faCuff(c, B.e, B.w, pal);
  // 3. its hand: grips the top arm's upper arm in front of it, or still a fist on its way
  if (grip) faGrip(c, [B.w[0] + db[0] * 20, B.w[1] + db[1] * 20 - 2], top, pal);
  else faFist(c, B.w, db, pal, -top);
  // 4. the fingertips of the tucked hand, peeking out behind the bottom arm's upper arm
  if (tuck) faPeek(c, [T.w[0] - top * 50, T.w[1] - 4], -top, pal);
  // 5. the top forearm (in front)
  faSleeve(c, T.e, T.w, 38, pal);
  const dt = faCuff(c, T.e, T.w, pal);
  if (!tuck) faFist(c, T.w, dt, pal, top);
  // 6. the bottom arm's upper arm, over the tucked hand
  faSleeve(c, B.sh, B.e, 42, pal);
  // the elbow points: a little crease where each sleeve bends
  paint(() => {
    for (const a of [T, B]) {
      const ex = a.e[0], ey = a.e[1];
      line(c, ex - 8, ey - 2, ex + 8, ey + 4, 3, rgba(pal.coatSh, 0.9));
    }
  });
}

// ---------------------------------------------------------------- the pretzel
// Two arms tied in a knot in front of his chest. `tw` 0..1 = how tight (it wobbles while he strains). `big` = the
// super-pretzel of the button (one more loop).
function faKnotPaths(A, t) {
  const tw = A.tw === undefined ? 1 : A.tw, big = A.big || 0, j = (A.strain || 0) * 3 * Math.sin(t * 37);
  const sL = FA_SH.L, sR = FA_SH.R;
  // arm 1 (screen-left shoulder): elbow out wide, the forearm climbs across to the right, the hand up by his chin
  // (13 Nov: the elbows pulled in from -138/+124, so the knot is no wider than the fold and fits the Shorts safe area)
  const a1 = [sL, [-112, -298 + j], [-50, -300], [10, -326], [40, -372], [26, -412 - 10 * big]];
  // arm 2 (screen-right shoulder): elbow low, the forearm runs left under arm 1, curls up round it and back over it
  const a2 = [sR, [104, -262 - j], [36, -272], [-34, -284], [-74, -320], [-56, -362], [-6, -356], [48, -338 - 6 * big]];
  if (big) {
    // the super-pretzel: one more loop on arm 1
    a1.splice(4, 0, [62, -350], [76, -392], [36, -404]);
  }
  return { a1, a2, tw };
}
function faSmooth(P, n = 6) {
  // Catmull-Rom through P, n points a span
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let s = 0; s < n; s++) {
      const u = s / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
function faTube(c, P, i0, i1, w, pal) {
  const Q = P.slice(Math.max(0, i0), Math.min(P.length, i1 + 1));
  if (Q.length < 2) return;
  poly(c, Q, w + 7, pal.coatSh);
  poly(c, Q, w, pal.coat);
}
function faArmsKnot(c, A, pal, t) {
  const K = faKnotPaths(A, t), P1 = faSmooth(K.a1, 7), P2 = faSmooth(K.a2, 7);
  const n2 = P2.length, n1 = P1.length;
  // arm 2 up to the top of its curl, then arm 1 whole, then the rest of arm 2 over it
  const cut = Math.floor(n2 * 0.66);
  faTube(c, P2, 0, cut, 40, pal);
  faTube(c, P1, 0, n1 - 1, 40, pal);
  const e1 = P1[n1 - 1], p1 = P1[n1 - 3];
  const d1 = [(e1[0] - p1[0]) / (Math.hypot(e1[0] - p1[0], e1[1] - p1[1]) || 1), (e1[1] - p1[1]) / (Math.hypot(e1[0] - p1[0], e1[1] - p1[1]) || 1)];
  line(c, e1[0] - d1[0] * 7, e1[1] - d1[1] * 7, e1[0] + d1[0] * 2, e1[1] + d1[1] * 2, 46, pal.coatSh);
  faFist(c, e1, d1, pal, -1);
  faTube(c, P2, cut - 1, n2 - 1, 40, pal);
  const e2 = P2[n2 - 1], p2 = P2[n2 - 3];
  const L2 = Math.hypot(e2[0] - p2[0], e2[1] - p2[1]) || 1, d2 = [(e2[0] - p2[0]) / L2, (e2[1] - p2[1]) / L2];
  line(c, e2[0] - d2[0] * 7, e2[1] - d2[1] * 7, e2[0] + d2[0] * 2, e2[1] + d2[1] * 2, 46, pal.coatSh);
  faFist(c, e2, d2, pal, 1);
  return { hand1: [e1[0] + d1[0] * 14, e1[1] + d1[1] * 14], hand2: [e2[0] + d2[0] * 14, e2[1] + d2[1] * 14] };
}

// the knot and the plain arms; between them (knot 0.35..0.65) smear arcs hide the swap
function faArms(c, A, pal, t) {
  const kn = clamp(A.knot || 0);
  let out = null;
  if (kn >= 0.5) out = faArmsKnot(c, A, pal, t);
  else faArmsPlain(c, faArmGeo(A, t), pal, t, A);
  const sm = 1 - Math.abs(kn - 0.5) / 0.18;
  if (sm > 0) {
    paint(() => {
      c.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const r = 120 + i * 18, a0 = -2.6 + i * 0.5 + kn * 3;
        c.beginPath(); c.arc(0, -318, r, a0, a0 + 1.1);
        c.lineWidth = 7; c.strokeStyle = rgba('#FFFFFF', 0.85 * clamp(sm)); c.stroke();
      }
    });
  }
  return out;
}

// the whole thing in his layer: call from charLayer's post. Returns the hand points (rig-local) when knotted.
function faArmsPost(lc, s2, A, pal, t) {
  lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
  const out = faArms(lc, A, pal, t);
  lc.restore();
  return out;
}
