// The cafe that opened today, seen from inside toward its door ... and the room it is laid out like: grandma's kitchen.
// One set of slots (door, window, round table, hanging lamp, counter, two things on the wall, a sign) and two skins:
// st = 0 the cafe, st = 1 the kitchen. Everything is drawn under the camera (no screen-space parts), into any pair of
// contexts (c = picture, g = half-resolution glow or null), so a room can be drawn into a layer, or inside a crystal ball.
'use strict';

const CF = {
  floorY: 1500, vp: [540, 1080],
  door: { x: 336, y: 770, w: 264, h: 730 },
  win: { x: 700, y: 800, w: 310, h: 370 },
  table: { x: 872, y: 1418, rx: 150, ry: 34 },
  lamp: { x: 872, y: 640, w: 190, h: 112 },
  counter: { x: -60, y: 1190, w: 330, h: 310 },
  fr1: { x: 52, y: 772, w: 136, h: 156 },
  fr2: { x: 218, y: 850, w: 88, h: 88 },
  sign: { x: 496, y: 644, w: 440, h: 92 },
};
let CF_KIT = null, CF_KITX = null;      // the kitchen's own layer (for the dissolve)
let CF_BLD = null;                      // the street's buildings

function initCafe() {
  CF_KIT = mkCanvas(W, H); CF_KITX = CF_KIT.getContext('2d');
  const rng = mulberry32(31);
  CF_BLD = [...Array(9)].map((_, i) => ({ x: 280 + i * 96 + rng() * 30, w: 70 + rng() * 60, h: 150 + rng() * 260, wins: [...Array(10)].map(() => [rng(), rng(), rng() > 0.45]) }));
}
function cfSet(c, g, cam) { camTransform(c, cam, 1); if (g) camTransform(g, cam, 0.5); }

// ---------------------------------------------------------------- what is outside the glass
function cfOutside(c, g, t, st, r) {
  c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
  if (!st) {                              // a street at dusk
    const sg = c.createLinearGradient(0, r.y, 0, r.y + r.h);
    sg.addColorStop(0, '#3B2A6E'); sg.addColorStop(0.45, '#B4527A'); sg.addColorStop(0.75, '#FF9A5C'); sg.addColorStop(1, '#3A2A4E');
    c.fillStyle = sg; c.fillRect(r.x, r.y, r.w, r.h);
    for (const b of CF_BLD) {
      const by = r.y + r.h * 0.86;
      c.fillStyle = '#1B1638'; c.fillRect(b.x, by - b.h, b.w, b.h + 40);
      b.wins.forEach(([u, v, on], i) => { if (on) { c.fillStyle = `rgba(255,214,130,${0.55 + 0.25 * Math.sin(t * 1.3 + i * 2.1 + b.x)})`; c.fillRect(b.x + 8 + u * (b.w - 24), by - b.h + 14 + v * (b.h - 40), 9, 13); } });
    }
    c.fillStyle = '#120F26'; c.fillRect(r.x, r.y + r.h * 0.86, r.w, r.h);
    for (let i = 0; i < 4; i++) {         // headlights sliding past
      const x = r.x + ((t * (70 + 22 * i) + i * 190) % (r.w + 160)) - 80, y = r.y + r.h * (0.9 + 0.022 * i);
      softDot(c, x, y, 26, i % 2 ? '#FFE9B0' : '#FF7A6A', 0.75);
      if (g && x > r.x + 24 && x < r.x + r.w - 24) softDot(g, x, y, 30, i % 2 ? '#FFD890' : '#FF6A5A', 0.4);
    }
  } else {                                // a garden on a bright afternoon
    const sg = c.createLinearGradient(0, r.y, 0, r.y + r.h);
    sg.addColorStop(0, '#BFE9FF'); sg.addColorStop(0.55, '#E9F7C8'); sg.addColorStop(1, '#7FC46A');
    c.fillStyle = sg; c.fillRect(r.x, r.y, r.w, r.h);
    for (let i = 0; i < 5; i++) ellipse(c, r.x + r.w * (0.1 + 0.2 * i), r.y + r.h * 0.74 + 12 * Math.sin(i * 2.3), 70, 54, i % 2 ? '#5FAE55' : '#74C063');
    for (let i = 0; i < 7; i++) circle(c, r.x + r.w * (0.08 + 0.14 * i), r.y + r.h * (0.72 + 0.05 * Math.sin(i * 1.7)), 7, ['#FF86A6', '#FFD447', '#FFFFFF'][i % 3]);
    softDot(c, r.x + r.w * 0.7, r.y + r.h * 0.2, r.w * 0.6, '#FFFFFF', 0.55);
    if (g) softDot(g, r.x + r.w * 0.6, r.y + r.h * 0.4, r.w * 0.8, '#FFF2C0', 0.4);
  }
  c.restore();
}

// ---------------------------------------------------------------- wall and floor
function cfWall(c, g, t, st) {
  const wg = c.createLinearGradient(0, 300, 0, CF.floorY);
  if (!st) { wg.addColorStop(0, '#0C2630'); wg.addColorStop(1, '#1A4750'); } else { wg.addColorStop(0, '#EBCB85'); wg.addColorStop(1, '#DDAE66'); }
  c.fillStyle = wg; c.fillRect(-700, -500, 2480, CF.floorY + 500);
  if (!st) {
    for (let x = -660; x < 1760; x += 132) line(c, x, -500, x, 1250, 3, 'rgba(255,255,255,0.035)');
    c.fillStyle = '#0E2F38'; c.fillRect(-700, 1250, 2480, CF.floorY - 1250);
    c.fillStyle = '#2A6772'; c.fillRect(-700, 1244, 2480, 12);
    for (let x = -660; x < 1760; x += 66) line(c, x, 1262, x, CF.floorY, 3, 'rgba(0,0,0,0.22)');
  } else {
    c.save(); c.beginPath(); c.rect(-700, -500, 2480, 1750); c.clip();
    for (let y = 340; y < 1250; y += 74) for (let x = -660 + ((y / 74) % 2) * 37; x < 1760; x += 74) {   // wallpaper sprigs
      circle(c, x, y, 6, 'rgba(196,96,70,0.5)'); line(c, x, y + 6, x, y + 20, 3, 'rgba(104,140,74,0.5)');
    }
    c.restore();
    c.fillStyle = '#F6EBD2'; c.fillRect(-700, 1250, 2480, CF.floorY - 1250);
    c.fillStyle = '#FFF9EA'; c.fillRect(-700, 1242, 2480, 14);
    for (let x = -660; x < 1760; x += 44) line(c, x, 1262, x, CF.floorY, 3, 'rgba(160,120,70,0.25)');
  }
}
function cfFloorX(j, y) { return CF.vp[0] + j * 168 * (y - CF.vp[1]) / (1920 - CF.vp[1]); }
function cfFloor(c, g, t, st) {
  const rows = [0, 0.09, 0.2, 0.34, 0.52, 0.74, 1.0, 1.4].map((u) => CF.floorY + 470 * u);
  for (let i = 0; i < rows.length - 1; i++) for (let j = -16; j < 16; j++) {
    const y0 = rows[i], y1 = rows[i + 1], odd = (i + j) & 1;
    c.beginPath(); c.moveTo(cfFloorX(j, y0), y0); c.lineTo(cfFloorX(j + 1, y0) + 0.6, y0); c.lineTo(cfFloorX(j + 1, y1) + 0.6, y1 + 0.6); c.lineTo(cfFloorX(j, y1), y1 + 0.6); c.closePath();
    c.fillStyle = st ? (j & 1 ? '#B67E48' : '#A8713E') : (odd ? '#5C7078' : '#1F3038'); c.fill();
  }
  if (st) for (let j = -16; j < 16; j++) line(c, cfFloorX(j, rows[0]), rows[0], cfFloorX(j, rows[7]), rows[7], 3, 'rgba(70,40,14,0.35)');
  const sh = c.createLinearGradient(0, CF.floorY, 0, CF.floorY + 90);
  sh.addColorStop(0, 'rgba(0,0,10,0.5)'); sh.addColorStop(1, 'rgba(0,0,10,0)');
  c.fillStyle = sh; c.fillRect(-700, CF.floorY, 2480, 90);
  c.fillStyle = st ? '#8C5A2C' : '#0B1C22'; c.fillRect(-700, CF.floorY - 14, 2480, 16);   // skirting
}

// ---------------------------------------------------------------- the slots
function cfDoorway(c, g, t, st) {
  const d = CF.door;
  cfOutside(c, g, t, st, d);
  c.lineJoin = 'miter'; c.lineWidth = 22; c.strokeStyle = st ? '#FFF9EA' : '#0A1216'; c.strokeRect(d.x - 11, d.y - 11, d.w + 22, d.h + 16);
  c.lineWidth = 5; c.strokeStyle = st ? '#D9C9A4' : '#2C4A54'; c.strokeRect(d.x - 22, d.y - 22, d.w + 44, d.h + 30);
  c.fillStyle = st ? '#C9A56A' : '#1C2A30'; c.fillRect(d.x - 26, d.y + d.h - 4, d.w + 52, 12);   // threshold
}
// the leaf: open 0 = shut, 1 = swung in toward the camera on its left hinge. Returns its free edge [x, yTop, yBottom]
function cfLeaf(c, g, t, st, open) {
  const d = CF.door, th = open * 1.38, cs = Math.cos(th), sn = Math.sin(th);
  const x0 = d.x, xf = d.x + d.w * cs, grow = 76 * sn, yT = d.y - grow * 0.55, yB = d.y + d.h + grow * 0.45;
  const P = (u, v) => [lerp(x0, xf, u), lerp(lerp(d.y, yT, u), lerp(d.y + d.h, yB, u), v)];
  const quad = (u0, v0, u1, v1) => { c.beginPath(); for (const [u, v] of [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]) { const p = P(u, v); c.lineTo(p[0], p[1]); } c.closePath(); };
  if (!st) {
    quad(0, 0, 1, 1); c.fillStyle = `rgba(150,215,240,${0.10 + 0.05 * sn})`; c.fill();
    c.save(); quad(0.06, 0.03, 0.94, 0.97); c.clip();                    // reflections on the glass
    c.globalAlpha = 0.5;
    for (const u of [0.2, 0.34, 0.72]) { c.beginPath(); const a = P(u, 0), b = P(u + 0.1, 0), e = P(u - 0.14, 1), f = P(u - 0.24, 1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.lineTo(f[0], f[1]); c.closePath(); c.fillStyle = 'rgba(230,246,255,0.16)'; c.fill(); }
    c.restore();
    c.lineJoin = 'round'; c.lineWidth = 20; c.strokeStyle = '#0A1216'; quad(0, 0, 1, 1); c.stroke();
    c.lineWidth = 4; c.strokeStyle = '#3F6A76'; quad(0.04, 0.02, 0.96, 0.98); c.stroke();
    const h0 = P(0.84, 0.36), h1 = P(0.84, 0.66);                          // the long handle
    line(c, h0[0], h0[1], h1[0], h1[1], 17, '#05090B'); line(c, h0[0] - 2, h0[1], h1[0] - 2, h1[1], 9, '#C9D6DC');
    const pp = P(0.6, 0.5);
    c.save(); c.translate(pp[0], pp[1]); c.transform(cs, 0, 0, 1, 0, 0);
    rrect(c, -56, -24, 112, 48, 8); c.fillStyle = 'rgba(8,16,20,0.75)'; c.fill();
    c.font = '900 30px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFD447'; c.fillText('PUSH', 0, 2);
    c.restore();
  } else {
    quad(0, 0, 1, 1); c.fillStyle = '#9CC7A8'; c.fill();
    c.lineWidth = 6; c.strokeStyle = '#6E9E80'; c.stroke();
    quad(0.12, 0.56, 0.88, 0.94); c.stroke();
    c.save(); quad(0.14, 0.07, 0.86, 0.46); c.clip(); cfOutside(c, g, t, 1, { x: d.x, y: d.y, w: d.w, h: d.h * 0.5 }); c.restore();
    quad(0.14, 0.07, 0.86, 0.46); c.lineWidth = 9; c.strokeStyle = '#FFF9EA'; c.stroke();
    const a = P(0.5, 0.07), b = P(0.5, 0.46), e = P(0.14, 0.265), f = P(0.86, 0.265);
    line(c, a[0], a[1], b[0], b[1], 7, '#FFF9EA'); line(c, e[0], e[1], f[0], f[1], 7, '#FFF9EA');
    const k = P(0.86, 0.53); circle(c, k[0], k[1], 15, '#8A6A2C'); circle(c, k[0] - 3, k[1] - 3, 9, '#E9C96A');
  }
  return [xf, yT, yB];
}
// the little brass bell over the cafe's door (swing = radians)
function cfDoorBell(c, g, swing, st) {
  if (st) return;
  const d = CF.door, x = d.x + d.w - 34, y = d.y - 46;
  line(c, x + 30, y - 20, x, y - 20, 5, '#3A2A12'); line(c, x, y - 20, x, y - 6, 4, '#3A2A12');
  c.save(); c.translate(x, y - 6); c.rotate(swing);
  c.beginPath(); c.moveTo(-17, 34); c.quadraticCurveTo(-15, 0, 0, 0); c.quadraticCurveTo(15, 0, 17, 34); c.closePath(); c.fillStyle = '#E9B13A'; c.fill();
  c.lineWidth = 3; c.strokeStyle = '#7A520E'; c.stroke();
  circle(c, 0, 38, 6, '#7A520E'); line(c, -6, 8, -9, 24, 3, 'rgba(255,255,255,0.6)');
  c.restore();
  if (g) softDot(g, x, y + 14, 34, '#FFD98A', 0.25 + 0.5 * Math.min(1, Math.abs(swing) * 3));
}
function cfWindow(c, g, t, st) {
  const r = CF.win;
  cfOutside(c, g, t, st, r);
  if (!st) {
    c.lineWidth = 16; c.strokeStyle = '#0A1216'; c.strokeRect(r.x - 8, r.y - 8, r.w + 16, r.h + 16);
    line(c, r.x + r.w / 2, r.y, r.x + r.w / 2, r.y + r.h, 8, '#0A1216');
    c.fillStyle = 'rgba(214,150,96,0.9)'; c.fillRect(r.x, r.y + r.h * 0.62, r.w, r.h * 0.38);            // a half curtain
    for (let x = r.x + 14; x < r.x + r.w; x += 26) line(c, x, r.y + r.h * 0.63, x, r.y + r.h, 3, 'rgba(120,66,30,0.4)');
    line(c, r.x - 6, r.y + r.h * 0.62, r.x + r.w + 6, r.y + r.h * 0.62, 6, '#C89A3A');
  } else {
    c.lineWidth = 18; c.strokeStyle = '#FFF9EA'; c.strokeRect(r.x - 9, r.y - 9, r.w + 18, r.h + 18);
    line(c, r.x + r.w / 2, r.y, r.x + r.w / 2, r.y + r.h, 9, '#FFF9EA'); line(c, r.x, r.y + r.h / 2, r.x + r.w, r.y + r.h / 2, 9, '#FFF9EA');
    for (const s of [0, 1]) {             // lace curtains tied back
      const x0 = s ? r.x + r.w : r.x, dx = s ? -1 : 1;
      c.beginPath(); c.moveTo(x0, r.y - 6); c.lineTo(x0 + dx * 108, r.y - 6); c.quadraticCurveTo(x0 + dx * 96, r.y + r.h * 0.42, x0 + dx * 24, r.y + r.h * 0.6); c.quadraticCurveTo(x0 + dx * 60, r.y + r.h * 0.84, x0 + dx * 6, r.y + r.h + 4); c.lineTo(x0, r.y + r.h + 4); c.closePath();
      c.fillStyle = 'rgba(255,255,250,0.86)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(200,180,140,0.7)'; c.stroke();
    }
  }
  c.fillStyle = st ? '#FFF9EA' : '#13222A'; c.fillRect(r.x - 26, r.y + r.h + 8, r.w + 52, 18);          // the sill
  const px = r.x + r.w * (st ? 0.5 : 0.18), py = r.y + r.h + 8;                                          // a pot on it
  c.fillStyle = st ? '#C8603A' : '#C9D6DC'; c.beginPath(); c.moveTo(px - 26, py - 40); c.lineTo(px + 26, py - 40); c.lineTo(px + 19, py); c.lineTo(px - 19, py); c.closePath(); c.fill();
  for (let i = -2; i <= 2; i++) ellipse(c, px + i * 12, py - 62 - 8 * Math.cos(i), 9, 26, st ? '#5FAE55' : '#3E9A78', i * 0.3);
  if (st) for (const [dx, dy, col] of [[-16, -84, '#FF5A6E'], [8, -92, '#FFD447'], [22, -74, '#FF86A6']]) circle(c, px + dx, py + dy, 10, col);
  if (g) softDot(g, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.9, st ? '#FFF2C0' : '#FF9A5C', st ? 0.4 : 0.3);
}
function cfLamp(c, g, t, st, sw = 0) {
  const l = CF.lamp;
  c.save(); c.translate(l.x, -420); c.rotate(sw); c.translate(-l.x, 420);
  line(c, l.x, -420, l.x, l.y, 5, st ? '#7A5A30' : '#05090B');
  const y1 = l.y + l.h;
  const cone = c.createLinearGradient(0, y1, 0, CF.table.y);
  cone.addColorStop(0, 'rgba(255,214,140,0.30)'); cone.addColorStop(1, 'rgba(255,214,140,0)');
  c.beginPath(); c.moveTo(l.x - l.w * 0.42, y1); c.lineTo(l.x + l.w * 0.42, y1); c.lineTo(l.x + 330, CF.table.y + 40); c.lineTo(l.x - 330, CF.table.y + 40); c.closePath(); c.fillStyle = cone; c.fill();
  if (!st) {
    c.beginPath(); c.moveTo(l.x - l.w / 2, y1); c.quadraticCurveTo(l.x - l.w / 2, l.y, l.x, l.y - 4); c.quadraticCurveTo(l.x + l.w / 2, l.y, l.x + l.w / 2, y1); c.closePath();
    c.fillStyle = '#0A1216'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#C0763A'; c.stroke();
    ellipse(c, l.x, y1, l.w / 2, 13, '#C0763A');
  } else {
    c.beginPath(); c.moveTo(l.x - l.w * 0.3, l.y); c.lineTo(l.x + l.w * 0.3, l.y); c.lineTo(l.x + l.w / 2, y1); c.lineTo(l.x - l.w / 2, y1); c.closePath();
    c.fillStyle = '#FFF1CF'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#D9584A'; c.stroke();
    for (let x = l.x - l.w / 2 + 8; x < l.x + l.w / 2; x += 16) line(c, x, y1, x, y1 + 18, 4, '#D9584A');
  }
  circle(c, l.x, y1 + 6, 20, '#FFF3C8');
  if (g) { softDot(g, l.x, y1 + 10, 210, '#FFD08A', 0.85); softDot(g, l.x, CF.table.y - 30, 260, '#FFC070', 0.22); }
  c.restore();
}
// o: {cup: radians the cup tips, steam: 0..1}
function cfTable(c, g, t, st, o = {}) {
  const T = CF.table;
  ellipse(c, T.x, 1596, 150, 22, 'rgba(0,0,10,0.35)');
  if (!st) {
    line(c, T.x, T.y, T.x, 1586, 22, '#05090B'); ellipse(c, T.x, 1590, 84, 17, '#05090B'); ellipse(c, T.x, 1584, 70, 11, '#1C2A30');
    ellipse(c, T.x, T.y + 16, T.rx, T.ry, '#8E99A0'); ellipse(c, T.x, T.y, T.rx, T.ry, '#E9EEF0');
    c.save(); c.beginPath(); c.ellipse(T.x, T.y, T.rx, T.ry, 0, 0, 7); c.clip();                          // marble veins
    for (let i = 0; i < 5; i++) line(c, T.x - 150 + i * 70, T.y - 30, T.x - 110 + i * 70 + 40 * Math.sin(i * 2.2), T.y + 34, 3, 'rgba(120,134,142,0.4)');
    c.restore();
  } else {
    line(c, T.x - 96, T.y, T.x - 110, 1590, 16, '#7A4C22'); line(c, T.x + 96, T.y, T.x + 110, 1590, 16, '#7A4C22');
    c.beginPath(); c.moveTo(T.x - T.rx, T.y); c.lineTo(T.x - T.rx - 8, T.y + 118);
    for (let i = 0; i <= 8; i++) c.quadraticCurveTo(T.x - T.rx + (i - 0.25) * (2 * T.rx / 8), T.y + 150, T.x - T.rx + i * (2 * T.rx / 8) + (i === 8 ? 8 : 0), T.y + 118);
    c.lineTo(T.x + T.rx, T.y); c.closePath();
    c.save(); c.clip(); c.fillStyle = '#FFF6E8'; c.fillRect(T.x - 200, T.y - 10, 400, 200);
    for (let x = T.x - 190; x < T.x + 190; x += 44) { c.fillStyle = 'rgba(214,72,60,0.55)'; c.fillRect(x, T.y - 10, 22, 200); }
    for (let y = T.y; y < T.y + 170; y += 44) { c.fillStyle = 'rgba(214,72,60,0.4)'; c.fillRect(T.x - 200, y, 400, 22); }
    c.restore();
    ellipse(c, T.x, T.y, T.rx, T.ry, '#FFF6E8');
    c.save(); c.beginPath(); c.ellipse(T.x, T.y, T.rx, T.ry, 0, 0, 7); c.clip();
    for (let x = T.x - 190; x < T.x + 190; x += 44) { c.fillStyle = 'rgba(214,72,60,0.5)'; c.fillRect(x, T.y - 40, 22, 80); }
    c.restore();
  }
  // what is on it: a cup (cafe) or a pie (kitchen), steaming
  const sx = st ? T.x : T.x - 36, sy = T.y - 8;
  if (!st) {
    ellipse(c, sx, sy + 4, 48, 11, '#C9D2D8');
    c.save(); c.translate(sx, sy); c.rotate(o.cup || 0);
    c.beginPath(); c.moveTo(-32, -44); c.lineTo(32, -44); c.quadraticCurveTo(30, 0, 14, 2); c.lineTo(-14, 2); c.quadraticCurveTo(-30, 0, -32, -44); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill();
    c.lineWidth = 3; c.strokeStyle = '#9AA8B0'; c.stroke();
    c.beginPath(); c.arc(36, -24, 13, -1.3, 1.5); c.lineWidth = 7; c.strokeStyle = '#FFFFFF'; c.stroke();
    ellipse(c, 0, -44, 32, 8, '#5A3418');
    c.restore();
    const vx = T.x + 64;                  // a bud vase
    c.beginPath(); c.moveTo(vx - 9, sy - 46); c.lineTo(vx + 9, sy - 46); c.quadraticCurveTo(vx + 20, sy - 14, vx + 12, sy); c.lineTo(vx - 12, sy); c.quadraticCurveTo(vx - 20, sy - 14, vx - 9, sy - 46); c.closePath(); c.fillStyle = 'rgba(140,220,230,0.75)'; c.fill();
    line(c, vx, sy - 44, vx + 6, sy - 100, 4, '#3E9A78'); circle(c, vx + 7, sy - 106, 14, '#FF86A6'); circle(c, vx + 7, sy - 106, 6, '#FFD447');
  } else {
    ellipse(c, sx, sy + 2, 74, 15, '#B9C3CC'); ellipse(c, sx, sy - 10, 66, 20, '#E2A24C'); ellipse(c, sx, sy - 14, 56, 14, '#F2C56E');
    for (let i = -2; i <= 2; i++) line(c, sx + i * 20 - 8, sy - 20, sx + i * 20 + 8, sy - 8, 4, '#B8742A');
  }
  const stm = o.steam === undefined ? 1 : o.steam;
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.45 + i / 3) % 1), x = sx + (i - 1) * 16 + 12 * Math.sin(p * 6 + i), y = sy - 54 - 96 * p;
    softDot(c, x, y, 20 + 22 * p, '#FFFFFF', 0.2 * stm * Math.sin(Math.PI * p));
  }
}
function cfCounter(c, g, t, st) {
  const k = CF.counter, x1 = k.x + k.w;
  if (!st) {
    c.fillStyle = '#3A2416'; c.fillRect(k.x, k.y, k.w, k.h);
    for (let x = k.x + 20; x < x1; x += 34) { c.fillStyle = x % 68 < 34 ? '#4A2E1C' : '#422818'; c.fillRect(x, k.y + 22, 30, k.h - 22); }
    c.fillStyle = '#C0763A'; c.fillRect(k.x, k.y - 6, k.w + 14, 22); c.fillStyle = '#E9A45C'; c.fillRect(k.x, k.y - 6, k.w + 14, 6);
    // the espresso machine
    const mx = 34, my = k.y - 6;
    rrect(c, mx, my - 168, 196, 168, 16); const mg = c.createLinearGradient(mx, 0, mx + 196, 0); mg.addColorStop(0, '#E9EEF0'); mg.addColorStop(0.5, '#B7C2C8'); mg.addColorStop(1, '#7E8C94'); c.fillStyle = mg; c.fill();
    rrect(c, mx + 10, my - 158, 176, 56, 10); c.fillStyle = '#C8402E'; c.fill();
    circle(c, mx + 44, my - 130, 17, '#FFF9EA'); line(c, mx + 44, my - 130, mx + 44 + 12 * Math.cos(t * 0.6 - 2), my - 130 + 12 * Math.sin(t * 0.6 - 2), 3, '#C8402E');
    circle(c, mx + 160, my - 130, 7, '#4DFFB4'); if (g) softDot(g, mx + 160, my - 130, 22, '#4DFFB4', 0.8);
    rrect(c, mx + 62, my - 96, 72, 22, 6); c.fillStyle = '#39444A'; c.fill(); line(c, mx + 98, my - 74, mx + 98, my - 60, 9, '#39444A'); line(c, mx + 98, my - 84, mx + 150, my - 78, 7, '#1B2226');
    rrect(c, mx + 78, my - 40, 40, 34, 6); c.fillStyle = '#FFFFFF'; c.fill();
    line(c, mx + 176, my - 96, mx + 186, my - 30, 6, '#C9D6DC');
    for (let i = 0; i < 3; i++) { rrect(c, mx + 30 + i * 48, my - 196, 38, 28, 6); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#9AA8B0'; c.stroke(); }
    for (let i = 0; i < 2; i++) { const p = ((t * 0.5 + i * 0.5) % 1); softDot(c, mx + 186 + 14 * Math.sin(p * 5 + i), my - 40 - 80 * p, 16 + 20 * p, '#FFFFFF', 0.22 * Math.sin(Math.PI * p)); }
  } else {
    rrect(c, k.x, k.y, k.w, k.h + 6, 14); c.fillStyle = '#F4EBD6'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#C9B88E'; c.stroke();
    c.fillStyle = '#2B2B33'; c.fillRect(k.x, k.y - 12, k.w, 16);
    rrect(c, k.x + 60, k.y + 86, k.w - 96, k.h - 124, 12); c.fillStyle = '#3A3A44'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#C9B88E'; c.stroke();
    rrect(c, k.x + 78, k.y + 104, k.w - 132, k.h - 160, 8); c.fillStyle = '#6B3A1A'; c.fill();
    softDot(c, k.x + 78 + (k.w - 132) / 2, k.y + 104 + (k.h - 160) / 2, 70, '#FF9A3C', 0.5);
    line(c, k.x + 70, k.y + 66, x1 - 46, k.y + 66, 8, '#B8B8C4');
    for (let i = 0; i < 4; i++) circle(c, k.x + 84 + i * 56, k.y + 34, 13, i === 1 ? '#D9584A' : '#2B2B33');
    // the kettle
    const kx = 150, ky = k.y - 12;
    c.beginPath(); c.moveTo(kx - 58, ky); c.quadraticCurveTo(kx - 66, ky - 78, kx, ky - 84); c.quadraticCurveTo(kx + 66, ky - 78, kx + 58, ky); c.closePath(); c.fillStyle = '#4E86C8'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2A5690'; c.stroke();
    c.beginPath(); c.moveTo(kx + 50, ky - 44); c.lineTo(kx + 96, ky - 74); c.lineTo(kx + 100, ky - 62); c.lineTo(kx + 56, ky - 22); c.closePath(); c.fillStyle = '#4E86C8'; c.fill(); c.stroke();
    c.beginPath(); c.arc(kx, ky - 84, 40, Math.PI, 0); c.lineWidth = 9; c.strokeStyle = '#1B1B22'; c.stroke(); circle(c, kx, ky - 88, 9, '#1B1B22');
    line(c, kx - 34, ky - 56, kx - 22, ky - 22, 5, 'rgba(255,255,255,0.5)');
    for (let i = 0; i < 3; i++) { const p = ((t * 0.6 + i / 3) % 1); softDot(c, kx + 104 + 40 * p + 10 * Math.sin(p * 7 + i), ky - 74 - 110 * p, 18 + 34 * p, '#FFFFFF', 0.4 * Math.sin(Math.PI * p)); }
  }
}
function cfFrames(c, g, t, st) {
  const a = CF.fr1, b = CF.fr2;
  if (!st) {
    rrect(c, a.x, a.y, a.w, a.h, 8); c.fillStyle = '#16211F'; c.fill(); c.lineWidth = 9; c.strokeStyle = '#8A5A2C'; c.stroke();
    c.font = '900 26px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#F4F0E0'; c.fillText('MENU', a.x + a.w / 2, a.y + 28);
    for (let i = 0; i < 5; i++) { line(c, a.x + 18, a.y + 58 + i * 20, a.x + 74 + (i % 2) * 14, a.y + 58 + i * 20, 4, 'rgba(244,240,224,0.7)'); line(c, a.x + 100, a.y + 58 + i * 20, a.x + 118, a.y + 58 + i * 20, 4, 'rgba(255,212,71,0.8)'); }
    circle(c, b.x + b.w / 2, b.y + b.h / 2, b.w / 2, '#E9D9B8'); c.lineWidth = 8; c.strokeStyle = '#0A1216'; c.beginPath(); c.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, 7); c.stroke();
    ellipse(c, b.x + b.w / 2, b.y + b.h / 2, 15, 23, '#5A3418', 0.5); line(c, b.x + b.w / 2 - 9, b.y + b.h / 2 + 16, b.x + b.w / 2 + 9, b.y + b.h / 2 - 16, 3, '#E9D9B8');
  } else {
    // a cuckoo clock and a painted plate
    c.beginPath(); c.moveTo(a.x - 8, a.y + 54); c.lineTo(a.x + a.w / 2, a.y - 14); c.lineTo(a.x + a.w + 8, a.y + 54); c.closePath(); c.fillStyle = '#7A4420'; c.fill();
    rrect(c, a.x + 8, a.y + 44, a.w - 16, a.h - 44, 8); c.fillStyle = '#9A5A2C'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#5A3014'; c.stroke();
    circle(c, a.x + a.w / 2, a.y + 96, 34, '#FFF6E0'); line(c, a.x + a.w / 2, a.y + 96, a.x + a.w / 2, a.y + 72, 4, '#3A2010'); line(c, a.x + a.w / 2, a.y + 96, a.x + a.w / 2 + 16, a.y + 104, 4, '#3A2010');
    const pa = 0.4 * Math.sin(t * 3.2), px = a.x + a.w / 2 + 74 * Math.sin(pa), py = a.y + a.h + 74 * Math.cos(pa);
    line(c, a.x + a.w / 2, a.y + a.h, px, py, 4, '#5A3014'); circle(c, px, py, 12, '#E9B13A');
    circle(c, b.x + b.w / 2, b.y + b.h / 2, b.w / 2, '#FFFFFF'); c.lineWidth = 7; c.strokeStyle = '#4E86C8'; c.beginPath(); c.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 - 4, 0, 7); c.stroke();
    for (let i = 0; i < 6; i++) circle(c, b.x + b.w / 2 + 20 * Math.cos(i * 1.047), b.y + b.h / 2 + 20 * Math.sin(i * 1.047), 6, '#4E86C8');
    circle(c, b.x + b.w / 2, b.y + b.h / 2, 7, '#D9584A');
  }
}
function cfSign(c, g, t, st) {
  const s = CF.sign, x0 = s.x - s.w / 2, y0 = s.y - s.h / 2;
  if (!st) {
    // bunting from wall to wall, then the banner
    const yAt = (x) => 508 + 44 * (1 - Math.pow((x - 540) / 640, 2));
    c.beginPath(); for (let x = -120; x <= 1200; x += 40) c.lineTo(x, yAt(x)); c.lineWidth = 4; c.strokeStyle = '#F4F0E0'; c.stroke();
    for (let i = 0; i < 17; i++) {
      const x = -80 + i * 76, y = yAt(x), sw = 0.07 * Math.sin(t * 1.7 + i);
      c.save(); c.translate(x, y); c.rotate(sw); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.lineTo(0, 56); c.closePath();
      c.fillStyle = ['#FF5A6E', '#FFD447', '#4DFFB4', '#7FE9FF'][i % 4]; c.fill(); c.restore();
    }
    c.save(); c.translate(s.x, s.y); c.rotate(-0.012 + 0.006 * Math.sin(t * 1.3));
    c.beginPath(); c.moveTo(-s.w / 2 - 34, -s.h / 2 + 8); c.lineTo(s.w / 2 + 34, -s.h / 2 + 8); c.lineTo(s.w / 2 + 8, 0); c.lineTo(s.w / 2 + 34, s.h / 2 - 8); c.lineTo(-s.w / 2 - 34, s.h / 2 - 8); c.lineTo(-s.w / 2 - 8, 0); c.closePath();
    c.fillStyle = '#9C2436'; c.fill();
    rrect(c, -s.w / 2, -s.h / 2, s.w, s.h, 8); c.fillStyle = '#E23A52'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FFE9B0'; c.stroke();
    c.font = '400 66px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('GRAND OPENING', 0, 5);
    c.restore();
    for (const sx of [-1, 1]) line(c, s.x + sx * (s.w / 2 - 40), y0 + 2, s.x + sx * (s.w / 2 - 40), yAt(s.x + sx * (s.w / 2 - 40)), 3, '#F4F0E0');
    if (g) { g.save(); rrect(g, x0, y0, s.w, s.h, 8); g.fillStyle = 'rgba(255,90,110,0.22)'; g.fill(); g.restore(); }
  } else {
    for (const sx of [-1, 1]) line(c, s.x + sx * (s.w / 2 - 60), y0, s.x, y0 - 86, 4, '#8A6A3C');
    circle(c, s.x, y0 - 86, 8, '#5A3A14');
    rrect(c, x0, y0, s.w, s.h, 18); const wg = c.createLinearGradient(0, y0, 0, y0 + s.h); wg.addColorStop(0, '#B9814A'); wg.addColorStop(1, '#93602E'); c.fillStyle = wg; c.fill();
    c.lineWidth = 6; c.strokeStyle = '#6A4018'; c.stroke();
    for (let i = 0; i < 3; i++) line(c, x0 + 20, y0 + 22 + i * 28, x0 + s.w - 20, y0 + 26 + i * 28, 2, 'rgba(90,50,16,0.3)');
    c.font = '400 52px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFF6E0'; c.fillText("GRANDMA'S KITCHEN", s.x, s.y + 4);
  }
}

// ---------------------------------------------------------------- the room
// o: {st, door: 0..1, bell: swing, lamp: swing, cup, steam, noLeaf}
function cfBack(c, g, cam, t, o = {}) {
  const st = o.st || 0;
  cfSet(c, g, cam);
  cfWall(c, g, t, st); cfFloor(c, g, t, st);
  cfDoorway(c, g, t, st); cfWindow(c, g, t, st); cfFrames(c, g, t, st); cfSign(c, g, t, st);
  cfCounter(c, g, t, st); cfLamp(c, g, t, st, o.lamp || 0); cfTable(c, g, t, st, o);
  cfDoorBell(c, g, o.bell || 0, st);
}
function cfRoom(c, g, cam, t, o = {}) {
  cfBack(c, g, cam, t, o);
  return cfLeaf(c, g, t, o.st || 0, o.door || 0);
}
// the kitchen, drawn into its own layer and laid over the picture with alpha a (a dissolve that keeps every outline)
function cfKitchenOver(cam, t, a, o = {}) {
  if (a <= 0.003) return;
  CF_KITX.setTransform(1, 0, 0, 1, 0, 0); CF_KITX.clearRect(0, 0, W, H);
  cfRoom(CF_KITX, null, cam, t, Object.assign({ st: 1 }, o));
  if (o.then) o.then(CF_KITX);
  const kx = CF_KITX;
  kx.setTransform(1, 0, 0, 1, 0, 0); kx.globalCompositeOperation = 'multiply'; kx.fillStyle = 'rgb(206,170,138)'; kx.fillRect(0, 0, W, H);
  const vg = kx.createRadialGradient(W / 2, H * 0.5, H * 0.2, W / 2, H * 0.5, H * 0.62); vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(120,84,70,1)');
  kx.fillStyle = vg; kx.fillRect(0, 0, W, H); kx.globalCompositeOperation = 'source-over';
  gctx.save(); gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.globalCompositeOperation = 'destination-out'; gctx.fillStyle = `rgba(0,0,0,${0.9 * clamp(a)})`; gctx.fillRect(0, 0, W / 2, H / 2); gctx.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.drawImage(CF_KIT, 0, 0); ctx.restore();
  camTransform(gctx, cam, 0.5);
  softDot(gctx, CF.lamp.x, CF.lamp.y + CF.lamp.h + 10, 190, '#FFD08A', 0.5 * clamp(a)); softDot(gctx, CF.win.x + CF.win.w / 2, CF.win.y + CF.win.h / 2, 260, '#FFF2C0', 0.22 * clamp(a));
}

// the room's outlines, one after another: ks[i] = draw-on 0..1 of slot i (door, window, table, lamp, counter, frame,
// plate, sign); a = overall alpha. They are the same lines in both rooms: that is the whole point.
function cfWire(cam, t, ks, a = 1, col = '#BFF6FF') {
  if (a <= 0.003) return;
  const d = CF.door, w = CF.win, T = CF.table, l = CF.lamp, k = CF.counter, f1 = CF.fr1, f2 = CF.fr2, s = CF.sign;
  const paths = [
    (c) => { rrect(c, d.x - 14, d.y - 14, d.w + 28, d.h + 22, 10); },
    (c) => { rrect(c, w.x - 14, w.y - 14, w.w + 28, w.h + 48, 10); },
    (c) => { c.beginPath(); c.ellipse(T.x, T.y, T.rx + 8, T.ry + 8, 0, 0, 7); c.moveTo(T.x, T.y + T.ry + 8); c.lineTo(T.x, 1590); c.moveTo(T.x - 90, 1592); c.lineTo(T.x + 90, 1592); },
    (c) => { c.beginPath(); c.moveTo(l.x, 420); c.lineTo(l.x, l.y - 8); c.moveTo(l.x - l.w / 2 - 8, l.y + l.h + 8); c.lineTo(l.x - l.w * 0.3, l.y - 8); c.lineTo(l.x + l.w * 0.3, l.y - 8); c.lineTo(l.x + l.w / 2 + 8, l.y + l.h + 8); c.closePath(); },
    (c) => { rrect(c, k.x, k.y - 16, k.w + 18, k.h + 12, 10); },
    (c) => { rrect(c, f1.x - 10, f1.y - 16, f1.w + 20, f1.h + 26, 10); },
    (c) => { c.beginPath(); c.arc(f2.x + f2.w / 2, f2.y + f2.h / 2, f2.w / 2 + 10, 0, 7); },
    (c) => { rrect(c, s.x - s.w / 2 - 12, s.y - s.h / 2 - 12, s.w + 24, s.h + 24, 14); },
  ];
  const lens = [2100, 1560, 1500, 1100, 1300, 700, 360, 1360];
  for (const [c, lw, al] of [[ctx, 7, 0.95], [gctx, 16, 0.6]]) {
    camTransform(c, cam, c === gctx ? 0.5 : 1);
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    paths.forEach((p, i) => {
      const kk = clamp(ks[i] || 0); if (kk <= 0) return;
      const pulse = 0.82 + 0.18 * Math.sin(t * 5 + i * 1.3);
      c.setLineDash([lens[i] * kk, 9999]);
      if (c === ctx) { c.globalAlpha = 1; c.lineWidth = lw + 9; c.strokeStyle = `rgba(6,14,40,${0.62 * a})`; p(c); c.stroke(); }
      c.globalAlpha = pulse; c.lineWidth = lw; c.strokeStyle = rgba(col, al * a); p(c); c.stroke();
    });
    c.setLineDash([]); c.restore();
  }
}

// ---------------------------------------------------------------- the cat (in profile, walking left). o: {tail, look}
function cfCat(c, g, x, y, s, t, o = {}) {
  const ph = t * 9, body = '#0B0B14', rim = '#7E90D8';
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 4, 130, 12, 'rgba(0,0,10,0.35)');
  const leg = (lx, p, back) => {
    const sw = Math.sin(ph + p), lift = Math.max(0, Math.cos(ph + p));
    const fx = lx + 30 * sw, fy = -6 - 16 * lift;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 22; c.strokeStyle = back ? '#07070E' : body;
    c.beginPath(); c.moveTo(lx, -84); c.quadraticCurveTo(lx + 12 * sw + (back ? 10 : -6), -44, fx, fy); c.stroke();
    ellipse(c, fx - 8, fy + 2, 15, 9, back ? '#07070E' : body);
  };
  leg(52, 2.2, true); leg(-66, 5.3, true);
  // the tail: up, with a curl that sways
  const tw = 0.25 * Math.sin(t * 3.1) + (o.tail || 0);
  c.beginPath(); c.moveTo(96, -112); c.bezierCurveTo(150, -150, 128 + 30 * tw, -230, 150 + 46 * tw, -262);
  c.lineWidth = 20; c.strokeStyle = body; c.lineCap = 'round'; c.stroke();
  const bob = 3 * Math.sin(ph * 2);
  c.beginPath(); c.ellipse(4, -110 + bob, 112, 46, -0.04, 0, 7); c.fillStyle = body; c.fill();
  c.beginPath(); c.ellipse(4, -116 + bob, 108, 40, -0.04, Math.PI * 1.02, Math.PI * 1.98); c.lineWidth = 6; c.strokeStyle = rim; c.stroke();
  leg(74, 5.3, false); leg(-44, 2.2, false);
  // head
  const hx = -112, hy = -150 + bob * 1.4;
  circle(c, hx, hy, 46, body);
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(hx + sd * 12 - 4, hy - 34); c.lineTo(hx + sd * 30, hy - 78); c.lineTo(hx + sd * 42, hy - 22); c.closePath(); c.fillStyle = body; c.fill(); }
  c.beginPath(); c.arc(hx, hy, 44, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 6; c.strokeStyle = rim; c.stroke();
  const look = o.look || 0;
  for (const ex of [-22, 14]) { ellipse(c, hx + ex, hy - 4, 11, 13, '#FFD447'); ellipse(c, hx + ex + 3 * look - 2, hy - 4, 4, 11, '#0B0B14'); }
  c.beginPath(); c.moveTo(hx - 12, hy + 12); c.lineTo(hx - 2, hy + 12); c.lineTo(hx - 7, hy + 18); c.closePath(); c.fillStyle = '#FF86A6'; c.fill();
  for (const sd of [-1, 1]) for (const dy of [-3, 6]) line(c, hx - 7 + sd * 12, hy + 16 + dy * 0.4, hx - 7 + sd * 58, hy + 12 + dy * 2, 2, 'rgba(230,236,255,0.7)');
  c.restore();
  if (g) for (const ex of [-22, 14]) softDot(g, x + (hx + ex) * s, y + (hy - 4) * s, 26 * s, '#FFD447', 0.6);
}
