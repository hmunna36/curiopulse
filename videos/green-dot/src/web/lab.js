// The weirdest true fact, as a 1950s lab on old film (Yarbus's suction cap: a tiny picture on a cap stuck to the
// eyeball moves WITH the eye, so it never changes on the eye, and within seconds it fades away; Martinez-Conde &
// Macknik 2017, Phil Trans R Soc B). The hiker sits with his chin in a chin rest; a scientist's gloved hand plants a
// rubber suction cup with a little picture on a stalk on his left eye (screen right). WHAT HE SEES: the picture, fading
// to nothing. A stopwatch: a few seconds. Screen space; the old-film grade is the shot's post.
'use strict';

const LB = { HX: 540, HY: 1040, S: 2.5 };
let LB_WALL = null;
function lbInit() {
  if (LB_WALL) return;
  LB_WALL = mkCanvas(W, H);
  const x = LB_WALL.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#6E6A5C'); g.addColorStop(1, '#4B463B');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // wainscot panels
  x.fillStyle = '#5A4632'; x.fillRect(0, 1300, W, H - 1300);
  x.fillStyle = '#4A3826'; for (let i = 0; i < 5; i++) x.fillRect(30 + i * 214, 1350, 180, 420);
  x.fillStyle = '#6B553D'; x.fillRect(0, 1290, W, 22);
  // an eye chart on the right
  x.fillStyle = '#E8E2CF'; x.fillRect(760, 420, 230, 330);
  x.fillStyle = '#1C1A16'; x.textAlign = 'center'; x.textBaseline = 'middle';
  [['E', 96, 490], ['F P', 52, 570], ['T O Z', 34, 630], ['L P E D', 24, 675], ['P E C F D', 17, 708]].forEach(([s, sz, y]) => { x.font = `900 ${sz}px Montserrat`; x.fillText(s, 875, y); });
  // a shelf with flasks on the left
  x.fillStyle = '#3E3024'; x.fillRect(60, 760, 290, 18);
  for (const [fx, h, col] of [[100, 90, '#9DB6A8'], [170, 120, '#C9B07A'], [250, 70, '#A8A2C4'], [310, 100, '#C08A7A']]) {
    x.fillStyle = col; x.beginPath(); x.moveTo(fx - 10, 760 - h); x.lineTo(fx + 10, 760 - h); x.lineTo(fx + 10, 760 - h * 0.55); x.lineTo(fx + 28, 760); x.lineTo(fx - 28, 760); x.lineTo(fx - 10, 760 - h * 0.55); x.closePath(); x.fill();
  }
}
// the chin rest: two posts, a chin cup and a forehead bar (props)
function lbChinRest(c) {
  const { HX, HY, S } = LB;
  actor(() => {
    for (const sd of [-1, 1]) { rrect(c, HX + sd * 250 - 14, HY - 260, 28, 1100, 12); c.fillStyle = '#8C8C92'; c.fill(); }
    rrect(c, HX - 264, HY - 236, 528, 30, 14); c.fillStyle = '#A4A4AA'; c.fill();        // the forehead bar (behind his head)
  });
}
function lbChinCup(c) {
  const { HX, HY, S } = LB;
  actor(() => {
    rrect(c, HX - 264, HY + 74 * S - 6, 528, 24, 12); c.fillStyle = '#A4A4AA'; c.fill();
    c.beginPath(); c.ellipse(HX, HY + 76 * S, 96, 30, 0, 0, Math.PI); c.closePath(); c.fillStyle = '#7A2E2A'; c.fill();
  });
}
// the cup on his eye: where it sits (screen), its wobble; o: {k: 0..1 on (planted), wob, look: [x, y] his eye's gaze}
function lbCupPos(o) {
  const { HX, HY, S } = LB;
  const look = o.look || [0, 0];
  return [HX + (24 + look[0] * 5) * S, HY + (-2 + look[1] * 4) * S];
}
// the cup, its stalk and the little picture (a cat) at its end: a pink rubber dome over his eye with a lip, a short
// grey stalk up and out, and a framed picture facing him. o: {k, wob, squash 0..1 (the plop)}
function lbCup(c, g, P, o) {
  const k = clamp(o.k || 0);
  if (k <= 0.01) return;
  const wob = o.wob || 0, s = LB.S, sq = clamp(o.squash || 0);
  c.save(); c.translate(P[0], P[1]); c.rotate(0.12 * wob); c.scale(1 + 0.18 * sq, 1 - 0.2 * sq);
  actor(() => {
    // the stalk and the picture's frame (behind the cup's dome)
    line(c, 6 * s, -14 * s, 40 * s, -50 * s, 6 * s, '#6A6A74');
    rrect(c, 26 * s, -96 * s, 56 * s, 44 * s, 4 * s); c.fillStyle = '#3A3026'; c.fill();
    // the rubber cup: a lip, then the dome
    c.beginPath(); c.ellipse(0, 3 * s, 30 * s, 25 * s, 0, 0, 7); c.fillStyle = '#C8324A'; c.fill();
    c.beginPath(); c.ellipse(0, -1 * s, 22 * s, 19 * s, 0, 0, 7); c.fillStyle = '#E2506A'; c.fill();
  });
  paint(() => {
    rrect(c, 29 * s, -93 * s, 50 * s, 38 * s, 3 * s); c.fillStyle = '#E8E2CF'; c.fill();
    lbCat(c, 54 * s, -72 * s, 0.6 * s, 0);
    c.beginPath(); c.ellipse(-7 * s, -8 * s, 8 * s, 4.5 * s, -0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fill();   // the rubber's shine
  });
  c.restore();
  void g;
}
// a little cat face (the picture): x, y, size, fade 0..1 (to the card's plain colour)
function lbCat(c, x, y, s, fade) {
  const a = 1 - clamp(fade);
  if (a <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a;
  c.fillStyle = '#E58A2E';
  c.beginPath(); c.moveTo(-26, -6); c.lineTo(-22, -32); c.lineTo(-8, -18); c.lineTo(8, -18); c.lineTo(22, -32); c.lineTo(26, -6); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, 2, 27, 22, 0, 0, 7); c.fill();
  c.fillStyle = '#2A1A10'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 10, -1, 3.6, 5.2, 0, 0, 7); c.fill(); }
  c.fillStyle = '#C84A5A'; c.beginPath(); c.moveTo(-3, 7); c.lineTo(3, 7); c.lineTo(0, 10.5); c.closePath(); c.fill();
  c.strokeStyle = '#2A1A10'; c.lineWidth = 1.6; c.lineCap = 'round';
  for (const sd of [-1, 1]) for (const dy of [-2, 3]) { c.beginPath(); c.moveTo(sd * 8, 10); c.lineTo(sd * 30, 8 + dy * 2); c.stroke(); }
  c.globalAlpha = 1; c.restore();
}
// the scientist's gloved hand and white sleeve, from the right edge to point P (what it holds is drawn by the caller)
function lbHand(c, P, k) {
  if (k <= 0.01) return;
  const x0 = W + 120, y0 = P[1] + 160;
  const hx = lerp(x0, P[0], E.outCubic(clamp(k))), hy = lerp(y0, P[1], E.outCubic(clamp(k)));
  actor(() => {
    line(c, x0 + 200, y0 + 80, hx + 70, hy + 36, 110, '#EDEBE4');            // the lab coat's sleeve
    line(c, hx + 92, hy + 44, hx + 70, hy + 34, 112, '#D8D5CA');             // its cuff
    c.beginPath(); c.ellipse(hx + 18, hy + 10, 46, 38, -0.4, 0, 7); c.fillStyle = '#E9E4D6'; c.fill();   // the glove
    for (let i = 0; i < 3; i++) { rrect(c, hx - 34, hy - 18 + i * 20, 52, 18, 9); c.fillStyle = '#E9E4D6'; c.fill(); }
  });
}
// an old stopwatch (screen space): x, y, size, the seconds shown, k pop
function lbWatch(c, g, x, y, s, secs, k) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2);
  c.save(); c.translate(x, y); c.scale(s * q, s * q);
  actor(() => {
    rrect(c, -14, -112, 28, 26, 6); c.fillStyle = '#B9B9C0'; c.fill();
    circle(c, 0, 0, 92, '#C7C7CE');
  });
  paint(() => {
    circle(c, 0, 0, 80, '#F4EFE0');
    c.strokeStyle = '#2A2620'; c.lineCap = 'round';
    for (let i = 0; i < 60; i += 5) { const a = (i / 60) * 6.2832 - Math.PI / 2; c.lineWidth = i % 15 ? 3 : 5; c.beginPath(); c.moveTo(Math.cos(a) * 66, Math.sin(a) * 66); c.lineTo(Math.cos(a) * 76, Math.sin(a) * 76); c.stroke(); }
    const a = (secs / 60) * 6.2832 - Math.PI / 2;
    c.lineWidth = 5; c.strokeStyle = '#B0262E'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 64, Math.sin(a) * 64); c.stroke();
    circle(c, 0, 0, 7, '#B0262E');
  });
  c.restore();
  void g;
}
// WHAT HE SEES: a round-cornered bubble with the picture, fading (screen space). k pop, fade 0..1
function lbSees(c, x, y, w, h, k, fade, t) {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2);
  c.save(); c.translate(x + w / 2, y + h / 2); c.scale(q, q); c.translate(-w / 2, -h / 2);
  rrect(c, -10, -10, w + 20, h + 20, 34); c.fillStyle = '#2A2620'; c.fill();
  paint(() => {
    rrect(c, 0, 0, w, h, 26); c.fillStyle = '#E8E2CF'; c.fill();
    lbCat(c, w / 2, h / 2 + 14, 2.6, fade);
    c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F4EFE0';
    c.fillText('WHAT HE SEES', w / 2, -40);
  });
  c.restore();
  void t;
}
// old film over the frame (call from post.overlay): scratches, dust and a flicker, seeded per frame
function lbOldFilm(t, a = 1) {
  const f = Math.floor(t * FPS), rng = mulberry32(700 + f);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(40,28,10,${(0.05 + 0.04 * rng()) * a})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) if (rng() < 0.6) { const x = rng() * W; ctx.fillStyle = `rgba(250,240,220,${0.18 * a})`; ctx.fillRect(x, 0, 2 + rng() * 2, H); }
  for (let i = 0; i < 9; i++) { const x = rng() * W, y = rng() * H, r = 1.5 + rng() * 3.5; ctx.fillStyle = `rgba(20,14,6,${0.45 * a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
