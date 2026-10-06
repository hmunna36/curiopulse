// Inside his head: three little workers and where they sit. The eager one (orange) who shouts SEEN IT, the memory
// keeper (teal, glasses) with the files, and the one at the front (violet, a tie) who checks the other two.
// Plus his head in profile with the brain in it (the map, and the small "you are here" chip), a service bell, a wall
// of drawers, folders, slips of paper and a rubber stamp.
'use strict';

const MG = {
  eager: { col: '#FF9A3C', sh: '#C25A12', hi: '#FFD9A0', dk: '#6E2C04' },
  memo: { col: '#3EC6B4', sh: '#1A8273', hi: '#B4F5EA', dk: '#0A4038' },
  boss: { col: '#9B7BFF', sh: '#5B3FC4', hi: '#DDD2FF', dk: '#2A1870' },
};
// where each one sits on the brain (head-local units, see mindHead)
const MG_AT = { boss: [-176, -92], eager: [8, 30], memo: [196, -100] };
let MIND_WEB = null;

function initMind() {
  const rng = mulberry32(19);
  MIND_WEB = [...Array(22)].map(() => [rng() * 1400 - 160, 300 + rng() * 1100, rng() * 6]);
}

// ---------------------------------------------------------------- the room they work in (screen space)
function mindBg(t, c1 = '#5A2A6E', c2 = '#12061C', web = '#FF86C8') {
  darkBg(c1, c2);
  screenSpace();
  for (let i = 0; i < 5; i++) {                      // the folds of the brain, far away
    ctx.beginPath(); ctx.arc(140 + i * 230, 250 + 60 * Math.sin(i * 1.7), 260, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 44; ctx.lineCap = 'round'; ctx.strokeStyle = rgba(web, 0.05); ctx.stroke();
  }
  const P = MIND_WEB;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
    if (d < 290) line(ctx, P[i][0], P[i][1], P[j][0], P[j][1], 2.5, rgba(web, 0.07 + 0.04 * Math.sin(t * 2 + i + j)));
  }
  P.forEach((p, i) => { circle(ctx, p[0], p[1], 6, rgba(web, 0.2)); softDot(gctx, p[0], p[1], 34, web, 0.13 + 0.1 * Math.sin(t * 3 + p[2])); });
}
// a console desk across the frame: top edge at y
function mindDesk(c, y, t, col = '#3A2550', lit = 0) {
  const g = c.createLinearGradient(0, y, 0, y + 460);
  g.addColorStop(0, col); g.addColorStop(1, '#120A1C');
  c.fillStyle = g; c.fillRect(-400, y, 1880, 1200);
  rrect(c, -400, y - 18, 1880, 36, 10); c.fillStyle = '#6A4590'; c.fill();
  rrect(c, -400, y - 18, 1880, 11, 6); c.fillStyle = '#9470BE'; c.fill();
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 98, on = lit > 0.5 ? Math.sin(t * 22 + i) > -0.2 : Math.sin(t * (2 + (i % 3)) + i * 1.9) > 0.2;
    const colr = lit > 0.5 ? (lit > 1.5 ? '#FF5A6E' : '#4DFFB4') : ['#4DFFB4', '#FFD447', '#FF5A6E'][i % 3];
    circle(c, x, y + 84, 13, on ? colr : '#2A1B3A'); if (on && c === ctx) softDot(gctx, x, y + 84, 40, colr, 0.6);
  }
}

// ---------------------------------------------------------------- a worker
// o: {who, mood: calm | happy | yell | oops | deadpan | stern | shock | think | whistle | look, look: [x, y] -1..1,
//     armL / armR: [x, y] hand targets (local; default hanging), hop, sx, sy (squash), tilt, sweat, blink, mouth 0..1 (yell),
//     hold: (c, hands) => draw in local space after the arms, noArms / armsOnly: the body and the arms in two calls}
function mindGuy(c, x, y, s, t, o = {}) {
  const P = MG[o.who || 'eager'], mood = o.mood || 'calm', look = o.look || [0, 0];
  const bob = (o.hop || 0) + 4 * Math.sin(t * 2.6 + (o.ph || 0));
  c.save(); c.translate(x, y + bob * s); c.scale(s * (o.sx || 1), s * (o.sy || 1)); c.rotate(o.tilt || 0);
  if (!o.armsOnly) {
  // feet
  for (const sd of [-1, 1]) { ellipse(c, sd * 46, 122, 34, 16, P.dk); ellipse(c, sd * 46, 119, 30, 12, P.sh); }
  // tufts (these are brain cells after all)
  c.lineCap = 'round';
  for (const [tx, lean] of [[-34, -0.5], [0, 0], [34, 0.5]]) {
    const ex = tx + 34 * lean + 6 * Math.sin(t * 5 + tx), ey = -166 + 10 * Math.abs(lean);
    c.beginPath(); c.moveTo(tx, -116); c.quadraticCurveTo(tx + 10 * lean, -146, ex, ey); c.lineWidth = 11; c.strokeStyle = P.dk; c.stroke();
    c.lineWidth = 6; c.strokeStyle = P.sh; c.stroke(); circle(c, ex, ey, 10, P.dk); circle(c, ex, ey, 7, P.col);
  }
  // body
  c.beginPath(); c.ellipse(0, 0, 122, 126, 0, 0, 7);
  const g = c.createRadialGradient(-44, -56, 14, 0, 0, 150); g.addColorStop(0, P.hi); g.addColorStop(0.45, P.col); g.addColorStop(1, P.sh);
  c.fillStyle = g; c.fill(); c.lineWidth = 7; c.strokeStyle = P.dk; c.stroke();
  if (o.who === 'memo') {                              // a bun, with a pencil through it
    circle(c, 0, -134, 36, P.dk); circle(c, -3, -137, 30, P.sh);
    line(c, -52, -118, 52, -152, 8, '#FFD447'); line(c, 44, -150, 56, -153, 8, '#3A2A12');
  }
  if (o.who === 'boss') {                              // a tie
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, 96); c.lineTo(sd * 40, 84); c.lineTo(sd * 30, 112); c.closePath(); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 3; c.strokeStyle = P.dk; c.stroke(); }
    c.beginPath(); c.moveTo(-12, 98); c.lineTo(12, 98); c.lineTo(8, 112); c.lineTo(18, 150); c.lineTo(0, 166); c.lineTo(-18, 150); c.lineTo(-8, 112); c.closePath();
    c.fillStyle = '#FFD447'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#7A5200'; c.stroke();
  }
  // face
  const ey = -22, big = mood === 'shock' || mood === 'oops' ? 1.18 : 1;
  for (const sd of [-1, 1]) {
    const ex = sd * 42;
    if (mood === 'yell') {                             // squeezed shut: > <
      c.beginPath(); c.moveTo(ex - sd * 22, ey - 18); c.lineTo(ex + sd * 14, ey); c.lineTo(ex - sd * 22, ey + 18); c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = P.dk; c.stroke();
      continue;
    }
    const ry = 31 * big * (mood === 'deadpan' || mood === 'stern' ? 0.92 : 1);
    ellipse(c, ex, ey, 27 * big, ry, '#FFFFFF'); c.lineWidth = 4; c.strokeStyle = P.dk; c.beginPath(); c.ellipse(ex, ey, 27 * big, ry, 0, 0, 7); c.stroke();
    const pr = mood === 'shock' || mood === 'oops' ? 8 : 12;
    circle(c, ex + look[0] * 11, ey + look[1] * 10, pr, '#1B1028'); circle(c, ex + look[0] * 11 - 3.5, ey + look[1] * 10 - 4, 3.6, '#FFFFFF');
    const lid = Math.max(o.blink || 0, mood === 'deadpan' ? 0.48 : mood === 'stern' ? 0.3 : mood === 'think' && sd > 0 ? 0.36 : 0);
    if (lid > 0.02) {
      c.save(); c.beginPath(); c.ellipse(ex, ey, 28 * big, ry + 1, 0, 0, 7); c.clip();
      c.fillStyle = P.sh; c.fillRect(ex - 32, ey - ry - 2, 64, (2 * ry + 2) * lid);
      line(c, ex - 30, ey - ry + 2 * ry * lid, ex + 30, ey - ry + 2 * ry * lid, 4, P.dk); c.restore();
    }
  }
  // brows
  const bt = { stern: -1, deadpan: -0.25, oops: 1, shock: 0.8, think: 0.2, yell: -0.6, happy: 0.3, whistle: 0.7 }[mood] || 0;
  const bh = { stern: -54, oops: -74, shock: -78, happy: -70, yell: -62, whistle: -72 }[mood] || -66;
  const bw = o.who === 'boss' ? 13 : 9;
  for (const sd of [-1, 1]) line(c, sd * 66, bh + bt * 9 + (mood === 'think' && sd > 0 ? -14 : 0), sd * 20, bh - bt * 9 + (mood === 'think' && sd > 0 ? -14 : 0), bw, P.dk);
  // glasses
  if (o.who === 'memo') {
    c.lineWidth = 7; c.strokeStyle = '#102A2A';
    for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 42, ey, 39, 0, 7); c.stroke(); line(c, sd * 30, ey - 24, sd * 22, ey - 10, 4, 'rgba(255,255,255,0.7)'); }
    line(c, -4, ey - 4, 4, ey - 4, 7, '#102A2A');
  }
  // mouth
  const my = 46;
  if (mood === 'yell') {
    const mo = o.mouth === undefined ? 1 : o.mouth, h = 22 + 52 * mo;
    rrect(c, -44, my - 16, 88, h, 28); c.fillStyle = '#5A1522'; c.fill(); c.lineWidth = 5; c.strokeStyle = P.dk; c.stroke();
    c.save(); rrect(c, -44, my - 16, 88, h, 28); c.clip(); c.fillStyle = '#FFFFFF'; c.fillRect(-44, my - 16, 88, 12); ellipse(c, 0, my - 16 + h - 6, 30, 16, '#E0616C'); c.restore();
  } else if (mood === 'happy') {
    c.beginPath(); c.moveTo(-40, my - 8); c.quadraticCurveTo(0, my + 46, 40, my - 8); c.closePath(); c.fillStyle = '#5A1522'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#FFFFFF'; c.fillRect(-40, my - 9, 80, 11); ellipse(c, 0, my + 26, 18, 10, '#E0616C'); c.restore();
  } else if (mood === 'oops') {
    c.beginPath(); c.moveTo(-22, my + 4); c.bezierCurveTo(-12, my - 8, -4, my + 12, 4, my + 2); c.bezierCurveTo(10, my - 8, 16, my + 10, 24, my + 2); c.lineWidth = 7; c.strokeStyle = '#5A1522'; c.stroke();
  } else if (mood === 'shock') { ellipse(c, 0, my + 6, 15, 19, '#5A1522'); }
  else if (mood === 'whistle') { ellipse(c, 16, my + 2, 10, 12, '#5A1522'); }
  else if (mood === 'deadpan') { line(c, -20, my + 4, 20, my + 4, 7, '#5A1522'); }
  else if (mood === 'stern') { c.beginPath(); c.moveTo(-24, my + 10); c.quadraticCurveTo(0, my - 4, 24, my + 10); c.lineWidth = 7; c.strokeStyle = '#5A1522'; c.stroke(); }
  else if (mood === 'think') { c.beginPath(); c.moveTo(-14, my + 6); c.quadraticCurveTo(4, my, 20, my - 4); c.lineWidth = 7; c.strokeStyle = '#5A1522'; c.stroke(); }
  else { c.beginPath(); c.moveTo(-22, my - 2); c.quadraticCurveTo(0, my + 16, 22, my - 2); c.lineWidth = 7; c.strokeStyle = '#5A1522'; c.stroke(); }
  if (o.sweat > 0) { sweatDrop(c, 112, -92, 1.5, o.sweat); sweatDrop(c, -118, -50, 1.1, o.sweat * 0.8); }
  }
  if (o.noArms) { c.restore(); return; }
  // arms, in front (armsOnly draws just these, so a prop can sit between the body and the hands)
  const hands = [];
  for (const [sd, tg] of [[-1, o.armL], [1, o.armR]]) {
    const sx0 = sd * 104, sy0 = 26, tx = tg ? tg[0] : sd * 150, ty = tg ? tg[1] : 96;
    const mx = (sx0 + tx) / 2 + sd * 26, myy = (sy0 + ty) / 2 + 34 * (ty > sy0 ? 1 : -0.6);
    c.beginPath(); c.moveTo(sx0, sy0); c.quadraticCurveTo(mx, myy, tx, ty); c.lineCap = 'round'; c.lineWidth = 25; c.strokeStyle = P.dk; c.stroke();
    c.lineWidth = 15; c.strokeStyle = P.col; c.stroke();
    circle(c, tx, ty, 24, P.dk); circle(c, tx - 1, ty - 2, 19, P.hi); circle(c, tx + sd * -13, ty - 15, 9, P.hi);
    hands.push([tx, ty]);
  }
  if (o.hold) o.hold(c, hands);
  c.restore();
}

// ---------------------------------------------------------------- props
// a hotel-desk bell: hit 0..1 pushes the plunger and squashes the dome; ring 0..1 sends the sound out
function mindBell(c, g, x, y, s, t, hit = 0, ring = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ellipse(c, 0, 8, 150, 24, 'rgba(0,0,10,0.4)');
  ellipse(c, 0, 0, 132, 22, '#5A3A0C'); ellipse(c, 0, -6, 124, 18, '#C8922A');
  const sq = 1 - 0.1 * hit;
  c.beginPath(); c.moveTo(-108, -8); c.bezierCurveTo(-108, -110 * sq, -60, -128 * sq, 0, -128 * sq); c.bezierCurveTo(60, -128 * sq, 108, -110 * sq, 108, -8); c.closePath();
  const gg = c.createLinearGradient(-108, 0, 108, 0); gg.addColorStop(0, '#FFE9A0'); gg.addColorStop(0.3, '#F5C542'); gg.addColorStop(0.75, '#D49A1E'); gg.addColorStop(1, '#8A5C0A');
  c.fillStyle = gg; c.fill(); c.lineWidth = 6; c.strokeStyle = '#5A3A0C'; c.stroke();
  c.beginPath(); c.moveTo(-70, -84 * sq); c.quadraticCurveTo(-50, -112 * sq, -14, -116 * sq); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
  const py = -128 * sq - 34 + 22 * hit;
  rrect(c, -9, py, 18, 40, 5); c.fillStyle = '#8A5C0A'; c.fill(); circle(c, 0, py, 19, '#5A3A0C'); circle(c, -2, py - 2, 14, '#F5C542');
  c.restore();
  if (ring > 0 && ring < 1) for (const [cc, sc, lw] of [[c, 1, 9], [g, 0.5, 18]]) {
    if (!cc) continue;
    for (let i = 0; i < 3; i++) {
      const k = ring * 1.3 - i * 0.16; if (k <= 0 || k >= 1) continue;
      for (const sd of [-1, 1]) {
        cc.beginPath(); cc.arc(x + sd * 20 * s, y - 70 * s, (130 + 260 * k) * s, sd > 0 ? -0.7 : Math.PI - 0.5, sd > 0 ? 0.5 : Math.PI + 0.7);
        cc.lineWidth = lw * s; cc.lineCap = 'round'; cc.strokeStyle = `rgba(255,222,120,${0.9 * (1 - k)})`; cc.stroke();
      }
    }
  }
}
// a comic burst with a word in it (screen space)
function mindBurst(txt, x, y, k, t, size = 150, col = '#FFD447', rot = -0.08, ink = '#3A1A04') {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot + 0.02 * Math.sin(t * 19)); ctx.scale(k, k);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width / 2 + size * 0.42, h = size * 0.92, n = 18;
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? 1 : 1.24 + 0.08 * Math.sin(i * 2.3 + t * 14);
    ctx.lineTo(Math.cos(a) * w * rr, Math.sin(a) * h * rr);
  }
  ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.stroke();
  ctx.lineWidth = size * 0.12; ctx.strokeStyle = ink; ctx.strokeText(txt, 0, 6); ctx.fillStyle = col; ctx.fillText(txt, 0, 6);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x, y, size * 2.2, '#FFE9A0', 0.35 * clamp(k)); gctx.restore();
}
// a slip of paper with a verdict on it. ok = true: green tick, false: red cross
function mindSlip(c, x, y, s, rot, txt, ok, k = 1) {
  if (k <= 0.01) return;
  const col = ok ? '#19A974' : '#E23A52';
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  rrect(c, -170, -92, 340, 184, 14); c.fillStyle = 'rgba(0,0,10,0.35)'; c.fill();
  rrect(c, -176, -100, 340, 184, 14); c.fillStyle = '#FFF9EA'; c.fill(); c.lineWidth = 9; c.strokeStyle = col; c.stroke();
  c.font = '400 76px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1B1028';
  const lines = txt.split('|');
  lines.forEach((ln, i) => c.fillText(ln, -40, -8 + (i - (lines.length - 1) / 2) * 74));
  circle(c, 118, -8, 40, col);
  c.lineWidth = 11; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#FFFFFF'; c.beginPath();
  if (ok) { c.moveTo(100, -8); c.lineTo(113, 8); c.lineTo(138, -24); } else { c.moveTo(102, -24); c.lineTo(134, 8); c.moveTo(134, -24); c.lineTo(102, 8); }
  c.stroke();
  c.restore();
}
// a rubber stamp tool (handle up), drawn at the hand
function mindStampTool(c, x, y, s, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -20, -120, 40, 84, 16); c.fillStyle = '#7A4420'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3A1E0A'; c.stroke();
  circle(c, 0, -122, 28, '#9A5A2C'); c.beginPath(); c.arc(0, -122, 28, 0, 7); c.stroke();
  rrect(c, -62, -40, 124, 40, 8); c.fillStyle = '#39444A'; c.fill(); c.stroke();
  rrect(c, -66, -4, 132, 16, 5); c.fillStyle = '#E23A52'; c.fill();
  c.restore();
}
// a manila folder card with a small picture of a memory on it: kind 0..4, or -1 = nothing in it
function mindFolder(c, x, y, s, rot, kind, k = 1) {
  if (k <= 0.01) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  c.beginPath(); c.moveTo(-110, -70); c.lineTo(-104, -96); c.lineTo(-30, -96); c.lineTo(-22, -70); c.closePath(); c.fillStyle = '#D9A548'; c.fill();
  rrect(c, -116, -74, 232, 160, 12); c.fillStyle = '#F2C56E'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#8A5C1A'; c.stroke();
  rrect(c, -92, -52, 184, 116, 8); c.fillStyle = kind < 0 ? '#FFF6E0' : ['#BFE9FF', '#FFE0EC', '#FFE9B0', '#D8F5C8', '#E4DCFF'][kind]; c.fill();
  if (kind === 0) { circle(c, 46, -18, 22, '#FFD447'); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-64 + i * 52, 40, 30, Math.PI, 0); c.fillStyle = '#4E9EE0'; c.fill(); } }   // the beach
  else if (kind === 1) { rrect(c, -50, 0, 100, 50, 8); c.fillStyle = '#FF86A6'; c.fill(); rrect(c, -50, 0, 100, 16, 8); c.fillStyle = '#FFFFFF'; c.fill(); line(c, 0, -2, 0, -26, 7, '#7FE9FF'); circle(c, 0, -34, 8, '#FF9A3C'); }   // a birthday
  else if (kind === 2) { rrect(c, -62, -14, 124, 56, 12); c.fillStyle = '#FFB020'; c.fill(); for (let i = 0; i < 3; i++) { rrect(c, -50 + i * 36, -4, 28, 22, 4); c.fillStyle = '#BFE9FF'; c.fill(); } circle(c, -34, 46, 13, '#1B1028'); circle(c, 36, 46, 13, '#1B1028'); }   // the school bus
  else if (kind === 3) { circle(c, 0, 8, 40, '#FFFFFF'); c.lineWidth = 5; c.strokeStyle = '#1B1028'; c.beginPath(); c.arc(0, 8, 40, 0, 7); c.stroke(); for (let i = 0; i < 5; i++) circle(c, 22 * Math.cos(i * 1.257), 8 + 22 * Math.sin(i * 1.257), 9, '#1B1028'); circle(c, 0, 8, 9, '#1B1028'); }   // football
  else if (kind === 4) { line(c, 0, 56, 0, 10, 14, '#8A5A2C'); circle(c, 0, -8, 38, '#4CAF6A'); circle(c, -26, 10, 24, '#4CAF6A'); circle(c, 26, 10, 24, '#4CAF6A'); }   // the tree house
  else { c.setLineDash([12, 10]); rrect(c, -78, -40, 156, 92, 8); c.lineWidth = 5; c.strokeStyle = 'rgba(138,92,26,0.6)'; c.stroke(); c.setLineDash([]); }
  c.restore();
}
// a wall of small drawers behind the keeper
function mindDrawers(c, x, y, w, h, t, nx = 4, ny = 5) {
  rrect(c, x - 14, y - 14, w + 28, h + 28, 16); c.fillStyle = '#123E46'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#07262C'; c.stroke();
  const dw = w / nx, dh = h / ny;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const dx = x + i * dw + 7, dy = y + j * dh + 7;
    rrect(c, dx, dy, dw - 14, dh - 14, 8); c.fillStyle = (i + j) % 2 ? '#1E6A70' : '#1A5C64'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0B3238'; c.stroke();
    rrect(c, dx + (dw - 14) / 2 - 22, dy + 12, 44, 20, 4); c.fillStyle = '#F4EBD6'; c.fill();
    rrect(c, dx + (dw - 14) / 2 - 16, dy + dh - 44, 32, 11, 5); c.fillStyle = '#E9B13A'; c.fill();
  }
}

// ---------------------------------------------------------------- his head in profile, with the brain in it
// (x, y) = the middle of the skull, s = scale (1 = about 780 px from nose to nape). o: {dots: {boss, eager, memo} 0..1 (lit),
// mini: draw the workers on it ((c, who, px, py, s) => ...), eye: 0..1 open, simple}
function mindHead(c, g, x, y, s, t, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const prof = [[20, -356], [-150, -330], [-268, -230], [-312, -70], [-318, -14], [-396, 96], [-334, 132], [-346, 176], [-320, 204], [-338, 234], [-306, 268], [-292, 334], [-216, 376], [-70, 384], [-44, 620], [238, 620], [252, 300], [344, 70], [318, -190], [190, -320], [20, -356]];
  smoothPath(c, prof); c.closePath();
  c.fillStyle = 'rgba(46,92,196,0.34)'; c.fill(); c.lineWidth = 7 / Math.max(0.25, Math.sqrt(s)); c.strokeStyle = 'rgba(127,233,255,0.9)'; c.lineJoin = 'round'; c.stroke();
  // his hair (the quiff), an ear, an eye
  c.beginPath(); c.moveTo(-270, -214); c.quadraticCurveTo(-330, -330, -210, -372); c.quadraticCurveTo(-60, -430, 150, -392); c.quadraticCurveTo(330, -330, 366, -120); c.quadraticCurveTo(386, 40, 318, 150);
  c.quadraticCurveTo(300, 20, 250, -60); c.quadraticCurveTo(240, -220, 60, -290); c.quadraticCurveTo(-120, -330, -200, -250); c.quadraticCurveTo(-240, -220, -270, -214); c.closePath();
  c.fillStyle = 'rgba(16,22,60,0.78)'; c.fill(); c.lineWidth = 5 / Math.max(0.25, Math.sqrt(s)); c.strokeStyle = 'rgba(127,233,255,0.55)'; c.stroke();
  c.beginPath(); c.ellipse(150, 120, 40, 62, 0.1, 0, 7); c.fillStyle = 'rgba(46,92,196,0.4)'; c.fill(); c.stroke();
  const eo = o.eye === undefined ? 1 : o.eye;
  ellipse(c, -262, 6, 22, 26 * eo + 2, 'rgba(255,255,255,0.92)'); circle(c, -270, 8, 10 * eo, '#15132A');
  line(c, -300, -44, -236, -52, 9, 'rgba(16,22,60,0.9)');
  // the brain
  const B = [30, -84];
  const lumps = [[-150, 20, 62], [-126, -50, 66], [-64, -98, 70], [16, -112, 74], [92, -86, 68], [144, -26, 62], [150, 40, 56], [96, 84, 60], [10, 100, 66], [-84, 88, 62]];
  c.save(); c.translate(B[0], B[1]); c.scale(1.42, 1.38);
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr, ly); c.arc(lx, ly, lr, 0, 7); } c.fillStyle = '#7E2748'; c.fill();
  c.beginPath(); for (const [lx, ly, lr] of lumps) { c.moveTo(lx + lr - 7, ly); c.arc(lx, ly, lr - 7, 0, 7); } c.ellipse(0, 0, 150, 96, 0, 0, 7);
  const bg = c.createRadialGradient(-50, -70, 20, 0, 0, 230); bg.addColorStop(0, '#FFC2D2'); bg.addColorStop(0.5, '#F08AA8'); bg.addColorStop(1, '#C8527A');
  c.fillStyle = bg; c.fill();
  c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(160,52,96,0.5)';
  for (const [x0, y0, x1, y1, x2, y2] of [[-150, -24, -108, -66, -70, -26], [-56, -122, -20, -74, 22, -112], [40, -130, 84, -86, 128, -98], [-176, 44, -150, 78, -116, 60], [110, 96, 148, 76, 176, 30], [-30, 122, 6, 100, 44, 126]]) {
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
  }
  c.restore();
  // stem
  rrect(c, 66, 70, 62, 110, 24); c.fillStyle = '#D9688A'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#7E2748'; c.stroke();
  for (const who of ['boss', 'memo', 'eager']) {
    const [px, py] = MG_AT[who], lit = o.dots ? (o.dots[who] || 0) : 0;
    if (o.mini) o.mini(c, who, px, py);
    else if (o.dots) {
      const pu = 0.5 + 0.5 * Math.sin(t * 7);
      circle(c, px, py, 34, lit > 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.28)'); circle(c, px, py, 24, lit > 0 ? MG[who].col : 'rgba(120,40,80,0.5)');
      if (lit > 0) { c.beginPath(); c.arc(px, py, 50 + 26 * pu, 0, 7); c.lineWidth = 12; c.strokeStyle = rgba('#FFD447', 0.9 * (1 - pu * 0.7) * lit); c.stroke(); }
    }
  }
  c.restore();
  if (g) { softDot(g, x + 30 * s, y - 84 * s, 330 * s, '#FF86C8', o.glow === undefined ? 0.3 : o.glow); }
}
// the "you are here" chip: his head, small, with one spot lit (screen space)
function mindChip(x, y, t, who, k = 1) {
  if (k <= 0.01) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.03);
  rrect(ctx, -112, -112, 224, 244, 26); ctx.fillStyle = 'rgba(10,8,30,0.82)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = MG[who].col; ctx.stroke();
  mindHead(ctx, null, -4, -4, 0.235, t, { dots: { [who]: 1 }, glow: 0 });
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); softDot(gctx, x + (MG_AT[who][0] - 4) * 0.235, y + (MG_AT[who][1] - 4) * 0.235, 46, '#FFD447', 0.5 * k * (0.6 + 0.4 * Math.sin(t * 7))); gctx.restore();
}
