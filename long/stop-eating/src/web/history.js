// What Happens If You Stop Eating? (long-form): the two real cases, as old film.
// 1944, Minnesota: a plain dining hall where volunteers eat half rations for six months: a long table, small plates,
// a wall calendar, cookbooks, packs of gum, thought bubbles full of food; a scale whose needle sinks.
// 1965, Dundee: a hospital room where Angus Barbieri lives on water and vitamins for 382 days: a big wall calendar
// that flips its days, the scale, his bottle of vitamins, the boiled egg of his first meal (in an egg cup, a crown).
// Both use the hiker rig for the people (other hair and clothes); the shots put sepia60/film60 over them.
'use strict';

// ---------------------------------------------------------------- shared
function hsSepia(a = 0.85) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'color'; ctx.fillStyle = `rgba(170,128,76,${a})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}
// old film: flicker, scratches, dust and a rounded gate
function hsFilm(t, a = 1) {
  const f = Math.floor(t * 30), rng = mulberry32(f * 7 + 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(20,12,4,${0.07 * rng() * a})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) if (rng() < 0.6) { const x = rng() * W; line(ctx, x, 0, x + (rng() - 0.5) * 20, H, 1 + rng() * 2, `rgba(255,245,220,${0.16 * a})`); }
  for (let i = 0; i < 9; i++) circle(ctx, rng() * W, rng() * H, 1 + rng() * 4, `rgba(${rng() < 0.5 ? '20,14,8' : '255,245,225'},${0.4 * a})`);
  ctx.save(); ctx.fillStyle = `rgba(10,6,2,${0.85 * a})`;
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  const gx = 22, gy = 22, gw = W - 44, gh = H - 44, gr = 60;
  ctx.moveTo(gx + gr, gy); ctx.arcTo(gx + gw, gy, gx + gw, gy + gh, gr); ctx.arcTo(gx + gw, gy + gh, gx, gy + gh, gr);
  ctx.arcTo(gx, gy + gh, gx, gy, gr); ctx.arcTo(gx, gy, gx + gw, gy, gr); ctx.closePath();
  ctx.fill('evenodd'); ctx.restore();
}
// a person from the rig: pal, hair colour, seated or standing; o: {x, y, s, face, pose, sx (width), post(c, r, st)}
function hsPerson(t, pal, o) {
  const st = { x: o.x, y: o.y, s: o.s, face: o.face || FACES.calm, pose: o.pose || POSES.stand, noLegs: !!o.noLegs, seed: o.seed || 3,
    headDX: o.headDX || 0, headDY: o.headDY || 0, headRot: o.headRot || 0 };
  ctx.save();
  if (o.sx && o.sx !== 1) { ctx.translate(o.x, 0); ctx.scale(o.sx, 1); ctx.translate(-o.x, 0); }
  const r = drawCharacter(ctx, st, t, pal);
  if (o.post) { ctx.save(); ctx.translate(st.x, st.y); ctx.scale(st.s, st.s); o.post(ctx, r, st); ctx.restore(); }
  ctx.restore();
  return r;
}
const HS_PALS = [
  Object.assign({}, PAL, { coat: '#8A9A7A', coatSh: '#6A7A5A', coatHi: '#AABA9A', coatDk: '#5A6A4A', strap: '#8A9A7A', strapSh: '#6A7A5A', hair: '#6A4A2A', hairHi: '#8A6A4A', pj: true }),
  Object.assign({}, PAL, { coat: '#7A8AAA', coatSh: '#5A6A8A', coatHi: '#9AAACA', coatDk: '#4A5A7A', strap: '#7A8AAA', strapSh: '#5A6A8A', hair: '#C8A060', hairHi: '#E8C080', pj: true }),
  Object.assign({}, PAL, { coat: '#A88A6A', coatSh: '#88704A', coatHi: '#C8AA8A', coatDk: '#6A5038', strap: '#A88A6A', strapSh: '#88704A', hair: '#1A1210', hairHi: '#3A2A20', pj: true }),
];
// a seated pose with the hands by IK (rig-local targets)
function hsSeat(L, R, lean = 0) {
  const base = { hipY: -34, lean, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  return ikReach(ikReach(base, 'L', L, -1), 'R', R, 1);
}

// ---------------------------------------------------------------- 1944: the dining hall
const MN = { floorY: 900, tableY: 720, frontY: 760 };
function mnRoom(t, o = {}) {
  const c = ctx;
  c.fillStyle = '#C8B89A'; c.fillRect(-400, -300, W + 800, MN.floorY + 300);
  c.fillStyle = '#9A8A6A'; c.fillRect(-400, 560, W + 800, MN.floorY - 560);           // wainscot
  for (let x = -380; x < W + 400; x += 90) line(c, x, 560, x, MN.floorY, 3, 'rgba(60,40,20,0.3)');
  line(c, -400, 560, W + 400, 560, 8, '#7A6A4A');
  c.fillStyle = '#6A5A40'; c.fillRect(-400, MN.floorY, W + 800, 400);
  // two tall windows with daylight
  for (const wx of [260, 1520]) {
    rrect(c, wx - 120, 120, 240, 360, 8); c.fillStyle = '#5A4A30'; c.fill();
    rrect(c, wx - 104, 136, 208, 328, 4); c.fillStyle = '#F4EAD0'; c.fill();
    line(c, wx, 136, wx, 464, 8, '#5A4A30'); line(c, wx - 104, 300, wx + 104, 300, 8, '#5A4A30');
    softDot(gctx, wx, 300, 260, '#FFF0C8', 0.35);
  }
  // a wall calendar: 1944 (its month flips with o.month)
  rrect(c, 820, 140, 280, 300, 8); c.fillStyle = '#F2E8D0'; c.fill();
  c.fillStyle = '#7A3A2A'; c.fillRect(820, 140, 280, 70);
  c.font = '400 58px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F2E8D0'; c.fillText('1944', 960, 177);
  c.font = '900 34px Montserrat'; c.fillStyle = '#3A2A1A'; c.fillText(o.month || 'NOVEMBER', 960, 245);
  for (let i = 0; i < 20; i++) { const cx = 850 + (i % 5) * 52, cy = 290 + Math.floor(i / 5) * 36; rrect(c, cx, cy, 40, 26, 3); c.fillStyle = i < (o.crossed || 0) ? '#B8402A' : 'rgba(60,40,20,0.15)'; c.fill(); }
  // a hanging lamp
  line(c, 960, -300, 960, 60, 4, '#3A2A1A'); c.beginPath(); c.moveTo(900, 100); c.quadraticCurveTo(960, 40, 1020, 100); c.closePath(); c.fillStyle = '#4A3A2A'; c.fill();
}
function mnTable() {
  const c = ctx;
  c.beginPath(); c.moveTo(160, MN.tableY); c.lineTo(1760, MN.tableY); c.lineTo(1800, MN.frontY); c.lineTo(120, MN.frontY); c.closePath(); c.fillStyle = '#E8DCC0'; c.fill();
  c.fillStyle = '#8A6A4A'; c.fillRect(120, MN.frontY, 1680, 36);
  for (const x of [160, 1740]) { c.fillStyle = '#6A4A2A'; c.fillRect(x, MN.frontY + 36, 26, 200); }
}
// a small plate: one boiled potato and a spoon of greens, and a cup of water
function mnPlate(x, y, k = 1) {
  ellipse(ctx, x, y + 4, 86, 18, '#A8A090'); ellipse(ctx, x, y, 82, 16, '#F8F4EA');
  if (k > 0.05) { ellipse(ctx, x - 10, y - 8, 22 * k, 14 * k, '#D8B870'); ellipse(ctx, x + 22, y - 4, 16 * k, 6 * k, '#7A8A4A'); }
  rrect(ctx, x + 96, y - 56, 34, 56, 6); ctx.fillStyle = 'rgba(200,220,230,0.7)'; ctx.fill();
}
// a cookbook held open in front of a face (rig units)
function mnBook(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, -60); c.lineTo(-90, -70); c.lineTo(-90, 60); c.lineTo(0, 70); c.lineTo(90, 60); c.lineTo(90, -70); c.closePath(); c.fillStyle = '#F4EEDC'; c.fill();
  line(c, 0, -60, 0, 70, 3, '#A89A80');
  ellipse(c, -45, -20, 30, 20, '#C8803A'); ellipse(c, -45, -26, 24, 12, '#E8A050');           // a roast on the left page
  for (let i = 0; i < 5; i++) line(c, 16, -40 + i * 18, 74, -40 + i * 18, 4, 'rgba(60,40,20,0.4)');
  c.font = '900 16px Montserrat'; c.textAlign = 'center'; c.fillStyle = '#7A3A2A'; c.fillText('ROAST', -45, 30);
  c.restore();
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, 70); c.lineTo(-96, 64); c.lineTo(-96, 74); c.lineTo(0, 80); c.lineTo(96, 74); c.lineTo(96, 64); c.closePath(); c.fillStyle = '#7A3A2A'; c.fill();
  c.restore();
}
// packs of gum piling up (n of them, the newest pops in with k)
function mnGum(x, y, n, k = 1) {
  for (let i = 0; i < n; i++) {
    const col = i % 3, row = Math.floor(i / 3), kk = i === n - 1 ? E.outBack(clamp(k), 2) : 1;
    if (kk <= 0.01) continue;
    ctx.save(); ctx.translate(x + col * 64 + (row % 2) * 30, y - row * 26); ctx.rotate(0.06 * Math.sin(i * 3)); ctx.scale(kk, kk);
    rrect(ctx, -30, -12, 60, 24, 4); ctx.fillStyle = ['#3FA77A', '#E8C060', '#E86A8A'][i % 3]; ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-30, -4, 60, 8);
    ctx.restore();
  }
}
// a food dream in a thought bubble over (x, y): kind 'pie' | 'steak' | 'cake'
function mnDream(x, y, k, kind, t) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2);
  ctx.save(); ctx.translate(x, y); ctx.scale(kk, kk);
  circle(ctx, -60, 100, 10, '#FFFFFF'); circle(ctx, -40, 70, 16, '#FFFFFF');
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * 0.628; ctx.arc(Math.cos(a) * 90, Math.sin(a) * 56, 36, 0, 7); } ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ellipse(ctx, 0, 0, 100, 64, '#FFFFFF');
  if (kind === 'pie') { ellipse(ctx, 0, 14, 60, 18, '#C88A3A'); ctx.beginPath(); ctx.ellipse(0, 6, 56, 16, 0, Math.PI, 0); ctx.fillStyle = '#E8B060'; ctx.fill(); for (let i = -2; i <= 2; i++) line(ctx, i * 18, -6, i * 18 + 6, 14, 4, '#B8783A'); }
  else if (kind === 'steak') { ellipse(ctx, 0, 6, 62, 36, '#8A3A2A'); ellipse(ctx, -4, 2, 52, 28, '#B85A3A'); line(ctx, -30, -10, 30, 14, 6, '#6A2A1A'); line(ctx, -36, 6, 22, 26, 6, '#6A2A1A'); }
  else { rrect(ctx, -50, -20, 100, 50, 10); ctx.fillStyle = '#F4C8D8'; ctx.fill(); rrect(ctx, -50, -28, 100, 16, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); circle(ctx, 0, -40, 10, '#E8343E'); }
  for (let i = 0; i < 3; i++) { const u = ((t * 0.8 + i / 3) % 1); softDot(ctx, -20 + i * 20, -40 - 50 * u, 10 + 10 * u, '#FFFFFF', 0.4 * (1 - u)); }
  ctx.restore();
}
// the scale, standing: a dial whose needle shows kg (screen or world), label
function hsScale(x, y, s, kg, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -110, -30, 220, 40, 10); ctx.fillStyle = '#5A5A62'; ctx.fill();
  rrect(ctx, -16, -300, 32, 280, 8); ctx.fillStyle = '#6A6A72'; ctx.fill();
  circle(ctx, 0, -330, 92, '#4A4A52'); circle(ctx, 0, -330, 80, '#F4EEDC');
  const lo = o.lo || 0, hi = o.hi || 220;
  for (let i = 0; i <= 10; i++) { const a = -2.4 + 4.8 * i / 10; line(ctx, Math.sin(a) * 64, -330 - Math.cos(a) * 64, Math.sin(a) * 76, -330 - Math.cos(a) * 76, i % 5 ? 3 : 6, '#3A2A1A'); }
  const a = -2.4 + 4.8 * clamp((kg - lo) / (hi - lo));
  line(ctx, 0, -330, Math.sin(a) * 66, -330 - Math.cos(a) * 66, 6, '#C8343E'); circle(ctx, 0, -330, 9, '#3A2A1A');
  ctx.restore();
}

// ---------------------------------------------------------------- 1965: the hospital room in Dundee
function bbRoom(t, o = {}) {
  const c = ctx;
  c.fillStyle = '#D8D0B8'; c.fillRect(-400, -300, W + 800, 1300);
  c.fillStyle = '#A8B898'; c.fillRect(-400, 520, W + 800, 380);
  line(c, -400, 520, W + 400, 520, 10, '#7A8A6A');
  c.fillStyle = '#8A7A6A'; c.fillRect(-400, 900, W + 800, 400);
  for (let x = -380; x < W + 400; x += 120) line(c, x, 900, x - 50, 1300, 3, 'rgba(40,30,20,0.3)');
  // the window
  rrect(c, 1420, 130, 300, 340, 8); c.fillStyle = '#6A6A5A'; c.fill();
  rrect(c, 1436, 146, 268, 308, 4); c.fillStyle = '#EAF0E0'; c.fill();
  line(c, 1570, 146, 1570, 454, 8, '#6A6A5A'); line(c, 1436, 300, 1704, 300, 8, '#6A6A5A');
  softDot(gctx, 1570, 300, 260, '#FFF4D8', 0.3);
  // a bed on the far left
  rrect(c, -40, 660, 420, 160, 14); c.fillStyle = '#F4F0E4'; c.fill(); rrect(c, -40, 600, 60, 300, 8); c.fillStyle = '#9AA4A8'; c.fill();
  rrect(c, 20, 640, 120, 60, 20); c.fillStyle = '#FFFFFF'; c.fill();
}
// the big wall calendar of his fast: DAY n, flipping pages (n = the day shown, flip 0..1 = a page in the air)
function bbCalendar(x, y, s, n, flip, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -170, -200, 340, 400, 14); ctx.fillStyle = '#F8F4E8'; ctx.fill();
  ctx.fillStyle = o.red ? '#C83A3A' : '#3A4A6A'; ctx.fillRect(-170, -200, 340, 90);
  ctx.font = '900 44px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.top || 'DAY', 0, -155);
  ctx.font = '400 190px Anton'; ctx.fillStyle = '#2A2A3A'; ctx.fillText(String(n), 0, 40);
  if (o.icon === 'toilet') {   // a little toilet in the corner of the page
    ctx.save(); ctx.translate(110, 150); ctx.scale(0.9, 0.9);
    rrect(ctx, -26, -50, 52, 40, 6); ctx.fillStyle = '#4A90C8'; ctx.fill(); ellipse(ctx, 0, -6, 34, 14, '#4A90C8'); rrect(ctx, -14, 0, 28, 26, 6); ctx.fill();
    ctx.restore();
  }
  if (flip > 0.01 && flip < 1) {   // the page that tears off and falls
    ctx.save(); ctx.translate(0, -110 + 400 * flip * flip); ctx.rotate(0.9 * flip); ctx.globalAlpha = 1 - flip;
    rrect(ctx, -170, 0, 340, 300, 10); ctx.fillStyle = '#F8F4E8'; ctx.fill();
    ctx.font = '400 120px Anton'; ctx.fillStyle = '#2A2A3A'; ctx.fillText(String(Math.max(1, n - 1)), 0, 150);
    ctx.restore();
  }
  ctx.restore();
}
// a bottle of vitamins (a brown glass bottle with a label)
function bbVitamins(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -30, -90, 60, 90, 10); c.fillStyle = '#7A4A1A'; c.fill(); rrect(c, -20, -110, 40, 24, 5); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, -26, -70, 52, 40, 4); c.fillStyle = '#F4EEDC'; c.fill();
  c.font = '900 14px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3A2A1A'; c.fillText('VITAMINS', 0, -50);
  c.restore();
}
// the boiled egg in an egg cup, with a little crown (k pops it), sparkles
function bbEgg(x, y, s, k, t) {
  if (k <= 0.01) return;
  const kk = E.outBack(clamp(k), 2);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * kk, s * kk);
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-46, 50, 0, 60); ctx.quadraticCurveTo(46, 50, 50, 0); ctx.closePath(); ctx.fillStyle = '#3FA7FF'; ctx.fill();
  rrect(ctx, -34, 56, 68, 22, 8); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -30, 44, 58, 0, 0, 7); ctx.fillStyle = '#FFF6E6'; ctx.fill();
  ellipse(ctx, -14, -50, 10, 18, 'rgba(255,255,255,0.9)', -0.3);
  ctx.beginPath(); ctx.moveTo(-30, -82); ctx.lineTo(-30, -112); ctx.lineTo(-15, -96); ctx.lineTo(0, -118); ctx.lineTo(15, -96); ctx.lineTo(30, -112); ctx.lineTo(30, -82); ctx.closePath(); ctx.fillStyle = '#FFD447'; ctx.fill();
  ctx.restore();
  softDot(gctx, x, y - 40 * s, 160 * s * kk, '#FFE6A0', 0.5 * kk);
  for (let i = 0; i < 5; i++) { const a = t * 0.8 + i * 1.256, r = 110 * s; const sx = x + Math.cos(a) * r, sy = y - 40 * s + Math.sin(a) * r * 0.6; line(ctx, sx - 8, sy, sx + 8, sy, 3, `rgba(255,240,180,${kk})`); line(ctx, sx, sy - 8, sx, sy + 8, 3, `rgba(255,240,180,${kk})`); }
}
