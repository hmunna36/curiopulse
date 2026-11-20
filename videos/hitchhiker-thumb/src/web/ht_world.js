// ht_world.js — Can Your THUMB Bend Back Like a Hitchhiker's? (20 Nov 2026). A desert highway at golden hour, built new:
// - `htSky`, `htLand`: the sky with a low sun and clouds, mesas, the desert floor, a two-lane road with a dashed line,
//   telephone poles and sagebrush (world = 1080x1920 at zoom 1; horizon y 1080, road y 1290-1400, gravel shoulder below);
// - `htBoard`: a roadside billboard on two posts: the school chart "2 KINDS OF THUMBS" (two thumbs with faces), the MYTH
//   stamp, an x-ray light box of seven thumbs from straight to hooked, a protractor with a needle and the 50° line, and a
//   sepia "SINCE 1953" card;
// - `htCar`: a car seen from the side, nose to the left (traffic runs right to left), a driver, spinning wheels, speed lines,
//   a skid (brake) with smoke;
// - `htHand`: the thumbs-up hand in 2D, wrist at (x, y): the fist edge-on (the back of the hand on the nail side, four
//   curled fingers on the palm side), the thumb in profile with its top joint bending back by `ip` (rad), the nail on the
//   back; `belt` puts a seatbelt strap across the joint's palm side (slack when straight, taut and LOCKED at the limit),
//   `bungee` a striped bungee cord instead, `glass` turns the skin to glass and shows the two thumb bones;
// - `htRivalPost`: the rival hitchhiker's ponytail and cap (drawn on her rig layer).
'use strict';

const HT = { hz: 1080, road0: 1290, road1: 1400, hx: 620, hy: 1760, hs: 1.0, rx: 250, ry: 1730, rs: 0.94 };
const HT_SKY = [[0, '#1E5FD0'], [0.45, '#3F8FEA'], [0.72, '#8CC4F2'], [0.88, '#FFD9A0'], [1, '#FFB36B']];
const HT_SKY_Y0 = -300, HT_SKY_Y1 = HT.hz;
const HT_SUN = [250, 930];
const HT_INK = '#1B1430';
let HT_BRUSH = null, HT_STONES = null, HT_POLES = null, HT_CLOUDS = null;

function initHt() {
  const r = mulberry32(2026);
  HT_BRUSH = [...Array(46)].map(() => ({ x: -600 + r() * 2300, y: HT.hz + 14 + Math.pow(r(), 1.6) * 190, s: 0.5 + r() * 0.9, k: r() }));
  HT_BRUSH.sort((a, b) => a.y - b.y);
  HT_STONES = [...Array(70)].map(() => ({ x: -600 + r() * 2300, y: HT.road1 + 16 + Math.pow(r(), 1.3) * 700, s: 3 + r() * 9, k: r() }));
  HT_POLES = [-520, -120, 280, 680, 1080, 1480].map((x, i) => ({ x, h: 230, i }));
  HT_CLOUDS = [[120, 520, 1.0], [560, 380, 0.75], [930, 600, 0.9], [-260, 700, 0.8], [1350, 470, 0.85], [700, 770, 0.55]];
}

function htGrad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); for (const [u, col] of stops) g.addColorStop(u, col); return g; }

// ---------------------------------------------------------------- the sky
function htSky(cam, t) {
  const c = ctx;
  applyCam(cam);
  c.fillStyle = htGrad(c, HT_SKY_Y0, HT_SKY_Y1, HT_SKY); c.fillRect(-3000, -3000, 7000, 3000 + HT.hz + 10);
  // the low sun with its halo (glow layer too)
  const [sx, sy] = HT_SUN;
  softDot(c, sx, sy, 420, '#FFC37A', 0.5);
  softDot(gctx, sx, sy, 260, '#FFB15A', 0.6);
  paint(() => { circle(c, sx, sy, 62, '#FFF1C4'); });
  circle(gctx, sx, sy, 56, rgba('#FFE7A8', 0.8));
  // clouds: soft cream puffs lit pink-gold from below, drifting on a loop-safe clock
  for (let i = 0; i < HT_CLOUDS.length; i++) {
    const [x, y, s] = HT_CLOUDS[i], dx = 30 * Math.sin(t * loopW(0.09) + i * 1.9);
    htCloud(c, x + dx, y, s);
  }
}
function htCloud(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#F6B9A0'; c.beginPath(); c.ellipse(0, 18, 170, 30, 0, 0, 7); c.fill();
  c.fillStyle = '#FFF4E6';
  for (const [px, py, r] of [[-110, 0, 46], [-50, -34, 62], [24, -46, 70], [92, -14, 52], [146, 8, 30], [-156, 10, 26]]) { c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); }
  c.beginPath(); c.rect(-156, -4, 302, 26); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- the land: mesas, desert, road, poles, brush
function htLand(cam, t, o = {}) {
  const c = ctx;
  applyCam(cam);
  // far mesas (two layers), flat tops
  const mesa = (pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-3000, HT.hz + 4); for (const p of pts) c.lineTo(p[0], p[1]); c.lineTo(4000, HT.hz + 4); c.closePath(); c.fill(); };
  mesa([[-900, HT.hz], [-700, HT.hz - 60], [-420, HT.hz - 66], [-380, HT.hz - 30], [-100, HT.hz - 24], [60, HT.hz - 92], [330, HT.hz - 98], [380, HT.hz - 40], [700, HT.hz - 30],
    [760, HT.hz - 120], [1080, HT.hz - 126], [1140, HT.hz - 50], [1500, HT.hz - 44], [1560, HT.hz - 84], [1900, HT.hz - 80], [1960, HT.hz]], '#D98C8A');
  mesa([[-900, HT.hz], [-560, HT.hz - 20], [-200, HT.hz - 36], [-150, HT.hz - 12], [420, HT.hz - 10], [480, HT.hz - 52], [610, HT.hz - 56], [650, HT.hz - 14], [1280, HT.hz - 10],
    [1330, HT.hz - 62], [1600, HT.hz - 66], [1640, HT.hz - 8], [1960, HT.hz]], '#B9686E');
  paint(() => {                                              // sunlit cliff bands on the mesas
    c.fillStyle = rgba('#FFC08A', 0.5);
    for (const [x0, x1, y] of [[60, 330, HT.hz - 92], [760, 1080, HT.hz - 120], [1560, 1900, HT.hz - 80]]) { c.fillRect(x0 + 6, y + 6, x1 - x0 - 12, 8); }
  });
  // the desert floor
  c.fillStyle = htGrad(c, HT.hz, HT.road0, [[0, '#F0B77A'], [1, '#E29C5E']]); c.fillRect(-3000, HT.hz, 7000, HT.road0 - HT.hz + 2);
  // telephone poles receding along the far side of the road, with a sagging wire
  for (const p of HT_POLES) {
    const bx = p.x, by = HT.road0 - 8;
    line(c, bx, by, bx, by - p.h, 10, '#6B4430');
    line(c, bx - 34, by - p.h + 18, bx + 34, by - p.h + 18, 8, '#6B4430');
  }
  paint(() => {
    c.strokeStyle = rgba('#3A2A2A', 0.7); c.lineWidth = 2.5;
    for (let i = 0; i < HT_POLES.length - 1; i++) {
      const a = HT_POLES[i], b = HT_POLES[i + 1];
      for (const dx of [-30, 30]) { c.beginPath(); c.moveTo(a.x + dx, HT.road0 - 8 - a.h + 16); c.quadraticCurveTo((a.x + b.x) / 2 + dx, HT.road0 - 8 - a.h + 64, b.x + dx, HT.road0 - 8 - b.h + 16); c.stroke(); }
    }
  });
  // sagebrush on the far desert
  for (const b of HT_BRUSH) htBrush(c, b.x, b.y, b.s * (0.5 + 0.5 * (b.y - HT.hz) / 200), b.k);
  if (o.board !== false) htBoard(c, t, o.boardState || {});
  // the road
  c.fillStyle = '#4A4B5E'; c.fillRect(-3000, HT.road0, 7000, HT.road1 - HT.road0);
  c.fillStyle = '#5B5D72'; c.fillRect(-3000, HT.road0, 7000, 10);
  paint(() => {
    c.fillStyle = '#F4EFE2'; c.fillRect(-3000, HT.road0 + 12, 7000, 5); c.fillRect(-3000, HT.road1 - 14, 7000, 5);
    c.fillStyle = '#FFC93A';
    for (let x = -3000; x < 4000; x += 110) c.fillRect(x, HT.road0 + 52, 60, 7);
  });
  // the gravel shoulder he stands on
  c.fillStyle = htGrad(c, HT.road1, HT.road1 + 600, [[0, '#D99760'], [1, '#C07A48']]); c.fillRect(-3000, HT.road1, 7000, 2000);
  paint(() => {
    for (const s of HT_STONES) ellipse(c, s.x, s.y, s.s * 1.6, s.s * 0.8, s.k > 0.5 ? rgba('#9A5E36', 0.8) : rgba('#F2C18E', 0.8));
  });
}
function htBrush(c, x, y, s, k) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = k > 0.5 ? '#8C9A5A' : '#7A8C56';
  c.beginPath(); c.ellipse(0, -14, 34, 18, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(-20, -8, 20, 12, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(22, -8, 22, 12, 0, 0, 7); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- the billboard (world). o: {chart, myth, xray, sweep,
// protractor, needle (rad), line50, card, faces: {straight, hook} moods}
const HTB = { x: 860, y: 905, w: 400, h: 250 };   // the panel's centre and size; posts down to the far road edge
function htBoardPt(u, v) { return [HTB.x + u * HTB.w / 2, HTB.y + v * HTB.h / 2]; }
function htBoard(c, t, o = {}) {
  const { x, y, w, h } = HTB;
  // posts and a catwalk
  for (const px of [x - w * 0.3, x + w * 0.3]) { c.fillStyle = '#5B4636'; c.fillRect(px - 9, y + h / 2 - 4, 18, HT.road0 - (y + h / 2) - 4); }
  c.fillStyle = '#3E3240'; c.fillRect(x - w / 2 - 6, y + h / 2 - 2, w + 12, 12);
  // the panel: a frame and a face
  rrect(c, x - w / 2 - 12, y - h / 2 - 12, w + 24, h + 24, 10); c.fillStyle = '#2E2A3E'; c.fill();
  const xr = clamp(o.xray || 0);
  rrect(c, x - w / 2, y - h / 2, w, h, 6); c.fillStyle = xr > 0.5 ? '#0E2348' : '#FFF6E2'; c.fill();
  // two lamps on arms over the top edge
  for (const lx of [x - w * 0.28, x + w * 0.28]) { line(c, lx, y - h / 2 - 10, lx, y - h / 2 - 34, 5, '#3E3240'); ellipse(c, lx, y - h / 2 - 36, 16, 7, '#3E3240'); }
  if (xr <= 0.5) htChart(c, t, o); else htXrays(c, t, o);
  if ((o.myth || 0) > 0.01) htStampW(c, 'MYTH', x, y + 8, o.myth, '#FF3B5C', -0.16, 96);
}
// the chart: title, two thumbs with faces, their labels
function htChart(c, t, o) {
  const { x, y, w, h } = HTB;
  paint(() => {
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '400 40px Anton'; c.fillStyle = '#2B2140'; c.fillText('2 KINDS OF THUMBS', x, y - h / 2 + 34);
    line(c, x, y - h / 2 + 62, x, y + h / 2 - 16, 4, rgba('#2B2140', 0.35));
    c.font = '400 30px Anton'; c.fillStyle = '#1E8E6E'; c.fillText('STRAIGHT', x - w / 4, y + h / 2 - 28);
    c.fillStyle = '#D9483A'; c.fillText("HITCHHIKER'S", x + w / 4, y + h / 2 - 28);
  });
  const f = o.faces || {};
  htMiniThumb(c, x - w / 4, y + 52, 0.95, 0.06, t, { face: f.straight || 'smug' });
  htMiniThumb(c, x + w / 4, y + 52, 0.95, 1.25, t, { face: f.hook || 'smug' });
}
// a small cartoon thumbs-up for the chart and the light box (wrist at x, y; bend in rad). o.xray: bones on navy
function htMiniThumb(c, x, y, s, bend, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const xr = !!o.xray, skin = xr ? rgba('#7FC8FF', 0.28) : '#F2B892', dk = xr ? rgba('#7FC8FF', 0.5) : '#CF8663';
  // fist
  rrect(c, -30, -64, 62, 64, 18); c.fillStyle = skin; c.fill();
  if (!xr) for (let i = 0; i < 3; i++) line(c, -30, -48 + i * 16, -6, -48 + i * 16, 3, dk);
  // thumb: proximal up from (-4, -60) to (-4, -98), distal bent back by `bend`
  const ip = [-2, -100], d = [Math.sin(bend), -Math.cos(bend)], tip = [ip[0] + d[0] * 34, ip[1] + d[1] * 34];
  line(c, -2, -58, ip[0], ip[1], 24, skin);
  line(c, ip[0], ip[1], tip[0], tip[1], 22, skin);
  if (xr) {
    line(c, -2, -60, ip[0], ip[1] + 3, 9, '#EAF6FF'); line(c, ip[0] + d[0] * 4, ip[1] + d[1] * 4, tip[0] - d[0] * 4, tip[1] - d[1] * 4, 8, '#EAF6FF');
    circle(c, ip[0], ip[1], 6, '#BFE4FF');
  } else {
    // the nail on the back of the tip
    const n = [Math.cos(bend), Math.sin(bend)];
    ellipse(c, tip[0] - d[0] * 8 + n[0] * 7, tip[1] - d[1] * 8 + n[1] * 7, 7, 10, '#FAD9CC', bend);
  }
  c.restore();
  // a face on the fist (chart thumbs only)
  if (o.face) paint(() => {
    const fx = x + 2 * s, fy = y - 34 * s;
    circle(c, fx - 9 * s, fy - 4 * s, 4.2 * s, HT_INK); circle(c, fx + 9 * s, fy - 4 * s, 4.2 * s, HT_INK);
    c.strokeStyle = HT_INK; c.lineWidth = 2.6 * s; c.lineCap = 'round'; c.beginPath();
    if (o.face === 'smug') { c.moveTo(fx - 8 * s, fy + 8 * s); c.quadraticCurveTo(fx, fy + 13 * s, fx + 9 * s, fy + 6 * s); }
    else if (o.face === 'shock') { c.arc(fx, fy + 10 * s, 4.5 * s, 0, 7); }
    else { c.moveTo(fx - 8 * s, fy + 12 * s); c.quadraticCurveTo(fx, fy + 6 * s, fx + 8 * s, fy + 12 * s); }
    c.stroke();
    if (o.face === 'shock') { line(c, fx - 14 * s, fy - 14 * s, fx - 5 * s, fy - 12 * s, 2.4 * s, HT_INK); line(c, fx + 14 * s, fy - 14 * s, fx + 5 * s, fy - 12 * s, 2.4 * s, HT_INK); }
  });
}
// the light box: seven thumbs from straight to hooked, a highlight that sweeps along them, the protractor, the 50° line,
// the 1953 card
const HT_ANG = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];
function htXrayX(i) { return HTB.x - HTB.w / 2 + 34 + i * (HTB.w - 68) / 6; }
function htXrays(c, t, o) {
  const { x, y, w, h } = HTB;
  paint(() => {
    // the light box's glow and grid
    c.fillStyle = rgba('#3C7BD8', 0.35); c.fillRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16);
    c.strokeStyle = rgba('#9FD3FF', 0.18); c.lineWidth = 1.5;
    for (let gx = x - w / 2 + 20; gx < x + w / 2; gx += 30) { c.beginPath(); c.moveTo(gx, y - h / 2 + 8); c.lineTo(gx, y + h / 2 - 8); c.stroke(); }
  });
  softDot(gctx, x, y, w * 0.55, '#3C8BFF', 0.35);
  const sw = o.sweep === undefined ? 1 : o.sweep;
  for (let i = 0; i < 7; i++) {
    const on = clamp((sw * 7.6 - i) * 1.4);
    const k = 0.55 + 0.45 * on;
    htMiniThumb(c, htXrayX(i), y + 62, 0.62 * (0.86 + 0.14 * E.outBack(on, 2.5)), HT_ANG[i], t, { xray: true });
    if (on > 0.02) softDot(gctx, htXrayX(i), y + 22, 30, '#9FE0FF', 0.4 * on);
    if (k < 0.99) { /* dim before the sweep reaches it */ c.fillStyle = rgba('#0E2348', 0.45 * (1 - on)); c.fillRect(htXrayX(i) - 26, y - 20, 52, 90); }
  }
  paint(() => {
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 34px Anton';
    c.fillStyle = rgba('#DFF2FF', clamp(sw * 1.4)); c.fillText('EVERY ANGLE', x, y - h / 2 + 32);
    c.font = '700 15px Montserrat'; c.fillStyle = rgba('#9FD3FF', 0.9);
    c.fillText('0°', htXrayX(0), y + h / 2 - 18); c.fillText('90°', htXrayX(6), y + h / 2 - 18);
  });
  const pk = clamp(o.protractor || 0);
  if (pk > 0.01) htProtractor(c, x, y + 6, pk, o.needle === undefined ? 0 : o.needle, t);
  const lk = clamp(o.line50 || 0);
  if (lk > 0.01) {
    const lx = (htXrayX(3) + htXrayX(4)) / 2 - 4, yy0 = y - h / 2 + 10, yy1 = lerp(yy0, y + h / 2 - 10, E.outCubic(lk));
    c.save(); c.setLineDash([14, 9]); line(c, lx, yy0, lx, yy1, 7, '#FF3B5C'); c.restore();
    line(gctx, lx, yy0, lx, yy1, 12, rgba('#FF3B5C', 0.5));
  }
  const ck = clamp(o.card || 0);
  if (ck > 0.01) htCard1953(c, x + w * 0.22, y - h * 0.02, ck);
}
function htProtractor(c, x, y, k, needle, t) {
  const R = 118 * E.outBack(k, 1.6);
  c.save(); c.translate(x, y);
  paint(() => {
    c.beginPath(); c.arc(0, 0, R, Math.PI, 2 * Math.PI); c.closePath();
    c.fillStyle = rgba('#FFF4C8', 0.82); c.fill(); c.lineWidth = 4; c.strokeStyle = '#B88A1E'; c.stroke();
    for (let d = 0; d <= 180; d += 10) {
      const a = Math.PI + d * Math.PI / 180, r0 = d % 30 === 0 ? R - 22 : R - 12;
      line(c, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * (R - 3), Math.sin(a) * (R - 3), 2.5, '#8A6410');
    }
    c.font = '700 14px Montserrat'; c.fillStyle = '#6A4A08'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const d of [0, 30, 60, 90]) { const a = -Math.PI / 2 + d * Math.PI / 180; c.fillText(d + '°', Math.cos(a) * (R - 38), Math.sin(a) * (R - 38)); }
    // the needle: 0 = straight up, + = leaning right (bent back)
    const a = -Math.PI / 2 + needle;
    line(c, 0, 0, Math.cos(a) * (R - 8), Math.sin(a) * (R - 8), 6, '#D9283A');
    circle(c, 0, 0, 9, '#D9283A');
  });
  c.restore();
}
function htCard1953(c, x, y, k) {
  const s = E.outBack(k, 2);
  c.save(); c.translate(x, y); c.rotate(0.07); c.scale(s, s);
  rrect(c, -86, -64, 172, 128, 8); c.fillStyle = '#E9D2A6'; c.fill();
  paint(() => {
    c.strokeStyle = rgba('#7A5A30', 0.5); c.lineWidth = 2; rrect(c, -78, -56, 156, 112, 6); c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 17px Montserrat'; c.fillStyle = '#6A4A28'; c.fillText('PICKED IN', 0, -32);
    c.font = '400 58px Anton'; c.fillStyle = '#5A3A1C'; c.fillText('1953', 0, 14);
  });
  c.restore();
}
// a stamp drawn in world space (the fx.js stamp is screen space)
function htStampW(c, txt, x, y, k, col, rot, size) {
  const s = lerp(2.2, 1, E.outCubic(clamp(k)));
  paint(() => {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = clamp(k * 3);
    c.font = `400 ${size}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const tw = c.measureText(txt).width + 60, th = size * 1.3;
    rrect(c, -tw / 2, -th / 2, tw, th, 14); c.lineWidth = 10; c.strokeStyle = col; c.stroke();
    rrect(c, -tw / 2 + 12, -th / 2 + 12, tw - 24, th - 24, 8); c.lineWidth = 3.5; c.stroke();
    c.fillStyle = col; c.fillText(txt, 0, 5);
    c.globalAlpha = 1; c.restore();
  });
}

// ---------------------------------------------------------------- a car from the side (nose left). o: {col, spin, brake 0..1,
// speed 0..1 (speed lines), driver mood, honk, door}
function htCar(c, x, y, s, t, o = {}) {
  const col = o.col || '#2E86DE', dk = o.dk || '#1C5FA6', sp = clamp(o.speed || 0);
  // speed lines behind it (world)
  if (sp > 0.02) paint(() => {
    for (let i = 0; i < 6; i++) {
      const yy = y - (14 + i * 15) * s, L = (90 + 70 * hash(i + 3)) * s * sp;
      line(c, x + (128 + 18 * hash(i)) * s, yy, x + (128 + 18 * hash(i)) * s + L, yy, 4 * s, rgba('#FFFFFF', 0.55 * sp));
    }
  });
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.025 * clamp(o.brake || 0));
  c.lineJoin = 'round';
  // body
  c.beginPath(); c.moveTo(-124, -16); c.lineTo(-120, -40); c.quadraticCurveTo(-112, -54, -84, -56); c.lineTo(-58, -58);
  c.quadraticCurveTo(-38, -104, 12, -106); c.quadraticCurveTo(58, -106, 76, -60); c.lineTo(110, -56); c.quadraticCurveTo(128, -52, 128, -30); c.lineTo(126, -16); c.closePath();
  c.fillStyle = col; c.fill();
  c.beginPath(); c.moveTo(-124, -30); c.lineTo(126, -30); c.lineTo(126, -16); c.lineTo(-124, -16); c.closePath(); c.fillStyle = dk; c.fill();
  // windows
  c.beginPath(); c.moveTo(-44, -60); c.quadraticCurveTo(-30, -94, 4, -96); c.lineTo(4, -60); c.closePath(); c.fillStyle = '#BFE6FF'; c.fill();
  c.beginPath(); c.moveTo(14, -60); c.lineTo(14, -96); c.quadraticCurveTo(50, -94, 64, -62); c.closePath(); c.fillStyle = '#BFE6FF'; c.fill();
  c.restore();
  // the driver, seen through the front window
  paint(() => {
    c.save(); c.translate(x, y); c.scale(s, s);
    circle(c, -16, -74, 13, '#8A5A3C');
    rrect(c, -30, -90, 28, 9, 4); c.fillStyle = '#E8343C'; c.fill();       // a cap
    circle(c, -22, -76, 2.6, HT_INK);
    if (o.honk > 0.1) { c.fillStyle = HT_INK; c.beginPath(); c.arc(-24, -66, 4, 0, 7); c.fill(); }
    // the door handle, the headlight and the bumper
    line(c, 8, -54, 8, -18, 3, rgba('#000000', 0.25)); rrect(c, 22, -48, 18, 6, 3); c.fillStyle = rgba('#000000', 0.3); c.fill();
    ellipse(c, -118, -36, 7, 9, '#FFF2A8');
    rrect(c, -130, -22, 30, 10, 5); c.fillStyle = '#C9CED8'; c.fill(); rrect(c, 104, -22, 26, 10, 5); c.fill();
    c.restore();
  });
  softDot(gctx, x - 118 * s, y - 36 * s, 26 * s, '#FFF2A8', 0.6);
  // wheels
  for (const wx of [-78, 78]) {
    c.save(); c.translate(x + wx * s, y - 4 * s); c.scale(s, s);
    circle(c, 0, 0, 27, '#1D1B26'); circle(c, 0, 0, 14, '#C9CED8');
    c.rotate(o.spin || 0); line(c, -12, 0, 12, 0, 4, '#6A7080'); line(c, 0, -12, 0, 12, 4, '#6A7080');
    c.restore();
  }
  // a skid: smoke puffs at the wheels and black marks
  const bk = clamp(o.brake || 0);
  if (bk > 0.02) {
    paint(() => { for (const wx of [-78, 78]) line(c, x + (wx + 20) * s, y + 22 * s, x + (wx + 20 + 130 * bk) * s, y + 22 * s, 6 * s, rgba('#1D1B26', 0.5 * bk)); });
    for (let i = 0; i < 5; i++) {
      const px = x + (90 + i * 26) * s, py = y - (6 + 10 * hash(i)) * s, r = (16 + 12 * hash(i + 9)) * s * bk;
      circle(c, px, py, r, rgba('#E9E4F0', 0.55 * bk));
    }
  }
  const hk = clamp(o.honk || 0);
  if (hk > 0.01) paint(() => {
    c.save(); c.translate(x - 140 * s, y - 50 * s); c.scale(s, s);
    for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(0, 0, 18 + i * 16 + 10 * hk, Math.PI * 0.75, Math.PI * 1.25); c.lineWidth = 6; c.strokeStyle = rgba('#FFD447', hk); c.lineCap = 'round'; c.stroke(); }
    c.restore();
  });
}

// ---------------------------------------------------------------- the thumbs-up hand (world). The wrist at (x, y), scale s
// (world px per unit), o: {dir: +1 = the nail faces +x (the tip bends toward +x), rot, ip (rad), shake, belt 0..1 (the strap
// shows), lock 0..1 (the buckle's red latch), bungee 0..1, glass 0..1, pal}. Returns world points {ip, tip, beltMid, nail}.
function htHand(c, x, y, s, o = {}) {
  const dir = o.dir || 1, rot = o.rot || 0, ip = o.ip || 0, pal = o.pal || PAL, gl = clamp(o.glass || 0);
  const sk = pal.skin, skSh = pal.skinSh, skHi = pal.skinHi;
  const P = (u, v) => { const cu = Math.cos(rot), su = Math.sin(rot); const uu = u * dir; return [x + (uu * cu - v * su) * s, y + (uu * su + v * cu) * s]; };
  const sh = o.shake || 0;
  // thumb geometry (hand units): MCP, IP, the tip
  const MCP = [-2, -106], IPj = [-1 + sh * 0.6, -146];
  const d = [Math.sin(ip), -Math.cos(ip)], L2 = 36;
  const TIP = [IPj[0] + d[0] * L2, IPj[1] + d[1] * L2];
  const cap = (a, b, ra, rb, col) => { const A = P(...a), B = P(...b); htCapsule(c, A, B, ra * s, rb * s, col); };
  const alpha = (col) => (gl > 0.01 ? rgba(mixH(col, '#9FD8FF', 0.45 * gl), 1 - 0.5 * gl) : col);
  // the back of the hand and the wrist
  c.save();
  const body = () => {
    c.beginPath();
    const pts = [[-30, -2], [-36, -40], [-38, -96], [-26, -118], [10, -122], [36, -110], [42, -70], [34, -20], [26, 4]];
    const Q = pts.map((p) => P(...p));
    c.moveTo(Q[0][0], Q[0][1]);
    for (let i = 1; i < Q.length; i++) { const m = [(Q[i - 1][0] + Q[i][0]) / 2, (Q[i - 1][1] + Q[i][1]) / 2]; c.quadraticCurveTo(Q[i - 1][0], Q[i - 1][1], m[0], m[1]); }
    c.lineTo(Q[Q.length - 1][0], Q[Q.length - 1][1]); c.closePath();
  };
  body(); c.fillStyle = alpha(sk); c.fill();
  // the four curled fingers on the palm side: stacked rolls with rounded ends toward -u
  const rows = [-100, -76, -52, -29];
  rows.forEach((v, i) => {
    const r = [15, 14.5, 14, 12.5][i];
    cap([16, v], [-40 + i * 2, v + 2], r, r * 0.98, alpha(i % 2 ? sk : mixH(sk, skSh, 0.12)));
  });
  if (gl < 0.5) paint(() => {
    rows.forEach((v, i) => {
      const a = P(-40 + i * 2 - 2, v - 6), b = P(-40 + i * 2 - 2, v + 8);
      line(c, a[0], a[1], b[0], b[1], 2.6 * s, rgba(skSh, 0.75));                          // the fingertip crease
      if (i < 3) { const e = P(-30, v + 12), f = P(12, v + 12); line(c, e[0], e[1], f[0], f[1], 2.2 * s, rgba(skSh, 0.55)); }
    });
    const k1 = P(30, -100), k2 = P(36, -60);   // knuckle highlight on the back
    line(c, k1[0], k1[1], k2[0], k2[1], 5 * s, rgba(skHi, 0.6));
  });
  // the thumb: proximal (MCP->IP), distal (IP->TIP)
  cap([MCP[0] - 2, MCP[1] + 14], IPj, 24, 22, alpha(sk));
  cap(IPj, TIP, 22, 19.5, alpha(sk));
  if (gl < 0.5) paint(() => {
    // the nail on the back (+u side) of the distal bone, the crease on the palm side of the joint
    const n = [Math.cos(ip), Math.sin(ip)];                     // the back's normal of the distal bone (hand units, +u side)
    const nc = [IPj[0] + d[0] * 16 + n[0] * 12, IPj[1] + d[1] * 16 + n[1] * 12];
    const A = P(...nc), B = P(nc[0] + d[0] * 16, nc[1] + d[1] * 16);
    htCapsule(c, A, B, 11 * s, 10.5 * s, '#E7AE9B'); htCapsule(c, A, B, 9.2 * s, 8.8 * s, '#FAD9CC');
    const nh0 = P(nc[0] + d[0] * 3 + n[0] * 3, nc[1] + d[1] * 3 + n[1] * 3), nh1 = P(nc[0] + d[0] * 12 + n[0] * 3, nc[1] + d[1] * 12 + n[1] * 3);
    line(c, nh0[0], nh0[1], nh1[0], nh1[1], 3 * s, rgba('#FFFFFF', 0.7));
    const cr0 = P(IPj[0] - 19, IPj[1] - 2), cr1 = P(IPj[0] - 8, IPj[1] + 1);
    line(c, cr0[0], cr0[1], cr1[0], cr1[1], 2.6 * s, rgba(skSh, 0.8));
    const hi0 = P(MCP[0] + 9, MCP[1] - 10), hi1 = P(IPj[0] + 9, IPj[1] + 10);
    line(c, hi0[0], hi0[1], hi1[0], hi1[1], 4 * s, rgba(skHi, 0.55));
  });
  // the glass: the two thumb bones and the joint
  if (gl > 0.01) {
    const bone = rgba('#F4FBFF', gl), boneDk = rgba('#BFD9EE', gl);
    cap([MCP[0], MCP[1] + 6], [IPj[0], IPj[1] + 7], 9, 8, bone);
    cap([IPj[0] + d[0] * 7, IPj[1] + d[1] * 7], [TIP[0] - d[0] * 8, TIP[1] - d[1] * 8], 8.5, 6.5, bone);
    const J0 = P(IPj[0], IPj[1] + 6), J1 = P(IPj[0] + d[0] * 6, IPj[1] + d[1] * 6); circle(c, J0[0], J0[1], 10 * s, boneDk); circle(c, J1[0], J1[1], 9 * s, bone);
    // the outline of the glass thumb
    paint(() => {
      c.strokeStyle = rgba('#7FE9FF', 0.8 * gl); c.lineWidth = 3;
      for (const [a, b, ra] of [[[MCP[0] - 2, MCP[1] + 14], IPj, 24], [IPj, TIP, 21]]) { const A = P(...a), B = P(...b); htCapsuleStroke(c, A, B, ra * s); }
    });
  }
  // the strap on the palm side (-u) of the joint: from the proximal bone to the distal bone
  const n2 = [-Math.cos(ip), -Math.sin(ip)];                    // the palm side's normal of the distal bone
  const rIn = gl > 0.3 ? 13 : 23;                               // inside the glass: on the bones; outside: on the skin
  const A0 = [IPj[0] - rIn, IPj[1] + 24], B0 = [IPj[0] + d[0] * 24 + n2[0] * rIn, IPj[1] + d[1] * 24 + n2[1] * rIn];
  const out = { ip: P(...IPj), tip: P(...TIP), nail: P(TIP[0] - d[0] * 12 + Math.cos(ip) * 9, TIP[1] - d[1] * 12 + Math.sin(ip) * 9) };
  const bk = clamp(o.belt || 0), bg = clamp(o.bungee || 0);
  if (bk > 0.01 || bg > 0.01) {
    const A = P(...A0), B = P(...B0);
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    // slack: the strap bows away from the joint (toward -u) when it is short of its length
    const slack = clamp(o.slack === undefined ? 0 : o.slack);
    const mid0 = [(A0[0] + B0[0]) / 2 - 14 * slack, (A0[1] + B0[1]) / 2];
    const M = P(...mid0);
    out.beltMid = M;
    if (bk > 0.01) htStrap(c, A, M, B, s, bk, clamp(o.lock || 0), o.t || 0);
    if (bg > 0.01) htBungee(c, A, B, s, bg, o.stretch || 0, o.t || 0);
  }
  c.restore();
  return out;
}
function htCapsule(c, a, b, ra, rb, col) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  c.fillStyle = col;
  if (L < Math.abs(ra - rb) + 0.5) { c.beginPath(); c.arc(a[0], a[1], Math.max(ra, rb), 0, 7); c.fill(); return; }
  const an = Math.atan2(dy, dx), dd = Math.acos(clamp((ra - rb) / L, -1, 1));
  c.beginPath(); c.arc(a[0], a[1], ra, an + dd, an - dd + 2 * Math.PI); c.arc(b[0], b[1], rb, an - dd, an + dd); c.closePath(); c.fill();
}
function htCapsuleStroke(c, a, b, r) {
  const an = Math.atan2(b[1] - a[1], b[0] - a[0]);
  c.beginPath(); c.arc(a[0], a[1], r, an + Math.PI / 2, an + 1.5 * Math.PI); c.arc(b[0], b[1], r, an - Math.PI / 2, an + Math.PI / 2); c.closePath(); c.stroke();
}
// the seatbelt: grey webbing through the midpoint, a buckle in the middle; lock: the latch turns red with a padlock
function htStrap(c, A, M, B, s, k, lock, t) {
  const w = 15 * s * k;
  c.save(); c.lineCap = 'butt'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(M[0], M[1], B[0], B[1]);
  c.lineWidth = w + 3 * s; c.strokeStyle = '#2E3142'; c.stroke();
  c.lineWidth = w; c.strokeStyle = '#7C8197'; c.stroke();
  c.restore();
  paint(() => {
    c.save(); c.setLineDash([3 * s, 3 * s]); c.beginPath(); c.moveTo(A[0], A[1]); c.quadraticCurveTo(M[0], M[1], B[0], B[1]);
    c.lineWidth = 1.3 * s; c.strokeStyle = rgba('#C9CEDF', 0.9); c.stroke(); c.restore();
  });
  // the buckle at the curve's middle point
  const q = [0.25 * A[0] + 0.5 * M[0] + 0.25 * B[0], 0.25 * A[1] + 0.5 * M[1] + 0.25 * B[1]];
  const an = Math.atan2(B[1] - A[1], B[0] - A[0]);
  c.save(); c.translate(q[0], q[1]); c.rotate(an); c.scale(k, k);
  rrect(c, -15 * s, -12 * s, 30 * s, 24 * s, 4 * s); c.fillStyle = '#2E3142'; c.fill();
  rrect(c, -13 * s, -10 * s, 26 * s, 20 * s, 3 * s); c.fillStyle = '#E3E7F0'; c.fill();
  rrect(c, -7 * s, -6 * s, 14 * s, 12 * s, 2.5 * s); c.fillStyle = lock > 0.5 ? '#E8343C' : '#9AA0B4'; c.fill();
  c.restore();
  if (lock > 0.01) softDot(gctx, q[0], q[1], 26 * s * lock, '#FF5A6E', 0.55 * lock);
}
// the bungee cord: yellow and black stripes, thinner as it stretches, hooks at both ends
function htBungee(c, A, B, s, k, stretch, t) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), w = (13 - 4 * clamp(stretch)) * s * k;
  const n = Math.max(6, Math.round(L / (7 * s)));
  for (let i = 0; i < n; i++) {
    const a = [lerp(A[0], B[0], i / n), lerp(A[1], B[1], i / n)], b = [lerp(A[0], B[0], (i + 1) / n), lerp(A[1], B[1], (i + 1) / n)];
    line(c, a[0], a[1], b[0], b[1], w, i % 2 ? '#1D1B26' : '#FFD12E');
  }
  for (const p of [A, B]) { circle(c, p[0], p[1], 5 * s * k, '#B0B6C6'); }
  softDot(gctx, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, L * 0.6, '#FFD12E', 0.25 * k);
}

// ---------------------------------------------------------------- the rival: a ponytail and a cap on her rig (rig space)
const RIVPAL = Object.assign({}, PAL, { coat: '#8E5BE8', coatSh: '#6A3CC4', coatHi: '#B894FF', coatDk: '#4F2A99', hair: '#7A3A1E', hairHi: '#A85A32',
  pants: '#1E7C78', pantsSh: '#145A57', strap: '#FFB02E', strapSh: '#D9861A', skin: '#E8A27A', skinSh: '#C47A55', skinHi: '#FFC9A6' });
function htRivalPre(c, r, t) {
  // the ponytail behind her head, swinging a little
  const [hx, hy] = r.head, sw = 6 * Math.sin(t * loopW(2.2));
  c.fillStyle = RIVPAL.hair;
  c.beginPath(); c.moveTo(hx + 40, hy - 40); c.quadraticCurveTo(hx + 120 + sw, hy - 10, hx + 96 + sw, hy + 90); c.quadraticCurveTo(hx + 70 + sw, hy + 30, hx + 30, hy - 10); c.closePath(); c.fill();
}
function htRivalPost(c, r, t) {
  const [hx, hy] = r.head;
  // a teal cap with a brim to the left
  c.fillStyle = '#16A39A';
  c.beginPath(); c.ellipse(hx, hy - 52, 70, 40, 0, Math.PI, 2 * Math.PI); c.fill();
  c.beginPath(); c.ellipse(hx - 60, hy - 52, 52, 11, -0.08, 0, 7); c.fill();
  circle(c, hx, hy - 92, 8, '#0F7A73');
}
