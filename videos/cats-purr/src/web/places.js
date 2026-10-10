// Two more places (cats-purr): a basket in a warm corner, where a mother cat lies with three kittens that are a few
// days old; and the vet's table by daylight, where the same purr comes out of a cat in a cone.
// Also here: the trace of a sound on a strip (the purr, and the cry inside it), a baby's face, a clock tag.
'use strict';

const NEST = { x: 540, rimY: 1128, rx: 400 };
let NEST_STATIC = null, VET_STATIC = null;
const KITPALS = [
  PURC,
  { fur: '#F6DDB6', dark: '#DDB884', light: '#FFF8EC', ear: '#F7B4BC', line: '#5A3A1A', nose: '#F28A9C', iris: '#B9E24A', pupil: '#15131F' },
  { fur: '#E2812F', dark: '#B85C18', light: '#FFE9CC', ear: '#F7A8B0', line: '#5A2A10', nose: '#F07A90', iris: '#B9E24A', pupil: '#15131F' },
];

function initPlaces() {
  // ---- the corner with the basket: a wall, a lamp's glow from the upper right, floorboards, a rug
  let cv = mkCanvas(W, H), c = cv.getContext('2d');
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#231A48'); g.addColorStop(0.62, '#1A1238'); g.addColorStop(1, '#0A0716');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = 20; x < W; x += 120) { c.fillStyle = 'rgba(255,255,255,0.02)'; c.fillRect(x, 0, 60, 1330); }
  const lg = c.createRadialGradient(900, 560, 30, 900, 560, 900);
  lg.addColorStop(0, 'rgba(255,196,130,0.42)'); lg.addColorStop(0.5, 'rgba(255,160,90,0.13)'); lg.addColorStop(1, 'rgba(255,160,90,0)');
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  c.fillStyle = '#1C1438'; c.fillRect(0, 1318, W, 24);
  g = c.createLinearGradient(0, 1342, 0, H); g.addColorStop(0, '#2A1C2C'); g.addColorStop(1, '#0C0810');
  c.fillStyle = g; c.fillRect(0, 1342, W, H - 1342);
  for (let i = 0; i < 6; i++) line(c, 0, 1390 + i * i * 14 + i * 34, W, 1390 + i * i * 14 + i * 34, 2, 'rgba(0,0,0,0.3)');
  ellipse(c, 540, 1420, 560, 110, '#5A2E4E'); ellipse(c, 540, 1420, 505, 88, '#6E3A5E');
  NEST_STATIC = cv;
  // ---- the vet's room: pale tiles, a window's light, a poster, a cabinet
  cv = mkCanvas(W, H); c = cv.getContext('2d');
  g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#CDEBE8'); g.addColorStop(0.7, '#9FD0D2'); g.addColorStop(1, '#6FA8B0');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let y = 980; y < 1500; y += 86) line(c, 0, y, W, y, 3, 'rgba(255,255,255,0.35)');
  for (let x = -20; x < W; x += 108) line(c, x, 980, x, 1500, 3, 'rgba(255,255,255,0.35)');
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(0, 962, W, 14);
  // a poster: a paw with a heart
  rrect(c, 96, 470, 250, 330, 14); c.fillStyle = '#FFFFFF'; c.fill();
  rrect(c, 110, 484, 222, 302, 8); c.fillStyle = '#FFE3EA'; c.fill();
  c.fillStyle = '#F07A90'; c.beginPath(); c.ellipse(221, 668, 50, 42, 0, 0, Math.PI * 2); c.fill();
  for (const [dx, dy] of [[-56, -62], [-20, -90], [20, -90], [56, -62]]) { c.beginPath(); c.ellipse(221 + dx, 668 + dy, 19, 24, dx * 0.006, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(221, 692); c.bezierCurveTo(196, 668, 204, 646, 221, 660); c.bezierCurveTo(238, 646, 246, 668, 221, 692); c.fill();
  // a cabinet with a cross
  rrect(c, 760, 420, 240, 300, 16); c.fillStyle = '#F4FAFA'; c.fill();
  line(c, 880, 432, 880, 708, 4, 'rgba(120,160,170,0.5)');
  c.fillStyle = '#FF5A6E'; c.fillRect(800, 470, 46, 14); c.fillRect(816, 454, 14, 46);
  circle(c, 868, 580, 6, '#9FB8C0'); circle(c, 892, 580, 6, '#9FB8C0');
  // the floor
  g = c.createLinearGradient(0, 1500, 0, H); g.addColorStop(0, '#6A98A4'); g.addColorStop(1, '#3E6470');
  c.fillStyle = g; c.fillRect(0, 1500, W, H - 1500);
  VET_STATIC = cv;
}

// ---------------------------------------------------------------- the basket
function nestBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(NEST_STATIC, -200, -150, W + 400, H + 300);
  softDot(gctx, 960, 540, 330, '#FFB870', 0.3);
  // the inside of the basket and its back rim
  const c = ctx, N = NEST;
  ellipse(c, N.x, N.rimY, N.rx, 128, '#7A4E20');
  ellipse(c, N.x, N.rimY + 14, N.rx - 30, 104, '#3A2412');
  ellipse(c, N.x, N.rimY + 40, N.rx - 44, 84, '#F2C9D2');                 // a blanket in it
}
// the front of the basket (drawn after the cats): the woven wall, its rim, a fold of blanket over the edge
function nestFront(t) {
  const c = ctx, N = NEST, y0 = N.rimY + 6;
  c.beginPath(); c.moveTo(N.x - N.rx, y0 - 6);
  c.quadraticCurveTo(N.x, y0 + 150, N.x + N.rx, y0 - 6);
  c.lineTo(N.x + N.rx - 40, y0 + 190); c.quadraticCurveTo(N.x, y0 + 290, N.x - N.rx + 40, y0 + 190); c.closePath();
  c.fillStyle = '#B9813E'; c.fill();
  paint(() => {
    c.save(); c.clip();
    for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(N.x + i * 46, y0 - 20); c.quadraticCurveTo(N.x + i * 44, y0 + 140, N.x + i * 40, y0 + 300); c.lineWidth = 6; c.strokeStyle = 'rgba(110,66,20,0.5)'; c.stroke(); }
    for (let j = 0; j < 5; j++) { c.beginPath(); c.moveTo(N.x - N.rx, y0 + 34 + j * 46); c.quadraticCurveTo(N.x, y0 + 190 + j * 46, N.x + N.rx, y0 + 34 + j * 46); c.lineWidth = 5; c.strokeStyle = 'rgba(255,220,160,0.22)'; c.stroke(); }
    c.restore();
  });
  c.beginPath(); c.moveTo(N.x - N.rx, y0 - 8); c.quadraticCurveTo(N.x, y0 + 148, N.x + N.rx, y0 - 8); c.lineWidth = 30; c.lineCap = 'round'; c.strokeStyle = '#D69A4C'; c.stroke();
  c.beginPath(); c.moveTo(N.x - 330, y0 + 46); c.quadraticCurveTo(N.x - 250, y0 + 150, N.x - 150, y0 + 104); c.quadraticCurveTo(N.x - 190, y0 + 60, N.x - 196, y0 + 108); c.lineTo(N.x - 300, y0 + 18); c.closePath();
  c.fillStyle = '#F7D6DD'; c.fill();
}

// ---------------------------------------------------------------- the vet's
function vetBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(VET_STATIC, -200, -150, W + 400, H + 300);
  softDot(gctx, 540, 380, 520, '#FFFFFF', 0.18);
}
function vetTable() {
  const c = ctx;
  for (const x of [230, 850]) { rrect(c, x - 16, 1300, 32, 420, 10); c.fillStyle = '#8FA3B6'; c.fill(); }
  rrect(c, 110, 1246, 860, 66, 20); c.fillStyle = '#D5DEEA'; c.fill();
  paint(() => line(c, 150, 1262, 930, 1262, 6, 'rgba(255,255,255,0.7)'));
}
// the vet's arm from the right with a stethoscope on her chest. k = it comes in (0..1); (px, py) = where the disc goes
function vetArm(px, py, k, t, purr) {
  if (k <= 0.01) return;
  const c = ctx, off = (1 - E.outCubic(clamp(k))) * 560, bz = purBuzz(t, purr);
  const hx = px + 120 + off, hy = py + 30;
  // the tube up to her ears (out of frame)
  c.beginPath(); c.moveTo(px + 30 + off + bz, py); c.quadraticCurveTo(px + 260 + off, py - 190, px + 420 + off, py - 520);
  c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = '#2A3350'; c.stroke();
  line(c, hx + 70, hy + 40, 1400 + off, hy + 250, 104, '#3FB7A6');        // the sleeve of her scrubs
  line(c, hx + 60, hy + 34, hx + 82, hy + 46, 110, '#2E9486');
  circle(c, hx, hy, 50, '#BFE6FF');                                     // a glove
  for (let i = 0; i < 3; i++) line(c, hx - 30, hy - 26 + i * 26, hx - 78, hy - 30 + i * 22, 25, '#BFE6FF');
  circle(c, px + bz, py, 40, '#C9D3E0'); circle(c, px + bz, py, 27, '#7E8CA6');
}

// ---------------------------------------------------------------- the trace of a sound
// A strip (screen space): x, y = its top left; the low hum is a fat slow wave, the cry a thin fast one riding on it.
// o: {k (slide in), hum 0..1, cry 0..1 (how much of the thin line is lit), scroll, icon: fn(c) drawn in a disc on the
//     left, label, tag, cryOnly}
function sndStrip(x, y, w, h, t, o = {}) {
  const k = o.k === undefined ? 1 : o.k;
  if (k <= 0.01) return;
  const c = ctx, sl = (1 - E.outCubic(clamp(k))) * (o.from || -900);
  screenSpace();
  c.save(); c.translate(sl, 0);
  rrect(c, x, y, w, h, h / 2); c.fillStyle = 'rgba(8,10,34,0.9)'; c.fill();
  c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,0.22)'; c.stroke();
  const x0 = x + h + 10, x1 = x + w - (o.tag ? 252 : 34), cy = y + h / 2, amp = h * 0.26, ph = (o.scroll || 0);
  const hum = (px) => (o.cryOnly ? 0 : amp * Math.sin((px - x0) * 0.045 - ph * 5) * (0.8 + 0.2 * Math.sin((px - x0) * 0.011 + 1)));
  paint(() => {
    c.save(); c.beginPath(); c.rect(x0, y + 4, x1 - x0, h - 8); c.clip();
    if (!o.cryOnly && (o.hum === undefined ? 1 : o.hum) > 0.02) {
      c.beginPath(); for (let px = x0; px <= x1; px += 4) c.lineTo(px, cy + hum(px));
      c.lineWidth = 21; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba('#FFB347', 0.95 * (o.hum === undefined ? 1 : o.hum) * (1 - 0.45 * clamp(o.cry || 0))); c.stroke();
    }
    const cry = clamp(o.cry || 0);
    if (cry > 0.01) {
      const xe = lerp(x0, x1, cry);
      c.beginPath(); for (let px = x0; px <= xe; px += 2) c.lineTo(px, cy + hum(px) + h * 0.13 * Math.sin((px - x0) * 0.33 - ph * 16));
      c.lineWidth = 7.5; c.lineJoin = 'round'; c.strokeStyle = '#FF5A8A'; c.stroke();
    }
    c.restore();
  });
  if ((o.cry || 0) > 0.01) { const xe = lerp(x0, x1, clamp(o.cry)); softDot(gctx, (x0 + xe) / 2 + sl, cy, (xe - x0) * 0.5 + 30, '#FF5A8A', 0.16); }
  if (o.tag && (o.tagK === undefined ? 1 : o.tagK) > 0.01) paint(() => {
    const tk = E.outBack(clamp(o.tagK === undefined ? 1 : o.tagK), 2);
    c.save(); c.translate(x + w - 130, cy); c.scale(tk, tk); c.font = '900 36px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle';
    rrect(c, -112, -32, 224, 64, 32); c.fillStyle = '#FF5A8A'; c.fill(); c.fillStyle = '#12061C'; c.fillText(o.tag, 0, 2); c.restore();
  });
  // the icon in its disc
  circle(c, x + h / 2, cy, h / 2 - 7, '#F4F7FF');
  if (o.icon) { c.save(); c.beginPath(); c.arc(x + h / 2, cy, h / 2 - 11, 0, Math.PI * 2); c.clip(); c.fillStyle = o.iconBg || '#243A7A'; c.fillRect(x, y, h, h); c.translate(x + h / 2, cy); o.icon(c); c.restore(); }
  c.restore();
}
// a baby's crying face (centred on 0, 0; about 44 units across)
function babyFace(c, t) {
  circle(c, 0, 2, 38, '#FFD2B8');
  c.beginPath(); c.moveTo(-6, -36); c.quadraticCurveTo(6, -54, 12, -36); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#8A5A3A'; c.stroke();
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 22, -8); c.quadraticCurveTo(sd * 14, -15, sd * 6, -6); c.lineWidth = 5; c.strokeStyle = '#5A2E22'; c.stroke(); }
  ellipse(c, 0, 16, 13, 12 + 2 * Math.sin(t * 14), '#7A1F2E'); ellipse(c, 0, 22, 8, 5, '#E0616C');
  for (const sd of [-1, 1]) { c.fillStyle = '#9EDCFF'; c.beginPath(); c.ellipse(sd * 27, 6 + 3 * Math.sin(t * 9 + sd), 4.5, 7, 0, 0, Math.PI * 2); c.fill(); }
}
// a small tag: dark pill, text, pops with k (screen space)
function sndTag(txt, x, y, col, k, size = 34) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 2);
  screenSpace();
  c.save(); c.translate(x, y); c.scale(s, s);
  c.font = `900 ${size}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(txt).width + size * 0.9, h = size * 1.5;
  rrect(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = col; c.fill();
  c.fillStyle = '#0B0B1A'; c.fillText(txt, 0, 2);
  c.restore();
}
