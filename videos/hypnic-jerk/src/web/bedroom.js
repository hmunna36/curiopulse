// Bedroom at night: overhead (lying) and front (sitting up) views, bed, duvet, nightstand.
'use strict';

const PJ = Object.assign({}, PAL, {
  coat: '#5E7FDC', coatSh: '#3F5CB8', coatHi: '#93ACF2', coatDk: '#34489A',
  strap: '#5E7FDC', strapSh: '#4F6DC8',
  pants: '#4E6CCB', pantsSh: '#3A55AA', sock: '#F2B892', pj: true,
});
const DUVET = { base: '#D9A640', shade: '#A9772A', hi: '#F2CF7C', fold: '#EBD9B4' };
const NIGHT = { floor: '#161C36', floor2: '#11162C', wall: '#141A3A', wall2: '#1D2452', moon: '#CFE0FF' };

// ---------------------------------------------------------------- overhead
// body placement for the overhead shots: head on the pillow near the top of the bed
const LY = { x: 540, y: 1360, s: 1.9 };

function drawFloorTop() {
  const g = ctx.createLinearGradient(0, -400, 0, 2400);
  g.addColorStop(0, NIGHT.floor); g.addColorStop(1, NIGHT.floor2);
  ctx.fillStyle = g; ctx.fillRect(-900, -900, 2900, 3800);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
  for (let x = -900; x < 2000; x += 120) { ctx.beginPath(); ctx.moveTo(x, -900); ctx.lineTo(x, 2900); ctx.stroke(); }
  for (let i = 0; i < 60; i++) {
    const x = -900 + (i % 24) * 120, y = -900 + hash(i) * 3600;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y); ctx.stroke();
  }
  // rug
  rrect(ctx, -60, 1560, 1200, 520, 40); ctx.fillStyle = '#26204A'; ctx.fill();
  rrect(ctx, -30, 1590, 1140, 460, 30); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,200,120,0.18)'; ctx.stroke();
}

function nightstandTop(t, o = {}) {
  ctx.save(); ctx.translate(960, 420);
  rrect(ctx, -140, -170, 280, 330, 18); ctx.fillStyle = '#3A2C3E'; ctx.fill();
  rrect(ctx, -128, -158, 256, 306, 12); ctx.fillStyle = '#48374C'; ctx.fill();
  // lamp shade seen from above
  const on = o.lamp || 0;
  circle(ctx, -20, -70, 86, mixHex('#CBB89A', '#FFE3A8', on));
  circle(ctx, -20, -70, 30, mixHex('#6E5C48', '#FFF4D6', on));
  if (on > 0) softDot(gctx, -20 + 960, -70 + 420, 260, '#FFD08A', 0.6 * on);
  // clock
  rrect(ctx, 20, 40, 100, 56, 10); ctx.fillStyle = '#101018'; ctx.fill();
  ctx.font = '400 38px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FF5A6E';
  ctx.fillText(o.clock || '11:47', 70, 70);
  softDot(gctx, 960 + 70, 420 + 70, 50, '#FF5A6E', 0.5);
  // glass of water: ripples when the bed jolts
  circle(ctx, -80, 80, 38, 'rgba(200,220,255,0.22)');
  circle(ctx, -80, 80, 30, 'rgba(140,170,255,0.30)');
  const rp = o.ripple || 0;
  for (let i = 0; i < 3; i++) {
    const k = (rp * 1.6 + i / 3) % 1;
    if (rp > 0 && rp < 1.4) { ctx.strokeStyle = `rgba(230,240,255,${0.6 * (1 - k)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-80, 80, 4 + k * 26, 0, 7); ctx.stroke(); }
  }
  ellipse(ctx, -90, 70, 8, 5, 'rgba(255,255,255,0.7)');
  ctx.restore();
}

function bedTop(t, o = {}) {
  // frame + headboard
  rrect(ctx, 160, 200, 760, 1560, 30); ctx.fillStyle = '#3B2B40'; ctx.fill();
  rrect(ctx, 150, 170, 780, 90, 26); ctx.fillStyle = '#4A3650'; ctx.fill();
  // mattress / fitted sheet
  rrect(ctx, 185, 250, 710, 1480, 26);
  const sg = ctx.createLinearGradient(185, 0, 895, 0);
  sg.addColorStop(0, '#9FA9CE'); sg.addColorStop(0.5, '#C4CCEA'); sg.addColorStop(1, '#8C96BC');
  ctx.fillStyle = sg; ctx.fill();
  // pillow (squished on impact)
  const sq = o.squish || 0;
  ctx.save(); ctx.translate(540, 440); ctx.scale(1 + 0.03 * sq, 1 - 0.05 * sq);
  rrect(ctx, -230, -120, 460, 240, 70);
  const pg = ctx.createRadialGradient(-60, -50, 20, 0, 0, 280);
  pg.addColorStop(0, '#F4F6FF'); pg.addColorStop(1, '#B8C0E0');
  ctx.fillStyle = pg; ctx.fill();
  ellipse(ctx, 0, 10, 150, 70, 'rgba(120,130,170,0.25)');
  ctx.restore();
}

// duvet covering the body from the chest down; legs make ridges; `lift` jolts it
function duvetTop(st, r, t, o = {}) {
  const lift = o.lift || 0, kick = o.kick || 0;
  const top = 770 - 14 * lift;
  ctx.save();
  ctx.translate(0, -10 * lift);
  ctx.beginPath();
  ctx.moveTo(165, top + 20);
  ctx.bezierCurveTo(300, top - 10 - 20 * lift, 780, top - 10 + 16 * lift, 915, top + 20);
  ctx.lineTo(935, 1760); ctx.quadraticCurveTo(540, 1800, 145, 1760); ctx.closePath();
  const g = ctx.createLinearGradient(160, 0, 920, 0);
  g.addColorStop(0, DUVET.shade); g.addColorStop(0.25, DUVET.base); g.addColorStop(0.6, DUVET.hi); g.addColorStop(1, DUVET.shade);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  // leg ridges follow the (hidden) legs
  for (const k of ['L', 'R']) {
    const h = toWorld(st, r['hip' + k]), kn = toWorld(st, r['kn' + k]), an = toWorld(st, r['an' + k]);
    line(ctx, h[0], h[1], kn[0], kn[1], 150, 'rgba(255,236,190,0.18)');
    line(ctx, kn[0], kn[1], an[0], an[1], 130, 'rgba(255,236,190,0.18)');
    ellipse(ctx, an[0], an[1] + 40, 80, 70, 'rgba(255,240,200,0.22)');
  }
  const mid = toWorld(st, [0, r.P[1] + 40]);
  line(ctx, mid[0], mid[1] + 60, mid[0], 1720, 34, 'rgba(90,50,10,0.22)');
  // quilting lines + wrinkles that appear on the jolt
  ctx.strokeStyle = 'rgba(120,80,20,0.25)'; ctx.lineWidth = 4;
  for (let y = top + 180; y < 1760; y += 190) { ctx.beginPath(); ctx.moveTo(160, y); ctx.quadraticCurveTo(540, y + 30, 930, y); ctx.stroke(); }
  if (kick > 0.02) {
    const rng = mulberry32(Math.floor(t * 30));
    ctx.strokeStyle = `rgba(90,50,10,${0.4 * kick})`; ctx.lineWidth = 6;
    for (let i = 0; i < 7; i++) {
      const x = 260 + rng() * 560, y = 980 + rng() * 700;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y - 30, x + 90 + rng() * 60, y + 10); ctx.stroke();
    }
  }
  ctx.restore();
  // turned-down sheet band at the top edge
  ctx.beginPath(); ctx.moveTo(165, top + 20); ctx.bezierCurveTo(300, top - 10 - 20 * lift, 780, top - 10 + 16 * lift, 915, top + 20);
  ctx.lineTo(915, top + 80); ctx.bezierCurveTo(780, top + 50, 300, top + 50, 165, top + 80); ctx.closePath();
  ctx.fillStyle = DUVET.fold; ctx.fill();
  ctx.restore();
}

// arms resting on top of the duvet (drawn after it)
function armsOnTop(c, st, r, pal) {
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    capsuleShaded(c, r['sh' + k], r['el' + k], 42, pal.coat, pal.coatSh, pal.coatHi, pal);
    capsuleShaded(c, r['el' + k], r['wr' + k], 38, pal.coat, pal.coatSh, pal.coatHi, pal);
    const wr = r['wr' + k], d = r['armDir' + k];
    drawHand(c, wr, d, st.pose.hand === 'spread' ? 'spread' : 'open', pal, s, 0);
  }
  c.restore();
}

function moonlightTop(a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath(); ctx.moveTo(-200, 120); ctx.lineTo(640, 120); ctx.lineTo(1120, 1300); ctx.lineTo(280, 1300); ctx.closePath();
  const g = ctx.createLinearGradient(0, 120, 400, 1300);
  g.addColorStop(0, `rgba(150,175,255,${0.20 * a})`); g.addColorStop(1, `rgba(150,175,255,${0.04 * a})`);
  ctx.fillStyle = g; ctx.fill();
  // window-frame shadows, soft-edged (a hard bar reads as an object in close-ups)
  ctx.globalCompositeOperation = 'multiply';
  ctx.filter = 'blur(9px)';
  ctx.strokeStyle = `rgba(20,20,40,${0.2 * a})`; ctx.lineWidth = 34;
  ctx.beginPath(); ctx.moveTo(210, 120); ctx.lineTo(700, 1300); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-60, 650); ctx.lineTo(860, 650); ctx.stroke();
  ctx.filter = 'none';
  ctx.restore();
}

// pajama star print, drawn inside the character layer
function pajamaStars(lc, rr, st) {
  lc.save(); lc.translate(st.x, st.y); lc.scale(st.s, st.s);
  lc.translate(rr.P[0], rr.P[1]); lc.rotate(rr.lean);
  lc.globalCompositeOperation = 'source-atop';
  const rng = mulberry32(9);
  for (let i = 0; i < 16; i++) {
    const x = -70 + rng() * 140, y = -150 + rng() * 150, s = 5 + rng() * 3;
    lc.fillStyle = 'rgba(255,240,190,0.75)';
    lc.beginPath();
    for (let j = 0; j < 10; j++) { const a = (j / 10) * Math.PI * 2 - Math.PI / 2, rr2 = j % 2 ? s * 0.45 : s; lc.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
    lc.closePath(); lc.fill();
  }
  lc.restore();
}

// full overhead bedroom with the sleeper. o: {pose, face, lift, kick, squish, ripple, lamp, headDY, xray}
function bedroomTop(cam, t, o = {}) {
  applyCam(cam);
  drawFloorTop();
  bedTop(t, o);
  nightstandTop(t, o);
  const st = { x: LY.x, y: LY.y, s: LY.s, pose: o.pose || POSES.sleep, face: o.face || FACES.sleepy, frizz: o.frizz || 0, soot: 0, seed: 3,
    headDY: o.headDY || 0, headRot: o.headRot || 0 };
  const r = rig(st.pose);
  applyCam(cam);
  ellipse(ctx, 540, 980, 260, 560, 'rgba(10,10,30,0.18)');
  charLayer(cam, st, t, { ambient: 0.1, post: (lc, rr) => pajamaStars(lc, rr, st) , pal: PJ });
  applyCam(cam);
  duvetTop(st, r, t, o);
  armsOnTop(ctx, st, r, tintPal(PJ, 0.1));
  moonlightTop(1 - 0.6 * (o.lamp || 0));
  if (o.lamp > 0) { screenSpace(); ctx.fillStyle = `rgba(255,190,110,${0.12 * o.lamp})`; ctx.fillRect(0, 0, W, H); applyCam(cam); }
  return { st, r };
}

// ---------------------------------------------------------------- front view (sitting up in bed)
function bedroomFront(cam, t, o = {}) {
  screenSpace();
  const wg = ctx.createLinearGradient(0, 0, 0, H);
  wg.addColorStop(0, NIGHT.wall); wg.addColorStop(1, NIGHT.wall2);
  ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  // wallpaper stripes
  for (let x = -400; x < 1500; x += 90) { ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(x, -600, 36, 2000); }
  // window with moon
  ctx.save(); rrect(ctx, 90, 250, 380, 520, 20); ctx.clip();
  const sky = ctx.createLinearGradient(0, 250, 0, 770);
  sky.addColorStop(0, '#0B1030'); sky.addColorStop(1, '#27306A'); ctx.fillStyle = sky; ctx.fillRect(90, 250, 380, 520);
  for (let i = 0; i < 26; i++) circle(ctx, 100 + hash(i) * 360, 260 + hash(i + 50) * 500, 1.5 + hash(i + 9) * 2, `rgba(255,255,255,${0.4 + 0.5 * Math.abs(vnoise(t * 2 + i, 3))})`);
  circle(ctx, 360, 380, 58, NIGHT.moon); circle(ctx, 380, 370, 50, '#E8F0FF');
  softDot(gctx, 360, 380, 200, '#BFD4FF', 0.7);
  ctx.restore();
  rrect(ctx, 90, 250, 380, 520, 20); ctx.lineWidth = 18; ctx.strokeStyle = '#2C2440'; ctx.stroke();
  line(ctx, 280, 250, 280, 770, 12, '#2C2440'); line(ctx, 90, 510, 470, 510, 12, '#2C2440');
  // curtains, breathing slightly
  for (const [x, dir] of [[60, 1], [500, -1]]) {
    ctx.beginPath(); ctx.moveTo(x - 40 * dir, 200);
    const sway = 12 * Math.sin(t * 0.9 + x);
    ctx.quadraticCurveTo(x + dir * (60 + sway), 520, x + dir * 20, 860); ctx.lineTo(x - dir * 60, 860); ctx.lineTo(x - dir * 90, 200); ctx.closePath();
    ctx.fillStyle = '#3C2E62'; ctx.fill();
  }
  // moonbeam across the room
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  ctx.beginPath(); ctx.moveTo(90, 250); ctx.lineTo(470, 250); ctx.lineTo(1100, 1400); ctx.lineTo(300, 1400); ctx.closePath();
  ctx.fillStyle = 'rgba(140,165,255,0.07)'; ctx.fill(); ctx.restore();
  // headboard + pillow
  rrect(ctx, 210, 790, 660, 460, 60); ctx.fillStyle = '#3B2B40'; ctx.fill();
  rrect(ctx, 240, 820, 600, 400, 44); ctx.fillStyle = '#4A3650'; ctx.fill();
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) circle(ctx, 360 + i * 180, 900 + j * 150, 9, '#2E2233');
  rrect(ctx, 300, 960, 480, 200, 70); ctx.fillStyle = '#D4DAF2'; ctx.fill();
  // nightstand + lamp + clock
  rrect(ctx, 870, 1060, 200, 280, 14); ctx.fillStyle = '#3A2C3E'; ctx.fill();
  rrect(ctx, 882, 1100, 176, 80, 8); ctx.fillStyle = '#48374C'; ctx.fill();
  const on = o.lamp || 0;
  line(ctx, 970, 1060, 970, 960, 10, '#6E5C48');
  ctx.beginPath(); ctx.moveTo(900, 960); ctx.lineTo(1040, 960); ctx.lineTo(1010, 860); ctx.lineTo(930, 860); ctx.closePath();
  ctx.fillStyle = mixHex('#8A7A62', '#FFE3A8', on); ctx.fill();
  if (on > 0) { softDot(ctx, 970, 930, 620, '#FFB866', 0.28 * on); softDot(gctx, 970, 930, 300, '#FFD08A', 0.8 * on); }
  rrect(ctx, 890, 1010, 72, 44, 8); ctx.fillStyle = '#101018'; ctx.fill();
  ctx.font = '400 28px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FF5A6E'; ctx.fillText(o.clock || '11:47', 926, 1033);
  softDot(gctx, 926, 1033, 40, '#FF5A6E', 0.5);
  // floor
  ctx.fillStyle = '#10152C'; ctx.fillRect(-400, 1330, 1900, 900);
  return on;
}
// duvet over the lap (front view); `cover` pulls it up into a mound over the head
function duvetFront(t, o = {}) {
  const lift = o.lift || 0, cov = o.cover || 0;
  const topY = (x) => {
    const u = (x - 540) / 290;
    return 1105 + 40 * Math.pow(Math.abs((x - 540) / 390), 2) - cov * 360 * Math.exp(-u * u * 1.6) - 18 * (o.kick || 0) * Math.exp(-Math.pow((x - 420) / 90, 2));
  };
  ctx.save(); ctx.translate(0, -12 * lift);
  ctx.beginPath(); ctx.moveTo(150, 1345);
  for (let x = 150; x <= 930; x += 15) ctx.lineTo(x, topY(x));
  ctx.lineTo(930, 1345); ctx.closePath();
  const g = ctx.createLinearGradient(150, 0, 930, 0);
  g.addColorStop(0, DUVET.shade); g.addColorStop(0.35, DUVET.base); g.addColorStop(0.65, DUVET.hi); g.addColorStop(1, DUVET.shade);
  ctx.fillStyle = g; ctx.fill();
  // turned-down sheet edge along the top
  ctx.beginPath();
  for (let x = 150; x <= 930; x += 15) ctx.lineTo(x, topY(x));
  for (let x = 930; x >= 150; x -= 15) ctx.lineTo(x, topY(x) + 34 * (1 - cov * 0.7));
  ctx.closePath(); ctx.fillStyle = DUVET.fold; ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,20,0.3)'; ctx.lineWidth = 5;
  for (const x of [330, 540, 750]) { ctx.beginPath(); ctx.moveTo(x, topY(x) + 50); ctx.quadraticCurveTo(x + 20, 1250, x - 10, 1335); ctx.stroke(); }
  ctx.restore();
}

// palette pre-darkened the way charLayer's ambient wash darkens the body (for parts drawn outside it)
function tintPal(pal, a, col = '#10143C') {
  const o = {};
  for (const k in pal) o[k] = typeof pal[k] === 'string' && pal[k][0] === '#' ? mixHex(pal[k], col, a) : pal[k];
  return o;
}
