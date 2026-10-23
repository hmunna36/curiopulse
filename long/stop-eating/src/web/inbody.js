// What Happens If You Stop Eating? (long-form): his body as a see-through diagram, drawn in "body units" (the middle of
// his belly is the origin, his head is at y -400, he faces us, so his right side is screen left). Every act's mechanism
// lives here, so the camera can travel from one part to the next as the narration names it:
//   the stomach (screen right) that squeezes the leftovers out and growls, with an alarm clock on top at mealtimes;
//   the liver (screen left) as a pantry: a cupboard of glowing sugar jars that empties over the first day;
//   the brain in his head, with a face, drinking from the liver through a straw (sugar: gold; day three: the new fuel,
//   green, made from fat);
//   his right arm raised in a fist (screen left), the muscle with its own private sugar, later "borrowed" from;
//   the fat as yellow bubbles round his belly and hips (the packed lunch), which shrink and stream to the liver;
//   the heart, beating, which shrinks when the starving body eats muscle.
// View: ibOn(V, fn) draws fn in body units with V = {x, y, s} (screen point of the origin, pixels per unit);
// ibView(F, P, s) makes the V that puts body point F at screen point P.
'use strict';

const IB = {
  head: [0, -400], brain: [0, -420], heart: [28, -160], liver: [-78, -40], stomach: [92, -40], fat: [0, 150],
  shoulder: [-160, -250], elbow: [-300, -190], fist: [-300, -366], muscle: [-230, -226], mouth: [0, -330],
};
function ibView(F, P, s) { return { x: P[0] - F[0] * s, y: P[1] - F[1] * s, s }; }
function ibMix(a, b, k) { return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)) }; }
function ibOn(V, fn) {
  ctx.save(); gctx.save();
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y); gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
  fn();
  ctx.restore(); gctx.restore();
}
function ibPt(V, p) { return [V.x + p[0] * V.s, V.y + p[1] * V.s]; }
// a dense curve through points (Catmull-Rom), for pipes and outlines
function ibDense(P, n = 10) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// the pipes (body units)
const IB_STRAW = ibDense([[-70, -96], [-40, -150], [-10, -230], [0, -300], [0, -360]], 12);       // liver -> brain
const IB_ARMPIPE = ibDense([[-232, -214], [-190, -170], [-150, -110], [-112, -70]], 12);         // muscle -> liver
const IB_FATPIPE_L = ibDense([[-120, 160], [-130, 80], [-118, 20], [-100, -10]], 12);            // fat -> liver
const IB_FATPIPE_R = ibDense([[120, 160], [60, 110], [-20, 40], [-60, 0]], 12);
// beads travelling along a pipe (k = how many, speed = pipe lengths a second)
function ibBeads(P, t, n, col, r, speed = 0.5, a = 1, seed = 0) {
  if (a <= 0.01) return;
  const acc = polyLen(P), L = acc[acc.length - 1];
  for (let i = 0; i < n; i++) {
    const u = ((t * speed + i / n + hash(i + seed) * 0.05) % 1);
    const p = polyAt(P, acc, u * L), f = Math.min(1, u * 8, (1 - u) * 8) * a;
    circle(ctx, p[0], p[1], r, rgba(col, f));
    circle(gctx, p[0], p[1], r * 2.2, rgba(col, 0.6 * f));
  }
}
function ibPipe(P, w, col, a = 1) { poly(ctx, P, w, rgba(col, 0.35 * a)); poly(ctx, P, w * 0.45, rgba(col, 0.5 * a)); }

// the outline of his body (x-ray): head, neck, torso, the left arm down, the right arm raised in a fist (o.flex 0..1
// lifts it from hanging to raised)
function ibCapsule(a, b, r) {
  const dx = b[0] - a[0], dy = b[1] - a[1], ang = Math.atan2(dy, dx);
  ctx.beginPath(); ctx.arc(a[0], a[1], r, ang + Math.PI / 2, ang - Math.PI / 2); ctx.arc(b[0], b[1], r, ang - Math.PI / 2, ang + Math.PI / 2); ctx.closePath();
}
function ibArmPts(flex) {
  const sh = IB.shoulder, el = [lerp(-205, -300, flex), lerp(-120, -190, flex)], wr = [lerp(-215, -300, flex), lerp(-10, -330, flex)];
  return { sh, el, wr, fist: [wr[0], wr[1] + lerp(30, -36, flex)] };
}
function ibSilhouette(t, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha, flex = o.flex === undefined ? 1 : o.flex;
  ctx.save(); ctx.globalAlpha = a;
  const fill = 'rgba(70,140,255,0.16)', edge = 'rgba(127,233,255,0.85)';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = edge;
  // the arms first (the torso's outline goes over their tops)
  const A = ibArmPts(flex);
  for (const [p, q, r] of [[A.sh, A.el, 44], [A.el, A.wr, 38]]) { ibCapsule(p, q, r); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(A.fist[0], A.fist[1], 48, 44, 0, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) line(ctx, A.fist[0] - 30 + i * 20, A.fist[1] - 40 * (flex > 0.5 ? 1 : -1), A.fist[0] - 30 + i * 20, A.fist[1] - 24 * (flex > 0.5 ? 1 : -1), 4, edge);
  for (const [p, q, r] of [[[165, -235], [205, -60], 42], [[205, -60], [212, 120], 36]]) { ibCapsule(p, q, r); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(214, 160, 34, 40, 0, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  // torso
  ctx.beginPath();
  ctx.moveTo(-60, -300); ctx.quadraticCurveTo(-170, -296, -182, -220); ctx.quadraticCurveTo(-158, -60, -160, 40); ctx.quadraticCurveTo(-178, 200, -130, 290);
  ctx.lineTo(130, 290); ctx.quadraticCurveTo(178, 200, 160, 40); ctx.quadraticCurveTo(158, -60, 182, -220); ctx.quadraticCurveTo(170, -296, 60, -300); ctx.closePath();
  ctx.fillStyle = 'rgba(20,40,90,0.55)'; ctx.fill(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  // legs (just their tops)
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 128, 290); ctx.lineTo(s * 132, 430); ctx.moveTo(s * 12, 300); ctx.lineTo(s * 20, 430); ctx.stroke(); }
  // neck and head
  ctx.beginPath(); ctx.moveTo(-40, -300); ctx.lineTo(-38, -322); ctx.moveTo(40, -300); ctx.lineTo(38, -322); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -410, 110, 120, 0, 0, 7); ctx.fillStyle = 'rgba(20,40,90,0.55)'; ctx.fill(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// the brain, with a face (moods: calm, sip, slurp, worry, happy, wow, sleepy), in its head; green 0..1 = on the new fuel
function ibBrain(t, o = {}) {
  const [x, y] = IB.brain, lit = o.lit === undefined ? 1 : o.lit, g = o.green || 0;
  const col = mixHex('#FF9AC0', '#9AF0C0', g), dk = mixHex('#D86A98', '#4AB888', g);
  ctx.save(); ctx.translate(x, y + 2 * Math.sin(t * 2));
  ctx.beginPath(); ctx.ellipse(0, 0, 84, 64, 0, 0, 7); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = dk;
  for (const [a, b, c2, d] of [[-60, -20, -20, -40], [-30, 10, 10, -10], [20, -40, 50, -10], [-50, 30, -10, 40], [30, 20, 60, 30], [0, -50, 0, -20]]) {
    ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2, b - 16, c2, d); ctx.stroke();
  }
  softDot(gctx, 0, 0, 150, g > 0.5 ? '#6AFFB8' : '#FF86A6', 0.35 * lit);
  // the face
  const m = o.mood || 'calm';
  for (const s of [-1, 1]) {
    const ex = s * 26, ey = 4;
    if (m === 'sleepy' || m === 'sip') { line(ctx, ex - 9, ey, ex + 9, ey, 5, '#3A1A2A'); continue; }
    ellipse(ctx, ex, ey, 12, m === 'wow' ? 15 : 12, '#FFFFFF');
    circle(ctx, ex + (o.look || 0) * 4, ey + 1, m === 'worry' ? 5 : 6, '#2A1020');
    if (m === 'worry') line(ctx, ex - s * 10, ey - 18, ex + s * 10, ey - 12, 4, '#3A1A2A');
  }
  if (m === 'happy' || m === 'wow') { ctx.beginPath(); ctx.arc(0, 26, m === 'wow' ? 10 : 14, 0, Math.PI); ctx.fillStyle = '#5A1522'; ctx.fill(); }
  else if (m === 'slurp') { ellipse(ctx, 8, 30, 9, 7, '#5A1522'); }
  else if (m === 'worry') { ctx.beginPath(); ctx.moveTo(-12, 34); ctx.quadraticCurveTo(0, 24, 12, 34); ctx.lineWidth = 4; ctx.strokeStyle = '#3A1A2A'; ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-12, 28); ctx.quadraticCurveTo(0, 34, 12, 28); ctx.lineWidth = 4; ctx.strokeStyle = '#3A1A2A'; ctx.stroke(); }
  ctx.restore();
}

// the liver as a pantry: a dark red cupboard shape with shelves; fill 0..1 = how full the jars are (one jar empties
// after another); glow on the jars; o.cook 0..1: a little stove in the pantry turning fat into green drops (day three)
function ibLiver(t, o = {}) {
  const [x, y] = IB.liver, fill = o.fill === undefined ? 1 : o.fill;
  ctx.save(); ctx.translate(x, y); ctx.scale(0.86, 0.86);
  ctx.beginPath(); ctx.moveTo(-90, -60); ctx.quadraticCurveTo(-30, -96, 80, -70); ctx.quadraticCurveTo(110, -40, 70, 10); ctx.quadraticCurveTo(10, 60, -70, 50); ctx.quadraticCurveTo(-110, 10, -90, -60); ctx.closePath();
  ctx.fillStyle = '#8A2E3A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#D85A6A'; ctx.stroke();
  // the cupboard inside: two shelves of jars
  rrect(ctx, -66, -66, 128, 100, 10); ctx.fillStyle = '#3A1218'; ctx.fill();
  line(ctx, -62, -18, 58, -18, 4, '#6A2A30'); line(ctx, -62, 30, 58, 30, 4, '#6A2A30');
  const n = 8;
  for (let i = 0; i < n; i++) {
    const row = i < 4 ? 0 : 1, col = i % 4, jx = -46 + col * 30, jy = row ? 28 : -20;
    const lev = clamp(fill * n - (n - 1 - i));          // the last jars empty first, from the top shelf down
    rrect(ctx, jx - 11, jy - 40, 22, 38, 5); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
    if (lev > 0.01) {
      rrect(ctx, jx - 9, jy - 4 - 32 * lev, 18, 32 * lev, 4); ctx.fillStyle = '#FFD447'; ctx.fill();
      softDot(gctx, jx, jy - 14, 26, '#FFD447', 0.5 * lev * (o.glow === undefined ? 1 : o.glow));
    }
    rrect(ctx, jx - 12, jy - 44, 24, 7, 3); ctx.fillStyle = '#E8B860'; ctx.fill();
  }
  if ((o.cook || 0) > 0.01) {   // the little fuel still: a green drop forming under a spout
    const k = o.cook, d = ((t * 1.3) % 1);
    rrect(ctx, 20, 40, 40, 30, 6); ctx.fillStyle = '#4A5A50'; ctx.fill();
    circle(ctx, 40, 76 + 30 * d, 7 * k, `rgba(110,255,180,${k * (1 - d * 0.5)})`);
    softDot(gctx, 40, 76 + 30 * d, 20, '#6AFFB8', 0.7 * k);
  }
  ctx.restore();
}

// the stomach (screen right): an outline that squeezes (wave 0..1 travels from top to bottom), crumbs swept along,
// growl rings; o.glow; o.empty (no food inside)
function ibStomach(t, o = {}) {
  const [x, y] = IB.stomach;
  ctx.save(); ctx.translate(x, y); ctx.scale(0.78, 0.78);
  const wv = o.wave === undefined ? -1 : o.wave;
  const pinch = (u) => wv < 0 ? 1 : 1 - 0.42 * Math.exp(-Math.pow((u - wv) * 6, 2));
  // a J-shaped bag described by its centreline and widths
  const C = ibDense([[30, -110], [60, -80], [64, -10], [30, 50], [-30, 60], [-70, 40]], 10);
  const Wd = (u) => (u < 0.15 ? 28 + 120 * u : u < 0.7 ? 46 : 46 - 40 * (u - 0.7)) * pinch(u);
  const acc = polyLen(C), L = acc[acc.length - 1];
  const left = [], right = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, p = polyAt(C, acc, u * L), nx = -Math.sin(p[2]), ny = Math.cos(p[2]), w = Wd(u);
    left.push([p[0] + nx * w, p[1] + ny * w]); right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]); for (const p of left) ctx.lineTo(p[0], p[1]); for (const p of right.reverse()) ctx.lineTo(p[0], p[1]); ctx.closePath();
  ctx.fillStyle = 'rgba(255,140,170,0.55)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#FF86A6'; ctx.stroke();
  if ((o.glow || 0) > 0.01) softDot(gctx, 20, -10, 130, '#FF86A6', 0.3 * o.glow);
  // crumbs swept ahead of the squeeze
  if (wv >= 0) for (let i = 0; i < 7; i++) {
    const u = clamp(wv + 0.06 + i * 0.025), p = polyAt(C, acc, u * L);
    circle(ctx, p[0] + 10 * (hash(i) - 0.5), p[1] + 10 * (hash(i + 3) - 0.5), 5 + 3 * hash(i + 7), '#E8B860');
  }
  // the gullet coming in
  line(ctx, 30, -110, 10, -260, 14, 'rgba(255,140,170,0.5)');
  ctx.restore();
  // growl rings and the word
  if ((o.growl || 0) > 0.01) {
    for (let i = 0; i < 3; i++) {
      const u = ((t * 1.2 + i / 3) % 1);
      ctx.beginPath(); ctx.arc(x + 10, y, 80 + 140 * u, -0.9, 0.9); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,214,120,${0.8 * o.growl * (1 - u)})`; ctx.stroke();
    }
  }
}
// an alarm clock sitting on the stomach: ring 0..1 (it shakes, the bells blur, the hands say 12), sleep 0..1 (it dozes)
function ibAlarm(t, x, y, s, o = {}) {
  const ring = o.ring || 0, sh = ring * 6 * Math.sin(t * 60);
  ctx.save(); ctx.translate(x + sh, y); ctx.rotate(ring * 0.08 * Math.sin(t * 47)); ctx.scale(s, s);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 46, -58); ctx.rotate(sd * 0.5); ctx.beginPath(); ctx.arc(0, 0, 26, Math.PI, 0); ctx.fillStyle = '#E8C060'; ctx.fill(); ctx.restore(); }
  line(ctx, -30, 60, -44, 84, 8, '#7A2A2A'); line(ctx, 30, 60, 44, 84, 8, '#7A2A2A');
  circle(ctx, 0, 0, 74, '#D8343E'); circle(ctx, 0, 0, 60, '#FFF6E6');
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(ctx, Math.sin(a) * 50, -Math.cos(a) * 50, Math.sin(a) * 56, -Math.cos(a) * 56, i % 3 ? 2 : 4, '#3A2A2A'); }
  const hr = o.hour === undefined ? 12 : o.hour;
  line(ctx, 0, 0, Math.sin(hr / 12 * Math.PI * 2) * 30, -Math.cos(hr / 12 * Math.PI * 2) * 30, 7, '#2A1A1A');
  line(ctx, 0, 0, Math.sin(hr * Math.PI * 2) * 44, -Math.cos(hr * Math.PI * 2) * 44, 4, '#2A1A1A');
  circle(ctx, 0, 0, 6, '#2A1A1A');
  ctx.restore();
  if (ring > 0.05) { shockLines(x, y - 20 * s, 110 * s, ring, 10, '#FFD447', 3); softDot(gctx, x, y, 140 * s, '#FFD447', 0.4 * ring); }
  if ((o.sleep || 0) > 0.05) zzz(x + 70 * s, y - 80 * s, t, 0, o.sleep, 0.8 * s);
}

// the right arm's muscle (in the raised arm): lit 0..1 (it glows as the viewer squeezes), its own sugar (beads that
// stay inside, a little padlock), shrink 0..1 (borrowed from)
function ibMuscle(t, o = {}) {
  const lit = o.lit || 0, shr = o.shrink || 0;
  const A = ibArmPts(o.flex === undefined ? 1 : o.flex), mx = lerp(A.sh[0], A.el[0], 0.5), my = lerp(A.sh[1], A.el[1], 0.5) - 6;
  ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.atan2(A.el[1] - A.sh[1], A.el[0] - A.sh[0]));
  const rx = 52 * (1 - 0.18 * shr), ry = 26 * (1 - 0.25 * shr) * (1 + 0.15 * lit);
  ellipse(ctx, 0, 0, rx + 4, ry + 4, '#C83A4A'); ellipse(ctx, 0, 0, rx, ry, mixHex('#E85A6A', '#FF8A9A', lit));
  for (let i = -2; i <= 2; i++) line(ctx, -rx * 0.8, i * ry * 0.3, rx * 0.8, i * ry * 0.3, 2, 'rgba(120,20,30,0.45)');
  if (lit > 0.01) softDot(gctx, 0, 0, 90, '#FF5A6E', 0.45 * lit);
  // its own sugar: beads that circle inside
  const n = o.beads === undefined ? 5 : o.beads;
  for (let i = 0; i < n; i++) { const a = t * 1.4 + i * 1.256; circle(ctx, Math.cos(a) * rx * 0.55, Math.sin(a) * ry * 0.45, 6, '#FFD447'); softDot(gctx, Math.cos(a) * rx * 0.55, Math.sin(a) * ry * 0.45, 12, '#FFD447', 0.5); }
  ctx.restore();
  if ((o.lock || 0) > 0.01) {   // a padlock: for its own use only
    const k = E.outBack(clamp(o.lock), 2), [px, py] = [mx - 10, my + 64];
    ctx.save(); ctx.translate(px, py); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, -16, 14, Math.PI, 0); ctx.lineWidth = 7; ctx.strokeStyle = '#C8CCD8'; ctx.stroke();
    rrect(ctx, -20, -16, 40, 32, 6); ctx.fillStyle = '#FFD447'; ctx.fill(); circle(ctx, 0, -2, 5, '#5A3A10');
    ctx.restore();
  }
}

// the fat: yellow bubbles round his belly and hips (the packed lunch). glow 0..1, shrink 0..1, lunch 0..1 (each
// bubble shows a tiny lunchbox), flow 0..1 (beads to the liver)
function ibFat(t, o = {}) {
  const g = o.glow || 0, sh = o.shrink || 0, rng = mulberry32(5);
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, u = rng(), x = side * (40 + 92 * rng() * (1 - 0.25 * u)), y = 70 + 190 * u, r = (14 + 9 * rng()) * (1 - 0.35 * sh);
    const wob = 1 + 0.04 * Math.sin(t * 3 + i);
    ellipse(ctx, x, y, r * wob, r / wob, mixHex('#F2C230', '#FFE680', g));
    ellipse(ctx, x - r * 0.3, y - r * 0.35, r * 0.25, r * 0.18, 'rgba(255,255,255,0.5)');
    if (g > 0.01) softDot(gctx, x, y, r * 2, '#FFD447', 0.35 * g);
    if ((o.lunch || 0) > 0.05) {
      const k = E.outBack(clamp(o.lunch * 1.4 - i * 0.015), 2);
      if (k > 0.01) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); rrect(ctx, -12, -8, 24, 16, 3); ctx.fillStyle = '#3FA7FF'; ctx.fill(); line(ctx, -6, -12, 6, -12, 3, '#2A6AB0'); ctx.restore(); }
    }
  }
  if ((o.flow || 0) > 0.01) { ibPipe(IB_FATPIPE_L, 14, '#FFD447', o.flow); ibPipe(IB_FATPIPE_R, 14, '#FFD447', o.flow); ibBeads(IB_FATPIPE_L, t, 6, '#FFD447', 7, 0.6, o.flow, 1); ibBeads(IB_FATPIPE_R, t, 6, '#FFD447', 7, 0.6, o.flow, 2); }
}

// the heart: beat (0..1 pulse now), shrink 0..1, glow
function ibHeart(t, o = {}) {
  const [x, y] = IB.heart, b = o.beat || 0, sz = (1 - 0.3 * (o.shrink || 0)) * (1 + 0.12 * b);
  ctx.save(); ctx.translate(x, y); ctx.scale(sz, sz); ctx.rotate(0.2);
  ctx.beginPath(); ctx.moveTo(0, 34); ctx.bezierCurveTo(-60, -4, -40, -52, 0, -26); ctx.bezierCurveTo(40, -52, 60, -4, 0, 34); ctx.closePath();
  ctx.fillStyle = '#E8343E'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#FF8A90'; ctx.stroke();
  ctx.restore();
  softDot(gctx, x, y, 80 * sz, '#FF5A6E', (0.3 + 0.5 * b) * (o.glow === undefined ? 1 : o.glow));
}

// the whole body. o: {alpha, flex, brain: {...}, liver: {...}, stomach: {...}, alarm: {...} or null, muscle: {...},
// fat: {...}, heart: {...}, straw: {flow 0..1, green 0..1, empty 0..1 (bubbles: slurping an empty glass)}, arm: {flow}}
function ibBody(V, t, o = {}) {
  ibOn(V, () => {
    ibSilhouette(t, o);
    ibFat(t, o.fat || {});
    if (o.arm && o.arm.flow > 0.01) { ibPipe(IB_ARMPIPE, 14, '#FF8A9A', o.arm.flow); ibBeads(IB_ARMPIPE, t, 6, '#FF8A9A', 7, 0.55, o.arm.flow, 4); }
    const st = o.straw || {};
    ibPipe(IB_STRAW, 16, st.green > 0.5 ? '#6AFFB8' : '#FFD447', 1);
    if ((st.flow || 0) > 0.01) {
      const g = st.green || 0;
      if (g < 0.99) ibBeads(IB_STRAW, t, 9, '#FFD447', 7, 0.7, st.flow * (1 - g), 7);
      if (g > 0.01) ibBeads(IB_STRAW, t, 9, '#6AFFB8', 8, 0.7, st.flow * g, 9);
    }
    if ((st.empty || 0) > 0.01) for (let i = 0; i < 5; i++) {   // air bubbles: the straw sucking at an empty jar
      const u = ((t * 1.8 + i / 5) % 1), acc = polyLen(IB_STRAW), p = polyAt(IB_STRAW, acc, u * acc[acc.length - 1]);
      ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.7 * st.empty})`; ctx.stroke();
    }
    ibLiver(t, o.liver || {});
    ibStomach(t, o.stomach || {});
    ibMuscle(t, o.muscle || {});
    ibHeart(t, o.heart || {});
    ibBrain(t, o.brain || {});
    if (o.alarm) ibAlarm(t, IB.stomach[0] + 40, IB.stomach[1] - 150, 0.7, o.alarm);
    if (o.extra) o.extra();
  });
}

// a tag with a dashed leader to a body point (screen space): txt at (x, y), the leader to body point F
function ibTag(V, txt, x, y, F, k, col = '#FFD447', size = 46) {
  if (k <= 0.01) return;
  const P = ibPt(V, F);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.setLineDash([10, 10]); ctx.globalAlpha = clamp(k * 2);
  line(ctx, x, y, lerp(x, P[0], E.outCubic(clamp(k))), lerp(y, P[1], E.outCubic(clamp(k))), 4, col);
  ctx.setLineDash([]); circle(ctx, P[0], P[1], 8 * clamp(k * 2), col);
  ctx.restore();
  pill(x, y, txt, col, clamp(k), size);
}
