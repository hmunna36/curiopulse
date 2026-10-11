// Why Do Nails on a CHALKBOARD Make You Cringe? Short: inside his head. The hearing area is an amplifier with one big
// knob; the alarm centre (the amygdala) is a small red almond with a siren on its head, and it has an arm.
// Screen space.
//   brnDraw(t, o)       the brain, the amplifier, the alarm centre, the nerve coming up from the ear
//   BRN                 where things are (for labels)
'use strict';

const BRN = { cx: 540, cy: 790, amp: [420, 770], knob: [512, 776], guy: [706, 944], nerve: [[30, 1190], [150, 1120], [215, 980], [262, 860], [286, 800]] };
const brnKnobAt = (ang, r = 40) => [BRN.knob[0] + Math.cos(ang) * r, BRN.knob[1] + Math.sin(ang) * r];
// o: {signal 0..1 (the screech arriving up the nerve), level 0..1 (how loud the hearing area plays it), knob: angle in
//   radians (-2.2 low .. 2.5 past the end), alarm 0..1 (the siren is on), reach 0..1 (the arm is out to the knob),
//   grip 0..1 (its hand is on the knob and follows it), shake, mood: 'doze' | 'alert' | 'mad'}
function brnDraw(t, o = {}) {
  const c = ctx, lvl = clamp(o.level || 0), al = clamp(o.alarm || 0), sh = (o.shake || 0);
  const sx = sh * 5 * Math.sin(t * 73), sy = sh * 4 * Math.sin(t * 61 + 1);
  screenSpace();
  const V = o.V || { k: 1, cx: 540, cy: 800 };   // the whole picture, larger or smaller about a point
  for (const cc of [ctx, gctx]) { cc.save(); cc.translate(V.cx, V.cy); cc.scale(V.k, V.k); cc.translate(-V.cx, -V.cy); }
  // the brain, seen from the side (the face would be on the left)
  for (const [x, y, rx, ry, col] of [[330, 820, 170, 190, '#F2A0B6'], [760, 810, 160, 190, '#F2A0B6'], [540, 760, 320, 250, '#F5A8BC'], [738, 990, 128, 84, '#E48AA4']]) ellipse(c, x, y, rx, ry, col);
  rrect(c, 566, 960, 84, 190, 36); c.fillStyle = '#EEA2AC'; c.fill();
  paint(() => {
    c.lineCap = 'round'; c.lineWidth = 9; c.strokeStyle = 'rgba(200,96,130,0.55)';
    for (const [x, y, r, a0, a1] of [[330, 700, 70, 3.4, 5.6], [470, 600, 90, 3.6, 5.4], [650, 610, 100, 3.9, 5.9], [800, 720, 80, 4.4, 6.6], [250, 860, 60, 1.6, 3.6], [840, 900, 60, -0.6, 1.2], [600, 1010, 70, 0.2, 1.6], [330, 980, 60, 0.9, 2.6]]) { c.beginPath(); c.arc(x, y, r, a0, a1); c.stroke(); }
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(738, 1010 + i * 4, 100 - i * 22, 3.5, 5.9); c.lineWidth = 6; c.strokeStyle = 'rgba(170,70,100,0.5)'; c.stroke(); }
  });
  // the nerve from the ear, and the screech coming up it
  const N = BRN.nerve;
  poly(c, N, 22, '#C98A1E'); poly(c, N, 15, '#F0B63C');
  const sig = clamp(o.signal || 0);
  if (sig > 0.01) { const acc = polyLen(N), L = acc[acc.length - 1]; for (let i = 0; i < 6; i++) { const p = polyAt(N, acc, ((t * 1.9 + i / 6) % 1) * L); circle(c, p[0], p[1], 8.5, rgba('#FF4D5E', sig)); softDot(gctx, p[0], p[1], 28, '#FF4D5E', 0.7 * sig); } }
  // the hearing area: an amplifier
  const A = BRN.amp;
  c.save(); c.translate(sx, sy);
  rrect(c, A[0] - 158, A[1] - 112, 316, 224, 30); c.fillStyle = '#1E2547'; c.fill();
  rrect(c, A[0] - 146, A[1] - 100, 292, 200, 22); c.fillStyle = '#2B3464'; c.fill();
  rrect(c, A[0] - 132, A[1] - 84, 136, 104, 14); c.fillStyle = '#0A0F22'; c.fill();
  paint(() => {
    // what it is playing: the wave, as tall as the level
    const P = [], w = 120, a = 8 + 40 * lvl, col = mixH('#FFE08A', '#FF4D5E', lvl);
    for (let i = 0; i <= 40; i++) { const u = i / 40; P.push([A[0] - 124 + u * w, A[1] - 32 + clamp(a * Math.sin(u * 17 - t * 15), lvl > 0.86 ? -200 : -46, lvl > 0.86 ? 200 : 46) * (sig > 0.01 || lvl > 0.3 ? 1 : 0.12)]); }
    poly(c, P, 6, col); poly(gctx, P.map((p) => [p[0] + sx, p[1] + sy]), 11, rgba(col, 0.6));
    c.font = '900 23px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#9FB4FF'; c.fillText('HEARING', A[0] - 64, A[1] + 44);
    for (let i = 0; i < 8; i++) { const on = lvl * 8.4 > i; rrect(c, A[0] - 132 + i * 17.4, A[1] + 66, 12, 20, 4); c.fillStyle = on ? mixH('#4DFFB4', '#FF4D5E', i / 7) : '#111735'; c.fill(); }
    // the scale round the knob: quiet .. loud, and a red end
    for (let i = 0; i <= 10; i++) { const an = -2.2 + (i / 10) * 4.1, p0 = brnKnobAt(an, 62), p1 = brnKnobAt(an, i % 5 ? 70 : 76); line(c, p0[0], p0[1], p1[0], p1[1], 4.5, i >= 8 ? '#FF4D5E' : '#C9D4FF'); }
    c.beginPath(); c.arc(BRN.knob[0], BRN.knob[1], 84, 1.2, 2.2 + 0.3); c.lineWidth = 7; c.strokeStyle = 'rgba(255,77,94,0.9)'; c.stroke();
  });
  const ka = o.knob === undefined ? -1.3 : o.knob;
  circle(c, BRN.knob[0], BRN.knob[1], 54, '#11152E'); circle(c, BRN.knob[0], BRN.knob[1], 48, '#E7EBF8');
  paint(() => { circle(c, BRN.knob[0], BRN.knob[1], 30, '#C6CDE6'); const p0 = brnKnobAt(ka, 12), p1 = brnKnobAt(ka, 44); line(c, p0[0], p0[1], p1[0], p1[1], 9, '#FF4D5E'); });
  c.restore();
  // the alarm centre
  const G = BRN.guy, mood = o.mood || 'doze', hop = al * 6 * Math.abs(Math.sin(t * 9));
  const reach = clamp(o.reach || 0), grip = clamp(o.grip || 0);
  const hand0 = [G[0] - 70, G[1] - 30 - hop], hold = brnKnobAt(ka, 50), handTo = [hold[0] + sx, hold[1] + sy];
  const hand = [lerp(hand0[0], handTo[0], E.outBack(reach, 1.4)), lerp(hand0[1], handTo[1], E.outBack(reach, 1.4))];
  actor(() => {
    c.save(); c.translate(G[0], G[1] - hop); c.rotate(-0.16);
    ellipse(c, 0, 0, 84, 58, '#E2283C');
    c.restore();
    // the siren on its head
    rrect(c, G[0] - 20, G[1] - 78 - hop, 40, 14, 5); c.fillStyle = '#2A2F4A'; c.fill();
    c.beginPath(); c.arc(G[0], G[1] - 78 - hop, 17, Math.PI, 0); c.closePath(); c.fillStyle = al > 0.3 && Math.sin(t * 20) > 0 ? '#FFE08A' : '#FF8A3C'; c.fill();
    if (reach > 0.01) { line(c, G[0] - 62, G[1] - 22 - hop, hand[0], hand[1], 19, '#C91D33'); circle(c, hand[0], hand[1], 19, '#E2283C'); }
    else line(c, G[0] - 66, G[1] - 8 - hop, G[0] - 92, G[1] + 26 - hop, 17, '#C91D33');
    line(c, G[0] + 64, G[1] - 4 - hop, G[0] + 96, G[1] + (al > 0.3 ? -34 : 28) - hop, 17, '#C91D33');
  });
  paint(() => {   // its face
    c.save(); c.translate(G[0] - 6, G[1] - 4 - hop);
    const open = mood === 'doze' ? 0.16 : 1, look = mood === 'doze' ? [0, 0.4] : [-0.8, -0.5];
    for (const s of [-1, 1]) {
      if (open < 0.3) { c.beginPath(); c.moveTo(s * 26 - 13, 0); c.quadraticCurveTo(s * 26, 8, s * 26 + 13, 0); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#3A0614'; c.stroke(); }
      else { ellipse(c, s * 26, -2, 14, 16, '#FFFFFF'); circle(c, s * 26 + look[0] * 5, -2 + look[1] * 5, 6.5, '#2A0A12'); }
      const tilt = mood === 'mad' ? 9 : mood === 'alert' ? -6 : 0;
      line(c, s * 12, -24 + tilt * (s > 0 ? 0.2 : 0.2) + (mood === 'mad' ? 4 : 0), s * 40, -24 - tilt + (mood === 'mad' ? -4 : 0), 7, '#5A0A18');
    }
    if (mood === 'doze') { c.beginPath(); c.moveTo(-10, 24); c.quadraticCurveTo(0, 28, 10, 24); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#5A0A18'; c.stroke(); }
    else if (mood === 'alert') ellipse(c, 0, 26, 9, 11, '#5A0A18');
    else { rrect(c, -22, 16, 44, 18, 6); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#5A0A18'; c.stroke(); for (const x of [-11, 0, 11]) line(c, x, 17, x, 33, 2, '#5A0A18'); }
    c.restore();
  });
  if (al > 0.01) {   // the siren's light goes round
    const on = 0.55 + 0.45 * Math.sin(t * 20);
    softDot(gctx, G[0], G[1] - 84 - hop, 150, '#FF4D2E', 0.75 * al * on); softDot(gctx, G[0], G[1] - 84 - hop, 46, '#FFD98A', 0.9 * al);
    for (const d of [0, Math.PI]) { const an = t * 7 + d; gctx.beginPath(); gctx.moveTo(G[0], G[1] - 84 - hop); gctx.arc(G[0], G[1] - 84 - hop, 260, an - 0.2, an + 0.2); gctx.closePath(); gctx.fillStyle = `rgba(255,90,60,${0.3 * al})`; gctx.fill(); }
  }
  ctx.restore(); gctx.restore();
}
