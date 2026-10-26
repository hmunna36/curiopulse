// His head as glass with a tiny mail room in it: his brain at a counter with a rubber stamp, the PAT! cards it stamps
// (and the copy that slides out from under each), two glass tubes that carry the cards out of his head and down his
// arms (one to each hand), the shredder that eats the copies (moods: calm, eat, strain; a baby one with a pacifier;
// a party hat), the confetti it makes, the overtime clock. Head units as in foot.js: the head's middle at 0, 0, the
// head an ellipse 64 x 70, the hair up to -88. The screen's left tube runs to the left hand (the rub), the right tube
// to the right hand (the pat).
'use strict';

const MR = {
  brain: [0, -45], counterY: -15, card: [0, -24],
  fun: { L: [-22, 9], R: [22, 9] },                 // the funnels' mouths
  shred: [-38, -25.5],                              // the shredder's middle (it stands on the counter's left end, at size 0.95)
  pile: [-47, -17],                                 // the confetti heap by its feet, on the counter (it stays below its face)
};
const MR_CARD_W = 22, MR_CARD_H = 15;

// ---------------------------------------------------------------- the glass and the room's back wall
function mrGlass(c, k, o = {}) {
  if (k <= 0.01) return;
  const a = clamp(k);
  // one opaque fill of the window's shape first (two-noses, 17 Oct 2026: the light reads the window as the window)
  c.save();
  c.beginPath(); c.ellipse(0, 0, 66, 72, 0, 0, 7);
  c.globalAlpha = a; c.fillStyle = o.bg || '#101A3E'; c.fill();
  c.globalAlpha = 1;
  c.restore();
  if (a < 0.3) return;
  paint(() => {
    // the back wall: a soft lamp up top, a darker floor (his jaw)
    const g = c.createRadialGradient(0, -40, 4, 0, -10, 80);
    g.addColorStop(0, '#2C3C78'); g.addColorStop(0.6, '#18245A'); g.addColorStop(1, '#0C1436');
    c.beginPath(); c.ellipse(0, 0, 63, 69, 0, 0, 7); c.fillStyle = g; c.fill();
    // a few wall tiles of the mail room
    c.save(); c.beginPath(); c.ellipse(0, 0, 63, 69, 0, 0, 7); c.clip();
    c.strokeStyle = 'rgba(140,170,255,0.08)'; c.lineWidth = 1;
    for (let y = -60; y < 70; y += 12) { c.beginPath(); c.moveTo(-70, y); c.lineTo(70, y); c.stroke(); }
    c.restore();
  });
}
// the rim of the glass, after everything inside it (a cyan edge and a glint)
function mrRim(c, k) {
  if (k <= 0.01) return;
  paint(() => {
    c.save(); c.globalAlpha = clamp(k);
    c.beginPath(); c.ellipse(0, 0, 66, 72, 0, 0, 7); c.lineWidth = 3.2; c.strokeStyle = '#9FF1FF'; c.stroke();
    c.beginPath(); c.ellipse(-8, -6, 52, 60, 0, 3.6, 4.5); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineCap = 'round'; c.stroke();
    c.restore();
  });
}

// ---------------------------------------------------------------- his brain, the clerk
// o: {mood ('calm' | 'stamp' | 'strain' | 'proud' | 'shock'), stampY (0 up .. 1 down on the card), sweat, look (-1..1)}
function mrBrain(c, t, o = {}) {
  const [bx, by] = MR.brain, mood = o.mood || 'calm', sy = clamp(o.stampY || 0);
  paint(() => {
    c.save(); c.translate(bx, by + 1.2 * Math.sin(t * 3.1));
    // the left arm resting on the counter's edge, the right arm holding the stamp
    const sx = 23, sYr = -2 + 16 * sy;
    c.lineCap = 'round';
    line(c, -18, 8, -15, 25, 4.2, '#C95A7A'); line(c, -18, 8, -15, 25, 2.6, '#FF9BB8');
    line(c, 20, 6, sx, sYr + 4, 4.2, '#C95A7A'); line(c, 20, 6, sx, sYr + 4, 2.6, '#FF9BB8');
    // the body: two lobes, the folds
    c.beginPath();
    c.moveTo(-24, 4); c.bezierCurveTo(-30, -8, -22, -19, -10, -17); c.bezierCurveTo(-6, -22, 6, -22, 10, -17);
    c.bezierCurveTo(22, -19, 30, -8, 24, 4); c.bezierCurveTo(22, 13, 10, 16, 0, 14); c.bezierCurveTo(-10, 16, -22, 13, -24, 4);
    c.closePath(); c.fillStyle = '#FF93B0'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#B23E66'; c.stroke();
    c.lineWidth = 1.3; c.strokeStyle = 'rgba(160,40,80,0.6)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-19, -9, -13, -14, -7, -9], [7, -9, 13, -14, 19, -9], [-21, 5, -17, 1, -13, 6], [13, 6, 17, 1, 21, 5], [0, -18, 2, -12, 0, -7]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    // the face
    const lk = (o.look || 0) * 1.6, wide = mood === 'shock' ? 1.35 : 1;
    for (const s of [-1, 1]) {
      ellipse(c, s * 6.5, -1, 3.6 * wide, (mood === 'strain' ? 2.4 : 4.2) * wide, '#FFFFFF');
      circle(c, s * 6.5 + lk, -0.6, 1.9, '#1A0C18');
      const bt = mood === 'strain' ? -1.6 : mood === 'stamp' ? 1.4 : mood === 'shock' ? -1.2 : 0;
      line(c, s * 3, -6.5 + (s > 0 ? 0 : 0) - (mood === 'shock' ? 2 : 0) + bt * 0.2 * s, s * 10, -6.5 - bt * 0.6 - (mood === 'shock' ? 2 : 0), 1.6, '#5A1A34');
    }
    if (mood === 'strain') { rrect(c, -5, 5, 10, 4.4, 1.6); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#5A1A34'; c.stroke(); line(c, -5, 7.2, 5, 7.2, 0.7, '#5A1A34'); }
    else if (mood === 'shock') { ellipse(c, 0, 7.5, 2.6, 3.4, '#5A1A34'); }
    else { c.beginPath(); c.moveTo(-4.5, 5.5); c.quadraticCurveTo(0, mood === 'stamp' ? 7.5 : 9.5, 4.5, 5.5); c.lineWidth = 1.6; c.strokeStyle = '#5A1A34'; c.stroke(); }
    if (o.sweat > 0.01) sweatDrop(c, 21, -12 + 4 * ((t * 1.7) % 1), 0.22, clamp(o.sweat));
    c.restore();
  });
  // the stamp, in its right hand
  mrStamp(c, bx + 23, by - 2 + 16 * sy, 0.12 * (1 - sy));
}
// a rubber stamp: a red knob, a wooden body, the dark rubber at the bottom (bottom at x, y)
function mrStamp(c, x, y, rot) {
  c.save(); c.translate(x, y + 4); c.rotate(rot);
  rrect(c, -6.5, -2, 13, 4, 1.2); c.fillStyle = '#3A1A22'; c.fill();
  rrect(c, -5.5, -9, 11, 7.5, 2); c.fillStyle = '#B4825A'; c.fill();
  rrect(c, -1.6, -14, 3.2, 6, 1.2); c.fillStyle = '#8A5A3C'; c.fill();
  circle(c, 0, -15.5, 4.2, '#E2384C');
  c.restore();
}
// the counter the cards stand on
function mrCounter(c) {
  const y = MR.counterY;
  rrect(c, -56, y, 84, 6, 2); c.fillStyle = '#B07A52'; c.fill();
  rrect(c, -54, y + 5, 80, 3.5, 1.5); c.fillStyle = '#6E4630'; c.fill();
}
// a card standing up: o {ink (0..1: PAT! printed on it), txt, col, rot, s, squash (0..1: it shrinks into a slot), copy (a COPY tag)}
function mrCard(c, x, y, o = {}) {
  const s = o.s === undefined ? 1 : o.s;
  if (s <= 0.02) return;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s * (1 - 0.85 * clamp(o.squash || 0)));
  rrect(c, -MR_CARD_W / 2 - 1.2, -MR_CARD_H / 2 - 1.2, MR_CARD_W + 2.4, MR_CARD_H + 2.4, 2.6); c.fillStyle = '#1A1630'; c.fill();
  rrect(c, -MR_CARD_W / 2, -MR_CARD_H / 2, MR_CARD_W, MR_CARD_H, 2); c.fillStyle = o.paper || '#FFF8E6'; c.fill();
  const ink = clamp(o.ink === undefined ? 1 : o.ink);
  if (ink > 0.01) paint(() => {
    c.save(); c.globalAlpha = ink;
    c.font = `900 ${o.size || 8.6}px Anton, Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = o.col || '#E8A800'; c.fillText(o.txt || 'PAT!', 0, 0.6);
    c.restore();
  });
  if (o.copy) paint(() => {
    rrect(c, -9, MR_CARD_H / 2 - 1, 18, 5.4, 2.4); c.fillStyle = '#7FE9FF'; c.fill();
    c.font = '900 4.2px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#0B1A3A'; c.fillText('COPY', 0, MR_CARD_H / 2 + 1.8);
  });
  c.restore();
}

// ---------------------------------------------------------------- the two tubes inside his head (head units)
// o: {glowL, glowR (0..1: a card going down), dim}
function mrTubePath(side) {
  const s = side === 'L' ? -1 : 1, [fx, fy] = MR.fun[side];
  return [[fx, fy + 8], [fx + s * 1, fy + 26], [s * 17, 50], [s * 13, 66], [s * 11, 80]];
}
function mrTubes(c, k, t, o = {}) {
  if (k <= 0.01) return;
  for (const side of ['L', 'R']) {
    const [fx, fy] = MR.fun[side], P = mrTubePath(side), gl = clamp(side === 'L' ? o.glowL || 0 : o.glowR || 0);
    paint(() => {
      // the funnel's mouth
      c.beginPath(); c.moveTo(fx - 12, fy - 4); c.lineTo(fx + 12, fy - 4); c.lineTo(fx + 5, fy + 9); c.lineTo(fx - 5, fy + 9); c.closePath();
      c.fillStyle = '#26386E'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#9FF1FF'; c.stroke();
      ellipse(c, fx, fy - 4, 12, 2.6, '#0A1030'); c.beginPath(); c.ellipse(fx, fy - 4, 12, 2.6, 0, 0, 7); c.lineWidth = 1.4; c.strokeStyle = '#CFF8FF'; c.stroke();
      // the tube: a cyan edge, the dark inside, a highlight along its left side
      for (const [w, cl, dx] of [[10.5, '#9FF1FF', 0], [8, '#162455', 0], [2, rgba('#FFFFFF', 0.35), -2]]) {
        c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0] + dx, p[1]) : c.moveTo(p[0] + dx, p[1])));
        c.lineWidth = w; c.lineCap = 'butt'; c.lineJoin = 'round'; c.strokeStyle = cl; c.stroke();
      }
      if (gl > 0.01) {
        c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
        c.lineWidth = 6; c.strokeStyle = rgba('#FFE38A', 0.75 * gl); c.stroke();
      }
    });
    if (gl > 0.01) { const m = c.getTransform(), p = P[2]; gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); softDot(gctx, (m.a * p[0] + m.c * p[1] + m.e) / 2, (m.b * p[0] + m.d * p[1] + m.f) / 2, 22 * Math.hypot(m.a, m.b) / 2, '#FFD447', 0.4 * gl); gctx.restore(); }
  }
}
// a point along a tube inside the head (u 0 = the funnel's mouth .. 1 = the bottom of his head)
function mrTubeAt(side, u) {
  const [fx, fy] = MR.fun[side];
  const P = [[fx, fy - 4], ...mrTubePath(side)], acc = polyLen(P);
  return polyAt(P, acc, acc[acc.length - 1] * clamp(u));
}

// ---------------------------------------------------------------- the shredder
// at its middle (x, y), size s; o: {k (it pops in), chomp (0..1: the jaw open), mood ('calm' | 'eat' | 'strain' | 'baby' |
// 'proud'), sweat, steam, pacifier (0..1), hat (0..1), shake}
function mrShredder(c, x, y, s, t, o = {}) {
  const k = clamp(o.k === undefined ? 1 : o.k);
  if (k <= 0.01) return;
  const e = E.outBack(k, 2.2) * s, mood = o.mood || 'calm', ch = clamp(o.chomp || 0);
  const sh = (o.shake || 0) * Math.sin(t * 70);
  c.save(); c.translate(x + sh, y); c.scale(e, e);
  // the body: a grey-blue box with a top lip and the slot; little feet
  rrect(c, -13, 6, 7, 5, 2); c.fillStyle = '#2A3048'; c.fill(); rrect(c, 6, 6, 7, 5, 2); c.fillStyle = '#2A3048'; c.fill();
  rrect(c, -14, -11, 28, 19, 4); c.fillStyle = '#6F80A8'; c.fill();
  rrect(c, -15.5, -13.5, 31, 5, 2.4); c.fillStyle = '#4C5A80'; c.fill();
  paint(() => {
    rrect(c, -10, -12.6, 20, 2.4, 1.2); c.fillStyle = '#0B0B1A'; c.fill();      // the slot on top
    // the face: two eyes and a mouth that chomps (the mouth is its blades)
    const sq = mood === 'strain' ? 0.55 : mood === 'baby' ? 1.15 : 1;
    for (const sd of [-1, 1]) {
      ellipse(c, sd * 5.5, -5, 3.1, 3.6 * sq, '#FFFFFF');
      circle(c, sd * 5.5 + (mood === 'eat' ? 0 : 0.3), -4.6 + (mood === 'eat' ? -0.8 : 0), mood === 'baby' ? 2.1 : 1.6, '#151525');
      if (mood === 'baby') circle(c, sd * 5.5 + 0.8, -5.6, 0.7, '#FFFFFF');
      const bt = mood === 'strain' ? 1.3 : mood === 'eat' ? -0.5 : 0;
      line(c, sd * 2.6, -9.6 + bt * 0.6, sd * 8.2, -9.6 - bt, 1.3, '#20263F');
    }
    // the mouth
    const mo = mood === 'strain' ? 0.45 + 0.55 * ch : ch;
    rrect(c, -7.5, 1.2 - 1.6 * mo, 15, 2.2 + 3.6 * mo, 1.2); c.fillStyle = '#151525'; c.fill();
    for (let i = -3; i <= 3; i++) {
      c.beginPath(); c.moveTo(i * 2.1 - 0.9, 1.2 - 1.6 * mo); c.lineTo(i * 2.1, 2.3 - 1.6 * mo + 0.4); c.lineTo(i * 2.1 + 0.9, 1.2 - 1.6 * mo); c.closePath(); c.fillStyle = '#E6EEFF'; c.fill();
      c.beginPath(); c.moveTo(i * 2.1 - 0.9, 3.4 + 2 * mo); c.lineTo(i * 2.1, 2.3 + 2 * mo - 0.4); c.lineTo(i * 2.1 + 0.9, 3.4 + 2 * mo); c.closePath(); c.fillStyle = '#E6EEFF'; c.fill();
    }
    // cheeks when it is a baby
    if (mood === 'baby') for (const sd of [-1, 1]) ellipse(c, sd * 9.5, 0.5, 2.2, 1.5, 'rgba(255,130,160,0.7)');
  });
  // the pacifier stuck in its mouth (a baby)
  if ((o.pacifier || 0) > 0.01) {
    const pk = clamp(o.pacifier), pd = (1 - pk) * 30;
    c.save(); c.translate(-pd * 0.7, 2.4 - pd * 0.9); c.rotate(-pd * 0.08);
    ellipse(c, 0, 0, 7.5, 4.2, '#7FD8FF'); circle(c, 0, 0, 2.4, '#E9F8FF');
    c.beginPath(); c.arc(0, 4.2, 3.2, 0.2, Math.PI - 0.2); c.lineWidth = 1.4; c.strokeStyle = '#FF86A6'; c.stroke();
    c.restore();
  }
  // a party hat
  if ((o.hat || 0) > 0.01) {
    const hk = E.outBack(clamp(o.hat), 2.4);
    c.save(); c.translate(4, -13.5); c.rotate(0.22); c.scale(hk, hk);
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.lineTo(0.5, -15); c.closePath(); c.fillStyle = '#FF5A6E'; c.fill();
    paint(() => { for (const [yy, cl] of [[-4, '#FFD447'], [-9, '#7FE9FF']]) line(c, -4.4 + (-yy) * 0.12, yy, 4.6 - (-yy) * 0.2, yy, 1.6, cl); });
    circle(c, 0.5, -15.5, 2.2, '#FFD447');
    c.restore();
  }
  if ((o.sweat || 0) > 0.01) { sweatDrop(c, 13.5, -10 + 5 * ((t * 1.9) % 1), 0.2, clamp(o.sweat)); sweatDrop(c, -14, -7 + 5 * ((t * 1.5 + 0.4) % 1), 0.16, clamp(o.sweat)); }
  c.restore();
  // steam puffs off its top (screen-agnostic: head units, drawn after)
  if ((o.steam || 0) > 0.01) {
    for (let i = 0; i < 4; i++) {
      const u = (t * 1.6 + i / 4) % 1;
      paint(() => circle(c, x + sh + (i % 2 ? 6 : -6) + 4 * Math.sin(u * 6 + i), y - 14 * s - 16 * u * s, (2.4 + 4 * u) * s, rgba('#E9EEFF', 0.6 * clamp(o.steam) * (1 - u))));
    }
  }
}
// strips of confetti falling from the shredder: one handful per shred time in `times` (head units)
function mrStrips(c, t, times, o = {}) {
  const [sx, sy] = MR.shred, floor = MR.pile[1] + 3;
  for (let j = 0; j < times.length; j++) {
    const dt = t - times[j];
    if (dt < 0 || dt > 1.1) continue;
    const rng = mulberry32(90 + j * 7);
    for (let i = 0; i < 9; i++) {
      const vx = -12 - rng() * 46, vy = -18 - rng() * 22, x0 = sx + (rng() - 0.5) * 10;
      const y = Math.min(floor - rng() * 3, sy + 4 + vy * dt + 120 * dt * dt);
      const x = x0 + vx * Math.min(dt, 0.45) + 2 * Math.sin(dt * 9 + i), rot = (rng() - 0.5) * 2 + dt * 6 * (rng() - 0.5);
      const col = [o.col || '#FFF8E6', '#FFD447', '#FFF8E6'][i % 3];
      c.save(); c.translate(x, y); c.rotate(rot); rrect(c, -0.9, -4, 1.8, 8, 0.8); c.fillStyle = col; c.fill(); c.restore();
    }
  }
}
// the confetti pile on the floor of his head (k = how big)
function mrPile(c, k) {
  if (k <= 0.01) return;
  const [px, py] = MR.pile, rng = mulberry32(44), n = Math.round(10 + 50 * clamp(k));
  for (let i = 0; i < n; i++) {
    const a = rng(), b = rng();
    const x = px + (a - 0.5) * (16 + 16 * k), y = py + 1.5 - b * (2 + 5 * k) * (1 - Math.abs(a - 0.5) * 1.7);
    c.save(); c.translate(x, y); c.rotate((rng() - 0.5) * 3); rrect(c, -0.9, -3.4, 1.8, 6.8, 0.8); c.fillStyle = i % 3 === 1 ? '#FFD447' : '#FFF8E6'; c.fill(); c.restore();
  }
}
// a little wall clock whose hands spin (overtime), with a tag under it
function mrClock(c, x, y, r, t, k, spin) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y); c.scale(e, e);
  circle(c, 0, 0, r + 1.6, '#20263F'); circle(c, 0, 0, r, '#FFF8E6');
  paint(() => {
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; line(c, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 0.8, '#20263F'); }
    const a1 = -Math.PI / 2 + t * spin, a2 = -Math.PI / 2 + t * spin * 12;
    line(c, 0, 0, Math.cos(a1) * r * 0.5, Math.sin(a1) * r * 0.5, 1.6, '#20263F');
    line(c, 0, 0, Math.cos(a2) * r * 0.78, Math.sin(a2) * r * 0.78, 1, '#E2384C');
    circle(c, 0, 0, 1.2, '#20263F');
    rrect(c, -r * 1.25, r + 2.5, r * 2.5, r * 0.7, r * 0.3); c.fillStyle = '#FF9A3C'; c.fill();
    c.font = `900 ${r * 0.48}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#20132A';
    c.fillText('OVERTIME', 0, r + 2.5 + r * 0.36);
  });
  c.restore();
}

// ---------------------------------------------------------------- the tubes outside him: from his chin down an arm to the wrist
// screen points (H = fsHero's result); side 'L' | 'R'
function mrArmPts(H, side) {
  const r = H.r, P = H.S, s = side === 'L' ? -1 : 1;
  const sh = r['sh' + side], el = r['el' + side], wr = r['wr' + side];
  return [H.HS(s * 11, 80), P(s * 22, r.neck[1] + 14), P(sh[0] * 0.7, sh[1] + 6), P(...sh), P(...el), P(...wr)];
}
// a glass tube along screen points; k = how much of it is there (it draws on), w = its width in px
function mrArmTube(pts, k, w, o = {}) {
  if (k <= 0.01) return;
  const acc = polyLen(pts), L = acc[acc.length - 1], Lk = L * clamp(k), cut = [];
  for (let i = 0; i < pts.length; i++) { if (acc[i] <= Lk) cut.push(pts[i]); else { cut.push(polyAt(pts, acc, Lk)); break; } }
  screenSpace();
  for (const [cc, lw, cl] of [[ctx, w * 1.5, rgba('#0B0B1A', 0.55)], [ctx, w, rgba('#9FF1FF', 0.95)], [ctx, w * 0.62, rgba('#1C2C66', 0.92)], [gctx, w * 2, rgba('#7FE9FF', 0.28 + 0.4 * (o.glow || 0))]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.beginPath(); cut.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
    cc.lineWidth = lw; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = cl; cc.stroke(); cc.restore();
  }
  if ((o.flow || 0) > 0.01) {   // a steady cyan flow (the rub orders) as marching dashes
    ctx.save(); ctx.setLineDash([w * 0.9, w * 1.6]); ctx.lineDashOffset = -(o.t || 0) * w * 9;
    ctx.beginPath(); cut.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.lineWidth = w * 0.3; ctx.lineCap = 'round'; ctx.strokeStyle = rgba('#7FE9FF', 0.9 * o.flow); ctx.stroke(); ctx.restore();
  }
}
// a card on its way along screen points: u 0..1; s = its size (px across)
function mrTubeCard(pts, u, s, o = {}) {
  if (u <= 0 || u >= 1.02) return;
  const acc = polyLen(pts), p = polyAt(pts, acc, acc[acc.length - 1] * clamp(u));
  screenSpace();
  softDot(gctx, p[0], p[1], s * 1.4, o.col || '#FFD447', 0.85);
  ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(o.rot || 0);
  const w = s, h = s * 0.68;
  rrect(ctx, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 4); ctx.fillStyle = '#1A1630'; ctx.fill();
  rrect(ctx, -w / 2, -h / 2, w, h, 3); ctx.fillStyle = '#FFF8E6'; ctx.fill();
  ctx.font = `900 ${h * 0.62}px Anton, Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.col || '#E8A800';
  ctx.fillText(o.txt || 'PAT!', 0, 1);
  ctx.restore();
}
