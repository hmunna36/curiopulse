// Inside his head (dominant-eye, 16 Oct 2026): the brain's control room, in "room space" (a 1080x1920 frame) under a
// view V = {s, x, y} (povSet), so it can sit small in a round window on his forehead and then fill the frame.
// Borrowed from pins-needles' brainy.js (the brain at its desk), made ready for the light (actor / paint).
// - brRoom(t): the wall with a faint web of neurons; brDesk(y, t): the desk with blinking lamps.
// - brMonitor(x, y, w, h, t, o): a screen on the wall playing one eye's picture (povView), with a name plate:
//   o = {who: 'boss' | 'intern', shift, dim, shut (a roller shutter 0..1), lock (a green reticle 0..1), ghost, streak,
//   on (0..1 the screen wakes), pulse}.
// - brainGuy2(x, y, s, t, o): the brain with a face and two arms: o = {look: [x, y], mood: calm | worried | squint |
//   think | grin, armL / armR: hand targets relative to the brain, thumbR (a thumbs-up), lean, sweat}.
'use strict';

const BR_MON = { boss: [90, 470, 420, 500], intern: [570, 470, 420, 500] };   // x, y, w, h in room space

function brRoom(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#2B1440'); g.addColorStop(0.55, '#3E1F58'); g.addColorStop(1, '#0D0616');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
  const rng = mulberry32(9);
  const pts = [...Array(18)].map(() => [rng() * 1080, 120 + rng() * 1200]);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 300) line(ctx, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 2.5, `rgba(255,150,210,${0.10 + 0.05 * Math.sin(t * loopW(2) + i + j)})`);
  }
  pts.forEach((p, i) => { circle(ctx, p[0], p[1], 6, 'rgba(255,170,220,0.22)'); softDot(gctx, p[0], p[1], 34, '#FF86C8', 0.16 + 0.12 * Math.sin(t * loopW(3) + i * 1.7)); });
}
function brDesk(y, t) {
  const g = ctx.createLinearGradient(0, y, 0, y + 420);
  g.addColorStop(0, '#3A2550'); g.addColorStop(1, '#170D24');
  ctx.fillStyle = g; ctx.fillRect(-300, y, 1680, 1200);
  rrect(ctx, -40, y - 16, 1160, 34, 10); ctx.fillStyle = '#5A3B78'; ctx.fill();
  rrect(ctx, -40, y - 16, 1160, 10, 6); ctx.fillStyle = '#7C56A0'; ctx.fill();
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 92, on = Math.sin(t * loopW(2 + (i % 3)) + i * 1.9) > 0.2, col = ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(ctx, x, y + 78, 13, on ? col : '#2A1B3A'); if (on) softDot(gctx, x, y + 78, 40, col, 0.6);
  }
}

// a small gold crown (any context, centred on x, y)
function crownIcon(c, x, y, s, rot = -0.1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot);
  c.beginPath(); c.moveTo(-19, 2); c.lineTo(-22, -20); c.lineTo(-10, -10); c.lineTo(0, -26); c.lineTo(10, -10); c.lineTo(22, -20); c.lineTo(19, 2); c.closePath();
  c.fillStyle = '#FFC531'; c.fill();
  paint(() => {
    c.fillStyle = '#E39A12'; c.fillRect(-19, -4, 38, 6);
    circle(c, 0, -2, 3.2, '#FF3F6C'); circle(c, -11, -1, 2.2, '#3FD6FF'); circle(c, 11, -1, 2.2, '#3FD6FF');
    for (const [px, py] of [[-22, -20], [0, -26], [22, -20]]) circle(c, px, py, 2.8, '#FFF1B8');
  });
  c.restore();
}

function brMonitor(x, y, w, h, t, o = {}) {
  const c = ctx, on = o.on === undefined ? 1 : o.on;
  // the bracket on the wall and the case
  rrect(c, x + w / 2 - 22, y - 70, 44, 80, 8); c.fillStyle = '#1A1228'; c.fill();
  rrect(c, x - 18, y - 18, w + 36, h + 36, 26); c.fillStyle = '#211830'; c.fill();
  rrect(c, x - 18, y - 18, w + 36, 12, 6); c.fillStyle = '#3A2C52'; c.fill();
  // the screen: the eye's picture, framed on the moon and the finger
  const sx = x, sy = y, sw = w, sh = h;
  c.save(); rrect(c, sx, sy, sw, sh, 14); c.clip();
  const g0 = gctx.getTransform();
  gctx.save(); gctx.beginPath(); gctx.setTransform(g0); rrect(gctx, sx, sy, sw, sh, 14); gctx.clip();
  const m = c.getTransform();
  const s = sw / 620;                                   // pov x 250..870 across the screen
  const V = { s: s * m.a, x: m.e + (sx - 250 * s) * m.a, y: m.f + (sy - 600 * s) * m.a };
  povSet(V);
  POV_GLOW = 0.45;
  if (on > 0.01) povView(t, { shift: o.shift || 0, ghost: o.ghost || 0, streak: o.streak || 0, dim: o.dim || 0 });
  POV_GLOW = 1;
  c.setTransform(m); gctx.setTransform(g0);
  if (on < 1) { c.fillStyle = `rgba(8,10,20,${1 - on})`; c.fillRect(sx, sy, sw, sh); }
  // scan lines and a glass sheen
  for (let yy = 0; yy < sh; yy += 6) { c.fillStyle = 'rgba(0,0,10,0.12)'; c.fillRect(sx, sy + yy, sw, 2); }
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + sw * 0.3, sy); c.lineTo(sx + sw * 0.1, sy + sh); c.lineTo(sx, sy + sh); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fill();
  // the reticle: the brain aims with this one
  if ((o.lock || 0) > 0.01) {
    const k = clamp(o.lock), tx = o.shift ? POV_JUMP : 0, cx = sx + (540 + tx - 250) * s, cy = sy + (800 - 600) * s, r = lerp(170, 80, E.outCubic(k)) * s;
    paint(() => {
      c.lineWidth = 6; c.strokeStyle = `rgba(77,255,180,${k})`;
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) line(c, cx + dx * r * 0.6, cy + dy * r * 0.6, cx + dx * r * 1.35, cy + dy * r * 1.35, 6, `rgba(77,255,180,${k})`);
    });
    gctx.save(); gctx.beginPath(); gctx.arc(cx, cy, r, 0, 7); gctx.lineWidth = 8; gctx.strokeStyle = `rgba(77,255,180,${0.6 * k})`; gctx.stroke(); gctx.restore();
  }
  // the roller shutter: slats come down over the screen
  const shut = clamp(o.shut || 0);
  if (shut > 0.001) {
    const hh = sh * shut;
    c.fillStyle = '#6E7489'; c.fillRect(sx, sy, sw, hh);
    for (let yy = 0; yy < hh; yy += 26) { c.fillStyle = '#4D5266'; c.fillRect(sx, sy + yy + 18, sw, 5); }
    rrect(c, sx, sy + hh - 18, sw, 18, 4); c.fillStyle = '#9AA0B5'; c.fill();
    if (shut > 0.85) {   // CLOSED, on a sign that swings
      const k = clamp((shut - 0.85) / 0.15), sw2 = 0.12 * Math.sin((o.shutT || 0) * 9) * Math.exp(-3 * (o.shutT || 0));
      c.save(); c.translate(sx + sw / 2, sy + sh * 0.42); c.rotate(sw2); c.scale(k, k);
      line(c, -60, -60, 0, -100, 3, '#2A2A3A'); line(c, 60, -60, 0, -100, 3, '#2A2A3A');
      rrect(c, -130, -62, 260, 92, 12); c.fillStyle = '#FF4D5E'; c.fill();
      paint(() => { c.font = '400 64px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('CLOSED', 0, -14); });
      c.restore();
    }
  }
  c.restore(); gctx.restore();
  // the screen's light on the wall
  if (on > 0.01 && shut < 0.9) softDot(gctx, sx + sw / 2, sy + sh / 2, sw * 0.7, '#7FB8FF', 0.16 * on * (1 - (o.dim || 0) * 0.7));
  // the name plate
  const px = x + w / 2, py = y + h + 62;
  rrect(c, px - 140, py - 38, 280, 76, 38); c.fillStyle = 'rgba(8,10,28,0.95)'; c.fill();
  const col = o.who === 'boss' ? '#FFD447' : '#C8A8FF';
  paint(() => {
    c.lineWidth = 5; c.strokeStyle = col; c.stroke();
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
    c.fillText(o.who === 'boss' ? 'BOSS' : 'INTERN', px + 22, py + 2);
  });
  if (o.who === 'boss') crownIcon(c, px - 92, py + 4, 1.25);
  else {   // a little lanyard card
    rrect(c, px - 110, py - 22, 34, 44, 5); c.fillStyle = '#FFFFFF'; c.fill();
    paint(() => { c.fillStyle = '#2E5BFF'; c.fillRect(px - 110, py - 22, 34, 11); circle(c, px - 93, py + 4, 6, '#FFD7B8'); });
  }
  return { sx, sy, sw, sh, s, tip: (shift) => [sx + (540 + POV_JUMP * shift - 250) * s, sy + (806 - 600) * s] };
}

// the brain as a character (room space)
function brainGuy2(x, y, s, t, o = {}) {
  const c = ctx, mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = 5 * Math.sin(t * loopW(2.4)) + (o.bob || 0);
  c.save(); c.translate(x, y + bob); c.scale(s, s); c.rotate(o.lean || 0);
  actor(() => {
    const arm = (sd, target) => {
      const sx = sd * 138, sy = 30, tx = target ? target[0] : sd * 176, ty = target ? target[1] : 118;
      const mx = (sx + tx) / 2 + sd * 22, my = (sy + ty) / 2 + 30;
      c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(mx, my, tx, ty); c.lineWidth = 17; c.lineCap = 'round'; c.strokeStyle = '#B8486E'; c.stroke();
      c.lineWidth = 10; c.strokeStyle = '#F08AA8'; c.stroke();
      circle(c, tx, ty, 21, '#FFA9C0');
      if (sd > 0 && o.thumbR) { rrect(c, tx - 7, ty - 46, 15, 34, 7); c.fillStyle = '#FFA9C0'; c.fill(); }
      else circle(c, tx + sd * 12, ty - 14, 8, '#FFA9C0');
    };
    arm(-1, o.armL); arm(1, o.armR);
    rrect(c, -12, 96, 58, 74, 22); c.fillStyle = '#D9688A'; c.fill();
    const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
    c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
    c.fillStyle = '#FF93B0'; c.fill();
  });
  paint(() => {
    c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(160,52,96,0.6)';
    for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    }
    const lx = look[0] * 9, ly = look[1] * 7;
    const eye = (ex) => {
      const ry = mood === 'squint' ? 13 : mood === 'worried' ? 34 : mood === 'grin' ? 24 : 28;
      ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    };
    eye(-44); eye(38);
    const bt = mood === 'worried' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : 0, by = mood === 'worried' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried') ellipse(c, -2, 62, 15, 12, '#5A1522');
    else if (mood === 'grin') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 82, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    if (o.sweat > 0) sweatDrop(c, 118, -96, 1.5, o.sweat);
  });
  c.restore();
}
