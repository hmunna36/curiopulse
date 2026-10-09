// The exam hall (borrowed from stomach-growl, 3 Oct 2026; for why-we-dream the classmates' faces are paint and their
// limbs are flat colour, so the cinematic light draws the shadows). A silent hall seen from the front (the proctor's view): tall windows with
// daylight shafts, a big wall clock, rows of desks in depth with classmates (their own simple rig, adapted from
// yawning-contagious's passengers, so nobody looks like the hero), and the hero at his desk in the front row.
// World coords: 1080x1920 at zoom 1. Every time comes from a cue (scenes.js); nothing here is timed.
'use strict';

// rows (back to front): desk-top y, scale, seat xs. The hero sits front-centre.
const HALL = {
  rows: [
    { y: 812, s: 0.5, xs: [205, 415, 665, 875] },
    { y: 1000, s: 0.74, xs: [95, 370, 710, 985] },
  ],
  hero: { x: 540, y: 1262, s: 1.0 },          // pelvis (seat) level of the hero
  deskTop: 1250,                               // the hero's desk top
  front: [-60, 1140],                          // front-row neighbours, half out of frame
  clock: [540, 395, 92],
};
// classmates' looks (no one shares the hero's face, hair or palette)
const STUD = {
  pony: { skin: '#F0C7A6', skinSh: '#CF9B7A', hair: '#B5532E', hairSh: '#8A3A1C', style: 'pony', top: '#5FB8D8', topSh: '#3B8FB0', mouth: '#5A1522' },
  curly: { skin: '#9A6446', skinSh: '#76492F', hair: '#1E1512', hairSh: '#120C0A', style: 'curly', top: '#2DBA82', topSh: '#1E8259', mouth: '#4A1018' },
  bun: { skin: '#EDBFA0', skinSh: '#C98F70', hair: '#3A2620', hairSh: '#24160F', style: 'bun', top: '#9A62C4', topSh: '#6C4092', extra: 'glasses', mouth: '#5A1522' },
  buzz: { skin: '#C99070', skinSh: '#A06A4C', hair: '#3A2A22', hairSh: '#241812', style: 'bald', top: '#E0A33A', topSh: '#B07A1E', mouth: '#4A1018' },
  red: { skin: '#F3D2B8', skinSh: '#D6A888', hair: '#D9772E', hairSh: '#A9561A', style: 'pony', top: '#E05A6A', topSh: '#B23A4A', mouth: '#5A1522' },
  dark: { skin: '#6E4630', skinSh: '#55331F', hair: '#141010', hairSh: '#0A0808', style: 'curly', top: '#4A5BD0', topSh: '#3241A0', extra: 'glasses', mouth: '#3A0C12' },
  proctor: { skin: '#C99070', skinSh: '#A06A4C', hair: '#8C8C96', hairSh: '#62626C', style: 'bald', top: '#3E4A63', topSh: '#283247', extra: 'tie', tie: '#C0392B', mouth: '#4A1018' },
};
// who sits where (row index -> looks), front neighbours
const SEATING = [['bun', 'buzz', 'red', 'curly'], ['dark', 'pony', 'curly', 'bun']];
const FRONT_LOOKS = ['red', 'dark'];
// the hero's exam outfit: a maroon cardigan (the pj flag draws the button placket + collar); face, hair and proportions unchanged
const EXAMPAL = Object.assign({}, PAL, { coat: '#A3415A', coatSh: '#76293F', coatHi: '#D07088', coatDk: '#5E1F31' });
EXAMPAL.pj = true;
let HALL_FLOOR = null, HALL_WALL = null;

function initExam() {
  // the back wall (static): panelling, windows' frames, the board line (light shafts are drawn per frame)
  HALL_WALL = mkCanvas(1600, 1100);
  const x = HALL_WALL.getContext('2d'), rng = mulberry32(77);
  const g = x.createLinearGradient(0, 0, 0, 1100);
  g.addColorStop(0, '#0E2430'); g.addColorStop(0.55, '#173847'); g.addColorStop(1, '#10262F');
  x.fillStyle = g; x.fillRect(0, 0, 1600, 1100);
  // wainscot panels along the bottom
  x.fillStyle = '#2A1E1A'; x.fillRect(0, 900, 1600, 200);
  for (let px = 20; px < 1600; px += 150) { rrect(x, px, 920, 130, 160, 8); x.lineWidth = 4; x.strokeStyle = 'rgba(255,220,180,0.10)'; x.stroke(); }
  line(x, 0, 900, 1600, 900, 8, '#4A3328');
  // faint plaster texture
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${0.012 + 0.02 * rng()})`; x.fillRect(rng() * 1600, rng() * 900, 2 + rng() * 40, 1 + rng() * 3); }
  // the floor: varnished planks, seen from above at a slant
  HALL_FLOOR = mkCanvas(1600, 1200);
  const f = HALL_FLOOR.getContext('2d');
  const fg = f.createLinearGradient(0, 0, 0, 1200);
  fg.addColorStop(0, '#3B2618'); fg.addColorStop(1, '#1A0F09');
  f.fillStyle = fg; f.fillRect(0, 0, 1600, 1200);
  for (let y = 0; y < 1200; y += 46) {
    line(f, 0, y, 1600, y, 3, 'rgba(0,0,0,0.35)');
    for (let px = (y / 46 % 2) * 120; px < 1600; px += 240) line(f, px, y, px, y + 46, 2, 'rgba(0,0,0,0.3)');
    f.fillStyle = `rgba(255,190,120,${0.02 + 0.03 * rng()})`; f.fillRect(0, y + 6, 1600, 10);
  }
}

// ---------------------------------------------------------------- the hall (back wall, windows, clock, floor)
// o: {tick (second-hand angle in turns), shafts 0..1, x0, x1, clockStop}
function examHall(cam, t, o = {}) {
  const c = ctx;
  applyCam(cam);
  c.drawImage(HALL_WALL, -260, -340);
  c.drawImage(HALL_FLOOR, -260, 760, 1600, 1500);
  // the far wall's base shadow
  const sh = c.createLinearGradient(0, 740, 0, 820); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.45)');
  c.fillStyle = sh; c.fillRect(-260, 740, 1600, 80);
  // tall windows (daylight), arched
  for (const wx of [70, 790]) hallWindow(c, wx, -120, 220, 700, t);
  // the clock
  const [cx, cy, cr] = HALL.clock;
  softDot(c, cx, cy, cr * 1.9, '#FFE8B0', 0.10);
  circle(c, cx, cy + 8, cr + 12, 'rgba(0,0,0,0.35)');
  circle(c, cx, cy, cr + 12, '#2B2B33'); circle(c, cx, cy, cr, '#F4EFE2');
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, r0 = i % 3 ? cr * 0.84 : cr * 0.76;
    line(c, cx + Math.sin(a) * r0, cy - Math.cos(a) * r0, cx + Math.sin(a) * cr * 0.93, cy - Math.cos(a) * cr * 0.93, i % 3 ? 3 : 6, '#2B2B33');
  }
  const tick = o.tick || 0;
  const hA = (10 + 2 / 60) / 12 * Math.PI * 2, mA = (2 + tick / 60) / 60 * Math.PI * 2, sA = tick * Math.PI * 2;
  line(c, cx, cy, cx + Math.sin(hA) * cr * 0.5, cy - Math.cos(hA) * cr * 0.5, 9, '#1A1A22');
  line(c, cx, cy, cx + Math.sin(mA) * cr * 0.74, cy - Math.cos(mA) * cr * 0.74, 6, '#1A1A22');
  line(c, cx - Math.sin(sA) * cr * 0.16, cy + Math.cos(sA) * cr * 0.16, cx + Math.sin(sA) * cr * 0.84, cy - Math.cos(sA) * cr * 0.84, 3, '#D0342C');
  circle(c, cx, cy, 7, '#D0342C');
  const gl = c.createLinearGradient(cx - cr, cy - cr, cx + cr, cy + cr);
  gl.addColorStop(0, 'rgba(255,255,255,0.35)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)');
  c.fillStyle = gl; c.beginPath(); c.arc(cx, cy, cr, 0, Math.PI * 2); c.fill();
  // the sign under the clock
  rrect(c, cx - 150, cy + 128, 300, 64, 10); c.fillStyle = '#E9E2CF'; c.fill();
  c.font = '900 34px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#B4282E';
  c.fillText('SILENCE', cx, cy + 162);
}

function hallWindow(c, x, y, w, h, t) {
  c.save();
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#CFE6FF'); g.addColorStop(0.6, '#8FB6E0'); g.addColorStop(1, '#6E8FC0');
  c.fillStyle = g; c.fill();
  c.clip();
  // trees outside (soft)
  for (let i = 0; i < 5; i++) softDot(c, x + 30 + i * 45, y + h - 80 - 40 * Math.sin(i * 2.1), 70, '#5E8A6A', 0.45);
  c.restore();
  // glow (bloom)
  gctx.save(); gctx.globalAlpha = 0.55;
  softDot(gctx, x + w / 2, y + h * 0.45, w * 0.9, '#D8ECFF', 0.8);
  gctx.restore();
  // mullions
  c.lineWidth = 12; c.strokeStyle = '#1A2A33';
  c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.42); c.lineTo(x + w, y + h * 0.42); c.moveTo(x, y + h * 0.74); c.lineTo(x + w, y + h * 0.74); c.stroke();
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath();
  c.lineWidth = 18; c.strokeStyle = '#22343E'; c.stroke();
  rrect(c, x - 20, y + h - 6, w + 40, 24, 6); c.fillStyle = '#2E434E'; c.fill();
}

// daylight shafts from the windows, slanting down into the room (additive, drawn after the people)
function hallShafts(cam, t, a = 1) {
  applyCam(cam);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [wx, dir] of [[180, 1], [900, -1]]) {
    const g = ctx.createLinearGradient(wx, 300, wx + dir * 420, 1500);
    g.addColorStop(0, `rgba(190,220,255,${0.13 * a})`); g.addColorStop(1, 'rgba(190,220,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(wx - 90, 200); ctx.lineTo(wx + 90, 200); ctx.lineTo(wx + dir * 560 + 160, 1700); ctx.lineTo(wx + dir * 560 - 260, 1700); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // motes inside the shafts
  for (let i = 0; i < 26; i++) {
    const u = (hash(i * 7) + t * (0.02 + 0.02 * hash(i))) % 1, side = i % 2;
    const wx = side ? 900 : 180, dir = side ? -1 : 1;
    const px = wx + dir * u * 520 + 60 * Math.sin(i * 3 + t * 0.6), py = 260 + u * 1300 + 30 * Math.sin(t * 0.8 + i);
    circle(ctx, px, py, 1.6 + 2.2 * hash(i + 3), `rgba(255,250,235,${0.35 * a * Math.sin(Math.PI * u)})`);
  }
}

// ---------------------------------------------------------------- desks + paper
// a desk seen from the front, slightly from above: x centre, y = top edge (front), s = scale
function desk(c, x, y, s, o = {}) {
  const w = 300 * s, d = 46 * s, hgt = 230 * s;
  // top surface (trapezoid, the back edge narrower)
  c.beginPath(); c.moveTo(x - w / 2 + 14 * s, y - d); c.lineTo(x + w / 2 - 14 * s, y - d); c.lineTo(x + w / 2, y); c.lineTo(x - w / 2, y); c.closePath();
  const g = c.createLinearGradient(0, y - d, 0, y); g.addColorStop(0, '#C89660'); g.addColorStop(1, '#A87442');
  c.fillStyle = g; c.fill();
  // paper on it
  if (o.paper !== false) {
    c.save(); c.translate(x + (o.px || -10) * s, y - d * 0.52); c.rotate(o.prot === undefined ? -0.05 : o.prot); c.scale(1, 0.42);
    rrect(c, -62 * s, -78 * s, 124 * s, 156 * s, 4 * s); c.fillStyle = '#F7F4EA'; c.fill();
    for (let i = 0; i < 7; i++) { rrect(c, -48 * s, (-56 + i * 18) * s, (92 - (i % 3) * 24) * s, 5 * s, 2 * s); c.fillStyle = '#B8B6C8'; c.fill(); }
    c.restore();
  }
  // front panel
  const fg = c.createLinearGradient(0, y, 0, y + hgt); fg.addColorStop(0, '#7A5230'); fg.addColorStop(1, '#3E2615');
  rrect(c, x - w / 2, y, w, hgt, 6 * s); c.fillStyle = fg; c.fill();
  line(c, x - w / 2, y + 3 * s, x + w / 2, y + 3 * s, 6 * s, '#D9A870');
  rrect(c, x - w / 2 + 18 * s, y + 30 * s, w - 36 * s, hgt - 50 * s, 8 * s); c.lineWidth = 3 * s; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.stroke();
}

// a pencil at (x, y) pointing up-left, length L; a = angle
function pencil(c, x, y, L, a, s = 1) {
  c.save(); c.translate(x, y); c.rotate(a);
  rrect(c, -4 * s, -L, 8 * s, L, 2 * s); c.fillStyle = '#F2C230'; c.fill();
  line(c, 0, -L, 0, -L - 10 * s, 7 * s, '#F09090');
  c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(4 * s, 0); c.lineTo(0, 12 * s); c.closePath(); c.fillStyle = '#E8C9A0'; c.fill();
  circle(c, 0, 11 * s, 1.8 * s, '#333');
  c.restore();
}

// ---------------------------------------------------------------- the classmates (upper body behind a desk)
// st: {x, y = seat level, s, lookX, lookY, tilt, brow 0..1, mouthO 0..1, smile, write 0..1 (pencil scribble), lean (toward the hero, px),
//      cover 0..1 (hand to mouth: a shush), blink}
function drawStudent(c, L, st, t) {
  const s = st.s || 1;
  c.save(); c.translate(st.x + (st.lean || 0), st.y); c.scale(s, s);
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
  } else {
    c.beginPath(); c.moveTo(-30, -172); c.quadraticCurveTo(0, -140, 30, -172); c.lineWidth = 8; c.strokeStyle = L.topSh; c.stroke();
  }
  rrect(c, -16, -196, 32, 34, 10); c.fillStyle = L.skinSh; c.fill();
  // arms: forearms on the desk; the right hand scribbles (write) or goes to the mouth (cover)
  const cov = clamp(st.cover || 0), wr8 = st.write || 0;
  const headY = -252 + (st.nod || 0) * 8;
  for (const sd of [-1, 1]) {
    const sh = [sd * 70, -160];
    let el = [sd * 88, -64], wr = [sd * 30, -14];
    if (sd === 1 && wr8 > 0) wr = [wr[0] + 6 * Math.sin(t * 23 + st.x) * wr8, wr[1] + 3 * Math.sin(t * 31 + st.x) * wr8];
    if (sd === 1 && cov > 0) { el = [lerp(el[0], 92, cov), lerp(el[1], -128, cov)]; wr = [lerp(wr[0], 8, cov), lerp(wr[1], headY + 30, cov)]; }
    if (CINE) { line(c, sh[0], sh[1], el[0], el[1], 34, L.top); line(c, el[0], el[1], wr[0], wr[1], 30, L.top); circle(c, wr[0], wr[1], 18, L.skin); }
    else {
      line(c, sh[0], sh[1], el[0], el[1], 36, L.topSh); line(c, sh[0] - sd * 3, sh[1], el[0] - sd * 3, el[1], 28, L.top);
      line(c, el[0], el[1], wr[0], wr[1], 32, L.topSh); line(c, el[0] - sd * 3, el[1], wr[0] - sd * 3, wr[1], 24, L.top);
      circle(c, wr[0], wr[1], 19, L.skinSh); circle(c, wr[0] - 2, wr[1] - 2, 16, L.skin);
    }
    if (sd === 1 && cov > 0.5) { line(c, wr[0] - 2, wr[1] - 4, wr[0] - 2, wr[1] - 40, 9, L.skin); }  // the shushing finger
    if (sd === 1 && wr8 > 0 && cov < 0.2) pencil(c, wr[0] - 6, wr[1] - 4, 54, -0.5, 1);
  }
  // head
  c.save(); c.translate((st.headDX || 0), headY); c.rotate(st.tilt || 0);
  if (L.style === 'curly') for (let i = 0; i < 13; i++) { const a = Math.PI * (0.95 + i * 0.085); circle(c, Math.cos(a) * 58, -8 + Math.sin(a) * 60, 26, L.hair); }
  if (L.style === 'pony') { ellipse(c, 52, 8, 22, 46, L.hair, -0.4); }
  for (const sd of [-1, 1]) { ellipse(c, sd * 54, 4, 11, 16, L.skinSh); }
  c.beginPath(); c.ellipse(0, 0, 56, 62, 0, 0, Math.PI * 2);
  const hg = c.createRadialGradient(-20, -24, 6, 0, 0, 72);
  hg.addColorStop(0, mixHex(L.skin, '#FFFFFF', 0.25)); hg.addColorStop(0.5, L.skin); hg.addColorStop(1, L.skinSh);
  c.fillStyle = hg; c.fill();
  if (L.style === 'bun') {
    c.beginPath(); c.moveTo(-58, 4); c.quadraticCurveTo(-64, -60, 0, -66); c.quadraticCurveTo(64, -60, 58, 4); c.quadraticCurveTo(40, -34, 0, -36); c.quadraticCurveTo(-40, -34, -58, 4); c.closePath();
    c.fillStyle = L.hair; c.fill(); circle(c, 0, -74, 26, L.hair); circle(c, -6, -80, 9, mixHex(L.hair, '#FFFFFF', 0.3));
  } else if (L.style === 'bald') {
    ellipse(c, -16, -40, 18, 9, 'rgba(255,255,255,0.35)', -0.3);
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 52, -6, 10, 26, 0, 0, Math.PI * 2); c.fillStyle = L.hair; c.fill(); }
    if (L.extra !== 'tie') { c.beginPath(); c.ellipse(0, -30, 54, 34, 0, Math.PI, Math.PI * 2); c.fillStyle = rgba(L.hair, 0.55); c.fill(); }  // buzz cut
  } else if (L.style === 'curly') {
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.105); circle(c, Math.cos(a) * 46, -10 + Math.sin(a) * 50, 22, L.hair); }
  } else if (L.style === 'pony') {
    c.beginPath(); c.moveTo(-58, 6); c.quadraticCurveTo(-62, -64, 4, -66); c.quadraticCurveTo(64, -58, 58, 2); c.quadraticCurveTo(20, -44, -20, -30); c.quadraticCurveTo(-46, -20, -58, 6); c.closePath();
    c.fillStyle = L.hair; c.fill();
  }
  // face (paint on the head: no edge, no shadow of its own)
  paint(() => {
  const bl = clamp(st.blink || 0), br = st.brow || 0, lx = clamp(st.lookX || 0, -1, 1), ly = clamp(st.lookY || 0, -1, 1);
  for (const sd of [-1, 1]) {
    const ex = sd * 20 + lx * 5, ey = -6;
    if (bl > 0.9) {
      c.beginPath(); c.moveTo(ex - 9, ey); c.quadraticCurveTo(ex, ey + 6, ex + 9, ey); c.lineWidth = 4; c.strokeStyle = '#3A1E16'; c.stroke();
    } else {
      ellipse(c, ex, ey, 9 + 1.5 * br, (11 + 2 * br) * (1 - bl), '#FFFFFF');
      circle(c, ex + lx * 4.5, ey + ly * 4, 5.5 - 1.2 * br, '#15132A');
      circle(c, ex + lx * 4.5 - 1.5, ey + ly * 4 - 2, 1.8, '#FFFFFF');
    }
    // brows: raised (br) or a glare (negative br: angled down toward the nose)
    const gl = Math.max(0, -br);
    line(c, sd * 10, -28 - Math.max(0, br) * 10 + gl * 6, sd * 30, -26 - Math.max(0, br) * 8 - gl * 4, 5, L.style === 'bald' ? L.hair : L.hairSh);
  }
  if (L.extra === 'glasses') { for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 20, -6, 15, 0, Math.PI * 2); c.lineWidth = 3.5; c.strokeStyle = '#3A2A52'; c.stroke(); } line(c, -5, -6, 5, -6, 3, '#3A2A52'); }
  ellipse(c, 0, 12, 7, 5, 'rgba(160,90,60,0.5)');
  if (L.extra === 'tie') { c.beginPath(); c.moveTo(-26, 26); c.quadraticCurveTo(0, 14, 26, 26); c.quadraticCurveTo(0, 22, -26, 26); c.lineWidth = 9; c.strokeStyle = L.hair; c.stroke(); }
  if ((st.mouthO || 0) > 0.05) {
    ellipse(c, 0, 34, 7 + 4 * st.mouthO, 8 + 8 * st.mouthO, L.mouth);
  } else if (st.shh) {
    ellipse(c, 0, 33, 9, 7, L.mouth);
  } else {
    const sm = st.smile || 0;
    c.beginPath(); c.moveTo(-12, 32 - 2 * Math.max(0, sm)); c.quadraticCurveTo(0, 32 + 12 * sm, 12, 32 - 2 * Math.max(0, sm));
    c.lineWidth = 4.5; c.strokeStyle = L.mouth; c.lineCap = 'round'; c.stroke();
  }
  });
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- the hero at his desk
// arms forward onto the desk (writing), or a thumbs-up (thumb 0..1), or a hand to the mouth (whisper 0..1)
function heroDeskPose(o = {}) {
  const p = JSON.parse(JSON.stringify(POSES.sit));
  p.armL = { a: 0.24, b: -0.7 };
  p.armR = { a: 0.24, b: -0.7 };
  if (o.write) { const w = o.write; p.armR.a += 0.03 * Math.sin(o.t * 21) * w; p.armR.b += 0.06 * Math.sin(o.t * 29) * w; }
  if (o.thumb > 0) { const k = E.outBack(clamp(o.thumb)); p.armR = { a: lerp(p.armR.a, 0.85, k), b: lerp(p.armR.b, 1.95, k) }; }
  if (o.whisper > 0) { const k = E.inOutSine(clamp(o.whisper)); p.armR = { a: lerp(p.armR.a, 0.62, k), b: lerp(p.armR.b, 2.55, k) }; }
  if (o.shrug > 0) { const k = E.inOutSine(clamp(o.shrug)); p.armL = { a: lerp(p.armL.a, 0.9, k), b: lerp(p.armL.b, 1.6, k) }; p.armR = { a: lerp(p.armR.a, 0.9, k), b: lerp(p.armR.b, 1.6, k) }; }
  p.hand = o.thumb > 0.5 ? 'thumbR' : 'open';
  return p;
}
// st: {x, y = seat level, s, face, write, thumb, whisper, shrug, headRot, headDX, headDY, pal, jolt (0..1 belly bounce)}
function heroAtDesk(c, st, t) {
  const pal = st.pal || EXAMPAL;
  const pose = heroDeskPose({ t, write: st.write || 0, thumb: st.thumb || 0, whisper: st.whisper || 0, shrug: st.shrug || 0 });
  const s = st.s, j = st.jolt || 0;
  const r = drawCharacter(c, Object.assign({}, st, { y: st.y + 34 * s - 10 * j * s, pose, noLegs: true }), t, pal);
  return r;
}
// the hero's belly (world) for the growl rings and the x-ray window
function heroBelly(st) { return [st.x, st.y - 62 * st.s]; }
function heroHead(st) { return [st.x + (st.headDX || 0) * st.s, st.y + (34 - 34 - 248) * st.s]; }

// sound rings: concentric arcs leaving a point (screen or world, under the current transform). k 0..1, n rings
function growlRings(c, x, y, k, o = {}) {
  if (k <= 0 || k >= 1) return;
  const n = o.n || 4, R = o.r || 260, col = o.col || '#FFB347', w = o.w || 10, squash = o.squash || 1;
  for (let i = 0; i < n; i++) {
    const u = clamp(k * 1.25 - i * 0.12);
    if (u <= 0 || u >= 1) continue;
    const r = 30 + R * E.outCubic(u), a = (1 - u) * (o.a || 1);
    for (const [cc, ww, al] of [[c, w, 0.9], [gctx, w * 2.2, 0.55]]) {
      cc.save();
      cc.beginPath();
      // wobbly ring: a growl isn't a clean tone
      for (let q = 0; q <= 48; q++) {
        const th = q / 48 * Math.PI * 2, wob = 1 + 0.06 * Math.sin(th * 7 + i * 2 + k * 20);
        const px = x + Math.cos(th) * r * wob, py = y + Math.sin(th) * r * wob * squash;
        q ? cc.lineTo(px, py) : cc.moveTo(px, py);
      }
      cc.lineWidth = ww * (1 - 0.5 * u); cc.strokeStyle = rgba(col, al * a); cc.stroke();
      cc.restore();
    }
  }
}

// the onomatopoeia: wobbly letters (screen space). k = pop-in, wob = rumble amount
function growlWord(txt, x, y, size, k, t, wob = 1, col = '#FFB347', rot = -0.06) {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `400 ${size}px Anton`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const widths = [...txt].map((ch) => ctx.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0);
  let px = -total / 2;
  [...txt].forEach((ch, i) => {
    const jx = wob * 7 * Math.sin(t * 37 + i * 2.3), jy = wob * 9 * Math.sin(t * 29 + i * 1.7) + Math.sin(i * 0.9) * size * 0.05;
    const sc = 1 + 0.08 * wob * Math.sin(t * 19 + i);
    ctx.save(); ctx.translate(px + widths[i] / 2 + jx, jy); ctx.scale(sc, sc);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,12,0.5)'; ctx.fillText(ch, 4, size * 0.06);
    ctx.lineWidth = size * 0.14; ctx.strokeStyle = '#1A0A04'; ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = col; ctx.fillText(ch, 0, 0);
    ctx.restore();
    px += widths[i];
  });
  ctx.restore();
  // its glow
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  softDot(gctx, x, y, size * 1.6, col, 0.35 * k);
  gctx.restore();
}

// draws the whole hall with everyone in it. o: {tick, stare 0..1 (heads turn to the hero), glare 0..1, write 0..1,
// hero: st overrides, belly k for the rings, shafts}
function examScene(cam, t, o = {}) {
  examHall(cam, t, { tick: o.tick || 0 });
  const H0 = HALL.hero;
  const stare = o.stare || 0, glare = o.glare || 0, write = o.write === undefined ? 1 : o.write;
  HALL.rows.forEach((row, ri) => {
    row.xs.forEach((x, i) => {
      const L = STUD[SEATING[ri][i]];
      const dir = Math.sign(H0.x - x) || 1;
      const ph = (i * 0.37 + ri * 0.21);
      const turn = clamp(stare * 1.4 - ph * 0.5);    // staggered: nearer heads turn first
      drawStudent(ctx, L, {
        x, y: row.y + 14 * row.s, s: row.s, lookX: dir * turn, lookY: 0.6 * turn, tilt: dir * 0.10 * turn,
        brow: turn * (1 - glare) - glare * 0.9, mouthO: turn * (1 - glare) * (i % 2 ? 0.8 : 0), write: write * (1 - turn),
        lean: dir * 10 * turn * row.s, blink: blinkAt(t, ri * 4 + i),
      }, t);
      desk(ctx, x, row.y, row.s, { px: -12 + 6 * i, prot: -0.08 + 0.05 * i });
    });
  });
  // the front-row neighbours (half out of frame)
  HALL.front.forEach((x, i) => {
    const L = STUD[FRONT_LOOKS[i]], dir = Math.sign(H0.x - x);
    const turn = clamp(stare * 1.6 - 0.1);
    drawStudent(ctx, L, { x, y: H0.y + 6, s: 1.0, lookX: dir * turn, lookY: 0.2 * turn, tilt: dir * 0.12 * turn, brow: turn * (1 - glare) - glare * 0.9,
      mouthO: i ? turn * (1 - glare) * 0.7 : 0, write: write * (1 - turn), lean: dir * 18 * turn, blink: blinkAt(t, 11 + i) }, t);
    desk(ctx, x, HALL.deskTop, 1.0, { px: -6, prot: 0.04 });
  });
  // the hero + his desk
  const hst = Object.assign({ x: H0.x, y: H0.y, s: H0.s, face: FACES.calm, write: write }, o.hero || {});
  const r = heroAtDesk(ctx, hst, t);
  desk(ctx, H0.x, HALL.deskTop, 1.0, { px: 18, prot: -0.04 });
  // his pencil (on the desk in his right hand while writing)
  if ((o.hero && o.hero.pencil === false) !== true) {
    const wr = toWorld(hst, r.wrR);
    if (!(o.hero && (o.hero.thumb > 0.3 || o.hero.whisper > 0.3))) pencil(ctx, wr[0] - 8, wr[1] - 30 * (o.hero && o.hero.jolt ? o.hero.jolt : 0), 64, -0.55 + 0.3 * ((o.hero && o.hero.jolt) || 0), 1);
  }
  return { r, hst };
}
// a blink now and then, deterministic per person
function blinkAt(t, id) {
  const per = 2.6 + 1.7 * hash(id * 13), ph = ((t + hash(id) * per) % per);
  return ph < 0.12 ? 1 - Math.abs(ph - 0.06) / 0.06 : 0;
}
