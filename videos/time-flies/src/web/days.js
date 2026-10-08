// Two kinds of day. A summer day at seven: he rides his first bike straight at us down a path, and everything that
// happens is a first. And a day at the office: the same desk, the same sandwich, the days flying past the window.
'use strict';

// ---------------------------------------------------------------- the summer day (screen space; the world streams past him)
const KIDPAL = Object.assign({}, PAL, { coat: '#FF6B4A', coatSh: '#D94A2C', coatHi: '#FFB199', coatDk: '#B03A20', pants: '#3F6FD8', pantsSh: '#2B4FA8', shoe: '#FFFFFF', shoeSh: '#C9D0E4', pj: true, shortSleeve: true });
const KID = { X: 540, Y: 1400, S: 0.95 };
KID.B = KID.S / 0.78;                 // the bike is drawn to his size
KID.BAR = KID.Y - 174 * KID.B;        // the handlebar's height on screen
function summerBack(t, speed = 1) {
  screenSpace();
  const sky = ctx.createLinearGradient(0, 300, 0, 1030);
  sky.addColorStop(0, '#2F9BEA'); sky.addColorStop(0.7, '#8FD6FF'); sky.addColorStop(1, '#D8F3FF');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 1040);
  // clouds drifting
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 310 + t * (10 + i * 3)) % 1400) - 160, cy = 800 + (i % 3) * 62, s = 0.8 + (i % 2) * 0.5;
    for (const [dx, dy, r] of [[0, 0, 46], [44, 10, 36], [-44, 12, 34], [14, -22, 34]]) circle(ctx, cx + dx * s, cy + dy * s, r * s, 'rgba(255,255,255,0.9)');
  }
  // far hills, then the meadow
  ctx.fillStyle = '#5FC470'; ctx.beginPath(); ctx.moveTo(0, 1040);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 990 - 46 * Math.sin(x * 0.0052 + 0.6) - 22 * Math.sin(x * 0.013 + 2)); ctx.lineTo(W, 1040); ctx.closePath(); ctx.fill();
  const gr = ctx.createLinearGradient(0, 1020, 0, H); gr.addColorStop(0, '#49B85C'); gr.addColorStop(1, '#2C8A44');
  ctx.fillStyle = gr; ctx.fillRect(0, 1020, W, H - 1020);
  // the path, coming toward us
  ctx.beginPath(); ctx.moveTo(505, 1020); ctx.lineTo(575, 1020); ctx.lineTo(1010, H); ctx.lineTo(70, H); ctx.closePath(); ctx.fillStyle = '#E3C58C'; ctx.fill();
  // things streaming past: pebbles on the path, flowers in the grass (z runs 0 at the horizon to 1 at our feet)
  paint(() => {
    for (let i = 0; i < 46; i++) {
      const z0 = (hash(i * 3.1) + t * 0.55 * speed) % 1, z = z0 * z0, y = 1020 + z * 900, side = hash(i * 7.7) * 2 - 1;
      const onPath = i % 3 === 0, half = lerp(35, 470, z), x = 540 + side * (onPath ? half * 0.86 : half + 30 + hash(i * 1.9) * 420 * (0.3 + z));
      if (x < -40 || x > W + 40) continue;
      if (onPath) ellipse(ctx, x, y, 3 + 13 * z, 1.5 + 6 * z, '#C9A568');
      else { const r = 3 + 12 * z, col = ['#FFFFFF', '#FFD447', '#FF86A6', '#FFFFFF'][i % 4]; line(ctx, x, y, x, y + r * 1.6, 1 + 2 * z, '#1F7A38'); circle(ctx, x, y, r, col); circle(ctx, x, y, r * 0.4, '#FF9A3C'); }
    }
  });
}
// the bike from the front, under him: wheel, fork, handlebar (tilt = how far he wobbles)
function kidBike(x, y, s, tilt, t) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  ellipse(c, 0, -40, 25, 96, '#2A2140'); ellipse(c, 0, -40, 11, 80, '#5E6680');
  paint(() => { for (let i = 0; i < 4; i++) { const a = t * 9 + i * 1.57, yy = -40 + Math.sin(a) * 80; if (Math.cos(a) > 0) line(c, -9, yy, 9, yy, 4, '#C9D0E4'); } });
  line(c, -22, -130, -22, -50, 11, '#FF5A6E'); line(c, 22, -130, 22, -50, 11, '#FF5A6E');
  rrect(c, -30, -150, 60, 34, 12); c.fillStyle = '#FF5A6E'; c.fill();
  line(c, 0, -150, 0, -196, 14, '#C9D0E4');
  line(c, -150, -206, 150, -206, 15, '#C9D0E4');
  line(c, -150, -206, -104, -206, 23, '#2A2140'); line(c, 104, -206, 150, -206, 23, '#2A2140');
  circle(c, 62, -226, 17, '#FFD447'); paint(() => circle(c, 58, -231, 5, '#FFFFFF'));
  c.restore();
}
// a bike helmet (head space)
function kidHelmet(c) {
  c.beginPath(); c.moveTo(-72, -22); c.quadraticCurveTo(-70, -104, 2, -104); c.quadraticCurveTo(74, -104, 72, -22); c.quadraticCurveTo(0, -42, -72, -22); c.closePath(); c.fillStyle = '#3FA7FF'; c.fill();
  paint(() => { for (const x of [-34, 0, 34]) { c.beginPath(); c.ellipse(x, -66, 8, 24, x * 0.012, 0, 7); c.fillStyle = '#1D6FC4'; c.fill(); } });
}
// the kid on his bike. o: {wob, face, frogK}
function kidRide(t, o = {}) {
  const wob = o.wob === undefined ? 1 : o.wob, sway = 0.055 * wob * Math.sin(t * 4.3), dx = 22 * wob * Math.sin(t * 4.3 - 0.5);
  let p = clone(POSES.stand);
  p.lean = sway; p.hipY = -214 + 5 * Math.abs(Math.sin(t * 9));
  const st = { x: KID.X + dx, y: KID.Y, s: KID.S, pose: p, face: o.face || FACES.grin, headRot: -sway * 1.6 + 0.03 * Math.sin(t * 7), headDY: 2 * Math.sin(t * 9) };
  const gx = 135, gy = (KID.BAR - KID.Y) / KID.S;                    // the grips, in his own units
  p = ikReach(p, 'L', [-gx + 0, gy + 4], 1); p = ikReach(p, 'R', [gx, gy + 4], 1);
  const ph = t * 9;
  p = ikPlant(p, 'L', [-44, -74 - 46 * Math.max(0, Math.sin(ph))], -1); p = ikPlant(p, 'R', [44, -74 - 46 * Math.max(0, -Math.sin(ph))], -1);
  p.feetFront = 1; st.pose = p;
  return { st, sway, dx };
}

// ---------------------------------------------------------------- the office (screen space): the monitor is the camera
const OFFPAL = Object.assign({}, PAL, { coat: '#DDE3F2', coatSh: '#AEB8D4', coatHi: '#FFFFFF', coatDk: '#8E9ABC', pj: true });
const OFFICE = { X: 540, Y: 1576, S: 1.35, DESK: 1240 };
// which day it is in the office: a new one at every cue in `flips` (Monday to Friday in the shot). f = how far through
// the day (0 = sunrise, 1 = the next page), since = seconds since the page came off
function officeDay(t) {
  const fl = cu().flips, s = shotOf('now');
  let i = 0;
  while (i < fl.length && t >= fl[i]) i++;
  const a = i === 0 ? s.start : fl[i - 1], b = i < fl.length ? fl[i] : s.end + 0.3;
  return { i, f: clamp((t - a) / (b - a)), since: i === 0 ? 9 : t - a };
}
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
function officeBack(lt, t) {
  screenSpace();
  const wall = ctx.createLinearGradient(0, 300, 0, 1300); wall.addColorStop(0, '#4C5A7C'); wall.addColorStop(1, '#343E5A');
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
  // the window: a day goes by every OFFICE.DAY seconds
  const u = officeDay(t).f * 0.999, wx = 664, wy = 476, ww = 316, wh = 330;
  const noon = Math.sin(Math.PI * clamp(u / 0.6)), night = u > 0.6 ? Math.sin(Math.PI * (u - 0.6) / 0.4) : 0;
  rrect(ctx, wx - 14, wy - 14, ww + 28, wh + 28, 14); ctx.fillStyle = '#1E2538'; ctx.fill();
  ctx.save(); rrect(ctx, wx, wy, ww, wh, 6); ctx.clip();
  ctx.fillStyle = mixHex(mixHex('#F2B46A', '#7FC8F8', noon), '#131B3A', night); ctx.fillRect(wx, wy, ww, wh);
  if (u <= 0.6) { const a = Math.PI * (u / 0.6), sx = wx + ww * (0.08 + 0.84 * (u / 0.6)), sy = wy + wh * (0.92 - 0.7 * Math.sin(a)); circle(ctx, sx, sy, 34, '#FFE9A6'); softDot(gctx, sx, sy, 90, '#FFD98A', 0.5); }
  else { const v = (u - 0.6) / 0.4, a = Math.PI * v, mx = wx + ww * (0.1 + 0.8 * v), my = wy + wh * (0.9 - 0.66 * Math.sin(a)); circle(ctx, mx, my, 26, '#E8EEFF'); circle(ctx, mx + 10, my - 6, 22, '#131B3A'); for (let i = 0; i < 9; i++) circle(ctx, wx + hash(i) * ww, wy + hash(i + 5) * wh * 0.7, 2.5, 'rgba(255,255,255,0.8)'); }
  // the block across the street
  ctx.fillStyle = mixHex('#55607E', '#0E1326', night); ctx.fillRect(wx, wy + wh * 0.66, ww, wh * 0.34); ctx.fillRect(wx + 40, wy + wh * 0.44, 90, wh * 0.3); ctx.fillRect(wx + 200, wy + wh * 0.52, 100, wh * 0.2);
  if (night > 0.3) for (let i = 0; i < 10; i++) { ctx.fillStyle = 'rgba(255,214,120,0.9)'; ctx.fillRect(wx + 52 + (i % 3) * 26, wy + wh * 0.5 + Math.floor(i / 3) * 30, 12, 14); }
  ctx.restore();
  ctx.fillStyle = '#1E2538'; ctx.fillRect(wx + ww / 2 - 6, wy, 12, wh); ctx.fillRect(wx, wy + wh / 2 - 6, ww, 12);
  // a strip light on the ceiling (above his head)
  rrect(ctx, 330, 330, 420, 22, 10); ctx.fillStyle = '#DCE6FF'; ctx.fill(); softDot(gctx, 540, 344, 150, '#BFD0FF', 0.2);
}
// the tear-off calendar on the wall: today's page, and yesterday's falling
function officeCalendar(lt, t, x = 232, y = 930, sc = 1.2) {
  const D = officeDay(t), i = D.i, f = clamp(D.since / 0.7);
  const page = (px, py, txt, rot, a) => {
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
    rrect(ctx, -86, -78, 172, 170, 10); ctx.fillStyle = '#F4F1EA'; ctx.fill();
    ctx.fillStyle = '#E0483C'; ctx.fillRect(-86, -78, 172, 42);
    ctx.font = '400 80px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A3248'; ctx.fillText(txt, 0, 36);
    ctx.restore();
  };
  screenSpace();
  paint(() => {
    page(x, y, DAYS[i % DAYS.length], 0, 1);
    if (i > 0 && f < 0.99) page(x - 30 * f - 60 * f * f, y + 60 * f + 620 * f * f, DAYS[(i - 1) % DAYS.length], -1.6 * f, clamp(1.6 - 1.8 * f));
  });
  rrect(ctx, x - 92 * sc, y - 92 * sc, 184 * sc, 22 * sc, 8); ctx.fillStyle = '#8A93AD'; ctx.fill();
}
// the desk in front of him, with what is on it. bite 0..1 = how much of the sandwich is gone
function officeDesk(t, o = {}) {
  screenSpace();
  const y = OFFICE.DESK;
  ctx.fillStyle = '#54433A'; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = '#7A6252'; ctx.fillRect(0, y, W, 24);
  // the keyboard
  rrect(ctx, 340, y + 40, 400, 76, 14); ctx.fillStyle = '#20263A'; ctx.fill();
  paint(() => { for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) { rrect(ctx, 356 + k * 31, y + 50 + r * 20, 25, 14, 4); ctx.fillStyle = '#3A435E'; ctx.fill(); } });
  // a mug
  rrect(ctx, 842, y - 62, 88, 100, 14); ctx.fillStyle = '#C8D0E6'; ctx.fill(); ctx.lineWidth = 13; ctx.strokeStyle = '#C8D0E6'; ctx.beginPath(); ctx.arc(936, y - 12, 25, -1.2, 1.2); ctx.stroke();
  // the plate (the sandwich is drawn by officeSandwich: on the plate, or in his hand)
  ellipse(ctx, 190, y + 74, 118, 30, '#DDE2EE');
}
function officeSandwich(c, x, y, s, bite = 0, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (bite > 0.02) {                                  // the bite: everything but three round holes at its corner
    c.beginPath(); c.rect(-200, -200, 400, 400);
    for (const [bx, by] of [[44, 4], [30, -14], [56, 16]]) { c.moveTo(bx + 17 * bite, by); c.arc(bx, by, 17 * bite, 0, 7); }
    c.clip('evenodd');
  }
  const shape = () => { c.beginPath(); c.moveTo(-58, 16); c.lineTo(58, 16); c.lineTo(0, -44); c.closePath(); };
  shape(); c.fillStyle = '#E9C98C'; c.fill();
  paint(() => {
    c.save(); shape(); c.clip();
    c.fillStyle = '#6DBE4A'; c.fillRect(-60, 2, 120, 7); c.fillStyle = '#F2D04A'; c.fillRect(-60, -5, 120, 7); c.fillStyle = '#E06A5A'; c.fillRect(-60, -12, 120, 7);
    c.restore();
    c.lineWidth = 6; c.strokeStyle = '#B98A48'; c.lineJoin = 'round'; shape(); c.stroke();
  });
  c.restore();
}
