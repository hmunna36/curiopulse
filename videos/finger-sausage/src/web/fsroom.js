// Inside his head (finger-sausage, 20 Oct 2026): the brain's control room, in "room space" (a 1080x1920 frame) under a
// view V (fsPovSet), so it can sit small in a round window on his forehead and then fill the frame. The wall, the desk
// and the brain are dominant-eye's brainroom.js (16 Oct 2026), ready for the light.
// - fsRoom(t): the wall with a faint web of neurons, and a rail the monitors hang from.
// - fsMonitor(x, y, w, h, t, o): a screen on the rail playing what one eye sees (fsPovView): o = {eye: 'L' | 'R' |
//   'both' (the two stacked: the double fingers and the sausage), d (how far the copies sit apart), on (0..1),
//   blurF (the fingers' blur), sausage (0..1 the outline), tint, tag (0..1 the name plate), flash}.
// - fsDesk(y, t, o): the desk with blinking lamps; o.drawer (0..1 open), o.pop (0..1 a sausage springing out),
//   o.slam (0..1 just shut: a shake) – the drawer is labelled DOUBLES and is stuffed with finger sausages.
// - fsSausage(c, x, y, len, r, rot, o): one finger sausage (a fingertip with a nail at each end), any context.
// - brainGuy2(x, y, s, t, o): the brain with a face and two arms (from dominant-eye; o.mood adds 'shh' (a finger at
//   its lips) and 'yum'), o.armL / o.armR: hand targets relative to the brain.
// - fsEyeIcon(x, y, s, open, col): an eye icon (1 open .. 0 shut), screen space; fsBurst(txt, x, y, s, k, rot, col).
'use strict';

const FS_MON = { L: [58, 470, 464, 560], R: [558, 470, 464, 560], both: [308, 470, 464, 560] };   // x, y, w, h (room space)

function fsRoom(t) {
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
  // the rail the two monitors hang from
  rrect(ctx, 20, 372, 1040, 26, 12); ctx.fillStyle = '#1A1228'; ctx.fill();
  rrect(ctx, 20, 372, 1040, 8, 4); ctx.fillStyle = '#4A3A66'; ctx.fill();
}

function fsDesk(y, t, o = {}) {
  const g = ctx.createLinearGradient(0, y, 0, y + 420);
  g.addColorStop(0, '#3A2550'); g.addColorStop(1, '#170D24');
  ctx.fillStyle = g; ctx.fillRect(-300, y, 1680, 1200);
  rrect(ctx, -40, y - 16, 1160, 34, 10); ctx.fillStyle = '#5A3B78'; ctx.fill();
  rrect(ctx, -40, y - 16, 1160, 10, 6); ctx.fillStyle = '#7C56A0'; ctx.fill();
  for (let i = 0; i < 9; i++) {
    if (i >= 3 && i <= 5) continue;   // the drawer sits in the middle
    const x = 150 + i * 92, on = Math.sin(t * loopW(2 + (i % 3)) + i * 1.9) > 0.2, col = ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(ctx, x, y + 78, 13, on ? col : '#2A1B3A'); if (on) softDot(gctx, x, y + 78, 40, col, 0.6);
  }
  if (o.showDrawer) fsDrawer(540, y + 120, t, o);
}
// the DOUBLES drawer in the desk front (room space): open 0..1 slides it toward us (it grows and drops a little)
function fsDrawer(x, y, t, o = {}) {
  const k = clamp(o.drawer || 0), sh = (o.slam || 0) > 0 ? shake(o.slam * 3, 9 * (1 - o.slam), 30, 4) : [0, 0];
  const w = 300 + 90 * k, h = 120 + 50 * k, dy = 70 * k;
  const X = x - w / 2 + sh[0], Y = y + dy + sh[1];
  if (k > 0.02) {
    // the open box: its inside, packed with sausages
    rrect(ctx, X + 10, Y - 120 * k, w - 20, 130 * k + 20, 14); ctx.fillStyle = '#1B1028'; ctx.fill();
    const rng = mulberry32(55);
    for (let i = 0; i < 9; i++) {
      const sx = X + 50 + (i % 5) * ((w - 100) / 4) + (rng() - 0.5) * 20, sy = Y - 96 * k + Math.floor(i / 5) * 46 * k + 20;
      fsSausage(ctx, sx, sy, 92 * (0.85 + 0.3 * rng()), 22, (rng() - 0.5) * 0.9, {});
    }
  }
  // the drawer front with its label and a knob
  rrect(ctx, X, Y, w, h, 16); ctx.fillStyle = '#4A3166'; ctx.fill();
  rrect(ctx, X, Y, w, 12, 6); ctx.fillStyle = '#6B4C8E'; ctx.fill();
  rrect(ctx, X + w / 2 - 110, Y + 22, 220, 54, 10); ctx.fillStyle = '#F4ECDA'; ctx.fill();
  paint(() => {
    ctx.font = '900 36px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A1B3A';
    ctx.fillText('DOUBLES', X + w / 2, Y + 50);
  });
  rrect(ctx, X + w / 2 - 40, Y + h - 38, 80, 20, 10); ctx.fillStyle = '#C9B6E6'; ctx.fill();
  // one sausage springing out of the open drawer
  const p = clamp(o.pop || 0);
  if (p > 0.01) {
    const u = E.outCubic(p), sx = X + w * 0.7 + 120 * u, sy = Y - 80 - 300 * Math.sin(Math.PI * Math.min(1, p * 1.1)) * (1 - 0.3 * u);
    fsSausage(ctx, sx, sy, 120, 28, -0.6 + 4 * u, { face: true });
  }
}
// one finger sausage (any context): a pink-brown stub with a fingertip and a nail at each end
function fsSausage(c, x, y, len, r, rot, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const L = len / 2;
  c.beginPath(); c.moveTo(-L, -r); c.lineTo(L, -r); c.arc(L, 0, r, -Math.PI / 2, Math.PI / 2); c.lineTo(-L, r); c.arc(-L, 0, r, Math.PI / 2, Math.PI * 1.5); c.closePath();
  c.fillStyle = FS_SKIN; c.fill();
  paint(() => {
    rrect(c, L - r * 0.9, -r * 0.72, r * 1.05, r * 1.0, r * 0.45); c.fillStyle = FS_NAIL; c.fill();
    rrect(c, -L - r * 0.15, -r * 0.72, r * 1.05, r * 1.0, r * 0.45); c.fillStyle = FS_NAIL; c.fill();
    for (const u of [-0.25, 0.25]) { c.beginPath(); c.moveTo(u * len, -r + 5); c.quadraticCurveTo(u * len + 6, 0, u * len, r - 5); c.lineWidth = Math.max(2, r * 0.14); c.strokeStyle = 'rgba(176,100,72,0.5)'; c.lineCap = 'round'; c.stroke(); }
    c.beginPath(); c.moveTo(-L, -r * 0.55); c.lineTo(L, -r * 0.55); c.lineWidth = Math.max(2, r * 0.18); c.strokeStyle = 'rgba(255,230,210,0.55)'; c.stroke();
    if (o.face) {
      circle(c, -r * 0.5, -r * 0.05, r * 0.16, '#2A1B14'); circle(c, r * 0.5, -r * 0.05, r * 0.16, '#2A1B14');
      c.beginPath(); c.arc(0, r * 0.18, r * 0.32, 0.15, Math.PI - 0.15); c.lineWidth = Math.max(2, r * 0.12); c.strokeStyle = '#5A1522'; c.stroke();
    }
  });
  c.restore();
}

// a monitor on the rail, playing one eye's picture (or both stacked)
function fsMonitor(x, y, w, h, t, o = {}) {
  const c = ctx, on = o.on === undefined ? 1 : o.on;
  rrect(c, x + w / 2 - 26, y - 90, 52, 100, 8); c.fillStyle = '#1A1228'; c.fill();   // the hanger on the rail
  rrect(c, x - 18, y - 18, w + 36, h + 36, 26); c.fillStyle = '#211830'; c.fill();
  rrect(c, x - 18, y - 18, w + 36, 12, 6); c.fillStyle = '#3A2C52'; c.fill();
  c.save(); rrect(c, x, y, w, h, 14); c.clip();
  const g0 = gctx.getTransform();
  gctx.save(); gctx.beginPath(); gctx.setTransform(g0); rrect(gctx, x, y, w, h, 14); gctx.clip();
  const m = c.getTransform();
  const s = w / 620;                                   // pov x 230..850 across the screen, the fingertips' line in the middle
  const V = { s: s * m.a, x: m.e + (x - 230 * s) * m.a, y: m.f + (y + h / 2 - FSP.tipY * s) * m.a };
  if (on > 0.01) {
    const eye = o.eye || 'both';
    fsPovView(t, V, {
      d: o.d === undefined ? FSP.d : o.d, one: eye === 'both' ? null : eye, blur: (o.blurF || 0) * V.s, tint: o.tint === undefined ? (eye === 'both' ? 0.85 : 0.5) : o.tint,
      sausage: o.sausage || 0, glowA: 0.45,
      clip: (cc) => { const mm = m; cc.beginPath(); const X0 = mm.e + x * mm.a, Y0 = mm.f + y * mm.a; rrect(cc, X0, Y0, w * mm.a, h * mm.a, 14 * mm.a); },
    });
  }
  c.setTransform(m); gctx.setTransform(g0);
  if (on < 1) { c.fillStyle = `rgba(8,10,20,${1 - on})`; c.fillRect(x, y, w, h); }
  for (let yy = 0; yy < h; yy += 6) { c.fillStyle = 'rgba(0,0,10,0.12)'; c.fillRect(x, y + yy, w, 2); }
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.3, y); c.lineTo(x + w * 0.1, y + h); c.lineTo(x, y + h); c.closePath(); c.fillStyle = 'rgba(255,255,255,0.05)'; c.fill();
  if ((o.flash || 0) > 0.01) { c.fillStyle = `rgba(255,255,255,${0.6 * o.flash})`; c.fillRect(x, y, w, h); }
  c.restore(); gctx.restore();
  if (on > 0.01) softDot(gctx, x + w / 2, y + h / 2, w * 0.7, o.eye === 'R' ? '#FFB27A' : o.eye === 'L' ? '#7FF0E6' : '#FFE08A', 0.14 * on);
  // the name plate with an eye icon: LEFT EYE (teal) / RIGHT EYE (orange) / BOTH
  const tg = o.tag === undefined ? 1 : clamp(o.tag);
  if (tg > 0.01) {
    const px = x + w / 2, py = y + h + 64, q = E.outBack(tg, 2);
    const col = o.eye === 'L' ? FS_TEAL : o.eye === 'R' ? FS_ORANGE : '#FFD447';
    const txt = o.eye === 'L' ? 'LEFT EYE' : o.eye === 'R' ? 'RIGHT EYE' : 'BOTH EYES';
    c.save(); c.translate(px, py); c.scale(q, q);
    rrect(c, -170, -38, 340, 76, 38); c.fillStyle = 'rgba(8,10,28,0.95)'; c.fill();
    paint(() => {
      c.lineWidth = 5; c.strokeStyle = col; c.stroke();
      c.font = '900 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
      c.fillText(txt, 26, 2);
    });
    c.restore();
    fsEyeIcon(px - 118 * q, py, 0.62 * q, 1, col, true);
  }
  return { x, y, w, h, s, V };
}

// an eye icon (open 1 .. shut 0); world = true draws it in the current transform
function fsEyeIcon(x, y, s, open, col = '#FFFFFF', world = false) {
  if (!world) screenSpace();
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(() => {
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(0, -42, 46, 0); c.quadraticCurveTo(0, 42, -46, 0); c.closePath();
    c.fillStyle = 'rgba(8,10,28,0.9)'; c.fill();
    if (open > 0.5) {
      const k = (open - 0.5) * 2;
      c.save(); c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -38 * k, 40, 0); c.quadraticCurveTo(0, 38 * k, -40, 0); c.closePath(); c.clip();
      c.fillStyle = '#FFFFFF'; c.fillRect(-46, -46, 92, 92);
      circle(c, 0, 0, 17, col === '#FFFFFF' ? '#2A6BFF' : col); circle(c, 0, 0, 8, '#0B0B1A'); circle(c, -5, -6, 4, '#FFFFFF');
      c.restore();
    } else {
      c.beginPath(); c.moveTo(-34, -2); c.quadraticCurveTo(0, 20, 34, -2); c.lineWidth = 7; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
      for (const lx of [-18, 0, 18]) line(c, lx, 8 + (lx === 0 ? 2 : 0), lx * 1.2, 22, 4, col);
    }
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(0, -42, 46, 0); c.quadraticCurveTo(0, 42, -46, 0); c.closePath();
    c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  });
  c.restore();
}
// a word in a jagged burst (screen space)
function fsBurst(txt, x, y, s, k, rot = -0.1, col = '#FFD447', size = 104) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 2.6);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * q, s * q);
  ctx.font = `400 ${size}px Anton`;
  const tw = ctx.measureText(txt).width;
  const pts = [], n = 18, rx = Math.max(150, tw * 0.62 + 40);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 0.66 : 1; pts.push([Math.cos(a) * rx * r, Math.sin(a) * 124 * r]); }
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.save(); ctx.scale(0.9, 0.9); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  paint(() => {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 4);
  });
  ctx.restore();
}

// the brain as a character (room space); from dominant-eye, with two more moods: 'shh' and 'yum'
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
      else if (sd < 0 && o.fingerL) { rrect(c, tx - 7, ty - 50, 14, 40, 7); c.fillStyle = '#FFA9C0'; c.fill(); }
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
      const ry = mood === 'squint' || mood === 'yum' ? 13 : mood === 'worried' ? 34 : mood === 'grin' || mood === 'shh' ? 24 : 28;
      ellipse(c, ex, 4, 25, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = '#7E2748'; c.beginPath(); c.ellipse(ex, 4, 25, ry, 0, 0, 7); c.stroke();
      circle(c, ex + lx, 4 + ly * (ry / 28), mood === 'worried' ? 8 : 10.5, '#231028'); circle(c, ex + lx - 3, 1 + ly * (ry / 28), 3.4, '#FFFFFF');
    };
    eye(-44); eye(38);
    const bt = mood === 'worried' ? 1 : mood === 'squint' ? -0.8 : mood === 'think' ? 0.5 : mood === 'shh' ? 0.7 : 0;
    const by = mood === 'worried' ? -46 : mood === 'squint' ? -24 : -38;
    line(c, -70, by + bt * 10, -24, by - bt * 8 + (mood === 'think' ? -10 : 0), 9, '#7E2748'); line(c, 16, by - bt * 8, 64, by + bt * 10, 9, '#7E2748');
    if (mood === 'worried') ellipse(c, -2, 62, 15, 12, '#5A1522');
    else if (mood === 'grin') { c.beginPath(); c.moveTo(-28, 54); c.quadraticCurveTo(-2, 82, 24, 54); c.closePath(); c.fillStyle = '#5A1522'; c.fill(); }
    else if (mood === 'yum') {   // a grin with the tongue out at one corner
      c.beginPath(); c.moveTo(-30, 52); c.quadraticCurveTo(-2, 84, 26, 52); c.closePath(); c.fillStyle = '#5A1522'; c.fill();
      ellipse(c, 16, 66, 13, 10, '#E0616C', 0.4);
    } else if (mood === 'shh') { ellipse(c, -2, 62, 9, 7, '#5A1522'); }
    else if (mood === 'squint' || mood === 'think') { c.beginPath(); c.moveTo(-18, 62); c.quadraticCurveTo(0, 54, 18, 64); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    else { c.beginPath(); c.moveTo(-16, 58); c.quadraticCurveTo(0, 68, 16, 58); c.lineWidth = 6; c.strokeStyle = '#5A1522'; c.stroke(); }
    if (o.sweat > 0) sweatDrop(c, 118, -96, 1.5, o.sweat);
  });
  c.restore();
}
