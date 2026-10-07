// His belly as an x-ray, from the front: ribs, the breathing muscle, and the belly's two-layer lining: the outer layer
// on the wall (orange), the inner layer wrapped round the organs (cyan), a slick of fluid between. Everything draws
// under the current camera (world coords, the torso centred on x 540).
'use strict';

const BL = { cx: 540, cy: 1170, rx: 262, ry: 300, gap: 26, OUT: '#FF9A3C', INN: '#7FE9FF', FLU: '#4D8DFF' };
// the sore spot: his right side (screen left), just under the ribs
const BL_K = [BL.cx - BL.rx + 6, BL.cy - 70];

// a closed loop: the cavity wall (inset 0) or the organ bundle (inset = gap), shifted by (ox, oy)
function blLoop(inset, ox = 0, oy = 0, n = 72) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2, cs = Math.cos(th), sn = Math.sin(th);
    const ex = 2 / 2.7, top = sn < 0 ? 0.86 : 1;   // a flatter top (it sits under the breathing muscle's dome)
    P.push([BL.cx + ox + (BL.rx - inset) * Math.sign(cs) * Math.pow(Math.abs(cs), ex),
      BL.cy + oy + (BL.ry - inset) * top * Math.sign(sn) * Math.pow(Math.abs(sn), ex)]);
  }
  return P;
}
function blPath(c, P) { c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.closePath(); }

function blFace(c, x, y, s, mood, t, look = 0) {
  // mood: 'happy' | 'calm' | 'ouch' | 'full' | 'smug'
  for (const sx of [-1, 1]) {
    if (mood === 'ouch') { line(c, x + sx * 16 * s - 7 * s, y - 6 * s, x + sx * 16 * s + 7 * s, y + 2 * s * sx, 4 * s, '#2A1020'); line(c, x + sx * 16 * s - 7 * s, y + 4 * s, x + sx * 16 * s + 7 * s, y - 4 * s * sx, 4 * s, '#2A1020'); }
    else { circle(c, x + sx * 16 * s, y, 8.5 * s, '#FFFFFF'); circle(c, x + sx * 16 * s + look * 3 * s, y + 1.5 * s, 4.6 * s, '#2A1020'); }
  }
  c.lineCap = 'round'; c.lineWidth = 4 * s; c.strokeStyle = '#2A1020'; c.beginPath();
  if (mood === 'ouch') { c.moveTo(x - 12 * s, y + 22 * s); for (let i = 1; i <= 6; i++) c.lineTo(x - 12 * s + i * 4 * s, y + 22 * s + (i % 2 ? -5 : 5) * s); }
  else if (mood === 'full') c.ellipse(x, y + 20 * s, 7 * s, 9 * s, 0, 0, 7);
  else if (mood === 'calm') { c.moveTo(x - 9 * s, y + 20 * s); c.lineTo(x + 9 * s, y + 20 * s); }
  else c.arc(x, y + 14 * s, 12 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  c.stroke();
}

// o: {ox, oy: the bundle's offset (the bounce); press 0..1: the gap closes on the sore side; swell 0..1: a full stomach;
//     hiOut, hiInn 0..1: a layer lights up; fluid 0..1; rub 0..1: sparks at the sore spot; fire 0..1: the nerves fire;
//     nerves 0..1: the outer layer's nerve endings are drawn; breath: diaphragm rise (-1..1); diaFace: mood or null;
//     moods: {liver, stomach}; food: [[x, y, kind]...]; alpha}
function bellyXray(t, o = {}) {
  const ox = (o.ox || 0) - 20 * (o.press || 0), oy = o.oy || 0, sw = o.swell || 0;
  const A = o.alpha === undefined ? 1 : o.alpha;
  // ---- the body's outline
  both((c, g) => {
    c.save(); c.globalAlpha = A * (g ? 0.5 : 1);
    c.beginPath();
    c.moveTo(290, 430); c.quadraticCurveTo(150, 470, 130, 640);                // right shoulder (screen left)
    c.lineTo(190, 900); c.quadraticCurveTo(215, 1180, 190, 1420); c.quadraticCurveTo(200, 1560, 250, 1700);
    c.lineTo(830, 1700); c.quadraticCurveTo(880, 1560, 890, 1420); c.quadraticCurveTo(865, 1180, 890, 900);
    c.lineTo(950, 640); c.quadraticCurveTo(930, 470, 790, 430); c.quadraticCurveTo(540, 380, 290, 430); c.closePath();
    if (!g) { const gr = c.createLinearGradient(0, 400, 0, 1700); gr.addColorStop(0, 'rgba(34,74,150,0.62)'); gr.addColorStop(1, 'rgba(20,40,104,0.62)'); c.fillStyle = gr; c.fill(); }
    c.lineWidth = g ? 14 : 6; c.strokeStyle = g ? 'rgba(90,190,255,0.5)' : 'rgba(127,233,255,0.85)'; c.stroke();
    c.restore();
  });
  const c = ctx;
  c.save(); c.globalAlpha = A;
  // the wall's muscle, as soft stripes between the skin and the lining
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const y = 950 + i * 52;
    line(c, BL.cx + s * (BL.rx + 12), y, BL.cx + s * (BL.rx + 64), y + 16, 15, 'rgba(255,120,130,0.20)');
  }
  // spine + ribs
  for (let i = 0; i < 14; i++) { rrect(c, 524, 470 + i * 84, 32, 62, 12); c.fillStyle = 'rgba(200,225,255,0.13)'; c.fill(); }
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(540 + s * 22, 520 + i * 62);
    c.bezierCurveTo(540 + s * 190, 500 + i * 62, 540 + s * (330 - i * 4), 590 + i * 66, 540 + s * (250 - i * 22), 690 + i * 56);
    c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = 'rgba(214,232,255,0.34)'; c.stroke();
  }
  // lungs
  const br = o.breath || 0;
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(540 + s * 135, 660 - 8 * br, 104 + 7 * br, 168 + 12 * br, s * 0.1, 0, 7); c.fillStyle = 'rgba(255,150,180,0.20)'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(255,170,195,0.45)'; c.stroke(); }
  c.restore();
  // ---- the breathing muscle: a dome over the belly
  const dY = (x) => 868 - 26 * br - 62 * Math.cos(((x - 540) / 262) * Math.PI / 2) + 62;
  both((cc, g) => {
    cc.save(); cc.globalAlpha = A * (g ? 0.45 : 1);
    cc.beginPath(); cc.moveTo(270, dY(270) + 26);
    for (let x = 270; x <= 810; x += 18) cc.lineTo(x, dY(x) - 62 + 0);
    cc.lineWidth = g ? 26 : 15; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = g ? rgba('#C8A8FF', 0.5 * (o.hiDia || 0)) : mixHex('#8E6FD0', '#D9C4FF', o.hiDia || 0); cc.stroke();
    cc.restore();
  });
  if (o.diaFace) { circle(ctx, 540, dY(540) - 62, 46, mixHex('#8E6FD0', '#D9C4FF', o.hiDia || 0)); blFace(ctx, 540, dY(540) - 70, 1.0, o.diaFace, t); }
  // ---- the outer layer: on the wall
  const OUT = blLoop(0), INN = blLoop(BL.gap * (1 - 0.2 * sw), ox, oy);
  // squeeze the bundle toward the sore side when pressed (the gap closes there)
  const pr = o.press || 0;
  for (const p of INN) { const u = clamp((BL.cx - p[0]) / BL.rx); p[0] -= pr * 12 * u * u; }
  // the fluid between them
  blPath(c, OUT); c.save(); c.globalAlpha = A; c.fillStyle = mixHex('#0B1640', '#1B3A9A', 0.55 + 0.45 * (o.fluid || 0)); c.fill(); c.restore();
  if ((o.fluid || 0) > 0.01) {
    const MID = blLoop(BL.gap * 0.5, ox * 0.5, oy * 0.5, 54);
    for (let i = 0; i < MID.length; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 5 - i * 0.7); both((cc, g) => softDot(cc, MID[i][0], MID[i][1], g ? 20 : 9, '#BFE2FF', (g ? 0.5 : 0.85) * tw * o.fluid * A)); }
  }
  both((cc, g) => {
    cc.save(); cc.globalAlpha = A * (g ? 0.16 + 0.22 * (o.hiOut || 0) : 1);
    blPath(cc, OUT); cc.lineJoin = 'round'; cc.lineWidth = g ? 18 : 13 + 5 * (o.hiOut || 0); cc.strokeStyle = g ? rgba(BL.OUT, 0.7) : mixHex('#E07A22', '#FFA94A', o.hiOut || 0); cc.stroke();
    cc.restore();
  });
  // the outer layer's nerve endings (they feel sharp pain): little trees that run out into the wall
  const nv = o.nerves || 0, fire = o.fire || 0;
  if (nv > 0.01) {
    for (let i = 0; i < 7; i++) {
      const y0 = BL_K[1] - 150 + i * 50, x0 = BL.cx - BL.rx * Math.pow(Math.abs(Math.cos(Math.asin(clamp((y0 - BL.cy) / BL.ry, -1, 1)))), 2 / 2.7);
      const k = clamp(nv * 7 - i * 0.5), f = fire * (0.55 + 0.45 * Math.sin(t * 40 + i * 2.1));
      if (k <= 0) continue;
      both((cc, g) => {
        cc.save(); cc.globalAlpha = A * k * (g ? 0.12 + 0.2 * fire : 1);
        cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.lineWidth = g ? 6 : 3.8; cc.strokeStyle = g ? rgba('#FFE46B', 0.35 + 0.65 * f) : mixHex('#E8C860', '#FFFFFF', f);
        cc.beginPath(); cc.moveTo(x0 + 3, y0); cc.lineTo(x0 - 22, y0 - 3); cc.lineTo(x0 - 44, y0 + 6 * (i % 2 ? 1 : -1)); cc.lineTo(x0 - 78 - 6 * (i % 3), y0 + 2);
        cc.moveTo(x0 - 22, y0 - 3); cc.lineTo(x0 - 36, y0 - 16); cc.moveTo(x0 - 44, y0 + 6 * (i % 2 ? 1 : -1)); cc.lineTo(x0 - 56, y0 + 20);
        cc.stroke();
        circle(cc, x0 + 3, y0, g ? 9 : 5, g ? rgba('#FFE46B', 0.5 + 0.5 * f) : '#FFE9A0');
        cc.restore();
      });
    }
  }
  // ---- the bundle: the inner layer wrapped round the organs
  c.save(); c.globalAlpha = A;
  blPath(c, INN); c.fillStyle = '#231440'; c.fill();
  c.save(); blPath(c, INN); c.clip();
  const bx = BL.cx + ox, by = BL.cy + oy;
  // liver (his right = screen left, up under the dome)
  c.beginPath(); c.moveTo(bx - 232, by - 150); c.quadraticCurveTo(bx - 210, by - 262, bx - 60, by - 258); c.quadraticCurveTo(bx + 40, by - 250, bx + 60, by - 190);
  c.quadraticCurveTo(bx - 40, by - 120, bx - 150, by - 46); c.quadraticCurveTo(bx - 236, by - 40, bx - 232, by - 150); c.closePath();
  { const gr = c.createLinearGradient(bx - 230, by - 260, bx + 40, by - 60); gr.addColorStop(0, '#C8564A'); gr.addColorStop(1, '#8E2F34'); c.fillStyle = gr; c.fill(); c.lineWidth = 4; c.strokeStyle = '#5A1522'; c.stroke(); }
  // stomach (screen right), swelling when full
  const sx = bx + 112, sy = by - 150, ss = 1 + 0.42 * sw;
  c.save(); c.translate(sx, sy); c.scale(ss, ss);
  c.beginPath(); c.moveTo(-36, -96); c.quadraticCurveTo(40, -118, 86, -50); c.quadraticCurveTo(112, 40, 20, 78); c.quadraticCurveTo(-60, 96, -96, 44);
  c.quadraticCurveTo(-60, 40, -44, 0); c.quadraticCurveTo(-30, -50, -36, -96); c.closePath();
  { const gr = c.createLinearGradient(-90, -100, 90, 90); gr.addColorStop(0, '#FFB0C4'); gr.addColorStop(1, '#E8608A'); c.fillStyle = gr; c.fill(); c.lineWidth = 4; c.strokeStyle = '#8A2548'; c.stroke(); }
  c.restore();
  // coils
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [w, col] of [[40, '#B4583E'], [31, '#F2A08C']]) {
    c.beginPath();
    for (let j = 0; j < 4; j++) {
      const y = by + 6 + j * 62, dir = j % 2 ? -1 : 1;
      if (j === 0) c.moveTo(bx - 170 * dir, y);
      c.lineTo(bx + 170 * dir, y); if (j < 3) c.quadraticCurveTo(bx + 214 * dir, y + 31, bx + 170 * dir, y + 62);
    }
    c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }
  c.restore();
  const moods = o.moods || {};
  blFace(c, bx - 120, by - 180, 1.15, moods.liver || 'calm', t, -1);
  blFace(c, sx + 6 * ss, sy - 22 * ss, 1.15 * ss, moods.stomach || 'happy', t, -1);
  c.restore();
  both((cc, g) => {
    cc.save(); cc.globalAlpha = A * (g ? 0.14 + 0.2 * (o.hiInn || 0) : 1);
    blPath(cc, INN); cc.lineJoin = 'round'; cc.lineWidth = g ? 14 : 9 + 5 * (o.hiInn || 0); cc.strokeStyle = g ? rgba(BL.INN, 0.7) : mixHex('#35B4DA', '#8FEFFF', o.hiInn || 0); cc.stroke();
    cc.restore();
  });
  // ---- the rub at the sore spot
  const rub = o.rub || 0;
  if (rub > 0.01) {
    const K = [BL_K[0] - 4 - 8 * pr, BL_K[1] + oy * 0.5];
    both((cc, g) => softDot(cc, K[0], K[1], g ? 90 : 80, '#FF3A4A', (g ? 0.22 : 0.42) * rub * A));
    for (let i = 0; i < 9; i++) {
      const ph = ((t * 3.2 + i * 0.37) % 1), a = Math.PI + (hash(i * 9.1 + Math.floor(t * 3.2 + i * 0.37)) - 0.5) * 2.6, r0 = 8 + 64 * ph;
      const x = K[0] + Math.cos(a) * r0 * 0.6, y = K[1] + Math.sin(a) * r0 * 1.5;
      both((cc, g) => line(cc, x, y, x + Math.cos(a) * 14, y + Math.sin(a) * 14, g ? 9 : 4, rgba(g ? '#FFB870' : '#FFF2B0', (1 - ph) * rub * A)));
    }
  }
}

// a pill label with a dotted leader to a screen point (screen space)
function blLabel(txt, x, y, px, py, col, k, size = 38) {
  if (k <= 0) return;
  screenSpace();
  ctx.setLineDash([9, 9]); line(ctx, x, y, lerp(x, px, clamp(k * 1.4)), lerp(y, py, clamp(k * 1.4)), 4, rgba(col, 0.9)); ctx.setLineDash([]);
  if (k > 0.7) { circle(ctx, px, py, 9, col); softDot(gctx, px, py, 36, col, 0.8); }
  pill(x, y, txt, col, k, size);
}

// food falling down the gullet into the stomach (world coords)
function blFood(x, y, kind, s = 1, a = 1) {
  const c = ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  if (kind === 'burger') {
    c.beginPath(); c.ellipse(0, -10, 34, 22, 0, Math.PI, 0); c.fillStyle = '#E8A44A'; c.fill();
    rrect(c, -36, -10, 72, 9, 4); c.fillStyle = '#5FD068'; c.fill();
    rrect(c, -34, -2, 68, 12, 5); c.fillStyle = '#7A3B22'; c.fill();
    rrect(c, -34, 10, 68, 12, 6); c.fillStyle = '#E8A44A'; c.fill();
    for (const [sx, sy] of [[-14, -22], [4, -26], [18, -19]]) ellipse(c, sx, sy, 3.5, 2, '#FFF6DC');
  } else if (kind === 'soda') {
    c.beginPath(); c.moveTo(-20, -30); c.lineTo(20, -30); c.lineTo(15, 30); c.lineTo(-15, 30); c.closePath(); c.fillStyle = '#FF4A5E'; c.fill();
    rrect(c, -23, -36, 46, 9, 4); c.fillStyle = '#F4F0E6'; c.fill(); line(c, 6, -36, 14, -62, 5, '#F4F0E6');
    rrect(c, -17, -8, 34, 14, 3); c.fillStyle = '#FFF6DC'; c.fill();
  } else { circle(c, 0, 0, 22, '#F2C14E'); circle(c, 0, 0, 9, '#231440'); }   // a doughnut
  c.restore();
}
