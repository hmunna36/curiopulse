// Yawning Short: the night bus. Interior (a bench of passengers facing camera, night city sliding past the windows,
// streetlight sweeps, swaying straps), the passengers (their own simple rig, so nobody looks like the hero), the
// hero seated among them, and the "yawn wisp" that hops from mouth to face. World coords: 1080x1920 at zoom 1;
// the bench runs along x 0..2200. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

const BUS = { seatY: 1250, floorY: 1336, winTop: 520, winBot: 940, xs: [300, 690, 1080, 1470, 1860], w: 2300 };
// passengers: P1 granny (purple cardigan, bun, glasses), P2 commuter (suit, bald, moustache), P3 teen (headphones)
const PASS = {
  gran: { skin: '#EDBFA0', skinSh: '#C98F70', hair: '#D8D6E4', hairSh: '#A9A6BC', style: 'bun', top: '#9A62C4', topSh: '#6C4092',
    pants: '#3A3452', shoe: '#5A3A2A', extra: 'glasses', mouth: '#5A1522' },
  suit: { skin: '#C99070', skinSh: '#A06A4C', hair: '#3A2A22', hairSh: '#241812', style: 'bald', top: '#44526F', topSh: '#2C3650',
    pants: '#2C3650', shoe: '#1A1A22', extra: 'tie', tie: '#E0504A', mouth: '#4A1018' },
  teen: { skin: '#9A6446', skinSh: '#76492F', hair: '#1E1512', hairSh: '#120C0A', style: 'curly', top: '#2DBA82', topSh: '#1E8259',
    pants: '#2B3A58', shoe: '#F2F2F2', extra: 'headphones', mouth: '#4A1018' },
  nurse: { skin: '#F0C7A6', skinSh: '#CF9B7A', hair: '#B5532E', hairSh: '#8A3A1C', style: 'pony', top: '#5FB8D8', topSh: '#3B8FB0',
    pants: '#3B8FB0', shoe: '#FFFFFF', extra: 'lanyard', mouth: '#5A1522' },
};
let BUS_SKY = null, BUS_STARS = null;

function initBus() {
  // the skyline strip seen through the windows (one wide tile, scrolled per frame)
  BUS_SKY = mkCanvas(2400, 460);
  const x = BUS_SKY.getContext('2d'), rng = mulberry32(41);
  const g = x.createLinearGradient(0, 0, 0, 460);
  g.addColorStop(0, '#0A1030'); g.addColorStop(0.6, '#1B2350'); g.addColorStop(1, '#3A2A4E');
  x.fillStyle = g; x.fillRect(0, 0, 2400, 460);
  for (let layer = 0; layer < 2; layer++) {
    let bx = 0;
    while (bx < 2400) {
      const bw = 70 + rng() * 150, bh = (layer ? 120 : 200) + rng() * (layer ? 140 : 220);
      x.fillStyle = layer ? '#101633' : '#161D40';
      x.fillRect(bx, 460 - bh, bw, bh);
      for (let wy = 460 - bh + 14; wy < 450; wy += 22) for (let wx = bx + 10; wx < bx + bw - 10; wx += 18) {
        if (rng() < (layer ? 0.32 : 0.22)) { x.fillStyle = rng() < 0.7 ? 'rgba(255,205,120,0.85)' : 'rgba(160,210,255,0.8)'; x.fillRect(wx, wy, 8, 11); }
      }
      bx += bw + (layer ? 8 : 30) * rng();
    }
  }
  BUS_STARS = [...Array(26)].map(() => [rng() * 2400, rng() * 160, 0.5 + rng()]);
}

// world x of a scenery layer scrolling past (bus drives right, scenery slides left)
function scrollX(t, speed, period) { return ((t * speed) % period + period) % period; }

// ---------------------------------------------------------------- interior
// o: {light 0..1 (overall), sweep (streetlight sweeps on), dark (night dim for the end), x0, x1 (world span to draw)}
function busInterior(cam, t, o = {}) {
  const c = ctx, x0 = o.x0 === undefined ? -400 : o.x0, x1 = o.x1 === undefined ? BUS.w + 400 : o.x1;
  applyCam(cam);
  // ceiling + walls
  const wall = c.createLinearGradient(0, 0, 0, 1400);
  wall.addColorStop(0, '#141B33'); wall.addColorStop(0.3, '#26324F'); wall.addColorStop(0.7, '#1E2944'); wall.addColorStop(1, '#151C30');
  c.fillStyle = wall; c.fillRect(x0, -600, x1 - x0, 2000);
  // ceiling light strip (emissive)
  rrect(c, x0, 236, x1 - x0, 34, 10); c.fillStyle = '#E8F2FF'; c.fill();
  gctx.fillStyle = 'rgba(190,220,255,0.55)'; gctx.fillRect(x0, 220, x1 - x0, 66);
  c.fillStyle = 'rgba(200,225,255,0.10)'; c.fillRect(x0, 270, x1 - x0, 140);
  // ad panels between the rail and the windows
  const ads = [['NAP', '#FFD447'], ['COFFEE?', '#FF9A3C'], ['BUS 42', '#7FE9FF'], ['SLEEP', '#C8A8FF'], ['ZZZ', '#4DFFB4'], ['NAP', '#FF86A6']];
  for (let i = 0; i < 7; i++) {
    const ax = -40 + i * 390;
    if (ax + 300 < x0 || ax > x1) continue;
    rrect(c, ax, 400, 300, 88, 10); c.fillStyle = '#0E1428'; c.fill();
    const [txt, col] = ads[i % ads.length];
    rrect(c, ax + 8, 408, 284, 72, 8); c.fillStyle = rgba(col, 0.18); c.fill();
    c.font = '400 46px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = rgba(col, 0.85); c.fillText(txt, ax + 150, 446);
  }
  // windows: the night city sliding past
  for (let i = 0; i < 7; i++) {
    const wx = -150 + i * 390, ww = 340;
    if (wx + ww < x0 || wx > x1) continue;
    busWindow(c, wx, BUS.winTop, ww, BUS.winBot - BUS.winTop, t, i);
  }
  // wall below the windows + bench back
  c.fillStyle = '#202A45'; c.fillRect(x0, BUS.winBot, x1 - x0, 80);
  line(c, x0, BUS.winBot + 4, x1, BUS.winBot + 4, 6, '#3A4A6E');
  const seatBack = c.createLinearGradient(0, 1000, 0, BUS.seatY);
  seatBack.addColorStop(0, '#2E4E8E'); seatBack.addColorStop(1, '#1F3566');
  rrect(c, x0, 1006, x1 - x0, BUS.seatY - 1006 + 20, 24); c.fillStyle = seatBack; c.fill();
  // seat fabric pattern
  c.save(); c.globalAlpha = 0.22;
  for (let px = Math.floor(x0 / 46) * 46; px < x1; px += 46) for (let py = 1030; py < BUS.seatY; py += 46) {
    ellipse(c, px + ((py / 46) % 2) * 23, py, 9, 5, '#FFD447');
  }
  c.restore();
  // seat cushion front + floor
  const seat = c.createLinearGradient(0, BUS.seatY, 0, BUS.floorY);
  seat.addColorStop(0, '#3A5EA8'); seat.addColorStop(1, '#1A2C55');
  rrect(c, x0, BUS.seatY - 8, x1 - x0, BUS.floorY - BUS.seatY + 8, 14); c.fillStyle = seat; c.fill();
  const fl = c.createLinearGradient(0, BUS.floorY, 0, 2100);
  fl.addColorStop(0, '#2A2F3E'); fl.addColorStop(1, '#0C0E16');
  c.fillStyle = fl; c.fillRect(x0, BUS.floorY, x1 - x0, 900);
  for (let k = 0; k < 6; k++) line(c, x0, BUS.floorY + 60 + k * 70, x1, BUS.floorY + 60 + k * 70, 4, 'rgba(255,255,255,0.04)');
  line(c, x0, BUS.floorY + 30, x1, BUS.floorY + 30, 8, 'rgba(255,212,71,0.35)');
  // vertical poles between seats (behind the passengers)
  for (let i = 0; i < 6; i++) {
    const px = BUS.xs[0] - 195 + i * 390;
    if (px < x0 - 40 || px > x1 + 40) continue;
    busPole(c, px, 280, BUS.seatY - 30, 16);
  }
  // top rail
  line(c, x0, 360, x1, 360, 14, '#B9C2D6'); line(c, x0, 356, x1, 356, 4, '#FFFFFF');
}

function busPole(c, x, y0, y1, w) {
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#8A6A10'); g.addColorStop(0.35, '#FFE07A'); g.addColorStop(0.6, '#E8B827'); g.addColorStop(1, '#7A5A08');
  c.fillStyle = g; c.fillRect(x - w / 2, y0, w, y1 - y0);
}

function busWindow(c, x, y, w, h, t, i) {
  c.save();
  rrect(c, x, y, w, h, 26); c.clip();
  // skyline (slow), sky
  const off = scrollX(t, 60, 2400);
  c.drawImage(BUS_SKY, (x + off * 0.4 + i * 137) % 2000, 0, w, 460, x, y, w, h);
  for (const [sx, sy, r] of BUS_STARS) { const px = x + ((sx - off * 0.15 + i * 51) % 2400 + 2400) % 2400 * (w / 2400) * 6 % w; circle(c, px, y + sy * 0.5, r, 'rgba(255,255,255,0.5)'); }
  // bokeh lights (medium speed)
  for (let k = 0; k < 9; k++) {
    const per = 900, bx = x + ((k * 173 + i * 61 - scrollX(t, 260, per)) % per + per) % per - 200, by = y + h * (0.45 + 0.4 * hash(k * 3 + i));
    const col = ['#FFB347', '#FF6A6A', '#7FE9FF', '#FFE08A'][k % 4];
    softDot(c, bx, by, 26 + 16 * hash(k + i), col, 0.55);
    softDot(gctx, bx, by, 30, col, 0.35);
  }
  // street lamps (fast): a pole and a bright head whipping past
  const lp = 640, lx = x + w - scrollX(t + i * 0.37, 900, lp) + 120;
  if (lx > x - 60 && lx < x + w + 60) {
    c.fillStyle = '#0A0D1A'; c.fillRect(lx - 7, y + 60, 14, h);
    line(c, lx, y + 64, lx - 46, y + 50, 8, '#0A0D1A');
    ellipse(c, lx - 50, y + 54, 22, 10, '#FFE7B0');
    softDot(gctx, lx - 50, y + 54, 90, '#FFC870', 0.9);
  }
  // reflection + glass sheen
  const sh = c.createLinearGradient(x, y, x + w, y + h);
  sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.7, 'rgba(160,200,255,0.06)');
  c.fillStyle = sh; c.fillRect(x, y, w, h);
  c.restore();
  // frame
  rrect(c, x, y, w, h, 26); c.lineWidth = 14; c.strokeStyle = '#3B4766'; c.stroke();
  rrect(c, x + 6, y + 6, w - 12, h - 12, 22); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.18)'; c.stroke();
}

// hanging hand straps (world coords, in front of everything); sway follows the bus motion
function busStraps(cam, t, x0 = -300, x1 = BUS.w + 300) {
  applyCam(cam);
  for (let i = 0; i < 14; i++) {
    const sx = -120 + i * 195;
    if (sx < x0 || sx > x1) continue;
    const sw = 0.10 * Math.sin(t * 2.1 + i * 0.7) + 0.04 * Math.sin(t * 5.3 + i);
    ctx.save(); ctx.translate(sx, 362); ctx.rotate(sw);
    line(ctx, 0, 0, 0, 92, 12, '#1E2436'); line(ctx, -3, 0, -3, 92, 3, 'rgba(255,255,255,0.15)');
    ctx.beginPath(); ctx.ellipse(0, 128, 30, 36, 0, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = '#E8E2D0'; ctx.stroke();
    ctx.restore();
  }
}

// streetlight sweeps through the windows (screen space, additive): warm bands sliding right -> left
function busSweep(t, a = 1) {
  screenSpace();
  const per = 1.7;
  for (let k = 0; k < 2; k++) {
    const ph = ((t + k * per / 2) % per) / per, x = lerp(W + 500, -500, ph);
    const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
    g.addColorStop(0, 'rgba(255,190,110,0)'); g.addColorStop(0.5, `rgba(255,190,110,${0.10 * a})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
  }
}

// ---------------------------------------------------------------- the passengers
// st: {x, y = seat level, s, yawn 0..1, stretch 0..1 (arms up), cover 0..1 (hand to mouth), blink 0..1, lookX, lookY,
//      tilt (head roll), smile -1..1, brow 0..1 (raised), sleep 0..1 (head droops), shrug 0..1, nod (head bob)}
function drawPassenger(c, L, st, t) {
  const s = st.s || 1, yw = clamp(st.yawn || 0), str = clamp(st.stretch || 0), sl = clamp(st.sleep || 0);
  c.save(); c.translate(st.x, st.y); c.scale(s, s);
  // legs: knees toward camera, shins down to the floor
  for (const sd of [-1, 1]) {
    rrect(c, sd * 34 - 28, -18, 56, 52, 24); c.fillStyle = L.pants; c.fill();
    const kg = c.createLinearGradient(0, 30, 0, BUS.floorY - BUS.seatY + 40);
    kg.addColorStop(0, L.pants); kg.addColorStop(1, mixHex(L.pants, '#000000', 0.35));
    rrect(c, sd * 36 - 22, 22, 44, BUS.floorY - BUS.seatY + 22, 18); c.fillStyle = kg; c.fill();
    ellipse(c, sd * 40, BUS.floorY - BUS.seatY + 46, 34, 16, L.shoe);
    ellipse(c, sd * 34, BUS.floorY - BUS.seatY + 40, 18, 7, 'rgba(255,255,255,0.18)');
  }
  // torso
  c.beginPath();
  c.moveTo(-74, -168); c.quadraticCurveTo(0, -182, 74, -168); c.quadraticCurveTo(86, -100, 66, 4);
  c.quadraticCurveTo(0, 16, -66, 4); c.quadraticCurveTo(-86, -100, -74, -168); c.closePath();
  const tg = c.createLinearGradient(-80, 0, 80, 0);
  tg.addColorStop(0, mixHex(L.top, '#FFFFFF', 0.18)); tg.addColorStop(0.45, L.top); tg.addColorStop(1, L.topSh);
  c.fillStyle = tg; c.fill();
  if (L.extra === 'tie') {
    c.beginPath(); c.moveTo(-26, -170); c.lineTo(0, -120); c.lineTo(26, -170); c.closePath(); c.fillStyle = '#F4F4F8'; c.fill();
    c.beginPath(); c.moveTo(-9, -160); c.lineTo(9, -160); c.lineTo(13, -60); c.lineTo(0, -44); c.lineTo(-13, -60); c.closePath(); c.fillStyle = L.tie; c.fill();
  } else if (L.extra === 'lanyard') {
    c.beginPath(); c.moveTo(-30, -168); c.quadraticCurveTo(0, -90, 30, -168); c.lineWidth = 5; c.strokeStyle = '#2A2F55'; c.stroke();
    rrect(c, -16, -112, 32, 40, 5); c.fillStyle = '#FFFFFF'; c.fill(); rrect(c, -10, -104, 20, 10, 2); c.fillStyle = '#5FB8D8'; c.fill();
  } else if (L.style === 'bun') { // cardigan buttons
    line(c, 0, -170, 0, 6, 4, L.topSh);
    for (let y = -140; y < 0; y += 34) circle(c, 9, y, 5, '#F2E6FF');
  } else { // hoodie strings
    line(c, -16, -166, -18, -120, 4, '#E8F8F0'); line(c, 16, -166, 18, -120, 4, '#E8F8F0');
    rrect(c, -46, -60, 92, 36, 14); c.fillStyle = L.topSh; c.fill();
  }
  // neck
  rrect(c, -16, -196, 32, 34, 10); c.fillStyle = L.skinSh; c.fill();
  // arms: lap -> stretched overhead (str), or the right hand to the mouth (cover)
  const cov = clamp(st.cover || 0), shr = clamp(st.shrug || 0);
  const headY = -252 + 18 * sl + (st.nod || 0) * 8;
  for (const sd of [-1, 1]) {
    const sh = [sd * 70, -160];
    let el = [sd * (84 + 40 * shr), -70 - 20 * shr], wr = [sd * (36 + 70 * shr), -12 - 70 * shr];
    const elUp = [sd * 128, -268], wrUp = [sd * 70, -372];
    el = [lerp(el[0], elUp[0], E.inOutSine(str)), lerp(el[1], elUp[1], E.inOutSine(str))];
    wr = [lerp(wr[0], wrUp[0], E.inOutSine(str)), lerp(wr[1], wrUp[1], E.inOutSine(str))];
    if (sd === 1 && cov > 0) {
      el = [lerp(el[0], 92, cov), lerp(el[1], -128, cov)];
      wr = [lerp(wr[0], 14, cov), lerp(wr[1], headY + 34 + 30 * yw, cov)];
    }
    line(c, sh[0], sh[1], el[0], el[1], 36, L.topSh); line(c, sh[0] - sd * 3, sh[1], el[0] - sd * 3, el[1], 28, L.top);
    line(c, el[0], el[1], wr[0], wr[1], 32, L.topSh); line(c, el[0] - sd * 3, el[1], wr[0] - sd * 3, wr[1], 24, L.top);
    circle(c, wr[0], wr[1], 19, L.skinSh); circle(c, wr[0] - 2, wr[1] - 2, 16, L.skin);
  }
  // head (the jaw stretches with the yawn)
  c.save(); c.translate(st.headDX || 0, headY); c.rotate((st.tilt || 0) + 0.25 * sl);
  const jd = 26 * yw;
  if (L.extra === 'headphones') { c.beginPath(); c.arc(0, -6, 66, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 10; c.strokeStyle = '#1A1F2E'; c.stroke(); }
  if (L.style === 'curly') for (let i = 0; i < 13; i++) { const a = Math.PI * (0.95 + i * 0.085); circle(c, Math.cos(a) * 58, -8 + Math.sin(a) * 60, 26, L.hair); }
  if (L.style === 'pony') { ellipse(c, 52, 8, 22, 46, L.hair, -0.4); }
  for (const sd of [-1, 1]) { ellipse(c, sd * 54, 4, 11, 16, L.skinSh); }
  c.beginPath(); c.ellipse(0, 0, 56, 62, 0, Math.PI, Math.PI * 2); c.ellipse(0, 0, 56 - jd * 0.15, 62 + jd, 0, 0, Math.PI);
  const hg = c.createRadialGradient(-20, -24, 6, 0, jd * 0.4, 72 + jd * 0.5);
  hg.addColorStop(0, mixHex(L.skin, '#FFFFFF', 0.25)); hg.addColorStop(0.5, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  // hair on top
  if (L.style === 'bun') {
    c.beginPath(); c.moveTo(-58, 4); c.quadraticCurveTo(-64, -60, 0, -66); c.quadraticCurveTo(64, -60, 58, 4); c.quadraticCurveTo(40, -34, 0, -36); c.quadraticCurveTo(-40, -34, -58, 4); c.closePath();
    c.fillStyle = L.hair; c.fill(); circle(c, 0, -74, 26, L.hair); circle(c, -6, -80, 9, mixHex(L.hair, '#FFFFFF', 0.4));
    line(c, -30, -50, 10, -58, 4, L.hairSh);
  } else if (L.style === 'bald') {
    ellipse(c, -16, -40, 18, 9, 'rgba(255,255,255,0.35)', -0.3);
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 52, -6, 10, 26, 0, 0, Math.PI * 2); c.fillStyle = L.hair; c.fill(); }
  } else if (L.style === 'curly') {
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.105); circle(c, Math.cos(a) * 46, -10 + Math.sin(a) * 50, 22, L.hair); }
  } else if (L.style === 'pony') {
    c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(-62, -64, 4, -66); c.quadraticCurveTo(64, -58, 58, 2); c.quadraticCurveTo(20, -44, -20, -30); c.quadraticCurveTo(-46, -20, -58, 6); c.closePath();
    c.fillStyle = L.hair; c.fill();
  }
  if (L.extra === 'headphones') for (const sd of [-1, 1]) { rrect(c, sd * 60 - 14, -22, 28, 46, 12); c.fillStyle = '#FF5A6E'; c.fill(); }
  // face
  const bl = clamp(st.blink || 0), sq = yw > 0.35 ? 1 : 0, br = (st.brow || 0) + 0.8 * yw;
  for (const sd of [-1, 1]) {
    const ex = sd * 20, ey = -6 + 2 * sl;
    if (sq) { // squeezed shut: > <
      c.beginPath(); c.moveTo(ex - sd * 9, ey - 6); c.lineTo(ex + sd * 7, ey); c.lineTo(ex - sd * 9, ey + 6);
      c.lineWidth = 4; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    } else if (bl > 0.9 || sl > 0.6) {
      c.beginPath(); c.moveTo(ex - 9, ey); c.quadraticCurveTo(ex, ey + 6, ex + 9, ey); c.lineWidth = 4; c.strokeStyle = '#3A1E16'; c.stroke();
    } else {
      ellipse(c, ex, ey, 9, 11 * (1 - bl), '#FFFFFF');
      circle(c, ex + (st.lookX || 0) * 4, ey + (st.lookY || 0) * 4, 5.5, '#15132A');
      circle(c, ex + (st.lookX || 0) * 4 - 1.5, ey + (st.lookY || 0) * 4 - 2, 1.8, '#FFFFFF');
    }
    line(c, sd * 10, -28 - br * 8, sd * 30, -26 - br * 6 + sd * 0, 5, L.style === 'bald' ? L.hair : L.hairSh);
  }
  if (L.extra === 'glasses') for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 20, -6, 15, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = '#3A2A52'; c.stroke(); }
  if (L.extra === 'glasses') line(c, -5, -6, 5, -6, 3, '#3A2A52');
  ellipse(c, 0, 12, 7, 5, 'rgba(160,90,60,0.5)');
  if (L.style === 'bald') { c.beginPath(); c.moveTo(-26, 26); c.quadraticCurveTo(0, 14, 26, 26); c.quadraticCurveTo(0, 22, -26, 26); c.lineWidth = 9; c.strokeStyle = L.hair; c.stroke(); }
  // mouth
  if (yw > 0.05) {
    const my = 32 + jd * 0.62, rx = 10 + 9 * yw, ry = 4 + 22 * yw;
    ellipse(c, 0, my, rx, ry, L.mouth);
    c.save(); c.beginPath(); c.ellipse(0, my, rx, ry, 0, 0, Math.PI * 2); c.clip();
    ellipse(c, 0, my + ry - 3, rx * 0.75, 7 + 6 * yw, '#E0616C'); c.restore();
  } else if ((st.mouthO || 0) > 0.05) { // surprised "o"
    ellipse(c, 0, 34, 7 + 4 * st.mouthO, 8 + 8 * st.mouthO, L.mouth);
  } else {
    const sm = st.smile || 0;
    c.beginPath(); c.moveTo(-12 - 4 * Math.max(0, sm), 32 - 3 * Math.max(0, sm)); c.quadraticCurveTo(0, 32 + 12 * sm, 12 + 4 * Math.max(0, sm), 32 - 3 * Math.max(0, sm));
    if (sm > 0.6) { c.closePath(); c.fillStyle = L.mouth; c.fill(); } // a big open grin
    c.lineWidth = 4.5; c.strokeStyle = L.mouth; c.lineCap = 'round'; c.stroke();
  }
  c.restore();
  c.restore();
}

// mouth position of a passenger in world coords (for the wisp)
function passMouth(st) { const s = st.s || 1; return [st.x, st.y + (-252 + 32 + 16 * (st.yawn || 0)) * s]; }
function passEyes(st) { const s = st.s || 1; return [st.x, st.y + (-258) * s]; }

// ---------------------------------------------------------------- the hero, seated on the bench
// a seated pose for the front view: arms on the lap; k stretches the arms overhead (the big yawn)
function heroSeatPose(stretch, shrug = 0, point = 0) {
  const p = JSON.parse(JSON.stringify(POSES.sit));
  // lap: upper arm down, forearm folded in toward the lap; stretch: straight up and out; shrug: palms up, out
  const st = E.inOutSine(clamp(stretch));
  // halfway the elbows go out and the forearms up (a stretch, not a T-pose)
  const bend = 1.2 * Math.sin(Math.PI * st);
  p.armL = { a: lerp(0.22, 2.55, st) + 0.5 * shrug, b: lerp(-0.62, 0.35, st) + bend + 1.75 * shrug };
  p.armR = { a: lerp(0.22, 2.55, st) + 0.5 * shrug, b: lerp(-0.62, 0.35, st) + bend + 1.75 * shrug };
  if (point > 0) { // right hand up in front of the chest, forearm toward us: the I-want-YOU point (hand drawn by pointAtYou)
    const k = E.inOutSine(clamp(point));
    p.armR = { a: lerp(p.armR.a, 0.5, k), b: lerp(p.armR.b, -2.95, k) };
  }
  p.hand = 'open';
  return p;
}
// seated legs in the hero's palette (knees to camera, shins down, red shoes); local coords, pelvis at (0, 0)
function heroSeatLegs(c, x, y, s, pal = PAL) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 38 - 30, -14, 60, 54, 24); c.fillStyle = pal.pants; c.fill();
    const g = c.createLinearGradient(0, 30, 0, BUS.floorY - BUS.seatY + 40);
    g.addColorStop(0, pal.pants); g.addColorStop(1, pal.pantsSh);
    rrect(c, sd * 40 - 24, 26, 48, (BUS.floorY - BUS.seatY) / s + 18, 20); c.fillStyle = g; c.fill();
    const fy = (BUS.floorY - BUS.seatY) / s + 44;
    ellipse(c, sd * 44, fy, 38, 18, pal.shoe); rrect(c, sd * 44 - 38, fy + 6, 76, 12, 6); c.fillStyle = pal.sole; c.fill();
  }
  c.restore();
}
// st: {x, y = seat level, s, face, stretch, shrug, headRot, headDX}
function heroOnBench(c, st, t, pal = PAL) {
  heroSeatLegs(c, st.x, st.y, st.s, pal);
  const pose = heroSeatPose(st.stretch || 0, st.shrug || 0, st.point || 0);
  return drawCharacter(c, Object.assign({}, st, { y: st.y + 34 * st.s, pose, noLegs: true }), t, pal);
}
function heroMouth(st) { return [st.x + (st.headDX || 0) * st.s, st.y + (34 - 34 - 248 + 40) * st.s]; }

// ---------------------------------------------------------------- the yawn wisp
// a glowing ribbon that leaves a mouth and drifts to the next face. k = 0..1 travel; a = alpha
function yawnWisp(A, B, k, t, a = 1, lift = 220) {
  if (k <= 0 || a <= 0.01) return;
  const P = (u) => {
    const mx = (A[0] + B[0]) / 2, my = Math.min(A[1], B[1]) - lift;
    const x = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * mx + u * u * B[0];
    const y = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * my + u * u * B[1];
    return [x + 14 * Math.sin(u * 18 + t * 6) * (1 - u), y + 10 * Math.cos(u * 14 + t * 5)];
  };
  const head = E.inOutSine(clamp(k)), tail = Math.max(0, head - 0.35);
  const pts = [];
  for (let i = 0; i <= 24; i++) pts.push(P(lerp(tail, head, i / 24)));
  for (const [cc, w, col] of [[gctx, 30, 'rgba(170,140,255,0.55)'], [ctx, 12, 'rgba(210,190,255,0.75)'], [ctx, 4, 'rgba(255,255,255,0.9)']]) {
    cc.save(); cc.globalAlpha = a;
    for (let i = 1; i < pts.length; i++) {
      const f = i / pts.length;
      line(cc, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], w * f, col);
    }
    cc.restore();
  }
  const hp = pts[pts.length - 1];
  softDot(gctx, hp[0], hp[1], 36, '#B9A0FF', 0.6 * a);
  circle(ctx, hp[0], hp[1], 9, rgba('#FFFFFF', a));
  // sparkles shed along the way
  for (let i = 0; i < 6; i++) {
    const u = clamp(head - i * 0.06), q = P(u), tw = 0.5 + 0.5 * Math.sin(t * 20 + i * 2);
    circle(ctx, q[0] + 18 * Math.sin(i * 3), q[1] + 16 * Math.cos(i * 5), 3 + 2 * tw, rgba('#E9DDFF', 0.8 * a * (1 - i / 6)));
  }
  // arrival puff
  if (k >= 1) sparkBurst(B[0], B[1], 0, 0, a);
}
function sparkBurst(x, y, t0, t, a = 1) {
  for (let i = 0; i < 8; i++) {
    const an = i / 8 * Math.PI * 2, r = 70 + 10 * Math.sin(i * 7);
    line(ctx, x + Math.cos(an) * r, y + Math.sin(an) * r, x + Math.cos(an) * (r + 22), y + Math.sin(an) * (r + 22), 5, rgba('#E9DDFF', 0.8 * a));
  }
  softDot(gctx, x, y - 70, 40, '#C8A8FF', 0.5 * a);
}

// ---------------------------------------------------------------- the bus from outside (name shot)
// a city bus driving right at world (x, y = road level); lit windows with passenger silhouettes that yawn in turn
function busExterior(x, y, t, yawnK = [], s = 1) {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  const L = 1100, Hb = 360;
  // body
  rrect(c, -L / 2, -Hb - 40, L, Hb, 40);
  const g = c.createLinearGradient(0, -Hb - 40, 0, -40);
  g.addColorStop(0, '#FFD447'); g.addColorStop(0.55, '#F2B320'); g.addColorStop(1, '#B9800E');
  c.fillStyle = g; c.fill();
  rrect(c, -L / 2, -110, L, 30, 8); c.fillStyle = '#1C6E8C'; c.fill(); // stripe
  // windows (lit)
  for (let i = 0; i < 5; i++) {
    const wx = -L / 2 + 70 + i * 196, wy = -Hb - 10, ww = 170, wh = 160;
    rrect(c, wx, wy, ww, wh, 16); c.fillStyle = '#FFE9B8'; c.fill();
    rrect(gctx, wx, wy, ww, wh, 16); gctx.fillStyle = 'rgba(255,220,150,0.45)'; gctx.fill();
    // silhouette head + shoulders
    const k = clamp(yawnK[i] || 0), hx = wx + ww / 2, hy = wy + 80;
    c.fillStyle = '#2A2240';
    c.beginPath(); c.ellipse(hx, hy + 92, 62, 50, 0, Math.PI, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(hx, hy, 34, 38 + 10 * k, 0, 0, Math.PI * 2); c.fill();
    if (k > 0.05) { // open mouth: a lit oval in the silhouette, arms up
      ellipse(c, hx, hy + 14 + 6 * k, 7 + 5 * k, 3 + 13 * k, '#FFE9B8');
      line(c, hx - 50, hy + 60, hx - 44 - 10 * k, hy + 60 - 90 * k, 18, '#2A2240');
      line(c, hx + 50, hy + 60, hx + 44 + 10 * k, hy + 60 - 90 * k, 18, '#2A2240');
    }
  }
  // door, headlights, wheels
  rrect(c, L / 2 - 110, -Hb + 20, 70, 300, 10); c.fillStyle = '#7A5A10'; c.fill();
  ellipse(c, L / 2 - 14, -70, 18, 14, '#FFFBEA'); softDot(gctx, L / 2 + 40, -70, 140, '#FFF2C0', 0.9);
  ellipse(c, -L / 2 + 10, -70, 12, 14, '#FF4D5E'); softDot(gctx, -L / 2, -70, 60, '#FF4D5E', 0.8);
  for (const wx of [-L / 2 + 190, L / 2 - 230]) {
    circle(c, wx, -30, 64, '#121420'); circle(c, wx, -30, 30, '#8A90A6');
    const a = -t * 9;
    for (let k = 0; k < 5; k++) line(c, wx, -30, wx + Math.cos(a + k * 1.256) * 26, -30 + Math.sin(a + k * 1.256) * 26, 5, '#4A5066');
  }
  c.restore();
}
