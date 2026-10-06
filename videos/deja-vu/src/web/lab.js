// The lab (a wall screen with a corridor that forks, a headset, a coin) and the fortune teller's table (a curtain with
// stars, a round table, a crystal ball that can show anything, a turban).
'use strict';

let LAB_STARS = null;
function initLab() {
  const rng = mulberry32(47);
  LAB_STARS = [...Array(34)].map(() => [rng() * 1500 - 210, 250 + rng() * 1050, 0.5 + rng(), rng() * 6]);
}

// ---------------------------------------------------------------- the lab (world coords under the camera)
function labRoom(t) {
  const g = ctx.createLinearGradient(0, 300, 0, 1560);
  g.addColorStop(0, '#0A1432'); g.addColorStop(1, '#13264E');
  ctx.fillStyle = g; ctx.fillRect(-600, -500, 2280, 2080);
  for (let x = -560; x < 1700; x += 180) line(ctx, x, -500, x, 1560, 4, 'rgba(127,233,255,0.045)');
  for (let i = 0; i < 3; i++) {                       // ceiling lights
    const x = 180 + i * 360;
    rrect(ctx, x - 90, 372, 180, 16, 8); ctx.fillStyle = '#CFE8FF'; ctx.fill(); softDot(gctx, x, 380, 190, '#8FC8FF', 0.4);
  }
  for (const [rx, ph] of [[-70, 0], [960, 2]]) {             // racks of machines at the sides, lights blinking
    rrect(ctx, rx, 880, 190, 690, 10); ctx.fillStyle = '#0A1226'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#22386A'; ctx.stroke();
    for (let j = 0; j < 7; j++) {
      rrect(ctx, rx + 16, 904 + j * 94, 158, 70, 6); ctx.fillStyle = '#101C3A'; ctx.fill();
      for (let i = 0; i < 4; i++) {
        const on = Math.sin(t * (3 + ((i + j) % 4)) + i * 1.7 + j * 2.3 + ph) > 0.1, col = ['#4DFFB4', '#7FE9FF', '#FFD447', '#4DFFB4'][(i + j) % 4];
        circle(ctx, rx + 40 + i * 34, 938 + j * 94, 7, on ? col : '#1C2A4E'); if (on) softDot(gctx, rx + 40 + i * 34, 938 + j * 94, 20, col, 0.5);
      }
    }
  }
  const f = ctx.createLinearGradient(0, 1560, 0, 1920);
  f.addColorStop(0, '#0C1836'); f.addColorStop(1, '#04060F');
  ctx.fillStyle = f; ctx.fillRect(-600, 1560, 2280, 700);
  for (let j = -12; j <= 12; j++) line(ctx, 540 + j * 76, 1560, 540 + j * 190, 1920, 3, 'rgba(127,233,255,0.10)');
  for (const y of [1560, 1610, 1690, 1810]) line(ctx, -600, y, 1680, y, 3, 'rgba(127,233,255,0.10)');
}
// the wall screen: a corridor seen from inside, forking left and right at its end.
// o: {pick: 0..1 his arrow (left) lit, result: 0..1 the answer comes up (it was right), walk: 0..1 the view walks on}
function labScreen(x, y, w, h, t, o = {}) {
  rrect(ctx, x - 22, y - 22, w + 44, h + 44, 26); ctx.fillStyle = '#05080F'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2C4A7A'; ctx.stroke();
  ctx.save(); rrect(ctx, x, y, w, h, 12); ctx.clip();
  ctx.fillStyle = '#0B1E2E'; ctx.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h * 0.48, wk = (o.walk || 0);
  const far = 0.26 + 0.12 * wk, fw = w * far, fh = h * far;
  // floor, ceiling, walls
  const quad = (pts, col) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  quad([[x, y + h], [x + w, y + h], [cx + fw / 2, cy + fh / 2], [cx - fw / 2, cy + fh / 2]], '#15384A');
  quad([[x, y], [x + w, y], [cx + fw / 2, cy - fh / 2], [cx - fw / 2, cy - fh / 2]], '#0E2634');
  quad([[x, y], [cx - fw / 2, cy - fh / 2], [cx - fw / 2, cy + fh / 2], [x, y + h]], '#1B4A60');
  quad([[x + w, y], [cx + fw / 2, cy - fh / 2], [cx + fw / 2, cy + fh / 2], [x + w, y + h]], '#184256');
  quad([[cx - fw / 2, cy - fh / 2], [cx + fw / 2, cy - fh / 2], [cx + fw / 2, cy + fh / 2], [cx - fw / 2, cy + fh / 2]], '#24627C');
  for (let i = 1; i < 6; i++) {                       // floor lines sliding toward us
    const u = Math.pow(((i + (t * 0.5) % 1) / 6), 2.2), yy = lerp(cy + fh / 2, y + h, u), xx = lerp(fw / 2, w / 2, u);
    line(ctx, cx - xx, yy, cx + xx, yy, 3, 'rgba(127,233,255,0.22)');
  }
  // the two ways out, at the end
  const res = o.result || 0;
  for (const sd of [-1, 1]) {
    const dx = cx + sd * fw * 0.3, good = sd > 0;
    rrect(ctx, dx - fw * 0.15, cy - fh * 0.3, fw * 0.3, fh * 0.8, 6);
    ctx.fillStyle = good ? mixHex('#06121C', '#19A974', res) : mixHex('#06121C', '#5A1020', res); ctx.fill();
    if (res > 0.3 && good) softDot(gctx, dx, cy, fw * 0.6, '#4DFFB4', 0.5 * res);
  }
  ctx.restore();
  // the arrows, big, over the picture
  const pu = 0.5 + 0.5 * Math.sin(t * 6);
  for (const sd of [-1, 1]) {
    const ax = cx + sd * w * 0.29, ay = y + h * 0.5, mine = sd < 0, right = sd > 0;
    let col = '#7FE9FF', sc = 1 + 0.06 * pu, al = 0.85;
    if (mine) { col = mixHex('#7FE9FF', '#FFD447', clamp(o.pick || 0)); sc = 1 + 0.06 * pu + 0.3 * clamp(o.pick || 0) * (1 - res); al = 1 - 0.45 * res; }
    if (right && res > 0) { col = mixHex('#7FE9FF', '#4DFFB4', res); sc = 1 + 0.35 * res; }
    ctx.save(); ctx.translate(ax, ay); ctx.scale(sd * sc, sc); ctx.globalAlpha = al;
    ctx.beginPath(); ctx.moveTo(-70, -34); ctx.lineTo(10, -34); ctx.lineTo(10, -78); ctx.lineTo(96, 0); ctx.lineTo(10, 78); ctx.lineTo(10, 34); ctx.lineTo(-70, 34); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.strokeStyle = '#06121C'; ctx.stroke();
    ctx.restore();
    if (mine && res > 0.02) {                          // ... and his was the wrong one
      ctx.save(); ctx.translate(ax, ay); ctx.scale(lerp(2, 1, E.outCubic(clamp(res))), lerp(2, 1, E.outCubic(clamp(res)))); ctx.globalAlpha = clamp(res * 3);
      ctx.lineCap = 'round'; ctx.lineWidth = 30; ctx.strokeStyle = '#FF3A4A'; ctx.beginPath(); ctx.moveTo(-84, -84); ctx.lineTo(84, 84); ctx.moveTo(84, -84); ctx.lineTo(-84, 84); ctx.stroke();
      ctx.restore();
    }
  }
  gctx.save(); rrect(gctx, x, y, w, h, 12); gctx.fillStyle = 'rgba(80,180,220,0.14)'; gctx.fill(); gctx.restore();
}
// the headset, on the rig's head (call from charLayer's post: lctx is under the camera)
function labHeadset(c, r, st, tilt = 0) {
  c.save(); c.translate(st.x + (r.head[0] + (st.headDX || 0)) * st.s, st.y + (r.head[1] + (st.headDY || 0)) * st.s); c.scale(st.s, st.s); c.rotate((st.headRot || 0) + tilt);
  rrect(c, -78, -40, 156, 34, 14); c.fillStyle = '#20263F'; c.fill();                 // the strap
  rrect(c, -72, -34, 144, 66, 22); const g = c.createLinearGradient(0, -34, 0, 32); g.addColorStop(0, '#39445E'); g.addColorStop(1, '#141A2C'); c.fillStyle = g; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#0A0E1A'; c.stroke();
  rrect(c, -56, -14, 112, 20, 10); c.fillStyle = '#7FE9FF'; c.fill();
  line(c, -46, -24, -10, -24, 5, 'rgba(255,255,255,0.35)');
  c.restore();
}
// a big coin. ang = spin (radians); it shows a tick on one face and a cross on the other, or `label` when it has landed
function labCoin(x, y, r, ang, label) {
  const sx = Math.cos(ang), face = sx >= 0;
  for (const [c, sc] of [[ctx, 1], [gctx, 1]]) {
    c.save(); c.translate(x, y); c.scale(Math.max(0.06, Math.abs(sx)), 1);
    if (c === gctx) { c.beginPath(); c.arc(0, 0, r * 1.1, 0, 7); c.fillStyle = 'rgba(255,212,71,0.35)'; c.fill(); c.restore(); continue; }
    c.beginPath(); c.arc(0, 0, r, 0, 7);
    const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#FFF2B0'); g.addColorStop(0.55, '#F5C542'); g.addColorStop(1, '#B8801A');
    c.fillStyle = g; c.fill(); c.lineWidth = r * 0.09; c.strokeStyle = '#7A5200'; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.8, 0, 7); c.lineWidth = r * 0.04; c.strokeStyle = 'rgba(122,82,0,0.55)'; c.stroke();
    if (label) {
      c.font = `400 ${r * 0.62}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5A3A00'; c.fillText(label, 0, r * 0.05);
    } else {
      c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = r * 0.17; c.strokeStyle = face ? '#12805A' : '#C22A3E'; c.beginPath();
      if (face) { c.moveTo(-r * 0.38, 0); c.lineTo(-r * 0.1, r * 0.3); c.lineTo(r * 0.42, -r * 0.32); } else { c.moveTo(-r * 0.32, -r * 0.32); c.lineTo(r * 0.32, r * 0.32); c.moveTo(r * 0.32, -r * 0.32); c.lineTo(-r * 0.32, r * 0.32); }
      c.stroke();
    }
    c.restore();
  }
}

// ---------------------------------------------------------------- the fortune teller's table (world coords under the camera)
const FT = { ball: [540, 1102], R: 150, tableY: 1262 };
function fortuneBack(t) {
  const g = ctx.createLinearGradient(0, 200, 0, 1500);
  g.addColorStop(0, '#2A0E4E'); g.addColorStop(1, '#4A1A6E');
  ctx.fillStyle = g; ctx.fillRect(-900, -900, 2880, 3700);
  for (let x = -860; x < 1960; x += 120) {            // the curtain's folds
    const fg = ctx.createLinearGradient(x, 0, x + 120, 0);
    fg.addColorStop(0, 'rgba(0,0,20,0.34)'); fg.addColorStop(0.5, 'rgba(255,160,255,0.07)'); fg.addColorStop(1, 'rgba(0,0,20,0.34)');
    ctx.fillStyle = fg; ctx.fillRect(x, -900, 120, 2400);
  }
  for (const [x, y, s, ph] of LAB_STARS) {
    const tw = 0.5 + 0.5 * Math.sin(t * 2.2 + ph), r = 9 * s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ph); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r * 0.4 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = `rgba(255,212,71,${0.35 + 0.5 * tw})`; ctx.fill(); ctx.restore();
    softDot(gctx, x, y, 26 * s, '#FFD447', 0.25 * tw);
  }
}
function fortuneTable(t) {
  const y = FT.tableY;
  ctx.beginPath(); ctx.moveTo(140, y); ctx.lineTo(60, 2900); ctx.lineTo(1020, 2900); ctx.lineTo(940, y); ctx.closePath();
  const g = ctx.createLinearGradient(0, y, 0, y + 700); g.addColorStop(0, '#7A1E4E'); g.addColorStop(1, '#2A0A26'); ctx.fillStyle = g; ctx.fill();
  for (let x = 170; x < 930; x += 76) line(ctx, x, y + 30, x - (540 - x) * 0.12, y + 700, 5, 'rgba(0,0,20,0.22)');
  ellipse(ctx, 540, y, 404, 76, '#5A1238'); ellipse(ctx, 540, y - 10, 400, 72, '#A12A66');
  ctx.beginPath(); ctx.ellipse(540, y - 10, 360, 60, 0, 0, 7); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,212,71,0.5)'; ctx.stroke();
  for (let i = 0; i < 26; i++) { const a = Math.PI * (i / 25), fx = 540 + Math.cos(a) * 402, fy = y + Math.sin(a) * 74; line(ctx, fx, fy, fx, fy + 30, 5, '#FFD447'); circle(ctx, fx, fy + 34, 5, '#FFD447'); }
}
// the ball: its stand, then `inside(ctx clip is set)` draws what it shows, then the glass. k = how much glass is left (the dive fades it)
function fortuneBall(t, inside, k = 1, cam = null) {
  const [bx, by] = FT.ball, R = FT.R;
  ctx.beginPath(); ctx.moveTo(bx - 96, by + R + 52); ctx.quadraticCurveTo(bx, by + R - 40, bx + 96, by + R + 52); ctx.lineTo(bx + 112, by + R + 74); ctx.lineTo(bx - 112, by + R + 74); ctx.closePath();
  const sg = ctx.createLinearGradient(bx - 110, 0, bx + 110, 0); sg.addColorStop(0, '#FFE9A0'); sg.addColorStop(0.5, '#E9B13A'); sg.addColorStop(1, '#8A5C0A'); ctx.fillStyle = sg; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#5A3A0C'; ctx.stroke();
  // the inside, clipped to the glass (in both layers)
  for (const c of [ctx, gctx]) { c.save(); c.beginPath(); c.arc(bx, by, R, 0, 7); c.clip(); }
  ctx.fillStyle = '#12082A'; ctx.fillRect(bx - R, by - R, 2 * R, 2 * R);
  inside();
  ctx.restore(); gctx.restore();
  if (cam) applyCam(cam);
  if (k > 0.01) {
    const gl = ctx.createRadialGradient(bx - R * 0.4, by - R * 0.45, R * 0.05, bx, by, R);
    gl.addColorStop(0, `rgba(255,255,255,${0.42 * k})`); gl.addColorStop(0.3, `rgba(200,170,255,${0.06 * k})`); gl.addColorStop(1, `rgba(120,90,220,${0.3 * k})`);
    ctx.beginPath(); ctx.arc(bx, by, R, 0, 7); ctx.fillStyle = gl; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = `rgba(220,200,255,${0.85 * k})`; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, R * 0.8, Math.PI * 1.1, Math.PI * 1.4); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(255,255,255,${0.6 * k})`; ctx.stroke();
    softDot(gctx, bx, by, R * 1.9, '#B48CFF', 0.26 * k);
  }
}
// mist in the ball (world coords, already clipped)
function ballMist(t, a = 1) {
  const [bx, by] = FT.ball, R = FT.R;
  for (let i = 0; i < 7; i++) {
    const an = t * (0.7 + 0.13 * i) + i * 1.7, rr = R * (0.2 + 0.45 * hash(i + 3));
    softDot(ctx, bx + Math.cos(an) * rr, by + Math.sin(an * 1.3) * rr * 0.8, R * 0.7, i % 2 ? '#4E9EE0' : '#9A4CE0', 0.3 * a);
  }
  softDot(gctx, bx, by, R * 1.1, '#9A6CFF', 0.14 * a);
}
// the turban, on the rig's head (charLayer post). slip = 0 on his brow ... 1 over his eyes
function turban(c, r, st, slip = 0, t = 0) {
  c.save(); c.translate(st.x + (r.head[0] + (st.headDX || 0)) * st.s, st.y + (r.head[1] + (st.headDY || 0)) * st.s); c.scale(st.s, st.s); c.rotate((st.headRot || 0) + 0.05 * slip);
  c.translate(0, 58 * slip);
  c.beginPath(); c.moveTo(-76, -22); c.bezierCurveTo(-96, -96, -40, -138, 0, -136); c.bezierCurveTo(40, -138, 96, -96, 76, -22); c.quadraticCurveTo(0, -46, -76, -22); c.closePath();
  const g = c.createLinearGradient(-80, 0, 80, 0); g.addColorStop(0, '#B48CFF'); g.addColorStop(0.5, '#7A4CE0'); g.addColorStop(1, '#3E1E96'); c.fillStyle = g; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#22104E'; c.stroke();
  c.lineWidth = 4; c.strokeStyle = 'rgba(34,16,78,0.55)';
  for (const [x0, y0, x1, y1, x2, y2] of [[-70, -40, -20, -90, 40, -128], [-40, -30, 10, -70, 70, -86], [-76, -70, -40, -116, -4, -130]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); }
  c.beginPath(); c.moveTo(4, -84); c.quadraticCurveTo(40, -190 - 6 * Math.sin(t * 5), 12, -214); c.quadraticCurveTo(-14, -170, -8, -84); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#9AA8B0'; c.stroke();
  circle(c, 0, -66, 19, '#FFD447'); circle(c, 0, -66, 12, '#FF5A6E'); circle(c, -4, -70, 4, '#FFFFFF');
  c.restore();
}
