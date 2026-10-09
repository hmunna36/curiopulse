// What Happens If You NEVER Sleep? (long-form): San Diego, the winter of 1963-64, in sepia. A den with wood
// panelling, a science-fair poster, a pinball machine that lights up, a chalkboard for the countdown in sevens, and
// two people: Randy (17, the rig in a striped T-shirt and jeans with a flat-top) and the sleep scientist (the rig in a
// white lab coat with glasses and a tie). The scene is drawn in colour; sepia60() and film60() turn it into old film.
'use strict';

const RANDYPAL = Object.assign({}, PAL, {
  coat: '#F2F0EA', coatSh: '#C8C4B8', coatHi: '#FFFFFF', coatDk: '#A8A498',
  strap: '#C8323C', strapSh: '#8A1E26', pants: '#3A5A9A', pantsSh: '#26407A',
  shoe: '#F4F0E6', shoeSh: '#C8C2B0', sole: '#8A8576', pj: true,
});
const DOCPAL = Object.assign({}, PAL, {
  coat: '#F4F6FA', coatSh: '#C8CCD8', coatHi: '#FFFFFF', coatDk: '#A8ACB8',
  strap: '#F4F6FA', strapSh: '#C8CCD8', pants: '#3A3A44', pantsSh: '#26262E',
  shoe: '#2A1E18', shoeSh: '#140E0A', sole: '#3A3028', pj: true,
});
// Randy's flat-top and the stripe on his shirt; the scientist's glasses and tie (rig space, in figure's post)
function randyKit(c, r, st) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  c.beginPath(); c.moveTo(-64, -10); c.lineTo(-62, -64); c.lineTo(-40, -84); c.lineTo(40, -84); c.lineTo(62, -64); c.lineTo(64, -10);
  c.quadraticCurveTo(50, -40, 0, -44); c.quadraticCurveTo(-50, -40, -64, -10); c.closePath(); c.fillStyle = '#7A5A3A'; c.fill();
  for (let i = -3; i <= 3; i++) line(c, i * 15, -82, i * 15, -60, 3, 'rgba(255,230,190,0.25)');
  c.restore();
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(r.lean);
  c.fillStyle = '#C8323C'; c.fillRect(-84, -112, 168, 16); c.fillStyle = '#2A4A8A'; c.fillRect(-84, -92, 168, 8);
  c.restore();
}
function docKit(c, r, st) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 24, -2, 21, 17, 0, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#2A2A30'; c.stroke(); }
  line(c, -3, -4, 3, -4, 5, '#2A2A30');
  c.restore();
  c.save(); c.translate(r.P[0], r.P[1]); c.rotate(r.lean);
  c.beginPath(); c.moveTo(0, -166); c.lineTo(-10, -150); c.lineTo(0, -60); c.lineTo(10, -150); c.closePath(); c.fillStyle = '#2A3A6A'; c.fill();
  rrect(c, 30, -120, 30, 6, 2); c.fillStyle = '#4A6AC8'; c.fill();   // a pen in the pocket
  c.restore();
}

// the den: panelled walls, a window with a winter-night (or a grey morning) sky, a lamp, a sofa, the poster
function den60(cam, t, o = {}) {
  darkBg('#3A2A1E', '#120C08');
  applyCam(cam);
  const c = ctx;
  // panelling
  for (let x = -300; x < W + 300; x += 70) { const g = c.createLinearGradient(x, 0, x + 70, 0); g.addColorStop(0, '#6A4A2E'); g.addColorStop(0.5, '#7E5A38'); g.addColorStop(1, '#5A3E26'); c.fillStyle = g; c.fillRect(x, -200, 70, 1060); line(c, x, -200, x, 860, 3, 'rgba(30,18,10,0.5)'); }
  c.fillStyle = '#3A2616'; c.fillRect(-300, 840, W + 600, 30);
  const fg = c.createLinearGradient(0, 860, 0, H + 200); fg.addColorStop(0, '#5A4A3A'); fg.addColorStop(1, '#2A2018'); c.fillStyle = fg; c.fillRect(-300, 860, W + 600, 500);
  // the window (left)
  rrect(c, 120, 200, 300, 360, 8); c.fillStyle = '#2A1E14'; c.fill();
  const sky = c.createLinearGradient(0, 210, 0, 550); sky.addColorStop(0, o.day ? '#B8C8D8' : '#1A2440'); sky.addColorStop(1, o.day ? '#E8ECE8' : '#3A4870');
  c.fillStyle = sky; c.fillRect(134, 214, 272, 332);
  line(c, 270, 214, 270, 546, 10, '#2A1E14'); line(c, 134, 380, 406, 380, 10, '#2A1E14');
  // the science-fair poster (right of the window)
  if (o.poster !== false) {
    c.save(); c.translate(o.posterX || 1460, 330); c.rotate(0.02);
    rrect(c, -230, -150, 460, 300, 8); c.fillStyle = '#F4ECD8'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#2A4A8A'; c.stroke();
    c.font = '400 52px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2A4A8A';
    c.fillText('HOW LONG CAN A', 0, -82); c.fillText('PERSON STAY AWAKE?', 0, -24);
    c.font = '900 26px Montserrat'; c.fillStyle = '#8A1E26'; c.fillText('SCIENCE FAIR  ·  1964', 0, 34);
    for (let i = 0; i < 3; i++) { rrect(c, -170 + i * 120, 64, 100, 60, 6); c.fillStyle = ['#D8C8A0', '#C8D8C0', '#E0C8C0'][i]; c.fill(); }
    c.restore();
  }
}
// the pinball machine (x, y = the front legs' floor point); lights chase, a ball runs, `score` on the backglass
function pinball(c, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // legs
  for (const lx of [-150, 150]) line(c, lx, 0, lx + (lx < 0 ? 10 : -10), -330, 16, '#2A2A30');
  // the cabinet (the playfield tilts toward us)
  c.beginPath(); c.moveTo(-190, -330); c.lineTo(190, -330); c.lineTo(160, -480); c.lineTo(-160, -480); c.closePath(); c.fillStyle = '#8A1E3A'; c.fill();
  c.beginPath(); c.moveTo(-170, -340); c.lineTo(170, -340); c.lineTo(146, -470); c.lineTo(-146, -470); c.closePath(); c.fillStyle = '#1E3A6A'; c.fill();
  for (let i = 0; i < 7; i++) {   // bumpers and lights
    const bx = -110 + (i % 4) * 72, by = -440 + Math.floor(i / 4) * 50, on = (Math.floor(t * 8) + i) % 3 === 0;
    circle(c, bx, by, 14, on ? '#FFE08A' : '#7A6A3A'); if (on) softDot(gctx, bx, by, 34, '#FFE08A', 0.7);
  }
  const bp = (t * 1.3) % 1, bx2 = -100 + 200 * Math.abs(Math.sin(bp * Math.PI * 3)), by2 = -350 - 110 * Math.abs(Math.sin(bp * Math.PI * 2));
  circle(c, bx2, by2, 9, '#F4F6FF');
  // flippers
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 60, -352); c.rotate(sd * (0.4 - 0.6 * (o.flip || 0) * (Math.sin(t * 10) > 0.6 ? 1 : 0))); rrect(c, sd > 0 ? -50 : 0, -6, 50, 12, 6); c.fillStyle = '#F4F6FF'; c.fill(); c.restore(); }
  // the backglass
  rrect(c, -170, -760, 340, 280, 12); c.fillStyle = '#2A1A3A'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#C8A84A'; c.stroke();
  c.font = '400 58px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText('PINBALL', 0, -690);
  c.font = '400 46px Anton'; c.fillStyle = '#FF86A6'; c.fillText(o.score || '0  0  0', 0, -600);
  for (let i = 0; i < 10; i++) { const a = i / 10; const on = (Math.floor(t * 6) + i) % 2; circle(c, -150 + a * 300, -505, 6, on ? '#FFE08A' : '#5A4A2A'); }
  softDot(gctx, 0, -640, 200, '#FFB0E0', 0.35);
  c.restore();
}
// the chalkboard with the countdown in sevens: shown = how many numbers are written (fractional = being written)
const SEVENS = ['100', '93', '86', '79', '72', '65'];
function countBoard(c, x, y, s, shown, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -330, -230, 660, 460, 14); c.fillStyle = '#6A4A2A'; c.fill();
  rrect(c, -310, -210, 620, 420, 8); c.fillStyle = '#20302A'; c.fill();
  for (let i = 0; i < 18; i++) line(c, -300 + i * 36, -200 + (i * 53) % 400, -260 + i * 36, -190 + (i * 53) % 400, 6, 'rgba(255,255,255,0.03)');
  c.font = '400 92px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < SEVENS.length; i++) {
    const k = clamp(shown - i);
    if (k <= 0) continue;
    const col = i * 1, row = 0;
    const px = -220 + (i % 3) * 220, py = -90 + Math.floor(i / 3) * 170;
    c.save(); c.beginPath(); c.rect(px - 100, py - 60, 200 * k, 130); c.clip();
    c.fillStyle = 'rgba(240,240,225,0.92)'; c.fillText(SEVENS[i], px, py);
    c.restore();
    if (i < SEVENS.length - 1 && k >= 1) { c.font = '400 60px Anton'; c.fillStyle = 'rgba(240,240,225,0.5)'; c.fillText('…', px + 110, py + 10); c.font = '400 92px Anton'; }
  }
  if ((o.q || 0) > 0) {   // the question mark where the next number should be
    const k = E.outBack(clamp(o.q), 2.2);
    c.save(); c.translate(220, 80); c.scale(k, k); c.font = '400 130px Anton'; c.fillStyle = '#FF86A6'; c.fillText('?', 0, 0); c.restore();
  }
  c.restore();
}
// the old-film look for the 1964 shots (post.overlay): sepia, flicker, scratches, dust, a gate with round corners
function sepia60(a = 0.85) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'color'; ctx.fillStyle = `rgba(170,128,76,${a})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}
function film60(t, a = 1) {
  const f = Math.floor(t * 30), rng = mulberry32(f * 7 + 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(20,12,4,${0.06 * rng() * a})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) if (rng() < 0.6) { const x = rng() * W; line(ctx, x, 0, x + (rng() - 0.5) * 20, H, 1 + rng() * 2, `rgba(255,245,220,${0.16 * a})`); }
  for (let i = 0; i < 9; i++) circle(ctx, rng() * W, rng() * H, 1 + rng() * 4, `rgba(${rng() < 0.5 ? '20,14,8' : '255,245,225'},${0.4 * a})`);
  ctx.save(); ctx.fillStyle = `rgba(10,6,2,${0.85 * a})`;
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  const gx = 22, gy = 22, gw = W - 44, gh = H - 44, gr = 60;
  ctx.moveTo(gx + gr, gy); ctx.arcTo(gx + gw, gy, gx + gw, gy + gh, gr); ctx.arcTo(gx + gw, gy + gh, gx, gy + gh, gr);
  ctx.arcTo(gx, gy + gh, gx, gy, gr); ctx.arcTo(gx, gy, gx + gw, gy, gr); ctx.closePath();
  ctx.fill('evenodd'); ctx.restore();
}
