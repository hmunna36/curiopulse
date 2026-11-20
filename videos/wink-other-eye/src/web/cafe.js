// wink-other-eye (20 Nov 2026): a night café, a spy rendezvous. World coords = screen coords at zoom 1.
//   woCafeBack(t)              the room: teal wall and panelling, a big rainy window onto a neon street, string lights,
//                              a shelf of mugs, a small chalkboard, a tiled floor (the wall is a cached picture; the lamps,
//                              the rain and the neon are drawn every frame so they glow)
//   woLamp(x, y, t, a)         a pendant lamp (its bulb in the glow layer)
//   woHeroTable(c, t, o)       his round table with a red check cloth to the floor, a coffee cup that steams, a croissant
//   woCatTable(c, t)           the cat's little table on the right, with an espresso
//   woSpyCat(c, x, y, s, t, o) the contact: a grey cat in a fedora (cats-purr's purCat, with a hat and a collar)
//   WO_PAL                     his outfit tonight: a tan trench coat (the clothes only; face, hair, body are the rig's)
//   woHero(t, o)               him seated at his table: o = {face, pose, x, y, s}
'use strict';

const WO = { floorY: 1600, tableY: 1405, heroX: 430, heroY: 1545, heroS: 1.32, catX: 820, catY: 1330, catS: 0.62, winX0: 96, winX1: 736, winY0: 360, winY1: 1060 };
const WO_PAL = Object.assign({}, PAL, {
  coat: '#D9A85B', coatSh: '#B07E3A', coatHi: '#F3CB86', coatDk: '#8E6128',
  strap: '#7A4E22', strapSh: '#5C3814',
});
const WO_CAT = Object.assign({}, PURC, { fur: '#8C97B8', dark: '#5B6688', light: '#F1F4FB', ear: '#F2A6B6', line: '#272B45', nose: '#F07A90', iris: '#F4D35E' });
let WO_WALL = null;

function woPaintWall() {
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  // the wall: teal, darker at the top, a warm wash from the lamps
  const g = c.createLinearGradient(0, 0, 0, WO.floorY);
  g.addColorStop(0, '#0F3A52'); g.addColorStop(0.55, '#16577A'); g.addColorStop(1, '#114663');
  c.fillStyle = g; c.fillRect(0, 0, W, WO.floorY);
  for (const [x, r, a] of [[430, 620, 0.20], [905, 420, 0.16]]) {
    const lg = c.createRadialGradient(x, 820, 30, x, 820, r);
    lg.addColorStop(0, `rgba(255,190,110,${a})`); lg.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = lg; c.fillRect(0, 0, W, WO.floorY);
  }
  // wallpaper stripes
  for (let x = 20; x < W; x += 64) { c.fillStyle = 'rgba(255,255,255,0.035)'; c.fillRect(x, 0, 26, 1180); }
  // wainscot panels under a rail
  c.fillStyle = '#0C3047'; c.fillRect(0, 1180, W, WO.floorY - 1180);
  c.fillStyle = '#E8B04A'; c.fillRect(0, 1168, W, 14);
  c.fillStyle = '#B98428'; c.fillRect(0, 1180, W, 5);
  for (let x = 30; x < W; x += 175) { rrect(c, x, 1215, 140, 330, 10); c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,0.07)'; c.stroke(); }
  // the floor: warm tiles in rows
  const fg = c.createLinearGradient(0, WO.floorY, 0, H);
  fg.addColorStop(0, '#6B3A2A'); fg.addColorStop(1, '#3E2018');
  c.fillStyle = fg; c.fillRect(0, WO.floorY, W, H - WO.floorY);
  for (let r = 0; r < 6; r++) {
    const y = WO.floorY + 18 + r * r * 14 + r * 22;
    for (let i = -2; i < 14; i++) { if ((i + r) % 2) continue; const x = i * 96 + (r % 2) * 48; c.fillStyle = 'rgba(255,220,180,0.06)'; c.fillRect(x, y, 96, 16 + r * 10); }
  }
  // the window frame (the street inside it is drawn each frame)
  rrect(c, WO.winX0 - 26, WO.winY0 - 26, WO.winX1 - WO.winX0 + 52, WO.winY1 - WO.winY0 + 52, 18); c.fillStyle = '#3A2318'; c.fill();
  c.fillStyle = '#5A3622'; c.fillRect(WO.winX0 - 40, WO.winY1 + 14, WO.winX1 - WO.winX0 + 80, 26);   // the sill
  // a shelf of mugs (right wall)
  c.fillStyle = '#5A3622'; c.fillRect(800, 1080, 260, 18);
  [['#FF5A6E', 830], ['#FFD447', 892], ['#7FE9FF', 954], ['#4DFFB4', 1012]].forEach(([col, x]) => {
    rrect(c, x - 22, 1028, 44, 52, 8); c.fillStyle = col; c.fill();
    c.beginPath(); c.arc(x + 24, 1052, 12, -1.3, 1.3); c.lineWidth = 7; c.strokeStyle = col; c.stroke();
  });
  // the small chalkboard menu
  rrect(c, 812, 520, 220, 300, 10); c.fillStyle = '#7A4E22'; c.fill();
  rrect(c, 828, 536, 188, 268, 6); c.fillStyle = '#1F3A30'; c.fill();
  c.font = '800 34px Montserrat'; c.textAlign = 'center'; c.fillStyle = 'rgba(240,240,225,0.85)'; c.fillText('MENU', 922, 590);
  for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(240,240,225,0.45)'; c.fillRect(850, 625 + i * 36, 100 + 30 * hash(i + 2), 6); c.fillRect(980, 625 + i * 36, 22, 6); }
  return cv;
}

// the street through the window: night blue, far lit windows, a neon cup sign, rain
function woWindow(t) {
  ctx.save();
  rrect(ctx, WO.winX0, WO.winY0, WO.winX1 - WO.winX0, WO.winY1 - WO.winY0, 8); ctx.clip();
  const g = ctx.createLinearGradient(0, WO.winY0, 0, WO.winY1);
  g.addColorStop(0, '#1A1F5E'); g.addColorStop(0.6, '#2B2A7A'); g.addColorStop(1, '#3B2C6E');
  ctx.fillStyle = g; ctx.fillRect(WO.winX0, WO.winY0, WO.winX1 - WO.winX0, WO.winY1 - WO.winY0);
  // far buildings with lit windows
  for (let i = 0; i < 7; i++) {
    const bx = WO.winX0 - 20 + i * 104, bh = 260 + 160 * hash(i * 3.3), by = WO.winY1 - bh;
    ctx.fillStyle = i % 2 ? '#141A48' : '#1B2257'; ctx.fillRect(bx, by, 96, bh);
    for (let r = 0; r < 6; r++) for (let q = 0; q < 3; q++) if (hash(i * 31 + r * 7 + q) > 0.55) { ctx.fillStyle = hash(i + r + q * 3) > 0.5 ? '#FFC870' : '#FF9AC8'; ctx.fillRect(bx + 12 + q * 28, by + 20 + r * 40, 14, 18); }
  }
  // street lamps as soft bokeh
  for (let i = 0; i < 4; i++) { const x = WO.winX0 + 80 + i * 170, y = WO.winY0 + 200 + 60 * hash(i + 9); softDot(ctx, x, y, 60, '#FFC870', 0.35); softDot(gctx, x, y, 50, '#FFC870', 0.4); }
  // the neon sign hanging in the window: a pink cup with cyan steam
  const nx = 560, ny = 560, fl = 0.85 + 0.15 * Math.sin(t * loopW(9.0)) * (hash(Math.floor(t * 6)) > 0.93 ? 1 : 0);
  const neon = (c, a, lw) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = rgba('#FF4FA8', a); c.lineWidth = lw;
    c.beginPath(); c.moveTo(nx - 70, ny); c.lineTo(nx - 56, ny + 96); c.quadraticCurveTo(nx, ny + 120, nx + 56, ny + 96); c.lineTo(nx + 70, ny); c.closePath(); c.stroke();
    c.beginPath(); c.arc(nx + 82, ny + 40, 24, -1.2, 1.3); c.stroke();
    c.strokeStyle = rgba('#7FE9FF', a);
    for (const dx of [-28, 0, 28]) { c.beginPath(); c.moveTo(nx + dx, ny - 18); c.bezierCurveTo(nx + dx - 16, ny - 44, nx + dx + 16, ny - 58, nx + dx, ny - 86); c.stroke(); }
  };
  neon(ctx, 0.95 * fl, 9); neon(gctx, 0.8 * fl, 16);
  // rain on the glass: streaks on a loop-safe clock
  for (let i = 0; i < 46; i++) {
    const x = WO.winX0 + (WO.winX1 - WO.winX0) * hash(i * 1.7), sp = 0.55 + 0.4 * hash(i * 2.9);
    const y = WO.winY0 + ((hash(i * 5.1) + t * sp * loopW(1) / (2 * Math.PI)) % 1) * (WO.winY1 - WO.winY0 + 120) - 60;
    line(ctx, x, y, x - 3, y + 30, 2.2, 'rgba(200,220,255,0.35)');
  }
  // drops on the glass
  for (let i = 0; i < 18; i++) circle(ctx, WO.winX0 + 40 + 560 * hash(i * 9.3), WO.winY0 + 40 + 620 * hash(i * 4.4), 4 + 3 * hash(i), 'rgba(220,235,255,0.35)');
  ctx.restore();
  // window bars
  line(ctx, (WO.winX0 + WO.winX1) / 2, WO.winY0, (WO.winX0 + WO.winX1) / 2, WO.winY1, 16, '#3A2318');
  line(ctx, WO.winX0, (WO.winY0 + WO.winY1) / 2 + 60, WO.winX1, (WO.winY0 + WO.winY1) / 2 + 60, 14, '#3A2318');
}

function woStringLights(t) {
  const x0 = -60, x1 = W + 60, y0 = 250, sag = 90;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(W / 2, y0 + 2 * sag, x1, y0); ctx.lineWidth = 3; ctx.strokeStyle = '#1A1410'; ctx.stroke();
  const cols = ['#FFD447', '#FF9A3C', '#FF86A6', '#7FE9FF'];
  for (let i = 0; i < 12; i++) {
    const u = (i + 0.5) / 12, x = lerp(x0, x1, u), y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (y0 + 2 * sag) + u * u * y0 + 14;
    const tw = 0.8 + 0.2 * Math.sin(t * loopW(1.6 + hash(i)) + i * 2);
    circle(ctx, x, y, 11, cols[i % 4]); softDot(gctx, x, y, 34, cols[i % 4], 0.75 * tw);
  }
}

function woLamp(x, y, t, a = 1) {
  line(ctx, x, -40, x, y - 60, 5, '#14100C');
  // the shade: a brass cone
  ctx.beginPath(); ctx.moveTo(x - 30, y - 62); ctx.lineTo(x + 30, y - 62); ctx.lineTo(x + 92, y); ctx.lineTo(x - 92, y); ctx.closePath(); ctx.fillStyle = '#C98B2E'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 30, y - 62); ctx.lineTo(x - 6, y - 62); ctx.lineTo(x - 44, y); ctx.lineTo(x - 92, y); ctx.closePath(); ctx.fillStyle = '#E8B04A'; ctx.fill();
  ellipse(ctx, x, y + 6, 40, 14, '#FFF1C8');
  softDot(gctx, x, y + 14, 120, '#FFC870', 0.9 * a);
  softDot(ctx, x, y + 40, 260, '#FFB860', 0.10 * a);
}

function woCafeBack(t, o = {}) {
  if (!WO_WALL) WO_WALL = woPaintWall();
  ctx.drawImage(WO_WALL, 0, 0);
  woWindow(t);
  woStringLights(t);
  woLamp(300, 700, t);
  woLamp(830, 760, t, 0.85);
  // a leafy plant in a pot by the window (shapes: it takes the light)
  const px = 52, py = WO.floorY;
  rrect(ctx, px - 52, py - 150, 104, 150, 14); ctx.fillStyle = '#C0563A'; ctx.fill();
  ctx.fillStyle = '#A24630'; ctx.fillRect(px - 58, py - 160, 116, 28);
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.28 + 0.04 * Math.sin(t * loopW(0.9) + i), L = 230 + 90 * hash(i + 4);
    const ex = px + Math.cos(a) * L, ey = py - 150 + Math.sin(a) * L;
    ctx.beginPath(); ctx.moveTo(px, py - 150); ctx.quadraticCurveTo(px + Math.cos(a) * L * 0.5 - 30, py - 150 + Math.sin(a) * L * 0.5, ex, ey);
    ctx.lineWidth = 6; ctx.strokeStyle = '#2E6B2A'; ctx.stroke();
    ellipse(ctx, ex, ey, 46, 20, i % 2 ? '#3E8C34' : '#2F7A2A', a);
  }
}

// his table: a round top with a red check cloth to the floor (it hides his legs), a cup that steams, a croissant
function woHeroTable(c, t, o = {}) {
  const x = o.x || WO.heroX + 40, y = WO.tableY, rx = 300;
  // the cloth: a trapezoid down to the floor, red with white checks, folds
  c.beginPath(); c.moveTo(x - rx, y); c.lineTo(x - rx - 40, WO.floorY + 20); c.lineTo(x + rx + 40, WO.floorY + 20); c.lineTo(x + rx, y); c.closePath();
  c.fillStyle = '#E2453C'; c.fill();
  paint(() => {
    c.save(); c.beginPath(); c.moveTo(x - rx, y); c.lineTo(x - rx - 40, WO.floorY + 20); c.lineTo(x + rx + 40, WO.floorY + 20); c.lineTo(x + rx, y); c.closePath(); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = -8; i < 9; i++) c.fillRect(x + i * 46, y, 22, WO.floorY - y + 30);
    for (let j = 0; j < 6; j++) c.fillRect(x - rx - 60, y + 18 + j * 40, 2 * rx + 120, 18);
    for (let i = -3; i <= 3; i++) line(c, x + i * 90, y + 20, x + i * 104, WO.floorY + 20, 5, 'rgba(120,20,30,0.25)');
    c.restore();
  });
  ellipse(c, x, y, rx + 6, 40, '#F04E44');
  // the cup and saucer (shapes), steam (glow)
  const cx = x + 110, cy = y - 8;
  ellipse(c, cx, cy + 6, 70, 16, '#F4F1EA');
  rrect(c, cx - 38, cy - 64, 76, 66, 16); c.fillStyle = '#FFFFFF'; c.fill();
  c.beginPath(); c.arc(cx + 42, cy - 34, 18, -1.2, 1.2); c.lineWidth = 9; c.strokeStyle = '#FFFFFF'; c.stroke();
  ellipse(c, cx, cy - 64, 36, 9, '#6B3A1E');
  for (let i = 0; i < 3; i++) {
    const ph = t * loopW(1.3) + i * 2.1, sx = cx - 18 + i * 18;
    c.beginPath(); c.moveTo(sx, cy - 74); c.bezierCurveTo(sx - 14 + 6 * Math.sin(ph), cy - 110, sx + 14, cy - 130, sx + 4 * Math.sin(ph), cy - 170);
    c.lineWidth = 7; c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineCap = 'round'; c.stroke();
  }
  // a croissant on a plate
  const qx = x - 150, qy = y - 4;
  ellipse(c, qx, qy + 4, 78, 16, '#F4F1EA');
  for (let i = -2; i <= 2; i++) ellipse(c, qx + i * 22, qy - 14 + Math.abs(i) * 4, 24 - Math.abs(i) * 3, 18 - Math.abs(i) * 2, i % 2 ? '#E9A33C' : '#F2B550', i * 0.25);
}

function woCatTable(c, t) {
  const x = WO.catX, y = WO.catY + 8;
  line(c, x, y, x, WO.floorY, 16, '#3A2318');
  ellipse(c, x, WO.floorY, 70, 14, '#2A190F');
  ellipse(c, x, y, 150, 26, '#7A4E22'); ellipse(c, x, y - 6, 146, 22, '#9A6630');
  // an espresso
  rrect(c, x - 100, y - 44, 40, 34, 8); c.fillStyle = '#FFFFFF'; c.fill(); ellipse(c, x - 80, y - 8, 30, 8, '#F4F1EA');
}

// the cat spy: purCat in grey, a fedora, a collar with a gold tag. o: purCat's options plus hat 0..1 (on), tip (the hat
// tipped), card 0..1 (a little card held up in a paw: o.cardText), watch 0..1 (a paw lifted to look at a wristwatch)
function woSpyCat(c, x, y, s, t, o = {}) {
  actor(() => purCat(c, x, y, s, t, Object.assign({ pal: WO_CAT, seed: 4 }, o)));
  // the hat, on her head (head units through purPt)
  if ((o.hat === undefined ? 1 : o.hat) > 0.01) {
    const tilt = (o.tilt || 0) + (o.tip || 0) * -0.35;
    const [hx, hy] = purPt(x, y, s, o, 0, -58);
    actor(() => {
      c.save(); c.translate(hx, hy); c.rotate(tilt); c.scale(s, s);
      ellipse(c, 0, 0, 118, 22, '#2B2F45');                       // the brim
      c.beginPath(); c.moveTo(-70, -2); c.quadraticCurveTo(-74, -78, -30, -86); c.quadraticCurveTo(0, -70, 30, -86); c.quadraticCurveTo(74, -78, 70, -2); c.closePath();
      c.fillStyle = '#353A55'; c.fill();
      c.fillStyle = '#E2453C'; c.fillRect(-71, -26, 142, 20);      // the band
      c.restore();
    });
  }
  // the collar with a gold tag
  const [cx2, cy2] = purPt(x, y, s, o, 0, 62);
  paint(() => { ellipse(c, cx2, cy2, 64 * s, 12 * s, '#E2453C'); circle(c, cx2, cy2 + 14 * s, 11 * s, '#FFD447'); });
  if ((o.card || 0) > 0.01) {   // a card held up beside her head
    const k = E.outBack(clamp(o.card), 1.8), cx = x + 150 * s, cy = y - 300 * s;
    paint(() => {
      c.save(); c.translate(cx, cy); c.rotate(0.12); c.scale(k * s, k * s);
      rrect(c, -110, -60, 220, 120, 12); c.fillStyle = '#FFFFFF'; c.fill();
      c.lineWidth = 6; c.strokeStyle = '#272B45'; c.stroke();
      c.font = '400 64px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#E2453C'; c.fillText(o.cardText || '?', 0, 4);
      c.restore();
    });
  }
}

// him, seated at his table: the set first, then him, then the table in front of him
function woHeroSt(o = {}) {
  return { x: o.x || WO.heroX, y: o.y || WO.heroY, s: o.s || WO.heroS, pose: o.pose || POSES.sit, face: o.face || FACES.calm,
    headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
}
