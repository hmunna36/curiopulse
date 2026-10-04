// The meditation studio at dusk: a round window with a moon and bamboo, paper lanterns, a wooden floor with mats,
// a bronze gong on a low frame, two classmates in the lotus pose (their own simple rig), and the hero barefoot in a
// yellow linen shirt. Plus the leg effects: the numb blue wash, the static fizz, the literal pins and needles, and a
// big side-view bare foot for the close-ups.
'use strict';

// ---------------------------------------------------------------- the hero's outfit: linen shirt, loose trousers, bare feet
const YOGA = Object.assign({}, PAL, {
  coat: '#FFC23A', coatSh: '#DE8C16', coatHi: '#FFE699', coatDk: '#C27A10',
  pants: '#55528F', pantsSh: '#383667', pj: true, shortSleeve: true, barefoot: true, sock: '#F2B892',
});
const BAREFX = { wig: 0, t: 0 };                        // toe wiggle for every bare foot drawn this frame (set by the shot)

// bare foot at the end of a rig leg (origin = the ankle). front > 0.5: toes toward the camera; else a side view pointing `side`
function drawBareFoot(c, an, side, pal, front) {
  c.save(); c.translate(an[0], an[1]);
  const wg = BAREFX.wig, tt = BAREFX.t;
  if (front > 0.5) {
    c.beginPath(); c.moveTo(-21, -10); c.quadraticCurveTo(-31, 14, -27, 27); c.quadraticCurveTo(0, 37, 27, 27); c.quadraticCurveTo(31, 14, 21, -10); c.closePath();
    c.fillStyle = pal.skinSh; c.fill();
    c.beginPath(); c.moveTo(-18, -10); c.quadraticCurveTo(-27, 12, -23, 23); c.quadraticCurveTo(0, 31, 23, 23); c.quadraticCurveTo(27, 12, 18, -10); c.closePath();
    c.fillStyle = pal.skin; c.fill();
    for (let i = 0; i < 5; i++) {                        // toes: the big one on the inner side
      const u = i / 4, x = -side * lerp(19, -21, u), r = lerp(9.5, 5.6, u);
      const y = 28 - 3.5 * u + wg * 5 * Math.sin(tt * 17 + i * 1.3);
      circle(c, x, y + 1, r + 1.6, pal.skinSh); circle(c, x, y, r, pal.skin);
      c.beginPath(); c.arc(x, y - 1, r * 0.55, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 1.6; c.strokeStyle = rgba('#FFDCC4', 0.9); c.stroke();
    }
  } else {
    c.scale(side, 1);
    c.beginPath(); c.moveTo(-20, -12); c.lineTo(14, -12); c.quadraticCurveTo(40, -4, 60, 10); c.quadraticCurveTo(66, 22, 54, 24); c.lineTo(-18, 24);
    c.quadraticCurveTo(-30, 20, -26, 4); c.closePath();
    c.fillStyle = pal.skinSh; c.fill();
    c.beginPath(); c.moveTo(-17, -12); c.lineTo(12, -12); c.quadraticCurveTo(37, -3, 55, 10); c.quadraticCurveTo(60, 18, 50, 19); c.lineTo(-15, 19);
    c.quadraticCurveTo(-25, 16, -22, 4); c.closePath();
    c.fillStyle = pal.skin; c.fill();
    for (let i = 0; i < 4; i++) {
      const x = 58 - i * 7, y = 16 - i * 4.5 + wg * 4 * Math.sin(tt * 17 + i * 1.3), r = 8.5 - i * 1.2;
      circle(c, x, y, r + 1.3, pal.skinSh); circle(c, x, y - 0.5, r, pal.skin);
    }
  }
  c.restore();
}
// engine override: a palette with `barefoot` gets feet with toes; everything else is character.js's shoe, unchanged
function drawShoe(c, an, side, pal, front, missing) {
  if (pal.barefoot) { drawBareFoot(c, an, side, pal, front); return; }
  if (missing) { ellipse(c, an[0] + side * 4, an[1] + 10, 22, 16, pal.sock); return; }
  c.save(); c.translate(an[0], an[1]);
  if (front > 0.5) {
    rrect(c, -30, -8, 60, 42, 18); fillOut(c, pal.shoeSh, pal);
    rrect(c, -27, -8, 54, 34, 16); c.fillStyle = pal.shoe; c.fill();
    rrect(c, -31, 24, 62, 12, 6); c.fillStyle = pal.sole; c.fill();
    line(c, -10, 2, 10, 2, 3, '#FFFFFF'); line(c, -10, 10, 10, 10, 3, '#FFFFFF');
  } else {
    c.scale(side, 1);
    c.beginPath(); c.moveTo(-18, -10); c.lineTo(20, -12); c.quadraticCurveTo(54, -8, 58, 14); c.lineTo(-22, 16); c.closePath();
    fillOut(c, pal.shoe, pal);
    c.beginPath(); c.moveTo(20, -12); c.quadraticCurveTo(54, -8, 58, 14); c.lineTo(30, 14); c.closePath();
    c.fillStyle = pal.shoeSh; c.fill();
    rrect(c, -24, 12, 84, 12, 6); c.fillStyle = pal.sole; c.fill();
    line(c, 4, -8, 12, 0, 3, '#FFFFFF'); line(c, 12, -9, 20, -1, 3, '#FFFFFF');
  }
  c.restore();
}

// ---------------------------------------------------------------- the room
const STUDIO = { floorY: 968, gong: [846, 838], gongR: 124, mat: [430, 1150] };
let STUDIO_BAMBOO = null;

function studioBack(cam, t, o = {}) {
  screenSpace();
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#191431'); wall.addColorStop(0.5, '#2A1F45'); wall.addColorStop(1, '#231A38');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // the round window: dusk sky, a low moon, bamboo
  const wx = 470, wy = 500, wr = 236;
  ctx.save(); ctx.beginPath(); ctx.arc(wx, wy, wr, 0, 7); ctx.clip();
  const sky = ctx.createLinearGradient(0, wy - wr, 0, wy + wr);
  sky.addColorStop(0, '#1B2A66'); sky.addColorStop(0.55, '#5B4A9A'); sky.addColorStop(0.85, '#E88A6A'); sky.addColorStop(1, '#FFC98A');
  ctx.fillStyle = sky; ctx.fillRect(wx - wr, wy - wr, 2 * wr, 2 * wr);
  circle(ctx, wx + 70, wy - 60, 62, '#FFF1D0');
  circle(ctx, wx + 52, wy - 74, 12, 'rgba(230,200,160,0.5)'); circle(ctx, wx + 92, wy - 40, 8, 'rgba(230,200,160,0.5)');
  if (STUDIO_BAMBOO) for (const b of STUDIO_BAMBOO) {
    const sw = 5 * Math.sin(t * 0.7 + b.ph);
    ctx.save(); ctx.translate(b.x, wy + wr); ctx.rotate(b.lean + sw * 0.004);
    for (let k = 0; k < 7; k++) { rrect(ctx, -b.w / 2, -(k + 1) * 74 + 3, b.w, 70, 4); ctx.fillStyle = '#141230'; ctx.fill(); }
    for (const lf of b.leaves) { ctx.save(); ctx.translate(0, -lf.y); ctx.rotate(lf.a + sw * 0.01); ellipse(ctx, lf.s * 34, 0, 36, 8, '#141230'); ctx.restore(); }
    ctx.restore();
  }
  ctx.restore();
  softDot(gctx, wx + 70, wy - 60, 150, '#FFE9B8', 0.55);
  softDot(gctx, wx, wy + 150, 240, '#FF9A6A', 0.22);
  ctx.beginPath(); ctx.arc(wx, wy, wr + 9, 0, 7); ctx.lineWidth = 22; ctx.strokeStyle = '#3B2620'; ctx.stroke();
  ctx.beginPath(); ctx.arc(wx, wy, wr + 19, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = '#6B4A36'; ctx.stroke();
  line(ctx, wx - wr, wy + 70, wx + wr, wy + 70, 7, '#3B2620'); line(ctx, wx - 70, wy - wr, wx - 70, wy + wr, 7, '#3B2620');
  // wall panel lines + a scroll
  for (const x of [60, 1010]) line(ctx, x, 120, x, STUDIO.floorY, 6, 'rgba(12,8,28,0.5)');
  // lanterns
  for (const [lx, ly, ph] of [[150, 330, 0], [985, 300, 2]]) {
    const sw = 8 * Math.sin(t * 0.9 + ph);
    line(ctx, lx, 0, lx + sw * 0.4, ly - 62, 3, '#120C22');
    ctx.save(); ctx.translate(lx + sw * 0.5, ly);
    const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 70);
    g.addColorStop(0, '#FFF2C4'); g.addColorStop(0.55, '#FFB65C'); g.addColorStop(1, '#D9742A');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 52, 64, 0, 0, 7); ctx.fill();
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(0, 0, 52 - Math.abs(k) * 3, 64, 0, 0, 7); ctx.save(); ctx.clip(); line(ctx, -60, k * 22, 60, k * 22, 2.5, 'rgba(140,60,20,0.45)'); ctx.restore(); }
    rrect(ctx, -22, -70, 44, 10, 3); ctx.fillStyle = '#2A1A16'; ctx.fill(); rrect(ctx, -22, 60, 44, 10, 3); ctx.fill();
    ctx.restore();
    softDot(gctx, lx + sw * 0.5, ly, 190, '#FFA44A', 0.5 * (0.92 + 0.08 * Math.sin(t * 5 + ph)));
  }
  // the floor: warm boards
  const fy = STUDIO.floorY;
  const fl = ctx.createLinearGradient(0, fy, 0, 1700);
  fl.addColorStop(0, '#4A3226'); fl.addColorStop(0.4, '#3A261E'); fl.addColorStop(1, '#1C1210');
  ctx.fillStyle = fl; ctx.fillRect(-400, fy, W + 800, 1100);
  rrect(ctx, -400, fy - 12, W + 800, 16, 0); ctx.fillStyle = '#1A1024'; ctx.fill();
  for (let i = -6; i <= 14; i++) { const x0 = 540 + (i - 4) * 120; line(ctx, x0, fy + 4, 540 + (x0 - 540) * 2.3, 1750, 2.5, 'rgba(20,10,8,0.5)'); }
  softDot(ctx, 430, 1180, 520, '#FFB070', 0.13);
  // candles on the floor, far left
  for (const [cx, cy, ph] of [[60, 1010, 0], [112, 1024, 1.7]]) {
    rrect(ctx, cx - 12, cy - 46, 24, 46, 5); ctx.fillStyle = '#EFE3CF'; ctx.fill();
    const fk = 1 + 0.12 * Math.sin(t * 11 + ph);
    ellipse(ctx, cx, cy - 58, 6, 12 * fk, '#FFD98A'); softDot(gctx, cx, cy - 58, 46, '#FFB04A', 0.9);
  }
}
function studioMat(x, y, w, col, colSh) {                 // a yoga mat seen from the front, in perspective
  ctx.beginPath(); ctx.moveTo(x - w * 0.42, y - 30); ctx.lineTo(x + w * 0.42, y - 30); ctx.lineTo(x + w * 0.56, y + 46); ctx.lineTo(x - w * 0.56, y + 46); ctx.closePath();
  ctx.fillStyle = colSh; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w * 0.42, y - 30); ctx.lineTo(x + w * 0.42, y - 30); ctx.lineTo(x + w * 0.545, y + 38); ctx.lineTo(x - w * 0.545, y + 38); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
}

// the gong: swing (rad), ring 0..1 (how hard it is ringing), t for the shimmer
function drawGong(t, swing = 0, ring = 0) {
  const [gx, gy] = STUDIO.gong, R = STUDIO.gongR, top = gy - R - 62, fy = STUDIO.floorY + 62;
  // frame
  for (const s of [-1, 1]) {
    rrect(ctx, gx + s * (R + 34) - 13, top, 26, fy - top, 6); ctx.fillStyle = '#2B1A14'; ctx.fill();
    rrect(ctx, gx + s * (R + 34) - 13, top, 9, fy - top, 5); ctx.fillStyle = '#4B2E22'; ctx.fill();
    rrect(ctx, gx + s * (R + 34) - 34, fy - 14, 68, 18, 6); ctx.fillStyle = '#22140F'; ctx.fill();
  }
  rrect(ctx, gx - R - 66, top - 6, 2 * R + 132, 28, 8); ctx.fillStyle = '#3A241B'; ctx.fill();
  rrect(ctx, gx - R - 66, top - 6, 2 * R + 132, 9, 5); ctx.fillStyle = '#5B3A2A'; ctx.fill();
  // disc, hanging from two cords, swinging about the beam
  ctx.save(); ctx.translate(gx, top + 16); ctx.rotate(swing); ctx.translate(-gx, -(top + 16));
  const jx = ring * 5 * Math.sin(t * 95), jy = ring * 3 * Math.cos(t * 83);
  for (const s of [-1, 1]) line(ctx, gx + s * 46, top + 16, gx + s * 50 + jx, gy - R * 0.86 + jy, 4, '#C9B79A');
  const g = ctx.createRadialGradient(gx - 40 + jx, gy - 46 + jy, 10, gx + jx, gy + jy, R * 1.05);
  g.addColorStop(0, '#FFE9A8'); g.addColorStop(0.35, '#E0A63C'); g.addColorStop(0.8, '#A8691C'); g.addColorStop(1, '#6E3F12');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx + jx, gy + jy, R, 0, 7); ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = '#5A3410'; ctx.stroke();
  for (const [rr, a] of [[R * 0.74, 0.35], [R * 0.5, 0.3], [R * 0.24, 0.5]]) { ctx.beginPath(); ctx.arc(gx + jx, gy + jy, rr, 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(90,52,16,${a})`; ctx.stroke(); }
  circle(ctx, gx + jx, gy + jy, R * 0.2, '#C78A2A'); circle(ctx, gx - 8 + jx, gy - 8 + jy, R * 0.08, '#FFE9A8');
  ctx.restore();
  softDot(gctx, gx, gy, R * (1.3 + 0.8 * ring), '#FFC860', 0.16 + 0.5 * ring);
}
// sound rings flying off the gong after a hit at t0
function gongRings(t, t0, n = 4) {
  const d = t - t0; if (d < 0 || d > 1.6) return;
  const [gx, gy] = STUDIO.gong;
  for (let i = 0; i < n; i++) {
    const dd = d - i * 0.11; if (dd < 0) continue;
    const r = STUDIO.gongR + 20 + dd * 560, a = clamp(1 - dd / 1.0) * 0.8;
    if (a <= 0) continue;
    both((c, glow) => { c.beginPath(); c.arc(gx, gy, r, 0, 7); c.lineWidth = glow ? 16 : 7; c.strokeStyle = rgba('#FFE29A', a * (glow ? 0.6 : 1)); c.stroke(); });
  }
}

// ---------------------------------------------------------------- classmates: their own simple rig, sitting in the lotus pose
const YOGIS = {
  a: { top: '#2BA89A', topSh: '#1B7A70', pants: '#3A3560', skin: '#C98D6B', skinSh: '#A66B4D', hair: '#1E1320', style: 'bun' },
  b: { top: '#D9627A', topSh: '#A8405A', pants: '#2F3350', skin: '#F0C3A0', skinSh: '#CF9670', hair: '#E9E4DA', style: 'beard' },
};
// o: {eyes: 0 closed | 1 one eye open | 2 wide | 3 glare, look: -1..1, shh: 0..1, hop: px, breathe}
function drawYogi(x, y, s, P, t, o = {}) {
  const c = ctx, hop = o.hop || 0, br = 2.5 * Math.sin(t * 1.6 + x * 0.01);
  c.save(); c.translate(x, y - hop); c.scale(s, s);
  // crossed legs
  const leg = (kx, ax, front) => {
    line(c, kx * 0.3, -44, kx, -30, 62, P.pants); line(c, kx, -30, ax, -16, 50, front ? P.pants : mixHex(P.pants, '#000000', 0.25));
    ellipse(c, ax + Math.sign(ax) * 26, -12, 26, 15, P.skinSh); ellipse(c, ax + Math.sign(ax) * 26, -14, 23, 12, P.skin);
  };
  leg(118, -52, false); leg(-118, 52, true);
  // torso
  c.beginPath(); c.moveTo(-62, -52); c.quadraticCurveTo(-78, -150, -58, -196 + br); c.quadraticCurveTo(0, -214 + br, 58, -196 + br); c.quadraticCurveTo(78, -150, 62, -52); c.closePath();
  const g = c.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, P.top); g.addColorStop(1, P.topSh); c.fillStyle = g; c.fill();
  // arms: resting on the knees, or one hand up for "shh"
  const sh = o.shh || 0;
  for (const sd of [-1, 1]) {
    const up = sd > 0 ? sh : 0;
    const ex = sd * lerp(92, 74, up), ey = lerp(-110, -128, up) + br * 0.5, hx = sd * lerp(112, 16, up), hy = lerp(-48, -246, up);
    line(c, sd * 60, -178 + br, ex, ey, 34, sd > 0 ? P.topSh : P.top); line(c, ex, ey, hx, hy, 28, P.skinSh); line(c, ex, ey, hx, hy, 21, P.skin);
    circle(c, hx, hy, 17, P.skinSh); circle(c, hx - 1, hy - 1, 14.5, P.skin);
    if (up > 0.6) { line(c, hx, hy - 6, hx - sd * 4, hy - 42, 12, P.skinSh); line(c, hx, hy - 6, hx - sd * 4, hy - 42, 8.5, P.skin); }   // the shushing finger
    else if (up < 0.1) circle(c, hx + sd * 3, hy - 14, 6, P.skin);      // thumb and finger together
  }
  // head
  rrect(c, -15, -224 + br, 30, 34, 9); c.fillStyle = P.skinSh; c.fill();
  c.save(); c.translate(0, -262 + br);
  if (P.style === 'bun') { circle(c, 0, -62, 25, P.hair); }
  ellipse(c, 0, 0, 52, 58, P.skin);
  for (const sd of [-1, 1]) ellipse(c, sd * 51, 4, 9, 13, P.skinSh);
  if (P.style === 'bun') { c.beginPath(); c.ellipse(0, -6, 54, 56, 0, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(30, -34, 0, -30); c.quadraticCurveTo(-30, -34, -53, -8); c.closePath(); c.fillStyle = P.hair; c.fill(); }
  else {                                                 // bald, with a white beard and big brows
    c.beginPath(); c.moveTo(-46, 12); c.quadraticCurveTo(-40, 74, 0, 84); c.quadraticCurveTo(40, 74, 46, 12); c.quadraticCurveTo(24, 34, 0, 30); c.quadraticCurveTo(-24, 34, -46, 12); c.closePath();
    c.fillStyle = P.hair; c.fill();
    ellipse(c, -16, -40, 13, 5, 'rgba(255,255,255,0.35)', -0.3);
  }
  const ey = o.eyes || 0, lk = (o.look || 0) * 4;
  for (const sd of [-1, 1]) {
    const ex = sd * 20, open = ey === 2 || ey === 3 || (ey === 1 && sd === (o.peekSide || 1));
    if (!open) { c.beginPath(); c.moveTo(ex - 11, -3); c.quadraticCurveTo(ex, 6, ex + 11, -3); c.lineWidth = 4; c.strokeStyle = '#3A2018'; c.lineCap = 'round'; c.stroke(); }
    else {
      const ry = ey === 2 ? 14 : ey === 3 ? 8 : 11;
      ellipse(c, ex, -2, 11.5, ry, '#FFFFFF'); circle(c, ex + lk, -2 + (ey === 3 ? 1 : 0), ey === 2 ? 4.5 : 6, '#1A1320');
      if (ey === 3) { c.fillStyle = P.skin; c.fillRect(ex - 13, -16, 26, 9); line(c, ex - 12, -7, ex + 12, -7, 3, '#3A2018'); }
    }
    const bt = ey === 3 ? -5 : ey === 2 ? 4 : 0;
    line(c, ex - sd * 11, -22 - (ey === 2 ? 7 : 0) - bt * 0.2 + (ey === 3 ? 6 : 0), ex + sd * 12, -22 - (ey === 2 ? 5 : 0) + (ey === 3 ? -2 : 0), P.style === 'beard' ? 7 : 5, P.hair);
  }
  ellipse(c, 0, 14, 6, 4.5, 'rgba(150,80,60,0.5)');
  if (sh > 0.6) ellipse(c, 0, 33, 6, 5, '#5A1522');
  else if (ey === 2) ellipse(c, 0, 34, 8, 9, '#5A1522');
  else if (ey === 3) line(c, -10, 35, 10, 33, 4, '#5A1522');
  else { c.beginPath(); c.moveTo(-10, 31); c.quadraticCurveTo(0, 37, 10, 31); c.lineWidth = 3.5; c.strokeStyle = '#5A1522'; c.lineCap = 'round'; c.stroke(); }
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- the hero in the studio
// charLayer with a whole-body rotation about a pivot (the fall) and the studio's light: a dusk shade and a warm rim
function heroLayer(cam, st, t, o = {}) {
  lctx.setTransform(1, 0, 0, 1, 0, 0); lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const pv = o.pivot || [st.x, st.y], rot = o.rot || 0;
  if (rot) { lctx.translate(pv[0], pv[1]); lctx.rotate(rot); lctx.translate(-pv[0], -pv[1]); }
  const r = drawCharacter(lctx, st, t, o.pal || YOGA);
  if (o.post) { lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s); o.post(lctx, r, st); lctx.restore(); }
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  lctx.fillStyle = `rgba(34,22,66,${o.shade === undefined ? 0.2 : o.shade})`; lctx.fillRect(0, 0, W, H);
  const g = lctx.createLinearGradient(0, 300, W * 0.7, H * 0.7);
  g.addColorStop(0, 'rgba(255,186,110,0.26)'); g.addColorStop(0.55, 'rgba(255,186,110,0)');
  lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(layerC, 0, 0);
  applyCam(cam);
  return { st, r, rot, pv };
}
// a rig-local point of the hero -> world (with the fall's rotation)
function heroPt(S, p) {
  const w = toWorld(S.st, p); if (!S.rot) return w;
  const c = Math.cos(S.rot), s = Math.sin(S.rot), dx = w[0] - S.pv[0], dy = w[1] - S.pv[1];
  return [S.pv[0] + dx * c - dy * s, S.pv[1] + dx * s + dy * c];
}
// the lotus seat, drawn in rig space from a post callback (use with st.noLegs): thighs out, shins crossed, bare feet;
// then the forearms and hands again, so they rest ON the knees
function crossLegs(c, r, pal, t) {
  const hipY = r.P[1];
  const kL = [-128, hipY + 30], kR = [128, hipY + 30], aL = [56, hipY + 50], aR = [-56, hipY + 50];
  capsuleShaded(c, [36, hipY + 6], kR, 54, pal.pants, pal.pantsSh, null, pal);
  capsuleShaded(c, [-36, hipY + 6], kL, 54, pal.pants, pal.pantsSh, null, pal);
  capsuleShaded(c, kR, aR, 46, pal.pantsSh, pal.pantsSh, null, pal);
  drawBareFoot(c, [aR[0] - 14, aR[1] - 2], -1, pal, 0);
  capsuleShaded(c, kL, aL, 46, pal.pants, pal.pantsSh, null, pal);
  drawBareFoot(c, [aL[0] + 14, aL[1] - 2], 1, pal, 0);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    capsuleShaded(c, r['el' + k], r['wr' + k], 36, pal.skin, pal.skinSh, pal.skinHi, pal);
    drawHand(c, r['wr' + k], r['armDir' + k], 'open', pal, s, t);
  }
  return { kL, kR, aL, aR, footR: [aR[0] - 40, aR[1] + 4] };
}
const POSE_LOTUS = (() => {                              // seated: pelvis low, hands on the knees
  let p = { hipY: -62, lean: 0, armL: { a: 0.3, b: 0.1 }, armR: { a: 0.3, b: 0.1 }, legL: { a: 1.2, b: -2.6 }, legR: { a: 1.2, b: -2.6 }, hand: 'open', feetFront: 0 };
  p = ikReach(p, 'L', [-128, -62 + 6]); p = ikReach(p, 'R', [128, -62 + 6]);
  return p;
})();

// ---------------------------------------------------------------- the leg's troubles (world space, camera applied)
// pts: the leg as a polyline of world points [hip, knee, ankle, toe]; w = half width in world px.
// numb: a cold blue wash; fizz: TV static crawling over it (new every frame) with a cyan glow
function legWash(pts, w, numb, fizz, t, seed = 1) {
  if (numb > 0.01) {
    ctx.save(); ctx.globalAlpha = 0.5 * numb; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    poly(ctx, pts, w * 2, '#5C86D2'); ctx.restore();
  }
  if (fizz > 0.01) {
    const acc = polyLen(pts), L = acc[acc.length - 1], fr = Math.floor(t * FPS);
    const rng = mulberry32(seed * 7919 + fr * 13);
    const n = Math.round(150 * fizz);
    for (let i = 0; i < n; i++) {
      const p = polyAt(pts, acc, rng() * L), off = (rng() - 0.5) * 2 * w * 0.92;
      const x = p[0] - Math.sin(p[2]) * off, y = p[1] + Math.cos(p[2]) * off, sz = 2.5 + rng() * 5.5, v = rng();
      ctx.fillStyle = v < 0.42 ? `rgba(255,255,255,${0.9 * fizz})` : v < 0.72 ? `rgba(20,26,50,${0.8 * fizz})` : `rgba(127,233,255,${0.9 * fizz})`;
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz * (0.6 + rng() * 0.8));
      if (v > 0.9) softDot(gctx, x, y, 16, '#7FE9FF', 0.8 * fizz);
    }
    gctx.save(); gctx.globalAlpha = 0.2 * fizz * (0.7 + 0.3 * Math.sin(t * 40)); gctx.lineCap = 'round'; gctx.lineJoin = 'round'; poly(gctx, pts, w * 1.6, '#7FE9FF'); gctx.restore();
  }
}
// the numb leg, cooled: a blue tint on the hero's right leg only where he is (call it from heroLayer's post, rig space).
// fromShin = only below the knee (when his hands are on the knee)
function legTint(c, r, k, fromShin = false) {
  if (k <= 0.01) return;
  const a0 = fromShin ? [lerp(r.knR[0], r.anR[0], 0.34), lerp(r.knR[1], r.anR[1], 0.34)] : r.hipR;
  c.save(); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.5 * k; c.lineCap = fromShin ? 'butt' : 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(a0[0], a0[1]); if (!fromShin) c.lineTo(r.knR[0], r.knR[1]); c.lineTo(r.anR[0], r.anR[1]); c.lineTo(r.anR[0] + 10, r.anR[1] + 26);
  c.lineWidth = 62; c.strokeStyle = '#4C7FE0'; c.stroke(); c.restore();
}
// a tiny face on his knee (world space): 'sleep' (closed eyes, a little snoring mouth), 'serene' (closed eyes, a smile),
// 'shock' (wide eyes, an O)
function kneeFace(x, y, s, a, mood, t) {
  if (a <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFFFFF'; ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = 3.4;
  if (mood === 'shock') {
    for (const sd of [-1, 1]) { circle(ctx, sd * 11, -2, 7.5, '#FFFFFF'); circle(ctx, sd * 11 + 1.5 * Math.sin(t * 40), -2, 3, '#141A40'); }
    ctx.beginPath(); ctx.ellipse(0, 13, 5, 6.5, 0, 0, 7); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  } else {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 11 - 7, -3); ctx.quadraticCurveTo(sd * 11, 4, sd * 11 + 7, -3); ctx.stroke(); }
    if (mood === 'sleep') { const o = 3.2 + 1.6 * Math.sin(t * 3.2); ctx.beginPath(); ctx.ellipse(0, 12, o, o + 1, 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-8, 10); ctx.quadraticCurveTo(0, 16, 8, 10); ctx.stroke(); }
  }
  ctx.restore();
}
// a four-point sparkle (world space)
function fizzStar(x, y, r, a, col = '#BFF0FF') {
  if (a <= 0.01 || r <= 0.5) return;
  both((c, glow) => {
    c.beginPath();
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rr = i % 2 ? r * 0.26 : r; c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    c.closePath(); c.fillStyle = rgba(glow ? '#7FE9FF' : col, a * (glow ? 0.7 : 1)); c.fill();
  });
}
function fizzStars(cx, cy, R, t, k, seed = 3, n = 9) {       // twinkling sparkles around a point
  for (let i = 0; i < n; i++) {
    const ph = hash(i + seed * 11) * 6.28, sp = 2.2 + hash(i + seed * 5) * 2.4, tw = Math.max(0, Math.sin(t * sp * 2 + ph));
    const a = hash(i * 3 + seed) * 6.28, d = R * (0.35 + 0.75 * hash(i * 7 + seed * 3));
    fizzStar(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, (9 + 16 * hash(i + seed)) * tw * k, tw * k);
  }
}
// a sewing pin (round head) or a needle (an eye and a thread). Its tip is at (x, y); it points along ang (it came from
// the opposite side). k 0..1 = the jab (flies in, overshoots, quivers); ghost = a dashed outline that was never there
function drawPin(x, y, ang, len, kind, col, k, t, ghost = 0) {
  if (k <= 0) return;
  const back = (1 - E.outBack(clamp(k), 2.6)) * 240 + 4 * Math.sin(t * 46 + ang * 5) * clamp(1.6 - k * 1.4);
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const tx = x - ux * back, ty = y - uy * back, hx = tx - ux * len, hy = ty - uy * len;
  const al = clamp(k * 4) * (1 - ghost);
  if (ghost > 0.01 && ghost < 0.99) {
    ctx.save(); ctx.setLineDash([9, 9]); ctx.globalAlpha = (1 - ghost) * 0.9;
    line(ctx, tx, ty, hx, hy, 4, '#DDE6FF'); ctx.beginPath(); ctx.arc(hx, hy, kind ? 9 : 15, 0, 7); ctx.lineWidth = 3.5; ctx.strokeStyle = '#DDE6FF'; ctx.stroke();
    ctx.restore(); return;
  }
  if (al <= 0.01) return;
  ctx.save(); ctx.globalAlpha = al;
  line(ctx, tx + 3, ty + 4, hx + 3, hy + 4, 7, 'rgba(0,0,10,0.35)');
  line(ctx, tx, ty, hx, hy, 7, '#8A93AD'); line(ctx, tx - uy * 1.5, ty + ux * 1.5, hx - uy * 1.5, hy + ux * 1.5, 2.6, '#F3F6FF');
  if (kind === 0) { circle(ctx, hx, hy, 17, mixHex(col, '#000000', 0.3)); circle(ctx, hx - 2, hy - 2, 14, col); circle(ctx, hx - 6, hy - 7, 4.5, 'rgba(255,255,255,0.85)'); }
  else {                                                 // the needle's eye, with a bit of thread
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang); rrect(ctx, -20, -7, 26, 14, 7); ctx.fillStyle = '#8A93AD'; ctx.fill(); rrect(ctx, -15, -3, 15, 6, 3); ctx.fillStyle = '#141230'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(hx - ux * 8, hy - uy * 8); ctx.quadraticCurveTo(hx - ux * 50 - uy * 30, hy - uy * 50 + ux * 30, hx - ux * 70 + uy * 14 * Math.sin(t * 6 + ang), hy - uy * 70 - ux * 14);
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
  softDot(gctx, x, y, 34, '#FFF3B0', 0.9 * al * clamp(1.5 - k));       // the prick
}
const PIN_COLS = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF', '#FF9A3C'];

// ---------------------------------------------------------------- the big bare foot (a side view, toes to the right)
// (x, y) = the heel's floor contact. o: {wig: toe wiggle 0..1, lift: px}
function bigFoot(x, y, s, t, o = {}) {
  const c = ctx, P = YOGA, wg = o.wig || 0;
  c.save(); c.translate(x, y - (o.lift || 0)); c.scale(s, s);
  // trouser leg
  c.beginPath(); c.moveTo(-112, -520); c.lineTo(86, -520); c.lineTo(62, -150); c.quadraticCurveTo(-20, -132, -98, -150); c.closePath();
  const pg = c.createLinearGradient(-110, 0, 90, 0); pg.addColorStop(0, P.pants); pg.addColorStop(1, P.pantsSh); c.fillStyle = pg; c.fill();
  // toes behind the big toe
  const toe = (i) => { const u = i / 4; return [lerp(246, 322, u), lerp(-26, -56, u) + wg * 15 * Math.sin(t * 15 + i * 1.25), lerp(34, 19, u)]; };
  for (let i = 4; i >= 1; i--) { const [tx, ty, tr] = toe(i); circle(c, tx, ty + 2, tr + 3, P.skinSh); circle(c, tx, ty, tr, P.skin); c.beginPath(); c.arc(tx + 3, ty - 4, tr * 0.5, Math.PI * 1.2, Math.PI * 1.9); c.lineWidth = 3; c.strokeStyle = rgba('#FFDCC4', 0.9); c.stroke(); }
  // ankle + foot
  const foot = () => {
    c.beginPath(); c.moveTo(-84, -160); c.quadraticCurveTo(-96, -90, -104, -46); c.quadraticCurveTo(-112, -6, -70, 0);
    c.lineTo(60, 0); c.quadraticCurveTo(110, -14, 170, 0); c.lineTo(236, 0); c.quadraticCurveTo(268, -6, 262, -40);
    c.quadraticCurveTo(190, -76, 120, -112); c.quadraticCurveTo(70, -140, 54, -160); c.closePath();
  };
  foot(); const fg = c.createLinearGradient(0, -160, 0, 6); fg.addColorStop(0, P.skin); fg.addColorStop(0.7, P.skin); fg.addColorStop(1, P.skinSh); c.fillStyle = fg; c.fill();
  c.lineWidth = 5; c.strokeStyle = rgba(P.skinSh, 0.9); c.stroke();
  ellipse(c, -30, -88, 22, 26, rgba(P.skinSh, 0.5));      // ankle bone
  { const [tx, ty, tr] = toe(0); circle(c, tx, ty + 3, tr + 4, P.skinSh); circle(c, tx, ty, tr, P.skin); rrect(c, tx + 4, ty - tr * 0.75, tr * 0.72, tr * 0.8, 8); c.fillStyle = rgba('#FFE4D2', 0.95); c.fill(); }
  // cuff
  c.beginPath(); c.moveTo(-106, -168); c.quadraticCurveTo(-20, -150, 70, -168); c.lineTo(66, -136); c.quadraticCurveTo(-20, -118, -102, -136); c.closePath(); c.fillStyle = P.pantsSh; c.fill();
  c.restore();
  // the same foot as a world polyline (for legWash) and its key points
  const w = (px, py) => [x + px * s, y - (o.lift || 0) + py * s];
  return { poly: [w(-10, -480), w(-12, -150), w(20, -48), w(250, -26)], toe: w(250, -30), heel: w(-80, -30), top: w(100, -110), sole: w(100, 0), w: 92 * s };
}

function initStudio() {
  const rng = mulberry32(41);
  STUDIO_BAMBOO = [...Array(5)].map((_, i) => ({
    x: 250 + i * 44 + rng() * 26, w: 13 + rng() * 9, lean: (rng() - 0.5) * 0.16, ph: rng() * 6,
    leaves: [...Array(5)].map(() => ({ y: 150 + rng() * 300, a: (rng() - 0.5) * 1.2, s: rng() < 0.5 ? -1 : 1 })),
  }));
}
