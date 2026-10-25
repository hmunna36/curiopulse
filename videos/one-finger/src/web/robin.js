// robin.js — the little robin who lands on whatever finger he raises (it covers the fingertip, so the raised middle
// finger is never shown bare), looks, judges, and turns coach (a whistle, a sweatband). Plus small comic props: a tag
// pill, a comic burst with a word, a sparkle, rep numbers. Bird units: the body is ~100 units long, origin = the feet.
'use strict';

const RB = { back: '#8B5A3A', backDk: '#5A3420', breast: '#F2793A', breastHi: '#FFA060', belly: '#F4E6D2', wing: '#74472D',
  wingDk: '#5A3420', beak: '#E9B13A', beakDk: '#B9821E', leg: '#7A4E36', eye: '#16121E' };

// o: {facing 1 (looking right) | -1, look: head turn (-1..1: up/down tilt), tilt: head roll (rad), blink 0..1, flap 0..1
// (wings up), flapPhase, perch: 0..1 (legs folded round a perch), mood: 'calm' | 'curious' | 'judge' | 'smug' | 'shock',
// whistle 0..1 (a coach's whistle in the beak; cheeks puff when blowing), blow 0..1, band 0..1 (a sweatband), lean (rad),
// squash (landing), t}
function ofBird(c, x, y, s, o = {}) {
  const f = o.facing || 1, t = o.t || 0;
  c.save(); c.translate(x, y); c.scale(s * f, s);
  const sq = o.squash || 0;
  c.scale(1 + 0.12 * sq, 1 - 0.14 * sq);
  c.rotate(o.lean || 0);
  // legs and toes round the perch
  const pk = clamp(o.perch === undefined ? 1 : o.perch);
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const lx of [-8, 8]) {
    c.strokeStyle = RB.leg; c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(lx, -16); c.lineTo(lx + 1, -2); c.stroke();
    c.lineWidth = 2.6;
    for (const tx of [-7, 0, 7]) { c.beginPath(); c.moveTo(lx + 1, -2); c.quadraticCurveTo(lx + tx * 0.9, 2 + 3 * pk, lx + tx * (1 - 0.35 * pk), 5 * pk + 1); c.stroke(); }
    c.beginPath(); c.moveTo(lx + 1, -2); c.lineTo(lx - 9, -3 + 4 * pk); c.stroke();
  }
  // tail
  actor(() => {
    c.fillStyle = RB.wingDk;
    c.beginPath(); c.moveTo(-34, -40); c.lineTo(-74, -50 + 6 * Math.sin(t * 7) * (o.flap || 0)); c.lineTo(-78, -38); c.lineTo(-70, -30); c.lineTo(-32, -26); c.closePath(); c.fill();
    // body
    c.fillStyle = RB.back; c.beginPath(); c.ellipse(-2, -40, 42, 30, -0.12, 0, 7); c.fill();
  });
  paint(() => {
    // breast and belly
    c.fillStyle = RB.breast; c.beginPath(); c.ellipse(12, -36, 27, 24, 0.25, 0, 7); c.fill();
    c.fillStyle = RB.breastHi; c.beginPath(); c.ellipse(16, -42, 13, 10, 0.25, 0, 7); c.fill();
    c.fillStyle = RB.belly; c.beginPath(); c.ellipse(4, -19, 21, 10, 0.05, 0, 7); c.fill();
  });
  // the wing (folded, or up in a flap)
  const fl = clamp(o.flap || 0), ph = Math.sin(o.flapPhase === undefined ? t * 38 : o.flapPhase);
  const wa = fl * (0.6 + 0.9 * (0.5 + 0.5 * ph));
  actor(() => {
    c.save(); c.translate(-6, -48); c.rotate(-wa);
    c.fillStyle = RB.wing; c.beginPath(); c.moveTo(-6, -2); c.quadraticCurveTo(-30, -6 - 10 * fl, -50, 6 - 8 * fl); c.quadraticCurveTo(-24, 22, 18, 10); c.quadraticCurveTo(14, -2, -6, -2); c.closePath(); c.fill();
    c.restore();
  });
  paint(() => {
    c.save(); c.translate(-6, -48); c.rotate(-wa);
    c.strokeStyle = rgba(RB.wingDk, 0.9); c.lineWidth = 2.4;
    for (const u of [0.3, 0.55, 0.8]) { c.beginPath(); c.moveTo(-48 * u + 8, 6 + 6 * u); c.lineTo(-48 * u - 4, 12 + 4 * u); c.stroke(); }
    c.restore();
  });
  // the head
  const look = o.look || 0, hx = 28, hy = -66 - 3 * look;
  c.save(); c.translate(hx, hy); c.rotate((o.tilt || 0) - 0.1 * look);
  actor(() => { c.fillStyle = RB.back; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); });
  paint(() => {
    c.fillStyle = RB.breast; c.beginPath(); c.ellipse(9, 9, 15, 12, 0.3, 0, 7); c.fill();     // the orange face and throat
    // sweatband
    const bd = clamp(o.band || 0);
    if (bd > 0.01) {
      c.save(); c.scale(1, E.outBack(bd, 2));
      c.fillStyle = '#F2F4F8'; c.beginPath(); c.ellipse(-1, -10, 23, 7, 0.1, 0, 7); c.fill();
      c.fillStyle = '#FF4D5E'; c.fillRect(-20, -12, 40, 3.5);
      c.restore();
    }
    // the eye
    const bl = clamp(o.blink || 0), mood = o.mood || 'calm';
    const ex = 9, ey = -3, er = mood === 'shock' ? 6.4 : 5.2;
    circle(c, ex, ey, er + 1.6, '#FFFFFF');
    if (bl < 0.9) { c.save(); c.beginPath(); c.ellipse(ex, ey, er + 1.6, (er + 1.6) * (1 - bl), 0, 0, 7); c.clip(); circle(c, ex + 1.2, ey + 0.4, er, RB.eye); circle(c, ex + 2.6, ey - 1.8, 1.6, '#FFFFFF'); c.restore(); }
    else line(c, ex - 6, ey + 1, ex + 6, ey + 1, 2.2, RB.eye);
    // a brow for the moods that need one
    if (mood === 'judge' || mood === 'smug') { c.strokeStyle = RB.backDk; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 8, ey - 9); c.lineTo(ex + 7, ey - 6.5 + (mood === 'smug' ? -2 : 1.5)); c.stroke(); }
    if (mood === 'curious') { c.strokeStyle = RB.backDk; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 7, ey - 10); c.quadraticCurveTo(ex, ey - 13, ex + 7, ey - 9); c.stroke(); }
    if (mood === 'shock') { c.strokeStyle = RB.backDk; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 7, ey - 12); c.lineTo(ex + 7, ey - 12.5); c.stroke(); }
  });
  // the beak (open a little in 'shock'), and the whistle
  const wh = clamp(o.whistle || 0), bo = mood2(o) === 'shock' ? 0.45 : 0;
  paint(() => {
    c.fillStyle = RB.beak; c.beginPath(); c.moveTo(18, -4 - 2 * bo); c.lineTo(34, 0); c.lineTo(18, 3); c.closePath(); c.fill();
    c.fillStyle = RB.beakDk; c.beginPath(); c.moveTo(18, 3 + 3 * bo); c.lineTo(30, 3 + 3 * bo); c.lineTo(18, 7 + 3 * bo); c.closePath(); c.fill();
    if (wh > 0.01) {
      c.save(); c.translate(31, 2); c.scale(E.outBack(wh, 2), E.outBack(wh, 2));
      c.fillStyle = '#D9DEE8'; rrect(c, -2, -5, 20, 10, 4); c.fill();
      c.beginPath(); c.arc(20, 3, 8, 0, 7); c.fill();
      c.fillStyle = '#7F8796'; c.beginPath(); c.arc(20, 3, 3.4, 0, 7); c.fill();
      c.strokeStyle = '#FF4D5E'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(4, 5); c.quadraticCurveTo(-8, 30, -28, 26); c.stroke();
      c.restore();
      const bw = clamp(o.blow || 0);
      if (bw > 0.01) for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; line(c, 62 + Math.cos(a) * 6, 6 + Math.sin(a) * 6, 62 + Math.cos(a) * (14 + 10 * bw), 6 + Math.sin(a) * (14 + 10 * bw), 3, rgba('#FFFFFF', bw)); }
    }
  });
  c.restore();
  c.restore();
}
function mood2(o) { return o.mood || 'calm'; }

// a tag: a dark pill with a word and an optional dashed leader to a point (screen space)
function ofTag(txt, x, y, col, k, to, size = 50) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.2);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`;
  const w = ctx.measureText(txt).width + size * 0.9, h = size * 1.45;
  paint(() => {
    ctx.fillStyle = 'rgba(10,12,28,0.88)'; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = col; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * 0.04);
  });
  ctx.restore();
  if (to) thinLeader([x, y + (to[1] > y ? h / 2 * s : -h / 2 * s)], to, k, col);
}
// a comic burst (jagged star) with a word in it, screen space
function ofBurst(txt, x, y, r, col, k, rot = 0, seed = 3, txtCol = '#16121E') {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 2.4), rng = mulberry32(seed), n = 14;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  paint(() => {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * (0.68 + 0.08 * rng()) : r * (1 + 0.1 * rng()); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr * 0.78); }
    ctx.closePath(); ctx.fillStyle = '#16121E'; ctx.fill();
    ctx.save(); ctx.scale(0.9, 0.9); ctx.fillStyle = col; ctx.fill(); ctx.restore();
    ctx.font = `900 ${Math.round(r * 0.5)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = txtCol;
    ctx.fillText(txt, 0, r * 0.03);
  });
  ctx.restore();
}
// a four-point sparkle (both layers), screen space
function ofSpark(x, y, r, col, k) {
  if (k <= 0.01) return;
  const s = r * E.outBack(clamp(k), 2);
  for (const [c, a] of [[ctx, 1], [gctx, 0.8]]) {
    c.save(); c.translate(x, y); c.fillStyle = rgba(col, a);
    c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0); c.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
    c.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0); c.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s); c.fill();
    c.restore();
  }
}
// motion arcs (a few curved strokes) beside a moving thing, screen space
function ofSwish(x, y, r, a0, a1, k, col = '#FFFFFF') {
  if (k <= 0.01) return;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x, y, r + i * 16, a0 + i * 0.05, a1 - i * 0.05);
    ctx.lineWidth = 6 - i * 1.5; ctx.strokeStyle = rgba(col, 0.75 * k * (1 - i * 0.25)); ctx.lineCap = 'round'; ctx.stroke();
  }
}

// a speech bubble with dark text and a tail toward (tx, ty) (screen space)
function ofSpeech(txt, x, y, k, tx, ty, size = 72, rot = 0) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 2.4);
  screenSpace();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 64, h = size * 1.35;
  paint(() => {
    const ax = (tx - x) / s, ay = (ty - y) / s, an = Math.atan2(ay, ax), bx = Math.cos(an) * w * 0.32, by = h / 2 - 4;
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#0B0B1A'; ctx.lineWidth = 7;
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 22, by); ctx.lineTo(bx + Math.cos(an) * 46, by + 46); ctx.lineTo(bx + 22, by); ctx.closePath(); ctx.stroke(); ctx.fill();
    rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = '#16121E'; ctx.fillText(txt, 0, 4);
  });
  ctx.restore();
}
