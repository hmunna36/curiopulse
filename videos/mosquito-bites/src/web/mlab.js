// The lab and the snacks: a night lab (`labBack`), the two-tube box that lets mosquitoes choose between two worn sleeves
// (`olfBox`, `nylonSleeve`, `faceDisc`), a wall calendar (`yearCard`), a balance scale (`labScale`), a wedge of smelly
// cheese with a face (`cheeseWedge`), a bare foot (`bareFoot`), the hand at the end of the macro forearm (`macroHand`)
// and a cheese board big enough to stand on (`cheeseBoard`). World coords under the current camera unless it says
// screen space. Loaded before scenes.js.
'use strict';

const LABC = { glass: '#BFEFFF', bench: '#34466A', benchHi: '#4A5E8A', brass: '#E0A94A', brassSh: '#9A6A1E' };

// ---------------------------------------------------------------- the room
function labBack(cam, t, o = {}) {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 80, 540, 900, 1400);
  bg.addColorStop(0, o.c1 || '#17405A'); bg.addColorStop(0.55, o.c2 || '#0C2238'); bg.addColorStop(1, '#040A16');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  const c = ctx;
  // wall tiles, a shelf of glassware (far, dim)
  c.strokeStyle = 'rgba(140,200,230,0.05)'; c.lineWidth = 3;
  for (let x = -300; x <= 1400; x += 170) { c.beginPath(); c.moveTo(x, 200); c.lineTo(x, 1260); c.stroke(); }
  for (let y = 300; y <= 1260; y += 170) { c.beginPath(); c.moveTo(-300, y); c.lineTo(1400, y); c.stroke(); }
  c.fillStyle = 'rgba(10,26,44,0.9)'; c.fillRect(-300, 486, 1700, 16);
  for (let i = 0; i < 12; i++) {
    const x = -220 + i * 138 + 30 * hash(i * 3.3), h = 70 + 70 * hash(i * 5.1), w = 36 + 30 * hash(i * 2.2), col = ['#1E5A6A', '#2A4A7A', '#3A3A70', '#1E6A5A'][i % 4];
    c.fillStyle = col; rrect(c, x - w / 2, 486 - h, w, h, 10); c.fill(); c.fillRect(x - w * 0.18, 486 - h - 22, w * 0.36, 26);
    c.fillStyle = 'rgba(190,240,255,0.16)'; c.fillRect(x - w / 2 + 6, 486 - h + 10, 5, h - 22);
  }
  // the bench
  c.fillStyle = '#16233E'; c.fillRect(-400, 1296, 1900, 800);
  c.fillStyle = LABC.bench; c.fillRect(-400, 1246, 1900, 54); c.fillStyle = LABC.benchHi; c.fillRect(-400, 1246, 1900, 12);
  // a lamp's pool of light
  softDot(ctx, 540, 900, 900, o.lamp || '#3FA6C8', 0.1); softDot(gctx, 200, 420, 260, '#7FE9FF', 0.12);
}

// ---------------------------------------------------------------- faces on tags
// the friend's beanie and glasses, in head space
function friendHat(cc) {
  circle(cc, 4, -98, 20, '#FFE9B8'); circle(cc, 0, -102, 12, '#FFFFFF');
  cc.beginPath(); cc.moveTo(-70, -22); cc.quadraticCurveTo(-78, -92, 0, -96); cc.quadraticCurveTo(78, -92, 70, -22); cc.closePath(); cc.fillStyle = '#FF8A3C'; cc.fill();
  rrect(cc, -74, -40, 148, 30, 12); cc.fillStyle = '#FFB86A'; cc.fill();
  cc.strokeStyle = 'rgba(160,70,10,0.5)'; cc.lineWidth = 3; for (let i = -3; i <= 3; i++) { cc.beginPath(); cc.moveTo(i * 20, -38); cc.lineTo(i * 20, -12); cc.stroke(); }
  for (const sx of [-24, 24]) { cc.beginPath(); cc.arc(sx, -2, 21, 0, 7); cc.fillStyle = 'rgba(190,225,255,0.16)'; cc.fill(); cc.lineWidth = 4.5; cc.strokeStyle = '#1A1C2C'; cc.stroke(); }
  cc.lineWidth = 4.5; cc.beginPath(); cc.moveTo(-4, -4); cc.quadraticCurveTo(0, -8, 4, -4); cc.moveTo(-45, -4); cc.lineTo(-62, -8); cc.moveTo(45, -4); cc.lineTo(62, -8); cc.stroke();
}
// a face in a round frame: who = 'you' | 'friend'; r = radius; face = a FACES entry
function faceDisc(c, x, y, r, who, face, t, ring = '#FFFFFF') {
  const s = r / 84;
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = who === 'you' ? '#2A3A78' : '#3A2A6A'; c.fill(); c.clip();
  drawCharacter(c, { x, y: y + 482 * s, s, pose: POSES.stand, face: face || FACES.calm }, t, who === 'you' ? CAMPPAL : FRPAL);
  if (who === 'friend') { c.save(); c.translate(x, y + 12 * s); c.scale(s, s); friendHat(c); c.restore(); }
  c.restore();
  c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = Math.max(4, r * 0.1); c.strokeStyle = ring; c.stroke();
}

// ---------------------------------------------------------------- the two-tube box
const OLF = { cage: [540, 1160], fork: [540, 950], L: [300, 708], R: [780, 708], bw: 300, bh: 224 };
// a worn nylon sleeve on a little stand, base at (x, y)
function nylonSleeve(c, x, y, s, t, glow = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -8, -150, 16, 150, 4); c.fillStyle = '#6A7896'; c.fill(); rrect(c, -46, -8, 92, 12, 6); c.fill(); rrect(c, -40, -156, 80, 12, 6); c.fill();
  c.beginPath(); c.moveTo(-34, -152); c.quadraticCurveTo(-46, -80, -30, -22 + 3 * Math.sin(t * 2)); c.quadraticCurveTo(0, -4, 30, -22 + 3 * Math.sin(t * 2 + 1)); c.quadraticCurveTo(46, -80, 34, -152); c.closePath();
  const g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#F0D2AE'); g.addColorStop(0.5, '#DDB48A'); g.addColorStop(1, '#B98A62');
  c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(90,56,30,0.7)'; c.stroke();
  c.strokeStyle = 'rgba(120,80,50,0.35)'; c.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-34 + i * 2, -128 + i * 28); c.quadraticCurveTo(0, -118 + i * 28, 34 - i * 2, -130 + i * 28); c.stroke(); }
  c.restore();
  if (glow > 0.01) softDot(gctx, x, y - 80 * s, 120 * s, '#FFD447', 0.4 * glow);
}
// the glass: cage at the bottom, a stem, a fork, a box at the end of each arm. o: {door 0..1, glowL, glowR, faceL, faceR}
function olfBox(t, o = {}) {
  const c = ctx, [cx, cy] = OLF.cage, [fx, fy] = OLF.fork;
  const tube = (pts, w) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
    c.lineWidth = w; c.strokeStyle = rgba(LABC.glass, 0.5); c.stroke();
    c.lineWidth = w - 9; c.strokeStyle = '#0B2034'; c.stroke();
    c.lineWidth = w - 9; c.strokeStyle = 'rgba(150,220,255,0.07)'; c.stroke();
  };
  tube([[cx, cy - 80], [fx, fy], [OLF.L[0], OLF.L[1] + OLF.bh / 2 - 6]], 76);
  tube([[fx, fy], [OLF.R[0], OLF.R[1] + OLF.bh / 2 - 6]], 76);
  // the boxes, each with a sleeve
  for (const [k, B] of [['L', OLF.L], ['R', OLF.R]]) {
    const x0 = B[0] - OLF.bw / 2, y0 = B[1] - OLF.bh / 2;
    rrect(c, x0, y0, OLF.bw, OLF.bh, 22); c.fillStyle = '#0B2034'; c.fill(); c.fillStyle = 'rgba(150,220,255,0.08)'; c.fill();
    nylonSleeve(c, B[0], B[1] + OLF.bh / 2 - 22, 1.05, t, k === 'L' ? (o.glowL || 0) : (o.glowR || 0));
    rrect(c, x0, y0, OLF.bw, OLF.bh, 22); c.lineWidth = 6; c.strokeStyle = rgba(LABC.glass, 0.75); c.stroke();
    c.beginPath(); c.moveTo(x0 + 24, y0 + 30); c.lineTo(x0 + 24, y0 + OLF.bh - 60); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,0.28)'; c.stroke();
  }
  // the cage they start in
  rrect(c, cx - 150, cy - 82, 300, 164, 22); c.fillStyle = '#0B2034'; c.fill(); c.fillStyle = 'rgba(150,220,255,0.07)'; c.fill();
  c.save(); rrect(c, cx - 150, cy - 82, 300, 164, 22); c.clip();
  c.strokeStyle = 'rgba(190,235,255,0.13)'; c.lineWidth = 2;
  for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(cx + i * 22, cy - 90); c.lineTo(cx + i * 22, cy + 90); c.stroke(); }
  for (let j = -4; j <= 4; j++) { c.beginPath(); c.moveTo(cx - 160, cy + j * 22); c.lineTo(cx + 160, cy + j * 22); c.stroke(); }
  c.restore();
  rrect(c, cx - 150, cy - 82, 300, 164, 22); c.lineWidth = 6; c.strokeStyle = rgba(LABC.glass, 0.75); c.stroke();
  // the gate at the foot of the stem
  const d = o.door || 0;
  c.save(); c.translate(cx - 36, cy - 82); c.rotate(-1.5 * d); rrect(c, 0, -6, 72, 12, 6); c.fillStyle = d > 0.5 ? '#4DFFB4' : '#FF5A6E'; c.fill(); c.restore();
}
// the tag over a box: a face and a number (world coords)
function olfTag(B, who, num, face, t, k = 1, col = '#FFFFFF') {
  if (k <= 0) return;
  const c = ctx, x = B[0], y = B[1] - OLF.bh / 2 - 62, s = E.outBack(clamp(k), 1.8);
  c.save(); c.translate(x, y); c.scale(s, s);
  rrect(c, -122, -50, 244, 100, 30); c.fillStyle = 'rgba(8,10,30,0.86)'; c.fill(); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  faceDisc(c, -70, 0, 40, who, face, t, col);
  c.font = '400 66px Anton'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText('#' + num, -16, 4);
  c.restore();
}

// ---------------------------------------------------------------- a wall calendar that counts years (screen space)
function yearCard(x, y, s, year, flip, k = 1) {
  if (k <= 0) return;
  const c = ctx, sc = E.outBack(clamp(k), 1.6) * s;
  const page = (n, a, dy, rot) => {
    c.save(); c.translate(0, dy); c.rotate(rot); c.globalAlpha = a;
    rrect(c, -110, -120, 220, 250, 18); c.fillStyle = '#F7F4EC'; c.fill();
    c.save(); rrect(c, -110, -120, 220, 250, 18); c.clip(); c.fillStyle = '#FF5A6E'; c.fillRect(-110, -120, 220, 74); c.restore();
    c.font = '900 40px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFFFFF'; c.fillText('YEAR', 0, -82);
    c.font = '400 150px Anton'; c.fillStyle = '#1A1C2C'; c.fillText(String(n), 0, 50);
    c.restore();
  };
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(-0.05); c.scale(sc, sc);
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
  page(year, 1, 0, 0);
  c.shadowColor = 'transparent';
  if (flip > 0 && flip < 1) page(year - 1, 1 - flip, 380 * flip * flip, -0.6 * flip);   // the old page falls away
  for (const dx of [-60, 60]) { rrect(c, dx - 7, -140, 14, 40, 7); c.fillStyle = '#8A93B4'; c.fill(); }
  c.restore();
}

// ---------------------------------------------------------------- the scale
// pivot at (540, py); tilt > 0 = the left pan goes down. Returns the pans' centres [[x, y], [x, y]] (world coords)
function labScale(t, tilt, o = {}) {
  const c = ctx, px = 540, py = o.py || 700, half = o.half || 330, drop = o.drop || 250;
  // base and post
  c.beginPath(); c.moveTo(px - 150, 1250); c.lineTo(px + 150, 1250); c.lineTo(px + 96, 1196); c.lineTo(px - 96, 1196); c.closePath(); c.fillStyle = LABC.brassSh; c.fill();
  rrect(c, px - 110, 1186, 220, 22, 10); c.fillStyle = LABC.brass; c.fill();
  const pg = c.createLinearGradient(px - 16, 0, px + 16, 0); pg.addColorStop(0, '#F4CF7A'); pg.addColorStop(0.5, LABC.brass); pg.addColorStop(1, LABC.brassSh);
  c.fillStyle = pg; c.fillRect(px - 14, py - 10, 28, 1206 - py);
  const ends = [-1, 1].map((s) => [px + s * half * Math.cos(tilt), py - s * half * Math.sin(-tilt) * -1 * -1]);
  // (left end goes down for tilt > 0)
  ends[0][1] = py + half * Math.sin(tilt); ends[1][1] = py - half * Math.sin(tilt);
  c.lineCap = 'round'; c.lineWidth = 20; c.strokeStyle = LABC.brassSh; c.beginPath(); c.moveTo(ends[0][0], ends[0][1] + 4); c.lineTo(ends[1][0], ends[1][1] + 4); c.stroke();
  c.lineWidth = 14; c.strokeStyle = LABC.brass; c.beginPath(); c.moveTo(ends[0][0], ends[0][1]); c.lineTo(ends[1][0], ends[1][1]); c.stroke();
  circle(c, px, py, 26, LABC.brassSh); circle(c, px, py, 18, '#F4CF7A');
  softDot(gctx, px, py, 50, '#FFD98A', 0.3);
  const pans = ends.map(([ex, ey]) => [ex, ey + drop]);
  pans.forEach(([x, y], i) => {
    c.strokeStyle = 'rgba(224,169,74,0.85)'; c.lineWidth = 4;
    for (const dx of [-140, 0, 140]) { c.beginPath(); c.moveTo(ends[i][0], ends[i][1]); c.lineTo(x + dx, y - (dx ? 0 : -14)); c.stroke(); }
    c.beginPath(); c.moveTo(x - 166, y - 4); c.quadraticCurveTo(x, y + 62, x + 166, y - 4); c.closePath(); c.fillStyle = LABC.brassSh; c.fill();
    c.beginPath(); c.ellipse(x, y - 4, 166, 24, 0, 0, 7); c.fillStyle = LABC.brass; c.fill(); c.beginPath(); c.ellipse(x, y - 2, 146, 17, 0, 0, 7); c.fillStyle = '#F4CF7A'; c.fill();
    circle(c, ends[i][0], ends[i][1], 9, '#F4CF7A');
  });
  return pans;
}

// ---------------------------------------------------------------- a wedge of smelly cheese
// (x, y) = the middle of its base; about 330 wide and 210 tall at s = 1. o: {face: 'smug' | 'happy' | 'none', look, squash}
function cheeseWedge(c, x, y, s, t, o = {}) {
  const sq = o.squash || 0;
  c.save(); c.translate(x, y); c.scale(s * (1 + 0.1 * sq), s * (1 - 0.14 * sq)); c.lineJoin = 'round';
  ellipse(c, 0, 6, 190, 20, 'rgba(0,0,0,0.3)');
  // the top (rind), then the cut face
  c.beginPath(); c.moveTo(-165, -52); c.lineTo(150, -168); c.lineTo(110, -206); c.lineTo(-150, -86); c.closePath(); c.fillStyle = '#F2A03C'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#5A3008'; c.stroke();
  c.beginPath(); c.moveTo(-165, 0); c.lineTo(150, 0); c.lineTo(150, -168); c.lineTo(-165, -52); c.closePath();
  const g = c.createLinearGradient(0, -170, 0, 0); g.addColorStop(0, '#FFF0A8'); g.addColorStop(0.6, '#FFDC6E'); g.addColorStop(1, '#F2BC40');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (const [hx, hy, r] of [[-96, -22, 17], [-30, -52, 11], [84, -34, 20], [112, -112, 13], [28, -14, 9]]) { ellipse(c, hx, hy, r, r * 0.86, '#E0A62E'); ellipse(c, hx + 2, hy + 3, r * 0.74, r * 0.6, '#C98A1A'); }
  c.fillStyle = '#F2A03C'; c.fillRect(138, -180, 20, 190);
  c.restore();
  c.beginPath(); c.moveTo(-165, 0); c.lineTo(150, 0); c.lineTo(150, -168); c.lineTo(-165, -52); c.closePath(); c.lineWidth = 5; c.strokeStyle = '#5A3008'; c.stroke();
  // its face
  if (o.face !== 'none') {
    const lx = (o.look || [0, 0])[0] * 5, ly = (o.look || [0, 0])[1] * 4, bl = (Math.sin(t * 0.9 + 1) > 0.97) ? 1 : 0;
    for (const ex of [18, 66]) {
      ellipse(c, ex, -86, 15, bl ? 2 : 18, '#FFFFFF'); if (!bl) { circle(c, ex + lx, -84 + ly, 8, '#2A1608'); circle(c, ex + lx - 2.5, -87 + ly, 2.6, '#FFFFFF'); }
      c.save(); c.beginPath(); c.ellipse(ex, -86, 16, 19, 0, 0, 7); c.clip(); c.fillStyle = '#F2BC40'; c.fillRect(ex - 18, -108, 36, o.face === 'happy' ? 6 : 15); c.restore();
    }
    c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = '#5A3008';
    c.beginPath(); c.moveTo(2, -110); c.lineTo(34, -104); c.moveTo(52, -106); c.lineTo(84, -114); c.stroke();
    c.beginPath(); if (o.face === 'happy') c.arc(44, -60, 20, 0.15, Math.PI - 0.15); else { c.moveTo(22, -52); c.quadraticCurveTo(48, -40, 72, -58); } c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- a bare foot, from the side, toes to the left
// (x, y) = under the heel; about 250 long at s = 1; the leg goes up toward (x + legDX, y - legLen). wig = toe wiggle 0..1
function bareFoot(c, x, y, s, t, o = {}) {
  const P = o.pal || PAL, wig = o.wig === undefined ? 1 : o.wig, ldx = o.legDX === undefined ? 120 : o.legDX, ll = o.legLen || 520;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  // the leg: bare ankle, then the trouser cuff
  const ax = -18, ay = -128, tx = ldx, ty = -ll;
  c.lineWidth = 104; c.strokeStyle = P.pantsSh || '#1E2654'; c.beginPath(); c.moveTo(lerp(ax, tx, 0.34), lerp(ay, ty, 0.34)); c.lineTo(tx, ty); c.stroke();
  c.lineWidth = 84; c.strokeStyle = P.skinSh; c.beginPath(); c.moveTo(ax, ay + 30); c.lineTo(lerp(ax, tx, 0.4), lerp(ay, ty, 0.4)); c.stroke();
  c.lineWidth = 64; c.strokeStyle = P.skin; c.beginPath(); c.moveTo(ax - 6, ay + 30); c.lineTo(lerp(ax, tx, 0.4) - 6, lerp(ay, ty, 0.4)); c.stroke();
  c.lineWidth = 116; c.strokeStyle = P.pants || '#2F3A78'; c.beginPath(); c.moveTo(lerp(ax, tx, 0.36), lerp(ay, ty, 0.36)); c.lineTo(lerp(ax, tx, 0.47), lerp(ay, ty, 0.47)); c.stroke();
  // the foot
  c.beginPath(); c.moveTo(30, -6); c.quadraticCurveTo(52, -60, 22, -128); c.quadraticCurveTo(-40, -150, -70, -112);
  c.quadraticCurveTo(-150, -86, -214, -62); c.quadraticCurveTo(-246, -40, -232, -8); c.quadraticCurveTo(-120, 4, 30, -6); c.closePath();
  const g = c.createLinearGradient(0, -140, 0, 0); g.addColorStop(0, P.skinHi); g.addColorStop(0.5, P.skin); g.addColorStop(1, P.skinSh);
  c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(120,60,40,0.7)'; c.stroke();
  c.beginPath(); c.moveTo(-150, -14); c.quadraticCurveTo(-90, -34, -20, -14); c.lineWidth = 4; c.strokeStyle = 'rgba(150,80,60,0.35)'; c.stroke();
  // toes: the big one in front, the others peeking over it
  for (let i = 4; i >= 0; i--) {
    const wq = wig * 0.3 * Math.sin(t * 9 + i * 0.9), r = i === 0 ? 30 : 21 - i * 2;
    const bx = -226 - (i === 0 ? 6 : 0) + i * 4, by = -30 - i * 17 - (i === 0 ? 0 : 6);
    c.save(); c.translate(bx + 20, by); c.rotate(wq); c.translate(-20, 0);
    c.beginPath(); c.ellipse(0, 0, r * 1.05, r * 0.82, 0, 0, 7); c.fillStyle = i ? P.skin : P.skinHi; c.fill(); c.lineWidth = 3.5; c.strokeStyle = 'rgba(120,60,40,0.7)'; c.stroke();
    c.beginPath(); c.ellipse(-r * 0.3, -r * 0.2, r * 0.44, r * 0.34, -0.2, 0, 7); c.fillStyle = 'rgba(255,240,230,0.85)'; c.fill();
    c.restore();
  }
  c.restore();
}

// ---------------------------------------------------------------- the hand at the end of the macro forearm
// same frame as macroArm (pass the same o): a relaxed hand, palm down, past the wrist at u = 1000
function macroHand(o) {
  const c = ctx, T = MARM_TONES[o.tone || 'you'];
  c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0); c.scale(o.s || 1, o.s || 1); c.lineJoin = 'round'; c.lineCap = 'round';
  const fing = (x, y, len, w, rot, shade) => {
    c.save(); c.translate(x, y); c.rotate(rot);
    rrect(c, 0, -w / 2, len, w, w / 2); c.fillStyle = shade ? T[3] : T[2]; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(110,56,36,0.55)'; c.stroke();
    rrect(c, 6, -w / 2 + 5, len - 14, w * 0.3, w * 0.15); c.fillStyle = rgba(T[0], 0.55); c.fill();
    c.beginPath(); c.moveTo(len * 0.5, -w / 2 + 4); c.lineTo(len * 0.5, w / 2 - 4); c.lineWidth = 3; c.strokeStyle = 'rgba(120,60,40,0.3)'; c.stroke();
    c.restore();
  };
  fing(1150, -150, 190, 84, -0.5, true);                                    // the thumb, behind
  for (let i = 3; i >= 0; i--) fing(1300, -96 + i * 74, 250 - Math.abs(i - 1) * 26, 78, 0.1 + i * 0.07, i > 1);
  c.beginPath(); c.moveTo(990, -marmHW(1000)); c.quadraticCurveTo(1180, -238, 1340, -150); c.quadraticCurveTo(1400, 0, 1340, 186); c.quadraticCurveTo(1180, 250, 990, marmHW(1000)); c.closePath();
  const g = c.createLinearGradient(0, -240, 0, 240); g.addColorStop(0, T[0]); g.addColorStop(0.2, T[1]); g.addColorStop(0.6, T[2]); g.addColorStop(1, T[3]);
  c.fillStyle = g; c.fill();
  for (let i = 0; i < 4; i++) ellipse(c, 1316, -100 + i * 74, 22, 26, 'rgba(150,80,60,0.22)');
  c.restore();
}

// ---------------------------------------------------------------- a cheese board big enough to stand on
// (x, y) = the middle of the board on the ground; k = 0..1 (the things on it arrive one after another)
function cheeseBoard(c, x, y, k, t, front = false) {
  if (k <= 0) return;
  const pop = (a, b) => E.outBack(clamp(inv(a, b, k)), 2);
  c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!front) {
    const s = pop(0, 0.22);
    c.save(); c.scale(s, s);
    // the board, with a handle
    c.save(); c.translate(-330, 6); c.rotate(-0.1); rrect(c, -150, -24, 190, 48, 24); c.fillStyle = '#8A5A30'; c.fill(); circle(c, -112, 0, 11, '#16233E'); c.restore();
    c.beginPath(); c.ellipse(0, 14, 322, 86, 0, 0, 7); c.fillStyle = '#5A3518'; c.fill();
    c.beginPath(); c.ellipse(0, 0, 322, 86, 0, 0, 7); const g = c.createLinearGradient(-320, 0, 320, 0); g.addColorStop(0, '#C8894A'); g.addColorStop(0.5, '#B47638'); g.addColorStop(1, '#8E5826'); c.fillStyle = g; c.fill();
    c.save(); c.clip(); c.strokeStyle = 'rgba(90,50,20,0.35)'; c.lineWidth = 4;
    for (let i = 1; i <= 4; i++) { c.beginPath(); c.ellipse(-40, 0, 80 * i, 22 * i, 0, 0, 7); c.stroke(); }
    c.restore();
    c.restore();
    // behind him: crackers, the knife
    const s2 = pop(0.3, 0.5);
    if (s2 > 0) { c.save(); c.translate(196, -34); c.scale(s2, s2); for (let i = 0; i < 4; i++) { c.save(); c.translate(i * 14, -i * 15); c.rotate(-0.2); rrect(c, -44, -11, 88, 22, 6); c.fillStyle = i % 2 ? '#F2D08A' : '#E8BE70'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#8A5A20'; c.stroke(); for (const dx of [-22, 0, 22]) circle(c, dx, 0, 2.2, '#8A5A20'); c.restore(); } c.restore(); }
    const s3 = pop(0.42, 0.62);
    if (s3 > 0) { c.save(); c.translate(-226, -16); c.rotate(-0.28); c.scale(s3, s3); rrect(c, -9, -150, 18, 96, 9); c.fillStyle = '#6A3A1A'; c.fill(); c.beginPath(); c.moveTo(-13, -54); c.lineTo(13, -54); c.lineTo(9, 16); c.quadraticCurveTo(0, 30, -9, 16); c.closePath(); c.fillStyle = '#DCE6F4'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#7A8AA6'; c.stroke(); c.restore(); }
  } else {
    // in front of him: grapes, cubes with flags, an olive
    const s1 = pop(0.2, 0.42);
    if (s1 > 0) { c.save(); c.translate(-150, 44); c.scale(s1, s1); const G = [[0, 0], [30, -4], [-28, -6], [14, -28], [-14, -30], [44, -30], [0, -54], [28, -56]]; for (const [gx, gy] of G) { circle(c, gx, gy, 19, '#4A2A7A'); circle(c, gx, gy, 16, '#7A4AC8'); circle(c, gx - 5, gy - 6, 4.5, 'rgba(255,255,255,0.6)'); } c.lineWidth = 5; c.strokeStyle = '#3A6A2A'; c.beginPath(); c.moveTo(10, -70); c.quadraticCurveTo(20, -96, 44, -98); c.stroke(); c.restore(); }
    const s2 = pop(0.5, 0.72);
    if (s2 > 0) for (const [dx, dy, r] of [[150, 46, 0.1], [214, 30, -0.14], [96, 60, 0.04]]) { c.save(); c.translate(dx, dy); c.rotate(r); c.scale(s2, s2); rrect(c, -24, -40, 48, 44, 7); c.fillStyle = '#FFDC6E'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#8A5A08'; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#C8B48A'; c.beginPath(); c.moveTo(0, -36); c.lineTo(0, -88); c.stroke(); c.beginPath(); c.moveTo(0, -88); c.lineTo(30, -78); c.lineTo(0, -66); c.closePath(); c.fillStyle = '#FF5A6E'; c.fill(); c.restore(); }
    const s3 = pop(0.64, 0.84);
    if (s3 > 0) { c.save(); c.translate(20, 66); c.scale(s3, s3); circle(c, 0, 0, 17, '#2A4A1A'); circle(c, 0, 0, 14, '#5A8A2A'); circle(c, 4, -2, 5, '#E8405C'); c.restore(); }
  }
  c.restore();
}
