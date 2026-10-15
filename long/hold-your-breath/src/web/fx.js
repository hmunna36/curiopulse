// CurioPulse shared scene helpers: comedy graphics, labels, cameras and small effects that every Short
// reuses. Loaded after kit.js and before the video's own scene files (see scene.html). A video can
// override any of these by declaring a function with the same name in a later file.
// Drawing convention: ctx = main layer, gctx = half-resolution glow layer (additive bloom), and
// "screen space" = W x H pixels (1920x1080 in a long-form video) (call screenSpace() or setTransform yourself).
'use strict';

// ---------------------------------------------------------------- cameras
// world point -> screen point for a camera {x, y, zoom, rot, sx, sy} (see applyCam in lib.js)
function toScreen(cam, x, y) {
  const c = Math.cos(cam.rot || 0), s = Math.sin(cam.rot || 0);
  const dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom;
  return [W / 2 + (cam.sx || 0) + dx * c - dy * s, H / 2 + (cam.sy || 0) + dx * s + dy * c];
}
// the same camera zoomed by k around world point P (P stays put on screen)
function scaledCam(cam, P, k) {
  return Object.assign({}, cam, { zoom: cam.zoom * k, x: (cam.x + (k - 1) * P[0]) / k, y: (cam.y + (k - 1) * P[1]) / k });
}
// keyframed camera move: keys [[t, x, y, zoom], ...] (shot-local seconds), eased in-out between keys.
// Use it to travel to each thing as the narration names it (the finger-wrinkles cutaway did this).
function camKeys(t, keys, ease = E.inOutCubic) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = ease(inv(a[0], b[0], t)); k = [t, lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)]; }
    break;
  }
  return { x: k[1], y: k[2], zoom: k[3], rot: 0 };
}
// camera inside the cutaway: keyframes [t, focusX, focusY, scale] in section-local coords -> drawSection(x, y, s)
// keys: [t, focusX, focusY, scale, screenY] — the focus point lands at (540, screenY)
function sectionCam(t, keys) {
  let k = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= b[0]) { k = b; continue; }
    if (t > a[0]) { const u = E.inOutCubic(inv(a[0], b[0], t)); k = [t, ...[1, 2, 3, 4].map((j) => lerp(a[j], b[j], u))]; }
    break;
  }
  const [, fx, fy, sc, sy] = k;
  return { x: 540 - fx * sc, y: sy - fy * sc, s: sc };
}

// ---------------------------------------------------------------- comedy + emphasis graphics

function shockLines(x, y, r, k, n = 10, col = '#FFFFFF', seed = 1) {
  if (k <= 0 || k >= 1) return;
  const rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.3;
    const r0 = r * (0.9 + 0.5 * E.outCubic(k)), r1 = r0 + (40 + rng() * 50) * (1 - k);
    for (const [c, w] of [[ctx, 7], [gctx, 14]]) {
      c.save(); c.setTransform(c === gctx ? 0.5 : 1, 0, 0, c === gctx ? 0.5 : 1, 0, 0);
      line(c, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, w, rgba(col, 0.9 * (1 - k)));
      c.restore();
    }
  }
}

function bigWord(txt, x, y, size, col, k, rot = 0, stroke = '#0B0B1A') {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,12,0.55)'; ctx.fillText(txt, 0, size * 0.06);
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = stroke; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
}

function sweatDrop(c, x, y, s, a = 1) {
  if (a <= 0.01) return;
  c.beginPath(); c.moveTo(x, y - 22 * s);
  c.bezierCurveTo(x + 14 * s, y - 2 * s, x + 12 * s, y + 14 * s, x, y + 14 * s);
  c.bezierCurveTo(x - 12 * s, y + 14 * s, x - 14 * s, y - 2 * s, x, y - 22 * s);
  c.fillStyle = `rgba(150,215,255,${0.95 * a})`; c.fill();
  c.lineWidth = 2.5 * s; c.strokeStyle = `rgba(30,70,140,${0.8 * a})`; c.stroke();
}

function darkBg(c1 = '#123A52', c2 = '#04101A') {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 760, 60, 540, 900, 1300);
  bg.addColorStop(0, c1); bg.addColorStop(1, c2);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}

function card(x, y, k, lines, verdict, col, t, rot = 0, size = 1) {
  if (k <= 0.001) return;
  const c = ctx, s = E.outBack(clamp(k), 1.8) * size;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rrect(c, -190, -240, 380, 480, 24); c.fillStyle = '#F7F4EC'; c.fill();
  c.lineWidth = 6; c.strokeStyle = col; c.stroke();
  c.font = '900 34px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#1A1C2C';
  c.fillText(lines[0], -150, -180);
  c.font = '700 22px Montserrat'; c.fillStyle = '#6A6F85';
  c.fillText(lines[1], -150, -140);
  for (let i = 0; i < 6; i++) { rrect(c, -150, -100 + i * 36, 300 - (i % 3) * 50, 12, 6); c.fillStyle = '#D6D2C6'; c.fill(); }
  // verdict stamp
  c.save(); c.translate(20, 170); c.rotate(-0.12);
  rrect(c, -130, -48, 260, 96, 16); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
  c.font = '400 60px Anton'; c.textAlign = 'center'; c.fillStyle = col; c.fillText(verdict, 0, 4);
  c.restore();
  c.restore();
}

// "Z z z" drifting up from a sleeper (world coords under the current camera)
function zzz(x, y, t, t0, a = 1, s = 1) {
  if (t < t0 || a <= 0.01) return;
  const d = t - t0;
  for (const c of [ctx, gctx]) {
    c.save();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) {
      if (d < i * 0.45) continue;
      const p = ((d - i * 0.45) * 0.42) % 1;
      const px = x + (40 + p * 120) * s + Math.sin(p * 7 + i) * 18 * s, py = y - p * 300 * s;
      const sz = (34 + p * 46 + i * 6) * s;
      const al = Math.sin(Math.PI * p) * a;
      c.font = `900 ${sz}px Montserrat`;
      c.save(); c.translate(px, py); c.rotate(-0.25 + 0.2 * Math.sin(p * 5 + i));
      if (c === ctx) {
        c.lineWidth = sz * 0.16; c.strokeStyle = `rgba(10,14,40,${0.7 * al})`; c.strokeText('Z', 0, 0);
        c.fillStyle = `rgba(200,220,255,${0.95 * al})`; c.fillText('Z', 0, 0);
      } else { c.fillStyle = `rgba(140,170,255,${0.6 * al})`; c.fillText('Z', 0, 0); }
      c.restore();
    }
    c.restore();
  }
}

let FX_MOTES = null;
// dust motes drifting through the air (screen space)
function motes(t, a = 1) {
  screenSpace();
  if (!FX_MOTES) { const rng = mulberry32(77); FX_MOTES = [...Array(70)].map(() => ({ x: rng(), y: rng(), z: 0.3 + rng() * 0.7, ph: rng() * 10 })); }
  for (const m of FX_MOTES) {
    const x = ((m.x * W + t * 14 * m.z + 20 * Math.sin(t * 0.4 + m.ph)) % (W + 40)) - 20;
    const y = ((m.y * H - t * 9 * m.z + 30 * Math.sin(t * 0.3 + m.ph * 2)) % H + H) % H;
    const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + m.ph * 3);
    softDot(ctx, x, y, 3 + 5 * m.z, '#CFE0FF', 0.22 * a * tw * m.z);
    softDot(gctx, x, y, 6 + 8 * m.z, '#AFC8FF', 0.25 * a * tw * m.z);
  }
}

// cartoon heart (screen space)
function heartIcon(x, y, s, a = 1) {
  if (a <= 0.01) return;
  const path = (c) => {
    c.beginPath();
    c.moveTo(x, y + 26 * s);
    c.bezierCurveTo(x - 44 * s, y - 2 * s, x - 30 * s, y - 38 * s, x, y - 18 * s);
    c.bezierCurveTo(x + 30 * s, y - 38 * s, x + 44 * s, y - 2 * s, x, y + 26 * s);
  };
  screenSpace();
  path(ctx);
  const g = ctx.createRadialGradient(x - 12 * s, y - 16 * s, 2, x, y, 44 * s);
  g.addColorStop(0, rgba('#FFB3C1', a)); g.addColorStop(0.5, rgba('#FF4D6D', a)); g.addColorStop(1, rgba('#B3123A', a));
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 4 * s; ctx.strokeStyle = rgba('#3A0614', 0.8 * a); ctx.stroke();
  path(gctx); gctx.fillStyle = rgba('#FF3A60', 0.7 * a); gctx.fill();
}

// pose with a little twitch noise on every joint (seconds after a jolt)
function twitch(p, t, amt, seed = 5) {
  const q = JSON.parse(JSON.stringify(p));
  let i = 0;
  for (const k of ['armL', 'armR', 'legL', 'legR']) {
    q[k].a += amt * vnoise(t * 24, seed + i++); q[k].b += amt * vnoise(t * 21, seed + i++);
  }
  return q;
}

function speech(txt, x, y, k, col = '#FFFFFF', size = 90, rot = -0.08) {
  if (k <= 0) return;
  const s = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 60, h = size * 1.3;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * 0.2, h / 2 - 6); ctx.lineTo(-w * 0.34, h / 2 + 40); ctx.lineTo(-w * 0.02, h / 2 - 6); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = '#0B0B1A'; rrect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 4);
  ctx.restore();
}

// cloud-style thought bubble, k = pop-in 0..1; tail toward (tx, ty)
function thoughtBubble(x, y, w, h, k, tx, ty) {
  if (k <= 0) return;
  screenSpace();
  const s = E.outBack(clamp(k), 1.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#F4F6FF';
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    circle(ctx, Math.cos(a) * w * 0.46, Math.sin(a) * h * 0.44, Math.min(w, h) * 0.2, '#F4F6FF');
  }
  ellipse(ctx, 0, 0, w * 0.48, h * 0.46, '#F4F6FF');
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const f = 0.25 + i * 0.25;
    circle(ctx, lerp(x, tx, f + 0.1), lerp(y + h * 0.42, ty, f + 0.1), (26 - i * 7) * s, '#F4F6FF');
  }
}

function stamp(txt, x, y, k, col = '#FF4D5E', rot = -0.18, size = 120) {
  if (k <= 0) return;
  const s = lerp(2.2, 1, E.outCubic(clamp(k)));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.globalAlpha = clamp(k * 3);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + 70, h = size * 1.35;
  rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke();
  rrect(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(txt, 0, 6);
  ctx.globalAlpha = 1; ctx.restore();
}

// thin leader line from a panel to its spot in the brain
function leader(a, b, k, col) {
  if (k <= 0) return;
  screenSpace();
  const x = lerp(a[0], b[0], clamp(k)), y = lerp(a[1], b[1], clamp(k));
  ctx.setLineDash([10, 10]); line(ctx, a[0], a[1], x, y, 3, rgba(col, 0.8)); ctx.setLineDash([]);
  if (k >= 1) { circle(ctx, b[0], b[1], 9, col); softDot(gctx, b[0], b[1], 40, col, 0.9); }
}

function bigX(x, y, s, k) {
  if (k <= 0) return;
  const sc = lerp(2.4, 1, E.outCubic(clamp(k))) * s;
  for (const [cc, w, col] of [[ctx, 60, '#FF3A4A'], [gctx, 90, 'rgba(255,58,74,0.7)']]) {
    cc.save(); cc.setTransform(cc === gctx ? 0.5 : 1, 0, 0, cc === gctx ? 0.5 : 1, 0, 0);
    cc.translate(x, y); cc.scale(sc, sc); cc.globalAlpha = clamp(k * 3);
    cc.lineCap = 'round'; cc.lineWidth = w; cc.strokeStyle = col;
    cc.beginPath(); cc.moveTo(-160, -160); cc.lineTo(160, 160); cc.moveTo(160, -160); cc.lineTo(-160, 160); cc.stroke();
    cc.restore();
  }
}

function neonWord(txt, x, y, size, col, k, t) {
  if (k <= 0) return;
  const flick = k < 1 ? (Math.sin(t * 90) > 0 ? 1 : 0.3) : 0.9 + 0.1 * Math.sin(t * 20);
  for (const [cc, sc, a] of [[gctx, 0.5, 0.9], [ctx, 1, 1]]) {
    cc.save(); cc.setTransform(sc, 0, 0, sc, 0, 0); cc.translate(x, y);
    cc.font = `400 ${size}px Anton`; cc.textAlign = 'center'; cc.textBaseline = 'middle';
    cc.globalAlpha = clamp(k) * flick * a;
    if (cc === ctx) { cc.lineWidth = size * 0.06; cc.strokeStyle = col; cc.strokeText(txt, 0, 0); cc.fillStyle = '#FFFFFF'; cc.fillText(txt, 0, 0); }
    else { cc.fillStyle = col; cc.fillText(txt, 0, 0); }
    cc.restore();
  }
}

function smoothPath(c, P) {
  c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    c.quadraticCurveTo(P[i][0], P[i][1], mx, my);
  }
  c.lineTo(P[P.length - 1][0], P[P.length - 1][1]);
}

function splashDrops(x, y, t0, t, n = 40, seed = 1, spread = 1) {
  const d = t - t0;
  if (d < 0 || d > 1.2) return;
  const rng = mulberry32(seed);
  screenSpace();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rng() - 0.5) * 2.4 * spread, v = 500 + rng() * 900;
    const px = x + Math.cos(a) * v * d, py = y + Math.sin(a) * v * d + 0.5 * 2600 * d * d;
    const r = 5 + rng() * 12, al = clamp(1 - d / 1.1);
    circle(ctx, px, py, r, rgba('#E6F8FF', 0.9 * al)); circle(ctx, px - r * 0.3, py - r * 0.3, r * 0.35, rgba('#FFFFFF', al));
    softDot(gctx, px, py, r * 3, '#BFE6FF', 0.5 * al);
  }
}

function snowflakes(t, a = 1) {
  screenSpace();
  for (let i = 0; i < 40; i++) {
    const x = (hash(i) * W + 30 * Math.sin(t + i)) % W, y = ((hash(i + 9) * H + t * (80 + 60 * hash(i + 3))) % H);
    const r = 3 + 4 * hash(i + 5);
    circle(ctx, x, y, r, rgba('#FFFFFF', 0.8 * a)); softDot(gctx, x, y, r * 4, '#BFF0FF', 0.6 * a);
  }
}


