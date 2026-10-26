// A sunny kitchen: little him (the hiker as a toddler: the same face, a bigger head, a curl, a bib) in a high chair,
// a rubber duck in his right hand and a juice box in his left; the juice jet that hits his own face; a cake with a big
// 10 on it; a round window on his head with the baby shredder (a pacifier stuck in its mouth) that grows up.
// World units: the high chair's feet at (KC.hx, KC.floor); the toddler is the rig at KC.s, seated (rig units as in
// office.js: the pelvis at OF_HIP), his head drawn again 1.3 times as big about his neck.
'use strict';

const KC = { hx: 540, floor: 1720, s: 0.82, head: 1.32 };
const KC_PW = 1700, KC_PH = 1900;
let KC_PLATE = null;
// a pale blue onesie (the rig's pyjama-top cut, short sleeves), a white bib with a duck on it
const KIDPAL2 = Object.assign({}, PAL, { coat: '#8FC9F0', coatSh: '#5E9FCF', coatHi: '#D6EEFF', coatDk: '#3F78A8', pants: '#8FC9F0', pantsSh: '#5E9FCF', pj: true, shortSleeve: true });

// ---------------------------------------------------------------- the kitchen, painted once (plate coordinates)
function kcPaint() {
  const cv = mkCanvas(KC_PW, KC_PH), c = cv.getContext('2d'), rng = mulberry32(12);
  const g = c.createLinearGradient(0, 0, 0, KC_PH);
  g.addColorStop(0, '#F3DDB2'); g.addColorStop(0.55, '#EED3A0'); g.addColorStop(1, '#D9B985');
  c.fillStyle = g; c.fillRect(0, 0, KC_PW, KC_PH);
  // the window (upper right): sky, a sun, a tree, curtains
  const wx = 1010, wy = 260, ww = 520, wh = 470;
  rrect(c, wx - 18, wy - 18, ww + 36, wh + 36, 14); c.fillStyle = '#FFFFFF'; c.fill();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#7CC6F2'); sky.addColorStop(1, '#CDEBFA');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  c.fillStyle = '#FFF4C2'; c.beginPath(); c.arc(wx + 380, wy + 130, 54, 0, 7); c.fill();
  for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(wx + 120 + i * 60, wy + 110 + (i % 2) * 18, 60, 22, 0, 0, 7); c.fill(); }
  c.fillStyle = '#7BBF6A'; c.beginPath(); c.ellipse(wx + 140, wy + wh - 40, 160, 90, 0, 0, 7); c.fill();
  c.fillStyle = '#5FA557'; c.beginPath(); c.ellipse(wx + 420, wy + wh - 20, 140, 70, 0, 0, 7); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(wx + ww / 2 - 7, wy, 14, wh); c.fillRect(wx, wy + wh / 2 - 7, ww, 14);
  for (const s of [-1, 1]) {   // gingham curtains
    const cx = s < 0 ? wx - 40 : wx + ww + 40;
    c.save(); c.translate(cx, wy - 40);
    c.beginPath(); c.moveTo(-70, 0); c.lineTo(70, 0); c.quadraticCurveTo(40 * -s + 0, 300, 50 * -s, 560); c.lineTo(-30 * -s, 560); c.quadraticCurveTo(-60 * -s, 300, -70 * -s, 0); c.closePath();
    c.fillStyle = '#FFD86B'; c.fill();
    c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,0.45)';
    for (let x = -80; x < 80; x += 26) c.fillRect(x, 0, 12, 600);
    for (let y = 0; y < 600; y += 26) c.fillRect(-90, y, 180, 12);
    c.restore(); c.restore();
  }
  rrect(c, wx - 40, wy + wh + 14, ww + 80, 22, 6); c.fillStyle = '#FFFFFF'; c.fill();
  // upper cabinets (left), a shelf with jars, a hanging plant, a round clock
  for (let i = 0; i < 2; i++) {
    rrect(c, 60 + i * 250, 180, 236, 380, 12); c.fillStyle = '#8DBB9A'; c.fill();
    rrect(c, 80 + i * 250, 200, 196, 340, 10); c.fillStyle = '#9DCAAA'; c.fill();
    c.fillStyle = '#E8D9B5'; c.beginPath(); c.arc(256 + i * 250 - (i ? 160 : 0), 400, 9, 0, 7); c.fill();
  }
  rrect(c, 620, 470, 300, 18, 6); c.fillStyle = '#B07A52'; c.fill();
  for (let i = 0; i < 4; i++) {
    const x = 650 + i * 68, h = 70 + (i % 2) * 26;
    rrect(c, x, 470 - h, 50, h, 10); c.fillStyle = ['#F7B267', '#F4845F', '#9ED0E6', '#B5E48C'][i]; c.fill();
    rrect(c, x + 6, 470 - h - 12, 38, 16, 5); c.fillStyle = '#D9C9A8'; c.fill();
  }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(790, 250, 62, 0, 7); c.fill();
  c.lineWidth = 10; c.strokeStyle = '#F4845F'; c.stroke();
  c.lineWidth = 7; c.strokeStyle = '#33405E'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(790, 250); c.lineTo(790, 210); c.moveTo(790, 250); c.lineTo(818, 262); c.stroke();
  // the counter behind him: tiles, the worktop, cabinets with knobs
  c.fillStyle = '#FBF5E8'; c.fillRect(0, 760, KC_PW, 420);
  c.strokeStyle = 'rgba(190,170,140,0.55)'; c.lineWidth = 3;
  for (let y = 760; y < 1180; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(KC_PW, y); c.stroke(); }
  for (let y = 760, r = 0; y < 1180; y += 50, r++) for (let x = (r % 2) * 50; x < KC_PW; x += 100) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 50); c.stroke(); }
  rrect(c, -20, 1170, KC_PW + 40, 46, 8); c.fillStyle = '#C98E5E'; c.fill();
  c.fillStyle = '#A8714A'; c.fillRect(0, 1206, KC_PW, 12);
  for (let i = 0; i < 6; i++) {
    rrect(c, 20 + i * 285, 1236, 262, 560, 14); c.fillStyle = '#8DBB9A'; c.fill();
    rrect(c, 40 + i * 285, 1256, 222, 520, 12); c.fillStyle = '#9DCAAA'; c.fill();
    rrect(c, 130 + i * 285, 1290, 42, 12, 6); c.fillStyle = '#E8D9B5'; c.fill();
  }
  // things on the worktop: a fruit bowl, a kettle
  c.fillStyle = '#F4845F'; c.beginPath(); c.ellipse(300, 1150, 110, 40, 0, 0, Math.PI); c.fill();
  for (const [x, col] of [[250, '#FFD447'], [300, '#E2384C'], [350, '#7BBF6A']]) { c.fillStyle = col; c.beginPath(); c.arc(x, 1130, 30, 0, 7); c.fill(); }
  rrect(c, 1250, 1060, 130, 110, 40); c.fillStyle = '#E2384C'; c.fill();
  rrect(c, 1290, 1040, 50, 24, 10); c.fillStyle = '#33405E'; c.fill();
  return cv;
}
function initKitchen() { KC_PLATE = kcPaint(); }
// the room behind him (the plate is far: it scales less than the camera)
function kcRoom(cam, t) {
  const bs = 0.7 + 0.3 * cam.zoom;
  const x0 = 540 - (KC_PW / 2 + (cam.x - 540) * 0.35) * bs, y0 = 960 - (1120 + (cam.y - 1450) * 0.35) * bs;
  screenSpace();
  ctx.fillStyle = '#EED3A0'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(KC_PLATE, x0, y0, KC_PW * bs, KC_PH * bs);
  // the window's light
  softDot(gctx, x0 + 1270 * bs, y0 + 500 * bs, 420 * bs, '#FFF1C4', 0.5);
  softDot(gctx, x0 + 1390 * bs, y0 + 390 * bs, 160 * bs, '#FFFFFF', 0.55);
  // a shaft of sun across the wall
  ctx.save(); ctx.globalAlpha = 0.16;
  ctx.beginPath(); ctx.moveTo(x0 + 1010 * bs, y0 + 260 * bs); ctx.lineTo(x0 + 1530 * bs, y0 + 260 * bs); ctx.lineTo(x0 + 900 * bs, y0 + 1900 * bs); ctx.lineTo(x0 + 120 * bs, y0 + 1900 * bs); ctx.closePath();
  ctx.fillStyle = '#FFF6D6'; ctx.fill(); ctx.restore();
  return { x0, y0, bs };
}

// ---------------------------------------------------------------- the high chair (rig-local units of the toddler; the caller applied the camera)
function kcChairBack(c) {
  c.save(); c.translate(KC.hx, KC.floor); c.scale(KC.s, KC.s);
  // legs splayed to the floor, a foot rest
  for (const s of [-1, 1]) { line(c, s * 120, -200, s * 190, 120, 22, '#F2F2F2'); line(c, s * 120, -200, s * 190, 120, 14, '#FFFFFF'); }
  rrect(c, -150, 20, 300, 18, 8); c.fillStyle = '#E4E4E4'; c.fill();
  // the seat back, round topped, behind him
  rrect(c, -150, -560, 300, 380, 120); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, -126, -536, 252, 330, 104); c.fillStyle = '#FFB4B4'; c.fill();
  paint(() => { for (let i = 0; i < 6; i++) circle(c, -90 + (i % 3) * 90, -470 + Math.floor(i / 3) * 120, 14, 'rgba(255,255,255,0.6)'); });
  c.restore();
}
// the tray in front of him (world; drawn after him)
function kcTray(c) {
  c.save(); c.translate(KC.hx, KC.floor); c.scale(KC.s, KC.s);
  rrect(c, -210, -262, 420, 30, 14); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, -200, -236, 400, 22, 10); c.fillStyle = '#E7E7EE'; c.fill();
  for (const s of [-1, 1]) { line(c, s * 160, -214, s * 140, -150, 18, '#F2F2F2'); }
  c.restore();
}

// ---------------------------------------------------------------- the toddler
// A: {face, armL/armR {e, w}, hand, headRot, headDX, headDY, bob, post(lc, r, st), splat (0..1), drip}
function kcSt(A) {
  let p = { hipY: OF_HIP + (A.bob || 0), lean: A.lean || 0, armL: { a: 0.2, b: 0.1 }, armR: { a: 0.2, b: 0.1 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 1 };
  const aL = A.armL || { e: [-118, -300], w: [-82, -262] }, aR = A.armR || { e: [118, -300], w: [82, -262] };
  p = armAt(p, 'L', aL.e, aL.w); p = armAt(p, 'R', aR.e, aR.w);
  return { x: KC.hx, y: KC.floor, s: KC.s, pose: p, face: A.face || FACES.grin, headDX: A.headDX || 0, headDY: A.headDY || 0, headRot: A.headRot || 0, noLegs: true, seed: 7 };
}
// draw fn in his (big) head's units: the head's middle at 0, 0
function kcInHead(c, st, fn) {
  const r = rig(st.pose), nk = r.neck, hd = r.head, k = KC.head;
  c.save();
  c.translate(nk[0], nk[1]); c.scale(k, k); c.translate(-nk[0], -nk[1]);
  c.translate(hd[0] + (st.headDX || 0), hd[1] + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  fn(c, r); c.restore();
}
function kcHero(cam, t, A = {}) {
  const st = kcSt(A), pal = KIDPAL2;
  const r = charLayer(cam, st, t, {
    pal, ambient: 0.0,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      // the bib over his chest
      lc.beginPath(); lc.moveTo(-58, -366); lc.quadraticCurveTo(0, -330, 58, -366); lc.lineTo(54, -290); lc.quadraticCurveTo(0, -250, -54, -290); lc.closePath();
      lc.fillStyle = '#FFFFFF'; lc.fill();
      paint(() => { kcDuckShape(lc, 0, -300, 0.42, 0, 0); });
      // the big head, again, about his neck: the same face, a curl on top
      const nk = rr.neck, k = KC.head;
      lc.save(); lc.translate(nk[0], nk[1]); lc.scale(k, k); lc.translate(-nk[0], -nk[1]);
      drawHead(lc, rr, s2.face, s2, pal, t);
      lc.restore();
      kcInHead(lc, s2, (c) => {
        c.beginPath(); c.moveTo(-6, -84); c.bezierCurveTo(-14, -112, 22, -118, 14, -96); c.bezierCurveTo(10, -88, 0, -92, 4, -98);
        c.lineWidth = 7; c.strokeStyle = pal.hair; c.lineCap = 'round'; c.stroke();
        if ((A.splat || 0) > 0.01) kcSplat(c, A.splat, A.drip || 0, t);
      });
      if (A.post) A.post(lc, rr, s2);
      lc.restore();
    },
  });
  const P = (lx, ly) => [st.x + lx * st.s, st.y + ly * st.s];
  const HP = (lx, ly) => {   // head units -> world
    const nk = r.neck, hd = r.head, k = KC.head, a = r.lean + (st.headRot || 0), cs = Math.cos(a), sn = Math.sin(a);
    const x = hd[0] + (st.headDX || 0) + lx * cs - ly * sn, y = hd[1] + (st.headDY || 0) + lx * sn + ly * cs;
    return P(nk[0] + (x - nk[0]) * k, nk[1] + (y - nk[1]) * k);
  };
  return { st, r, P, HP, S: (lx, ly) => toScreen(cam, ...P(lx, ly)), HS: (lx, ly) => toScreen(cam, ...HP(lx, ly)) };
}
// juice on his face: drops on a cheek and the forehead, a drip (head units)
function kcSplat(c, k, drip, t) {
  const e = E.outBack(clamp(k), 2.4);
  paint(() => {
    for (const [x, y, r] of [[-30, 22, 12], [-14, -30, 9], [-44, 4, 7], [8, 30, 6], [-24, 40, 5]]) {
      c.beginPath(); c.arc(x, y, r * e, 0, 7); c.fillStyle = rgba('#FF9A2E', 0.92); c.fill();
      c.beginPath(); c.arc(x - r * 0.3 * e, y - r * 0.3 * e, r * 0.3 * e, 0, 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
    }
    const d = clamp(drip);
    if (d > 0.01) { line(c, -30, 30, -31, 30 + 26 * d, 5, rgba('#FF9A2E', 0.92)); circle(c, -31, 32 + 26 * d, 4, rgba('#FF9A2E', 0.92)); }
  });
}

// ---------------------------------------------------------------- props (any units: x, y, s)
// a rubber duck from the front-side; sq = squeezed (0..1), beak = open (0..1)
function kcDuckShape(c, x, y, s, sq, beak) {
  c.save(); c.translate(x, y); c.scale(s * (1 + 0.18 * sq), s * (1 - 0.3 * sq));
  ellipse(c, 0, 18, 46, 30, '#FFD447');                 // body
  c.beginPath(); c.moveTo(30, 6); c.quadraticCurveTo(64, -6, 58, 22); c.quadraticCurveTo(46, 20, 34, 18); c.closePath(); c.fillStyle = '#FFD447'; c.fill();   // tail
  circle(c, -18, -18, 26, '#FFD447');                    // head
  ellipse(c, -6, 20, 20, 12, '#F5BE2E', -0.3);          // wing
  // beak
  c.beginPath(); c.moveTo(-38, -16); c.lineTo(-62, -12 - 6 * beak); c.lineTo(-40, -8); c.closePath(); c.fillStyle = '#FF8A3C'; c.fill();
  c.beginPath(); c.moveTo(-38, -8); c.lineTo(-60, -6 + 6 * beak); c.lineTo(-40, -2); c.closePath(); c.fillStyle = '#F06A20'; c.fill();
  circle(c, -22, -24, 5, '#1A1A2A'); circle(c, -23.5, -25.5, 1.8, '#FFFFFF');
  c.restore();
}
// a juice box with a straw; sq = squeezed (0..1)
function kcJuice(c, x, y, s, sq) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const w = 30 * (1 - 0.32 * sq), hh = 44;
  // the straw (bends toward his face, up and to the screen's right)
  line(c, 6, -hh, 12, -hh - 26, 6, '#FF5A6E'); line(c, 12, -hh - 26, 26, -hh - 38, 6, '#FF5A6E');
  c.beginPath(); c.moveTo(-w, -hh); c.lineTo(w, -hh); c.quadraticCurveTo(w + 6 * sq, 0, w, hh); c.lineTo(-w, hh); c.quadraticCurveTo(-w - 6 * sq, 0, -w, -hh); c.closePath();
  c.fillStyle = '#4DC3FF'; c.fill();
  paint(() => {
    c.beginPath(); c.arc(0, 4, 17 * (1 - 0.2 * sq), 0, 7); c.fillStyle = '#FF9A2E'; c.fill();
    ellipse(c, 6, -10, 7, 4, '#7BBF6A', 0.5);
    if (sq > 0.2) for (const sd of [-1, 1]) line(c, sd * w * 0.6, -20, sd * w * 0.4, 18, 2.4, 'rgba(20,60,110,0.5)');
  });
  c.restore();
}
// the jet of juice from the straw's tip A to his face B (screen points); k = how far along (0..1), fade (0..1)
function kcJet(A, B, k, fade) {
  if (k <= 0.01 || fade >= 0.99) return;
  screenSpace();
  const n = 26, pts = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * clamp(k);
    pts.push([lerp(A[0], B[0], u), lerp(A[1], B[1], u) - Math.sin(Math.PI * u) * 150]);
  }
  ctx.save(); ctx.globalAlpha = 1 - clamp(fade);
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.strokeStyle = '#E8761A'; ctx.stroke();
  ctx.lineWidth = 15; ctx.strokeStyle = '#FF9A2E'; ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,240,200,0.8)'; ctx.stroke();
  const rng = mulberry32(3);
  for (let i = 0; i < 9; i++) { const p = pts[Math.floor(rng() * n)]; circle(ctx, p[0] + (rng() - 0.5) * 30, p[1] + (rng() - 0.5) * 30, 4 + rng() * 5, '#FF9A2E'); }
  ctx.restore();
}
// a cake with a big 10 (candles shaped 1 and 0) on a plate; k = it pops in, lit (0..1)
function kcCake(c, x, y, s, k, lit, t) {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 8, 120, 22, '#FFFFFF');
  rrect(c, -90, -70, 180, 78, 24); c.fillStyle = '#FFB4C8'; c.fill();
  rrect(c, -90, -82, 180, 34, 18); c.fillStyle = '#FFF4F7'; c.fill();
  paint(() => {
    for (let i = 0; i < 6; i++) { const xx = -74 + i * 30; c.beginPath(); c.arc(xx, -52, 9, 0, Math.PI); c.fillStyle = '#FFF4F7'; c.fill(); }
    for (let i = 0; i < 9; i++) circle(c, -76 + i * 19, -20 + (i % 2) * 14, 4, ['#FFD447', '#7FE9FF', '#4DFFB4', '#C8A8FF'][i % 4]);
  });
  // the 1 and the 0
  const cand = (cx, draw) => {
    c.save(); c.translate(cx, -86);
    draw();
    line(c, 0, -76, 0, -88, 3, '#3A2A1A');
    const fl = 1 + 0.12 * Math.sin(t * 23 + cx);
    if (lit > 0.01) { c.beginPath(); c.ellipse(0, -98, 7 * fl, 13 * fl, 0, 0, 7); c.fillStyle = '#FFB020'; c.fill(); c.beginPath(); c.ellipse(0, -95, 3.6, 7, 0, 0, 7); c.fillStyle = '#FFF4C2'; c.fill(); }
    c.restore();
  };
  cand(-34, () => { rrect(c, -10, -76, 20, 76, 6); c.fillStyle = '#7FE9FF'; c.fill(); c.beginPath(); c.moveTo(-10, -62); c.lineTo(-26, -50); c.lineTo(-26, -64); c.lineTo(-6, -76); c.closePath(); c.fillStyle = '#7FE9FF'; c.fill(); });
  cand(30, () => { c.beginPath(); c.ellipse(0, -38, 26, 38, 0, 0, 7); c.fillStyle = '#FFD447'; c.fill(); c.beginPath(); c.ellipse(0, -38, 11, 22, 0, 0, 7); c.fillStyle = '#FFB4C8'; c.fill(); });
  c.restore();
  if (lit > 0.01) for (const cx of [-34, 30]) {
    const m = c.getTransform(), X = m.a * (x + cx * s) + m.c * (y - 184 * s) + m.e, Y = m.b * (x + cx * s) + m.d * (y - 184 * s) + m.f;
    gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); softDot(gctx, X / 2, Y / 2, 40 * s * Math.hypot(m.a, m.b) / 2, '#FFB020', 0.8 * lit); gctx.restore();
  }
}
// a round window (screen space) with a pointer to P (screen): draws fn(c) clipped inside, with the frame on top
function kcWindow(x, y, r, P, k, fn) {
  if (k <= 0.01) return;
  const e = E.outBack(clamp(k), 1.8);
  screenSpace();
  // the pointer: a dotted trail of shrinking circles from the window to his head
  for (let i = 1; i <= 3; i++) {
    const u = i / 4, px = lerp(x, P[0], u + 0.1), py = lerp(y, P[1], u + 0.1);
    circle(ctx, px, py, (16 - i * 3.5) * e, '#9FF1FF');
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e);
  circle(ctx, 0, 0, r + 10, '#0B0B1A'); circle(ctx, 0, 0, r + 6, '#9FF1FF');
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#18245A'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
  fn(ctx);
  ctx.restore();
  ctx.restore();
  softDot(gctx, x, y, r * 1.2, '#7FE9FF', 0.2 * clamp(k));
}
