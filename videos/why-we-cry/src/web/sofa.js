// A sad film at home (why-we-cry): the living room at night with one warm lamp on, a couch in front of a TV we never
// see (it is the camera; its light flickers over everything), the hero on the left cushion with a tub of ice cream,
// a spoon, a great many tears, a lamp that pops out of the top of his head, a box of tissues.
// World coords = screen coords at zoom 1. The room is goosebumps' room, relit and drawn for the cinematic look
// (the wall is one cached picture; the couch, the props and everybody on it are shapes, so they take the light).
'use strict';

const SOFA = { seatY: 1250, hx: 430, hs: 1.12, dogX: 704, dogY: 1232, lampX: 1004, lampY: 770 };
// home clothes: a soft blue hoodie with the sleeves pushed up
const CRYPAL = Object.assign({}, PAL, {
  coat: '#5B7FD6', coatSh: '#3C59A8', coatHi: '#8FB0FF', coatDk: '#2C4488',
  strap: '#5B7FD6', strapSh: '#3C59A8', pants: '#3A3F58', pantsSh: '#262A40',
  shoe: '#E8E4D8', shoeSh: '#B8B2A0', sole: '#8A8576', shortSleeve: true, pj: false, home: true,
});
const TEAR = { fill: '#9EDCFF', hi: '#FFFFFF', edge: '#2F6FC4', glow: '#7FD0FF' };
let SOFA_STATIC = null;

// the TV's light: a restless blue flicker (it goes round a whole number of times in the Short, so the loop holds)
function tvFlicker(t) {
  return 0.62 + 0.2 * Math.sin(t * loopW(3.1) + 1) * Math.sin(t * loopW(7.7)) + 0.12 * Math.sin(t * loopW(13.0) + 2);
}

function initSofa() {
  // the static room, drawn once: wall, window, picture, floor, rug
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1A2150'); g.addColorStop(0.72, '#0D1230'); g.addColorStop(1, '#05060F');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = 30; x < W; x += 90) { c.fillStyle = 'rgba(255,255,255,0.022)'; c.fillRect(x, 0, 44, 1430); }
  // the lamp's warm wash on the wall (right)
  const lg = c.createRadialGradient(SOFA.lampX, SOFA.lampY, 20, SOFA.lampX, SOFA.lampY, 620);
  lg.addColorStop(0, 'rgba(255,190,120,0.34)'); lg.addColorStop(0.5, 'rgba(255,160,90,0.10)'); lg.addColorStop(1, 'rgba(255,160,90,0)');
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  // window (left): night sky, a moon, the cross bars, heavy curtains
  const wx = 96, wy = 430, ww = 250, wh = 360;
  rrect(c, wx - 14, wy - 14, ww + 28, wh + 28, 10); c.fillStyle = '#2B3364'; c.fill();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#132456'); sky.addColorStop(1, '#27408A');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  const rs = mulberry32(5);
  for (let i = 0; i < 26; i++) circle(c, wx + rs() * ww, wy + rs() * wh * 0.8, 1 + rs() * 1.8, `rgba(220,230,255,${0.4 + rs() * 0.5})`);
  softDot(c, wx + 170, wy + 100, 120, '#BFD2FF', 0.35); circle(c, wx + 170, wy + 100, 34, '#EAF0FF'); circle(c, wx + 158, wy + 92, 9, 'rgba(180,195,235,0.7)');
  c.fillStyle = '#2B3364'; c.fillRect(wx + ww / 2 - 6, wy, 12, wh); c.fillRect(wx, wy + wh / 2 - 6, ww, 12);
  for (const s of [-1, 1]) {   // curtains
    const cx = s < 0 ? wx - 44 : wx + ww - 26;
    const cg = c.createLinearGradient(cx, 0, cx + 70, 0); cg.addColorStop(0, '#4A1F3F'); cg.addColorStop(0.5, '#6B2C55'); cg.addColorStop(1, '#3A1832');
    c.fillStyle = cg; rrect(c, cx, wy - 40, 70, wh + 90, 14); c.fill();
    for (let i = 1; i < 4; i++) line(c, cx + i * 17, wy - 30, cx + i * 17, wy + wh + 40, 3, 'rgba(0,0,0,0.22)');
  }
  rrect(c, wx - 60, wy - 56, ww + 120, 22, 10); c.fillStyle = '#20264C'; c.fill();
  // a framed picture (right): the cat
  const px = 700, py = 500, pw = 190, ph = 226;
  rrect(c, px - 14, py - 14, pw + 28, ph + 28, 8); c.fillStyle = '#6A4A2A'; c.fill();
  c.fillStyle = '#243A6A'; c.fillRect(px, py, pw, ph);
  c.save(); c.translate(px + pw / 2, py + ph - 20); c.scale(0.9, 0.9);
  ellipse(c, 0, -52, 58, 64, '#C8742E'); circle(c, 0, -140, 46, '#D8843A');
  c.beginPath(); c.moveTo(-44, -160); c.lineTo(-34, -206); c.lineTo(-10, -176); c.moveTo(44, -160); c.lineTo(34, -206); c.lineTo(10, -176); c.fillStyle = '#D8843A'; c.fill();
  circle(c, -17, -144, 6, '#1A1A22'); circle(c, 17, -144, 6, '#1A1A22'); ellipse(c, 0, -128, 5, 3.5, '#F29AA8');
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 90, py); c.lineTo(px, py + 120); c.fill();
  // skirting + floor boards
  c.fillStyle = '#141A3C'; c.fillRect(0, 1404, W, 26);
  const fg = c.createLinearGradient(0, 1430, 0, H); fg.addColorStop(0, '#15122A'); fg.addColorStop(1, '#07060F');
  c.fillStyle = fg; c.fillRect(0, 1430, W, H - 1430);
  for (let i = 0; i < 7; i++) line(c, 0, 1470 + i * i * 12 + i * 30, W, 1470 + i * i * 12 + i * 30, 2, 'rgba(0,0,0,0.3)');
  ellipse(c, 540, 1560, 520, 90, '#3B2452'); ellipse(c, 540, 1560, 470, 72, '#4A2E66');   // a rug
  SOFA_STATIC = cv;
}

// the room behind the couch. o: {lamp: 0..1 (how bright the floor lamp is; default 1)}
function sofaRoom(cam, t, o = {}) {
  applyCam(cam);
  ctx.drawImage(SOFA_STATIC, 0, 0);
  softDot(gctx, 266, 530, 150, '#9FB8FF', 0.45);                 // the moon blooms
  // the floor lamp (far right), lit
  const lamp = o.lamp === undefined ? 1 : o.lamp, c = ctx, X = SOFA.lampX;
  line(c, X, 1430, X, 840, 9, '#2A2440'); ellipse(c, X, 1432, 46, 10, '#2A2440');
  c.beginPath(); c.moveTo(X - 62, 836); c.lineTo(X + 62, 836); c.lineTo(X + 36, 700); c.lineTo(X - 36, 700); c.closePath();
  c.fillStyle = mixHex('#3A3060', '#FFD9A0', 0.85 * lamp); c.fill();
  softDot(gctx, X, SOFA.lampY, 150, '#FFC27A', 0.55 * lamp); softDot(gctx, X, SOFA.lampY + 10, 330, '#FF9A50', 0.16 * lamp);
}

// the couch: back + cushions (behind whoever sits on it) ...
function sofaCouchBack() {
  const c = ctx;
  for (const s of [-1, 1]) { rrect(c, 540 + s * 380 - 60, 1380, 120, 60, 10); c.fillStyle = '#0C1F24'; c.fill(); }   // feet
  rrect(c, 150, 890, 780, 440, 70); c.fillStyle = '#1F5965'; c.fill();
  for (const x of [176, 546]) {   // back cushions
    rrect(c, x, 916, 358, 330, 56); c.fillStyle = '#2C7483'; c.fill();
    paint(() => { c.beginPath(); c.moveTo(x + 50, 934); c.quadraticCurveTo(x + 179, 922, x + 308, 934); c.lineWidth = 5; c.strokeStyle = 'rgba(190,240,250,0.16)'; c.lineCap = 'round'; c.stroke(); });
  }
  for (const x of [172, 546]) { rrect(c, x, 1212, 362, 128, 34); c.fillStyle = '#35899A'; c.fill(); }   // seat cushions
  paint(() => { line(c, 196, 1222, 510, 1222, 4, 'rgba(200,245,255,0.14)'); line(c, 570, 1222, 884, 1222, 4, 'rgba(200,245,255,0.14)'); });
}
// ... and its arms + base (in front of the cushions, behind the shins)
function sofaCouchFront() {
  const c = ctx;
  rrect(c, 150, 1322, 780, 78, 22); c.fillStyle = '#12363E'; c.fill();
  for (const x of [96, 838]) {
    rrect(c, x, 1030, 146, 372, 62); c.fillStyle = '#225F6C'; c.fill();
    paint(() => { rrect(c, x + 12, 1040, 122, 70, 34); c.fillStyle = 'rgba(190,240,250,0.10)'; c.fill(); });
  }
}
// seated legs: thighs toward the camera (foreshortened), shins down, shoes front-on. Rig-local (x, y, s like st).
function sofaLegs(c, x, y, s, pal) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 41 - 25, 30, 50, 180, 20); c.fillStyle = pal.pantsSh; c.fill();
    rrect(c, sd * 39 - 31, -26, 62, 78, 28); c.fillStyle = pal.pants; c.fill();
    drawShoe(c, [sd * 41, 196], sd, pal, 1, false);
  }
  c.restore();
}
// the TV's light over the whole frame (call last, in the shot): additive blue from the front, stronger with the flicker
function tvWash(t, amt = 1) {
  const f = tvFlicker(t) * amt;
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(540, 1750, 80, 540, 1500, 1250);
  g.addColorStop(0, `rgba(110,150,255,${clamp(0.17 * f)})`); g.addColorStop(0.6, `rgba(70,100,220,${clamp(0.07 * f)})`); g.addColorStop(1, 'rgba(40,60,160,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  softDot(gctx, 540, 1800, 700, '#5F86FF', clamp(0.13 * f));
}

// ---------------------------------------------------------------- props
// a box of tissues (centre of its base) with one standing up out of the slot; and used ones
function tissueBox(c, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-10, -62); c.quadraticCurveTo(-34, -118, -6, -128); c.quadraticCurveTo(8, -112, 22, -134); c.quadraticCurveTo(40, -104, 14, -62); c.closePath();
  c.fillStyle = '#F4F7FF'; c.fill();
  rrect(c, -62, -66, 124, 66, 10); c.fillStyle = '#E86A8C'; c.fill();
  paint(() => { rrect(c, -30, -66, 60, 9, 4); c.fillStyle = '#7A2A44'; c.fill(); for (const dx of [-42, 42]) circle(c, dx, -30, 9, '#FFD0DC'); circle(c, 0, -28, 12, '#FFD0DC'); });
  c.restore();
}
function tissueWad(c, x, y, r, seed = 1) {
  c.fillStyle = '#EEF2FF';
  c.beginPath();
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2, rr = r * (0.78 + 0.3 * hash(i + seed * 13)); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.82); }
  c.closePath(); c.fill();
  paint(() => { line(c, x - r * 0.4, y - r * 0.1, x + r * 0.1, y + r * 0.2, 2, 'rgba(120,140,190,0.5)'); line(c, x + r * 0.1, y - r * 0.4, x + r * 0.4, y, 2, 'rgba(120,140,190,0.4)'); });
}

// a tub of strawberry ice cream (centre of the tub). o: {dent 0..1 (a spoon's hollow), drops: [[x, y]...] tear splashes}
function iceTub(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // the ice cream heaped over the rim
  c.fillStyle = '#FF9DBE';
  c.beginPath(); c.moveTo(-46, -34); c.quadraticCurveTo(-44, -62, -18, -58); c.quadraticCurveTo(-4, -76, 16, -60); c.quadraticCurveTo(44, -62, 46, -34); c.closePath(); c.fill();
  paint(() => {
    c.fillStyle = '#FFC4D8'; c.beginPath(); c.ellipse(-16, -54, 13, 5, -0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#E86A94'; for (const [dx, dy] of [[-28, -44], [6, -52], [26, -46], [-6, -42]]) { c.beginPath(); c.ellipse(dx, dy, 3.4, 2.4, 0.4, 0, Math.PI * 2); c.fill(); }
    if (o.dent > 0.02) { c.fillStyle = '#E87FA6'; c.beginPath(); c.ellipse(14, -52, 15 * o.dent, 8 * o.dent, -0.15, 0, Math.PI * 2); c.fill(); }
  });
  // the tub
  c.beginPath(); c.moveTo(-52, -36); c.lineTo(52, -36); c.lineTo(43, 40); c.quadraticCurveTo(0, 48, -43, 40); c.closePath();
  c.fillStyle = '#FFF6E6'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-52, -36); c.lineTo(52, -36); c.lineTo(43, 40); c.quadraticCurveTo(0, 48, -43, 40); c.closePath(); c.clip();
    c.fillStyle = '#E8507C'; c.fillRect(-60, -14, 120, 34);
    c.fillStyle = '#FFF6E6'; c.beginPath(); c.ellipse(0, 3, 22, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FF9DBE'; c.beginPath(); c.arc(0, 1, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8E86A'; c.beginPath(); c.ellipse(1, -7, 5, 2.6, -0.5, 0, Math.PI * 2); c.fill();
    c.restore();
  });
  rrect(c, -56, -42, 112, 12, 6); c.fillStyle = '#FFFFFF'; c.fill();
  c.restore();
}
// a spoon held at (hx, hy), pointing along `ang`; its bowl is 58 units out. o: {scoop 0..1 (ice cream on it), hide 0..1 (how
// much of the bowl is inside his mouth)}
function iceSpoon(c, hx, hy, ang, s = 1, o = {}) {
  c.save(); c.translate(hx, hy); c.rotate(ang); c.scale(s, s);
  const hide = o.hide || 0;
  if (hide > 0.01) { c.beginPath(); c.rect(-40, -40, 40 + 58 - 14 + 30 * (1 - hide), 80); c.clip(); }
  line(c, -16, 0, 44, 0, 7, '#C9D2E6');
  c.fillStyle = '#DCE4F4'; c.beginPath(); c.ellipse(58, 0, 16, 11, 0, 0, Math.PI * 2); c.fill();
  if ((o.scoop || 0) > 0.03) {
    const k = o.scoop;
    c.fillStyle = '#FF9DBE'; c.beginPath(); c.ellipse(58, -6 * k, 15 * k, 13 * k, 0, 0, Math.PI * 2); c.fill();
    paint(() => { c.fillStyle = '#FFC4D8'; c.beginPath(); c.ellipse(53, -11 * k, 6 * k, 3.4 * k, -0.3, 0, Math.PI * 2); c.fill(); });
  }
  c.restore();
}

// ---------------------------------------------------------------- tears
// one teardrop, point up (any context, any transform)
function tearDrop(c, x, y, r, a = 1, rot = 0) {
  if (a <= 0.01 || r <= 0.2) return;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath(); c.moveTo(0, -1.7 * r); c.bezierCurveTo(1.05 * r, -0.2 * r, 0.95 * r, r, 0, r); c.bezierCurveTo(-0.95 * r, r, -1.05 * r, -0.2 * r, 0, -1.7 * r);
  c.fillStyle = rgba(TEAR.fill, 0.96 * a); c.fill();
  c.lineWidth = Math.max(0.6, r * 0.16); c.strokeStyle = rgba(TEAR.edge, 0.7 * a); c.stroke();
  c.fillStyle = rgba(TEAR.hi, 0.9 * a); c.beginPath(); c.ellipse(-0.3 * r, 0.1 * r, 0.22 * r, 0.36 * r, 0.4, 0, Math.PI * 2); c.fill();
  c.restore();
}
// two arcs of tears from the outer corners of his eyes (head space: the eyes are at x = +-24, y = -2). k = how hard,
// reach = how far they fly (1 = a head's width to each side)
function tearArcs(c, t, k, reach = 1, seed = 0) {
  if (k <= 0.01) return;
  for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) {
    const p = ((t * 1.7 + i / 9 + (sd > 0 ? 0.055 : 0) + seed) % 1 + 1) % 1;
    const vx = sd * (150 + 46 * hash(i + seed * 9 + (sd > 0 ? 3 : 0))) * reach, vy = -150 - 40 * hash(i * 3 + 1);
    if (p < 0.05) continue;                               // (a drop that is still on his face reads as a smudge on his eye)
    const px = sd * 36 + vx * p, py = -4 + vy * p + 330 * p * p, a = k * (1 - p * 0.55);
    tearDrop(c, px, py, (5.2 + 2.2 * hash(i + 5)) * (0.75 + 0.35 * k), a, Math.atan2(vy + 660 * p, vx) - Math.PI / 2);
  }
}
// what the crying does to his face (head space, drawn over the finished head). o: {well 0..1 (the lower lids brim), run
// 0..1 (two streaks down the cheeks), pour 0..1 (the streaks become ribbons), jets 0..1, reach, bead: a single fat tear
// on the left cheek, 0 = at the lid, 1 = at the jaw}
function cryOnFace(c, t, o = {}) {
  const well = o.well || 0, run = o.run || 0, pour = o.pour || 0;
  paint(() => {
    if (well > 0.02) for (const sd of [-1, 1]) {   // a brim of water along each lower lid, and two wet glints in the eye
      c.fillStyle = rgba(TEAR.fill, 0.9 * clamp(well * 1.5));
      c.beginPath(); c.ellipse(sd * 24, 11 + 1.5 * well, 13.5, 3 + 3.6 * well + 0.7 * Math.sin(t * 13 + sd), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = rgba('#FFFFFF', 0.85 * clamp(well * 1.5));
      c.beginPath(); c.ellipse(sd * 24 - 5, 10 + well, 3.2, 1.3, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(sd * 24 + 5, 2 + Math.sin(t * 9 + sd), 2.1 * well, 0, Math.PI * 2); c.fill();
    }
    if (run > 0.02) for (const sd of [-1, 1]) {   // the streaks: from the lid down the cheek to the jaw
      const L = 54 * run, w = 5 + 8 * pour, x0 = sd * 27;
      c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = rgba(TEAR.fill, 0.9);
      c.beginPath(); c.moveTo(x0, 13); c.quadraticCurveTo(x0 + sd * 5, 13 + L * 0.5, x0 + sd * 1, 13 + L); c.stroke();
      c.lineWidth = Math.max(1.2, w * 0.3); c.strokeStyle = rgba('#FFFFFF', 0.8);
      c.beginPath(); c.moveTo(x0 - 1.4, 16); c.quadraticCurveTo(x0 + sd * 5 - 1.4, 13 + L * 0.5, x0 + sd * 1 - 1.4, 13 + L * 0.92); c.stroke();
      if (run > 0.9) for (let i = 0; i < 3; i++) {   // drops off the jaw
        const p = ((t * (1.5 + pour) + i / 3 + (sd > 0 ? 0.17 : 0)) % 1 + 1) % 1;
        tearDrop(c, x0 + sd * 1, 13 + L + 6 + 72 * p * p, 3.4 + 2.4 * pour, 1 - p * 0.85);
      }
    }
    if (o.bead !== undefined && o.bead >= 0 && o.bead <= 1) tearDrop(c, -27 - 4 * Math.sin(o.bead * 3), 14 + 50 * o.bead, 6.2, 1);
  });
  if (o.jets > 0.01) tearArcs(c, t, o.jets, o.reach === undefined ? 1 : o.reach, o.seed || 0);
}

// the lamp that pops out of the top of his head (head space; its base sits in his hair at y = -70). k = pop 0..1,
// on = 0..1 (flashing), col = '#FF4055' | green ...; returns nothing. Its light goes into the glow layer by the caller.
function headLamp(c, k, col, lit = 1) {
  if (k <= 0.01) return;
  const up = E.outBack(clamp(k), 2.6);
  c.save(); c.translate(0, -66); c.scale(1.45, 1.45 * up);
  line(c, 0, 0, 0, -22, 6, '#8A93AE');
  rrect(c, -17, -32, 34, 12, 4); c.fillStyle = '#3A4160'; c.fill();
  c.beginPath(); c.moveTo(-14, -32); c.lineTo(-14, -42); c.quadraticCurveTo(-14, -60, 0, -60); c.quadraticCurveTo(14, -60, 14, -42); c.lineTo(14, -32); c.closePath();
  c.fillStyle = mixHex('#5A2630', col, 0.35 + 0.65 * lit); c.fill();
  paint(() => { c.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * lit})`; c.beginPath(); c.ellipse(-5, -50, 3.2, 6, 0.3, 0, Math.PI * 2); c.fill(); });
  c.restore();
}

// ---------------------------------------------------------------- the hero on the couch
// point (lx, ly) of his head (head space) in rig-local coords, and then in world coords
function sofaHeadLocal(st, lx, ly) {
  const r = rig(st.pose), a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
  return [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
}
function sofaHeadPt(st, lx, ly) { const p = sofaHeadLocal(st, lx, ly); return [st.x + p[0] * st.s, st.y + p[1] * st.s]; }
function sofaHeadSpace(c, st, fn) {
  const r = rig(st.pose);
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(r.head[0] + (st.headDX || 0), r.head[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c); c.restore();
}

// Draw him on the couch from a description A:
//   face, headDX, headDY, headRot, lean, bob
//   tub: {x, y, rot} rig-local centre of the tub, or null (it stands on the seat beside him)
//   handL: [x, y] rig-local wrist target (default: under the tub), handR: [x, y]
//   spoon: {tip: [x, y] rig-local point its bowl aims at (or ang), scoop, hide} in his right hand, or null
//   tissue: 0..1 (both hands hold a tissue to his nose), puff
//   cry: {well, run, pour, jets, reach, bead}
//   lamp: {k, col, lit} the lamp on his head
//   tubDrops: tears that have landed in the tub (0..1 splash)
// Returns {st, r, head: [x, y] world, mouth, lampPt, tubPt, spoonTip}
// his rig state for a description A (no drawing): where his hands go, his face, his head
function sofaSt(A = {}) {
  const base = { hipY: -34 + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  const tub = A.tub === undefined ? { x: -30, y: -124, rot: -0.05 } : A.tub;
  let p = base;
  const hl = A.handL || (tub ? [tub.x - 50, tub.y + 14] : [-56, -44]);
  const hr = A.handR || [60, -44];
  p = ikReach(p, 'L', hl, A.bendL === undefined ? 1 : A.bendL);
  p = ikReach(p, 'R', hr, A.bendR === undefined ? -1 : A.bendR);
  return { x: SOFA.hx + (A.dx || 0), y: SOFA.seatY, s: SOFA.hs, pose: p, face: A.face || FACES.calm, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true, seed: 4 };
}
function sofaHero(cam, t, A = {}) {
  const c = ctx, pal = CRYPAL;
  const tub = A.tub === undefined ? { x: -30, y: -124, rot: -0.05 } : A.tub;
  const st = sofaSt(A);
  const out = {};
  const r = sofaLayer(cam, st, t, {
    pal, ambient: A.ambient === undefined ? 0.1 : A.ambient,
    pre: (lc) => actor(() => sofaLegs(lc, st.x, st.y, st.s, pal)),
    post: (lc, rr, s2) => {
      // his face: the tears, the lamp
      sofaHeadSpace(lc, s2, (cc) => {
        if (A.lamp && A.lamp.k > 0.01) headLamp(cc, A.lamp.k, A.lamp.col || '#FF4055', A.lamp.lit === undefined ? 1 : A.lamp.lit);
        if (A.cry) cryOnFace(cc, t, A.cry);
      });
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      // the tub in front of his chest, his left hand on its side
      if (tub) {
        if (A.spoonInTub) iceSpoon(lc, tub.x + 55, tub.y - 62, Math.PI / 2 + 0.95, 1, { scoop: 0 });   // the spoon stands in it
        iceTub(lc, tub.x, tub.y, 1, { dent: A.dent === undefined ? 1 : A.dent });
        if (A.tubFull > 0.02) paint(() => {   // his tears have filled it to the brim, and it runs over
          lc.fillStyle = rgba(TEAR.fill, 0.85 * clamp(A.tubFull)); lc.beginPath(); lc.ellipse(tub.x, tub.y - 40, 50, 9, 0, 0, Math.PI * 2); lc.fill();
          lc.fillStyle = 'rgba(255,255,255,0.8)'; lc.beginPath(); lc.ellipse(tub.x - 18, tub.y - 42, 12, 2.4, 0, 0, Math.PI * 2); lc.fill();
          for (let i = 0; i < 4; i++) { const pp = ((t * 1.3 + i / 4) % 1 + 1) % 1, sx = tub.x + (i % 2 ? 1 : -1) * (40 + 8 * (i > 1 ? 1 : 0)); tearDrop(lc, sx, tub.y - 30 + 96 * pp * pp, 4.6, clamp(A.tubFull) * (1 - pp * 0.7)); }
        });
        drawHand(lc, rr.wrL, rr.armDirL, 'open', pal, -1, t);
      }
      // the spoon, and the hand that holds it (the rig draws the head over the arms: draw the hand again)
      if (A.spoon) {
        const hx = rr.wrR[0] + rr.armDirR[0] * 14, hy = rr.wrR[1] + rr.armDirR[1] * 14;
        const ang = A.spoon.tip ? Math.atan2(A.spoon.tip[1] - hy, A.spoon.tip[0] - hx) : A.spoon.ang;   // it points at its target
        iceSpoon(lc, hx, hy, ang, 1, A.spoon);
        drawHand(lc, rr.wrR, rr.armDirR, 'open', pal, 1, t);
        out.spoonTip = [s2.x + (hx + Math.cos(ang) * 58) * s2.s, s2.y + (hy + Math.sin(ang) * 58) * s2.s];
      }
      if (A.tissue > 0.01) {   // a tissue over his nose, both hands on it
        const n = sofaHeadLocal(s2, 0, 30), puff = A.puff || 0, w = 31 + 10 * puff, h = 23 + 9 * puff;
        lc.fillStyle = '#F4F7FF';
        lc.beginPath(); lc.moveTo(n[0] - w, n[1] - h * 0.5); lc.quadraticCurveTo(n[0], n[1] - h * 0.8, n[0] + w, n[1] - h * 0.5);
        lc.quadraticCurveTo(n[0] + w * 1.1, n[1] + h * 0.4, n[0] + w * 0.5, n[1] + h * (0.9 + 0.3 * puff)); lc.quadraticCurveTo(n[0], n[1] + h * 0.6, n[0] - w * 0.5, n[1] + h * (0.9 + 0.3 * puff));
        lc.quadraticCurveTo(n[0] - w * 1.1, n[1] + h * 0.4, n[0] - w, n[1] - h * 0.5); lc.closePath(); lc.fill();
        paint(() => { for (const sd of [-1, 1]) line(lc, n[0] + sd * 9, n[1] - 4, n[0] + sd * 16, n[1] + 12, 2, 'rgba(120,140,190,0.5)'); });
        drawHand(lc, rr.wrR, rr.armDirR, 'open', pal, 1, t);
        if (!tub) drawHand(lc, rr.wrL, rr.armDirL, 'open', pal, -1, t);
      }
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  // the lamp shines: into the glow layer, at its world position
  out.st = st; out.r = r;
  out.head = sofaHeadPt(st, 0, 0); out.mouth = sofaHeadPt(st, 0, 40); out.lampPt = sofaHeadPt(st, 0, -134);
  out.eyeL = sofaHeadPt(st, -24, -2); out.eyeR = sofaHeadPt(st, 24, -2);
  if (tub) out.tubPt = [st.x + tub.x * st.s, st.y + (tub.y - 56) * st.s];
  if (A.lamp && A.lamp.k > 0.5 && (A.lamp.lit === undefined ? 1 : A.lamp.lit) > 0.03) {
    applyCam(cam);
    const L = out.lampPt, lit = A.lamp.lit === undefined ? 1 : A.lamp.lit, col = A.lamp.col || '#FF4055';
    softDot(gctx, L[0], L[1], 70, col, 0.9 * lit); softDot(gctx, L[0], L[1], 190, col, 0.28 * lit);
    softDot(ctx, L[0], L[1], 150, col, 0.16 * lit);
    if (A.lamp.beams) for (let i = 0; i < 2; i++) {   // two beams sweeping round
      const a = t * loopW(8.5) + i * Math.PI;
      for (const cc of [ctx, gctx]) {
        const g = cc.createRadialGradient(L[0], L[1], 10, L[0], L[1], 380);
        g.addColorStop(0, rgba(col, (cc === gctx ? 0.34 : 0.2) * lit * A.lamp.beams)); g.addColorStop(1, rgba(col, 0));
        cc.fillStyle = g; cc.beginPath(); cc.moveTo(L[0], L[1]); cc.arc(L[0], L[1], 380, a - 0.2, a + 0.2); cc.closePath(); cc.fill();
      }
    }
  }
  return out;
}

// kit.js's charLayer, with a `pre` step: what it draws goes under him on the same layer (his legs on the seat), so the
// light and the focus treat it as part of him and not as part of the set
function sofaLayer(cam, st, t, o = {}) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  if (o.pre) o.pre(lctx);
  const r = drawCharacter(lctx, st, t, o.pal || PAL);
  if (o.post) o.post(lctx, r, st);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  if (o.ambient) { lctx.fillStyle = `rgba(16,20,60,${o.ambient})`; lctx.fillRect(0, 0, W, H); }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}

// crying faces
const CRYFACE = {
  // a sad face, dry or wet (the photograph)
  sad: { eyeOpen: 1.1, pupil: 1.05, lookX: 0, lookY: 0.25, browY: 1.0, browTilt: 1.7, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // the spoon is on its way in: mouth open, brows up in the middle, eyes on the screen
  bite: { eyeOpen: 1.12, pupil: 1.05, lookX: 0, lookY: 0.25, browY: 0.9, browTilt: 1.5, mouth: 'o', mouthOpen: 0.95, blink: 0, cross: 0 },
  // chewing through it: the lip trembles
  chew: { eyeOpen: 1.1, pupil: 1.05, lookX: 0, lookY: 0.2, browY: 0.9, browTilt: 1.6, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // the eyes fill: wide and wet
  brim: { eyeOpen: 1.32, pupil: 1.15, lookX: 0, lookY: 0.1, browY: 1.3, browTilt: 1.9, mouth: 'wavy', mouthOpen: 0.3, blink: 0, cross: 0 },
  // and he lets go: eyes shut, mouth wide
  wail: { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.5, browTilt: 2.1, mouth: 'scream', mouthOpen: 0.75, blink: 1, cross: 0 },
  // between sobs: a wet look sideways, teeth
  sniff: { eyeOpen: 1.05, pupil: 1.05, lookX: 0, lookY: 0.2, browY: 1.0, browTilt: 1.7, mouth: 'grimace', mouthOpen: 1, blink: 0.12, cross: 0 },
  // a wobbly smile
  better: { eyeOpen: 1.0, pupil: 1.08, lookX: 0.7, lookY: 0.1, browY: 0.9, browTilt: 0.9, mouth: 'grin', mouthOpen: 0.42, blink: 0.1, cross: 0 },
  // looking at the spoon that is suddenly empty
  robbed: { eyeOpen: 1.1, pupil: 0.8, lookX: 0.5, lookY: 0.9, browY: 0.2, browTilt: -0.3, mouth: 'flat', mouthOpen: 0, blink: 0.05, cross: 0 },
};
