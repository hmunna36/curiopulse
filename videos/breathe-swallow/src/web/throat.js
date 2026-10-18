// Why Can't You Breathe and SWALLOW at the Same Time? Short: his head and throat from the side, as glass, nose to the
// right. World units at zoom 1 (the shots move the camera with camKeys). The air's road comes in at the nostril, runs
// back over the roof of the mouth and down; the spit's road runs over the tongue and down; the two share ONE tunnel
// (the throat) and part again below it: the windpipe in front (right, under the voice box and the lid), the food pipe
// behind (left). Nothing here is timed: the shots pass every state in o.
//   swSection(t, o)          the whole cutaway (see the options there)
//   swPuff, swSpit, swDrop   the characters: a puff of air, the spit, a drop of water
//   swBrain                  the brain with its PAUSE button
//   swAt(path, u)            a point (and direction) at fraction u of a road: SW_AIR, SW_SPIT, SW_FOOD, SW_WIND
'use strict';

const SWC = { air: '#7FE9FF', spit: '#C8A8FF', yel: '#FFD447', pink: '#FF86A6', red: '#FF5A6E', glass: '#0E1A3E', rim: '#9FE6FF' };
const SW = {
  nost: [905, 772], mouth: [884, 900],
  junction: [556, 840],            // where the nose road turns down into the tunnel
  split: [575, 1150],              // where the tunnel parts: the windpipe in front, the food pipe behind
  hinge: [648, 1112],              // the lid's hinge, at the root of the tongue
  vbox: [636, 1218],               // the voice box (middle), at the top of the windpipe
  apple: [748, 1214],              // the bump on the front of his neck
  brain: [505, 455],
};
function swDense(P, n = 10) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
function swRoad(P) { const pts = swDense(P, 10); return { pts, acc: polyLen(pts) }; }
// the roads (centre lines). AIR: nostril -> back of the nose -> the tunnel -> the windpipe. SPIT: lips -> over the tongue
// -> the tunnel -> the food pipe. WIND / FOOD: just the two pipes below the split.
const SW_AIR = swRoad([[940, 776], [880, 772], [760, 768], [640, 770], [575, 800], [548, 870], [550, 980], [566, 1080], [610, 1160], [632, 1240], [634, 1420], [634, 1900]]);
const SW_SPIT = swRoad([[860, 896], [790, 872], [700, 880], [630, 920], [585, 980], [560, 1060], [540, 1150], [528, 1240], [526, 1420], [526, 1900]]);
const SW_WIND = swRoad([[600, 1120], [628, 1200], [634, 1300], [634, 1900]]);
const SW_FOOD = swRoad([[550, 1100], [530, 1200], [526, 1300], [526, 1900]]);
function swAt(R, u) { return polyAt(R.pts, R.acc, clamp(u) * R.acc[R.acc.length - 1]); }

// ---------------------------------------------------------------- the characters
// a puff of air with a face. mood: calm | wait | hey | frozen | happy | oof
function swPuff(c, x, y, s, t, mood = 'calm', o = {}) {
  const fz = mood === 'frozen', col = fz ? '#B9C6D8' : SWC.air;
  const wob = fz ? 0 : Math.sin(t * 9 + (o.ph || 0)) * 0.05;
  c.save(); c.translate(x, y); c.scale(s * (1 + wob), s * (1 - wob)); c.rotate(o.rot || 0);
  for (const [px, py, r] of [[-17, 4, 16], [0, -8, 19], [17, 3, 15], [0, 8, 17]]) circle(c, px, py, r, col);
  if (!fz) circle(gctx, x / 1, y / 1, 0, col);
  paint(() => {
    const ey = -2, ex = 8;
    if (mood === 'hey') {
      for (const sd of [-1, 1]) { line(c, sd * ex - 6 * sd, ey - 9, sd * ex + 5 * sd, ey - 5, 2.6, '#10304A'); circle(c, sd * ex, ey, 3, '#10304A'); }
      ellipse(c, 0, 10, 6, 5, '#10304A');
    } else if (mood === 'wait') {
      for (const sd of [-1, 1]) line(c, sd * ex - 4, ey, sd * ex + 4, ey, 2.6, '#10304A');
      line(c, -5, 10, 5, 10, 2.4, '#10304A');
    } else if (mood === 'frozen') {
      for (const sd of [-1, 1]) circle(c, sd * ex, ey, 2.6, '#3A4A60');
      line(c, -5, 10, 5, 10, 2.2, '#3A4A60');
    } else if (mood === 'oof') {
      for (const sd of [-1, 1]) { line(c, sd * ex - 4, ey - 4, sd * ex + 4, ey + 4, 2.4, '#10304A'); line(c, sd * ex - 4, ey + 4, sd * ex + 4, ey - 4, 2.4, '#10304A'); }
      ellipse(c, 0, 11, 5, 4, '#10304A');
    } else {
      for (const sd of [-1, 1]) circle(c, sd * ex, ey, 3, '#10304A');
      c.beginPath(); c.arc(0, 6, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 2.4; c.strokeStyle = '#10304A'; c.stroke();
    }
    ellipse(c, -9, -12, 5, 3, 'rgba(255,255,255,0.7)', -0.4);
  });
  c.restore();
  if (!fz && (o.glow === undefined || o.glow)) softDot(gctx, x, y, 34 * s, SWC.air, 0.35);
}
// the spit: a glossy violet drop with a cheeky face. mood: grin | whee | smug
function swSpit(c, x, y, s, t, mood = 'grin', o = {}) {
  const sq = o.squash || 0, rot = o.rot || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * (1 + 0.25 * sq), s * (1 - 0.25 * sq));
  c.beginPath(); c.moveTo(0, -30); c.bezierCurveTo(12, -14, 24, 0, 22, 12); c.bezierCurveTo(20, 26, -20, 26, -22, 12); c.bezierCurveTo(-24, 0, -12, -14, 0, -30); c.closePath();
  c.fillStyle = SWC.spit; c.fill();
  paint(() => {
    ellipse(c, -8, -4, 4, 7, 'rgba(255,255,255,0.75)', 0.3);
    for (const sd of [-1, 1]) { circle(c, sd * 7, 6, 3.2, '#2B1440'); }
    if (mood === 'whee') { ellipse(c, 0, 16, 6, 5, '#2B1440'); }
    else if (mood === 'smug') { line(c, -12, 1, -3, 3, 2.2, '#2B1440'); line(c, 12, 1, 3, 3, 2.2, '#2B1440'); c.beginPath(); c.arc(1, 13, 6, 0.1 * Math.PI, 0.7 * Math.PI); c.lineWidth = 2.4; c.strokeStyle = '#2B1440'; c.stroke(); }
    else { c.beginPath(); c.arc(0, 13, 7, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 2.6; c.strokeStyle = '#2B1440'; c.stroke(); }
  });
  c.restore();
}
// a drop of water: a blue drop with a sneaky face. mood: sneak | oops
function swDrop(c, x, y, s, t, mood = 'sneak', rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, -26); c.bezierCurveTo(10, -12, 20, 0, 18, 10); c.bezierCurveTo(16, 22, -16, 22, -18, 10); c.bezierCurveTo(-20, 0, -10, -12, 0, -26); c.closePath();
  c.fillStyle = '#3FA9F5'; c.fill();
  paint(() => {
    ellipse(c, -6, -3, 3, 6, 'rgba(255,255,255,0.8)', 0.3);
    if (mood === 'oops') { for (const sd of [-1, 1]) circle(c, sd * 6, 5, 3.4, '#0B2440'); ellipse(c, 0, 14, 4, 4, '#0B2440'); }
    else { for (const sd of [-1, 1]) line(c, sd * 6 - 3, 5, sd * 6 + 3, 4, 2.4, '#0B2440'); c.beginPath(); c.arc(2, 11, 5, 0.1 * Math.PI, 0.7 * Math.PI); c.lineWidth = 2.2; c.strokeStyle = '#0B2440'; c.stroke(); }
  });
  c.restore();
}

// ---------------------------------------------------------------- the brain with a PAUSE button
// o: {mood: calm | press | proud, press 0..1 (its hand on the button), lit 0..1 (the button glows)}
function swBrain(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the brain: lobes as overlapping puffs
  for (const [px, py, r] of [[-70, 4, 52], [-24, -22, 60], [34, -18, 58], [76, 10, 46], [20, 30, 50], [-40, 34, 46]]) circle(c, px, py, r, '#F7A6C2');
  paint(() => {
    c.lineWidth = 4; c.strokeStyle = 'rgba(176,64,110,0.55)'; c.lineCap = 'round';
    for (const [a, b, d, e] of [[-96, -6, -60, -30], [-50, -40, -14, -8], [10, -46, 40, -10], [60, -24, 96, 6], [-60, 30, -20, 50], [10, 30, 60, 44]]) { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo((a + d) / 2 + 12, (b + e) / 2 - 14, d, e); c.stroke(); }
    // the face
    const md = o.mood || 'calm';
    for (const sd of [-1, 1]) { circle(c, sd * 26, 4, 12, '#FFFFFF'); circle(c, sd * 26 + 3, 6, 6, '#2B1440'); }
    if (md === 'press') { line(c, -40, -14, -14, -10, 4, '#7A2850'); line(c, 40, -14, 14, -10, 4, '#7A2850'); line(c, -10, 32, 10, 32, 4, '#7A2850'); }
    else if (md === 'proud') { c.beginPath(); c.arc(0, 26, 12, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 4; c.strokeStyle = '#7A2850'; c.stroke(); }
    else { c.beginPath(); c.arc(0, 28, 9, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 4; c.strokeStyle = '#7A2850'; c.stroke(); }
  });
  // the button on a little stand, its arm reaching down to it
  const pr = clamp(o.press || 0), lit = clamp(o.lit || 0);
  const B = [128, 64 + 6 * pr];
  line(c, 70, 34, lerp(96, B[0] - 8, pr), lerp(70, B[1] - 26, pr), 10, '#F7A6C2');
  rrect(c, 96, 78, 68, 26, 6); c.fillStyle = '#2B3350'; c.fill();
  circle(c, B[0] + 2, B[1] + 6, 26, lit > 0.5 ? '#FF5A6E' : '#C93A4C');
  paint(() => { for (const sd of [-1, 1]) { rrect(c, B[0] + 2 + sd * 8 - 4, B[1] + 6 - 11, 8, 22, 2); c.fillStyle = '#FFFFFF'; c.fill(); } });
  c.restore();
  if (lit > 0.01) softDot(gctx, x + (B[0] + 2) * s, y + (B[1] + 6) * s, 70 * s, '#FF5A6E', 0.8 * lit);
}

// ---------------------------------------------------------------- the cutaway
// o: {lift 0..1 (voice box up and forward), lid 0..1 (0 = standing up open, 1 = folded down over the windpipe),
//     palate 0..1 (the soft palate up, closing the nose off), air, spit, tunnel 0..1 (roads lit), split 0..1 (the two
//     pipes lit apart), vbGlow 0..1, lidGlow 0..1, lidFace (calm | sleepy | shock | proud), puffs: [{u, mood, s, path}],
//     spitAt: {u, mood, path, s} | null, dropAt: {u, path, mood} | null, brain {...} | null, alarm 0..1 (the windpipe
//     flashes red), wind 0..1 (the windpipe bulges with a cough), food 0..1 (the food pipe bulges round the spit)}
function swSection(t, o = {}) {
  const c = ctx, lift = clamp(o.lift || 0), lidK = clamp(o.lid || 0), pal = clamp(o.palate || 0);
  const up = [16 * lift, -58 * lift];                                  // how far the voice box hops (and what rides with it)
  // ---- the glass head and neck (one outline: stroke, then fill)
  const head = () => {
    c.beginPath();
    c.moveTo(330, 1000);
    c.bezierCurveTo(220, 900, 180, 700, 230, 540);
    c.bezierCurveTo(290, 330, 470, 250, 620, 268);
    c.bezierCurveTo(770, 288, 860, 400, 866, 560);              // the forehead
    c.bezierCurveTo(868, 600, 880, 640, 900, 680);              // the brow, the bridge of the nose
    c.bezierCurveTo(930, 720, 958, 752, 944, 778);              // the nose's tip
    c.bezierCurveTo(930, 800, 900, 800, 888, 812);              // under the nose
    c.bezierCurveTo(904, 840, 908, 870, 896, 900);              // the lips
    c.bezierCurveTo(906, 930, 898, 960, 880, 990);              // the chin
    c.bezierCurveTo(856, 1040, 790, 1060, 752, 1080);           // under the chin
    c.bezierCurveTo(746 + up[0] * 0.3, 1150, SW.apple[0] + 12 + up[0], SW.apple[1] - 30 + up[1], SW.apple[0] + 14 + up[0], SW.apple[1] + up[1]);   // the bump
    c.bezierCurveTo(SW.apple[0] + 12 + up[0], SW.apple[1] + 30 + up[1], 744, 1300, 744, 1360);
    c.lineTo(744, 2100); c.lineTo(390, 2100); c.lineTo(400, 1300);
    c.bezierCurveTo(404, 1160, 380, 1060, 330, 1000);
    c.closePath();
  };
  head(); c.lineWidth = 10; c.strokeStyle = SWC.rim; c.stroke();
  head(); c.fillStyle = SWC.glass; c.fill();
  paint(() => {
    // his hair, his eye and his ear: who this is
    c.save(); head(); c.clip();
    c.fillStyle = '#2A1B14';
    c.beginPath(); c.moveTo(210, 640); c.bezierCurveTo(210, 380, 420, 230, 640, 262); c.bezierCurveTo(780, 280, 860, 380, 872, 500);
    c.bezierCurveTo(820, 430, 760, 400, 690, 410); c.bezierCurveTo(600, 360, 470, 380, 400, 440); c.bezierCurveTo(330, 500, 300, 600, 300, 700); c.closePath(); c.fill();
    c.restore();
    ellipse(c, 812, 600, 22, 26, '#FFFFFF'); circle(c, 824, 604, 11, '#15132A'); circle(c, 828, 598, 4, '#FFFFFF');
    line(c, 780, 556, 846, 546, 7, '#2A1B14');
    ellipse(c, 430, 640, 34, 52, 'rgba(242,184,146,0.55)');
  });
  // ---- the brain (top of the head)
  if (o.brain) actor(() => swBrain(c, SW.brain[0], SW.brain[1], 1.0, t, o.brain));
  // ---- the inside: soft walls (pink), the roads as lit tubes
  const tube = (R, w, col, a = 1) => { paint(() => { poly(c, R.pts, w, rgba(col, a)); }); };
  // the roof of the mouth / floor of the nose (a firm band), the tongue, the throat's walls
  paint(() => {
    // the nose passage
    poly(c, swDense([[905, 772], [780, 768], [650, 770], [585, 798], [556, 850]], 8), 52, '#3B2346');
    // the mouth cavity
    poly(c, swDense([[880, 896], [790, 884], [690, 892], [620, 930]], 8), 58, '#3B2346');
    // the tunnel (throat), then the two pipes
    poly(c, swDense([[562, 820], [550, 900], [552, 1000], [566, 1090], [582, 1140]], 8), 104, '#7A3E62');
    poly(c, swDense([[562, 820], [550, 900], [552, 1000], [566, 1090], [582, 1140]], 8), 88, '#3B2346');
    poly(c, swDense([[548, 1110], [530, 1220], [526, 1400], [526, 2100]], 8), 46 + 30 * clamp(o.food || 0), '#33203E');
    poly(c, swDense([[612, 1150], [630, 1230], [634, 1400], [634, 2100]], 8), 64 + 22 * clamp(o.wind || 0), '#26314F');
  });
  // windpipe rings (below the voice box)
  paint(() => { for (let y = 1320; y < 2080; y += 34) { c.beginPath(); c.ellipse(634, y, 36 + 10 * clamp(o.wind || 0), 9, 0, 0, Math.PI); c.lineWidth = 6; c.strokeStyle = 'rgba(160,190,230,0.55)'; c.stroke(); } });
  // the hard palate band and the tongue (the floor of the mouth)
  paint(() => {
    c.fillStyle = '#E88AA0';
    c.beginPath(); c.moveTo(880, 812); c.lineTo(640, 812); c.quadraticCurveTo(610, 814, 600, 826); c.lineTo(600, 846); c.lineTo(880, 846); c.closePath(); c.fill();
  });
  // the tongue: a mound from the lips back, its root curving down to the lid's hinge
  c.fillStyle = '#E0616C';
  c.beginPath(); c.moveTo(872, 930); c.bezierCurveTo(820, 900, 720, 896, 650, 930); c.bezierCurveTo(618, 960, 612, 1040, 640, 1100); c.lineTo(700, 1110); c.bezierCurveTo(760, 1040, 830, 990, 872, 960); c.closePath(); c.fill();
  // the soft palate: hangs from the back of the roof; swings up and back to shut the nose off
  { const a0 = 1.95, a1 = 3.1, a = lerp(a0, a1, E.inOutCubic(pal)), H0 = [606, 834];
    c.save(); c.translate(H0[0], H0[1]); c.rotate(a);
    c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(60, -16, 78, 0); c.quadraticCurveTo(60, 16, 0, 12); c.closePath(); c.fillStyle = '#F29AB0'; c.fill();
    c.restore(); }
  // the voice box: a ring of cartilage at the top of the windpipe, with two little doors inside; hops up and forward
  { const V = [SW.vbox[0] + up[0], SW.vbox[1] + up[1]], g = clamp(o.vbGlow || 0);
    rrect(c, V[0] - 50, V[1] - 44, 100, 88, 22); c.fillStyle = '#E8A65A'; c.fill();
    paint(() => {
      rrect(c, V[0] - 34, V[1] - 30, 68, 60, 16); c.fillStyle = '#26314F'; c.fill();
      const sh = clamp((o.doors === undefined ? lidK : o.doors));
      for (const sd of [-1, 1]) { c.save(); c.translate(V[0] + sd * 30, V[1]); c.rotate(sd * (Math.PI / 2) * (1 - sh) * 0.7); rrect(c, sd > 0 ? -30 : 0, -5, 30, 10, 4); c.fillStyle = '#F7D9A8'; c.fill(); c.restore(); }
      if (g > 0.01) { c.beginPath(); c.roundRect ? c.roundRect(V[0] - 54, V[1] - 48, 108, 96, 24) : rrect(c, V[0] - 54, V[1] - 48, 108, 96, 24); c.lineWidth = 7; c.strokeStyle = rgba(SWC.yel, g); c.stroke(); }
    });
    if (g > 0.01) softDot(gctx, V[0], V[1], 120, SWC.yel, 0.55 * g);
  }
  // the roads lit: air (cyan), spit (violet), the shared tunnel (yellow)
  const ga = clamp(o.air || 0), gs = clamp(o.spit || 0), gt = clamp(o.tunnel || 0), gp = clamp(o.split || 0);
  const dash = (R, a0, a1, col, k, w = 10) => {
    if (k <= 0.01) return;
    const L = R.acc[R.acc.length - 1], P = [];
    for (let s = a0 * L; s <= a1 * L * Math.min(1, k * 1.2 + 0.001); s += 6) { const p = polyAt(R.pts, R.acc, s); P.push([p[0], p[1]]); }
    if (P.length < 2) return;
    paint(() => { c.setLineDash([22, 16]); c.lineDashOffset = -t * 90; poly(c, P, w, rgba(col, 0.95)); c.setLineDash([]); });
    gctx.save(); gctx.setLineDash([22, 16]); gctx.lineDashOffset = -t * 90; poly(gctx, P, w * 2, rgba(col, 0.5 * k)); gctx.setLineDash([]); gctx.restore();
  };
  dash(SW_AIR, 0.0, 0.32, SWC.air, ga);
  dash(SW_SPIT, 0.0, 0.3, SWC.spit, gs);
  if (gt > 0.01) {
    const P = swDense([[560, 830], [548, 900], [550, 1000], [566, 1090], [584, 1138]], 8);
    paint(() => { poly(c, P, 74, rgba(SWC.yel, 0.28 * gt)); });
    poly(gctx, P, 90, rgba(SWC.yel, 0.35 * gt));
  }
  dash(SW_WIND, 0.0, 0.5, SWC.air, gp, 9);
  dash(SW_FOOD, 0.0, 0.5, SWC.spit, gp, 9);
  // the alarm: the windpipe flashes red (something got in)
  const al = clamp(o.alarm || 0);
  if (al > 0.01) { const P = swDense([[612, 1150], [630, 1230], [634, 1400], [634, 1700]], 8); paint(() => poly(c, P, 70, rgba(SWC.red, 0.45 * al))); poly(gctx, P, 90, rgba(SWC.red, 0.5 * al)); }
  // ---- the characters on the roads
  for (const p of o.puffs || []) {
    const R = p.path || SW_AIR, A = swAt(R, p.u);
    actor(() => swPuff(c, A[0] + (p.dx || 0), A[1] + (p.dy || 0), p.s || 1.15, t, p.mood || 'calm', { ph: p.ph || 0 }));
  }
  if (o.spitAt) { const R = o.spitAt.path || SW_SPIT, A = swAt(R, o.spitAt.u); actor(() => swSpit(c, A[0], A[1] - 6, o.spitAt.s || 1.35, t, o.spitAt.mood || 'grin', { rot: (o.spitAt.rot || 0), squash: o.spitAt.squash || 0 })); }
  if (o.dropAt) { const R = o.dropAt.path || SW_SPIT, A = swAt(R, o.dropAt.u); actor(() => swDrop(c, A[0] + (o.dropAt.dx || 0), A[1], (o.dropAt.s || 1.3) * 1.3, t, o.dropAt.mood || 'sneak', o.dropAt.rot || 0)); }
  // ---- the lid (drawn last: it lies over the windpipe's door). Hinged at the root of the tongue; open = standing up
  // and back, shut = folded down over the door of the windpipe (which has come up under it)
  { const Hh = [SW.hinge[0] + up[0] * 0.3, SW.hinge[1] + up[1] * 0.3], aOpen = -1.62, aShut = -3.55;
    const a = lerp(aOpen, aShut, lidK), L = 138, g = clamp(o.lidGlow || 0);
    c.save(); c.translate(Hh[0], Hh[1]); c.rotate(a);
    c.beginPath(); c.moveTo(0, -16); c.bezierCurveTo(50, -40, 116, -34, L, 0); c.bezierCurveTo(116, 34, 50, 40, 0, 16); c.closePath();
    c.fillStyle = '#FF9BB4'; c.fill();
    c.lineWidth = 5; c.strokeStyle = '#B0406E'; c.stroke();
    paint(() => {
      if (g > 0.01) { c.lineWidth = 7; c.strokeStyle = rgba(SWC.yel, g); c.stroke(); }
      // its face, upright whichever way it lies
      const F = [86, 0];
      c.save(); c.translate(F[0], F[1]); c.rotate(-a); c.scale(1.35, 1.35);
      const md = o.lidFace || 'calm', ey = -4;
      if (md === 'sleepy') { for (const sd of [-1, 1]) line(c, sd * 9 - 5, ey, sd * 9 + 5, ey + 1, 3, '#7A2850'); line(c, -4, 10, 4, 10, 3, '#7A2850'); }
      else if (md === 'shock') { for (const sd of [-1, 1]) { circle(c, sd * 9, ey, 6, '#FFFFFF'); circle(c, sd * 9, ey, 3, '#2B1440'); } ellipse(c, 0, 12, 5, 6, '#7A2850'); }
      else if (md === 'proud') { for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 9, ey + 2, 5, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 3; c.strokeStyle = '#7A2850'; c.stroke(); } c.beginPath(); c.arc(0, 8, 7, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 3; c.strokeStyle = '#7A2850'; c.stroke(); }
      else { for (const sd of [-1, 1]) { circle(c, sd * 9, ey, 5, '#FFFFFF'); circle(c, sd * 9, ey + 1, 2.6, '#2B1440'); } c.beginPath(); c.arc(0, 8, 5, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 3; c.strokeStyle = '#7A2850'; c.stroke(); }
      c.restore();
    });
    c.restore();
    if (g > 0.01) softDot(gctx, Hh[0] + Math.cos(a) * 60, Hh[1] + Math.sin(a) * 60, 110, SWC.yel, 0.45 * g);
  }
  return { vbox: [SW.vbox[0] + up[0], SW.vbox[1] + up[1]], apple: [SW.apple[0] + 14 + up[0], SW.apple[1] + up[1]], hinge: SW.hinge };
}
