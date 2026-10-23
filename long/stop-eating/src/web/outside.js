// What Happens If You Stop Eating? (long-form): the mountain outside. A slope of snow with the hut on the right (its
// window lit, smoke from the stovepipe), the peaks behind, by night in the blizzard or on the clear morning of day
// seven; the summit shop in the sun (where he bought the chocolate); the fox running off with his food bag (side
// view); the rescue helicopter. World coords = screen coords at zoom 1 (the hut's door is at x 1240, the snow line
// at y 820).
'use strict';

const MT = { snowY: 820, hutX: 1300, hutY: 820, doorX: 1215 };
let MT_NIGHT = null, MT_DAY = null;

function mtPaint(c, day) {
  const sky = c.createLinearGradient(0, -300, 0, MT.snowY);
  if (day) { sky.addColorStop(0, '#3E8EE8'); sky.addColorStop(1, '#BFE4FF'); }
  else { sky.addColorStop(0, '#0A1028'); sky.addColorStop(1, '#2A3A66'); }
  c.fillStyle = sky; c.fillRect(-600, -400, W + 1200, MT.snowY + 800);
  // far peaks, then nearer ridges
  const ridge = (seed, base, amp, col, step) => {
    const rng = mulberry32(seed);
    c.beginPath(); c.moveTo(-600, MT.snowY + 400);
    let y = base;
    for (let x = -600; x <= W + 600; x += step) { y = base - amp * (0.35 + 0.65 * rng()) * (Math.abs(((x / step) % 3) - 1)); c.lineTo(x, y); }
    c.lineTo(W + 600, MT.snowY + 400); c.closePath(); c.fillStyle = col; c.fill();
  };
  ridge(3, 420, 380, day ? '#9EC2E8' : '#26345A', 260);
  // snow caps on the far peaks
  ridge(7, 600, 300, day ? '#E8F4FF' : '#3A4A78', 200);
  ridge(11, 760, 160, day ? '#F4FAFF' : '#4A5C8E', 150);
  // the slope we stand on
  c.beginPath(); c.moveTo(-600, MT.snowY + 30); c.quadraticCurveTo(W / 2, MT.snowY - 40, W + 600, MT.snowY + 10); c.lineTo(W + 600, MT.snowY + 600); c.lineTo(-600, MT.snowY + 600); c.closePath();
  c.fillStyle = day ? '#FFFFFF' : '#8A9AC8'; c.fill();
  const rng = mulberry32(21);
  for (let i = 0; i < 60; i++) ellipse(c, -500 + rng() * (W + 1000), MT.snowY + 40 + rng() * 300, 30 + 60 * rng(), 6 + 6 * rng(), day ? 'rgba(160,200,240,0.35)' : 'rgba(40,50,100,0.35)');
  // pines on the left
  for (let i = 0; i < 9; i++) {
    const x = -300 + i * 95 + 40 * rng(), h = 160 + 120 * rng(), y = MT.snowY + 20 + 20 * rng();
    c.fillStyle = day ? '#2E6A5A' : '#1A2A3A';
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, y - h + k * h * 0.2); c.lineTo(x - (30 + 18 * k), y - h * 0.55 + k * h * 0.2); c.lineTo(x + (30 + 18 * k), y - h * 0.55 + k * h * 0.2); c.closePath(); c.fill(); }
    c.fillStyle = day ? '#FFFFFF' : '#9AAAD8';
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, y - h + k * h * 0.2); c.lineTo(x - (14 + 9 * k), y - h * 0.78 + k * h * 0.2); c.lineTo(x + (14 + 9 * k), y - h * 0.78 + k * h * 0.2); c.closePath(); c.fill(); }
  }
}
function initOutside() {
  for (const day of [false, true]) {
    const cv = mkCanvas(W + 1200, H + 800), c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 600, 400);
    mtPaint(c, day);
    if (day) MT_DAY = cv; else MT_NIGHT = cv;
  }
}
// the hut from outside: logs, a snowy roof, the lit window, the door (open 0..1), smoke
function mtHut(t, o = {}) {
  const c = ctx, x = MT.hutX, y = MT.hutY, day = o.day || 0;
  c.fillStyle = mixHex('#3A2416', '#6A4426', day); c.fillRect(x - 170, y - 230, 340, 230);
  for (let k = 0; k < 7; k++) line(c, x - 170, y - 230 + k * 33, x + 170, y - 230 + k * 33, 4, mixHex('#2A180C', '#4A2E1A', day));
  // the roof with snow
  c.beginPath(); c.moveTo(x - 210, y - 220); c.lineTo(x, y - 360); c.lineTo(x + 210, y - 220); c.closePath(); c.fillStyle = mixHex('#2A1A10', '#4A2E1A', day); c.fill();
  c.beginPath(); c.moveTo(x - 220, y - 214); c.lineTo(x, y - 372); c.lineTo(x + 220, y - 214); c.lineTo(x + 190, y - 204); c.quadraticCurveTo(x, y - 330, x - 190, y - 204); c.closePath(); c.fillStyle = mixHex('#C8D4F4', '#FFFFFF', day); c.fill();
  // the stovepipe and its smoke
  c.fillStyle = '#1A1A20'; c.fillRect(x + 80, y - 360, 26, 90);
  for (let i = 0; i < 5; i++) { const k = ((t * 0.3 + i / 5) % 1); softDot(c, x + 93 - 120 * k * (1 - day * 0.5), y - 370 - 160 * k, 16 + 30 * k, '#C8CCDC', 0.3 * (1 - k)); }
  // the window (lit) and the door
  const wl = o.lit === undefined ? 1 : o.lit;
  rrect(c, x + 40, y - 170, 90, 80, 6); c.fillStyle = '#2A1A10'; c.fill();
  rrect(c, x + 48, y - 162, 74, 64, 4); c.fillStyle = wl > 0.5 ? '#FFC060' : '#3A4A70'; c.fill();
  line(c, x + 85, y - 162, x + 85, y - 98, 5, '#2A1A10'); line(c, x + 48, y - 130, x + 122, y - 130, 5, '#2A1A10');
  if (wl > 0.5) { softDot(gctx, x + 85, y - 130, 160, '#FFB050', 0.7 * wl); }
  const dx = MT.doorX, op = o.door || 0;
  rrect(c, dx - 50, y - 180, 100, 180, 6); c.fillStyle = '#120A06'; c.fill();
  if (op > 0.01) { c.fillStyle = '#FFB050'; c.fillRect(dx - 44, y - 174, 88 * op, 174); softDot(gctx, dx, y - 90, 120, '#FFB050', 0.6 * op); }
  c.save(); c.translate(dx - 50, y - 180); c.scale(1 - 0.85 * op, 1);
  rrect(c, 0, 0, 100, 180, 6); c.fillStyle = mixHex('#5A3820', '#7A4E2C', day); c.fill();
  circle(c, 82, 96, 6, '#C8A060');
  c.restore();
  // snow drifts against the walls
  ellipse(c, x - 150, y + 6, 90, 22, mixHex('#9AAAD8', '#FFFFFF', day)); ellipse(c, x + 160, y + 4, 70, 18, mixHex('#9AAAD8', '#FFFFFF', day));
}
// the snow in the air (screen space): streaks driven by the wind; storm 0..1
function mtSnow(t, storm = 1) {
  if (storm <= 0.01) return;
  screenSpace();
  const gust = 0.75 + 0.25 * Math.sin(t * 0.8);
  for (let L = 0; L < 3; L++) {
    const n = Math.round((90 + 60 * L) * storm), sp = (380 + 300 * L) * gust, rng = mulberry32(700 + L);
    for (let i = 0; i < n; i++) {
      const x0 = rng() * (W + 600), y0 = rng() * (H + 300), v = 0.7 + 0.6 * rng();
      const x = -300 + ((x0 + t * sp * v) % (W + 600)), y = -150 + ((y0 + t * sp * 0.4 * v) % (H + 300));
      const len = (8 + 14 * L) * gust;
      line(ctx, x, y, x - len, y - len * 0.4, 1.6 + 1.6 * L, `rgba(240,246,255,${0.3 + 0.2 * L})`);
    }
  }
}
// the whole outside. o: {day 0..1, storm 0..1, hut: {...}, after(cam)}
function mtScene(cam, t, o = {}) {
  applyCam(cam);
  const day = clamp(o.day || 0);
  // a little parallax: the far plate moves less than the camera
  const px = (cam.x - W / 2) * 0.35, py = (cam.y - H / 2) * 0.2;
  if (day < 1) ctx.drawImage(MT_NIGHT, -600 + px, -400 + py);
  if (day > 0) { ctx.globalAlpha = day; ctx.drawImage(MT_DAY, -600 + px, -400 + py); ctx.globalAlpha = 1; }
  if (day > 0.01) { circle(ctx, 1600 + px, 160 + py, 50, `rgba(255,250,225,${day})`); softDot(gctx, 1600 + px, 160 + py, 300, '#FFF2C0', 0.6 * day); }
  if (o.hut !== false) mtHut(t, Object.assign({ day }, o.hut || {}));
  if (o.after) { o.after(cam); applyCam(cam); }
  mtSnow(t, o.storm === undefined ? 1 - day : o.storm);
  applyCam(cam);
}

// the fox running, side view, facing right (dir 1) or left (-1); (x, y) = between its feet on the snow; o.bag 0..1
function foxRun(c, x, y, s, t, o = {}) {
  const dir = o.dir || 1, ph = t * (o.speed || 14);
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  const OR = '#E8732C', ORD = '#B8501A', WH = '#FFF4E8', DK = '#2A1A14';
  const bob = 6 * Math.abs(Math.sin(ph));
  // the tail: a big brush with a white tip
  c.save(); c.translate(-70, -70 - bob); c.rotate(-0.3 + 0.15 * Math.sin(ph));
  c.beginPath(); c.ellipse(-60, 0, 70, 24, 0.1, 0, 7); c.fillStyle = OR; c.fill();
  c.beginPath(); c.ellipse(-112, -4, 22, 16, 0.1, 0, 7); c.fillStyle = WH; c.fill();
  c.restore();
  // legs (four, scissoring)
  for (const [lx, off] of [[-50, 0], [-30, Math.PI], [40, Math.PI / 2], [60, Math.PI * 1.5]]) {
    const a = 0.6 * Math.sin(ph + off);
    c.save(); c.translate(lx, -50 - bob); c.rotate(a);
    line(c, 0, 0, 0, 46, 11, ORD); line(c, 0, 40, 8, 50, 10, DK);
    c.restore();
  }
  // body and head
  ellipse(c, 0, -70 - bob, 82, 34, OR);
  ellipse(c, 10, -56 - bob, 60, 18, WH);
  c.save(); c.translate(86, -96 - bob);
  ellipse(c, 0, 0, 34, 28, OR);
  c.beginPath(); c.moveTo(18, -6); c.lineTo(66, 8); c.lineTo(18, 18); c.closePath(); c.fillStyle = OR; c.fill();
  c.beginPath(); c.moveTo(20, 8); c.lineTo(66, 9); c.lineTo(20, 20); c.closePath(); c.fillStyle = WH; c.fill();
  circle(c, 64, 8, 6, DK);
  for (const ex of [-14, 6]) { c.beginPath(); c.moveTo(ex - 10, -18); c.lineTo(ex, -54); c.lineTo(ex + 10, -18); c.closePath(); c.fillStyle = OR; c.fill(); c.beginPath(); c.moveTo(ex - 5, -40); c.lineTo(ex, -54); c.lineTo(ex + 5, -40); c.closePath(); c.fillStyle = DK; c.fill(); }
  ellipse(c, 14, -6, 7, 5, DK); circle(c, 16, -8, 2, '#FFFFFF');
  if ((o.bag || 0) > 0.02) {   // the food bag, hanging from its jaws
    line(c, 46, 16, 50, 44, 5, '#3A3A2A');
    c.save(); c.translate(50, 44); c.rotate(-0.4 * Math.sin(ph) * dir);
    c.beginPath(); c.moveTo(-20, 0); c.quadraticCurveTo(-34, 50, 0, 64); c.quadraticCurveTo(34, 50, 20, 0); c.closePath(); c.fillStyle = '#3E8A4A'; c.fill();
    c.font = '900 16px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#FFFFFF'; c.fillText('FOOD', 0, 40);
    c.restore();
  }
  c.restore();
  c.restore();
}

// the rescue helicopter, side view facing left; (x, y) its body's middle; rotor spins; o.light (a spotlight down)
function heli(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.04 + 0.02 * Math.sin(t * 1.5));
  const R = '#E8343E', RD = '#B8202A';
  line(c, 60, -10, 330, -30, 26, R); line(c, 300, -30, 360, -40, 18, RD);
  // tail rotor (a blur disc)
  c.beginPath(); c.ellipse(360, -44, 12, 46, 0, 0, 7); c.fillStyle = 'rgba(220,220,230,0.35)'; c.fill();
  // body
  c.beginPath(); c.moveTo(-150, 10); c.quadraticCurveTo(-170, -70, -60, -84); c.lineTo(80, -84); c.quadraticCurveTo(140, -60, 120, 20); c.quadraticCurveTo(0, 50, -150, 10); c.closePath();
  c.fillStyle = R; c.fill();
  c.beginPath(); c.moveTo(-148, 0); c.quadraticCurveTo(-160, -62, -70, -70); c.lineTo(-40, -70); c.lineTo(-40, -6); c.closePath(); c.fillStyle = '#9AD8FF'; c.fill();
  c.font = '400 40px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('RESCUE', 30, -32);
  // skids
  line(c, -110, 60, 100, 60, 8, '#2A2A34'); line(c, -70, 30, -80, 60, 6, '#2A2A34'); line(c, 50, 30, 60, 60, 6, '#2A2A34');
  // the main rotor: a flat blur with two streaks
  rrect(c, -10, -104, 20, 20, 4); c.fillStyle = '#2A2A34'; c.fill();
  c.beginPath(); c.ellipse(0, -106, 300, 12, 0, 0, 7); c.fillStyle = 'rgba(200,205,220,0.3)'; c.fill();
  const a = (t * 40) % (Math.PI * 2);
  line(c, -300 * Math.cos(a), -106, 300 * Math.cos(a), -106, 6, 'rgba(40,40,50,0.7)');
  c.restore();
  if ((o.light || 0) > 0.01) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x, y, x, y + 700 * s);
    g.addColorStop(0, `rgba(255,250,220,${0.35 * o.light})`); g.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20 * s, y + 40 * s); ctx.lineTo(x + 20 * s, y + 40 * s); ctx.lineTo(x + 260 * s, y + 800 * s); ctx.lineTo(x - 260 * s, y + 800 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
    softDot(gctx, x, y + 30 * s, 60 * s, '#FFFAE0', 0.9 * o.light);
  }
}

// the summit shop in the sun: a stone hut with a big window of chocolate bars and a sign (world point (x, y) = the
// middle of its doorstep)
function summitShop(c, x, y, t) {
  c.save(); c.translate(x, y);
  rrect(c, -330, -330, 660, 330, 12); c.fillStyle = '#B8A890'; c.fill();
  const rng = mulberry32(9);
  for (let i = 0; i < 40; i++) { rrect(c, -320 + rng() * 600, -320 + rng() * 290, 50 + 40 * rng(), 26 + 14 * rng(), 8); c.fillStyle = rng() < 0.5 ? '#A89880' : '#C8B8A0'; c.fill(); }
  c.beginPath(); c.moveTo(-370, -320); c.lineTo(0, -470); c.lineTo(370, -320); c.closePath(); c.fillStyle = '#C83A3A'; c.fill();
  c.beginPath(); c.moveTo(-380, -316); c.lineTo(0, -480); c.lineTo(380, -316); c.lineTo(340, -306); c.quadraticCurveTo(0, -440, -340, -306); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, -230, -420, 460, 70, 10); c.fillStyle = '#2A1A10'; c.fill();
  c.font = '400 52px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText('SUMMIT SHOP', 0, -384);
  // the window full of bars
  rrect(c, -290, -280, 360, 220, 10); c.fillStyle = '#4A2E1A'; c.fill();
  rrect(c, -276, -266, 332, 192, 6); c.fillStyle = '#FFF2D8'; c.fill();
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) chocBar(c, -232 + k * 80, -230 + r * 62, 0.22, t, {});
  // the door
  rrect(c, 120, -250, 130, 250, 8); c.fillStyle = '#6A4426'; c.fill(); circle(c, 226, -120, 7, '#E8C060');
  c.restore();
}
