// What he sees (finger-sausage, 20 Oct 2026): the bus across the aisle, and his own two hands coming in from the
// sides with the index fingertips almost touching in the middle. Drawn in "pov space" (a 1080x1920 frame) under a
// view V = {s, x, y} (fsPovSet), so the same picture fills the screen in the POV shots and plays small on the brain's
// monitors.
// - fsBackdrop(t, o): the far side of the bus: wall, two windows with the city sliding past, the bench, two passengers
//   (o.pass: {suit, nurse} states for drawPassenger), o.ghost (0..1): drawn see-through (for the doubled background).
// - fsFingers(V, o): his hands as the two eyes see them. Each eye's copy is drawn on its own canvas: the left eye's
//   shifted right by d/2, the right eye's shifted left (a near thing seen while looking far: crossed double images).
//   Where both eyes see a finger it is solid; where only one does it is a ghost at half strength. With the gap g
//   between the tips smaller than d, the right eye's right fingertip and the left eye's left fingertip overlap in
//   the middle: a solid stub with a fingertip at each end, floating between two ghost gaps. That is the sausage.
//   o = {d, g, blur, tint (0..1: the copies tinted teal = left eye, orange = right eye), one ('L' | 'R': one eye
//   only), sausage (0..1 a yellow outline and glow on it), clip (fn: a path to clip to), alpha, focus (0..1 the
//   fingers sharp)}.
// - fsSausageBox(o): where the sausage is, in pov space: [x0, x1, y, r].
'use strict';

const FSP = { tipY: 690, cx: 540, fw: 62, d: 230, g: 44, hs: 0.78 };   // the sausage sits at (540, 690) in pov space, over the dark windows
const FS_TEAL = '#3FE0D0', FS_ORANGE = '#FF9A3C', FS_SKIN = '#F2B48E', FS_SKIN_D = '#D98F6B', FS_NAIL = '#FAD4C6';
let FS_A = null, FS_B = null, FS_I = null, FS_T = null;

function initFsPov() {
  FS_A = mkCanvas(W, H); FS_B = mkCanvas(W, H); FS_I = mkCanvas(W, H); FS_T = mkCanvas(W, H);
}
function fsPovSet(V) {
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y);
  gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
}
// the view that puts pov point F at screen point P with scale s
function fsPovAt(F, P, s) { return { s, x: P[0] - F[0] * s, y: P[1] - F[1] * s }; }

// ---------------------------------------------------------------- the far side of the bus (pov space)
const FS_PASS = { suit: { x: 300, y: 1196, s: 1.32 }, nurse: { x: 790, y: 1196, s: 1.3 } };
function fsBackdrop(t, o = {}, c = ctx) {
  const ga = o.glowA === undefined ? 1 : o.glowA;
  const wall = c.createLinearGradient(0, 0, 0, 1920);
  wall.addColorStop(0, '#141B33'); wall.addColorStop(0.3, '#26324F'); wall.addColorStop(0.7, '#1E2944'); wall.addColorStop(1, '#151C30');
  c.fillStyle = wall; c.fillRect(-400, -400, 1880, 2720);
  // the ceiling strip and the rail
  rrect(c, -100, 150, 1280, 30, 10); c.fillStyle = '#E8F2FF'; c.fill();
  gctx.fillStyle = `rgba(190,220,255,${0.4 * ga})`; gctx.fillRect(-100, 130, 1280, 70);
  line(c, -100, 268, 1180, 268, 14, '#B9C2D6'); line(c, -100, 264, 1180, 264, 4, '#FFFFFF');
  // two windows with the night city sliding past
  busWindow(c, 70, 330, 450, 460, t, 2, ga);
  busWindow(c, 560, 330, 450, 460, t, 3, ga);
  // the wall below the windows, the bench back and the seat
  c.fillStyle = '#202A45'; c.fillRect(-100, 790, 1280, 90);
  line(c, -100, 794, 1180, 794, 6, '#3A4A6E');
  const seatBack = c.createLinearGradient(0, 880, 0, 1196);
  seatBack.addColorStop(0, '#2E4E8E'); seatBack.addColorStop(1, '#1F3566');
  rrect(c, -100, 884, 1280, 330, 28); c.fillStyle = seatBack; c.fill();
  paint(() => {
    c.save(); c.globalAlpha = 0.22;
    for (let px = -92; px < 1180; px += 52) for (let py = 912; py < 1190; py += 52) ellipse(c, px + ((py / 52) % 2) * 26, py, 10, 6, '#FFD447');
    c.restore();
  });
  const seat = c.createLinearGradient(0, 1196, 0, 1290);
  seat.addColorStop(0, '#3A5EA8'); seat.addColorStop(1, '#1A2C55');
  rrect(c, -100, 1186, 1280, 104, 16); c.fillStyle = seat; c.fill();
  const fl = c.createLinearGradient(0, 1290, 0, 1920);
  fl.addColorStop(0, '#2A2F3E'); fl.addColorStop(1, '#0C0E16');
  c.fillStyle = fl; c.fillRect(-100, 1290, 1280, 700);
  line(c, -100, 1320, 1180, 1320, 8, 'rgba(255,212,71,0.35)');
  busPole(c, 30, 200, 1180, 20); busPole(c, 1050, 200, 1180, 20);
  // the passengers across the aisle
  const P = o.pass || {};
  drawPassenger(c, PASS.suit, Object.assign({}, FS_PASS.suit, P.suit || {}), t);
  drawPassenger(c, PASS.nurse, Object.assign({}, FS_PASS.nurse, P.nurse || {}), t);
  // hanging straps, swaying on clocks that loop with the Short
  for (let i = 0; i < 6; i++) {
    const sx = 90 + i * 180, sw = 0.08 * Math.sin(t * loopW(2.1) + i * 0.7) + 0.03 * Math.sin(t * loopW(5.3) + i);
    c.save(); c.translate(sx, 270); c.rotate(sw);
    line(c, 0, 0, 0, 80, 12, '#1E2436');
    c.beginPath(); c.ellipse(0, 114, 28, 34, 0, 0, Math.PI * 2); c.lineWidth = 12; c.strokeStyle = '#E8E2D0'; c.stroke();
    c.restore();
  }
}

// ---------------------------------------------------------------- his hands, from his own eyes (pov space)
// one hand: side -1 = his left hand, from the left edge; +1 = his right hand, from the right edge. The fingertip is at
// (tx, ty). Drawn flat with a little painted shading (it goes onto a cached canvas: the light leaves it as drawn).
function fsHand(c, side, tx, ty, fw = FSP.fw) {
  const s = side, r = fw / 2 / FSP.hs;
  c.save(); c.translate(tx, ty); c.scale(-s * FSP.hs, FSP.hs);   // local: the finger points +x, toward the middle; the hand is at -x
  // the forearm in his coat sleeve, rising from the bottom corner to the wrist
  c.beginPath(); c.moveTo(-470, 40); c.lineTo(-250, 150); c.lineTo(-520, 1150); c.lineTo(-980, 1000); c.closePath();
  c.fillStyle = PAL.coat; c.fill();
  c.beginPath(); c.moveTo(-470, 40); c.lineTo(-420, 66); c.lineTo(-900, 1030); c.lineTo(-980, 1000); c.closePath(); c.fillStyle = PAL.coatHi; c.fill();
  c.save(); c.translate(-372, 150); c.rotate(0.46); rrect(c, -150, -46, 300, 92, 40); c.fillStyle = PAL.coatSh; c.fill(); c.restore();   // the cuff
  // the back of the hand: the curled fingers' knuckles down its front edge, the thumb tucked under the index finger
  rrect(c, -470, -60, 270, 220, 90); c.fillStyle = FS_SKIN; c.fill();
  for (let i = 0; i < 3; i++) circle(c, -214 + 6 * i, 40 + i * 52, 36 - 3 * i, i % 2 ? '#EDA987' : FS_SKIN);
  rrect(c, -420, 120, 210, 62, 31); c.fillStyle = '#E39D79'; c.fill();
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-300, 14 + i * 50); c.quadraticCurveTo(-262, 8 + i * 52, -236, 22 + i * 52); c.lineWidth = 5; c.strokeStyle = 'rgba(176,100,72,0.45)'; c.lineCap = 'round'; c.stroke(); }
  // the index finger
  c.beginPath(); c.moveTo(-250, -r); c.lineTo(0, -r); c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); c.lineTo(-250, r); c.closePath();
  const g = c.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, '#FFD3B6'); g.addColorStop(0.45, FS_SKIN); g.addColorStop(1, FS_SKIN_D);
  c.fillStyle = g; c.fill();
  ellipse(c, -250, -4, 46, r + 8, FS_SKIN);   // the index knuckle
  for (const x of [-170, -86]) {
    c.beginPath(); c.moveTo(x - 6, -r + 9); c.quadraticCurveTo(x + 8, 0, x - 6, r - 9); c.lineWidth = 5; c.strokeStyle = 'rgba(176,100,72,0.5)'; c.lineCap = 'round'; c.stroke();
  }
  rrect(c, -54, -r + 8, 50, r * 1.2, 20); c.fillStyle = FS_NAIL; c.fill();          // the nail (we look along the top of it)
  rrect(c, -46, -r + 14, 32, 11, 5); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
  c.restore();
}
// both hands at a horizontal offset dx (pov space), into the context c
function fsHands(c, dx, o = {}) {
  const g = o.g === undefined ? FSP.g : o.g, ty = FSP.tipY + (o.dy || 0);
  fsHand(c, -1, FSP.cx - g / 2 + dx, ty);
  fsHand(c, 1, FSP.cx + g / 2 + dx, ty);
}
function fsTintCanvas(cv, col, k, band) {
  if (k <= 0.01) return;
  const x = cv.getContext('2d');
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
  x.fillStyle = rgba(col, 0.62 * clamp(k));
  if (band) {   // only the fingers' band (screen y0..y1), with soft edges: the arms below keep their colour
    const g = x.createLinearGradient(0, band[0], 0, band[1]);
    g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.2, rgba(col, 0.62 * clamp(k))); g.addColorStop(0.8, rgba(col, 0.62 * clamp(k))); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, band[0], W, band[1] - band[0]);
  } else x.fillRect(0, 0, W, H);
  x.restore();
}
// where the sausage is (pov space): the right eye's right fingertip to the left eye's left fingertip
function fsSausageBox(o = {}) {
  const d = o.d === undefined ? FSP.d : o.d, g = o.g === undefined ? FSP.g : o.g;
  return [FSP.cx + g / 2 - d / 2, FSP.cx - g / 2 + d / 2, FSP.tipY + (o.dy || 0), FSP.fw / 2];
}
function fsFingers(V, o = {}) {
  const d = o.d === undefined ? FSP.d : o.d, blur = o.blur || 0, tint = o.tint || 0, al = o.alpha === undefined ? 1 : o.alpha;
  const prep = (cv, dx) => {
    const x = cv.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
    x.setTransform(V.s, 0, 0, V.s, V.x, V.y);
    fsHands(x, dx, o);
  };
  const band = [V.y + (FSP.tipY - 150) * V.s, V.y + (FSP.tipY + 130) * V.s];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (o.clip) { o.clip(ctx); ctx.clip(); }
  ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
  ctx.globalAlpha = al;
  if (o.one) {                                   // one eye shut: that eye's copy alone, solid
    prep(FS_A, o.one === 'L' ? d / 2 : -d / 2);
    fsTintCanvas(FS_A, o.one === 'L' ? FS_TEAL : FS_ORANGE, tint, band);
    ctx.drawImage(FS_A, 0, 0);
  } else if (d < 0.5) {                          // looking AT the fingers: the two copies agree
    prep(FS_A, 0);
    ctx.drawImage(FS_A, 0, 0);
  } else {
    prep(FS_A, d / 2); prep(FS_B, -d / 2);
    // the overlap first (before the copies are tinted): where both eyes see a finger
    const xi = FS_I.getContext('2d');
    xi.setTransform(1, 0, 0, 1, 0, 0); xi.clearRect(0, 0, W, H);
    xi.globalCompositeOperation = 'source-over'; xi.drawImage(FS_A, 0, 0);
    xi.globalCompositeOperation = 'destination-in'; xi.drawImage(FS_B, 0, 0);
    xi.globalCompositeOperation = 'source-over';
    fsTintCanvas(FS_A, FS_TEAL, tint, band); fsTintCanvas(FS_B, FS_ORANGE, tint, band);
    ctx.globalAlpha = al * 0.46; ctx.drawImage(FS_A, 0, 0); ctx.drawImage(FS_B, 0, 0);
    ctx.globalAlpha = al; ctx.drawImage(FS_I, 0, 0);
  }
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  ctx.restore();
  // the sausage, outlined and glowing (screen space, under the same clip)
  const k = clamp(o.sausage || 0);
  if (k > 0.01 && !o.one && d > (o.g === undefined ? FSP.g : o.g) + 20) {
    const [x0, x1, y, r] = fsSausageBox(o);
    const P = (px, py) => [V.x + px * V.s, V.y + py * V.s];
    const A = P(x0, y), B = P(x1, y), R = (r + 10) * V.s;
    const path = (c, sc = 1) => { c.beginPath(); c.moveTo(A[0] * sc, (A[1] - R) * sc); c.lineTo(B[0] * sc, (B[1] - R) * sc); c.arc(B[0] * sc, B[1] * sc, R * sc, -Math.PI / 2, Math.PI / 2); c.lineTo(A[0] * sc, (A[1] + R) * sc); c.arc(A[0] * sc, A[1] * sc, R * sc, Math.PI / 2, Math.PI * 1.5); c.closePath(); };
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (o.clip) { o.clip(ctx); ctx.clip(); }
    paint(() => { path(ctx); ctx.lineWidth = 7 * Math.max(0.6, V.s); ctx.setLineDash([22 * V.s, 14 * V.s]); ctx.lineDashOffset = -(o.t || 0) * 60; ctx.strokeStyle = rgba('#FFD447', k); ctx.stroke(); });
    ctx.restore();
    gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); path(gctx, 0.5); gctx.lineWidth = 10 * V.s; gctx.strokeStyle = rgba('#FFD447', 0.55 * k); gctx.stroke(); gctx.restore();
  }
}
function fsBackdropC(x, t, o) { fsBackdrop(t, o, x); }
// the whole picture (backdrop + hands) under V; o: fsFingers' options + {pass, glowA, backBlur}
function fsPovView(t, V, o = {}) {
  fsPovSet(V);
  fsBackdrop(t, o);
  fsFingers(V, Object.assign({ t }, o));
}
