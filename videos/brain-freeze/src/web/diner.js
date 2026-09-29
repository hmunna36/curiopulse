// Brain-freeze Short: the diner at night (world coords, drawn under the current camera), the milkshake,
// the hero behind the counter, and the frost that grows on his forehead.
'use strict';

const DIN = { counter: 1330, glassX: 735, glassTop: 1010, glassBase: 1330 };
const HERO = { x: 520, y: 1700, s: 1.5 };      // behind the counter: chest up is visible
let DIN_CITY = null;

function initDiner() {
  const rng = mulberry32(31);
  DIN_CITY = [...Array(46)].map(() => ({ x: 90 + rng() * 900, y: 380 + rng() * 560, r: 10 + rng() * 34,
    col: ['#FF6FA8', '#FFC857', '#6FD6FF', '#9D8CFF', '#FF9A3C'][Math.floor(rng() * 5)], a: 0.25 + rng() * 0.4, ph: rng() * 7 }));
}

// neon text in world coords (both layers under the current camera)
function neonText(txt, x, y, size, col, a, flick = 1) {
  for (const [c, g] of [[gctx, true], [ctx, false]]) {
    c.save(); c.font = `400 ${size}px Anton`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.globalAlpha = a * flick;
    if (g) { c.fillStyle = col; c.fillText(txt, x, y); }
    else { c.lineWidth = size * 0.07; c.strokeStyle = col; c.strokeText(txt, x, y); c.fillStyle = '#FFF4FA'; c.fillText(txt, x, y); }
    c.restore();
  }
}

function dinerBg(t, o = {}) {
  const c = ctx;
  // wall
  const g = c.createLinearGradient(0, -400, 0, 2200);
  g.addColorStop(0, '#0B1E2E'); g.addColorStop(0.5, '#123247'); g.addColorStop(1, '#081420');
  c.fillStyle = g; c.fillRect(-900, -900, 2900, 3700);
  // wainscot tiles
  for (let y = 980; y < 1340; y += 60) for (let x = -900; x < 2000; x += 60) {
    c.fillStyle = ((x / 60 + y / 60) & 1) ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)';
    c.fillRect(x, y, 60, 60);
  }
  // window with the rainy city outside
  const wx = 70, wy = 330, ww = 940, wh = 640;
  c.save(); rrect(c, wx, wy, ww, wh, 26); c.clip();
  const sky = c.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#1A1440'); sky.addColorStop(1, '#3A2150');
  c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  for (const b of DIN_CITY) {
    const tw = 0.75 + 0.25 * Math.sin(t * 1.6 + b.ph);
    softDot(c, b.x, b.y, b.r * 1.6, b.col, b.a * tw);
    softDot(gctx, b.x, b.y, b.r * 1.4, b.col, 0.35 * b.a * tw);
  }
  for (let i = 0; i < 38; i++) { // rain on the glass
    const x = wx + hash(i) * ww, y = wy + ((hash(i + 4) * wh + t * (240 + 200 * hash(i + 9))) % wh);
    line(c, x, y, x - 4, y + 26, 2, 'rgba(200,220,255,0.18)');
  }
  c.restore();
  rrect(c, wx, wy, ww, wh, 26); c.lineWidth = 16; c.strokeStyle = '#9FB2C4'; c.stroke();
  line(c, wx + ww / 2, wy, wx + ww / 2, wy + wh, 12, '#8FA2B4');
  // the neon sign
  const fl = o.flicker ? (Math.sin(t * 53) > -0.2 ? 1 : 0.55) : 1;
  neonText('MILKSHAKES', 540, 225, 120, '#FF5FA2', 0.95, fl);
  // pendant lamps
  for (const lx of [250, 830]) {
    line(c, lx, -600, lx, 90, 4, '#223344');
    c.beginPath(); c.moveTo(lx - 70, 150); c.lineTo(lx - 30, 90); c.lineTo(lx + 30, 90); c.lineTo(lx + 70, 150); c.closePath();
    c.fillStyle = '#E8402F'; c.fill();
    ellipse(c, lx, 152, 72, 12, '#FFE3A8');
    softDot(gctx, lx, 170, 260, '#FFB866', 0.55);
    const cone = c.createLinearGradient(0, 150, 0, 1300);
    cone.addColorStop(0, 'rgba(255,200,120,0.16)'); cone.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = cone; c.beginPath(); c.moveTo(lx - 70, 150); c.lineTo(lx + 70, 150); c.lineTo(lx + 380, 1320); c.lineTo(lx - 380, 1320); c.closePath(); c.fill();
  }
}

// the counter in front of him (drawn after the character)
function dinerCounter() {
  const c = ctx, y = DIN.counter;
  const top = c.createLinearGradient(0, y - 24, 0, y + 30);
  top.addColorStop(0, '#E9F1F8'); top.addColorStop(0.45, '#9DB0C2'); top.addColorStop(1, '#5B6F84');
  c.fillStyle = top; c.fillRect(-900, y - 24, 2900, 54);
  line(c, -900, y - 22, 2000, y - 22, 4, 'rgba(255,255,255,0.8)');
  const f = c.createLinearGradient(0, y + 30, 0, y + 900);
  f.addColorStop(0, '#C8283A'); f.addColorStop(1, '#5A0F1C');
  c.fillStyle = f; c.fillRect(-900, y + 30, 2900, 1200);
  for (let x = -880; x < 2000; x += 90) line(c, x, y + 40, x, y + 1200, 6, 'rgba(0,0,0,0.16)');
  line(c, -900, y + 120, 2000, y + 120, 14, '#D9E2EA');
  softDot(gctx, 540, y - 20, 500, '#FFD9A0', 0.18);
}

// the milkshake: level 0..1, straw fill k (pink rising in the straw), frozen 0..1 (frost on the glass)
function milkshake(t, level, strawK, o = {}) {
  const c = ctx, x = o.x || DIN.glassX, top = DIN.glassTop, base = DIN.glassBase;
  const wt = 92, wb = 58, h = base - top;
  const gx = (y) => lerp(wt, wb, (y - top) / h);
  const shape = () => { c.beginPath(); c.moveTo(x - wt, top); c.lineTo(x + wt, top); c.lineTo(x + wb, base - 40); c.lineTo(x - wb, base - 40); c.closePath(); };
  // foot
  ellipse(c, x, base - 8, 70, 14, '#B9CCDC'); rrect(c, x - 12, base - 44, 24, 40, 8); c.fillStyle = '#D8E6F0'; c.fill();
  // straw (behind the front glass wall): mouth end -> elbow -> down into the glass
  const mouth = o.mouth || [575, 1050];
  const elbow = [x - 20, mouth[1] - 90], foot = [x - 10, base - 120];
  const straw = [mouth, elbow, foot];
  drawStraw(straw, strawK, t);
  // shake body
  const ly = lerp(base - 44, top + 40, clamp(level));
  c.save(); shape(); c.clip();
  const sg = c.createLinearGradient(x - wt, 0, x + wt, 0);
  sg.addColorStop(0, '#FF9CC4'); sg.addColorStop(0.5, '#FFC2DA'); sg.addColorStop(1, '#E86F9E');
  c.fillStyle = sg; c.fillRect(x - wt, ly, wt * 2, base - ly);
  c.beginPath(); for (let xx = x - wt; xx <= x + wt; xx += 10) c.lineTo(xx, ly + 5 * Math.sin(xx / 18 + t * 5)); c.lineTo(x + wt, ly + 20); c.lineTo(x - wt, ly + 20); c.fillStyle = '#FFD6E7'; c.fill();
  c.restore();
  // whipped cream + cherry (only while the glass is full-ish)
  const cream = clamp((level - 0.55) / 0.35);
  if (cream > 0.02) {
    for (let i = 0; i < 7; i++) {
      const a = i / 6, cx = x - 80 + a * 160, cy = top - 10 - 30 * Math.sin(a * Math.PI) * cream;
      circle(c, cx, cy, (34 + 10 * Math.sin(i * 1.7)) * cream, '#FFF8F2');
      circle(c, cx - 8, cy - 10, 12 * cream, '#FFFFFF');
    }
    circle(c, x + 18, top - 72 * cream, 24 * cream, '#D11A3A'); circle(c, x + 10, top - 80 * cream, 7 * cream, '#FF8A9A');
    line(c, x + 18, top - 92 * cream, x + 34, top - 132 * cream, 4, '#3E7A2A');
  }
  // glass walls + highlights
  shape(); c.fillStyle = 'rgba(210,235,255,0.10)'; c.fill();
  c.lineWidth = 6; c.strokeStyle = 'rgba(225,242,255,0.75)'; c.stroke();
  line(c, x - wt + 22, top + 20, x - wb + 16, base - 70, 10, 'rgba(255,255,255,0.35)');
  softDot(gctx, x, top + h * 0.4, 160, '#FF8FBF', 0.25);
  // frost on the glass
  const fr = o.frozen || 0;
  if (fr > 0) { shape(); c.fillStyle = `rgba(220,245,255,${0.35 * fr})`; c.fill(); }
  return { mouth, top, x };
}

function drawStraw(P, k, t) {
  const c = ctx;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(P[0][0], P[0][1]); c.quadraticCurveTo(P[1][0], P[1][1], P[1][0] + 4, P[1][1] + 40); c.lineTo(P[2][0], P[2][1]);
  c.lineWidth = 28; c.strokeStyle = '#F4F7FF'; c.stroke();
  c.setLineDash([22, 22]); c.lineDashOffset = -t * 60; c.lineWidth = 28; c.strokeStyle = '#FF3E6C'; c.stroke(); c.setLineDash([]);
  if (k > 0) { // shake climbing the straw
    const seg = [[P[2][0], P[2][1]], [P[1][0] + 4, P[1][1] + 40], [P[1][0] - 8, P[1][1] + 8], [lerp(P[1][0], P[0][0], 0.5), lerp(P[1][1], P[0][1], 0.35)], P[0]];
    const acc = polyLen(seg), L = acc[acc.length - 1] * clamp(k);
    const pts = [seg[0]];
    for (let s = 12; s < L; s += 12) { const q = polyAt(seg, acc, s); pts.push([q[0], q[1]]); }
    poly(c, pts, 14, 'rgba(255,170,205,0.95)');
  }
  c.restore();
}

// frost over his forehead: k 0..1 (coverage), world coords of the rig; icicles along the brow.
// Call right after drawCharacter with the same st (so it rides his head).
function frostHead(c, st, r, k, t, seed = 3) {
  if (k <= 0.01) return;
  const [hx, hy] = toWorld(st, r.head), s = st.s;
  c.save(); c.translate(hx + (st.headDX || 0) * s, hy + (st.headDY || 0) * s); c.rotate(r.lean + (st.headRot || 0)); c.scale(s, s);
  c.save(); c.beginPath(); c.ellipse(0, 0, 65, 71, 0, 0, Math.PI * 2); c.clip();
  const fy = lerp(-38, -62, 1 - k); // frost line comes down to the brows as k grows
  const fg = c.createLinearGradient(0, -80, 0, fy + 10);
  fg.addColorStop(0, `rgba(235,250,255,${0.95 * k})`); fg.addColorStop(1, `rgba(150,215,255,${0.75 * k})`);
  c.fillStyle = fg; c.beginPath(); c.moveTo(-80, -90); c.lineTo(80, -90); c.lineTo(80, fy);
  for (let x = 80; x >= -80; x -= 10) c.lineTo(x, fy - 12 + 9 * Math.sin(x * 0.3 + seed));
  c.closePath(); c.fill();
  // crystal cracks
  const rng = mulberry32(seed);
  c.lineWidth = 2.2; c.strokeStyle = `rgba(255,255,255,${0.9 * k})`;
  for (let i = 0; i < 9; i++) {
    const x0 = -55 + rng() * 110, y0 = -70 + rng() * 40, a = rng() * 6.28, L = 12 + rng() * 22;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L);
    c.lineTo(x0 + Math.cos(a + 0.8) * L * 1.4, y0 + Math.sin(a + 0.8) * L * 1.4); c.stroke();
  }
  c.restore();
  // icicles hanging off the frost line
  for (let i = 0; i < 7; i++) {
    const x = -48 + i * 16, L = (8 + 14 * hash(i + seed)) * clamp((k - 0.5) * 2);
    if (L < 1) continue;
    const y0 = fy - 4;
    c.beginPath(); c.moveTo(x - 5, y0); c.lineTo(x + 5, y0); c.lineTo(x, y0 + L); c.closePath();
    c.fillStyle = 'rgba(215,245,255,0.95)'; c.fill();
  }
  c.restore();
  // glow
  const g = toWorld(st, [r.head[0], r.head[1] - 55]);
  softDot(gctx, g[0], g[1], 80 * s, '#9FE3FF', 0.28 * k);
}

// the hero behind the counter with the shake (the diner shots). o: {pose, face, frost, level, straw, headRot, ...}
function heroAtCounter(cam, t, o) {
  const st = Object.assign({ x: HERO.x, y: HERO.y, s: HERO.s, pose: POSE_COUNTER, face: FACES.calm }, o.st || {});
  let rr = null;
  charLayer(cam, st, t, { ambient: 0.12, post: (c, r) => { rr = r; frostHead(c, st, r, o.frost || 0, t, o.seed || 3); } });
  applyCam(cam);
  // the mouth in world coords (the straw's end)
  const m = toWorld(st, [rr.head[0] + (st.headDX || 0), rr.head[1] + 40 + (st.headDY || 0)]);
  const mouth = o.strawOut ? [m[0] + 60, m[1] + 30] : [m[0] + 14, m[1]];
  milkshake(t, o.level === undefined ? 0.9 : o.level, o.straw || 0, { mouth, frozen: o.glassFrost || 0 });
  dinerCounter();
  return { st, r: rr, mouth: m };
}
// arms resting on the counter (hidden below it) — upper arms visible
const POSE_COUNTER = { hipY: -222, lean: 0, armL: { a: 0.35, b: 0.9 }, armR: { a: 0.35, b: 0.9 }, legL: { a: 0.07, b: 0 }, legR: { a: 0.07, b: 0 }, hand: 'open', feetFront: 0 };
