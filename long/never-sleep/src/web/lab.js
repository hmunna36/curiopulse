// The lab (tickle-yourself): a cool teal room with a long bench. Three set-ups on it:
//  - the tickle robot (Blakemore, Frith & Wolpert 1999): his LEFT hand moves a handle on robot 1; robot 2 moves a soft
//    foam tip over his RIGHT palm, either in sync or late by a delay (the dial reads 0.0 s or 0.2 s); a TICKLE meter;
//  - the finger-press rig (Shergill et al. 2003): two forearms from both sides, two fingers on a little plate, force
//    bars that climb turn by turn;
//  - the rat tank (Panksepp; Ishiyama & Brecht 2016): a rat on its back being tickled by a gloved hand, a bat detector
//    showing its chirps at ~50 kHz above the line where human hearing stops (~20 kHz).
// World coords = screen coords at zoom 1. Loaded before scenes.js.
'use strict';

const LAB = { benchY: 700, hx: 960, hy: 792, hs: 0.8 };
const LABCOAT = Object.assign({}, HOMEPAL, { coat: '#F2F5FA', coatSh: '#C6CEDD', coatHi: '#FFFFFF', coatDk: '#AEB8CC', strap: '#F2F5FA', strapSh: '#C6CEDD' });
let LAB_BG = null;

function initLab() {
  const cv = mkCanvas(W * 2 + 800, H * 2 + 400), c = cv.getContext('2d');
  c.setTransform(2, 0, 0, 2, 400, 200);
  const g = c.createLinearGradient(0, -200, 0, LAB.benchY);
  g.addColorStop(0, '#123A4A'); g.addColorStop(1, '#0A2230');
  c.fillStyle = g; c.fillRect(-400, -200, W + 800, H + 400);
  // wall tiles
  for (let y = -180; y < LAB.benchY; y += 64) for (let x = -400 + ((y / 64) % 2) * 32; x < W + 400; x += 64) {
    c.fillStyle = 'rgba(160,230,240,0.035)'; c.fillRect(x + 3, y + 3, 58, 58);
  }
  // shelves with glassware (left and right, high)
  for (const [sx, sw] of [[90, 420], [1430, 420]]) {
    rrect(c, sx, 250, sw, 16, 4); c.fillStyle = '#244E5E'; c.fill();
    const rs = mulberry32(sx);
    for (let i = 0; i < 6; i++) {
      const x = sx + 30 + i * 64, h = 50 + rs() * 50, col = ['#4DFFB4', '#FF86A6', '#7FE9FF', '#FFD447'][i % 4];
      c.beginPath(); c.moveTo(x, 250); c.lineTo(x + 34, 250); c.lineTo(x + 26, 250 - h); c.lineTo(x + 8, 250 - h); c.closePath();
      c.fillStyle = 'rgba(200,240,255,0.18)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(200,240,255,0.5)'; c.stroke();
      c.beginPath(); c.moveTo(x + 2, 250); c.lineTo(x + 32, 250); c.lineTo(x + 29, 250 - h * 0.45); c.lineTo(x + 5, 250 - h * 0.45); c.closePath();
      c.fillStyle = rgba(col, 0.55); c.fill();
    }
  }
  // a big window-light panel at the back (soft)
  const pg = c.createLinearGradient(0, 120, 0, 560); pg.addColorStop(0, 'rgba(160,240,255,0.10)'); pg.addColorStop(1, 'rgba(160,240,255,0.02)');
  c.fillStyle = pg; c.fillRect(700, 110, 520, 420);
  for (let i = 1; i < 4; i++) c.fillRect(700 + i * 130 - 2, 110, 4, 420);
  // the bench
  const bg2 = c.createLinearGradient(0, LAB.benchY, 0, H + 200);
  bg2.addColorStop(0, '#E8EEF5'); bg2.addColorStop(0.06, '#AFC0D0'); bg2.addColorStop(0.07, '#2A3C52'); bg2.addColorStop(1, '#0E1726');
  c.fillStyle = bg2; c.fillRect(-400, LAB.benchY, W + 800, H - LAB.benchY + 200);
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(-400, LAB.benchY, W + 800, 3);
  LAB_BG = cv;
}
function labBack(cam, t, o = {}) {
  applyCam(cam);
  ctx.drawImage(LAB_BG, -200, -100, W + 400, H + 200);
  // a cold overhead light pool
  softDot(ctx, 960, 400, 900, '#9FF0FF', 0.07);
  softDot(gctx, 960, 180, 300, '#BFF6FF', 0.25);
}

// the hero seated behind the bench (only the upper body shows). h: {L, R (IK targets, rig-local), face, shake, pal, x}
function labHero(cam, t, h = {}) {
  const shk = h.shake || 0;
  const st = { x: (h.x || LAB.hx) + shk * 5 * Math.sin(t * 38), y: LAB.hy + shk * 3 * Math.abs(Math.sin(t * 21)), s: LAB.hs, noLegs: true, seed: 4,
    face: h.face || FACES.calm, headDX: (h.headDX || 0) + shk * 4 * Math.sin(t * 29), headDY: h.headDY || 0, headRot: (h.headRot || 0) + shk * 0.07 * Math.sin(t * 15) };
  let p = { hipY: -34, lean: h.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  p = ikReach(p, 'L', h.L || [-110, -100], -1); p = ikReach(p, 'R', h.R || [110, -100], -1);
  st.pose = p;
  return figure(cam, st, t, { pal: h.pal || LABCOAT, warm: 0.4, warmX: 960, warmCol: '#BFF6FF', ambient: 0.12, post: h.post });
}

// robot 1: a box with a handle on top that his left hand holds (x = the handle's side-to-side offset in px)
function robotHandle(x0, y0, off, t, o = {}) {
  const c = ctx;
  rrect(c, x0 - 120, y0 - 70, 240, 74, 14); c.fillStyle = '#3A4A66'; c.fill();
  rrect(c, x0 - 120, y0 - 70, 240, 20, 10); c.fillStyle = '#56688A'; c.fill();
  // the slot and the handle
  rrect(c, x0 - 80, y0 - 74, 160, 10, 5); c.fillStyle = '#141C2C'; c.fill();
  line(c, x0 + off, y0 - 70, x0 + off * 1.2, y0 - 180, 14, '#8A9AB8');
  circle(c, x0 + off * 1.2, y0 - 186, 24, '#E2424B'); circle(c, x0 + off * 1.2 - 7, y0 - 193, 7, '#FF9AA0');
  // the delay readout on the box
  if (o.delay !== undefined) {
    rrect(c, x0 - 96, y0 - 44, 192, 40, 8); c.fillStyle = '#0A1220'; c.fill();
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = o.delay > 0.05 ? '#FFD447' : '#4DFFB4';
    c.fillText(`DELAY ${o.delay.toFixed(1)} s`, x0, y0 - 23);
    if (o.delay > 0.05) softDot(gctx, x0, y0 - 23, 60, '#FFD447', 0.5);
  }
  return [x0 + off * 1.2, y0 - 186];
}
// robot 2: a base on the right, a two-segment arm, the foam tip at (fx, fy)
function robotArm(bx, by, fx, fy, t) {
  const c = ctx;
  rrect(c, bx - 70, by - 60, 140, 64, 12); c.fillStyle = '#3A4A66'; c.fill();
  circle(c, bx, by - 64, 30, '#56688A');
  // elbow by simple IK (bend up)
  const L1 = 230, L2 = 220, dx = fx - bx, dy = fy - 30 - (by - 64), d = clamp(Math.hypot(dx, dy), 30, L1 + L2 - 1);
  const a0 = Math.atan2(dy, dx), A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const ex = bx + Math.cos(a0 + A) * L1, ey = by - 64 + Math.sin(a0 + A) * L1;
  line(c, bx, by - 64, ex, ey, 30, '#8A9AB8'); line(c, bx, by - 64, ex, ey, 14, '#B4C2DA');
  line(c, ex, ey, fx, fy - 30, 24, '#8A9AB8'); line(c, ex, ey, fx, fy - 30, 10, '#B4C2DA');
  circle(c, ex, ey, 20, '#56688A'); circle(c, ex, ey, 8, '#FFD447');
  // the foam tip: a soft pink-yellow sponge cylinder
  line(c, fx, fy - 32, fx, fy - 10, 10, '#56688A');
  rrect(c, fx - 18, fy - 12, 36, 30, 12); c.fillStyle = '#FFD47A'; c.fill();
  for (let i = 0; i < 6; i++) circle(c, fx - 10 + (i % 3) * 10, fy - 2 + Math.floor(i / 3) * 10, 2.4, 'rgba(160,110,40,0.45)');
}
// a vertical TICKLE meter (screen or world, current transform): v 0..1
function tickleMeter(x, y, h, v, t, k = 1) {
  if (k <= 0) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6);
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -50, -h / 2 - 70, 100, h + 120, 26); c.fillStyle = 'rgba(8,12,34,0.88)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FF86A6'; c.stroke();
  const fill = clamp(v) * (h - 20), col = v > 0.66 ? '#FF5A6E' : v > 0.33 ? '#FF9A3C' : '#4DFFB4';
  rrect(c, -26, h / 2 - 10 - fill, 52, fill, 12); c.fillStyle = col; c.fill();
  for (let i = 1; i < 5; i++) line(c, -34, h / 2 - 10 - i * (h - 20) / 5, -22, h / 2 - 10 - i * (h - 20) / 5, 3, 'rgba(255,255,255,0.4)');
  c.font = '400 36px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FF86A6';
  c.fillText('TICKLE', 0, -h / 2 - 38);
  c.restore();
  if (v > 0.5) softDot(gctx, x, y + h / 2 - fill, 80, col, 0.5 * (v - 0.4));
}

// ---------------------------------------------------------------- the finger-press rig
// a forearm with a pointing index finger, from the side `side` (-1 = from the left), fingertip at (x, y); press 0..1
function pointArm(x, y, side, sleeve, sleeveSh, press = 0) {
  const c = ctx;
  c.save(); c.translate(x, y + 16 * press); c.scale(side, 1);
  // sleeve from off-screen
  line(c, 360, 120, 1100, 260, 140, sleeveSh); line(c, 360, 112, 1100, 250, 124, sleeve);
  rrect(c, 330, 40, 70, 150, 30); c.fillStyle = sleeveSh; c.fill();
  // fist + index finger pointing at x = 0
  ellipse(c, 250, 110, 92, 70, PAL.skinSh); ellipse(c, 246, 104, 84, 62, PAL.skin);
  for (let i = 0; i < 3; i++) { ellipse(c, 184 + i * 8, 140 + i * 6, 34, 20, PAL.skinSh); }
  c.beginPath(); c.moveTo(200, 70); c.lineTo(28, 60); c.quadraticCurveTo(0, 74, 28, 98); c.lineTo(200, 112); c.closePath();
  c.fillStyle = PAL.skin; c.fill(); c.lineWidth = 4; c.strokeStyle = PAL.skinSh; c.stroke();
  ellipse(c, 34, 72, 14, 9, '#FFE4E0');   // the nail
  line(c, 110, 66, 110, 104, 3, 'rgba(160,90,60,0.4)');
  c.restore();
}
// a force bar (screen space): value v in "N", max m; label below
function forceBar(x, y, h, v, m, col, label, k = 1) {
  if (k <= 0) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.scale(s, s);
  rrect(c, -48, -h, 96, h, 18); c.fillStyle = 'rgba(8,12,34,0.85)'; c.fill(); c.lineWidth = 4; c.strokeStyle = col; c.stroke();
  const f = clamp(v / m) * (h - 16);
  rrect(c, -36, -8 - f, 72, f, 12); c.fillStyle = col; c.fill();
  c.font = '900 54px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF';
  c.fillText(label, 0, 46);
  c.restore();
  softDot(gctx, x, y - 8 - f, 70, col, 0.4 * clamp(k));
}

// ---------------------------------------------------------------- the rat
// a lab rat, side view, facing right; o: {belly 0..1 (rolled on its back), jump 0..1, happy 0..1, t}
function drawRat(c, x, y, s, t, o = {}) {
  const roll = o.belly || 0, jp = o.jump || 0;
  c.save(); c.translate(x, y - 120 * Math.sin(Math.PI * clamp(jp)) * s); c.scale(s, s);
  c.rotate(-Math.PI * 0.9 * roll + 0.25 * Math.sin(Math.PI * clamp(jp)));
  // tail
  c.beginPath(); c.moveTo(-90, 10); c.bezierCurveTo(-170, 30, -200, -40, -260, -10 + 10 * Math.sin(t * 6));
  c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#F2A8B8'; c.stroke();
  // body
  ellipse(c, 0, 0, 110, 62, '#E9E6EE'); ellipse(c, -10, 14, 90, 40, '#FFFFFF');
  ellipse(c, 10, -20, 80, 30, 'rgba(255,255,255,0.6)');
  // head
  c.save(); c.translate(100, -10); c.rotate(0.15 * Math.sin(t * 9) * (o.happy || 0));
  ellipse(c, 0, 0, 62, 44, '#EEEBF2');
  c.beginPath(); c.moveTo(30, -30); c.quadraticCurveTo(90, -6, 88, 6); c.quadraticCurveTo(70, 30, 20, 34); c.closePath(); c.fillStyle = '#EEEBF2'; c.fill();
  circle(c, 88, 4, 9, '#F28AA0');
  for (const s2 of [-1, 1]) line(c, 80, 6, 128, 6 + s2 * 16, 2, 'rgba(120,110,130,0.7)');
  line(c, 80, 8, 130, 4, 2, 'rgba(120,110,130,0.7)');
  // ear
  ellipse(c, -16, -40, 26, 30, '#F2B6C4'); ellipse(c, -16, -40, 18, 22, '#F7CCD6');
  // eye: a happy squint when tickled
  if ((o.happy || 0) > 0.4) { c.beginPath(); c.arc(30, -6, 9, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 4; c.strokeStyle = '#2A1020'; c.stroke(); }
  else { circle(c, 30, -6, 8, '#2A1020'); circle(c, 27, -9, 2.5, '#FFFFFF'); }
  // open mouth (chirping)
  if ((o.happy || 0) > 0.2) ellipse(c, 64, 22, 9, 6 + 3 * Math.abs(Math.sin(t * 20)), '#7A2A3A');
  c.restore();
  // feet
  for (const [fx, fy] of [[60, 50], [-50, 52]]) { ellipse(c, fx, fy + 8 * Math.sin(t * 14 + fx) * roll, 16, 9, '#F2A8B8'); }
  c.restore();
}
// a gloved hand (blue nitrile), fingers wiggling, entering from the right; tip at (x, y)
function gloveHand(x, y, t, wig = 1, s = 1) {
  const c = ctx, blue = '#5B8BE8', dk = '#2F5AB8';
  c.save(); c.translate(x, y); c.scale(s, s);
  // forearm + cuff, from the right
  line(c, 150, 30, 620, 110, 78, dk); line(c, 150, 24, 620, 104, 66, blue);
  rrect(c, 120, -16, 46, 92, 16); c.fillStyle = '#7FA6F0'; c.fill();
  // palm, facing down, four fingers that wiggle (tickling), a thumb
  ellipse(c, 70, 24, 70, 44, dk); ellipse(c, 68, 20, 64, 38, blue);
  for (let i = 0; i < 4; i++) {
    const bend = 0.5 + 0.45 * wig * Math.sin(t * 24 + i * 1.4);
    const bx = 18, by = -6 + i * 15, mx = bx - 46, my = by + 6 + 20 * bend, tx = mx - 20, ty = my + 26 * bend;
    poly(c, [[bx, by], [mx, my], [tx, ty]], 22, dk); poly(c, [[bx, by], [mx, my], [tx, ty]], 16, blue);
    circle(c, tx, ty, 8, '#7FA6F0');
  }
  poly(c, [[90, 44], [60, 70], [30, 74]], 22, dk); poly(c, [[90, 44], [60, 70], [30, 74]], 16, blue);
  ellipse(c, 80, 6, 30, 10, 'rgba(255,255,255,0.25)', -0.2);
  c.restore();
}
// the bat detector: a little screen with a frequency axis; a band at ~50 kHz, the 20 kHz human line
function batDetector(x, y, t, k, on) {
  if (k <= 0) return;
  const c = ctx, s = E.outBack(clamp(k), 1.6), w = 420, h = 300;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.scale(s, s);
  rrect(c, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 22); c.fillStyle = '#20263F'; c.fill();
  rrect(c, -w / 2, -h / 2, w, h, 10); c.fillStyle = '#060A14'; c.fill();
  // y axis: 0 (bottom) .. 70 kHz (top)
  const yk = (f) => h / 2 - 20 - (f / 70) * (h - 40);
  c.font = '800 22px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle';
  // human hearing zone
  c.fillStyle = 'rgba(127,233,255,0.12)'; c.fillRect(-w / 2, yk(20), w, h / 2 - yk(20));
  c.setLineDash([12, 8]); line(c, -w / 2, yk(20), w / 2, yk(20), 4, '#7FE9FF'); c.setLineDash([]);
  c.fillStyle = '#7FE9FF'; c.fillText('YOUR EARS', -w / 2 + 12, yk(20) + 24);
  // chirps: short rising-falling strokes around 50 kHz
  if (on > 0) for (let i = 0; i < 12; i++) {
    const ph = ((t * 2.2 + i / 12) % 1), xx = w / 2 - 20 - ph * (w - 40), f = 48 + 6 * Math.sin(i * 1.7 + t);
    const a = on * (0.4 + 0.6 * Math.sin(Math.PI * ph));
    c.beginPath(); c.moveTo(xx - 14, yk(f - 4)); c.quadraticCurveTo(xx, yk(f + 6), xx + 14, yk(f - 2)); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = `rgba(255,134,166,${a})`; c.stroke();
  }
  c.font = '400 40px Anton'; c.fillStyle = '#FF86A6'; c.textAlign = 'right';
  c.fillText('50 kHz', w / 2 - 14, yk(62));
  c.restore();
  if (on > 0) softDot(gctx, x + 60 * s, y + (yk(50)) * s, 150, '#FF86A6', 0.35 * on);
}
