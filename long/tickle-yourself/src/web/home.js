// The hero's living room (tickle-yourself, long-form 1920x1080): a couch in the middle, a floor lamp on the left, a
// rainy window on the far left, three family photos above the couch, a wall calendar and the front door on the right.
// Two lights: NIGHT (the lamp is the only warm thing; the window is cold blue rain) and DAY (Sunday: sun through the
// window and, when the door opens, a warm wedge across the floor). The hero (HOMEPAL: a blue hoodie) sits on the
// couch's left seat; Pip (his six-year-old niece: the same rig in pink, half his size, pigtails) comes in the door.
// The motif is the feather. World coords = screen coords at zoom 1. Loaded before scenes.js.
'use strict';

const HOME = { floorY: 880, seatY: 727, hx: 800, hs: 0.78, couchX: 910, lampX: 430, doorX: 1610, calX: 1330 };
const HOMEPAL = Object.assign({}, PAL, {
  coat: '#5B7FD6', coatSh: '#3C59A8', coatHi: '#8FB0FF', coatDk: '#2C4488',
  strap: '#5B7FD6', strapSh: '#3C59A8', pants: '#3A3F58', pantsSh: '#262A40',
  shoe: '#E8E4D8', shoeSh: '#B8B2A0', sole: '#8A8576', pj: false, home: true,
});
// Pip: the rig in other clothes reads as family (sun-sneeze did the same for his gran and a kid)
const PIPPAL = Object.assign({}, PAL, {
  coat: '#FF6FA0', coatSh: '#D84B7E', coatHi: '#FFB0CB', coatDk: '#B03A66',
  strap: '#FFD447', strapSh: '#D8A92A', pants: '#6B4FD8', pantsSh: '#4A35A8',
  shoe: '#FFD447', shoeSh: '#D8A92A', sole: '#FFF6D8', pj: true,
});
// a laugh (eyes squeezed, mouth wide, brows up) and a deadpan (heavy lids, flat mouth, straight at us)
FACES.laugh = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 1.1, browTilt: 0.5, mouth: 'grin', mouthOpen: 1, blink: 1, cross: 0, squeeze: 1, tear: 0 };
FACES.deadpan = { eyeOpen: 1, pupil: 1.05, lookX: 0, lookY: 0.1, browY: -0.15, browTilt: -0.25, mouth: 'flat', mouthOpen: 0, blink: 0.48, cross: 0 };
FACES.determined = { eyeOpen: 1.05, pupil: 0.9, lookX: 0.3, lookY: -0.1, browY: -0.3, browTilt: -1.0, mouth: 'flat', mouthOpen: 0.6, blink: 0.18, cross: 0 };
FACES.sad = { eyeOpen: 0.95, pupil: 1.05, lookX: 0, lookY: 0.6, browY: 0.5, browTilt: 1.1, mouth: 'flat', mouthOpen: 0, blink: 0.35, cross: 0 };
FACES.soft = { eyeOpen: 1, pupil: 1.12, lookX: 0.5, lookY: -0.2, browY: 0.6, browTilt: 0.5, mouth: 'grin', mouthOpen: 0.25, blink: 0.15, cross: 0 };
FACES.giggle = { eyeOpen: 1, pupil: 1, lookX: 0, lookY: 0, browY: 0.8, browTilt: 0.8, mouth: 'grin', mouthOpen: 0.6, blink: 0.75, cross: 0, squeeze: 0.5 };
FACES.pipSmug = { eyeOpen: 1, pupil: 1, lookX: 0.6, lookY: 0, browY: 0.2, browTilt: -0.6, mouth: 'grin', mouthOpen: 0.45, blink: 0.4, cross: 0 };
FACES.pipGlee = { eyeOpen: 1.15, pupil: 1.1, lookX: -0.4, lookY: 0, browY: 0.9, browTilt: -0.2, mouth: 'grin', mouthOpen: 0.9, blink: 0, cross: 0 };

let HOME_NIGHT = null, HOME_DAY = null, HOME_RAIN = null;

// ---------------------------------------------------------------- the room, drawn once per light (at 2x for close-ups)
function drawRoomStatic(c, day) {
  const wallTop = day ? '#4A5A8E' : '#1C2552', wallBot = day ? '#2C3866' : '#0B1030';
  const g = c.createLinearGradient(0, 0, 0, HOME.floorY);
  g.addColorStop(0, wallTop); g.addColorStop(1, wallBot);
  c.fillStyle = g; c.fillRect(-400, -200, W + 800, HOME.floorY + 200);
  // wallpaper stripes
  for (let x = -380; x < W + 400; x += 84) { c.fillStyle = day ? 'rgba(255,240,220,0.035)' : 'rgba(255,255,255,0.022)'; c.fillRect(x, -200, 40, HOME.floorY + 200); }
  // window (far left): rain at night, a blue morning sky by day
  const wx = 92, wy = 190, ww = 260, wh = 400;
  rrect(c, wx - 16, wy - 16, ww + 32, wh + 32, 10); c.fillStyle = day ? '#5D6AA0' : '#2B3364'; c.fill();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  if (day) { sky.addColorStop(0, '#7EC4FF'); sky.addColorStop(1, '#D8F0FF'); } else { sky.addColorStop(0, '#0E1C46'); sky.addColorStop(1, '#22397A'); }
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  if (day) {
    for (const [x, y, r] of [[150, 300, 38], [190, 290, 46], [235, 304, 34], [280, 470, 30], [310, 462, 40]]) circle(c, x, y, r, 'rgba(255,255,255,0.85)');
    // a tree's crown outside
    for (const [x, y, r] of [[120, 560, 70], [190, 590, 80], [300, 600, 70]]) circle(c, x, y, r, '#5FB36A');
  } else {
    const rs = mulberry32(5);
    for (let i = 0; i < 18; i++) circle(c, wx + rs() * ww, wy + rs() * wh * 0.6, 1 + rs() * 1.6, `rgba(220,230,255,${0.3 + rs() * 0.4})`);
    // city lights far away, blurred by the rain
    for (let i = 0; i < 14; i++) softDot(c, wx + 10 + rs() * (ww - 20), wy + wh * 0.72 + rs() * 90, 10 + rs() * 12, rs() < 0.5 ? '#FFC870' : '#9FD0FF', 0.6);
  }
  c.fillStyle = day ? '#5D6AA0' : '#2B3364'; c.fillRect(wx + ww / 2 - 6, wy, 12, wh); c.fillRect(wx, wy + wh / 2 - 6, ww, 12);
  rrect(c, wx - 30, wy + wh + 6, ww + 60, 22, 6); c.fillStyle = day ? '#6C78AE' : '#262E5E'; c.fill();   // sill
  for (const s of [-1, 1]) {   // curtains
    const cx = s < 0 ? wx - 56 : wx + ww - 14;
    const cg = c.createLinearGradient(cx, 0, cx + 70, 0);
    cg.addColorStop(0, day ? '#8A3A6E' : '#4A1F3F'); cg.addColorStop(0.5, day ? '#B04C8C' : '#6B2C55'); cg.addColorStop(1, day ? '#7A3060' : '#3A1832');
    c.fillStyle = cg; rrect(c, cx, wy - 50, 70, wh + 110, 14); c.fill();
    for (let i = 1; i < 4; i++) line(c, cx + i * 17, wy - 40, cx + i * 17, wy + wh + 50, 3, 'rgba(0,0,0,0.2)');
  }
  rrect(c, wx - 80, wy - 64, ww + 160, 20, 10); c.fillStyle = day ? '#3A4478' : '#20264C'; c.fill();
  // the front door (right), closed; its open state is drawn live
  const dx = HOME.doorX, dw = 230, dt = 250;
  rrect(c, dx - dw / 2 - 22, dt - 22, dw + 44, HOME.floorY - dt + 22, 8); c.fillStyle = day ? '#E8DCC0' : '#3A3A5E'; c.fill();
  doorLeaf(c, dx - dw / 2, dt, dw, HOME.floorY - dt, day, 0);
  // the calendar (between the photos and the door): a big red circle around SUNDAY
  calendar(c, HOME.calX, 330, 1, day, 0);
  // skirting + floor
  c.fillStyle = day ? '#3A3E6A' : '#141A3C'; c.fillRect(-400, HOME.floorY - 26, W + 800, 26);
  const fg = c.createLinearGradient(0, HOME.floorY, 0, H + 200);
  fg.addColorStop(0, day ? '#5A3E3A' : '#2A1A22'); fg.addColorStop(1, day ? '#2E1E22' : '#0D080E');
  c.fillStyle = fg; c.fillRect(-400, HOME.floorY, W + 800, H - HOME.floorY + 200);
  for (let i = 0; i < 6; i++) { const y = HOME.floorY + 14 + i * i * 9 + i * 18; line(c, -400, y, W + 400, y, 2, 'rgba(0,0,0,0.28)'); }
  // the rug under the couch
  ellipse(c, HOME.couchX, HOME.floorY + 78, 640, 74, day ? '#6A3E7E' : '#3B2452');
  ellipse(c, HOME.couchX, HOME.floorY + 78, 590, 58, day ? '#7E4C94' : '#4A2E66');
  c.beginPath(); c.ellipse(HOME.couchX, HOME.floorY + 78, 540, 46, 0, 0, 7); c.lineWidth = 4; c.setLineDash([16, 12]); c.strokeStyle = 'rgba(255,214,120,0.28)'; c.stroke(); c.setLineDash([]);
}

function doorLeaf(c, x, y, w, h, day, open) {
  // open 0..1: the leaf swings toward the room (it narrows and moves right)
  const ww = w * (1 - 0.82 * open);
  const g = c.createLinearGradient(x, 0, x + ww, 0);
  g.addColorStop(0, day ? '#B4562E' : '#5A2E2A'); g.addColorStop(1, day ? '#8A3E1E' : '#3E1E1E');
  c.fillStyle = g; c.fillRect(x + w - ww, y, ww, h);
  if (ww > 40) {
    for (const [py, ph] of [[0.08, 0.36], [0.52, 0.4]]) { c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.strokeRect(x + w - ww + ww * 0.14, y + h * py, ww * 0.72, h * ph); }
    circle(c, x + w - ww + ww * 0.12, y + h * 0.52, 11, '#FFD447');
    circle(c, x + w - ww + ww * 0.12 - 3, y + h * 0.52 - 3, 4, '#FFF6C8');
  }
}

// a wall calendar: a big number grid, SUNDAY circled in red (k = how much of the circle is drawn), a torn-page flip
function calendar(c, x, y, s, day, circleK, label = 'SUN', mark = 'PIP') {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, 0, -112, 0, -96, 4, '#20264C'); circle(c, 0, -114, 6, '#888CB0');
  rrect(c, -92, -96, 184, 210, 8); c.fillStyle = day ? '#FBF6EA' : '#C9C4D8'; c.fill();
  rrect(c, -92, -96, 184, 50, 8); c.fillStyle = '#E2424B'; c.fill(); c.fillRect(-92, -60, 184, 14);
  c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('OCTOBER', 0, -70);
  for (let r = 0; r < 4; r++) for (let q = 0; q < 7; q++) { c.fillStyle = 'rgba(40,40,70,0.35)'; c.fillRect(-80 + q * 23, -30 + r * 30, 16, 16); }
  c.font = '900 22px Montserrat'; c.fillStyle = '#1A1C2C'; c.fillText(mark, 58, 90);
  c.restore();
}

function initHome() {
  for (const day of [false, true]) {
    const cv = mkCanvas(W * 2 + 800, H * 2 + 400), c = cv.getContext('2d');
    c.setTransform(2, 0, 0, 2, 400, 200);
    drawRoomStatic(c, day);
    if (day) HOME_DAY = cv; else HOME_NIGHT = cv;
  }
  const rng = mulberry32(77);
  HOME_RAIN = [...Array(70)].map(() => ({ x: rng(), y: rng(), v: 0.5 + rng() * 0.6, l: 10 + rng() * 18 }));
}

// the room behind everything. o: {day 0..1 (crossfade), door 0..1 open, lamp 0..1 (on), sunK 0..1 (the wedge of sun)}
function homeBack(cam, t, o = {}) {
  applyCam(cam);
  const day = clamp(o.day || 0);
  if (day < 1) ctx.drawImage(HOME_NIGHT, -200, -100, W + 400, H + 200);
  if (day > 0) { ctx.globalAlpha = day; ctx.drawImage(HOME_DAY, -200, -100, W + 400, H + 200); ctx.globalAlpha = 1; }
  // rain on the window at night
  if (day < 0.9) {
    ctx.save(); ctx.beginPath(); ctx.rect(92, 190, 260, 400); ctx.clip();
    for (const d of HOME_RAIN) {
      const y = 190 + ((d.y * 400 + t * 420 * d.v) % 400), x = 92 + d.x * 260;
      line(ctx, x, y, x - 3, y + d.l, 1.6, `rgba(170,200,255,${0.35 * (1 - day)})`);
    }
    ctx.restore();
    softDot(gctx, 222, 390, 160, '#6F8BFF', 0.22 * (1 - day));
  } else softDot(gctx, 222, 390, 200, '#FFF4D0', 0.45 * day);
  // the open door: sunlight beyond, the leaf swung
  const dr = o.door || 0;
  if (dr > 0) {
    const dx = HOME.doorX, dw = 230, dt = 250, dh = HOME.floorY - dt;
    const sg = ctx.createLinearGradient(0, dt, 0, HOME.floorY);
    sg.addColorStop(0, '#FFF2C8'); sg.addColorStop(1, '#FFD07A');
    ctx.fillStyle = sg; ctx.fillRect(dx - dw / 2, dt, dw * clamp(dr * 1.2), dh);
    ctx.fillStyle = '#E8DCC0';
    doorLeaf(ctx, dx - dw / 2, dt, dw, dh, true, dr);
    softDot(gctx, dx, dt + dh * 0.5, 260, '#FFE6A0', 0.55 * dr);
  }
  // the warm wedge of sun across the floor (from the door)
  const sk = (o.sunK || 0) * dr;
  if (sk > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(HOME.doorX, 0, HOME.doorX - 900, 0);
    g.addColorStop(0, `rgba(255,214,140,${0.30 * sk})`); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(HOME.doorX - 115, HOME.floorY); ctx.lineTo(HOME.doorX + 115, HOME.floorY); ctx.lineTo(HOME.doorX - 700, H + 120); ctx.lineTo(HOME.doorX - 1500, H + 120); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

// the floor lamp (left of the couch): its pool of warm light is the night's key light
function homeLamp(t, on = 1) {
  const x = HOME.lampX, c = ctx;
  line(c, x, HOME.floorY, x, 440, 9, '#20264C'); ellipse(c, x, HOME.floorY + 2, 50, 10, '#20264C');
  c.beginPath(); c.moveTo(x - 76, 450); c.lineTo(x + 76, 450); c.lineTo(x + 50, 330); c.lineTo(x - 50, 330); c.closePath();
  const sh = c.createLinearGradient(0, 330, 0, 450); sh.addColorStop(0, mixHex('#5A4A6A', '#FFC870', on * 0.8)); sh.addColorStop(1, mixHex('#3A3050', '#FFE2A8', on));
  c.fillStyle = sh; c.fill();
  if (on > 0) {
    softDot(gctx, x, 470, 300, '#FFB060', 0.55 * on);
    softDot(ctx, x + 140, 640, 520, '#FFB870', 0.16 * on);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(0, 450, 0, HOME.floorY + 60); g.addColorStop(0, `rgba(255,190,110,${0.16 * on})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - 76, 450); c.lineTo(x + 76, 450); c.lineTo(x + 420, HOME.floorY + 60); c.lineTo(x - 300, HOME.floorY + 60); c.closePath(); c.fill();
    c.restore();
  }
}

// the couch: back + cushions (behind the hero)...
function couchBackL(day = 0) {
  const c = ctx, cx = HOME.couchX;
  const g = c.createLinearGradient(0, 500, 0, 800); g.addColorStop(0, mixHex('#2D7686', '#3E95A6', day)); g.addColorStop(1, mixHex('#17434D', '#235E6A', day));
  rrect(c, cx - 380, 500, 760, 300, 54); c.fillStyle = g; c.fill();
  for (const s of [-1, 1]) {
    const x = s < 0 ? cx - 360 : cx + 6;
    const cg = c.createLinearGradient(0, 520, 0, 720); cg.addColorStop(0, mixHex('#3A8C9C', '#4EB0C0', day)); cg.addColorStop(1, mixHex('#1E5562', '#2A7080', day));
    rrect(c, x, 520, 354, 210, 44); c.fillStyle = cg; c.fill();
    c.beginPath(); c.moveTo(x + 40, 536); c.quadraticCurveTo(x + 177, 526, x + 314, 536); c.lineWidth = 5; c.strokeStyle = 'rgba(190,240,250,0.16)'; c.lineCap = 'round'; c.stroke();
  }
  const sg = c.createLinearGradient(0, 700, 0, 790); sg.addColorStop(0, mixHex('#3F97A8', '#56B8C8', day)); sg.addColorStop(1, mixHex('#22606E', '#2E7A88', day));
  for (const x of [cx - 362, cx + 4]) { rrect(c, x, 702, 358, 92, 28); c.fillStyle = sg; c.fill(); }
}
// ...and its arms + base (in front of the cushions, behind his shins)
function couchFrontL(day = 0) {
  const c = ctx, cx = HOME.couchX;
  rrect(c, cx - 380, 780, 760, 62, 18); c.fillStyle = mixHex('#12363E', '#1C4C56', day); c.fill();
  for (const s of [-1, 1]) { rrect(c, cx + s * 330 - 18, 838, 36, 42, 6); c.fillStyle = '#0C1F24'; c.fill(); }
  for (const s of [-1, 1]) {
    const x = s < 0 ? cx - 440 : cx + 330;
    const g = c.createLinearGradient(x, 0, x + 110, 0); g.addColorStop(0, mixHex('#2A7080', '#3A90A0', day)); g.addColorStop(1, mixHex('#184650', '#22606C', day));
    rrect(c, x, 610, 110, 232, 46); c.fillStyle = g; c.fill();
    rrect(c, x + 10, 618, 90, 50, 24); c.fillStyle = 'rgba(190,240,250,0.10)'; c.fill();
  }
}

// seated legs: thighs toward the camera, shins down, shoes front-on (rig-local x, y, s like st)
function seatLegs(c, x, y, s, pal, kick = 0, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sd of [-1, 1]) {
    const kk = kick * (0.5 + 0.5 * Math.sin(t * 18 + sd * 1.7));
    c.save(); c.translate(sd * 41, 30); c.rotate(-sd * 0.25 * kk); c.translate(-sd * 41, -30);
    const g = c.createLinearGradient(0, 30, 0, 215); g.addColorStop(0, pal.pants); g.addColorStop(1, pal.pantsSh);
    rrect(c, sd * 41 - 25, 30, 50, 180 - 30 * kk, 20); c.fillStyle = g; c.fill();
    rrect(c, sd * 39 - 31, -26, 62, 78, 28); c.fillStyle = pal.pants; c.fill();
    ellipse(c, sd * 39, 22, 26, 14, 'rgba(255,255,255,0.05)');
    drawShoe(c, [sd * 41, 196 - 30 * kk], sd, pal, 1, false);
    c.restore();
  }
  c.restore();
}

// seated base pose (hands on the knees), with optional IK targets for either hand (rig-local)
function seatPose(o = {}) {
  const base = { hipY: -34, lean: o.lean || 0, armL: { a: 0.3, b: 0.2 }, armR: { a: 0.3, b: 0.2 }, legL: { a: 0, b: 0 }, legR: { a: 0, b: 0 }, hand: o.hand || 'open', feetFront: 1 };
  let p = ikReach(base, 'L', [-58, -36], -1); p = ikReach(p, 'R', [58, -36], -1);
  if (o.R) p = ikReach(p, 'R', o.R, o.bendR === undefined ? -1 : o.bendR);
  if (o.L) p = ikReach(p, 'L', o.L, o.bendL === undefined ? -1 : o.bendL);
  if (o.up > 0) p = lerpPose(p, Object.assign({}, p, { armL: { a: 2.35, b: 0.45 }, armR: { a: 2.2, b: 0.6 }, hand: 'spread' }), clamp(o.up));
  if (o.tremble) p = twitch(p, o.t || 0, o.tremble, 11);
  return p;
}

// ---------------------------------------------------------------- props
// The feather (the film's motif): a curved shaft from (x, y) along angle ang, length len; it flutters with t.
function feather(c, x, y, len, ang, t, o = {}) {
  const curl = o.curl === undefined ? 0.35 : o.curl, flut = o.flutter === undefined ? 1 : o.flutter;
  const colA = o.col || '#FF7FA8', colB = o.tip || '#FFE0EA';
  c.save(); c.translate(x, y); c.rotate(ang);
  const n = 22, P = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, w = 0.06 * flut * Math.sin(t * 9 + u * 5) * u;
    P.push([u * len, Math.sin(u * Math.PI * 0.9) * curl * len * 0.18 + w * len]);
  }
  // vanes: barbs on both sides, longest in the middle, swept toward the tip
  for (const side of [-1, 1]) {
    for (let i = 3; i < n; i++) {
      const u = i / n, [px, py] = P[i], [qx, qy] = P[i + 1] || P[i];
      const ang2 = Math.atan2(qy - py, qx - px), bl = len * 0.2 * Math.sin(Math.PI * Math.min(1, (u - 0.1) / 0.92)) * (side > 0 ? 1 : 0.85);
      const ba = ang2 + side * 1.05 - 0.35 * side * (1 - u) + 0.08 * flut * Math.sin(t * 11 + i * 0.7 + side);
      const ex = px + Math.cos(ba) * bl, ey = py + Math.sin(ba) * bl;
      c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + Math.cos(ba - side * 0.4) * bl * 0.6, py + Math.sin(ba - side * 0.4) * bl * 0.6, ex, ey);
      c.lineWidth = Math.max(2, len * 0.045); c.lineCap = 'round'; c.strokeStyle = mixHex(colA, colB, u); c.stroke();
    }
  }
  poly(c, P, Math.max(2, len * 0.022), '#FFFFFF');
  c.restore();
}
// a red sweatband round his forehead (his "training" kit); rig space after translate/scale
function headband(c, r, st, k = 1) {
  if (k <= 0) return;
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  c.globalAlpha *= clamp(k);
  c.beginPath(); c.ellipse(0, -30, 67, 18, 0, 0.05, Math.PI - 0.05); c.lineWidth = 19; c.strokeStyle = '#E2424B'; c.stroke();
  c.beginPath(); c.ellipse(0, -30, 67, 18, 0, 0.6, Math.PI - 0.6); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
  c.beginPath(); c.moveTo(62, -26); c.quadraticCurveTo(90, -14, 96, 10); c.lineWidth = 12; c.strokeStyle = '#C8323C'; c.stroke();   // the knot's tail
  c.restore();
}
// Pip's pigtails (rig space, before the head is drawn over them? they stick out at the sides, so after is fine)
function pigtails(c, r, st, t) {
  const [hx, hy] = r.head;
  c.save(); c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  for (const s of [-1, 1]) {
    const sw = 0.12 * Math.sin(t * 7 + s);
    c.save(); c.translate(s * 60, -36); c.rotate(s * (0.5 + sw));
    ellipse(c, s * 34, 6, 40, 26, PAL.hair, s * 0.2); ellipse(c, s * 52, 14, 22, 16, PAL.hair, s * 0.4);
    line(c, s * 22, -6, s * 54, 0, 4, PAL.hairHi);
    circle(c, s * 2, 2, 13, '#FFD447'); circle(c, s * 0 - 3, -2, 5, '#FFF6C8');
    c.restore();
  }
  // a fringe
  c.beginPath(); c.moveTo(-60, -20); c.quadraticCurveTo(-40, -2, -20, -24); c.quadraticCurveTo(0, -4, 20, -26); c.quadraticCurveTo(42, -4, 60, -20);
  c.lineTo(56, -52); c.lineTo(-56, -52); c.closePath(); c.fillStyle = PAL.hair; c.fill();
  c.restore();
}

// ---------------------------------------------------------------- characters with lighting (camera space)
// A character on its own layer, with an optional rotation about a world pivot (lying down), the room's light
// (warm lamp from the left at night, cool fill; or daylight), and a rim. o: {pal, rot, pivot, lightA, warm, post}
function figure(cam, st, t, o = {}) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  if (o.rot) { const [px, py] = o.pivot || [st.x, st.y]; lctx.translate(px, py); lctx.rotate(o.rot); lctx.translate(-px, -py); }
  const pal = o.pal || HOMEPAL;
  if (o.under) o.under(lctx, st);
  const r = drawCharacter(lctx, st, t, pal);
  if (o.post) { lctx.save(); lctx.translate(st.x, st.y); lctx.scale(st.s, st.s); o.post(lctx, r, st); lctx.restore(); }
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  const amb = o.ambient === undefined ? 0.18 : o.ambient;
  if (amb > 0) { lctx.fillStyle = o.ambCol || `rgba(16,20,60,${amb})`; if (o.ambCol) lctx.globalAlpha = amb; lctx.fillRect(0, 0, W, H); lctx.globalAlpha = 1; }
  if (o.warm > 0) {   // a warm key from one side (lamp or sun): x0 = the bright side in screen px
    const [lx] = toScreen(cam, o.warmX === undefined ? HOME.lampX : o.warmX, 0);
    const g = lctx.createLinearGradient(lx, 0, lx + (o.warmDir || 1) * 900 * cam.zoom, 0);
    g.addColorStop(0, rgba(o.warmCol || '#FFB060', 0.28 * o.warm)); g.addColorStop(1, rgba(o.warmCol || '#FFB060', 0));
    lctx.globalCompositeOperation = 'source-atop'; lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  }
  lctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}

// the hero seated on the couch. h: {face, R/L (IK targets), up, lean, tremble, kick, headDX/DY/Rot, band, feather:
// {len, ang, curl} at his right hand, shake (laughing), dx}
function heroSeated(cam, t, h = {}, o = {}) {
  const shk = h.shake || 0;
  const st = { x: HOME.hx + (h.dx || 0) + shk * 6 * Math.sin(t * 40), y: HOME.seatY + (h.dy || 0) + shk * 4 * Math.abs(Math.sin(t * 23)), s: HOME.hs * (h.sMul || 1),
    face: h.face || FACES.calm, pose: h.pose || seatPose(Object.assign({ t }, h)), noLegs: true, seed: 4,
    headDX: (h.headDX || 0) + shk * 5 * Math.sin(t * 31), headDY: (h.headDY || 0), headRot: (h.headRot || 0) + shk * 0.08 * Math.sin(t * 17) };
  applyCam(cam);
  seatLegs(ctx, st.x, st.y, st.s, HOMEPAL, h.kick || 0, t);
  const r = figure(cam, st, t, Object.assign({ warm: o.warm === undefined ? 1 : o.warm, ambient: o.ambient }, o, {
    post: (lc, rr, s2) => {
      if (h.band) headband(lc, rr, s2, h.band);
      if (h.feather) { const f = h.feather, wr = rr.wrR, d = rr.armDirR; feather(lc, wr[0] + d[0] * 18 + (f.ox || 0), wr[1] + d[1] * 18 + (f.oy || 0), f.len || 150, f.ang === undefined ? -1.9 : f.ang, t, f); }
      if (h.featherL) { const f = h.featherL, wr = rr.wrL, d = rr.armDirL; feather(lc, wr[0] + d[0] * 18, wr[1] + d[1] * 18, f.len || 150, f.ang === undefined ? -1.2 : f.ang, t, f); }
      if (h.postX) h.postX(lc, rr, s2);
    },
  }));
  return { st, r };
}
// rig-local -> world for a seated hero (for aiming props and cameras)
function heroPt(h, p) { return [HOME.hx + (h && h.dx || 0) + p[0] * HOME.hs, HOME.seatY + p[1] * HOME.hs]; }

// Pip standing (or pouncing). p: {x, y (feet), s, pose, face, rot, feather {len, ang}, dir (-1 faces left; the rig is
// front-on, so it only shifts her look)}
function pipFigure(cam, t, p, o = {}) {
  const st = { x: p.x, y: p.y, s: p.s || 0.42, pose: p.pose || POSES.stand, face: p.face || FACES.pipSmug, seed: 9,
    headDX: p.headDX || 0, headDY: p.headDY || 0, headRot: p.headRot || 0 };
  return figure(cam, st, t, Object.assign({ pal: PIPPAL, warm: 0.8 }, o, {
    rot: p.rot, pivot: p.pivot,
    post: (lc, rr, s2) => {
      pigtails(lc, rr, s2, t);
      if (p.feather) { const f = p.feather, wr = rr.wrR, d = rr.armDirR; feather(lc, wr[0] + d[0] * 16, wr[1] + d[1] * 16, f.len || 220, f.ang === undefined ? -1.3 : f.ang, t, f); }
    },
  }));
}

// laughter marks ("HA" letters popping off a laughing head), screen space
function haMarks(x, y, t, k = 1, seed = 1, size = 64) {
  if (k <= 0) return;
  screenSpace();
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i / 4 + hash(seed + i) * 0.2) % 1, side = i % 2 ? 1 : -1;
    const px = x + side * (90 + 120 * ph), py = y - 40 - 150 * ph;
    const a = Math.sin(Math.PI * ph) * k;
    ctx.save(); ctx.translate(px, py); ctx.rotate(side * 0.25); ctx.globalAlpha = a;
    ctx.font = `400 ${size * (0.8 + 0.4 * ph)}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 10; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('HA', 0, 0); ctx.fillStyle = '#FFD447'; ctx.fillText('HA', 0, 0);
    ctx.restore();
  }
}
