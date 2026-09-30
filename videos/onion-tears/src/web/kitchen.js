// Onion-tears Short: the kitchen at night (world coords, drawn under the current camera), the counter and
// cutting board, the onion (whole, halved, sliced, with a smug face), the knife, the hero chopping behind
// the counter, his tears, and the green tear-gas wisps.
'use strict';

const KIT = { counter: 1330, boardX0: 300, boardX1: 860, boardY: 1300, onionX: 560, onionY: 1236, onionR: 74 };
const COOK = { x: 520, y: 1700, s: 1.5 };   // behind the counter: chest up is visible
let KIT_JARS = null, KIT_STARS = null;

function initKitchen() {
  const rng = mulberry32(12);
  KIT_JARS = [...Array(7)].map((_, i) => ({ x: 120 + i * 130 + rng() * 30, h: 70 + rng() * 60, w: 46 + rng() * 22,
    col: ['#E0663A', '#F2C14E', '#6BBF59', '#C9543E', '#EFD9A7', '#8A5A3B', '#D94F70'][i] }));
  KIT_STARS = [...Array(40)].map(() => ({ x: rng(), y: rng(), r: 1 + rng() * 2.2, ph: rng() * 7 }));
}

// ---------------------------------------------------------------- the room
function kitchenBg(t, o = {}) {
  const c = ctx;
  const g = c.createLinearGradient(0, -400, 0, 2200);
  g.addColorStop(0, '#16213A'); g.addColorStop(0.55, '#1E2C45'); g.addColorStop(1, '#0C1322');
  c.fillStyle = g; c.fillRect(-900, -900, 2900, 3700);
  // backsplash tiles (subway tiles, warm-lit)
  for (let y = 880; y < 1330; y += 44) {
    const off = ((y / 44) & 1) * 45;
    for (let x = -900 + off; x < 2000; x += 90) {
      rrect(c, x + 3, y + 3, 84, 38, 6);
      c.fillStyle = ((x * 7 + y * 3) % 5 === 0) ? '#2D4262' : '#27395A'; c.fill();
      line(c, x + 10, y + 9, x + 60, y + 9, 3, 'rgba(255,255,255,0.05)');
    }
  }
  // window: night sky, a moon, the city far away
  const wx = 150, wy = 250, ww = 780, wh = 560;
  c.save(); rrect(c, wx, wy, ww, wh, 18); c.clip();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#0C1638'); sky.addColorStop(1, '#2B2A5A');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  for (const s of KIT_STARS) {
    const tw = 0.6 + 0.4 * Math.sin(t * 2 + s.ph);
    circle(c, wx + s.x * ww, wy + s.y * wh * 0.6, s.r, `rgba(220,230,255,${0.7 * tw})`);
  }
  circle(c, wx + ww * 0.78, wy + 130, 54, '#F4EFD8');
  softDot(gctx, wx + ww * 0.78, wy + 130, 170, '#FFF1C4', 0.5);
  for (let i = 0; i < 16; i++) { // skyline
    const bx = wx + i * 52, bh = 80 + hash(i * 3.1) * 170;
    c.fillStyle = '#131A33'; c.fillRect(bx, wy + wh - bh, 50, bh);
    for (let k = 0; k < 6; k++) if (hash(i * 11 + k) > 0.55) {
      c.fillStyle = 'rgba(255,205,120,0.75)'; c.fillRect(bx + 8 + (k % 3) * 13, wy + wh - bh + 16 + Math.floor(k / 3) * 26, 7, 10);
    }
  }
  c.restore();
  rrect(c, wx, wy, ww, wh, 18); c.lineWidth = 18; c.strokeStyle = '#E8DCC6'; c.stroke();
  line(c, wx + ww / 2, wy, wx + ww / 2, wy + wh, 12, '#D8CCB6');
  line(c, wx - 20, wy + wh + 16, wx + ww + 20, wy + wh + 16, 22, '#D8CCB6');
  // shelf with jars
  line(c, 60, 860, 1020, 860, 16, '#6B4A33');
  for (const j of KIT_JARS) {
    rrect(c, j.x - j.w / 2, 852 - j.h, j.w, j.h, 10); c.fillStyle = rgba('#DDEBFF', 0.22); c.fill();
    rrect(c, j.x - j.w / 2 + 5, 852 - j.h * 0.7, j.w - 10, j.h * 0.7 - 4, 8); c.fillStyle = j.col; c.fill();
    rrect(c, j.x - j.w / 2 - 3, 846 - j.h, j.w + 6, 14, 5); c.fillStyle = '#B98A52'; c.fill();
  }
  // pendant lamp (warm key light)
  const lx = o.lampX || 560;
  line(c, lx, -700, lx, 40, 5, '#222B3E');
  c.beginPath(); c.moveTo(lx - 110, 130); c.quadraticCurveTo(lx, 0, lx + 110, 130); c.closePath();
  c.fillStyle = '#2FA59A'; c.fill();
  ellipse(c, lx, 130, 110, 16, '#FFE9B8');
  softDot(gctx, lx, 150, 300, '#FFC87A', 0.6);
  const cone = c.createLinearGradient(0, 130, 0, 1330);
  cone.addColorStop(0, 'rgba(255,214,150,0.18)'); cone.addColorStop(1, 'rgba(255,214,150,0.02)');
  c.fillStyle = cone; c.beginPath(); c.moveTo(lx - 110, 130); c.lineTo(lx + 110, 130); c.lineTo(lx + 520, 1330); c.lineTo(lx - 520, 1330); c.closePath(); c.fill();
}

// the counter in front of him (drawn after the character)
function kitchenCounter() {
  const c = ctx, y = KIT.counter;
  const top = c.createLinearGradient(0, y - 26, 0, y + 30);
  top.addColorStop(0, '#F3EDE2'); top.addColorStop(0.5, '#CFC4B2'); top.addColorStop(1, '#8F8472');
  c.fillStyle = top; c.fillRect(-900, y - 26, 2900, 56);
  line(c, -900, y - 24, 2000, y - 24, 4, 'rgba(255,255,255,0.85)');
  const f = c.createLinearGradient(0, y + 30, 0, y + 800);
  f.addColorStop(0, '#2F8F86'); f.addColorStop(1, '#0F3432');
  c.fillStyle = f; c.fillRect(-900, y + 30, 2900, 1200);
  for (let x = -880; x < 2000; x += 260) {
    rrect(c, x + 12, y + 60, 236, 520, 12); c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,0.22)'; c.stroke();
    rrect(c, x + 100, y + 90, 60, 12, 6); c.fillStyle = '#D8C9A6'; c.fill();
  }
  softDot(gctx, 560, y - 20, 520, '#FFD9A0', 0.16);
}

// the cutting board on the counter
function cuttingBoard(x0 = KIT.boardX0, x1 = KIT.boardX1, y = KIT.boardY) {
  const c = ctx;
  rrect(c, x0, y - 10, x1 - x0, 40, 14); c.fillStyle = '#8A5A34'; c.fill();
  rrect(c, x0, y - 22, x1 - x0, 30, 14);
  const g = c.createLinearGradient(0, y - 22, 0, y + 8);
  g.addColorStop(0, '#E2B27A'); g.addColorStop(1, '#C18A55'); c.fillStyle = g; c.fill();
  for (let i = 0; i < 5; i++) line(c, x0 + 30 + i * 90, y - 14 + (i % 2) * 6, x0 + 110 + i * 90, y - 14 + (i % 2) * 6, 2, 'rgba(120,70,30,0.35)');
  circle(c, x1 - 26, y - 7, 8, '#6A4020');
}

// ---------------------------------------------------------------- the onion
// whole onion: bulb with a pointy top and root hairs. o: {face, faceK, crown, squash, rot, halved: 0..1}
function onionBulb(c, x, y, r, t, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(1 + (o.squash || 0) * 0.12, 1 - (o.squash || 0) * 0.12);
  // root hairs
  for (let i = -3; i <= 3; i++) line(c, i * 7, r * 0.9, i * 11, r * 1.12 + Math.abs(i) * 2, 3, '#CDB48A');
  // body
  c.beginPath();
  c.moveTo(0, -r * 1.35);
  c.bezierCurveTo(r * 0.28, -r * 1.0, r * 1.08, -r * 0.62, r * 1.02, r * 0.1);
  c.bezierCurveTo(r * 0.96, r * 0.8, r * 0.4, r * 0.98, 0, r * 0.98);
  c.bezierCurveTo(-r * 0.4, r * 0.98, -r * 0.96, r * 0.8, -r * 1.02, r * 0.1);
  c.bezierCurveTo(-r * 1.08, -r * 0.62, -r * 0.28, -r * 1.0, 0, -r * 1.35);
  c.closePath();
  const g = c.createRadialGradient(-r * 0.35, -r * 0.3, r * 0.1, 0, 0, r * 1.2);
  g.addColorStop(0, '#F7C98A'); g.addColorStop(0.5, '#D9893F'); g.addColorStop(1, '#8E4A1E');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (let i = -3; i <= 3; i++) { // papery skin lines
    c.beginPath(); c.moveTo(i * r * 0.07, -r * 1.3); c.quadraticCurveTo(i * r * 0.42, 0, i * r * 0.12, r);
    c.lineWidth = 3; c.strokeStyle = 'rgba(120,60,20,0.35)'; c.stroke();
  }
  c.restore();
  line(c, -r * 0.45, -r * 0.45, -r * 0.62, -r * 0.05, r * 0.08, 'rgba(255,240,210,0.5)');
  // tip
  c.beginPath(); c.moveTo(-6, -r * 1.3); c.quadraticCurveTo(4, -r * 1.6, 14, -r * 1.75); c.quadraticCurveTo(6, -r * 1.5, 6, -r * 1.3);
  c.fillStyle = '#A8672C'; c.fill();
  if ((o.faceK || 0) > 0) onionFace(c, 0, r * 0.1, r, o.face || 'smug', o.faceK, t, o.look || 0);
  if (o.crown > 0) onionCrown(c, 0, -r * 1.25, r, o.crown, t);
  c.restore();
}

// the onion's face: 'smug' (half-lidded eyes, smirk), 'wink', 'evil' (grin), 'proud'
function onionFace(c, x, y, r, kind, k, t, look = 0) {
  c.save(); c.translate(x, y); c.globalAlpha = clamp(k);
  const es = r * 0.14;
  for (const s of [-1, 1]) {
    const ex = s * r * 0.36, ey = -r * 0.12;
    if (kind === 'wink' && s === 1) {
      c.beginPath(); c.moveTo(ex - es, ey); c.quadraticCurveTo(ex, ey - es * 0.9, ex + es, ey);
      c.lineWidth = 5; c.strokeStyle = '#2A1408'; c.lineCap = 'round'; c.stroke();
    } else {
      ellipse(c, ex, ey, es, es * 1.1, '#FFFFFF');
      circle(c, ex + look * es * 0.4, ey + es * 0.15, es * 0.58, '#1A0E08');
      circle(c, ex + look * es * 0.4 - es * 0.2, ey - es * 0.1, es * 0.18, '#FFFFFF');
      if (kind === 'smug' || kind === 'proud') { // heavy upper lid
        c.save(); c.beginPath(); c.ellipse(ex, ey, es + 1, es * 1.1 + 1, 0, 0, 7); c.clip();
        c.fillStyle = '#C07435'; c.fillRect(ex - es - 2, ey - es * 1.2, es * 2 + 4, es * (kind === 'proud' ? 0.9 : 1.15));
        c.restore();
        line(c, ex - es, ey - es * 0.05 - (kind === 'proud' ? es * 0.25 : 0), ex + es, ey - es * 0.05 - (kind === 'proud' ? es * 0.25 : 0), 4, '#2A1408');
      }
    }
    // brows
    const tilt = kind === 'evil' ? 0.9 : kind === 'smug' ? 0.35 : 0;   // + = inner end down (scheming)
    line(c, ex - es * s * 0.9, ey - es * 1.7 + tilt * 10, ex + es * s * 0.9, ey - es * 1.7 - tilt * 10, 6, '#5A2E12');
  }
  // mouth
  c.beginPath();
  if (kind === 'evil') {
    c.moveTo(-r * 0.34, r * 0.2); c.quadraticCurveTo(0, r * 0.62, r * 0.34, r * 0.2); c.closePath();
    c.fillStyle = '#3A0E0A'; c.fill();
    c.save(); c.clip(); c.fillStyle = '#FFFFFF'; c.fillRect(-r * 0.34, r * 0.18, r * 0.68, r * 0.1); c.restore();
  } else {
    c.moveTo(-r * 0.2, r * 0.26); c.quadraticCurveTo(r * 0.08, r * 0.4, r * 0.3, r * 0.14);
    c.lineWidth = 5; c.strokeStyle = '#2A1408'; c.lineCap = 'round'; c.stroke();
  }
  ellipse(c, -r * 0.55, r * 0.14, r * 0.1, r * 0.06, 'rgba(255,110,90,0.35)');
  ellipse(c, r * 0.55, r * 0.14, r * 0.1, r * 0.06, 'rgba(255,110,90,0.35)');
  c.restore();
}

function onionCrown(c, x, y, r, k, t) {
  const s = E.outBack(clamp(k), 2.2);
  c.save(); c.translate(x, y - (1 - clamp(k)) * 200); c.rotate(-0.12); c.scale(s, s);
  c.beginPath();
  const w = r * 0.8, h = r * 0.55;
  c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h); c.lineTo(-w / 4, -h * 0.45); c.lineTo(0, -h * 1.15); c.lineTo(w / 4, -h * 0.45); c.lineTo(w / 2, -h); c.lineTo(w / 2, 0); c.closePath();
  c.fillStyle = '#FFD447'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#9A6A00'; c.stroke();
  circle(c, 0, -h * 0.35, r * 0.07, '#FF4D6D'); circle(c, -w * 0.3, -h * 0.25, r * 0.05, '#4DC3FF'); circle(c, w * 0.3, -h * 0.25, r * 0.05, '#4DFFB4');
  c.restore();
  softDot(gctx, x, y - r * 0.3, r * 1.2, '#FFD447', 0.5 * clamp(k));
}

// the onion cut in half, flat side to camera: white rings. k = how far the halves have fallen apart (0..1)
function onionHalves(c, x, y, r, k, t) {
  for (const s of [-1, 1]) {
    const dx = s * (6 + 40 * E.outCubic(k)), rot = s * 0.25 * E.outCubic(k);
    c.save(); c.translate(x + dx, y); c.rotate(rot);
    c.beginPath();
    if (s < 0) { c.moveTo(0, -r * 1.3); c.bezierCurveTo(-r * 0.3, -r, -r * 1.05, -r * 0.6, -r, r * 0.1); c.bezierCurveTo(-r * 0.95, r * 0.8, -r * 0.4, r * 0.98, 0, r * 0.98); }
    else { c.moveTo(0, -r * 1.3); c.bezierCurveTo(r * 0.3, -r, r * 1.05, -r * 0.6, r, r * 0.1); c.bezierCurveTo(r * 0.95, r * 0.8, r * 0.4, r * 0.98, 0, r * 0.98); }
    c.closePath();
    c.fillStyle = '#C87A36'; c.fill();
    c.save(); c.clip();
    for (let i = 5; i >= 1; i--) { // the rings (a half-ellipse per layer)
      c.beginPath(); c.ellipse(0, r * 0.05, r * 0.2 * i * 0.95, r * 0.23 * i * 0.95, 0, 0, 7);
      c.fillStyle = i % 2 ? '#F8F1DC' : '#EDE3C4'; c.fill();
      c.lineWidth = 3; c.strokeStyle = 'rgba(190,170,110,0.7)'; c.stroke();
    }
    c.restore();
    c.restore();
  }
}

// a pile of onion slices (little white arcs) on the board
function onionSlices(c, x, y, n, t, seed = 3) {
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const px = x + (rng() - 0.5) * 160, py = y + (rng() - 0.5) * 20, a = rng() * 3, r = 18 + rng() * 16;
    c.beginPath(); c.arc(px, py, r, a, a + 2.4); c.lineWidth = 9; c.strokeStyle = '#F4EBCF'; c.lineCap = 'round'; c.stroke();
    c.beginPath(); c.arc(px, py, r, a, a + 2.4); c.lineWidth = 3; c.strokeStyle = '#CBBF96'; c.stroke();
  }
}

// ---------------------------------------------------------------- the knife
// knife with its handle at (hx, hy), blade pointing along angle a. kind: 'sharp' (gleam) or 'blunt' (rounded, dull)
function knife(c, hx, hy, a, s = 1, kind = 'chef', gleam = 0) {
  c.save(); c.translate(hx, hy); c.rotate(a); c.scale(s, s);
  rrect(c, -20, -13, 118, 26, 11); c.fillStyle = '#3A2418'; c.fill();
  for (const x of [8, 42, 76]) circle(c, x, 0, 4, '#C9B8A0');
  rrect(c, 96, -15, 14, 30, 4); c.fillStyle = '#9AA3B2'; c.fill();
  c.beginPath();
  if (kind === 'blunt') {
    c.moveTo(108, -14); c.lineTo(300, -14); c.quadraticCurveTo(330, -12, 330, 14); c.lineTo(108, 30); c.closePath();
    c.fillStyle = '#8F96A3'; c.fill();
    c.lineWidth = 3; c.strokeStyle = '#5E6470'; c.stroke();
    for (let i = 0; i < 6; i++) circle(c, 140 + i * 30, 24 - i * 1.4, 3, 'rgba(90,60,40,0.6)'); // nicks + rust
  } else {
    c.moveTo(108, -14); c.lineTo(310, -10); c.quadraticCurveTo(360, -4, 372, 4); c.quadraticCurveTo(250, 40, 108, 44); c.closePath();
    const g = c.createLinearGradient(0, -14, 0, 44);
    g.addColorStop(0, '#E9EEF6'); g.addColorStop(0.6, '#AEB7C6'); g.addColorStop(1, '#F6FAFF');
    c.fillStyle = g; c.fill();
    c.beginPath(); c.moveTo(118, 38); c.quadraticCurveTo(250, 34, 368, 6); c.lineWidth = 3; c.strokeStyle = '#FFFFFF'; c.stroke();
  }
  c.restore();
  if (gleam > 0) { // a travelling glint + star
    const u = (gleam % 1);
    const gx = hx + Math.cos(a) * s * (140 + 220 * u), gy = hy + Math.sin(a) * s * (140 + 220 * u);
    softDot(gctx, gx, gy, 60 * s, '#FFFFFF', 0.9);
    for (const [cc, w] of [[ctx, 4], [gctx, 8]]) {
      line(cc, gx - 34 * s, gy, gx + 34 * s, gy, w, 'rgba(255,255,255,0.95)');
      line(cc, gx, gy - 34 * s, gx, gy + 34 * s, w, 'rgba(255,255,255,0.95)');
    }
  }
}

// ---------------------------------------------------------------- tears and gas
// cartoon tear streams arcing out of both eyes (world coords of the eyes). k = strength 0..1
function tearFountains(eyes, t, k, spread = 1, seed = 5) {
  if (k <= 0.01) return;
  for (const [ex, ey, side] of eyes) {
    const vx = side * 330 * k * spread, vy = 300 * k, g = 1500, T1 = 0.55;
    const P = (u) => [ex + side * 6 + vx * u, ey + 4 - vy * u + 0.5 * g * u * u];
    const wob = 1 + 0.08 * Math.sin(t * 23 + side);
    // the stream: a tapering arc
    for (const [cc, w, col] of [[gctx, 30, 'rgba(120,210,255,0.28)'], [ctx, 22 * wob, 'rgba(150,225,255,0.75)'], [ctx, 7, 'rgba(255,255,255,0.8)']]) {
      cc.beginPath();
      for (let i = 0; i <= 20; i++) { const [x, y] = P(T1 * i / 20); if (i) cc.lineTo(x, y); else cc.moveTo(x, y); }
      cc.lineWidth = w; cc.lineCap = 'round'; cc.strokeStyle = col; cc.stroke();
    }
    // drops breaking off the end
    for (let i = 0; i < 7; i++) {
      const ph = (t * 2.2 + i / 7 + hash(i + seed)) % 1, u = T1 + ph * 0.35;
      const [x, y] = P(u), r = 9 * (1 - ph * 0.5);
      circle(ctx, x + side * 10 * (hash(i) - 0.5), y, r, rgba('#AEE8FF', 0.9 * (1 - ph)));
    }
  }
}

// tears running down the cheeks (world coords, eyes at [x, y, side]); k 0..1 = how wet
function tearStreaks(eyes, t, k, s = 1) {
  if (k <= 0.01) return;
  for (const [ex, ey] of eyes) {
    const len = 90 * s * clamp(k * 1.3);
    c2line(ex, ey + 8 * s, ex + 4 * s, ey + 8 * s + len, 9 * s, rgba('#AEE8FF', 0.75 * clamp(k * 2)));
    for (let i = 0; i < 3; i++) { // drops sliding down
      const ph = (t * 0.9 + i / 3 + ex * 0.001) % 1;
      if (k < 0.3) continue;
      const y = ey + 8 * s + ph * (len + 60 * s);
      circle(ctx, ex + 4 * s, y, 8 * s, rgba('#AEE8FF', 0.9 * (1 - ph)));
      circle(ctx, ex + 2 * s, y - 3 * s, 3 * s, rgba('#FFFFFF', 0.9 * (1 - ph)));
    }
    ellipse(ctx, ex, ey + 4 * s, 22 * s, 8 * s, rgba('#BFEFFF', 0.45 * clamp(k))); // welling on the lower lid
  }
}
function c2line(x1, y1, x2, y2, w, col) { line(ctx, x1, y1, x2, y2, w, col); }

// green tear-gas wisps rising from (x, y) toward (tx, ty). k = density
function gasWisps(x, y, tx, ty, t, k, n = 14, seed = 9, col = '#8CFF9E') {
  if (k <= 0.01) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const sp = 0.25 + rng() * 0.35, ph = (t * sp + rng()) % 1, sw = rng() * 6;
    const px = lerp(x + (rng() - 0.5) * 120, tx + (rng() - 0.5) * 90, E.inOutSine(ph)) + Math.sin(t * 2 + sw) * 30 * (1 - ph);
    const py = lerp(y, ty, ph);
    const r = 16 + 30 * ph + rng() * 12, a = k * Math.sin(Math.PI * ph) * 0.55;
    softDot(ctx, px, py, r, col, a * 0.45);
    softDot(gctx, px, py, r * 1.2, col, a * 0.18);
  }
}

// ---------------------------------------------------------------- the hero at the counter
const POSE_CHOP = { hipY: -222, lean: 0, armL: { a: 0.55, b: -1.75 }, armR: { a: 0.9, b: -1.9 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
const PAL_CHEF = Object.assign({}, PAL, { coat: '#F4F6FA', coatSh: '#C4CAD6', coatHi: '#FFFFFF', coatDk: '#9CA3B3', strap: '#E0463A', strapSh: '#A8302A' });

// chef's hat drawn on the head (lctx, local head coords are applied by the caller via r.head)
function chefHat(c, r, st, k = 1) {
  if (k <= 0) return;
  const [hx, hy] = r.head;
  c.save(); c.translate(st.x, st.y); c.scale(st.s, st.s);
  c.translate(hx + (st.headDX || 0), hy + (st.headDY || 0)); c.rotate(r.lean + (st.headRot || 0));
  c.translate(0, -(1 - k) * 60 - 18);
  rrect(c, -56, -86, 112, 36, 8); c.fillStyle = '#E9EDF4'; c.fill();
  for (const [x, y, rr] of [[-40, -120, 38], [0, -140, 46], [40, -120, 38], [-18, -104, 34], [20, -104, 34]]) circle(c, x, y, rr, '#FFFFFF');
  line(c, -52, -60, 52, -60, 4, '#C9CFDA');
  c.restore();
}

// eye positions of the hero in world coords (for tears), from his rig r and state st
function heroEyes(st, r) {
  return [-1, 1].map((s) => {
    const cs = Math.cos(r.lean + (st.headRot || 0)), sn = Math.sin(r.lean + (st.headRot || 0));
    const lx = s * 24, ly = -2;
    const p = [r.head[0] + (st.headDX || 0) + lx * cs - ly * sn, r.head[1] + (st.headDY || 0) + lx * sn + ly * cs];
    const w = toWorld(st, p);
    return [w[0], w[1], s];
  });
}

// the hero chopping behind the counter. o: {chop 0..1 (knife height), face, pal, hat, wet, fountain, st, board, onion: 'whole'|'halves'|'slices', onionFace, gas}
function heroChopping(cam, t, o = {}) {
  const pose = JSON.parse(JSON.stringify(POSE_CHOP));
  const ch = o.chop || 0;
  pose.armR.a += 0.22 * ch; pose.armR.b -= 0.35 * ch;
  const st = Object.assign({ x: COOK.x, y: COOK.y, s: COOK.s, pose, face: o.face || FACES.calm }, o.st || {});
  let rr = null;
  charLayer(cam, st, t, { ambient: 0.1, pal: o.pal || PAL, post: (c, r) => { rr = r; if (o.hat) chefHat(c, r, st, o.hat); } });
  applyCam(cam);
  const eyes = heroEyes(st, rr);
  tearStreaks(eyes, t, o.wet || 0, st.s);
  kitchenCounter();
  cuttingBoard();
  if (o.onion === 'halves') onionHalves(ctx, KIT.onionX, KIT.onionY, KIT.onionR, o.split || 1, t);
  else if (o.onion !== 'none') onionBulb(ctx, KIT.onionX, KIT.onionY - (o.onionHop || 0), KIT.onionR, t, { face: o.onionFace, faceK: o.onionFaceK || 0, crown: o.crown || 0, squash: o.squash || 0, rot: o.onionRot || 0 });
  if (o.slices) onionSlices(ctx, 700, 1282, o.slices, t);
  if (o.gas) gasWisps(KIT.onionX, KIT.onionY - 40, eyes[1][0] - 20, eyes[1][1] + 10, t, o.gas);
  // knife + the two fists on top of the board
  const wr = toWorld(st, rr.wrR), wl = toWorld(st, rr.wrL);
  if (o.knife !== false) knife(ctx, wr[0] + 10, wr[1] - 16, Math.PI + 0.12 - 0.35 * ch, st.s * 0.62, o.knifeKind || 'chef', o.gleam || 0);
  for (const w of [wr, wl]) { circle(ctx, w[0], w[1] - 12, 30, (o.pal || PAL).skinSh); circle(ctx, w[0] - 3, w[1] - 15, 26, (o.pal || PAL).skin); }
  if (o.fountain) tearFountains(eyes, t, o.fountain);
  return { st, r: rr, eyes };
}
