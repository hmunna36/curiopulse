// An eyeball cut in half and seen from the side, in "eye units": the middle of the ball is the origin, light comes in
// from the LEFT (cornea, iris, lens), the back wall is on the right and is lined with light sensors that have faces;
// the nerve leaves the back, to the right. Drawn on screen through a view V = {x, y, s} (eyeOn, eyeView, eyeKeys, eyePt).
// Also the other end of the nerve: the brain in its dark room, on the phone, with a screen it paints on (brainRoom).
'use strict';

const EYB = { R: 300, CX: -240, CR: 150, IRX: -208, LENS: [-176, 0, 42, 92] };   // ball radius; the cornea's bulge (centre x, radius); iris and lens
const EYB_A = [-1.26, -0.78, -0.3, 0.3, 0.78, 1.26];                              // where the six sensors stand on the back wall (angles from "straight back")
const SKIN = '#F2B892', SKIN_SH = '#CF8663';

function eyeOn(V, fn) {
  for (const c of [ctx, gctx]) { c.save(); c.translate(V.x, V.y); c.scale(V.s, V.s); }
  try { return fn(); } finally { ctx.restore(); gctx.restore(); }
}
const eyePt = (V, x, y) => [V.x + x * V.s, V.y + y * V.s];
// a view that puts eye point F at screen point P, s pixels to a unit
const eyeView = (F, P, s) => ({ x: P[0] - F[0] * s, y: P[1] - F[1] * s, s });
// keyframed views: keys [t, focusX, focusY, s, screenX, screenY]
function eyeKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4, 5].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  return eyeView([k[1], k[2]], [k[4], k[5]], k[3]);
}
// the squash: the fist pushes the front in, the back wall stays where it is (x' = R + (x - R) * sx)
const eyeSq = (k) => ({ sx: 1 - 0.14 * k, sy: 1 + 0.08 * k });
// where sensor i stands (eye units), with the squash applied: its foot on the wall, and the way it points (inward)
function eyeSensorAt(i, sq = 0) {
  const a = EYB_A[i], Q = eyeSq(sq), r = EYB.R - 30;
  return { x: EYB.R + (Math.cos(a) * r - EYB.R) * Q.sx, y: Math.sin(a) * r * Q.sy, a };
}

// one sensor (a small person on the back wall). S: {pop 0..1, mood: calm | ready | shout | oof | zzz, fire 0..1 (it
// glows), squish 0..1 (flat against the wall), look: [x, y], jit}
function eyeSensor(c, g, P, S, t, i) {
  const pop = clamp(S.pop === undefined ? 1 : S.pop);
  if (pop <= 0.01) return;
  const q = E.outBack(pop, 2), sqz = clamp(S.squish || 0), shout = S.mood === 'shout' ? 1 : 0, fire = clamp(S.fire || 0);
  const len = 104 * (1 - 0.46 * sqz) * (1 + 0.16 * shout), wid = 70 * (1 + 0.36 * sqz) * (1 - 0.05 * shout);
  const jx = (S.jit || 0) * Math.sin(t * 61 + i * 2.1), jy = (S.jit || 0) * Math.cos(t * 53 + i);
  c.save(); c.translate(P.x + jx, P.y + jy); c.rotate(P.a + Math.PI); c.scale(q, q);   // local +x = inward, off the wall
  if (S.hop) c.translate(S.hop, 0);
  actor(() => {
    const body = mixH('#FF9A3C', '#FFE066', fire);
    rrect(c, -4, -wid / 2, len, wid, wid * 0.46); c.fillStyle = body; c.fill();
    rrect(c, -12, -wid * 0.36, 22, wid * 0.72, 9); c.fillStyle = '#D9702A'; c.fill();        // its foot, in the wall
  });
  paint(() => {
    const fx = len * 0.56, look = S.look || [0, 0];
    c.save(); c.translate(fx, 0); c.rotate(-(P.a + Math.PI));                                // the face stays upright
    c.scale(1.2, 1.2);
    const m = S.mood || 'calm', ex = 12.5, ey = -5;
    if (m === 'shout' || m === 'oof') {                                                      // eyes squeezed shut: > <
      for (const sd of [-1, 1]) { line(c, sd * (ex - 5), ey - 5, sd * (ex + 4), ey, 3.6, '#3A1A10'); line(c, sd * (ex + 4), ey, sd * (ex - 5), ey + 5, 3.6, '#3A1A10'); }
    } else if (m === 'zzz') { for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * ex - 6, ey); c.quadraticCurveTo(sd * ex, ey + 5, sd * ex + 6, ey); c.lineWidth = 3.2; c.strokeStyle = '#3A1A10'; c.lineCap = 'round'; c.stroke(); } }
    else {
      const er = m === 'ready' ? 8.5 : 7;
      for (const sd of [-1, 1]) { circle(c, sd * ex, ey, er, '#FFFFFF'); circle(c, sd * ex + look[0] * 2.6, ey + look[1] * 2.2, er * 0.55, '#2A1208'); }
    }
    if (m === 'shout') { ellipse(c, 0, 13, 9, 11, '#5A1522'); ellipse(c, 0, 18, 5.5, 4, '#E0616C'); }
    else if (m === 'oof') { c.beginPath(); c.moveTo(-9, 13); c.bezierCurveTo(-5, 8, -1, 18, 3, 13); c.bezierCurveTo(6, 9, 8, 15, 10, 13); c.lineWidth = 3.2; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
    else if (m === 'ready') ellipse(c, 0, 13, 4, 4.5, '#5A1522');
    else { c.beginPath(); c.moveTo(-7, 11); c.quadraticCurveTo(0, 17, 7, 11); c.lineWidth = 3.2; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
    c.restore();
  });
  c.restore();
  if (fire > 0.02) softDot(g, P.x - Math.cos(P.a) * 44, P.y - Math.sin(P.a) * 44, 70, '#FFC24A', 0.22 * fire);
}

// The eyeball. o: {squash 0..1, lid 0..1 (shut), dark 0..1 (inside), beam 0..1 (light through the pupil), beamA: its
// brightness, sens: [six states for eyeSensor] (or none), fist: {k: how far it has come 0..1, y: its rub up and down},
// pulses: [[u, a], ...] beads on the nerve (u 0..1 from the wall outward), wall: 0..1 the back wall lit up (when it is
// named), noNerve}
function eyeDraw(t, o = {}) {
  const c = ctx, g = gctx, R = EYB.R, sq = clamp(o.squash || 0, 0, 1.2), Q = eyeSq(sq), dark = clamp(o.dark || 0), lid = clamp(o.lid || 0);
  // the nerve, out of the back
  if (!o.noNerve) {
    line(c, R - 14, 0, R + 1500, 0, 78, '#C9792F'); line(c, R - 14, 0, R + 1500, 0, 58, '#F2A65A');
    paint(() => { for (let x = R + 40; x < R + 1500; x += 64) line(c, x, -24, x + 16, 24, 3, 'rgba(160,84,24,0.45)'); });
    for (const [u, a] of o.pulses || []) if (a > 0.01 && u > 0 && u < 1) { const x = R + 10 + u * 1300; circle(c, x, 0, 17, rgba('#FFFDF0', a)); softDot(g, x, 0, 70, '#FFC24A', 0.85 * a); }
  }
  for (const cc of [c, g]) { cc.save(); cc.translate(R, 0); cc.scale(Q.sx, Q.sy); cc.translate(-R, 0); }
  // the cornea's bulge, then the white of the eye
  circle(c, EYB.CX, 0, EYB.CR, mixH('#9FD4F2', '#31406E', dark * 0.8));
  circle(c, 0, 0, R, '#F3EFE6');
  // inside: the clear jelly (dark when no light gets in)
  circle(c, 0, 0, R - 22, mixH('#2B5796', '#0C1438', dark));
  c.save(); c.beginPath(); c.arc(0, 0, R - 22, 0, 7); c.clip();
  circle(c, EYB.CX, 0, EYB.CR - 16, mixH('#4C82C4', '#141E4A', dark));                          // the chamber behind the cornea
  c.restore();
  // the back wall's lining (the retina)
  c.beginPath(); c.arc(0, 0, R - 34, -2.02, 2.02); c.lineWidth = 24; c.lineCap = 'butt'; c.strokeStyle = '#F08A6A'; c.stroke();
  if ((o.wall || 0) > 0.02) { paint(() => { c.beginPath(); c.arc(0, 0, R - 34, -2.02, 2.02); c.lineWidth = 12; c.strokeStyle = rgba('#FFE08A', 0.9 * o.wall); c.stroke(); }); g.beginPath(); g.arc(0, 0, R - 34, -2.02, 2.02); g.lineWidth = 40; g.strokeStyle = rgba('#FFC24A', 0.55 * o.wall); g.stroke(); }
  // the iris (two blades, with the pupil between them) and the lens
  for (const sd of [-1, 1]) line(c, EYB.IRX, sd * 212, EYB.IRX + 6, sd * 62, 30, '#3F7BD9');
  c.beginPath(); c.ellipse(EYB.LENS[0], EYB.LENS[1], EYB.LENS[2], EYB.LENS[3], 0, 0, 7); c.fillStyle = mixH('#E4F5FF', '#5F78B8', dark * 0.7); c.fill();
  // light through the pupil: a band that the lens brings together onto the two middle sensors
  const beam = clamp(o.beam || 0);
  if (beam > 0.01) {
    const a = (o.beamA === undefined ? 1 : o.beamA), x1 = lerp(-1500, R - 70, beam);
    const band = (cc, al) => {
      cc.save(); cc.beginPath(); cc.rect(-1600, -400, x1 + 1600, 800); cc.clip();
      cc.beginPath(); cc.moveTo(-1500, -52); cc.lineTo(EYB.LENS[0], -52); cc.lineTo(R - 70, -96); cc.lineTo(R - 70, 96); cc.lineTo(EYB.LENS[0], 52); cc.lineTo(-1500, 52); cc.closePath();
      cc.fillStyle = rgba('#FFF2A8', al * a); cc.fill(); cc.restore();
    };
    band(c, 0.44); band(g, 0.14);
    for (let i = 0; i < 6; i++) {   // beads of light riding in
      const u = (t * 1.5 + i / 6) % 1, x = lerp(-1300, R - 90, u);
      if (x < x1) { const y = (i % 3 - 1) * 30 * (x < EYB.LENS[0] ? 1 : lerp(1, 1.9, inv(EYB.LENS[0], R - 90, x))); circle(c, x, y, 9, rgba('#FFFFFF', 0.95 * a)); softDot(g, x, y, 26, '#FFE680', 0.45 * a); }
    }
  }
  // the sensors
  if (o.sens) for (let i = 0; i < 6; i++) {
    const a = EYB_A[i], r = R - 30;
    eyeSensor(c, g, { x: Math.cos(a) * r, y: Math.sin(a) * r, a }, o.sens[i] || {}, t, i);
  }
  // the skin round the eye (brow above, cheek below), and the two lids, which are part of it: open, they stop at the
  // cornea's edge; shut, they meet in front of it
  if (!o.noSkin) {
    const rr = EYB.CR + 2, A0 = 1.42, J = 0.51, TH = 40;
    for (const sd of [-1, 1]) {
      const open = sd < 0 ? 0.34 : 0.2, a1 = A0 * lerp(1 - open, 0, lid) * (sd < 0 ? 1 : 1);      // the upper lid travels further
      c.beginPath();
      // along the white of the eye, from far round the ball to where the cornea starts ...
      const e0 = Math.PI - sd * 1.5, e1 = Math.PI - sd * J;
      c.arc(0, 0, R + TH + 26, e0, e1, sd < 0);
      // ... then over the cornea to the lid's edge, and back underneath
      c.arc(EYB.CX, 0, rr + TH, Math.PI - sd * A0, Math.PI - sd * a1, sd < 0);
      c.arc(EYB.CX, 0, rr, Math.PI - sd * a1, Math.PI - sd * A0, sd > 0);
      c.arc(0, 0, R + 1, e1, e0, sd > 0);
      c.closePath(); c.fillStyle = SKIN; c.fill();
      // lashes on the lid's edge
      const ax = Math.PI - sd * a1, ex = EYB.CX + Math.cos(ax) * (rr + TH * 0.6), ey = Math.sin(ax) * (rr + TH * 0.6);
      paint(() => { for (let i = 0; i < 3; i++) { const an = ax + sd * (0.5 - 0.3 * i) * (sd < 0 ? 1 : 0.6) - sd * 0.3; line(c, ex, ey, ex + Math.cos(an) * (sd < 0 ? 34 : 20), ey + Math.sin(an) * (sd < 0 ? 34 : 20), sd < 0 ? 5 : 4, '#3A2018'); } });
    }
  }
  for (const cc of [c, g]) cc.restore();
  // the fist: one big knuckle against the lid, the rest of the hand behind it
  const F = o.fist;
  if (F && F.k > 0.01) {
    const front = R + (EYB.CX - EYB.CR - 44 - R) * Q.sx, x = lerp(front - 760, front + 4, clamp(F.k)), y = F.y || 0;
    actor(() => {
      line(c, x - 1400, y + 30, x - 330, y + 10, 250, '#F9BC38');                                   // his sleeve
      line(c, x - 352, y + 10, x - 322, y + 10, 268, '#D58F1B');                                    // its cuff
      rrect(c, x - 330, y - 168, 250, 336, 96); c.fillStyle = SKIN; c.fill();                       // the back of the hand
      for (let i = 0; i < 4; i++) { const fy = y - 126 + i * 84; rrect(c, x - 150, fy - 44, 150, 86, 40); c.fillStyle = SKIN; c.fill(); }   // four fingers, knuckles first
      rrect(c, x - 250, y + 120, 190, 84, 40); c.fillStyle = SKIN; c.fill();                        // the thumb, tucked under
    });
    paint(() => {
      c.lineCap = 'round'; c.strokeStyle = 'rgba(170,88,60,0.5)'; c.lineWidth = 6;
      for (let i = 1; i < 4; i++) { const fy = y - 126 + i * 84 - 43; line(c, x - 140, fy, x - 22, fy, 6, 'rgba(170,88,60,0.5)'); }
      for (let i = 0; i < 4; i++) { const fy = y - 126 + i * 84; c.beginPath(); c.arc(x - 150, fy, 26, -1.1, 1.1); c.stroke(); }
      line(c, x - 232, y + 124, x - 80, y + 124, 6, 'rgba(170,88,60,0.5)');
    });
  }
}

// a shouted word in a jagged burst (screen space): txt, where, its size, k = pop, a = alpha, rot, the tail's direction
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

// ---------------------------------------------------------------- the other end of the line (screen space)
// The brain in the dark, on the phone, under a screen it paints on. o: {V: {x, y, s} the whole room about a point,
// mood, look, ear: 0..1 (the handset is at its ear), words: [[k, a], ...] LIGHT! coming out of the earpiece,
// q: 0..1 a question mark, brush: 0..1 (its arm goes up to the screen), stars: 0..1 how full the screen is,
// pops: [times], pulses: [[u, a]] on the line coming in, shrug: 0..1}
const BRN = { X: 548, Y: 1052, S: 1.42, SCR: [128, 478, 824, 372] };
function brainRoom(t, o = {}) {
  const c = ctx, g = gctx;
  screenSpace();
  // the line coming in from the eye, bottom left, up to the phone
  const P0 = [-40, 1330], P1 = [130, 1320], P2 = [214, 1230], P3 = [236, 1130];
  c.beginPath(); c.moveTo(P0[0], P0[1]); c.bezierCurveTo(P1[0], P1[1], P2[0], P2[1], P3[0], P3[1]); c.lineWidth = 46; c.lineCap = 'round'; c.strokeStyle = '#C9792F'; c.stroke();
  c.beginPath(); c.moveTo(P0[0], P0[1]); c.bezierCurveTo(P1[0], P1[1], P2[0], P2[1], P3[0], P3[1]); c.lineWidth = 32; c.strokeStyle = '#F2A65A'; c.stroke();
  const bz = (u) => { const v = 1 - u; return [v * v * v * P0[0] + 3 * v * v * u * P1[0] + 3 * v * u * u * P2[0] + u * u * u * P3[0], v * v * v * P0[1] + 3 * v * v * u * P1[1] + 3 * v * u * u * P2[1] + u * u * u * P3[1]]; };
  for (const [u, a] of o.pulses || []) if (a > 0.01 && u > 0 && u < 1) { const p = bz(u); circle(c, p[0], p[1], 12, rgba('#FFFDF0', a)); softDot(g, p[0], p[1], 50, '#FFC24A', 0.85 * a); }
  // the screen: what you see
  const [sx, sy, sw, sh] = BRN.SCR, full = clamp(o.stars || 0);
  rrect(c, sx - 16, sy - 16, sw + 32, sh + 32, 26); c.fillStyle = '#2A3470'; c.fill();
  rrect(c, sx, sy, sw, sh, 14); c.fillStyle = '#050818'; c.fill();
  line(c, sx + sw / 2, sy + sh + 16, sx + sw / 2, sy + sh + 60, 18, '#2A3470');
  paint(() => {
    c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(160,180,255,0.75)';
    c.fillText('WHAT YOU SEE', sx + sw / 2, sy - 44);
  });
  if (full > 0.001) {
    c.save(); rrect(c, sx, sy, sw, sh, 14); c.clip(); g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
    const rng = mulberry32(91);
    for (let i = 0; i < 30; i++) {
      const x = sx + 44 + rng() * (sw - 88), y = sy + 38 + rng() * (sh - 76), r = 18 + 30 * rng(), col = PH_COLS[i % PH_COLS.length], born = (i / 30) * 0.9, kind = ['star', 'star', 'dot', 'ring', 'star', 'plus'][i % 6];
      const kk = clamp((full - born) / 0.1), tw = 0.6 + 0.4 * Math.sin(t * (3 + rng() * 4) + i);
      phStar(x, y, r, col, kk, tw, i * 0.4, kind);
    }
    for (const f of o.pops || []) {   // fireworks: rings of sparks from a point
      const d = t - f; if (d < 0 || d > 0.9) continue;
      const j = (o.pops || []).indexOf(f), bx = sx + sw * [0.24, 0.7, 0.46][j % 3], by = sy + sh * [0.42, 0.36, 0.62][j % 3], col = ['#FFD447', '#7FE9FF', '#FF86A6'][j % 3];
      for (let n = 0; n < 16; n++) { const a = (n / 16) * 6.2832, rr = 190 * E.outCubic(clamp(d / 0.5)), al = 1 - clamp(d / 0.9); circle(c, bx + Math.cos(a) * rr, by + Math.sin(a) * rr + 60 * d * d, 9, rgba(col, al)); softDot(g, bx + Math.cos(a) * rr, by + Math.sin(a) * rr + 60 * d * d, 24, col, 0.5 * al); }
    }
    c.restore(); g.restore();
    softDot(g, sx + sw / 2, sy + sh / 2, 420, '#8FA8FF', 0.1 * full);
  }
  // the brain, and its phone
  const ear = clamp(o.ear === undefined ? 1 : o.ear), br = clamp(o.brush || 0), shr = clamp(o.shrug || 0);
  const X = BRN.X, Y = BRN.Y, S = BRN.S;
  const handL = [lerp(-176, -128, ear) - 14 * shr, lerp(118, -6, ear) - 30 * shr], handR = [lerp(lerp(176, 196, shr), 150, br), lerp(lerp(118, 10, shr), -206, br)];
  actor(() => erBrain(c, X, Y, S, t, { mood: o.mood || 'calm', look: o.look || [0, 0], armL: handL, armR: handR, lean: 0.03 * shr * Math.sin(t * 3) }));
  // the handset at its ear (the cord goes down to the line)
  const HX = X + (handL[0] - 12) * S, HY = Y + (handL[1] - 4) * S + 5 * Math.sin(t * 2.4);
  c.beginPath(); c.moveTo(HX - 8, HY + 30);
  for (let i = 1; i <= 14; i++) { const u = i / 14; c.lineTo(lerp(HX - 8, P3[0], u) + (i % 2 ? 9 : -9), lerp(HY + 30, P3[1], u)); }
  c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#8E1626'; c.stroke();
  actor(() => erHandset(c, HX, HY, 0.82 * S, -1.25));
  // the paint brush
  if (br > 0.01) {
    const bx = X + handR[0] * S, by = Y + handR[1] * S + 5 * Math.sin(t * 2.4);
    c.save(); c.translate(bx, by); c.rotate(-0.5 + 0.5 * Math.sin(t * 13) * br);
    line(c, 0, 20, 0, -70, 12, '#C98A4A'); rrect(c, -13, -108, 26, 44, 9); c.fillStyle = '#FFD447'; c.fill();
    c.restore();
    softDot(g, bx, by - 86, 26, '#FFD447', 0.25 * br);
  }
  // LIGHT! out of the earpiece
  (o.words || []).forEach(([k, a], i) => { if (k > 0.01) eyeShout('LIGHT!', clamp(HX - 96 - 16 * (i % 2), 214, 400), HY - 150 - 30 * (i % 2), 62, k, a, -0.12 + 0.1 * (i % 2), '#FFD447', 4 + i); });
  if ((o.q || 0) > 0.01) bigWord('?', X + 178 * S, Y - 150 * S, 150, '#7FE9FF', E.outBack(clamp(o.q), 2.2), 0.16);
}
