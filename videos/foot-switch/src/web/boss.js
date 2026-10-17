// Inside the left half of his brain: the boss's office. The left half as a character (the same face it wore in his
// glass head, now big, with a tie), a desk, two wheels on it, HAND and FOOT, on ONE belt (so they turn the same way),
// and a monitor on the wall that shows his real foot. Screen space (1080x1920); a view V = {s, cx, cy} scales the
// whole set about a point for the camera's push.
'use strict';

let BOSS_WALL = null;
function initBoss() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d'), rng = mulberry32(17);
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2A0F33'); g.addColorStop(0.45, '#46184F'); g.addColorStop(0.62, '#3A1442'); g.addColorStop(1, '#1C0A22');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the wall is brain: soft folds
  c.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const y0 = 120 + rng() * 980, x0 = -100 + rng() * 1200, L = 220 + rng() * 260;
    c.beginPath(); c.moveTo(x0, y0);
    for (let k = 1; k <= 6; k++) c.quadraticCurveTo(x0 + (k - 0.5) * L / 6, y0 + (k % 2 ? -1 : 1) * (18 + rng() * 16), x0 + k * L / 6, y0 + (rng() - 0.5) * 10);
    c.lineWidth = 16 + rng() * 10; c.strokeStyle = 'rgba(120,52,112,0.35)'; c.stroke();
    c.lineWidth = 5; c.strokeStyle = 'rgba(30,8,36,0.35)'; c.stroke();
  }
  // the floor behind the desk
  c.fillStyle = '#1A0820'; c.fillRect(0, 1180, W, H - 1180);
  BOSS_WALL = cv;
}
// the boss: the left side of his brain as a character (time-flies' brain, with a tie on its stem). x, y = its middle,
// s = size (its lumps span about 430 x 360 units). o: {mood 'calm' | 'grin' | 'squint' | 'worried' | 'wow' | 'shrug' |
// 'think' | 'sad', look [x, y], armL / armR (hand targets in its own units), lean, bob, tie, sweat}
function bossBrain(c, x, y, s, t, o = {}) {
  const mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.still ? 0 : 5 * Math.sin(t * 2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  const arm = (sd, target) => {
    const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
    const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
    c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#E0688E'; c.stroke();
    circle(c, tx, ty, 21, '#FFA9C0'); circle(c, tx + sd * 12, ty - 14, 9, '#FFA9C0');
  };
  if (!o.noArms) { arm(-1, o.armL); arm(1, o.armR); }
  rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();                      // the stem
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  c.fillStyle = '#FF93B0'; c.fill();
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(176,60,104,0.55)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    // the face
    const lx = look[0] * 9, ly = look[1] * 7, shut = o.shut || 0;
    const ry = mood === 'squint' ? 13 : mood === 'worried' || mood === 'wow' ? 34 : mood === 'grin' ? 24 : mood === 'sad' ? 25 : 28;
    for (const ex of [-44, 38]) {
      if ((o.mask || 0) > 0.5) continue;
      if (shut > 0.6) { c.beginPath(); c.moveTo(ex - 22, 2); c.quadraticCurveTo(ex, 18, ex + 22, 2); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke(); continue; }
      ellipse(c, ex, 4, 25, ry * (1 - 0.5 * shut), '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry * (1 - 0.5 * shut), 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' || mood === 'wow' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    }
    const bt = mood === 'worried' || mood === 'sad' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' || mood === 'wow' ? -46 : mood === 'squint' ? -24 : -38;
    if ((o.mask || 0) <= 0.5) { line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748'); }
    if (mood === 'worried' || mood === 'wow') ellipse(c, -2, 64, mood === 'wow' ? 19 : 15, mood === 'wow' ? 17 : 12, '#5A1522');
    else if (mood === 'grin' || mood === 'shrug') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 84, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'sad') { c.beginPath(); c.moveTo(-18, 68); c.quadraticCurveTo(0, 54, 18, 68); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
  });
  // the boss's tie, on its stem
  if ((o.tie === undefined ? 1 : o.tie) > 0.01) {
    c.beginPath(); c.moveTo(4, 118); c.lineTo(30, 118); c.lineTo(34, 132); c.lineTo(17, 214); c.lineTo(0, 132); c.closePath(); c.fillStyle = '#E2384C'; c.fill();
    paint(() => { for (let i = 0; i < 3; i++) line(c, 6, 146 + i * 22, 28, 136 + i * 22, 4, 'rgba(255,214,90,0.75)'); });
  }
  if (o.sweat > 0.02) sweatDrop(c, 150, -110, 1.3, clamp(o.sweat));
  c.restore();
}

// a noodle arm from a shoulder to a hand (screen points), with a round hand
function bossArm(c, S, Hd, bend, w = 34) {
  const mx = (S[0] + Hd[0]) / 2 + bend[0], my = (S[1] + Hd[1]) / 2 + bend[1];
  actor(() => {
    c.beginPath(); c.moveTo(S[0], S[1]); c.quadraticCurveTo(mx, my, Hd[0], Hd[1]);
    c.lineWidth = w; c.lineCap = 'round'; c.strokeStyle = '#F29A3A'; c.stroke();
    circle(c, Hd[0], Hd[1], w * 0.85, '#FFB347');
  });
}
// a wheel: rim, spokes, hub, a crank knob; ang = how far it has turned (radians, + = clockwise on screen)
function bossWheel(c, x, y, R, ang, col, o = {}) {
  c.save(); c.translate(x, y);
  // the stand
  rrect(c, -16, 0, 32, R + 70, 10); c.fillStyle = '#2C2036'; c.fill();
  c.save(); c.rotate(ang);
  c.beginPath(); c.arc(0, 0, R, 0, 7); c.lineWidth = 26; c.strokeStyle = '#1E1628'; c.stroke();
  c.beginPath(); c.arc(0, 0, R, 0, 7); c.lineWidth = 16; c.strokeStyle = col; c.stroke();
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; line(c, Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * (R - 8), Math.sin(a) * (R - 8), 14, '#3A2C48'); }
  // the crank knob on the rim
  circle(c, R * 0.78, 0, 20, '#F4F0E6');
  c.restore();
  circle(c, 0, 0, 40, '#2C2036');
  circle(c, 0, 0, 26, col);
  c.restore();
  if (o.glow > 0.01) softDot(gctx, x, y, R * 1.4, col, 0.25 * o.glow);
}
// the belt round both hubs (radius r), its marks moving with the belt (pos = how far it has run, px)
function bossBelt(c, A, B, r, pos) {
  c.save();
  c.beginPath(); c.arc(A[0], A[1], r, Math.PI / 2, Math.PI * 1.5); c.lineTo(B[0], B[1] - r); c.arc(B[0], B[1], r, -Math.PI / 2, Math.PI / 2); c.closePath();
  c.lineWidth = 24; c.strokeStyle = '#120C18'; c.stroke();
  c.lineWidth = 15; c.strokeStyle = '#D8D2E6'; c.stroke();
  paint(() => { c.setLineDash([18, 20]); c.lineDashOffset = -pos; c.lineWidth = 7; c.strokeStyle = '#5A4F70'; c.stroke(); c.setLineDash([]); });
  c.restore();
}
// a curved arrow round a wheel (dir +1 clockwise), k = pop
function wheelArrow(x, y, R, a0, dir, col, k) {
  if (k <= 0.01) return;
  const s = E.outBack(clamp(k), 1.8);
  screenSpace();
  const span = 1.5, a1 = a0 + dir * span * s;
  for (const [cc, w, cl] of [[ctx, 26, '#0B0B1A'], [ctx, 15, col], [gctx, 30, rgba(col, 0.45)]]) {
    cc.save(); if (cc === gctx) cc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    cc.beginPath(); cc.arc(x, y, R, Math.min(a0, a1), Math.max(a0, a1)); cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = cl; cc.stroke();
    const hx = x + Math.cos(a1) * R, hy = y + Math.sin(a1) * R, tx = -Math.sin(a1) * dir, ty = Math.cos(a1) * dir, sz = (w === 15 ? 30 : w === 26 ? 40 : 46);
    cc.beginPath(); cc.moveTo(hx + tx * sz * 0.8, hy + ty * sz * 0.8); cc.lineTo(hx - ty * sz * 0.6, hy + tx * sz * 0.6); cc.lineTo(hx + ty * sz * 0.6, hy - tx * sz * 0.6); cc.closePath();
    cc.fillStyle = cl; cc.fill(); cc.restore();
  }
}
// the wall monitor: his foot, live (screen x, y = its middle); ph = the foot's angle, dir = which way, col = its ring
function bossMonitor(x, y, t, ph, dir, col, k = 1) {
  if (k <= 0.01) return;
  screenSpace();
  const s = E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -150, -112, 300, 224, 18); ctx.fillStyle = '#14101C'; ctx.fill();
  rrect(ctx, -136, -98, 272, 196, 10); ctx.fillStyle = '#0C1A34'; ctx.fill();
  paint(() => {
    ctx.font = '900 22px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    circle(ctx, -116, -78, 7, '#FF4D5E'); ctx.fillStyle = '#FFFFFF'; ctx.fillText('LIVE: YOUR FOOT', -104, -77);
  });
  // the foot, small, with its ring
  fsShoe(ctx, 2 + 16 * Math.cos(ph), 18 + 13 * Math.sin(ph), 1.05, 0.15 * Math.cos(ph), FSPAL, {});
  ctx.restore();
  // its ring in screen space
  const Rr = 70 * s, n = 22;
  for (let i = 1; i <= n; i++) {
    const a0 = ph - dir * 4.2 * (1 - (i - 1) / n), a1 = ph - dir * 4.2 * (1 - i / n), al = 0.15 + 0.85 * i / n;
    line(ctx, x + Math.cos(a0) * Rr, y + 20 * s + Math.sin(a0) * Rr * 0.8, x + Math.cos(a1) * Rr, y + 20 * s + Math.sin(a1) * Rr * 0.8, 7, rgba(col, al));
  }
  softDot(gctx, x, y, 200 * s, '#3A6CFF', 0.18);
}
