// Why Do Wombats Poop CUBES? 🟫 — the cube factory (world coords, 1080x1920 at zoom 1).
// A dim hall (a cached plate: corrugated wall, steel columns and a truss, high windows at dusk), three pendant lamps
// (their bulbs in the glow layer), a conveyor belt across the middle whose ribs and rollers run on a loop-safe clock, a
// hydraulic press on the left (a mould block on a chrome ram, hazard stripes) and a guillotine blade on the right, grey
// factory cubes riding the belt, and the counter board for the belt shot. Machines and cubes are shapes (lit as props).
'use strict';

const WBF = { beltY: 1300, beltH: 46, pressX: 262, bladeX: 822, lampY: 360 };
let WBF_HALL = null;
const WBF_R = { x: -400, y: 0, w: 1880, h: 1920 };

function initFactory() {
  const c = mkCanvas(WBF_R.w, WBF_R.h), x = c.getContext('2d');
  x.translate(-WBF_R.x, -WBF_R.y);
  // the back wall: corrugated steel, blue-grey, darker toward the floor
  const g = x.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#2A3348'); g.addColorStop(0.5, '#3A4560'); g.addColorStop(0.75, '#2C3448'); g.addColorStop(1, '#1A1F2C');
  x.fillStyle = g; x.fillRect(WBF_R.x, 0, WBF_R.w, 1920);
  for (let px = WBF_R.x; px < WBF_R.x + WBF_R.w; px += 26) {
    x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(px, 120, 10, 1240);
    x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(px + 13, 120, 8, 1240);
  }
  // high windows with a dusk glow
  for (let i = 0; i < 7; i++) {
    const wx = WBF_R.x + 80 + i * 270;
    const wg = x.createLinearGradient(0, 160, 0, 420); wg.addColorStop(0, '#F7B27A'); wg.addColorStop(1, '#C2708A');
    x.fillStyle = wg; x.fillRect(wx, 170, 190, 230);
    x.fillStyle = '#1C2234';
    for (let k = 1; k < 3; k++) x.fillRect(wx + k * 63 - 3, 170, 6, 230);
    x.fillRect(wx, 280, 190, 6);
  }
  // steel columns and a truss
  for (let i = 0; i < 6; i++) {
    const cx = WBF_R.x + 40 + i * 360;
    x.fillStyle = '#4A556E'; x.fillRect(cx, 100, 44, 1300);
    x.fillStyle = '#5E6A86'; x.fillRect(cx + 6, 100, 10, 1300);
    x.fillStyle = '#2A3142'; x.fillRect(cx + 34, 100, 10, 1300);
  }
  x.fillStyle = '#3C465E'; x.fillRect(WBF_R.x, 90, WBF_R.w, 40);
  x.strokeStyle = '#3C465E'; x.lineWidth = 12;
  for (let i = 0; i < 14; i++) { const tx = WBF_R.x + i * 140; x.beginPath(); x.moveTo(tx, 130); x.lineTo(tx + 70, 40); x.lineTo(tx + 140, 130); x.stroke(); }
  // hazard stripes along the floor line, the concrete floor
  const fg = x.createLinearGradient(0, 1400, 0, 1920); fg.addColorStop(0, '#4E4A48'); fg.addColorStop(1, '#2A2624');
  x.fillStyle = fg; x.fillRect(WBF_R.x, 1400, WBF_R.w, 520);
  for (let px = WBF_R.x; px < WBF_R.x + WBF_R.w; px += 60) {
    x.fillStyle = '#E8B820'; x.beginPath(); x.moveTo(px, 1400); x.lineTo(px + 30, 1400); x.lineTo(px + 10, 1424); x.lineTo(px - 20, 1424); x.closePath(); x.fill();
  }
  // a sign on the wall
  x.fillStyle = '#E8E2D0'; x.fillRect(420, 560, 240, 110);
  x.fillStyle = '#2A2A2A'; x.font = '900 40px Montserrat'; x.textAlign = 'center'; x.fillText('CUBES', 540, 612); x.font = '800 24px Montserrat'; x.fillText('SINCE 1952', 540, 650);
  WBF_HALL = c;
}

function wbFactoryBack(cam, t, o = {}) {
  screenSpace();
  ctx.fillStyle = '#141824'; ctx.fillRect(0, 0, W, H);
  camTransform(ctx, parallax(cam, 0.6), 1);
  if ((o.soft || 0) > 0.02) {
    ctx.drawImage(WBF_HALL, WBF_R.x, WBF_R.y);
    const s = wbSoft(WBF_HALL, 8, 0.9); ctx.globalAlpha = clamp(o.soft); ctx.drawImage(s, WBF_R.x, WBF_R.y); ctx.globalAlpha = 1;
  } else ctx.drawImage(WBF_HALL, WBF_R.x, WBF_R.y);
  // the lamps: cone shades and bulbs (the bulbs in the glow layer), soft light pools
  applyCam(cam);
  for (const lx of [160, 540, 920]) {
    line(ctx, lx, 0, lx, WBF.lampY - 40, 4, '#1A1E2A');
    ctx.beginPath(); ctx.moveTo(lx - 70, WBF.lampY + 20); ctx.lineTo(lx - 26, WBF.lampY - 40); ctx.lineTo(lx + 26, WBF.lampY - 40); ctx.lineTo(lx + 70, WBF.lampY + 20); ctx.closePath();
    ctx.fillStyle = '#3E6A5C'; ctx.fill();
    circle(ctx, lx, WBF.lampY + 22, 18, '#FFF0C8');
    softDot(gctx, lx, WBF.lampY + 26, 90, '#FFD08A', 0.85);
    softDot(ctx, lx, WBF.lampY + 300, 330, '#FFD9A0', 0.10);
  }
}

// the conveyor belt across the frame (world): a steel frame, rollers under it, the rubber top with ribs that move
// (speed in px/s, negative = to the left), legs to the floor
function wbBelt(t, speed = -120, x0 = -300, x1 = 1400) {
  const y = WBF.beltY, h = WBF.beltH;
  // legs
  for (let lx = x0 + 120; lx < x1; lx += 340) { ctx.fillStyle = '#3A4256'; ctx.fillRect(lx, y + h, 22, 140); }
  // frame
  rrect(ctx, x0, y - 8, x1 - x0, h + 26, 10); ctx.fillStyle = '#5A6680'; ctx.fill();
  // the belt's top
  rrect(ctx, x0, y - 14, x1 - x0, 22, 8); ctx.fillStyle = '#26262C'; ctx.fill();
  paint(() => {
    const off = ((t * speed) % 40 + 40) % 40;
    for (let px = x0 + off; px < x1; px += 40) line(ctx, px, y - 12, px - 6, y + 6, 3, 'rgba(255,255,255,0.10)');
    for (let px = x0 + 40; px < x1; px += 80) {
      const a = -t * speed / 18;
      ctx.beginPath(); ctx.arc(px, y + h - 4, 14, 0, 7); ctx.fillStyle = '#9AA4B8'; ctx.fill();
      line(ctx, px, y + h - 4, px + Math.cos(a) * 12, y + h - 4 + Math.sin(a) * 12, 3, '#4A5266');
    }
    for (let px = x0 + 30; px < x1; px += 120) { ctx.fillStyle = '#E8B820'; ctx.fillRect(px, y + 14, 50, 10); }
  });
}

// a factory cube: grey-blue, crisp bevels (made by a mould or a knife). s = edge
function wbFactoryCube(x, y, s) {
  const h = s / 2, d = s * 0.3;
  const face = (pts, col) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  face([[x + h, y - h], [x + h + d, y - h - d * 0.8], [x + h + d, y + h - d * 0.8], [x + h, y + h]], '#5A6478');
  face([[x - h, y - h], [x - h + d, y - h - d * 0.8], [x + h + d, y - h - d * 0.8], [x + h, y - h]], '#B8C2D4');
  face([[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]], '#8C97AC');
}

// the hydraulic press (world): two columns, a cross-head, a chrome ram with a mould block; down 0..1
function wbPress(x, t, down) {
  const top = 760, by = WBF.beltY - 16;
  ctx.fillStyle = '#C9A21C'; ctx.fillRect(x - 150, top, 40, by - top + 10); ctx.fillRect(x + 110, top, 40, by - top + 10);
  rrect(ctx, x - 170, top - 70, 340, 90, 12); ctx.fillStyle = '#D9B024'; ctx.fill();
  paint(() => { for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#1A1A1A' : '#E8C030'; ctx.fillRect(x - 160 + k * 54, top - 10, 54, 18); } });
  const ramL = 80 + down * (by - top - 200);
  rrect(ctx, x - 26, top + 20, 52, ramL, 8); ctx.fillStyle = '#C8D0DC'; ctx.fill();
  paint(() => line(ctx, x - 8, top + 30, x - 8, top + 10 + ramL, 6, 'rgba(255,255,255,0.6)'));
  const my = top + 20 + ramL;
  rrect(ctx, x - 80, my, 160, 70, 8); ctx.fillStyle = '#6E7890'; ctx.fill();
  rrect(ctx, x - 52, my + 40, 104, 30, 4); ctx.fillStyle = '#2A2F3C'; ctx.fill();   // the square hollow of the mould
  return my + 70;
}

// the guillotine (world): a frame, a heavy angled blade that drops; down 0..1
function wbBlade(x, t, down) {
  const top = 820, by = WBF.beltY - 16;
  ctx.fillStyle = '#6E7A92'; ctx.fillRect(x - 120, top, 30, by - top + 10); ctx.fillRect(x + 90, top, 30, by - top + 10);
  rrect(ctx, x - 140, top - 40, 280, 60, 10); ctx.fillStyle = '#7E8AA4'; ctx.fill();
  const bTop = top + 30 + down * (by - top - 200);
  ctx.beginPath(); ctx.moveTo(x - 90, bTop); ctx.lineTo(x + 90, bTop); ctx.lineTo(x + 90, bTop + 140); ctx.lineTo(x - 90, bTop + 170); ctx.closePath();
  ctx.fillStyle = '#AEB8CA'; ctx.fill();
  paint(() => { line(ctx, x - 90, bTop + 168, x + 90, bTop + 138, 6, '#F2F6FF'); line(ctx, x - 70, bTop + 20, x + 70, bTop + 20, 4, 'rgba(40,46,60,0.5)'); });
  return bTop + 160;
}

// the counter board (screen): CUBES TODAY and a big number that flips
function wbCounter(x, y, n, k, t) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 1.8);
  paint(() => {
    ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk);
    rrect(ctx, -190, -110, 380, 220, 24); ctx.fillStyle = '#1A2034'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#FFD447'; ctx.stroke();
    ctx.font = '900 34px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD447'; ctx.fillText('CUBES TODAY', 0, -62);
    ctx.font = '400 120px Anton'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(String(Math.round(n)), 0, 30);
    ctx.restore();
  });
}
