// Why Do Your Ears RING After a Concert? Short: a dead-silent room (an anechoic chamber: foam wedges on every wall and a
// wire floor over a pit), three people on stools: a gran and a teen (yawning-contagious's passengers, copied as
// rmPassenger) and him in his band tee. World units = the frame at zoom 1.
'use strict';

const BUS = { seatY: 1250, floorY: 1336 };       // the passengers' seat and floor (their legs are drawn from these)
const RM = { seat: 1250, floor: 1336, xs: [330, 540, 750] };
let RM_WALL = null;
function initRoom() {
  const Wc = 1700, Hc = 1500, cv = mkCanvas(Wc, Hc), c = cv.getContext('2d');
  c.fillStyle = '#20263C'; c.fillRect(0, 0, Wc, Hc);
  const cell = 84;
  // acoustic foam: a grid of pyramids, each four faces lit from above (top light, sides mid, bottom dark)
  for (let y = 0; y < Hc; y += cell) for (let x = 0; x < Wc; x += cell) {
    const cx = x + cell / 2, cy = y + cell / 2, j = (hash(x * 0.37 + y * 1.13) - 0.5) * 6;
    const tri = (p1, p2, col) => { c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.lineTo(cx, cy); c.closePath(); c.fillStyle = col; c.fill(); };
    const sh = (k) => `rgb(${Math.round(58 + k + j)},${Math.round(68 + k + j)},${Math.round(98 + k + j)})`;
    tri([x, y], [x + cell, y], sh(34));                  // top face: catches the light
    tri([x, y], [x, y + cell], sh(8));                   // left
    tri([x + cell, y], [x + cell, y + cell], sh(-14));   // right
    tri([x, y + cell], [x + cell, y + cell], sh(-34));   // bottom: in shadow
    line(c, x, y, x + cell, y + cell, 1.5, 'rgba(10,12,30,0.35)'); line(c, x + cell, y, x, y + cell, 1.5, 'rgba(10,12,30,0.35)');
  }
  // the room's edges fall into shadow
  const vg = c.createRadialGradient(Wc / 2, Hc * 0.45, 200, Wc / 2, Hc / 2, Wc * 0.75);
  vg.addColorStop(0, 'rgba(8,10,24,0)'); vg.addColorStop(1, 'rgba(8,10,24,0.7)');
  c.fillStyle = vg; c.fillRect(0, 0, Wc, Hc);
  RM_WALL = cv;
}
function rmRoom(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx;
  c.drawImage(RM_WALL, -310, -80, 1700, 1500);
  // the wire floor over the pit
  c.fillStyle = '#0B0E1C'; c.fillRect(-400, RM.floor - 10, 1900, 900);
  paint(() => {
    for (let i = -30; i <= 30; i++) line(c, 540 + i * 60, RM.floor - 6, 540 + i * 150, RM.floor + 700, 2, 'rgba(170,190,240,0.22)');
    for (let j = 0; j < 9; j++) { const y = RM.floor + 6 + j * j * 9; line(c, -400, y, 1500, y, 2, 'rgba(170,190,240,0.2)'); }
  });
  // a small plaque: SILENT ROOM, and a lamp above it (the only light: a cold one, above and to the left)
  rrect(c, 405, 693, 270, 68, 14); c.fillStyle = '#0E1226'; c.fill();
  paint(() => { c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.sign ? '#7FE9FF' : '#3A4A6A'; c.fillText('SILENT ROOM', 540, 728); });
  if (o.sign) softDot(gctx, 540, 727, 190, '#7FE9FF', 0.35 * o.sign);
}
// stools (world)
function rmStool(c, x) {
  ellipse(c, x, RM.seat + 26, 92, 20, '#3A3550');
  for (const sd of [-1, 1]) line(c, x + sd * 30, RM.seat + 34, x + sd * 64, RM.floor + 2, 10, '#2A2640');
}
// him seated (yawning-contagious's bench helpers): A = {face, headRot, headDX, look}
function rmHero(cam, t, A = {}) {
  const st = { x: RM.xs[1], y: RM.seat, s: 1, face: A.face || FACES.calm, headRot: A.headRot || 0, headDX: A.headDX || 0, headDY: A.headDY || 0, seed: 4 };
  const pose = heroSeatPose(0, A.shrug || 0, 0);
  const full = Object.assign({}, st, { y: st.y + 34, pose, noLegs: true });
  const r = charLayer(cam, full, t, { pal: CNPAL, pre: (lc) => actor(() => heroSeatLegs(lc, st.x, st.y, 1, CNPAL)),
    post: (lc, rr, s2) => { lc.save(); lc.translate(s2.x, s2.y); lc.scale(s2.s, s2.s); lc.save(); lc.translate(rr.P[0], rr.P[1]); lc.rotate(s2.pose.lean); cnTeeLogo(lc); lc.restore(); lc.restore(); } });
  return { r, st: full, head: cnHeadPt(full, 0, 0), earL: cnHeadPt(full, -62, 2), earR: cnHeadPt(full, 62, 2), top: cnHeadPt(full, 0, -84) };
}
// seated legs in the hero's palette (knees to camera, shins down, red shoes); local coords, pelvis at (0, 0)
function heroSeatLegs(c, x, y, s, pal = PAL) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    rrect(c, sd * 38 - 30, -14, 60, 54, 24); c.fillStyle = pal.pants; c.fill();
    rrect(c, sd * 40 - 24, 26, 48, (BUS.floorY - BUS.seatY) / s + 18, 20); c.fillStyle = pal.pants; c.fill();
    const fy = (BUS.floorY - BUS.seatY) / s + 44;
    ellipse(c, sd * 44, fy, 38, 18, pal.shoe); rrect(c, sd * 44 - 38, fy + 6, 76, 12, 6); c.fillStyle = pal.sole; c.fill();
  }
  c.restore();
}
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
function rmPassenger(c, L, st, t) {
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
  // face (paint: no shadow ring round the eyes)
  paint(() => {
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
  });
  c.restore();
  c.restore();
}
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
