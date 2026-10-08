// His birthday, close: a dark room out of focus (balloons, bunting, a string of lights), a table, and cakes that keep
// arriving. One world for the hook and the button: everything round frame 1 is a function of tt = seconds since
// frame 1 (negative tt = the last seconds of the Short, so its last frames run into its first: the loop).
'use strict';

const PARTY = { HX: 540, HY: 1700, S: 1, CX: 540, CY: 1402, TABLE: 1470 };   // hero's feet, the cake's top centre, the table edge (world)
let PARTY_BG = null;
// his party shirt (the pyjama cut of the rig: a placket, buttons, a collar): teal, so the flames in front of it read
const PARTYPAL = Object.assign({}, PAL, { coat: '#19A79A', coatSh: '#0E7F75', coatHi: '#8DE8DC', coatDk: '#0B5F58', pj: true });

function initParty() {
  // the room behind him, painted once and out of focus (a flat, unlit plate: the light stage leaves it as drawn)
  PARTY_BG = mkCanvas(W + 240, H + 240);
  const x = PARTY_BG.getContext('2d'), rng = mulberry32(2909);
  const g = x.createLinearGradient(0, 0, 0, H + 240);
  g.addColorStop(0, '#2A1440'); g.addColorStop(0.55, '#1C0F33'); g.addColorStop(1, '#0C0718');
  x.fillStyle = g; x.fillRect(0, 0, W + 240, H + 240);
  x.filter = 'blur(9px)';
  // a window with the night in it, far right
  rrect(x, 880, 520, 330, 520, 18); x.fillStyle = '#16264F'; x.fill();
  x.fillStyle = '#2B1A45'; x.fillRect(1038, 520, 14, 520); x.fillRect(880, 770, 330, 14);
  // bunting across the top
  const cols = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF', '#FF9A3C'];
  for (let i = 0; i < 13; i++) {
    const u = i / 12, bx = 60 + u * 1200, by = 420 + 150 * Math.sin(Math.PI * u);
    x.beginPath(); x.moveTo(bx - 46, by - 6); x.lineTo(bx + 46, by + 6); x.lineTo(bx + 4, by + 104); x.closePath();
    x.fillStyle = cols[i % cols.length]; x.globalAlpha = 0.5; x.fill();
  }
  x.globalAlpha = 1;
  // balloons, left and right of where he sits
  const bal = [[250, 760, 120, '#FF5A6E'], [150, 1010, 104, '#FFD447'], [330, 1090, 92, '#7FE9FF'], [1030, 700, 118, '#4DFFB4'], [1150, 980, 100, '#C8A8FF'], [960, 1120, 90, '#FF9A3C']];
  for (const [bx, by, r, col] of bal) {
    x.strokeStyle = 'rgba(230,220,255,0.25)'; x.lineWidth = 4; x.beginPath(); x.moveTo(bx, by + r); x.quadraticCurveTo(bx + 30, by + r + 260, bx - 10, by + r + 620); x.stroke();
    x.globalAlpha = 0.62; x.fillStyle = col; x.beginPath(); x.ellipse(bx, by, r * 0.86, r, 0, 0, 7); x.fill();
    x.globalAlpha = 0.3; x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(bx - r * 0.3, by - r * 0.36, r * 0.2, r * 0.3, -0.5, 0, 7); x.fill();
    x.globalAlpha = 1;
  }
  x.filter = 'blur(5px)';
  // a string of warm lights, high up
  for (let i = 0; i < 16; i++) {
    const u = i / 15, lx = 40 + u * 1240, ly = 300 + 90 * Math.sin(Math.PI * u) + rng() * 14;
    const gg = x.createRadialGradient(lx, ly, 0, lx, ly, 46); gg.addColorStop(0, 'rgba(255,214,150,0.95)'); gg.addColorStop(1, 'rgba(255,170,90,0)');
    x.fillStyle = gg; x.beginPath(); x.arc(lx, ly, 46, 0, 7); x.fill();
  }
  x.filter = 'none';
}
// the room, with a little parallax against the camera
function partyBack(cam, t) {
  screenSpace();
  const k = 1 + (cam.zoom - 2.3) * 0.14, dx = -(cam.x - 540) * 0.5, dy = -(cam.y - 1320) * 0.5;
  ctx.drawImage(PARTY_BG, -120 * k + dx, -120 * k + dy, (W + 240) * k, (H + 240) * k);
  // the string of lights twinkles a little (glow layer only; they hang above his head)
  for (let i = 0; i < 16; i++) {
    const u = i / 15, lx = (40 + u * 1240 - 120) * k + dx, ly = (300 + 90 * Math.sin(Math.PI * u) - 120) * k + dy;
    softDot(gctx, lx, ly, 60, '#FFC27A', 0.20 + 0.10 * Math.sin(t * 2.3 + i * 1.7));
  }
}

// ---------------------------------------------------------------- a candle flame (world units; draws into ctx and the glow layer)
// lean: rad from upright (a breath pushes it over), k: size 0..1, seed: its own flicker
function tfFlame(x, y, s, t, lean = 0, k = 1, seed = 0) {
  if (k <= 0.02) return;
  const fl = 1 + 0.12 * Math.sin(t * 31 + seed * 2.1) + 0.08 * Math.sin(t * 47 + seed);
  const h = 46 * s * k * fl, w = 13 * s * (0.7 + 0.3 * k);
  for (const [c, a] of [[ctx, 1], [gctx, 0.85]]) {
    c.save(); c.translate(x, y); c.rotate(lean + 0.07 * Math.sin(t * 23 + seed));
    c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(w * 1.25, -h * 0.2, w * 0.6, -h * 0.74, 0, -h); c.bezierCurveTo(-w * 0.6, -h * 0.74, -w * 1.25, -h * 0.2, 0, 2);
    c.fillStyle = c === ctx ? '#FF8A1E' : `rgba(255,140,40,${a * 0.7})`; c.fill();
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(w * 0.7, -h * 0.16, w * 0.34, -h * 0.5, 0, -h * 0.66); c.bezierCurveTo(-w * 0.34, -h * 0.5, -w * 0.7, -h * 0.16, 0, 0);
    c.fillStyle = c === ctx ? '#FFF1A8' : `rgba(255,236,150,${a * 0.6})`; c.fill();
    c.restore();
  }
  softDot(gctx, x, y - h * 0.5, 34 * s * k, '#FFB050', 0.22 * k);
}
// a wisp of smoke from a wick that has just gone out (d = seconds since)
function tfSmoke(x, y, s, d, seed = 0) {
  if (d <= 0 || d > 1.3) return;
  const a = clamp(d * 8) * clamp(1.25 - d);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(214,206,236,${0.5 * a})`; ctx.lineWidth = (4 + 7 * d) * s;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 1; i <= 8; i++) { const u = i / 8, yy = y - u * (30 + 110 * d) * s; ctx.lineTo(x + Math.sin(u * 5 + d * 5 + seed) * (5 + 22 * u * d) * s, yy); }
  ctx.stroke(); ctx.restore();
}

// ---------------------------------------------------------------- a birthday cake with two number candles
// (cx, cy) = the centre of its top. o: {digits: '29', pal: [frosting, side, drip, plate], big, lit: [k, k], lean: [rad, rad],
// out: [seconds since each went out, or -1], squash}
const CAKES = [
  { digits: '29', pal: ['#FFE3EE', '#FF8FB5', '#FFFFFF', '#E9E4FF'], dc: ['#FF5A6E', '#3FA7FF'], big: 1.0 },
  { digits: '30', pal: ['#E4FFF6', '#49D6B0', '#FFFFFF', '#E9E4FF'], dc: ['#FFB020', '#B86BFF'], big: 1.06 },
  { digits: '31', pal: ['#FFF2C8', '#B5703C', '#FFE9A6', '#E9E4FF'], dc: ['#3FD27F', '#FF5A6E'], big: 1.12 },
];
function tfCake(cx, cy, t, o = {}) {
  const c = ctx, K = CAKES[o.kind || 0], b = K.big, sq = o.squash || 0;
  const rx = 112 * b * (1 + 0.10 * sq), ry = 22 * b, hgt = 62 * b * (1 - 0.16 * sq);
  c.save(); c.translate(cx, cy);
  // plate
  ellipse(c, 0, hgt + 8, rx + 26, ry + 6, '#B9B2D6'); ellipse(c, 0, hgt + 3, rx + 24, ry + 5, K.pal[3]);
  // side
  c.beginPath(); c.moveTo(-rx, 0); c.lineTo(-rx, hgt); c.ellipse(0, hgt, rx, ry, 0, Math.PI, 0, true); c.lineTo(rx, 0); c.closePath(); c.fillStyle = K.pal[1]; c.fill();
  // a ribbon of piped dots round the foot
  paint(() => { for (let i = -5; i <= 5; i++) { const u = i / 5.6; circle(c, u * rx, hgt + ry * Math.sqrt(Math.max(0, 1 - u * u)) - 7, 7 * b, K.pal[2]); } });
  // frosting on top, with drips over the edge
  c.beginPath(); c.moveTo(-rx, 0);
  for (let i = 0; i <= 12; i++) { const u = -1 + (2 * i) / 12, dx = u * rx, dy = ry * Math.sqrt(Math.max(0, 1 - u * u)) + (i % 2 ? 18 : 6) * b * (0.8 + 0.4 * hash(i + (o.kind || 0) * 7)); c.lineTo(dx, dy); }
  c.lineTo(rx, 0); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI, true); c.closePath(); c.fillStyle = K.pal[0]; c.fill();
  ellipse(c, 0, 0, rx, ry, K.pal[0]);
  c.restore();
  // the number candles: the digits themselves, standing on the cake, a wick and a flame on each
  const fs = 66 * b, gap = 33 * b, lit = o.lit || [1, 1], lean = o.lean || [0, 0], out = o.out || [-1, -1];
  const tips = [];
  [-1, 1].forEach((sd, i) => {
    const dx = cx + sd * gap, base = cy + 2;
    paint(() => {
      c.save(); c.font = `400 ${fs}px Anton`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
      c.lineWidth = 7 * b; c.strokeStyle = '#2A1030'; c.strokeText(K.digits[i], dx, base);
      c.fillStyle = K.dc[i]; c.fillText(K.digits[i], dx, base);
      c.restore();
      line(c, dx, base - fs * 0.80, dx, base - fs * 0.80 - 9 * b, 3 * b, '#2A1030');
    });
    const tip = [dx, base - fs * 0.80 - 9 * b];
    tips.push(tip);
    tfFlame(tip[0], tip[1], b, t, lean[i], lit[i], i + (o.kind || 0) * 3);
    if (out[i] >= 0) tfSmoke(tip[0], tip[1] - 2, b, out[i], i);
  });
  return tips;
}

// ---------------------------------------------------------------- a party hat, in head space (the brim sits on his hair)
function tfHat(c, k = 1, tilt = 0, hop = 0) {
  if (k <= 0) return;
  c.save(); c.translate(6, -60 - hop); c.rotate(0.10 + tilt); c.scale(k, k);
  c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(3, -98); c.closePath(); c.fillStyle = '#3FA7FF'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(3, -98); c.closePath(); c.clip();
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#FFD447' : '#FF5A6E'; c.beginPath(); c.moveTo(-60, -14 - i * 22); c.lineTo(60, -34 - i * 22); c.lineTo(60, -44 - i * 22); c.lineTo(-60, -24 - i * 22); c.closePath(); c.fill(); }
    c.restore();
  });
  rrect(c, -44, -8, 88, 14, 7); c.fillStyle = '#FFFFFF'; c.fill();
  circle(c, 3, -102, 13, '#FFD447');
  c.restore();
}
// his cheeks, puffed (head space); k 0..1
function tfCheeks(c, k, pal) {
  if (k <= 0.03) return;
  for (const s of [-1, 1]) ellipse(c, s * 52, 30, 14 + 13 * k, 13 + 11 * k, pal.skin);
  paint(() => { for (const s of [-1, 1]) ellipse(c, s * 54, 30, 9 + 6 * k, 6 + 4 * k, 'rgba(255,110,110,0.34)'); });
}
// a party horn in his mouth (head space): it rolls out to `k` 0..1 and curls back; drop: it falls out
function tfHorn(c, k, t, drop = 0) {
  if (drop >= 1) return;
  c.save(); c.translate(6, 42 + 300 * drop * drop); c.rotate(0.16 + 1.3 * drop);
  const L = 18 + 150 * k;
  line(c, 0, 0, 14, 0, 17, '#FFFFFF');
  paint(() => { for (let i = 0; i < Math.ceil(L / 14); i++) { const a = 14 + i * 14, b2 = Math.min(14 + L, a + 14); line(c, a, 0, b2, 0, 21 - i * 0.4, i % 2 ? '#FFD447' : '#FF5A6E'); } });
  // the curl at its end (tight when rolled up)
  c.strokeStyle = '#FF5A6E'; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath();
  const turns = 1.6 * (1 - k) + 0.25;
  for (let i = 0; i <= 20; i++) { const u = i / 20, a = u * turns * Math.PI * 2, r = 4 + 18 * (1 - u) * (1 - k * 0.5); c.lineTo(14 + L + r * Math.sin(a) , -r + r * Math.cos(a)); }
  c.stroke();
  c.restore();
}
// confetti from a point (world), d = seconds since the burst
function tfConfetti(x, y, d, seed = 1, n = 34, spread = 1) {
  if (d <= 0 || d > 1.5) return;
  const rng = mulberry32(seed * 131 + 7), cols = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF', '#FFFFFF'];
  paint(() => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (rng() - 0.5) * 2.5 * spread, v = 260 + rng() * 420, w = 5 + rng() * 6, col = cols[i % cols.length], sp = 6 + rng() * 10;
      const px = x + Math.cos(a) * v * d * (1 - 0.25 * d), py = y + Math.sin(a) * v * d + 0.5 * 760 * d * d;
      ctx.save(); ctx.translate(px, py); ctx.rotate(sp * d + i); ctx.globalAlpha = clamp(1.5 - d);
      ctx.fillStyle = col; ctx.fillRect(-w, -w * 0.45 * Math.abs(Math.cos(sp * d * 1.3 + i)), 2 * w, w * 0.9 * Math.abs(Math.cos(sp * d * 1.3 + i)) + 1.2);
      ctx.restore();
    }
  });
}

// ---------------------------------------------------------------- frame 1 and round it
// tt = seconds since frame 1. Negative tt is the end of the Short (the button): a cake slides in, its candles light, he
// looks at it, at us, sighs, breathes in. At 0 he is blowing. Then the next two birthdays arrive.
function partyState(tt) {
  const c = cu(), D = TLd.duration;
  const tOr = c.or - D, tL = c.light.map((x) => x - D), tHappy = c.happy - D, tSigh = c.sigh - D, tLoop = c.loop - D;
  // ---- the three cakes: where each one is, and its candles
  const arrive = (t1) => ramp(tt, t1 - 0.17, t1, E.outCubic), leave = (t1) => ramp(tt, t1 - 0.17, t1 - 0.02, E.inCubic);
  const A = { kind: 0 }, B = { kind: 1 }, Cc = { kind: 2 };
  const aIn = tt < -0.6 ? ramp(tt, tOr - 0.06, tOr + 0.24, E.outCubic) : 1;
  A.x = lerp(1250, PARTY.CX, aIn) - 900 * leave(c.slam2);
  A.on = tt < c.slam2 + 0.05;
  const blow1 = clamp(inv(-0.02, c.out1, tt));                          // 0..1 through the first blow
  const lit0 = tt < -0.6 ? [tt > tL[0] ? ramp(tt, tL[0], tL[0] + 0.12, E.outBack) : 0, tt > tL[1] ? ramp(tt, tL[1], tL[1] + 0.12, E.outBack) : 0] : [1, 1];
  A.lit = tt >= c.out1 ? [0, 0] : tt >= 0 ? [1 - 0.55 * blow1, 1 - 0.45 * blow1] : lit0;
  A.lean = tt >= -0.02 && tt < c.out1 ? [-(0.9 + 0.5 * blow1) - 0.2 * Math.sin(tt * 60), (0.9 + 0.5 * blow1) + 0.2 * Math.sin(tt * 53 + 1)] : [0, 0];
  A.out = tt >= c.out1 ? [tt - c.out1, tt - c.out1 - 0.03] : [-1, -1];
  B.x = lerp(1250, PARTY.CX, arrive(c.slam2)) - 900 * leave(c.slam3);
  B.on = tt > c.slam2 - 0.2 && tt < c.slam3 + 0.05;
  const blow2 = clamp(inv(c.out2 - 0.2, c.out2, tt));
  B.lit = tt >= c.out2 ? [0, 0] : [1 - 0.5 * blow2, 1 - 0.5 * blow2];
  B.lean = blow2 > 0 && tt < c.out2 ? [-1.3 * blow2 - 0.2 * Math.sin(tt * 60), 1.3 * blow2 + 0.2 * Math.sin(tt * 53)] : [0, 0];
  B.out = tt >= c.out2 ? [tt - c.out2, tt - c.out2 - 0.03] : [-1, -1];
  B.squash = Math.exp(-Math.max(0, tt - c.slam2) * 9) * (tt >= c.slam2 ? 1 : 0);
  Cc.x = lerp(1250, PARTY.CX, arrive(c.slam3));
  Cc.on = tt > c.slam3 - 0.2;
  Cc.lit = [1, 1]; Cc.lean = [0, 0]; Cc.out = [-1, -1];
  Cc.squash = Math.exp(-Math.max(0, tt - c.slam3) * 9) * (tt >= c.slam3 ? 1 : 0);
  // ---- him
  let p = clone(POSES.stand);
  p.armL = { a: 0.16, b: 0.2 }; p.armR = { a: 0.16, b: 0.2 };
  const j2 = tt >= c.slam2 ? Math.exp(-(tt - c.slam2) * 5) : 0, j3 = tt >= c.slam3 ? Math.exp(-(tt - c.slam3) * 2.2) : 0;
  // his hands: a start at cake 30, both up beside his head at cake 31. The hand targets are blended, not the joint
  // angles, so the elbows stay bent on the way up and down (no T-pose in between)
  const up = Math.max(0.3 * j2, Math.min(1, j3 * 1.25));
  const rest = [122, p.hipY + 30], high = [140, p.hipY - 296];
  const hx = lerp(rest[0], high[0], up) - 34 * Math.sin(Math.PI * up), hy = lerp(rest[1], high[1], up);
  if (up > 0.02) { p = ikReach(p, 'L', [-hx, hy], 1); p = ikReach(p, 'R', [hx, hy], 1); }
  p.hand = up > 0.5 ? 'spread' : 'open';
  const inhale = tt < 0 ? ramp(tt, tLoop, -0.02, E.inOutSine) : 0;       // the last half second: he fills his cheeks
  const sigh = tt < 0 ? ramp(tt, tSigh, tSigh + 0.3, E.outCubic) * (1 - ramp(tt, tLoop - 0.05, tLoop + 0.2)) : 0;
  const puff = Math.max(inhale * 1.0, tt >= -0.02 && tt < c.out1 + 0.06 ? 1 - 0.35 * blow1 : 0, tt < c.out2 + 0.05 ? Math.sin(Math.PI * clamp(inv(c.out2 - 0.24, c.out2 + 0.05, tt))) : 0);
  const blowing = Math.max(tt >= -0.02 && tt < c.out1 + 0.03 ? 1 : 0, tt > c.out2 - 0.2 && tt < c.out2 + 0.02 ? 1 : 0);
  // the face, beat by beat
  const down = { lookX: 0, lookY: 1 };
  let face = Object.assign({}, FACES.calm, down, { mouth: 'flat', mouthOpen: 0.1, browY: 0.3 });
  if (tt < 0) {
    const see = ramp(tt, tOr + 0.05, tOr + 0.3), us = ramp(tt, tHappy - 0.12, tHappy + 0.08), back = ramp(tt, tLoop - 0.12, tLoop + 0.06);
    face = lerpFace(Object.assign({}, FACES.dazed, { cross: 0, blink: 0.3, lookX: 0.2, lookY: 0 }), Object.assign({}, FACES.worried, down, { mouth: 'flat', mouthOpen: 0 }), see);
    face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.36, browTilt: -0.3, browY: -0.3 }), us);
    face = lerpFace(face, Object.assign({}, FACES.sleepy, { blink: 0.8, lookY: 0.6, mouth: 'o', mouthOpen: 0.25, browY: 0.7, browTilt: 0.8 }), sigh);
    face = lerpFace(face, Object.assign({}, FACES.calm, down, { mouth: 'o', mouthOpen: 0.12, browY: 0.9, eyeOpen: 1.1 }), back * (1 - sigh));
    face = lerpFace(face, Object.assign({}, FACES.calm, down, { mouth: 'o', mouthOpen: 0.16, browY: 1.0, eyeOpen: 1.1 }), inhale);
  } else {
    const blowF = Object.assign({}, FACES.calm, down, { mouth: 'o', mouthOpen: 0.16, browY: 1.0, eyeOpen: 1.1 });
    const glad = ramp(tt, c.out1 + 0.05, c.out1 + 0.2) * (1 - ramp(tt, c.slam2 - 0.14, c.slam2 - 0.02));
    const huh = ramp(tt, c.slam2 - 0.06, c.slam2 + 0.05) * (1 - ramp(tt, c.out2 - 0.22, c.out2 - 0.14));
    const again = ramp(tt, c.out2 - 0.22, c.out2 - 0.14) * (1 - ramp(tt, c.out2 + 0.02, c.out2 + 0.12));
    const frown = ramp(tt, c.out2 + 0.04, c.out2 + 0.16) * (1 - ramp(tt, c.slam3 - 0.1, c.slam3));
    const shock = ramp(tt, c.slam3 - 0.04, c.slam3 + 0.06) * (1 - ramp(tt, c.horn + 0.25, c.horn + 0.45));
    const dead = ramp(tt, c.horn + 0.25, c.horn + 0.45);
    face = blowF;
    face = lerpFace(face, Object.assign({}, FACES.grin, { blink: 1, browY: 0.9 }), glad);
    face = lerpFace(face, Object.assign({}, FACES.startled, down), huh);
    face = lerpFace(face, Object.assign({}, blowF, { browTilt: 0.9, browY: 0.4 }), again);
    face = lerpFace(face, Object.assign({}, FACES.confused, { lookX: 0.9, lookY: 0.6 }), frown);
    face = lerpFace(face, Object.assign({}, FACES.shock, { lookY: 0.8 }), shock);
    face = lerpFace(face, Object.assign({}, FACES.annoyed, { lookX: 0, lookY: 0, blink: 0.34, browTilt: -0.2, browY: -0.4, mouth: 'flat', mouthOpen: 0 }), dead);
  }
  // he leans back to breathe in and in to blow. The lean is continuous across frame 1 (the loop): it starts where the
  // breath in left it and goes forward in the first sixth of a second
  const lean = tt < -0.02 ? inhale * -0.5
    : lerp(-0.5, 1, ramp(tt, -0.02, 0.16, E.inOutSine)) * (1 - ramp(tt, c.out1 - 0.02, c.out1 + 0.14)) + 0.8 * Math.sin(Math.PI * clamp(inv(c.out2 - 0.26, c.out2 + 0.1, tt)));
  const st = { x: PARTY.HX, y: PARTY.HY, s: PARTY.S, pose: p, face, noLegs: true,
    headDY: 7 * lean - 12 * j3 + 5 * sigh + 1.5 * Math.sin(tt * 2.1), headDX: 0, headRot: 0.02 * Math.sin(tt * 1.7) - 0.05 * j3 * Math.sin(tt * 30) };
  const hop = 46 * (tt >= c.slam3 ? Math.sin(Math.PI * clamp(inv(c.slam3, c.slam3 + 0.42, tt))) : 0);    // his hat jumps
  const horn = tt >= c.horn ? { k: Math.sin(Math.PI * clamp(inv(c.horn, c.horn + 0.44, tt))) , drop: ramp(tt, c.relax + 0.34, c.relax + 0.7, E.inCubic) } : null;
  return { st, cakes: [A, B, Cc], puff, blowing, hop, horn, j2, j3, inhale, sigh };
}
function partyCam(tt) {
  const c = cu(), D = TLd.duration, tB = shotOf('button').start - D, tDive = shotOf('brain').start;
  const Y = (z) => 1230 + 210 / z;         // keeps the middle of his head at screen y 750 for any zoom
  const k = camKeys(tt, [[tB, 540, Y(2.5), 2.5], [tB + 1.4, 540, Y(2.62), 2.62], [-0.45, 540, Y(2.78), 2.78], [0, 540, Y(2.9), 2.9], [0.36, 540, Y(3.06), 3.06],
    [c.slam2 - 0.1, 540, Y(3.08), 3.08], [c.slam2 + 0.12, 540, Y(2.72), 2.72], [c.slam3 - 0.08, 540, Y(2.74), 2.74], [c.slam3 + 0.14, 540, Y(2.5), 2.5],
    [c.relax - 0.1, 540, Y(2.56), 2.56], [tDive - 0.22, 540, 1266, 3.0], [tDive, 540, 1196, 4.6]]);
  const s2 = tt >= c.slam2 ? Math.exp(-(tt - c.slam2) * 9) : 0, s3 = tt >= c.slam3 ? Math.exp(-(tt - c.slam3) * 7) : 0;
  const sh = shake(tt, 7 * s2 + 13 * s3, 30, 3);
  k.x += sh[0] / k.zoom; k.y += sh[1] / k.zoom;
  return k;
}
function partyDraw(tt, t, o = {}) {
  const c = cu(), cam = o.cam || partyCam(tt), S = partyState(tt), st = S.st;
  partyBack(cam, t);
  // ---- him (the hat, the cheeks and the horn are drawn in his own layer, so the light falls on them)
  const r = charLayer(cam, st, t, { pal: PARTYPAL, post: (cc, rr, s2) => {
    headSpace(cc, rr, s2, (hc) => { tfCheeks(hc, S.puff, PARTYPAL); tfHat(hc, 1, 0.02 * Math.sin(tt * 3), S.hop); if (S.horn) tfHorn(hc, S.horn.k, t, S.horn.drop); });
  } });
  applyCam(cam);
  // ---- the table, then whatever is on it
  ctx.fillStyle = '#3A1230'; ctx.fillRect(-400, PARTY.TABLE, 1900, 900);
  ctx.fillStyle = '#5A1D48'; ctx.fillRect(-400, PARTY.TABLE, 1900, 9);
  if (o.under) o.under(S);
  // confetti with each new cake: from both sides of it and behind it, so its number stays readable
  if (o.confetti !== false) {
    for (const sd of [-1, 1]) {
      tfConfetti(PARTY.CX + sd * 150, PARTY.CY + 10, tt - c.slam2, 2 + sd, 14, 0.8);
      tfConfetti(PARTY.CX + sd * 160, PARTY.CY + 10, tt - c.slam3, 5 + sd, 24, 1.0);
    }
  }
  let tips = null;
  for (const k0 of S.cakes) {
    if (!k0.on) continue;
    const k = o.kindMap && o.kindMap[k0.kind] !== undefined ? Object.assign({}, k0, { kind: o.kindMap[k0.kind] }) : k0;
    const moving = Math.abs(k.x - PARTY.CX) > 4 && Math.abs(k.x - PARTY.CX) < 880;
    if (moving) for (let g = 2; g >= 1; g--) { ctx.globalAlpha = 0.14; tfCake(k.x + g * 46 * Math.sign(k.x - PARTY.CX || 1), PARTY.CY, t, Object.assign({}, k, { lit: [0, 0], out: [-1, -1] })); ctx.globalAlpha = 1; }
    const tp = tfCake(k.x, PARTY.CY, t, k);
    if (Math.abs(k.x - PARTY.CX) < 4) tips = tp;
  }
  // ---- his breath: streaks from his mouth down to the flames
  if (S.blowing > 0 && tips) {
    const m = headPt(st, r, [0, 46]);
    paint(() => {
      for (let i = 0; i < 7; i++) {
        const u = (i - 3) / 3, ph = (((tt * 5.5 + i * 0.29) % 1) + 1) % 1, tx = lerp(tips[0][0], tips[1][0], (u + 1) / 2) + u * 16, ty = tips[0][1] - 6;
        const x0 = lerp(m[0] + u * 5, tx, ph), y0 = lerp(m[1], ty, ph), x1 = lerp(m[0] + u * 5, tx, Math.min(1, ph + 0.34)), y1 = lerp(m[1], ty, Math.min(1, ph + 0.34));
        line(ctx, x0, y0, x1, y1, 4.2, `rgba(240,248,255,${0.9 * Math.sin(Math.PI * ph)})`);
      }
    });
  }
  return { cam, S, r };
}
