// Shared utilities: canvases, easing, seeded randomness, camera, drawing helpers.
'use strict';

const W = 1080, H = 1920, FPS = 30;

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// main output + emissive (glow) layer at half resolution + scratch layers
const mainC = document.getElementById('c');
const ctx = mainC.getContext('2d');
const glowC = mkCanvas(W / 2, H / 2), gctx = glowC.getContext('2d');
const bloomC = mkCanvas(W / 4, H / 4), bctx = bloomC.getContext('2d');
const layerC = mkCanvas(W, H), lctx = layerC.getContext('2d');
const tintC = mkCanvas(W, H), tctx = tintC.getContext('2d');
const tmpC = mkCanvas(W, H), tmpx = tmpC.getContext('2d');

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  outBack: (x, s = 1.9) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
// eased 0..1 ramp between times a and b
const ramp = (t, a, b, e = E.outCubic) => e(inv(a, b, t));

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
// smooth 1D value noise in [-1, 1]
function vnoise(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i + seed * 57.3) * 2 - 1, b = hash(i + 1 + seed * 57.3) * 2 - 1;
  return lerp(a, b, smooth(f));
}
function shake(t, amp, freq = 22, seed = 1) {
  return [amp * vnoise(t * freq, seed), amp * vnoise(t * freq, seed + 7)];
}

// ---------- colour ----------
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function mixHex(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return `rgb(${r},${g},${bl})`;
}

// ---------- camera: world coords are screen coords at zoom 1 ----------
function camTransform(c, cam, scale) {
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.translate(W / 2 + (cam.sx || 0), H / 2 + (cam.sy || 0));
  if (cam.rot) c.rotate(cam.rot);
  c.scale(cam.zoom, cam.zoom);
  c.translate(-cam.x, -cam.y);
}
function applyCam(cam) {
  camTransform(ctx, cam, 1);
  camTransform(gctx, cam, 0.5);
}
function screenSpace() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
}
const CAM0 = { x: W / 2, y: H / 2, zoom: 1, rot: 0 };

// ---------- drawing helpers ----------
function rrect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function line(c, x1, y1, x2, y2, w, col) {
  c.lineCap = 'round';
  c.lineWidth = w;
  c.strokeStyle = col;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function poly(c, pts, w, col, close = false) {
  if (pts.length < 2) return;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = w; c.strokeStyle = col;
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  if (close) c.closePath();
  c.stroke();
}
function ellipse(c, x, y, rx, ry, col, rot = 0) {
  c.fillStyle = col;
  c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); c.fill();
}
function circle(c, x, y, r, col) { ellipse(c, x, y, r, r, col); }
function softDot(c, x, y, r, col, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
}
// draw into both the main and the glow layer (glow gets its own colour/alpha)
function both(fn) { fn(ctx, false); fn(gctx, true); }

// jagged line between two points (for arcs / electricity)
function jagged(rng, x1, y1, x2, y2, disp, depth) {
  let pts = [[x1, y1], [x2, y2]];
  for (let d = 0; d < depth; d++) {
    const np = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
      const o = (rng() - 0.5) * disp;
      np.push([mx - (dy / L) * o, my + (dx / L) * o], pts[i]);
    }
    pts = np; disp *= 0.55;
  }
  return pts;
}

// polyline utilities
function polyLen(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return acc;
}
function polyAt(pts, acc, s) {
  const L = acc[acc.length - 1];
  s = clamp(s, 0, L);
  let i = 1;
  while (i < acc.length - 1 && acc[i] < s) i++;
  const f = (s - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]);
  return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])];
}
