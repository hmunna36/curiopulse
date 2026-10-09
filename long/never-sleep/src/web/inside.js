// What Happens If You NEVER Sleep? (long-form): inside his head. Three pictures:
//  1. the PILE: violet "sleep pressure" balls (adenosine) heaping up in a glass dome inside his head, hour by hour;
//  2. the LOCKS: a nerve cell's surface with receptor cups; adenosine balls dock and a TIRED lamp lights up; coffee
//     beans (caffeine) dock first and the lamp gets a strip of tape over it while the pile keeps growing;
//  3. the CITY: the brain as a night map of little lights; patches go dark while he is awake (local sleep), and the
//     alarm centre (the amygdala, deep in the middle) flares red.
// Everything is drawn in screen space with an explicit camera so it can sit beside his head or fill the frame.
'use strict';

const ADEN = '#B07CFF', ADEN_DK = '#6B3FC8', BEAN = '#7A4422', BEAN_DK = '#3E2010';

// a sleepy violet ball (adenosine): a face with heavy lids
function adenBall(c, x, y, r, t, seed = 0, face = true) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, '#E2CCFF'); g.addColorStop(0.55, ADEN); g.addColorStop(1, ADEN_DK);
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = g; c.fill();
  if (face && r > 9) {
    for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.32, y - r * 0.05, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = Math.max(1.5, r * 0.09); c.strokeStyle = '#2A1060'; c.lineCap = 'round'; c.stroke(); }
    c.beginPath(); c.arc(x, y + r * 0.3, r * 0.12, 0, Math.PI * 2); c.fillStyle = '#2A1060'; c.fill();   // a little yawn
  }
}
// a coffee bean (caffeine) with sunglasses: it sits in the lock and grins
function beanBall(c, x, y, r, t, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  ellipse(c, 0, 0, r * 0.9, r * 1.15, BEAN);
  c.beginPath(); c.moveTo(0, -r * 1.0); c.bezierCurveTo(r * 0.35, -r * 0.4, -r * 0.35, r * 0.4, 0, r * 1.0); c.lineWidth = r * 0.16; c.strokeStyle = BEAN_DK; c.stroke();
  if (r > 10) {
    rrect(c, -r * 0.75, -r * 0.42, r * 0.62, r * 0.34, r * 0.12); c.fillStyle = '#10101A'; c.fill();
    rrect(c, r * 0.13, -r * 0.42, r * 0.62, r * 0.34, r * 0.12); c.fill();
    line(c, -r * 0.13, -r * 0.3, r * 0.13, -r * 0.3, r * 0.08, '#10101A');
    c.beginPath(); c.arc(0, r * 0.25, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = r * 0.1; c.strokeStyle = '#F4E0C8'; c.stroke();
  }
  c.restore();
}

// The pile: a dome of glass in screen space at (x, y) (bottom centre), width w; level 0..1 fills it with balls in a
// fixed order (seeded), so the pile grows smoothly as level rises. o.hidden 0..1 draws a curtain over the dome.
let PILE = null;
function initPile() {
  const rng = mulberry32(19), out = [];
  // pack balls row by row from the bottom: a cheap heap
  for (let row = 0; row < 18; row++) {
    const n = 14 - Math.floor(row * 0.45);
    for (let i = 0; i < n; i++) out.push({ u: (i + 0.5 + (row % 2) * 0.5) / (n + 0.5) - 0.5 + (rng() - 0.5) * 0.03, v: row + rng() * 0.3, r: 0.9 + rng() * 0.25, s: rng() });
  }
  PILE = out;
}
function adenPile(c, x, y, w, level, t, o = {}) {
  if (!PILE) initPile();
  const r = w / 30, n = Math.round(PILE.length * clamp(level));
  // dome
  c.save();
  c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, y - w * 0.55); c.bezierCurveTo(x - w / 2, y - w * 1.05, x + w / 2, y - w * 1.05, x + w / 2, y - w * 0.55); c.lineTo(x + w / 2, y); c.closePath();
  c.fillStyle = 'rgba(120,150,220,0.10)'; c.fill();
  c.save(); c.clip();
  for (let i = 0; i < n; i++) {
    const b = PILE[i], age = (level * PILE.length - i);
    const drop = age < 1 ? (1 - E.outCubic(clamp(age))) * w * 0.4 : 0;
    const bx = x + b.u * (w - 2 * r) * (1 - b.v / 26), by = y - r - b.v * r * 1.62 - drop;
    adenBall(c, bx, by, r * b.r, t, i, i % 3 === 0);
  }
  c.restore();
  c.lineWidth = 5; c.strokeStyle = 'rgba(200,220,255,0.55)'; c.stroke();
  line(c, x - w * 0.36, y - w * 0.66, x - w * 0.3, y - w * 0.82, 6, 'rgba(255,255,255,0.4)');
  c.restore();
  // the curtain (the coffee hides it)
  if ((o.hidden || 0) > 0) {
    const hk = clamp(o.hidden), top = y - w * 0.95;
    c.save(); c.beginPath(); c.rect(x - w / 2 - 20, top, w + 40, (y - top) * hk + 10); c.clip();
    for (let i = 0; i < 9; i++) {
      const xx = x - w / 2 - 20 + i * (w + 40) / 9;
      const g = c.createLinearGradient(xx, 0, xx + (w + 40) / 9, 0); g.addColorStop(0, '#5A2E14'); g.addColorStop(0.5, '#8A4A22'); g.addColorStop(1, '#5A2E14');
      c.fillStyle = g; c.fillRect(xx, top, (w + 40) / 9 + 1, y - top + 10);
    }
    c.restore();
  }
}

// The locks: a cell surface along y with n receptor cups at x0..x1; state per cup: 0 empty, 1 adenosine, 2 caffeine.
// k(i) gives each cup's docking progress 0..1 (the ball travels down into the cup).
function lockRow(c, x0, x1, y, n, t, kind, prog, r = 30) {
  // the membrane
  c.beginPath(); c.moveTo(x0 - 80, y + 10);
  for (let x = x0 - 80; x <= x1 + 80; x += 20) c.lineTo(x, y + 10 + 6 * Math.sin(x * 0.02 + t));
  c.lineTo(x1 + 80, y + 260); c.lineTo(x0 - 80, y + 260); c.closePath();
  const g = c.createLinearGradient(0, y, 0, y + 260); g.addColorStop(0, '#FF9AC0'); g.addColorStop(1, '#8A2A5A'); c.fillStyle = g; c.fill();
  for (let i = 0; i < n; i++) {
    const cx = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)), cy = y + 6 * Math.sin(cx * 0.02 + t);
    // the cup
    c.beginPath(); c.moveTo(cx - r * 1.3, cy); c.quadraticCurveTo(cx - r * 1.3, cy + r * 1.5, cx, cy + r * 1.5); c.quadraticCurveTo(cx + r * 1.3, cy + r * 1.5, cx + r * 1.3, cy);
    c.lineWidth = r * 0.5; c.strokeStyle = '#4DE0C0'; c.lineCap = 'round'; c.stroke();
    const kd = kind(i), pk = clamp(prog(i));
    if (kd && pk > 0) {
      const bx = cx, by = lerp(cy - r * 6, cy + r * 0.6, E.outCubic(pk));
      if (kd === 1) adenBall(c, bx, by, r, t, i); else beanBall(c, bx, by, r * 0.95, t, 0.2 * Math.sin(t * 2 + i));
      if (pk >= 1 && kd === 1) softDot(c, cx, cy + r * 1.6, r * 2.2, '#C8A8FF', 0.4);
    }
  }
}
// the TIRED warning lamp (a dashboard light) with an optional strip of tape over it
function tiredLamp(c, x, y, r, on, tape, t) {
  rrect(c, x - r * 1.6, y - r * 1.2, r * 3.2, r * 2.6, r * 0.4); c.fillStyle = '#14141E'; c.fill();
  const lit = on * (0.75 + 0.25 * Math.sin(t * 9));
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = mixHex('#3A1A1A', '#FF4D5E', lit); c.fill();
  if (lit > 0.05) softDot(gctx, x, y, r * 4, '#FF4D5E', 0.6 * lit);
  c.font = `900 ${Math.round(r * 0.42)}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = mixHex('#5A2A2A', '#FFFFFF', lit); c.fillText('TIRED', x, y + r * 1.0 + 4);
  if (tape > 0) {   // two strips of brown tape slap on
    for (const [a, d] of [[-0.5, 0], [0.45, 0.12]]) {
      const k = E.outBack(clamp((tape - d) * 3), 2);
      if (k <= 0) continue;
      c.save(); c.translate(x, y); c.rotate(a); c.scale(k, 1);
      rrect(c, -r * 1.5, -r * 0.32, r * 3.0, r * 0.64, 4); c.fillStyle = '#C89A5A'; c.fill();
      for (let i = -3; i <= 3; i++) line(c, i * r * 0.4, -r * 0.3, i * r * 0.4 + r * 0.1, r * 0.3, 1.5, 'rgba(120,80,30,0.4)');
      c.restore();
    }
  }
}

// The city: the brain seen from the side as a dark map of little lights (neurons). dark(x, y) -> 0..1 says how
// asleep each spot is (a patch that has gone offline); o.amyg 0..1 flares the alarm centre; region by (cx, cy, s).
let CITY = null;
function initCity() {
  const rng = mulberry32(55), pts = [];
  while (pts.length < 900) {
    const x = (rng() - 0.5) * 2, y = (rng() - 0.5) * 2;
    if ((x * x) / 1.0 + ((y + 0.05) * (y + 0.05)) / 0.55 < 1 && !(y > 0.45 && x < -0.2)) pts.push({ x, y, p: rng(), c: rng() < 0.15 ? 1 : 0 });
  }
  CITY = pts;
}
function brainCity(c, cx, cy, s, t, dark, o = {}) {
  if (!CITY) initCity();
  // the brain's silhouette (side view, front to the right)
  c.save(); c.translate(cx, cy); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 0, 1.08, 0.82, 0, 0, Math.PI * 2);
  c.fillStyle = '#120A26'; c.fill();
  c.lineWidth = 0.012; c.strokeStyle = 'rgba(200,170,255,0.5)'; c.stroke();
  // the little brain at the back and the stem
  c.beginPath(); c.ellipse(-0.62, 0.62, 0.36, 0.2, 0.2, 0, Math.PI * 2); c.fillStyle = '#160C2C'; c.fill(); c.stroke();
  c.restore();
  for (const q of CITY) {
    const x = cx + q.x * s, y = cy + q.y * s * 0.78, dk = clamp(dark(q.x, q.y, q.p));
    const tw = 0.6 + 0.4 * Math.sin(t * (2 + q.p * 5) + q.p * 40);
    const a = (1 - dk) * tw, col = q.c ? '#FFE08A' : '#9FD8FF';
    if (a > 0.04) { circle(c, x, y, s * 0.012, rgba(col, a)); circle(gctx, x, y, s * 0.02, rgba(col, 0.6 * a)); }
  }
  const am = o.amyg || 0;
  if (am > 0) {   // the alarm centre: deep, toward the front-bottom of the middle
    const ax = cx + 0.18 * s, ay = cy + 0.22 * s, pulse = 0.8 + 0.2 * Math.sin(t * 14);
    circle(c, ax, ay, s * 0.07 * (0.8 + 0.4 * am), rgba('#FF4D5E', 0.9));
    softDot(gctx, ax, ay, s * (0.2 + 0.35 * am) * pulse, '#FF4D5E', 0.8 * am);
    softDot(c, ax, ay, s * (0.2 + 0.3 * am) * pulse, '#FF4D5E', 0.35 * am);
  }
}
// a patch of the city going offline: a soft blob around (px, py) in city units, k 0..1
const patchDark = (px, py, rad, k) => (x, y) => k * clamp(1.4 - Math.hypot(x - px, (y - py) * 1.3) / rad);
