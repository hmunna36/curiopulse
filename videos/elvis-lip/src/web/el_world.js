// elvis-lip (24 Nov 2026): the place. A photo booth in a roadside diner at night.
//   elBoothBack(cam, t, o)      inside the booth, seen from its camera: a gold sequin curtain behind him, the booth's side
//                               panels at the frame's edges, the warm bulb ring of the camera (screen space, with parallax)
//   elDiner(cam, t, o)          outside: the diner wall (pink, a chrome rail, black-and-white tiles), the EAT neon, the
//                               window with the night and the moon, the jukebox, the chequered floor, the photo wall
//   elBooth(t, o)               the booth itself (world): the PHOTOS sign and its bulbs, the mint body, the red curtain
//                               (o.open 0..1), the dark inside with the sequins, the stool, the strip slot and its strip
//   elBoothFront(t, o)          the parts of the booth that pass IN FRONT of him (the curtain's near fold, the frame)
//   elWall(t, o)                the photo wall: 100 booth photos, o.count of them flipped (90 squint, red; 10 open, green),
//                               his own photo pinned on top (o.pin 0..1)
//   elDog(c, x, y, s, t, o)     the diner's bulldog, sitting, front view (sad-eyebrows' dog, a bulldog palette): o.snarl 0..1
//                               curls ONE lip (screen-right) up off a big fang with BOTH eyes wide open; o.squint 0..1 one eye
//   elScroll(x0, y0, k, t, o)   the name tag's scroll unrolling down (screen space), five words on it
// World layout (outside): floor y 1500; the booth x 250-650 (its opening x 300-600, y 640-1440); him on the stool, head
// near (452, 1010); the photo wall x 690-1050, y 600-1060; the dog at (845, 1500).
'use strict';

const EL = { floorY: 1500, bx0: 250, bx1: 650, by0: 470, ox0: 300, ox1: 600, oy0: 640, oy1: 1440, wallX0: 690, wallX1: 1050, wallY0: 610, wallY1: 1060, dogX: 845, dogS: 0.74 };
const EL_PAL = Object.assign({}, PAL);   // the hiker as always (the yellow coat): only the place is new
const EL_BULL = { fur: '#E8C49A', furSh: '#B98E62', white: '#FFF6EA', ear: '#8A5A3A', nose: '#2A1A14', collar: '#7A2CF0', tag: '#FFD447', tongue: '#FF7A90' };

// ---------------------------------------------------------------- inside the booth (screen space)
function initElWorld() {
  // the sequin curtain, painted once: gold and pink scales in rows, with folds
  const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 2200;
  const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 1400, 0);
  for (let i = 0; i <= 14; i++) { const u = i / 14; g.addColorStop(u, i % 2 ? '#7A1F5C' : '#B02E7A'); }
  c.fillStyle = g; c.fillRect(0, 0, 1400, 2200);
  const rng = mulberry32(77);
  for (let y = 0; y < 2200; y += 22) for (let x = (y / 22) % 2 ? 11 : 0; x < 1400; x += 22) {
    const fold = 0.5 + 0.5 * Math.sin(x / 100 * Math.PI);
    const col = rng() < 0.5 ? '#FFC94A' : '#FF8FC8';
    c.globalAlpha = 0.35 + 0.45 * fold;
    c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fillStyle = col; c.fill();
    c.globalAlpha = 0.5 * fold; c.beginPath(); c.arc(x - 2.5, y - 2.5, 3, 0, Math.PI * 2); c.fillStyle = '#FFFFFF'; c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 14; i++) {   // fold shadows
    const x = i * 100 + 50, gg = c.createLinearGradient(x - 50, 0, x + 50, 0);
    gg.addColorStop(0, 'rgba(30,0,30,0)'); gg.addColorStop(0.5, 'rgba(30,0,30,0.38)'); gg.addColorStop(1, 'rgba(30,0,30,0)');
    c.fillStyle = gg; c.fillRect(x - 50, 0, 100, 2200);
  }
  EL.sequin = cv;
  // the 100 booth photos of the wall: who they are (seeded), which 10 kept the eye open, in which order they flip
  const r2 = mulberry32(2024), skins = ['#F2B892', '#E0A07A', '#C98A62', '#8E5A3C', '#F6CDB0', '#B97A55'], hairs = ['#2A1B14', '#5A3A22', '#C98A3A', '#1A1A22', '#8A8A92', '#D9542F'];
  EL.faces = [];
  for (let i = 0; i < 100; i++) EL.faces.push({ skin: skins[Math.floor(r2() * skins.length)], hair: hairs[Math.floor(r2() * hairs.length)], bg: ['#7FE9FF', '#FFD447', '#C8A8FF', '#4DFFB4', '#FF9A3C'][Math.floor(r2() * 5)], tilt: (r2() - 0.5) * 0.12 });
  const order = [...Array(100).keys()];
  for (let i = 99; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  EL.order = order;                                   // flip order across the board
  EL.open = new Set(order.slice(90));                 // the last ten to flip are the ten who kept the eye open
}

function elBoothBack(cam, t, o = {}) {
  screenSpace();
  ctx.fillStyle = '#3A0E2E'; ctx.fillRect(0, 0, W, H);
  // the curtain, a little parallax with the camera
  const px = ((cam.x || 540) - 452) * 0.9 * (cam.zoom || 1) * 0.12, py = ((cam.y || 1000) - 1010) * 0.12 * (cam.zoom || 1);
  const sc = 1.0 + 0.04 * ((cam.zoom || 4.6) - 4.6);
  ctx.save(); ctx.translate(540 - px, 960 - py); ctx.scale(sc, sc); ctx.drawImage(EL.sequin, -700, -1100); ctx.restore();
  // the sequins twinkle (glow layer), on a loop-safe clock
  const rng = mulberry32(5);
  for (let i = 0; i < 46; i++) {
    const x = rng() * W, y = 300 + rng() * 1500, ph = rng() * 6.28, w = loopW(2.2 + rng() * 2.5);
    const k = Math.pow(0.5 + 0.5 * Math.sin(t * w + ph), 8);
    if (k > 0.05) { softDot(gctx, x - px * 0.5, y - py * 0.5, 26 * k, rng() < 0.5 ? '#FFE27A' : '#FFB0E0', 0.9 * k); circle(ctx, x - px * 0.5, y - py * 0.5, 3 * k + 1, 'rgba(255,250,230,0.9)'); }
  }
  // the booth's side panels at the frame's edges (mint, a chrome strip), so it reads as a booth, not a stage
  if (!o.noPanels) {
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? 0 : W - 70;
      ctx.fillStyle = '#1F8F84'; ctx.fillRect(x0, 0, 70, H);
      ctx.fillStyle = '#DDE6EE'; ctx.fillRect(s < 0 ? 60 : W - 70, 0, 10, H);
    }
  }
  // the warm bulb ring of the camera: light from the front, low on the frame (glow only)
  for (let i = 0; i < 7; i++) softDot(gctx, 120 + i * 140, H + 40, 220, '#FFC77A', 0.35);
}

// ---------------------------------------------------------------- outside: the diner
function elDiner(cam, t, o = {}) {
  applyCam(cam);
  // the wall
  ctx.fillStyle = '#F07AA0'; ctx.fillRect(-600, -400, 2400, 1700);
  const g = ctx.createLinearGradient(0, 300, 0, 1300); g.addColorStop(0, '#E0608E'); g.addColorStop(1, '#F590B2');
  ctx.fillStyle = g; ctx.fillRect(-600, 300, 2400, 1000);
  // the window with the night outside (far left) and a moon
  rrect(ctx, -420, 560, 560, 460, 18); ctx.fillStyle = '#14234F'; ctx.fill();
  softDot(ctx, -150, 690, 70, '#FFF2C8', 1); circle(ctx, -150, 690, 34, '#FFF4D6');
  for (let i = 0; i < 12; i++) circle(ctx, -400 + ((i * 97) % 520), 600 + ((i * 53) % 380), 2.4, 'rgba(255,255,255,0.8)');
  rrect(ctx, -420, 560, 560, 460, 18); ctx.lineWidth = 16; ctx.strokeStyle = '#DDE6EE'; ctx.stroke();
  line(ctx, -140, 560, -140, 1020, 10, '#DDE6EE');
  // the chrome rail and the black-and-white tiles below it
  ctx.fillStyle = '#DDE6EE'; ctx.fillRect(-600, 1205, 2400, 22); ctx.fillStyle = '#9AA6B6'; ctx.fillRect(-600, 1222, 2400, 6);
  for (let x = -600; x < 1800; x += 50) for (let y = 1228; y < EL.floorY; y += 50) { ctx.fillStyle = ((x + y) / 50) % 2 ? '#1A1A26' : '#F4F0E6'; ctx.fillRect(x, y, 50, 50); }
  // the floor: chequered, in perspective (rows getting taller toward the camera)
  ctx.fillStyle = '#24212E'; ctx.fillRect(-600, EL.floorY, 2400, 900);
  let y = EL.floorY, h = 26;
  for (let row = 0; row < 14; row++) {
    for (let x = -600, i = 0; x < 1800; x += 80, i++) { if ((i + row) % 2) continue; ctx.fillStyle = '#E9E4D8'; ctx.fillRect(x - row * 6, y, 80 + row * 1.2, h); }
    y += h; h *= 1.18;
  }
  // the EAT neon (upper left of the wall) and its glow
  elNeon(ctx, -320, 420, t);
  // the jukebox (far right): a rainbow arch that glows
  elJukebox(1180, EL.floorY, t);
  if (!o.noWall) elWall(t, o.wall || {});
}
function elNeon(c, x, y, t) {
  const flick = 0.85 + 0.15 * Math.sin(t * loopW(23)) * Math.sin(t * loopW(7));
  c.save(); c.font = '900 130px Anton'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.lineWidth = 14; c.strokeStyle = 'rgba(40,200,255,0.35)'; c.strokeText('EAT', x, y);
  c.fillStyle = '#B8F6FF'; c.fillText('EAT', x, y); c.restore();
  gctx.save(); gctx.font = '900 130px Anton'; gctx.textAlign = 'left'; gctx.textBaseline = 'middle';
  gctx.fillStyle = `rgba(60,220,255,${0.9 * flick})`; gctx.fillText('EAT', x, y); gctx.restore();
  softDot(gctx, x + 110, y, 260, '#3FD8FF', 0.35 * flick);
}
function elJukebox(x, y, t) {
  const w = 300, h = 560;
  rrect(ctx, x - w / 2, y - h, w, h, 120); ctx.fillStyle = '#5A2A1A'; ctx.fill();
  const cols = ['#FF5A6E', '#FF9A3C', '#FFD447', '#4DFFB4', '#7FE9FF', '#C8A8FF'];
  cols.forEach((col, i) => {
    const r = 128 - i * 14;
    ctx.beginPath(); ctx.arc(x, y - h + 140, r, Math.PI, 0); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke();
    gctx.beginPath(); gctx.arc(x, y - h + 140, r, Math.PI, 0); gctx.lineWidth = 14; gctx.strokeStyle = rgba(col, 0.55 + 0.25 * Math.sin(t * loopW(3) + i)); gctx.stroke();
  });
  rrect(ctx, x - 100, y - h + 200, 200, 150, 14); ctx.fillStyle = '#2A1630'; ctx.fill();
  for (let i = 0; i < 5; i++) line(ctx, x - 80, y - h + 225 + i * 25, x + 80, y - h + 225 + i * 25, 6, i % 2 ? '#FFD447' : '#FF86A6');
  rrect(ctx, x - 120, y - 170, 240, 150, 20); ctx.fillStyle = '#C8A06A'; ctx.fill();
  for (let i = 0; i < 6; i++) line(ctx, x - 100 + i * 40, y - 160, x - 100 + i * 40, y - 30, 8, '#8A6A3A');
}

// ---------------------------------------------------------------- the booth (world)
function elBooth(t, o = {}) {
  const { bx0, bx1, by0, ox0, ox1, oy0, oy1 } = EL, open = clamp(o.open === undefined ? 1 : o.open);
  // the body
  rrect(ctx, bx0, by0, bx1 - bx0, EL.floorY - by0, 18); ctx.fillStyle = '#27B5A6'; ctx.fill();
  ctx.fillStyle = '#1C8F84'; ctx.fillRect(bx1 - 40, by0 + 18, 40, EL.floorY - by0 - 18);
  // the sign: PHOTOS in yellow on red, ringed with bulbs
  rrect(ctx, bx0 + 20, by0 + 18, bx1 - bx0 - 40, 120, 14); ctx.fillStyle = '#C8203E'; ctx.fill();
  ctx.save(); ctx.font = '900 84px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFE36A'; ctx.fillText('PHOTOS', (bx0 + bx1) / 2, by0 + 80); ctx.restore();
  gctx.save(); gctx.font = '900 84px Anton'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillStyle = 'rgba(255,220,90,0.75)'; gctx.fillText('PHOTOS', (bx0 + bx1) / 2, by0 + 80); gctx.restore();
  for (let i = 0; i < 12; i++) {
    const u = i / 11, x = lerp(bx0 + 32, bx1 - 32, u), on = 0.6 + 0.4 * Math.sin(t * loopW(6) + i * 1.3);
    for (const yy of [by0 + 26, by0 + 130]) { circle(ctx, x, yy, 7, '#FFF4C8'); softDot(gctx, x, yy, 22, '#FFD27A', 0.7 * on); }
  }
  // the opening: dark inside, the sequin curtain at the back
  rrect(ctx, ox0, oy0, ox1 - ox0, oy1 - oy0, 10); ctx.fillStyle = '#2A0F2A'; ctx.fill();
  ctx.save(); rrect(ctx, ox0 + 10, oy0 + 10, ox1 - ox0 - 20, oy1 - oy0 - 20, 8); ctx.clip();
  ctx.globalAlpha = 0.75; ctx.drawImage(EL.sequin, 0, 0, 700, 1100, ox0, oy0, (ox1 - ox0) * 1.2, (oy1 - oy0) * 1.0); ctx.globalAlpha = 1; ctx.restore();
  // the stool (chrome post, red seat)
  line(ctx, (ox0 + ox1) / 2 + 10, 1330, (ox0 + ox1) / 2 + 10, oy1 - 10, 16, '#C9D2DC');
  // the strip slot on the body's right, the strip hanging out of it (o.strip: how many photos it shows, 0..3)
  rrect(ctx, bx1 - 34, 1060, 26, 60, 6); ctx.fillStyle = '#DDE6EE'; ctx.fill(); line(ctx, bx1 - 30, 1090, bx1 - 12, 1090, 4, '#2A2A36');
  if (o.strip) elStrip(ctx, bx1 - 21, 1096, 0.42, o.strip, t, 0.05);
  o.openK = open;
}
// the curtain and the booth's front frame: drawn AFTER him, so they pass in front of his legs and side
function elBoothFront(t, o = {}) {
  const { ox0, ox1, oy0, oy1 } = EL, open = clamp(o.open === undefined ? 1 : o.open);
  // the rod
  line(ctx, ox0 - 8, oy0 + 6, ox1 + 8, oy0 + 6, 10, '#DDE6EE');
  // the curtain: bunched to the left when open, across the opening when closed; deep red velvet with folds
  const w = lerp(ox1 - ox0, 120, open), sway = 6 * Math.sin(t * loopW(1.7));
  const folds = 6;
  for (let i = 0; i < folds; i++) {
    const x0 = ox0 + (w / folds) * i, x1 = ox0 + (w / folds) * (i + 1);
    ctx.beginPath(); ctx.moveTo(x0, oy0 + 6); ctx.lineTo(x1, oy0 + 6);
    ctx.quadraticCurveTo(x1 + sway * 0.5, (oy0 + oy1) / 2, x1 + sway, oy1 - 40); ctx.lineTo(x0 + sway, oy1 - 40);
    ctx.quadraticCurveTo(x0 + sway * 0.5, (oy0 + oy1) / 2, x0, oy0 + 6); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#B3203A' : '#D2304C'; ctx.fill();
  }
  // the frame's chrome edge
  rrect(ctx, ox0, oy0, ox1 - ox0, oy1 - oy0, 10); ctx.lineWidth = 12; ctx.strokeStyle = '#DDE6EE'; ctx.stroke();
}

// a photo strip (any canvas, its top centre at x, y, scale s): three frames; n = how many are taken (they fill in order:
// 1 = him squinting, 2 = him squinting harder, 3 = the bulldog's perfect snarl)
function elStrip(c, x, y, s, n, t, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -60, 0, 120, 430, 6); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#C8C8D0'; c.stroke();
  for (let i = 0; i < 3; i++) {
    const y0 = 12 + i * 138;
    rrect(c, -50, y0, 100, 126, 4); c.fillStyle = '#5A4A60'; c.fill();
    if (n > i) elMiniPhoto(c, 0, y0 + 63, 1.0, i === 2 ? 'dog' : (i === 1 ? 'him2' : 'him'));
  }
  c.restore();
}
// a tiny booth photo (head units of about 100 px): him squinting, or the dog's perfect snarl, or one of the wall's faces
function elMiniPhoto(c, x, y, s, who, face) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = who === 'dog' ? '#FFD447' : (face ? face.bg : '#C8A8FF'); c.fillRect(-48, -60, 96, 120);
  if (who === 'dog') {
    ellipse(c, 0, 8, 40, 36, EL_BULL.fur); ellipse(c, 0, 26, 26, 18, EL_BULL.white);
    for (const sd of [-1, 1]) { circle(c, sd * 16, -2, 8, '#FFFFFF'); circle(c, sd * 16, -2, 5, '#2A1A10'); }
    ellipse(c, 0, 14, 9, 6, EL_BULL.nose);
    c.beginPath(); c.moveTo(-12, 30); c.quadraticCurveTo(0, 34, 8, 28); c.lineTo(14, 22); c.lineWidth = 3; c.strokeStyle = '#2A1A10'; c.stroke();
    c.beginPath(); c.moveTo(9, 26); c.lineTo(14, 26); c.lineTo(11.5, 34); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
  } else {
    const sk = face ? face.skin : PAL.skin, hr = face ? face.hair : PAL.hair, open = face ? face.open : false;
    ellipse(c, 0, 8, 34, 38, sk);
    c.beginPath(); c.ellipse(0, -10, 36, 26, 0, Math.PI, Math.PI * 2); c.fillStyle = hr; c.fill();
    circle(c, -13, 2, 5.5, '#FFFFFF'); circle(c, -13, 2, 3, '#15132A');
    if (open) { circle(c, 13, 2, 5.5, '#FFFFFF'); circle(c, 13, 2, 3, '#15132A'); }
    else { line(c, 7, 3, 19, 1 + (who === 'him2' ? 2 : 0), 3, '#3A2018'); if (who === 'him2') line(c, -19, 2, -7, 3, 3, '#3A2018'); }
    c.beginPath(); c.moveTo(-10, 26); c.lineTo(-2, 26); c.quadraticCurveTo(6, 18, 12, 20); c.lineWidth = 3; c.strokeStyle = '#7A1A28'; c.stroke();
    c.beginPath(); c.moveTo(4, 21); c.lineTo(9, 21); c.lineTo(6.5, 26); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- the photo wall
// o: {count 0..100 (how many have flipped: the first 90 squint, red; the last 10 green), pin 0..1 (his photo slapped on top)}
function elWall(t, o = {}) {
  const { wallX0: x0, wallX1: x1, wallY0: y0, wallY1: y1 } = EL;
  rrect(ctx, x0 - 14, y0 - 14, x1 - x0 + 28, y1 - y0 + 28, 14); ctx.fillStyle = '#8A5A30'; ctx.fill();
  rrect(ctx, x0, y0, x1 - x0, y1 - y0, 8); ctx.fillStyle = '#C89A62'; ctx.fill();
  const cw = (x1 - x0 - 20) / 10, ch = (y1 - y0 - 20) / 10, cnt = o.count || 0;
  for (let i = 0; i < 100; i++) {
    const cx = x0 + 10 + cw * (i % 10) + cw / 2, cy = y0 + 10 + ch * Math.floor(i / 10) + ch / 2, F = EL.faces[i];
    const rank = EL.order.indexOf(i), flipped = rank < cnt, isOpen = EL.open.has(i);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(F.tilt);
    rrect(ctx, -cw * 0.44, -ch * 0.44, cw * 0.88, ch * 0.88, 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    elMiniPhoto(ctx, 0, 0, Math.min(cw / 112, ch / 136), 'face', Object.assign({ open: isOpen }, F));
    if (flipped) {
      ctx.lineWidth = 4; ctx.strokeStyle = isOpen ? '#2FE08A' : '#FF3A55';
      rrect(ctx, -cw * 0.46, -ch * 0.46, cw * 0.92, ch * 0.92, 3); ctx.stroke();
      if (!isOpen) { ctx.fillStyle = 'rgba(255,40,70,0.28)'; ctx.fill(); }
    }
    ctx.restore();
  }
  // his own photo, slapped on top (the escalate beat)
  const pk = o.pin || 0;
  if (pk > 0.01) {
    const s = 0.95 * (1 + 0.6 * (1 - clamp(pk))), a = 0.14 - 0.25 * (1 - clamp(pk));
    ctx.save(); ctx.translate(x1 - 70, y0 + 60); ctx.rotate(a); ctx.scale(s, s);
    rrect(ctx, -58, -70, 116, 140, 4); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    elMiniPhoto(ctx, 0, -4, 1.05, 'him2');
    circle(ctx, 0, -64, 7, '#FF3A55');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the bulldog (sitting, front view)
// o: {look [x, y], tilt, ears, blink, snarl 0..1 (screen-right lip up, a big fang), wide 0..1 (both eyes wide open, brows up),
//     squint 0..1 (its screen-right eye narrows: judging), glint 0..1 (a sparkle on the fang), headDX, headDY}
function elDogPt(x, y, s, o, lx, ly) {
  const hx = x + (o.headDX || 0) * s, hy = y + (-232 + (o.headDY || 0)) * s, a = o.tilt || 0, cs = Math.cos(a), sn = Math.sin(a);
  return [hx + (lx * cs - ly * sn) * s, hy + (lx * sn + ly * cs) * s];
}
function elDog(c, x, y, s, t, o = {}) {
  const F = EL_BULL;
  actor(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    // body: a stocky barrel, front legs apart
    ellipse(c, -64, -40, 60, 46, F.furSh); ellipse(c, 64, -40, 60, 46, F.furSh);
    c.beginPath(); c.moveTo(-78, -4); c.quadraticCurveTo(-96, -150, 0, -178); c.quadraticCurveTo(96, -150, 78, -4); c.closePath(); c.fillStyle = F.fur; c.fill();
    c.beginPath(); c.moveTo(-40, -20); c.quadraticCurveTo(-48, -120, 0, -140); c.quadraticCurveTo(48, -120, 40, -20); c.closePath(); c.fillStyle = F.white; c.fill();
    for (const sd of [-1, 1]) { rrect(c, sd * 36 - 19, -96, 38, 96, 16); c.fillStyle = F.fur; c.fill(); ellipse(c, sd * 36, -4, 25, 13, F.white); }
    c.restore();
  });
  actor(() => {
    c.save(); c.translate(x + (o.headDX || 0) * s, y + (-232 + (o.headDY || 0)) * s); c.scale(s, s); c.rotate(o.tilt || 0);
    rrect(c, -56, 44, 112, 18, 9); c.fillStyle = F.collar; c.fill();
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 20 - 5, 62); c.lineTo(i * 20 + 5, 62); c.lineTo(i * 20, 72); c.closePath(); c.fillStyle = '#DDE6EE'; c.fill(); }
    const ears = o.ears || 0;
    for (const sd of [-1, 1]) {   // little rose ears
      c.save(); c.translate(sd * 62, -50); c.rotate(sd * (0.5 - 0.35 * ears));
      c.beginPath(); c.ellipse(sd * 6, 0, 24, 18, sd * 0.4, 0, Math.PI * 2); c.fillStyle = F.ear; c.fill(); c.restore();
    }
    // the wide flat head with jowls
    c.beginPath(); c.ellipse(0, 0, 92, 78, 0, 0, Math.PI * 2); c.fillStyle = F.fur; c.fill();
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 46, 40, 44, 34, sd * 0.2, 0, Math.PI * 2); c.fillStyle = F.white; c.fill(); }
    c.restore();
  });
  paint(() => {
    c.save(); c.translate(x + (o.headDX || 0) * s, y + (-232 + (o.headDY || 0)) * s); c.scale(s, s); c.rotate(o.tilt || 0);
    const lk = o.look || [0, 0], wide = clamp(o.wide || 0), sq = clamp(o.squint || 0), sn = clamp(o.snarl || 0);
    // wrinkles on the brow
    for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(-22 + i * 4, -50 - i * 9); c.quadraticCurveTo(0, -55 - i * 9, 22 - i * 4, -50 - i * 9); c.lineWidth = 2.6; c.strokeStyle = rgba(F.furSh, 0.55); c.stroke(); }
    for (const sd of [-1, 1]) {
      const ex = sd * 34, ey = -14, R = 12 + 5 * wide;
      if ((o.blink || 0) > 0.9) { c.beginPath(); c.moveTo(ex - 12, ey); c.quadraticCurveTo(ex, ey + 7, ex + 12, ey); c.lineWidth = 5; c.strokeStyle = '#2A1A10'; c.lineCap = 'round'; c.stroke(); }
      else {
        circle(c, ex, ey, R + 3, '#FFFFFF');
        circle(c, ex + lk[0] * 3, ey + lk[1] * 3, R * 0.62, '#2A1A10');
        circle(c, ex + lk[0] * 3 - 3, ey + lk[1] * 3 - 4, 3.4, '#FFFFFF');
        if (sd > 0 && sq > 0.02) { c.fillStyle = F.fur; c.fillRect(ex - R - 4, ey - R - 4, 2 * R + 8, (R + 4) * sq * 0.9 + 2); line(c, ex - R, ey - R - 2 + (R + 4) * sq * 0.9, ex + R, ey - R - 2 + (R + 4) * sq * 0.9, 3, F.furSh); }
      }
      // brows: up when wide
      line(c, sd * 20, -33 + 2 * wide + (sd > 0 ? 6 * sq : 0), sd * 46, -38 - 5 * wide + (sd > 0 ? 3 * sq : 0), 6, F.furSh);
    }
    // the nose, the flews, the snarl: the screen-right flew lifts off a big fang, the rest stays put
    ellipse(c, 0, 14, 22, 13, F.nose); ellipse(c, -6, 9, 7, 3, 'rgba(255,255,255,0.5)');
    line(c, 0, 26, 0, 36, 3.5, F.nose);
    c.beginPath(); c.moveTo(-34, 44); c.quadraticCurveTo(-16, 54, 0, 38); c.lineWidth = 4; c.strokeStyle = F.nose; c.lineCap = 'round'; c.stroke();
    const ly = 44 - 22 * sn, lx = 34;
    if (sn > 0.05) {   // the flew lifts off the gum and a big fang (bigger than life, so it reads on a phone)
      c.beginPath(); c.moveTo(0, 38); c.quadraticCurveTo(16, 40 - 26 * sn, lx, ly); c.lineTo(lx + 5, 52); c.quadraticCurveTo(16, 56, 0, 41); c.closePath();
      c.fillStyle = '#4A1220'; c.fill();
      c.fillStyle = EL_GUM; c.beginPath(); c.moveTo(4, 39); c.quadraticCurveTo(16, 41 - 26 * sn, lx - 1, ly + 1); c.lineTo(lx - 1, ly + 7); c.quadraticCurveTo(16, 46 - 22 * sn, 4, 43); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(13, 44 - 19 * sn); c.lineTo(25, 43 - 21 * sn); c.lineTo(20, 43 - 21 * sn + 12 + 10 * sn); c.closePath();
      c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(120,110,130,0.7)'; c.stroke();
    }
    c.beginPath(); c.moveTo(0, 38); c.quadraticCurveTo(18, 54 - 26 * sn, lx, 44 - 20 * sn); c.lineWidth = 4.5; c.strokeStyle = F.nose; c.stroke();
    c.restore();
  });
  const gl = clamp(o.glint || 0), sn = clamp(o.snarl || 0);
  if (gl > 0.02 && sn > 0.3) {   // the fang's twinkle (glow layer + a four-point star)
    const p = elDogPt(x, y, s, o, 20, 50 - 18 * sn);
    softDot(gctx, p[0], p[1], 16 * s * 2, '#FFFFFF', 0.55 * gl);
    ctx.save(); ctx.translate(p[0] + 40 * s, p[1] - 34 * s); ctx.rotate(0.3);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3 * s * 2, 0); ctx.lineTo(0, 15 * s * 2 * gl); ctx.lineTo(-3 * s * 2, 0); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill(); }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the name scroll (screen space)
// unrolls down from (x0, y0): k 0..1 how far; the five words of the muscle's name stacked on it; fall 0..1 the roll drops away
const EL_NAME = ['LEVATOR', 'LABII', 'SUPERIORIS', 'ALAEQUE', 'NASI'];
function elScroll(x0, y0, k, t, o = {}) {
  if (k <= 0.005) return;
  screenSpace();
  const w = 380, cx = x0, yEnd = y0 + 40 + 1180 * E.outCubic(clamp(k)), fall = clamp(o.fall || 0), yRoll = yEnd + 900 * fall * fall;
  const bottom = Math.min(H + 40, yRoll);
  paint(() => {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(cx - w / 2 + 30, y0); ctx.lineTo(cx + w / 2 - 30, y0);
    ctx.lineTo(cx + w / 2, y0 + 60); ctx.lineTo(cx + w / 2, bottom); ctx.lineTo(cx - w / 2, bottom); ctx.lineTo(cx - w / 2, y0 + 60); ctx.closePath();
    ctx.fillStyle = '#FFF3D6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#C9A46A'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    EL_NAME.forEach((wd, i) => {
      const y = y0 + 120 + i * 100;
      if (y > yEnd - 30) return;
      const size = wd.length > 8 ? 70 : 86;
      ctx.font = `400 ${size}px Anton`; ctx.lineWidth = 8; ctx.strokeStyle = '#FFF3D6'; ctx.strokeText(wd, cx, y);
      ctx.fillStyle = '#B3203A'; ctx.fillText(wd, cx, y);
    });
    // the roll at the bottom
    if (yRoll < H + 80) { ctx.beginPath(); ctx.ellipse(cx, yRoll, w / 2 + 12, 34, 0, 0, Math.PI * 2); ctx.fillStyle = '#F2DDB0'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#B58A4A'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, yRoll, w / 2 - 10, 16, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(180,140,80,0.6)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  });
}
