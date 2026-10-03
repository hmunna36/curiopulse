// The plane cabin at dusk (ears-pop): a row of seats along the cabin wall, sunset sliding past the windows (the horizon
// stays level while the cabin pitches with the camera's `rot`), the hero in seat 12A in his yellow coat with a travel
// pillow, a fold-out tray with a bag of chips (it puffs up as the cabin pressure drops) and a water bottle (it crumples
// on the way down), the passengers (their own simple rig, so nobody looks like the hero) and the baby in 12B.
// World coords = screen coords at zoom 1; the hero's seat is at x = 540. Nothing here is timed: scenes.js passes it in.
'use strict';

const CAB = { seatY: 1250, hx: 540, hs: 1.12, floorY: 1482, winY: 640, sx: -900, sy: -400, sw: 3300, sh: 2700,
  seats: [-260, 140, 540, 940, 1340, 1740], wins: [-460, -60, 340, 740, 1140, 1540, 1940], trayY: 1178 };
// the other passengers (the bus passengers' rig, with longer legs): the suit by the window, the mum in 12B, gran in 12C
const PAX = {
  suit: { skin: '#C99070', skinSh: '#A06A4C', hair: '#3A2A22', hairSh: '#241812', style: 'bald', top: '#44526F', topSh: '#2C3650',
    pants: '#2C3650', shoe: '#1A1A22', extra: 'tie', tie: '#E0504A', mouth: '#4A1018' },
  mum: { skin: '#E9B894', skinSh: '#C48C68', hair: '#6A3420', hairSh: '#47200F', style: 'pony', top: '#E3A52C', topSh: '#B37712',
    pants: '#3D3358', shoe: '#F2F2F2', extra: 'none', mouth: '#5A1522' },
  gran: { skin: '#EDBFA0', skinSh: '#C98F70', hair: '#D8D6E4', hairSh: '#A9A6BC', style: 'bun', top: '#9A62C4', topSh: '#6C4092',
    pants: '#3A3452', shoe: '#5A3A2A', extra: 'glasses', mouth: '#5A1522' },
};
let CAB_STATIC = null, CAB_CLOUDS = null, CAB_LIGHTS = null;

function initCabin() {
  const cv = mkCanvas(CAB.sw, CAB.sh), c = cv.getContext('2d'), rng = mulberry32(64);
  c.translate(-CAB.sx, -CAB.sy);
  const X0 = CAB.sx, X1 = CAB.sx + CAB.sw, Y0 = CAB.sy, Y1 = CAB.sy + CAB.sh;
  // the cabin wall
  const g = c.createLinearGradient(0, 300, 0, 1500);
  g.addColorStop(0, '#4E5B92'); g.addColorStop(0.4, '#3E4A80'); g.addColorStop(1, '#232B55');
  c.fillStyle = g; c.fillRect(X0, Y0, CAB.sw, CAB.sh);
  c.fillStyle = 'rgba(12,16,44,0.28)'; c.fillRect(X0, 900, CAB.sw, 600);                      // the darker panel below the windows
  line(c, X0, 898, X1, 898, 5, 'rgba(160,180,235,0.22)');
  // windows: a pale reveal, a dark bevel, and a hole for the sky (the pulled-down edge of the shade stays)
  for (const wx of CAB.wins) {
    const rg = c.createLinearGradient(0, CAB.winY - 160, 0, CAB.winY + 160); rg.addColorStop(0, '#8E9BCB'); rg.addColorStop(1, '#5A679A');
    rrect(c, wx - 116, CAB.winY - 156, 232, 312, 104); c.fillStyle = rg; c.fill();
    rrect(c, wx - 100, CAB.winY - 140, 200, 280, 90); c.fillStyle = '#232B55'; c.fill();
    c.save(); c.globalCompositeOperation = 'destination-out'; rrect(c, wx - 88, CAB.winY - 127, 176, 254, 76); c.fill(); c.restore();
    c.save(); rrect(c, wx - 88, CAB.winY - 127, 176, 254, 76); c.clip();
    c.fillStyle = '#C3CCE8'; c.fillRect(wx - 90, CAB.winY - 130, 180, 34); c.fillStyle = '#8A95BE'; c.fillRect(wx - 90, CAB.winY - 100, 180, 6);
    c.restore();
    rrect(c, wx - 88, CAB.winY - 127, 176, 254, 76); c.lineWidth = 5; c.strokeStyle = 'rgba(20,24,60,0.7)'; c.stroke();
  }
  // overhead: the bins, then the strip with reading lights, vents and the seatbelt signs
  const bg = c.createLinearGradient(0, 140, 0, 370); bg.addColorStop(0, '#6C79AC'); bg.addColorStop(1, '#49568A');
  c.fillStyle = bg; c.fillRect(X0, Y0, CAB.sw, 370 - Y0);
  line(c, X0, 366, X1, 366, 8, '#7F8CC0');
  for (let x = -660; x < X1; x += 400) { line(c, x, 150, x, 362, 5, 'rgba(20,26,66,0.5)'); rrect(c, x + 170, 318, 60, 16, 8); c.fillStyle = '#2A3262'; c.fill(); }
  c.fillStyle = '#1B2248'; c.fillRect(X0, 370, CAB.sw, 62);
  for (const x of CAB.seats) {
    circle(c, x - 70, 401, 15, '#0E1230'); circle(c, x - 70, 401, 9, '#3B456F');                // the air vent
    circle(c, x, 401, 15, '#3A3320'); circle(c, x, 401, 10, '#FFE9B0');                         // the reading light
    rrect(c, x + 46, 384, 78, 34, 8); c.fillStyle = '#0E1230'; c.fill();                        // the sign panel (lit in cabSigns)
  }
  // seats: back, headrest with its white cloth, cushion, the box under it; an armrest on each side
  for (const x of CAB.seats) {
    const sg = c.createLinearGradient(x - 170, 0, x + 170, 0); sg.addColorStop(0, '#2F56B8'); sg.addColorStop(0.5, '#3A66D0'); sg.addColorStop(1, '#22418F');
    rrect(c, x - 168, 850, 336, 470, 66); c.fillStyle = sg; c.fill();
    rrect(c, x - 168, 850, 44, 470, 30); c.fillStyle = 'rgba(10,20,70,0.3)'; c.fill(); rrect(c, x + 124, 850, 44, 470, 30); c.fill();
    const hg = c.createLinearGradient(0, 826, 0, 1000); hg.addColorStop(0, '#4A78E2'); hg.addColorStop(1, '#2C4FA8');
    rrect(c, x - 152, 824, 304, 176, 58); c.fillStyle = hg; c.fill();
    rrect(c, x - 114, 830, 228, 108, 24); c.fillStyle = '#E6ECFB'; c.fill();
    rrect(c, x - 104, 840, 208, 88, 18); c.lineWidth = 2.5; c.setLineDash([8, 7]); c.strokeStyle = 'rgba(120,140,200,0.7)'; c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 5; i++) line(c, x - 110 + i * 55, 1010, x - 110 + i * 55, 1230, 3, 'rgba(10,20,70,0.16)');
    c.fillStyle = '#12173A'; c.fillRect(x - 152, 1322, 304, 170);
    const cg = c.createLinearGradient(0, 1226, 0, 1340); cg.addColorStop(0, '#3A66D0'); cg.addColorStop(1, '#1B3478');
    rrect(c, x - 180, 1226, 360, 112, 32); c.fillStyle = cg; c.fill();
    line(c, x - 150, 1240, x + 150, 1240, 4, 'rgba(190,215,255,0.2)');
  }
  for (const x of CAB.seats) {
    const ax = x + 200;
    rrect(c, ax - 30, 1120, 60, 232, 20); c.fillStyle = '#22284A'; c.fill();
    rrect(c, ax - 36, 1106, 72, 46, 20); c.fillStyle = '#475078'; c.fill();
    rrect(c, ax - 28, 1110, 56, 14, 7); c.fillStyle = 'rgba(200,215,255,0.22)'; c.fill();
  }
  // the floor: carpet, and the strip of floor lights
  const fg = c.createLinearGradient(0, CAB.floorY, 0, Y1); fg.addColorStop(0, '#1C2148'); fg.addColorStop(1, '#090B1C');
  c.fillStyle = fg; c.fillRect(X0, CAB.floorY, CAB.sw, Y1 - CAB.floorY);
  for (let i = 0; i < 260; i++) ellipse(c, lerp(X0, X1, rng()), lerp(CAB.floorY + 10, Y1, rng()), 10 + rng() * 14, 3 + rng() * 3, `rgba(110,130,220,${0.05 + rng() * 0.06})`);
  for (let x = X0 + 30; x < X1; x += 90) { rrect(c, x, CAB.floorY + 96, 44, 9, 4); c.fillStyle = '#FFE08A'; c.fill(); }
  CAB_STATIC = cv;
  // clouds and ground lights, in a panorama that scrolls past every window
  CAB_CLOUDS = [...Array(26)].map((_, i) => ({ x: rng() * 3400, y: -170 + rng() * 330, r: 34 + rng() * 60, v: 0.5 + rng() * 0.9, n: 3 + Math.floor(rng() * 3), seed: i }));
  CAB_LIGHTS = [...Array(150)].map(() => ({ x: rng() * 3400, d: rng(), col: rng() < 0.75 ? '#FFD08A' : (rng() < 0.5 ? '#9FD0FF' : '#FF8A7A'), r: 1.5 + rng() * 2.2 }));
}

// ---------------------------------------------------------------- the view from a window
// o: {rot (the cabin's pitch: the horizon counter-rotates), alt 0 (on the runway) .. 1 (above the clouds), speed, sun 0..1}
function cabSky(wx, t, o) {
  const c = ctx, wy = CAB.winY, alt = clamp(o.alt === undefined ? 0.7 : o.alt), sp = o.speed === undefined ? 1 : o.speed;
  c.save(); rrect(c, wx - 90, wy - 129, 180, 258, 78); c.clip();
  c.translate(wx, wy); c.rotate(-(o.rot || 0));
  const hz = lerp(8, 236, E.outCubic(alt));                       // the horizon, below the window's centre
  const g = c.createLinearGradient(0, -300, 0, hz);
  g.addColorStop(0, '#191C5C'); g.addColorStop(0.48, '#5B3A93'); g.addColorStop(0.8, '#E8674F'); g.addColorStop(1, '#FFC978');
  c.fillStyle = g; c.fillRect(-340, -340, 680, 340 + hz);
  { const sa = 1 - smooth(inv(60, 104, hz)); if (sa > 0.01) { softDot(c, 30, hz - 14, 120, '#FFE2A0', 0.5 * sa); circle(c, 30, hz - 18, 22, rgba('#FFF3D0', sa)); } }   // the low sun (out of sight once the horizon drops)
  // the ground: dusk, with the lights of a town
  const gg = c.createLinearGradient(0, hz, 0, hz + 260); gg.addColorStop(0, '#3A2A5E'); gg.addColorStop(0.2, '#20183F'); gg.addColorStop(1, '#0C0A20');
  c.fillStyle = gg; c.fillRect(-340, hz, 680, 420);
  const scroll = t * 240 * sp;
  for (const L of CAB_LIGHTS) {
    const depth = L.d, y = hz + 10 + depth * depth * 230, lx = (((L.x - wx - scroll * (0.25 + depth * 1.6)) % 3400) + 3400) % 3400 - 1700;
    if (lx < -130 || lx > 130) continue;
    circle(c, lx, y, L.r * (0.7 + depth), rgba(L.col, 0.55 + 0.4 * depth));
  }
  if (alt < 0.2) {                                                // the runway: edge lights streaking past
    const a = 1 - alt / 0.2;
    for (let k = 0; k < 9; k++) {
      const lx = (((k * 150 - wx - t * 2400) % 900) + 900) % 900 - 450, y = hz + 36 + (k % 3) * 34;
      line(c, lx, y, lx + 110, y, 6 + (k % 3) * 2, rgba(k % 3 === 1 ? '#FFF2C0' : '#8FD0FF', 0.9 * a));
    }
  }
  // clouds, lit from below by the sunset
  for (const cl of CAB_CLOUDS) {
    const lx = (((cl.x - wx - scroll * cl.v) % 3400) + 3400) % 3400 - 1700;
    if (lx < -230 || lx > 230) continue;
    const cy = lerp(-120 + cl.y * 0.42, hz - 96 + cl.y * 0.36, clamp(alt * 1.6));          // high over the runway; a deck below once up
    for (let i = 0; i < cl.n; i++) {
      const ox = (i - (cl.n - 1) / 2) * cl.r * 0.8, oy = -cl.r * 0.28 * (i % 2);
      ellipse(c, lx + ox, cy + oy + cl.r * 0.16, cl.r * 0.95, cl.r * 0.5, 'rgba(255,140,100,0.8)');
      ellipse(c, lx + ox, cy + oy, cl.r * 0.95, cl.r * 0.5, 'rgba(206,140,190,0.9)');
    }
  }
  if (o.sun > 0.01) { c.fillStyle = `rgba(255,214,120,${0.5 * o.sun})`; c.fillRect(-340, -340, 680, 760); softDot(c, -20, -10, 150, '#FFF6D8', 0.9 * o.sun); }   // the sun swings into the window
  c.restore();
  // the glass: a sheen, and the glow into the cabin
  c.save(); rrect(c, wx - 90, wy - 129, 180, 258, 78); c.clip();
  const sh = c.createLinearGradient(wx - 90, wy - 129, wx + 90, wy + 129);
  sh.addColorStop(0, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(160,190,255,0.08)');
  c.fillStyle = sh; c.fillRect(wx - 90, wy - 129, 180, 258); c.restore();
  rrect(gctx, wx - 88, wy - 127, 176, 254, 76); gctx.fillStyle = rgba('#FF9A5A', 0.16 + 0.2 * (o.sun || 0)); gctx.fill();
}
// the lit signs over each seat: fasten seat belt (and a ding when `ding` flashes them)
function cabSigns(t, on = 1, ding = 0) {
  for (const x of CAB.seats) {
    const a = clamp(on * (0.8 + 0.2 * Math.sin(t * 3)) + ding);
    ctx.save(); ctx.translate(x + 85, 401);
    // a little belt buckle icon
    rrect(ctx, -26, -5, 22, 10, 3); ctx.fillStyle = rgba('#FFB83D', a); ctx.fill(); rrect(ctx, 2, -8, 22, 16, 4); ctx.lineWidth = 4; ctx.strokeStyle = rgba('#FFB83D', a); ctx.stroke();
    ctx.restore();
    softDot(gctx, x + 85, 401, 46, '#FFB83D', 0.7 * a);
    softDot(gctx, x, 401, 40, '#FFE9B0', 0.6);
  }
}
// the cabin behind everyone. o: {rot, alt, speed, sun, signs, ding}
function cabinBack(cam, t, o = {}) {
  applyCam(cam);
  for (const wx of CAB.wins) cabSky(wx, t, o);
  ctx.drawImage(CAB_STATIC, CAB.sx, CAB.sy);
  cabSigns(t, o.signs === undefined ? 1 : o.signs, o.ding || 0);
}

// ---------------------------------------------------------------- the passengers
// st: {x, y = seat level, s, blink, lookX, lookY, tilt, smile -1..1, brow, angry 0..1, wince 0..1, mouthO, sleep, ears 0..1
//      (hands clapped over the ears), headDX, nod, hold 0..1 (hands forward round a baby)}
function drawPax(c, L, st, t) {
  const s = st.s || 1, sl = clamp(st.sleep || 0), LL = (CAB.floorY - CAB.seatY) / s;
  c.save(); c.translate(st.x, st.y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 38 - 31, -18, 62, 56, 26); c.fillStyle = L.pants; c.fill();
    const kg = c.createLinearGradient(0, 30, 0, LL + 20); kg.addColorStop(0, L.pants); kg.addColorStop(1, mixHex(L.pants, '#000000', 0.4));
    rrect(c, sd * 38 - 27, 22, 54, LL - 10, 20); c.fillStyle = kg; c.fill();
    ellipse(c, sd * 42, LL + 14, 38, 17, L.shoe); ellipse(c, sd * 36, LL + 8, 20, 7, 'rgba(255,255,255,0.18)');
  }
  c.beginPath();
  c.moveTo(-74, -168); c.quadraticCurveTo(0, -182, 74, -168); c.quadraticCurveTo(86, -100, 66, 4);
  c.quadraticCurveTo(0, 16, -66, 4); c.quadraticCurveTo(-86, -100, -74, -168); c.closePath();
  const tg = c.createLinearGradient(-80, 0, 80, 0);
  tg.addColorStop(0, mixHex(L.top, '#FFFFFF', 0.18)); tg.addColorStop(0.45, L.top); tg.addColorStop(1, L.topSh);
  c.fillStyle = tg; c.fill();
  if (L.extra === 'tie') {
    c.beginPath(); c.moveTo(-26, -170); c.lineTo(0, -120); c.lineTo(26, -170); c.closePath(); c.fillStyle = '#F4F4F8'; c.fill();
    c.beginPath(); c.moveTo(-9, -160); c.lineTo(9, -160); c.lineTo(13, -60); c.lineTo(0, -44); c.lineTo(-13, -60); c.closePath(); c.fillStyle = L.tie; c.fill();
  } else if (L.style === 'bun') {
    line(c, 0, -170, 0, 6, 4, L.topSh);
    for (let y = -140; y < 0; y += 34) circle(c, 9, y, 5, '#F2E6FF');
  } else {
    c.beginPath(); c.moveTo(-30, -172); c.quadraticCurveTo(0, -140, 30, -172); c.lineWidth = 9; c.strokeStyle = L.topSh; c.lineCap = 'round'; c.stroke();
  }
  rrect(c, -16, -196, 32, 34, 10); c.fillStyle = L.skinSh; c.fill();
  const ears = clamp(st.ears || 0), hold = clamp(st.hold || 0), headY = -252 + 18 * sl + (st.nod || 0) * 8;
  for (const sd of [-1, 1]) {
    const sh = [sd * 70, -160];
    let el = [sd * 84, -70], wr = [sd * 36, -12];
    if (hold > 0) { el = [lerp(el[0], sd * 96, hold), lerp(el[1], -78, hold)]; wr = [lerp(wr[0], sd * 62, hold), lerp(wr[1], -74, hold)]; }
    if (ears > 0) { const k = E.inOutSine(ears); el = [lerp(el[0], sd * 122, k), lerp(el[1], -196 - 10 * k, k)]; wr = [lerp(wr[0], sd * 62, k), lerp(wr[1], headY + 4, k)]; }
    line(c, sh[0], sh[1], el[0], el[1], 36, L.topSh); line(c, sh[0] - sd * 3, sh[1], el[0] - sd * 3, el[1], 28, L.top);
    line(c, el[0], el[1], wr[0], wr[1], 32, L.topSh); line(c, el[0] - sd * 3, el[1], wr[0] - sd * 3, wr[1], 24, L.top);
    if (ears < 0.5) { circle(c, wr[0], wr[1], 19, L.skinSh); circle(c, wr[0] - 2, wr[1] - 2, 16, L.skin); }
  }
  c.save(); c.translate(st.headDX || 0, headY); c.rotate((st.tilt || 0) + 0.25 * sl);
  if (L.style === 'pony') ellipse(c, 52, 8, 22, 46, L.hair, -0.4);
  for (const sd of [-1, 1]) ellipse(c, sd * 54, 4, 11, 16, L.skinSh);
  c.beginPath(); c.ellipse(0, 0, 56, 62, 0, 0, Math.PI * 2);
  const hg = c.createRadialGradient(-20, -24, 6, 0, 0, 72);
  hg.addColorStop(0, mixHex(L.skin, '#FFFFFF', 0.25)); hg.addColorStop(0.5, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  if (L.style === 'bun') {
    c.beginPath(); c.moveTo(-58, 4); c.quadraticCurveTo(-64, -60, 0, -66); c.quadraticCurveTo(64, -60, 58, 4); c.quadraticCurveTo(40, -34, 0, -36); c.quadraticCurveTo(-40, -34, -58, 4); c.closePath();
    c.fillStyle = L.hair; c.fill(); circle(c, 0, -74, 26, L.hair); circle(c, -6, -80, 9, mixHex(L.hair, '#FFFFFF', 0.4));
    line(c, -30, -50, 10, -58, 4, L.hairSh);
  } else if (L.style === 'bald') {
    ellipse(c, -16, -40, 18, 9, 'rgba(255,255,255,0.35)', -0.3);
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 52, -6, 10, 26, 0, 0, Math.PI * 2); c.fillStyle = L.hair; c.fill(); }
  } else if (L.style === 'pony') {
    c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(-62, -64, 4, -66); c.quadraticCurveTo(64, -58, 58, 2); c.quadraticCurveTo(20, -44, -20, -30); c.quadraticCurveTo(-46, -20, -58, 6); c.closePath();
    c.fillStyle = L.hair; c.fill();
  }
  const bl = clamp(st.blink || 0), wince = (st.wince || 0) > 0.5, ang = clamp(st.angry || 0), br = st.brow || 0;
  for (const sd of [-1, 1]) {
    const ex = sd * 20, ey = -6 + 2 * sl;
    if (wince) {
      c.beginPath(); c.moveTo(ex - sd * 9, ey - 6); c.lineTo(ex + sd * 7, ey); c.lineTo(ex - sd * 9, ey + 6);
      c.lineWidth = 4; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    } else if (bl > 0.9 || sl > 0.6) {
      c.beginPath(); c.moveTo(ex - 9, ey); c.quadraticCurveTo(ex, ey + 6, ex + 9, ey); c.lineWidth = 4; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.stroke();
    } else {
      ellipse(c, ex, ey, 9, 11 * (1 - bl) * (1 - 0.25 * ang), '#FFFFFF');
      circle(c, ex + (st.lookX || 0) * 4, ey + (st.lookY || 0) * 4, 5.5, '#15132A');
      circle(c, ex + (st.lookX || 0) * 4 - 1.5, ey + (st.lookY || 0) * 4 - 2, 1.8, '#FFFFFF');
    }
    // brows: raised (brow), or slanted down toward the nose (angry)
    line(c, sd * 9, -27 - br * 8 + 7 * ang, sd * 31, -27 - br * 6 - 6 * ang, 5.5, L.style === 'bald' ? L.hair : L.hairSh);
  }
  if (L.extra === 'glasses') { for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 20, -6, 15, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = '#3A2A52'; c.stroke(); } line(c, -5, -6, 5, -6, 3, '#3A2A52'); }
  ellipse(c, 0, 12, 7, 5, 'rgba(160,90,60,0.5)');
  if (L.style === 'bald') { c.beginPath(); c.moveTo(-26, 26); c.quadraticCurveTo(0, 14, 26, 26); c.quadraticCurveTo(0, 22, -26, 26); c.lineWidth = 9; c.strokeStyle = L.hair; c.stroke(); }
  if ((st.mouthO || 0) > 0.05) ellipse(c, 0, 34, 7 + 4 * st.mouthO, 8 + 8 * st.mouthO, L.mouth);
  else {
    const sm = st.smile || 0;
    c.beginPath(); c.moveTo(-12 - 4 * Math.max(0, sm), 33 - 3 * Math.max(0, sm)); c.quadraticCurveTo(0, 33 + 12 * sm, 12 + 4 * Math.max(0, sm), 33 - 3 * Math.max(0, sm));
    c.lineWidth = 4.5; c.strokeStyle = L.mouth; c.lineCap = 'round'; c.stroke();
  }
  c.restore();
  if (ears >= 0.5) for (const sd of [-1, 1]) { circle(c, sd * 60, headY + 4, 21, L.skinSh); circle(c, sd * 60 - 2, headY + 2, 18, L.skin); }   // hands over the ears
  c.restore();
}

// ---------------------------------------------------------------- the baby
// (x, y) = where it sits (on a lap). o: {cry 0..1, wobble 0..1 (about to), smug 0..1, blink, lookX, lookY, arms 0..1 (fists up),
//   red 0..1, tilt, brow, medal 0..1, bounce}
function drawBaby(c, x, y, s, t, o = {}) {
  const cry = clamp(o.cry || 0), wob = clamp(o.wobble || 0), smug = clamp(o.smug || 0), arms = clamp(o.arms === undefined ? cry : o.arms);
  const shakeX = cry * 3 * Math.sin(t * 46), shakeY = cry * 2 * Math.cos(t * 39);
  c.save(); c.translate(x + shakeX, y + shakeY - (o.bounce || 0)); c.scale(s, s);
  // legs in a onesie, little socks
  for (const sd of [-1, 1]) {
    line(c, sd * 26, -22, sd * (46 + 6 * cry * Math.sin(t * 30 + sd)), 8, 34, '#58C9A6'); line(c, sd * 26, -24, sd * (45 + 6 * cry * Math.sin(t * 30 + sd)), 5, 26, '#7FE3C4');
    ellipse(c, sd * (50 + 6 * cry * Math.sin(t * 30 + sd)), 14, 19, 15, '#FFFFFF');
  }
  // body
  ellipse(c, 0, -62, 62, 66, '#58C9A6'); ellipse(c, -6, -66, 54, 58, '#7FE3C4');
  for (let i = 0; i < 3; i++) circle(c, 0, -92 + i * 24, 4.5, '#EFFFF9');
  // a duck on the tummy
  ellipse(c, 24, -44, 14, 10, '#FFD447'); circle(c, 33, -56, 8, '#FFD447'); ellipse(c, 42, -55, 6, 3, '#FF9A3C'); circle(c, 35, -58, 1.6, '#1A1A22');
  // arms: resting out to the sides, or fists up and shaking
  for (const sd of [-1, 1]) {
    const sh = [sd * 48, -96], wave = arms * 10 * Math.sin(t * 34 + sd * 1.3);
    const hand = [sd * lerp(84, 78, arms) + wave * 0.4, lerp(-58, -150, arms) + wave];
    line(c, sh[0], sh[1], hand[0], hand[1], 30, '#58C9A6'); line(c, sh[0] - 2, sh[1] - 2, hand[0] - 2, hand[1] - 2, 22, '#7FE3C4');
    circle(c, hand[0], hand[1], 16, '#E2A07E'); circle(c, hand[0] - 1.5, hand[1] - 1.5, 13.5, '#F6C6A4');
  }
  if (o.medal > 0.01) {                                // the rosette: doing it right
    const k = E.outBack(clamp(o.medal), 2.4);
    c.save(); c.translate(-28, -70); c.scale(k, k); c.rotate(-0.12);
    c.beginPath(); c.moveTo(-10, 8); c.lineTo(-18, 52); c.lineTo(-4, 40); c.lineTo(6, 54); c.lineTo(10, 8); c.closePath(); c.fillStyle = '#2A7BE0'; c.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; circle(c, Math.cos(a) * 21, Math.sin(a) * 21, 8, '#FFD447'); }
    circle(c, 0, 0, 22, '#FFD447'); circle(c, 0, 0, 16, '#FFF3B8');
    c.font = '400 22px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#B3780C'; c.fillText('#1', 0, 2);
    c.restore();
  }
  // head
  c.save(); c.translate(0, -186); c.rotate(o.tilt || 0);
  for (const sd of [-1, 1]) { ellipse(c, sd * 66, 6, 14, 17, '#E2A07E'); ellipse(c, sd * 66, 6, 8, 10, '#C98466'); }
  const hg = c.createRadialGradient(-22, -26, 8, 0, 0, 84);
  hg.addColorStop(0, '#FFE3CC'); hg.addColorStop(0.5, '#F6C6A4'); hg.addColorStop(1, '#E2A07E');
  c.beginPath(); c.ellipse(0, 0, 68, 66 + 6 * cry, 0, 0, Math.PI * 2); c.fillStyle = hg; c.fill();
  const red = clamp(o.red === undefined ? cry * 0.8 + wob * 0.3 : o.red);
  if (red > 0.01) { c.save(); c.beginPath(); c.ellipse(0, 0, 68, 66 + 6 * cry, 0, 0, Math.PI * 2); c.clip(); c.fillStyle = `rgba(255,70,60,${0.3 * red})`; c.fillRect(-80, -80, 160, 170); c.restore(); }
  // one curl of hair
  c.beginPath(); c.moveTo(-6, -62); c.bezierCurveTo(-2, -96, 30, -92, 20, -72); c.bezierCurveTo(14, -62, 4, -70, 12, -78); c.lineWidth = 7; c.strokeStyle = '#6A3420'; c.lineCap = 'round'; c.stroke();
  ellipse(c, -40, 22, 15, 10, `rgba(255,110,110,${0.35 + 0.3 * red})`); ellipse(c, 40, 22, 15, 10, `rgba(255,110,110,${0.35 + 0.3 * red})`);
  const squeezed = cry > 0.4, happy = smug > 0.5 && !squeezed;
  for (const sd of [-1, 1]) {
    const ex = sd * 25, ey = -4;
    if (squeezed) {                                    // > <
      c.beginPath(); c.moveTo(ex - sd * 12, ey - 9); c.lineTo(ex + sd * 9, ey); c.lineTo(ex - sd * 12, ey + 9);
      c.lineWidth = 5.5; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    } else if (happy || (o.blink || 0) > 0.9) {        // ^ ^ (or a blink)
      c.beginPath(); c.moveTo(ex - 12, ey + 3); c.quadraticCurveTo(ex, ey + (happy ? -12 : 8), ex + 12, ey + 3); c.lineWidth = 5.5; c.strokeStyle = '#3A1E16'; c.lineCap = 'round'; c.stroke();
    } else {
      ellipse(c, ex, ey, 14, 16, '#FFFFFF');
      const lx = (o.lookX || 0) * 5, ly = (o.lookY || 0) * 5;
      circle(c, ex + lx, ey + ly, 10.5, '#2A1B14'); circle(c, ex + lx - 3, ey + ly - 4, 4, '#FFFFFF'); circle(c, ex + lx + 3.5, ey + ly + 3.5, 2, 'rgba(255,255,255,0.8)');
      if (wob > 0.05) { ellipse(c, ex, ey + 14, 12, 5 * wob, 'rgba(150,215,255,0.9)'); circle(c, ex - 4, ey + 13, 2, '#FFFFFF'); }   // tears welling
    }
    // brows: flat, worried (inner ends up) as it wobbles, or raised
    const by = -30 - (o.brow || 0) * 7;
    line(c, sd * 13, by - 7 * wob - 4 * cry, sd * 37, by + 3 * wob + 2 * cry, 4.5, '#6A3420');
  }
  circle(c, 0, 14, 5.5, 'rgba(200,120,90,0.6)');
  // mouth
  if (cry > 0.12) {
    const mo = cry, mw = 20 + 16 * mo, mh = 10 + 30 * mo;
    c.beginPath(); c.moveTo(-mw, 30); c.quadraticCurveTo(0, 22 - 4 * mo, mw, 30); c.quadraticCurveTo(mw + 4, 30 + mh, 0, 30 + mh + 6); c.quadraticCurveTo(-mw - 4, 30 + mh, -mw, 30); c.closePath();
    c.fillStyle = '#6E1524'; c.fill();
    c.save(); c.clip(); ellipse(c, 0, 30 + mh + 2, mw * 0.72, mh * 0.42, '#F0707C'); rrect(c, -9, 26, 8, 9, 2); c.fillStyle = '#FFFFFF'; c.fill(); rrect(c, 1, 26, 8, 9, 2); c.fill(); c.restore();
  } else if (wob > 0.12) {                             // the wobbly lip
    c.beginPath(); c.moveTo(-16, 36);
    for (let i = 1; i <= 8; i++) c.lineTo(-16 + i * 4, 36 + 3.2 * wob * Math.sin(i * 1.6 + t * 26) + 5 * wob * Math.sin(Math.PI * i / 8) * -1);
    c.lineWidth = 5; c.strokeStyle = '#6E1524'; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  } else if (smug > 0.3) {
    c.beginPath(); c.moveTo(-16, 31); c.quadraticCurveTo(0, 31 + 20 * smug, 16, 31); c.closePath(); c.fillStyle = '#6E1524'; c.fill();
    rrect(c, -5, 31, 10, 6, 2); c.fillStyle = '#FFFFFF'; c.fill();
  } else ellipse(c, 0, 35, 6.5, 5, '#6E1524');           // a tiny "o": the blank stare
  c.restore();
  c.restore();
}
// tears arcing out from both eyes (world coords under the camera): k = strength, w = eye spacing, col
function tearJets(c, x, y, s, t, k, w = 25, seed = 0) {
  if (k <= 0.01) return;
  for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) {
    const p = ((t * 1.9 + i / 7 + (sd > 0 ? 0.07 : 0) + seed) % 1), ex = x + sd * w * s, vx = sd * (150 + 40 * hash(i + seed * 9)) * s, vy = -230 * s;
    const px = ex + vx * p, py = y + vy * p + 520 * s * p * p, a = k * Math.min(1, p * 8) * (1 - p * 0.75);
    c.save(); c.translate(px, py); c.rotate(Math.atan2(vy + 1040 * s * p, vx) - Math.PI / 2);
    c.beginPath(); c.moveTo(0, -11 * s); c.bezierCurveTo(7 * s, -1 * s, 6 * s, 7 * s, 0, 7 * s); c.bezierCurveTo(-6 * s, 7 * s, -7 * s, -1 * s, 0, -11 * s);
    c.fillStyle = `rgba(160,220,255,${0.95 * a})`; c.fill(); c.lineWidth = 1.6 * s; c.strokeStyle = `rgba(40,90,170,${0.7 * a})`; c.stroke();
    c.restore();
  }
}
// the scream: arcs of sound leaving a mouth (world coords). k = loudness
function screamArcs(c, x, y, t, k, col = '#FF5A6E') {
  if (k <= 0.01) return;
  for (const cc of [c, gctx]) for (let i = 0; i < 4; i++) {
    const p = ((t * 1.5 + i / 4) % 1), r = 70 + 250 * p, a = k * (1 - p) * (cc === c ? 0.85 : 0.35);
    for (const sd of [-1, 1]) {
      cc.beginPath(); cc.arc(x, y, r, sd > 0 ? -0.75 : Math.PI - 0.75 + 0.0, sd > 0 ? 0.55 : Math.PI + 0.55 - 0.0 + 0.2 * 0);
      cc.lineWidth = (cc === c ? 9 : 18) * (1 - 0.5 * p); cc.lineCap = 'round'; cc.strokeStyle = rgba(col, a); cc.stroke();
    }
  }
}

// ---------------------------------------------------------------- props on the tray
// a bag of chips; puff 0 (slack) .. 1 (a balloon)
function chipBag(c, x, y, s, puff, t, rot = 0) {
  const p = clamp(puff), w = lerp(46, 60, p), h = lerp(138, 128, p), bow = lerp(3, 30, p);
  c.save(); c.translate(x, y); c.rotate(rot + 0.02 * Math.sin(t * 2.3) * (1 - p)); c.scale(s, s);
  const body = () => { c.beginPath(); c.moveTo(-w, -6); c.quadraticCurveTo(-w - bow, -h / 2, -w, -h + 6); c.lineTo(w, -h + 6); c.quadraticCurveTo(w + bow, -h / 2, w, -6); c.closePath(); };
  body(); const g = c.createLinearGradient(-w - bow, 0, w + bow, 0); g.addColorStop(0, '#FF8A66'); g.addColorStop(0.3, '#F2483C'); g.addColorStop(1, '#AE1E2A');
  c.fillStyle = g; c.fill();
  c.save(); body(); c.clip();
  c.fillStyle = '#FFD447'; c.beginPath(); c.ellipse(0, -h * 0.54, w * 0.86 + bow * 0.5, 27 + 5 * p, -0.08, 0, Math.PI * 2); c.fill();
  c.font = '400 32px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#AE1E2A';
  c.save(); c.translate(0, -h * 0.54 + 2); c.rotate(-0.08); c.scale(1 + 0.2 * p, 1); c.fillText('CHIPS', 0, 0); c.restore();
  for (let i = 0; i < 4; i++) { const yy = -h * (0.18 + i * 0.2); line(c, -w * 0.7 + i * 9, yy, w * 0.2 - i * 6, yy - 18, 3, `rgba(110,10,20,${0.45 * (1 - p)})`); }     // slack creases
  ellipse(c, -w * 0.45 - bow * 0.3, -h * 0.6, 6 + 8 * p, 34 + 8 * p, `rgba(255,255,255,${0.2 + 0.4 * p})`, 0.12);                                              // the taut shine
  c.restore();
  for (const yy of [-6, -h + 6]) {                    // the crimped seams
    rrect(c, -w - 1, yy - 8, 2 * w + 2, 16, 3); c.fillStyle = '#E8ECF8'; c.fill();
    for (let xx = -w + 6; xx < w; xx += 9) line(c, xx, yy - 6, xx, yy + 6, 2, 'rgba(120,130,170,0.6)');
  }
  c.restore();
}
// a plastic water bottle; crush 0 .. 1 (the rising pressure squeezes it)
function waterBottle(c, x, y, s, crush, t, rot = 0) {
  const k = clamp(crush), w = 28, h = 124 * (1 - 0.08 * k), pin = 17 * k;
  c.save(); c.translate(x, y); c.rotate(rot + 0.12 * k); c.scale(s, s);
  const body = () => {
    c.beginPath(); c.moveTo(-w, 0);
    c.bezierCurveTo(-w + pin * 1.7, -h * 0.3, -w - 2 - pin * 0.3, -h * 0.5, -w + pin, -h * 0.68);
    c.quadraticCurveTo(-w + pin * 0.4, -h * 0.9, -11, -h); c.lineTo(11, -h);
    c.quadraticCurveTo(w - pin * 0.2, -h * 0.9, w - pin * 0.5, -h * 0.72);
    c.bezierCurveTo(w + 3 - pin * 1.9, -h * 0.5, w + pin * 0.2, -h * 0.26, w, 0); c.closePath();
  };
  body(); c.fillStyle = 'rgba(200,228,255,0.28)'; c.fill();
  c.save(); body(); c.clip();
  c.fillStyle = 'rgba(96,178,255,0.78)'; c.fillRect(-44, -h * (0.56 + 0.14 * k), 88, h);
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-44, -h * 0.5, 88, 30); c.fillStyle = '#2A7BE0'; c.fillRect(-44, -h * 0.5 + 10, 88, 8);
  if (k > 0.05) for (let i = 0; i < 5; i++) line(c, -w + 6 + i * 3, -h * (0.2 + i * 0.13), w - 8 - (i % 2) * 14, -h * (0.28 + i * 0.12), 2.6, `rgba(255,255,255,${0.75 * k})`);
  c.restore();
  body(); c.lineWidth = 3.5; c.strokeStyle = 'rgba(230,242,255,0.95)'; c.lineJoin = 'round'; c.stroke();
  line(c, -w + 8 + pin, -h * 0.82, -w + 8 + pin * 1.4, -h * 0.14, 4, 'rgba(255,255,255,0.55)');
  rrect(c, -11, -h - 12, 22, 14, 3); c.fillStyle = 'rgba(210,232,255,0.6)'; c.fill();
  rrect(c, -15, -h - 28, 30, 18, 5); c.fillStyle = '#2A7BE0'; c.fill(); rrect(c, -15, -h - 28, 30, 6, 3); c.fillStyle = '#6FAEFF'; c.fill();
  c.restore();
}
function cabTray(c, x) {
  rrect(c, x - 150, CAB.trayY, 300, 20, 8); c.fillStyle = '#AEB8D4'; c.fill();
  rrect(c, x - 150, CAB.trayY, 300, 8, 4); c.fillStyle = '#DCE3F4'; c.fill();
  ellipse(c, x, CAB.trayY + 30, 150, 12, 'rgba(0,0,20,0.28)');
}

// ---------------------------------------------------------------- the hero in 12A
// seated legs: thighs toward the camera, shins down, shoes front-on (rig-local, like st)
function cabLegs(c, x, y, s, pal) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    const g = c.createLinearGradient(0, 30, 0, 215); g.addColorStop(0, pal.pants); g.addColorStop(1, pal.pantsSh);
    rrect(c, sd * 41 - 25, 30, 50, 180, 20); c.fillStyle = g; c.fill();
    rrect(c, sd * 39 - 31, -26, 62, 78, 28); c.fillStyle = pal.pants; c.fill();
    ellipse(c, sd * 39, 22, 26, 14, 'rgba(255,255,255,0.05)');
    drawShoe(c, [sd * 41, 196], sd, pal, 1, false);
  }
  c.restore();
}
// his pose. o: {ears 0..1 (both hands clapped over his ears), earL 0..1 (one hand over the screen-left ear), stretch 0..1
//  (the big yawn), cry 0..1 (fists to his eyes), up 0..1, lean, tremble, t, pose + poseK}
function cabPose(o = {}) {
  const base = { hipY: -34, lean: o.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: 'open', feetFront: 1 };
  let grip = ikReach(base, 'L', [-178, -112], 1); grip = ikReach(grip, 'R', [178, -112], 1);         // hands on the armrests
  let p = grip;
  const hd0 = rig(base).head, hx = hd0[0] + (o.headDX || 0), hy = hd0[1] + (o.headDY || 0);      // where his head is: the hands go to it
  if (o.ears > 0 || o.earL > 0) {
    let q = ikReach(base, 'L', [hx - 70, hy + 6], 1); q = ikReach(q, 'R', [hx + 70, hy + 6], 1);
    if (o.ears > 0) p = lerpPose(p, q, clamp(o.ears));
    else p = Object.assign({}, p, { armL: lerpPose(p, q, clamp(o.earL)).armL });
  }
  if (o.stretch > 0) {
    const k = E.inOutSine(clamp(o.stretch)), bend = 1.1 * Math.sin(Math.PI * k);
    const q = Object.assign({}, base, { armL: { a: lerp(p.armL.a, 2.5, k), b: lerp(p.armL.b, 0.35, k) + bend }, armR: { a: lerp(p.armR.a, 2.5, k), b: lerp(p.armR.b, 0.35, k) + bend } });
    p = lerpPose(p, q, 1);
  }
  if (o.cry > 0) { let q = ikReach(base, 'L', [hx - 46, hy - 2], 1); q = ikReach(q, 'R', [hx + 46, hy - 2], 1); p = lerpPose(p, q, clamp(o.cry)); }
  if (o.up > 0) p = lerpPose(p, Object.assign({}, base, { armL: { a: 2.35, b: 0.45 }, armR: { a: 2.2, b: 0.6 }, hand: 'spread' }), clamp(o.up));
  if (o.pose) p = lerpPose(p, o.pose, clamp(o.poseK === undefined ? 1 : o.poseK));
  if (o.tremble) p = twitch(p, o.t || 0, o.tremble, 11);
  return p;
}
// the travel pillow round his neck (rig space)
function neckPillow(c, r, st) {
  const [nx, ny] = r.neck;
  c.save(); c.translate(nx, ny + 8); c.rotate(r.lean);
  for (const sd of [-1, 1]) {
    ellipse(c, sd * 62, 4, 34, 40, '#117F74', sd * 0.5); ellipse(c, sd * 60, 0, 30, 36, '#1CB3A4', sd * 0.5);
    ellipse(c, sd * 54, -12, 10, 16, 'rgba(255,255,255,0.22)', sd * 0.5);
  }
  c.restore();
}
// pressure building in his ears: rings throbbing at each ear, a red throb (screen space)
function earThrob(cam, st, r, k, t) {
  if (k <= 0.01) return;
  screenSpace();
  for (const sd of [-1, 1]) {
    const w = toWorld(st, [r.head[0] + (st.headDX || 0) + sd * 64, r.head[1] + (st.headDY || 0) + 2]), p = toScreen(cam, w[0], w[1]), z = cam.zoom * st.s;
    softDot(ctx, p[0], p[1], 46 * z, '#FF4D5E', 0.4 * k * (0.7 + 0.3 * Math.sin(t * 16)));
    softDot(gctx, p[0], p[1], 60 * z, '#FF4D5E', 0.5 * k);
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 2.2 + i / 3) % 1), rr = (22 + 46 * ph) * z, a = k * (1 - ph);
      for (const [cc, lw] of [[ctx, 6], [gctx, 12]]) {
        cc.beginPath(); cc.arc(p[0] + sd * 6 * z, p[1], rr, sd > 0 ? -0.8 : Math.PI - 0.8, sd > 0 ? 0.8 : Math.PI + 0.8);
        cc.lineWidth = lw; cc.lineCap = 'round'; cc.strokeStyle = rgba('#FF7A6E', (cc === ctx ? 0.9 : 0.45) * a); cc.stroke();
      }
    }
  }
}

// the whole cabin scene. o: {rot, alt, speed, sun, signs, ding (-> cabinBack),
//   hero: {face, ears, earL, stretch, cry, up, lean, tremble, frizz, headDX, headDY, headRot, dx, dy, throb, post: fn(lc, r, st) in rig space},
//   bag: {puff, dx, rot, hop}, bottle: {crush, dx, rot, hop}, noTray,
//   suit / gran / mum: passenger states (omit one to leave the seat empty), baby: drawBaby options (sits on mum's lap),
//   light 0..1 (his reading light), under: fn(c) drawn before him}
function cabinScene(cam, t, o = {}) {
  const h = o.hero || {}, c = ctx;
  cabinBack(cam, t, o);
  // the neighbours
  if (o.suit) drawPax(c, PAX.suit, Object.assign({ x: 140, y: CAB.seatY, s: 1.06 }, o.suit), t);
  if (o.gran) drawPax(c, PAX.gran, Object.assign({ x: 1340, y: CAB.seatY, s: 1.04 }, o.gran), t);
  let babyAt = null;
  if (o.mum) {
    const m = Object.assign({ x: 940, y: CAB.seatY, s: 1.06, hold: o.baby ? 1 : 0 }, o.mum);
    drawPax(c, PAX.mum, m, t);
    if (o.baby) {
      babyAt = [m.x, m.y + 12, 0.78];
      drawBaby(c, babyAt[0], babyAt[1], babyAt[2], t, o.baby);
      for (const sd of [-1, 1]) { circle(c, m.x + sd * 66 * m.s, m.y - 74 * m.s, 20 * m.s, PAX.mum.skinSh); circle(c, m.x + sd * 66 * m.s - 2, m.y - 74 * m.s - 2, 17 * m.s, PAX.mum.skin); }   // her hands round it
    }
  }
  if (o.under) o.under(c);
  // the hero
  const st = { x: CAB.hx + (h.dx || 0), y: CAB.seatY + (h.dy || 0), s: CAB.hs, face: h.face || FACES.calm, frizz: h.frizz || 0,
    headDX: h.headDX || 0, headDY: h.headDY || 0, headRot: h.headRot || 0, noLegs: true, seed: 4 };
  st.pose = cabPose(Object.assign({ t }, h));
  cabLegs(c, st.x, st.y, st.s, PAL);
  // the warm pool of his reading light
  const lit = o.light === undefined ? 0.5 : o.light;
  if (lit > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(540, 700, 40, 540, 980, 520); lg.addColorStop(0, `rgba(255,214,150,${0.20 * lit})`); lg.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = lg; c.fillRect(0, 400, 1080, 1100); c.restore(); }
  const r = charLayer(cam, st, t, {
    pal: PAL, ambient: o.ambient === undefined ? 0.14 : o.ambient,
    post: (lc, rr, s2) => {
      lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s);
      neckPillow(lc, rr, s2);
      // the pillow sits behind his chin: redraw the head over it
      drawHead(lc, rr, s2.face, s2, PAL, t);
      if (h.red > 0.01) { const [hx, hy] = rr.head; lc.globalCompositeOperation = 'source-atop'; ellipse(lc, hx + (s2.headDX || 0), hy + (s2.headDY || 0), 70, 80, `rgba(255,50,40,${0.26 * h.red})`); lc.globalCompositeOperation = 'source-over'; }
      // hands over the ears (or fists at the eyes) go on top of the head: the arms were drawn under it
      const both2 = (h.ears || 0) > 0.6 || (h.cry || 0) > 0.6;
      if (both2 || (h.earL || 0) > 0.6) for (const k of ['L', 'R']) { if (k === 'R' && !both2) continue; drawHand(lc, rr['wr' + k], rr['armDir' + k], 'open', PAL, k === 'L' ? -1 : 1, t); }
      if (h.post) h.post(lc, rr, s2);
      lc.restore();
    },
  });
  applyCam(cam);
  // the tray and what's on it
  if (!o.noTray) {
    cabTray(c, st.x);
    const b = o.bag || {}, w = o.bottle || {};
    chipBag(c, st.x - 82 + (b.dx || 0), CAB.trayY + 2 - (b.hop || 0), 1, b.puff || 0, t, b.rot || 0);
    waterBottle(c, st.x + 78 + (w.dx || 0), CAB.trayY + 2 - (w.hop || 0), 1, w.crush || 0, t, w.rot || 0);
  }
  if (h.throb > 0.01) { earThrob(cam, st, r, h.throb, t); applyCam(cam); }
  return { st, r, babyAt };
}
// dusk light from the windows over the whole frame (call last): a warm wash from the upper left, cooler below
function cabLight(t, amt = 1, sun = 0) {
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(240, 520, 60, 300, 700, 1300);
  g.addColorStop(0, `rgba(255,150,90,${0.13 * amt + 0.14 * sun})`); g.addColorStop(0.5, `rgba(200,90,120,${0.05 * amt + 0.05 * sun})`); g.addColorStop(1, 'rgba(80,60,160,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
