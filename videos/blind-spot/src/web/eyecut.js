// An eyeball cut in half and seen from the side, in "eye units" (eye-rub-stars' eyeball.js, rewired for the blind
// spot): the middle of the ball is the origin, light comes in from the LEFT (cornea, iris, lens), the back wall on the
// right is lined with small light sensors that have faces. Each sensor's wire runs over the INSIDE of the wall to one
// spot, where the wires bundle into the cable to the brain and plug out through the wall: nobody can stand there (the
// blind spot). With `behind: true` it is an octopus's eye: the wires leave each sensor out of the back of the wall, the
// cable gathers them outside, and the wall is whole.
// Drawn through a view V = {x, y, s} (eyeOn, eyeView, eyeKeys, eyePt), on whatever transform is applied.
'use strict';

const EYB = { R: 300, CX: -240, CR: 150, IRX: -208, LENS: [-176, 0, 42, 92] };   // ball radius; cornea bulge; iris; lens
const HOLE_A = 0.5;                                    // where the cable plugs in (angle from "straight back", below it)
const SENS_A = [-1.5, -1.25, -1.0, -0.75, -0.5, -0.25, 0, 0.25, 0.75, 1.0, 1.25, 1.5];   // the sensors (none at the hole)
const SENS_X = 6;                                      // the one straight back, where the X's light lands
const SKIN = '#F2B892';

function eyeOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.scale(V.s, V.s); }
  try { return fn(); } finally { ctx.restore(); gctx.restore(); }
}
const eyePt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
const eyeView = (F, P, s) => ({ x: P[0] - F[0] * s, y: P[1] - F[1] * s, s });
function eyeKeys(t, keys, ease = E.inOutCubic) {   // keys [t, focusX, focusY, s, screenX, screenY]
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  return eyeView([k[1], k[2]], [k[4], k[5]], k[3]);
}
// a point on the back wall's lining at angle a, r from the middle (eye units)
const wallPt = (a, r = EYB.R - 34) => [Math.cos(a) * r, Math.sin(a) * r];
const HOLE_P = wallPt(HOLE_A, EYB.R - 30);

// one sensor (a small person standing on the back wall, facing in). S: {pop, mood: calm | ready | shout | oof | zzz |
// look, fire 0..1, squish, look: [x, y], jit, hop, lean: a sideways tilt}
function eyeSensor(c, g, a, S, t, i, sz = 0.72) {
  const pop = clamp(S.pop === undefined ? 1 : S.pop);
  if (pop <= 0.01) return;
  const q = E.outBack(pop, 2) * sz, sqz = clamp(S.squish || 0), shout = S.mood === 'shout' ? 1 : 0, fire = clamp(S.fire || 0);
  const len = 104 * (1 - 0.46 * sqz) * (1 + 0.16 * shout), wid = 70 * (1 + 0.36 * sqz) * (1 - 0.05 * shout);
  const jx = (S.jit || 0) * Math.sin(t * 61 + i * 2.1), jy = (S.jit || 0) * Math.cos(t * 53 + i);
  const P = wallPt(a, EYB.R - 30);
  c.save(); c.translate(P[0] + jx, P[1] + jy); c.rotate(a + Math.PI + (S.lean || 0)); c.scale(q, q);   // local +x = inward, off the wall
  if (S.hop) c.translate(S.hop, 0);
  actor(() => {
    const body = mixH('#FF9A3C', '#FFE066', fire);
    rrect(c, -4, -wid / 2, len, wid, wid * 0.46); c.fillStyle = body; c.fill();
    rrect(c, -12, -wid * 0.36, 22, wid * 0.72, 9); c.fillStyle = '#D9702A'; c.fill();        // its foot, in the wall
  });
  paint(() => {
    const fx = len * 0.56, look = S.look || [0, 0];
    c.save(); c.translate(fx, 0); c.rotate(-(a + Math.PI + (S.lean || 0)));                   // the face stays upright
    c.scale(1.2, 1.2);
    const m = S.mood || 'calm', ex = 12.5, ey = -5;
    if (m === 'shout' || m === 'oof') {
      for (const sd of [-1, 1]) { line(c, sd * (ex - 5), ey - 5, sd * (ex + 4), ey, 3.6, '#3A1A10'); line(c, sd * (ex + 4), ey, sd * (ex - 5), ey + 5, 3.6, '#3A1A10'); }
    } else if (m === 'zzz') { for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * ex - 6, ey); c.quadraticCurveTo(sd * ex, ey + 5, sd * ex + 6, ey); c.lineWidth = 3.2; c.strokeStyle = '#3A1A10'; c.lineCap = 'round'; c.stroke(); } }
    else {
      const er = m === 'ready' || m === 'wow' ? 8.5 : 7;
      for (const sd of [-1, 1]) { circle(c, sd * ex, ey, er, '#FFFFFF'); circle(c, sd * ex + look[0] * 2.6, ey + look[1] * 2.2, er * 0.55, '#2A1208'); }
    }
    if (m === 'shout') { ellipse(c, 0, 13, 9, 11, '#5A1522'); ellipse(c, 0, 18, 5.5, 4, '#E0616C'); }
    else if (m === 'oof') { c.beginPath(); c.moveTo(-9, 13); c.bezierCurveTo(-5, 8, -1, 18, 3, 13); c.bezierCurveTo(6, 9, 8, 15, 10, 13); c.lineWidth = 3.2; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
    else if (m === 'ready' || m === 'wow') ellipse(c, 0, 13, 4, 4.5, '#5A1522');
    else if (m === 'meh') line(c, -7, 13, 7, 13, 3.2, '#5A1522');
    else { c.beginPath(); c.moveTo(-7, 11); c.quadraticCurveTo(0, 17, 7, 11); c.lineWidth = 3.2; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
    c.restore();
  });
  c.restore();
  if (fire > 0.02) { const G = wallPt(a, EYB.R - 30 - 44 * sz); softDot(g, G[0], G[1], 60, '#FFC24A', 0.24 * fire); }
}

// the wires: from each sensor's head along the inside of the wall to the plug (front-wired), or out of its foot,
// round the outside of the ball, to the cable (behind). k = how far they have drawn on (0..1), glow 0..1
function trimPts(pts, k) {   // the first k of a polyline, by length
  if (k >= 0.999) return pts;
  let L = 0; const seg = [];
  for (let j = 1; j < pts.length; j++) { const d = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); seg.push(d); L += d; }
  let left = L * clamp(k); const out = [pts[0]];
  for (let j = 1; j < pts.length; j++) {
    if (left >= seg[j - 1]) { out.push(pts[j]); left -= seg[j - 1]; continue; }
    const u = left / (seg[j - 1] || 1); out.push([lerp(pts[j - 1][0], pts[j][0], u), lerp(pts[j - 1][1], pts[j][1], u)]); break;
  }
  return out;
}
function eyeWires(c, g, behind, angles, k, glow, t, sz = 0.72) {
  if (k <= 0.01) return;
  const col = '#FFB25A', w = 5;
  const arc = (from, to, r) => { const N = Math.max(3, Math.round(40 * Math.abs(to - from))), pts = []; for (let j = 0; j <= N; j++) { const a = lerp(from, to, j / N); pts.push([Math.cos(a) * r, Math.sin(a) * r]); } return pts; };
  const draw = (pts) => {
    const P = trimPts(pts, k);
    c.beginPath(); P.forEach((p, j) => (j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke();
    if (glow > 0.01) { g.beginPath(); P.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.lineWidth = 10; g.strokeStyle = rgba('#FFB25A', 0.16 * glow); g.stroke(); }
  };
  paint(() => {
    angles.forEach((a, i) => {
      const lane = 7 * (i % 4), sd = a < HOLE_A ? 1 : -1;   // the wires run in lanes, so they read as a bundle
      if (!behind) {
        const r = EYB.R - 30 - 104 * sz - 12 - lane, head = wallPt(a, EYB.R - 30 - 104 * sz * 0.9);
        draw([head, ...arc(a, HOLE_A - sd * 0.07, r), wallPt(HOLE_A - sd * 0.02, EYB.R - 58)]);
      } else {
        const r = EYB.R + 22 + lane, foot = wallPt(a, EYB.R - 26);
        draw([foot, ...arc(a, HOLE_A - sd * 0.05, r), wallPt(HOLE_A, EYB.R + 40)]);
      }
    });
  });
}

// The eyeball. o: {sens: [states, one per SENS_A], wires: 0..1, wireGlow, behind (octopus wiring), plug: 0..1 (the
// cable pushes into the hole; >1 = a bounce), holeGlow 0..1, cablePulses: [[u, a]], beams: [{from: [x, y] far left,
// to: [x, y] on the wall, col, k: 0..1 how far it has come, w: width}], dark, lid, noSkin, cableOut: how far the cable
// runs out to the right (eye units)}
function eyeCut(t, o = {}) {
  const c = ctx, g = gctx, R = EYB.R, behind = !!o.behind;
  const HP = wallPt(HOLE_A, R);
  // the cable to the brain: out of the back at the hole, then away to the right
  const plug = o.plug === undefined ? 1 : o.plug, pin = clamp(plug) - 0.12 * Math.sin(Math.PI * clamp(plug - 1, 0, 1));
  const pc = lerp(170, -12, pin);                       // the plug head's middle, out from the wall's outer surface
  const c0 = behind ? wallPt(HOLE_A, R + 40) : wallPt(HOLE_A, R + pc + 44);
  const cab = [c0, [c0[0] + 120, c0[1] + 70], [c0[0] + 380, c0[1] + 60], [c0[0] + (o.cableOut || 1400), c0[1] + 40]];
  const cabPath = (cc) => { cc.beginPath(); cc.moveTo(cab[0][0], cab[0][1]); cc.bezierCurveTo(cab[1][0], cab[1][1], cab[2][0], cab[2][1], cab[3][0], cab[3][1]); };
  cabPath(c); c.lineWidth = 70; c.lineCap = 'round'; c.strokeStyle = '#C9792F'; c.stroke();
  cabPath(c); c.lineWidth = 52; c.strokeStyle = '#F2A65A'; c.stroke();
  const bz = (u) => { const v = 1 - u; return [0, 1].map((j) => v * v * v * cab[0][j] + 3 * v * v * u * cab[1][j] + 3 * v * u * u * cab[2][j] + u * u * u * cab[3][j]); };
  for (const [u, a] of o.cablePulses || []) if (a > 0.01 && u > 0 && u < 1) { const p = bz(u); circle(c, p[0], p[1], 15, rgba('#FFFDF0', a)); softDot(g, p[0], p[1], 64, '#FFC24A', 0.85 * a); }
  // the white of the eye and the cornea
  circle(c, EYB.CX, 0, EYB.CR, mixH('#9FD4F2', '#31406E', (o.dark || 0) * 0.8));
  circle(c, 0, 0, R, '#F3EFE6');
  circle(c, 0, 0, R - 22, mixH('#2B5796', '#0C1438', o.dark || 0));
  c.save(); c.beginPath(); c.arc(0, 0, R - 22, 0, 7); c.clip();
  circle(c, EYB.CX, 0, EYB.CR - 16, mixH('#4C82C4', '#141E4A', o.dark || 0));
  c.restore();
  // the back wall's lining, with a gap where the cable comes through (none for the octopus)
  const gap = behind ? 0 : 0.13;
  c.lineWidth = 24; c.lineCap = 'butt'; c.strokeStyle = '#F08A6A';
  c.beginPath(); c.arc(0, 0, R - 34, -2.02, HOLE_A - gap); c.stroke();
  c.beginPath(); c.arc(0, 0, R - 34, HOLE_A + gap, 2.02); c.stroke();
  // the hole itself: a socket through the wall, and the cable's end plugged into it
  if (!behind) {
    c.save(); c.translate(HP[0], HP[1]); c.rotate(HOLE_A);
    rrect(c, -54, -38, 58, 76, 12); c.fillStyle = '#0C1438'; c.fill();                 // the socket, through the wall
    rrect(c, pc - 46, -34, 92, 68, 18); c.fillStyle = '#E58A3A'; c.fill();             // the plug's head
    rrect(c, pc + 30, -42, 18, 84, 7); c.fillStyle = '#B9682A'; c.fill();              // its collar
    c.restore();
    if ((o.holeGlow || 0) > 0.01) {
      const P = wallPt(HOLE_A, R - 44);
      paint(() => { c.beginPath(); c.arc(P[0], P[1], 66, 0, 7); c.lineWidth = 9; c.strokeStyle = rgba('#FFD447', o.holeGlow); c.stroke(); });
      softDot(g, P[0], P[1], 110, '#FFD447', 0.4 * o.holeGlow);
    }
  }
  // the iris (two blades with the pupil between them) and the lens
  for (const sd of [-1, 1]) line(c, EYB.IRX, sd * 212, EYB.IRX + 6, sd * 62, 30, '#3F7BD9');
  c.beginPath(); c.ellipse(EYB.LENS[0], EYB.LENS[1], EYB.LENS[2], EYB.LENS[3], 0, 0, 7); c.fillStyle = mixH('#E4F5FF', '#5F78B8', (o.dark || 0) * 0.7); c.fill();
  // the wires (behind the sensors' faces: drawn first)
  eyeWires(c, g, behind, behind ? [...SENS_A.slice(0, 8), HOLE_A, ...SENS_A.slice(8)] : SENS_A, o.wires === undefined ? 1 : o.wires, o.wireGlow || 0, t);
  // the sensors
  const sens = o.sens || [];
  SENS_A.forEach((a, i) => eyeSensor(c, g, a, sens[i] || {}, t, i));
  if (behind && o.extra) eyeSensor(c, g, HOLE_A, o.extra, t, 20);   // the octopus has one standing where our hole is
  // light coming in: each beam is a band from far left through the pupil (crossing at the lens) to its spot
  for (const B of o.beams || []) {
    const k = clamp(B.k || 0);
    if (k <= 0.01) continue;
    const L0 = B.from, L1 = [EYB.LENS[0], 0], L2 = B.to, col = B.col || '#FFF2A8', w = B.w || 26;
    const segA = Math.hypot(L1[0] - L0[0], L1[1] - L0[1]), segB = Math.hypot(L2[0] - L1[0], L2[1] - L1[1]), go = k * (segA + segB);
    const pts = [L0, go < segA ? [lerp(L0[0], L1[0], go / segA), lerp(L0[1], L1[1], go / segA)] : L1];
    if (go > segA) pts.push([lerp(L1[0], L2[0], (go - segA) / segB), lerp(L1[1], L2[1], (go - segA) / segB)]);
    for (const [cc, ww, al] of [[c, w, 0.85], [g, w * 2.6, 0.35]]) {
      cc.beginPath(); pts.forEach((p, j) => (j ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
      cc.lineWidth = ww; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = rgba(col, al * (B.a === undefined ? 1 : B.a)); cc.stroke();
    }
    if (B.bead) { const p = pts[pts.length - 1]; B.beadAt = p; }
  }
  for (const B of o.beams || []) if (B.bead && B.beadAt) { const p = B.beadAt; paint(() => { circle(c, p[0], p[1], B.bead + 5, '#0B0B1A'); circle(c, p[0], p[1], B.bead, B.beadCol || '#FF3B4E'); }); }
  // the skin round the eye and the lids (open)
  if (!o.noSkin) {
    const rr = EYB.CR + 2, A0 = 1.42, J = 0.51, TH = 40;
    for (const sd of [-1, 1]) {
      const open = sd < 0 ? 0.34 : 0.2, a1 = A0 * lerp(1 - open, 0, clamp(o.lid || 0));
      c.beginPath();
      const e0 = Math.PI - sd * 1.5, e1 = Math.PI - sd * J;
      c.arc(0, 0, R + TH + 26, e0, e1, sd < 0);
      c.arc(EYB.CX, 0, rr + TH, Math.PI - sd * A0, Math.PI - sd * a1, sd < 0);
      c.arc(EYB.CX, 0, rr, Math.PI - sd * a1, Math.PI - sd * A0, sd > 0);
      c.arc(0, 0, R + 1, e1, e0, sd > 0);
      c.closePath(); c.fillStyle = o.skin || SKIN; c.fill();
      const ax = Math.PI - sd * a1, ex = EYB.CX + Math.cos(ax) * (rr + TH * 0.6), ey = Math.sin(ax) * (rr + TH * 0.6);
      paint(() => { for (let i = 0; i < 3; i++) { const an = ax + sd * (0.5 - 0.3 * i) * (sd < 0 ? 1 : 0.6) - sd * 0.3; line(c, ex, ey, ex + Math.cos(an) * (sd < 0 ? 34 : 20), ey + Math.sin(an) * (sd < 0 ? 34 : 20), sd < 0 ? 5 : 4, '#3A2018'); } });
    }
  }
  return { hole: wallPt(HOLE_A, R - 44), cableAt: bz };
}

// a shouted word in a jagged burst (screen space)
function eyeShout(txt, x, y, size, k, a = 1, rot = 0, col = '#FFD447', seed = 1) {
  if (k <= 0.01 || a <= 0.01) return;
  const s = E.outBack(clamp(k), 2.3);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = clamp(a);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width * 0.5 + size * 0.5, h = size * 0.86, n = 14, rng = mulberry32(seed);
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const an = (i / (n * 2)) * 6.2832, rr = i % 2 ? 1 : 1.26 + 0.14 * rng(); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(an) * w * rr, Math.sin(an) * h * rr); }
  ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = size * 0.07; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B0B1A'; ctx.stroke();
  paint(() => { ctx.lineWidth = size * 0.1; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText(txt, 0, size * 0.04); ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.04); });
  ctx.globalAlpha = 1; ctx.restore();
  gctx.save(); gctx.translate(x, y); softDot(gctx, 0, 0, w * 1.3, col, 0.1 * a * clamp(k)); gctx.restore();
}
