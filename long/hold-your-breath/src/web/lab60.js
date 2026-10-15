// What If You Hold Your Breath TOO Long? (long-form): a London hospital lab in the 1960s, on old film. A volunteer lies on
// a bed with a mask over his face, a breathing machine beside him (a bellows that rises and falls in a glass cylinder, a
// hose to the mask), a scientist in a white coat with a stopwatch, a wall clock, a tall window with a grey London sky.
// The scene is drawn in colour; sepia60() and film60() (never-sleep's old-film look) turn it into old film.
'use strict';

const LABDOC = Object.assign({}, PAL, {
  coat: '#F4F6FA', coatSh: '#C8CCD8', coatHi: '#FFFFFF', coatDk: '#A8ACB8',
  strap: '#F4F6FA', strapSh: '#C8CCD8', pants: '#3A3A44', pantsSh: '#26262E',
  shoe: '#2A1E18', shoeSh: '#140E0A', sole: '#3A3028', pj: true,
});
const LABVOL = Object.assign({}, PAL, {
  coat: '#C8D8E8', coatSh: '#9AAABE', coatHi: '#E8F0F8', coatDk: '#7A8AA0',
  strap: '#C8D8E8', strapSh: '#9AAABE', pants: '#C8D8E8', pantsSh: '#9AAABE', pj: true,
});
function docKit2(c, r, st) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 24, -2, 21, 17, 0, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#2A2A30'; c.stroke(); }
  line(c, -3, -4, 3, -4, 5, '#2A2A30');
  c.restore();
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(r.lean);
  c.beginPath(); c.moveTo(0, -166); c.lineTo(-10, -150); c.lineTo(0, -60); c.lineTo(10, -150); c.closePath(); c.fillStyle = '#5A2A2A'; c.fill();
  c.restore();
}
// the room. o: {pump (the bellows' phase driver: seconds), clockMin (the wall clock's minute hand, minutes)}
function lab60(cam, t, o = {}) {
  darkBg('#3A3A36', '#141412');
  applyCam(cam);
  const c = ctx;
  // tiled walls, green below, cream above
  c.fillStyle = '#D8D2BC'; c.fillRect(-300, -200, W + 600, 620);
  c.fillStyle = '#7A9A84'; c.fillRect(-300, 420, W + 600, 460);
  for (let x = -300; x < W + 300; x += 60) line(c, x, 420, x, 880, 2, 'rgba(30,50,40,0.25)');
  for (let y = 420; y < 880; y += 60) line(c, -300, y, W + 300, y, 2, 'rgba(30,50,40,0.25)');
  c.fillStyle = '#4A5A50'; c.fillRect(-300, 410, W + 600, 14);
  // the floor
  const fg = c.createLinearGradient(0, 880, 0, H + 200); fg.addColorStop(0, '#6A645A'); fg.addColorStop(1, '#3A362E'); c.fillStyle = fg; c.fillRect(-300, 880, W + 600, 500);
  // a tall window with a grey sky and the outline of a clock tower far off
  rrect(c, 1380, 80, 380, 520, 10); c.fillStyle = '#5A5A52'; c.fill();
  const sky = c.createLinearGradient(0, 96, 0, 584); sky.addColorStop(0, '#A8B0B4'); sky.addColorStop(1, '#D8DCD8'); c.fillStyle = sky; c.fillRect(1396, 96, 348, 488);
  c.fillStyle = '#7A7E7E'; c.fillRect(1600, 300, 46, 284); c.beginPath(); c.moveTo(1596, 300); c.lineTo(1623, 230); c.lineTo(1650, 300); c.closePath(); c.fill();
  circle(c, 1623, 330, 14, '#C8CCC8');
  for (let i = 0; i < 6; i++) { const bx = 1400 + i * 60; c.fillStyle = '#8A8E8A'; c.fillRect(bx, 470 + 30 * hash(i * 3), 54, 120); }
  line(c, 1570, 96, 1570, 584, 10, '#5A5A52'); line(c, 1396, 340, 1744, 340, 10, '#5A5A52');
  // the wall clock
  const cx = 1080, cy = 200;
  circle(c, cx, cy, 86, '#3A3A36'); circle(c, cx, cy, 76, '#F4F0E4');
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(c, cx + Math.sin(a) * 62, cy - Math.cos(a) * 62, cx + Math.sin(a) * 72, cy - Math.cos(a) * 72, 4, '#2A2A26'); }
  const mn = o.clockMin || 0, am = mn / 60 * 6.283, ah = (3 + mn / 60) / 12 * 6.283;
  line(c, cx, cy, cx + Math.sin(ah) * 40, cy - Math.cos(ah) * 40, 7, '#2A2A26'); line(c, cx, cy, cx + Math.sin(am) * 62, cy - Math.cos(am) * 62, 5, '#2A2A26');
  const sa = ((o.clockSec || 0) % 60) / 60 * 6.283; line(c, cx, cy, cx + Math.sin(sa) * 66, cy - Math.cos(sa) * 66, 2, '#A0281E');
  circle(c, cx, cy, 6, '#2A2A26');
}
// the bed with the volunteer lying on it (side view; his head on the left), the mask and the hose
function lab60Bed(t, o = {}) {
  const c = ctx, bx = 760, by = 700;
  // bed frame
  rrect(c, bx - 420, by, 840, 40, 10); c.fillStyle = '#E8E4D8'; c.fill();
  for (const lx of [bx - 400, bx + 380]) { c.fillStyle = '#8A8E92'; c.fillRect(lx, by + 40, 18, 160); circle(c, lx + 9, by + 206, 12, '#3A3A3A'); }
  rrect(c, bx - 440, by - 120, 24, 160, 8); c.fillStyle = '#8A8E92'; c.fill();
  // the volunteer under a sheet: head on a pillow at the left, body a long mound
  rrect(c, bx - 400, by - 50, 150, 54, 26); c.fillStyle = '#F4F2EC'; c.fill();                         // pillow
  c.beginPath(); c.moveTo(bx - 260, by + 2); c.quadraticCurveTo(bx - 200, by - 80, bx - 40, by - 70); c.quadraticCurveTo(bx + 200, by - 60, bx + 380, by - 30); c.lineTo(bx + 400, by + 4); c.closePath();
  c.fillStyle = '#E2DED2'; c.fill(); line(c, bx - 240, by - 30, bx + 360, by - 20, 3, 'rgba(120,110,90,0.3)');
  // his head in profile, eyes open, calm (paralysed: still)
  c.save(); c.translate(bx - 320, by - 70);
  ellipse(c, 0, 0, 62, 54, '#E8B898'); ellipse(c, -10, -26, 58, 32, '#4A3A2A');
  ellipse(c, 34, -6, 8, 9, '#FFFFFF'); circle(c, 37, -5, 4, '#1A1A1A');
  // the mask over nose and mouth, and the hose to the machine
  rrect(c, 40, 4, 44, 44, 16); c.fillStyle = '#5A6A72'; c.fill();
  c.restore();
  c.beginPath(); c.moveTo(bx - 236, by - 46); c.quadraticCurveTo(bx - 180, by - 200, bx - 40 + (o.hoseX || 0), by - 250); c.lineWidth = 16; c.strokeStyle = '#3A3E40'; c.stroke();
}
// the breathing machine: a bellows in a glass cylinder that rises and falls (phase from t, o.rate breaths/min, o.on 0..1)
function lab60Pump(t, o = {}) {
  const c = ctx, x = 760, y = 300;
  rrect(c, x - 90, y - 120, 180, 380, 18); c.fillStyle = '#5A6A6A'; c.fill();
  rrect(c, x - 70, y - 100, 140, 260, 12); c.fillStyle = 'rgba(220,235,240,0.45)'; c.fill();
  const ph = (o.on === undefined ? 1 : o.on) * (0.5 + 0.5 * Math.sin(t * 6.283 * (o.rate || 14) / 60));
  const top = y + 140 - 180 * (0.35 + 0.6 * ph);
  for (let k = 0; k < 6; k++) { const yy = lerp(top, y + 150, k / 6); rrect(c, x - 56, yy - 6, 112, 12, 6); c.fillStyle = k % 2 ? '#2A2E30' : '#3A3E42'; c.fill(); }
  rrect(c, x - 62, top - 14, 124, 20, 6); c.fillStyle = '#8A8E92'; c.fill();
  // dials
  for (const [dx, col] of [[-40, '#F4F0E4'], [40, '#F4F0E4']]) { circle(c, x + dx, y + 200, 22, col); line(c, x + dx, y + 200, x + dx + 12 * Math.sin(t * 2 + dx), y + 188, 3, '#A0281E'); }
}
// old film: sepia blend and dirt (never-sleep's sepia60 / film60)
function sepia60(k = 1) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.85 * k})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#E8C890', 0.55 * k); ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}
function film60(t, k = 1) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fr = Math.floor(t * 24), rng = mulberry32(fr * 7 + 3);
  ctx.fillStyle = `rgba(30,20,10,${(0.05 + 0.05 * rng()) * k})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 3; i++) { if (rng() < 0.5) continue; const x = rng() * W; line(ctx, x, 0, x + (rng() - 0.5) * 30, H, 1.5, `rgba(255,245,220,${0.25 * k})`); }
  for (let i = 0; i < 8; i++) circle(ctx, rng() * W, rng() * H, 1 + rng() * 3, `rgba(30,20,10,${0.5 * k})`);
}
