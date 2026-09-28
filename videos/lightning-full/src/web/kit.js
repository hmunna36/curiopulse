// The eight shots. Each SC.<id>(lt, t) draws one frame (lt = time inside the shot)
// and returns post options: {flash, flashTop, blur:[dx,dy], zblur, glow, noCaptions}.
'use strict';

const SC = {};
const CH = { x: 540, y: 1180, s: 1.1 }; // hiker placement on the hill (hook / x-ray shots)
let BOLT1, BOLT2, FERN, BOKEH;

function initScenes() {
  BOLT1 = makeBolt(101, 660, -160, 540, 556, { disp: 340, depth: 7, branches: 9 });
  BOLT2 = makeBolt(207, 180, -420, 470, 900, { disp: 300, depth: 7, branches: 8 });
  FERN = makeFern(42);
  const rng = mulberry32(8);
  BOKEH = [...Array(26)].map(() => ({ x: rng() * W, y: rng() * H, r: 20 + rng() * 70, a: 0.05 + rng() * 0.1, ph: rng() * 6 }));
}

// character on its own layer so light & aura stay inside the silhouette
function charLayer(cam, st, t, o = {}) {
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.clearRect(0, 0, W, H);
  camTransform(lctx, cam, 1);
  const r = drawCharacter(lctx, st, t, PAL);
  if (o.post) o.post(lctx, r, st);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-atop';
  if (o.ambient) { lctx.fillStyle = `rgba(16,20,60,${o.ambient})`; lctx.fillRect(0, 0, W, H); }
  if (o.light > 0) {
    const g = lctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba('#E4EEFF', 0.8 * o.light)); g.addColorStop(0.6, rgba('#9DB4FF', 0.35 * o.light)); g.addColorStop(1, rgba('#7F9BFF', 0.1 * o.light));
    lctx.fillStyle = g; lctx.fillRect(0, 0, W, H);
  }
  lctx.globalCompositeOperation = 'source-over';
  if (o.aura > 0) {
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.globalCompositeOperation = 'copy'; tctx.drawImage(layerC, 0, 0);
    tctx.globalCompositeOperation = 'source-in'; tctx.fillStyle = '#3FB8FF'; tctx.fillRect(0, 0, W, H);
    tctx.globalCompositeOperation = 'source-over';
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.globalAlpha = clamp(o.aura);
    gctx.drawImage(tintC, 0, 0, W / 2, H / 2);
    gctx.globalAlpha = 1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(layerC, 0, 0);
  return r;
}

function worldPaths(st, r) { return skinPaths(r).map((P) => P.map((p) => toWorld(st, p))); }

// short crackling arcs crawling over the skin
function bodyArcs(paths, frame, n, alpha) {
  const rng = mulberry32(1000 + frame * 13);
  for (let i = 0; i < n; i++) {
    const P = paths[Math.floor(rng() * paths.length)];
    const acc = polyLen(P), L = acc[acc.length - 1];
    const s0 = rng() * L, s1 = Math.min(L, s0 + 50 + rng() * 150);
    const a = polyAt(P, acc, s0), b = polyAt(P, acc, s1);
    const pts = jagged(rng, a[0], a[1], b[0], b[1], 46, 4);
    poly(ctx, pts, 3, `rgba(235,250,255,${0.95 * alpha})`);
    poly(gctx, pts, 12, `rgba(110,200,255,${0.9 * alpha})`);
  }
}

// current streaming along the skin (flash-over)
function flowCurrent(paths, lt, o = {}) {
  const speed = o.speed || 950, dens = o.dens || 20, a0 = o.alpha === undefined ? 1 : o.alpha;
  paths.forEach((P, pi) => {
    const acc = polyLen(P), L = acc[acc.length - 1];
    const minor = pi % 3 === 2; // arm paths are fainter
    const al = a0 * (minor ? 0.55 : 1);
    // faint sheath along the whole path
    poly(gctx, P, minor ? 8 : 14, `rgba(80,170,255,${0.35 * al})`);
    poly(ctx, P, 2.5, `rgba(160,230,255,${0.35 * al})`);
    const n = Math.max(3, Math.floor(L / dens));
    for (let i = 0; i < n; i++) {
      const s = ((lt * speed * (0.85 + 0.3 * hash(i + pi * 17)) + (i / n) * L) % L);
      const k = s / L;
      const fade = Math.min(1, k * 8, (1 - k) * 6) * al;
      if (fade <= 0.02) continue;
      const tail = 46 + 30 * hash(i * 3 + pi);
      const pts = [];
      for (let q = 0; q <= 4; q++) { const p = polyAt(P, acc, s - (tail * q) / 4); pts.push([p[0], p[1]]); }
      poly(ctx, pts, 4.2, `rgba(245,252,255,${fade})`);
      poly(gctx, pts, 16, `rgba(90,200,255,${0.95 * fade})`);
    }
  });
}

function pill(x, y, text, col, k, size = 44) {
  if (k <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(x, y);
  const s = E.outBack(clamp(k), 2);
  ctx.scale(s, s);
  ctx.font = `900 ${size}px Montserrat`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.6;
  rrect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(8,12,34,0.88)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(text, 0, 2);
  ctx.restore();
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  gctx.translate(x, y); gctx.scale(s, s);
  const w2 = text.length * size * 0.72 + size * 1.1;
  rrect(gctx, -w2 / 2, -size * 0.8, w2, size * 1.6, size * 0.8);
  gctx.lineWidth = 10; gctx.strokeStyle = rgba(col.length === 7 ? col : '#7FE9FF', 0.6); gctx.stroke();
  gctx.restore();
}

function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

// ================= S1: HOOK — the strike =================
function hookLight(t) {
  const c = TLd.cues;
  let I;
  if (t < c.strike) I = 0.75 + 0.3 * Math.abs(vnoise(t * 40, 2));
  else {
    I = 1.9 * Math.exp(-(t - c.strike) * 7);
    for (const rs of c.restrike) if (t >= rs) I = Math.max(I, 1.35 * Math.exp(-(t - rs) * 9));
    I += 0.3 * clamp(1 - (t - c.strike) / 0.95);
  }
  return I;
}

SC.hook = (lt, t) => {
  const c = TLd.cues, strike = c.strike;
  const I = hookLight(t);
  const p = t < strike ? lerp(0.64, 1, Math.pow(Math.floor(t * FPS / 2) * 2 / FPS / strike, 1.1)) : 1;
  let flash = 0;
  if (t >= strike) {
    flash = 0.85 * Math.exp(-(t - strike) * 22);
    for (const rs of c.restrike) if (t >= rs) flash = Math.max(flash, 0.3 * Math.exp(-(t - rs) * 20));
  }
  const sky = clamp(I * 0.55);
  const push = ramp(lt, 0, 1.13, E.outCubic);
  const [shx, shy] = t >= strike ? shake(t, 34 * Math.exp(-(t - strike) * 4) + 3, 24, 3) : shake(t, 3, 10, 3);
  const exitK = E.inCubic(inv(1.0, 1.133, lt));
  const cam = { x: 540, y: lerp(955, 972, push) - exitK * 900, zoom: lerp(1.2, 1.3, push), rot: 0.012 * Math.sin(lt * 2), sx: shx, sy: shy };
  drawStorm(cam, { flash: sky, t });
  drawRain(t, 1, 0);
  const blast = t >= strike ? Math.exp(-(t - strike) * 5) : 0;
  drawHill(cam, { flash: sky, crestY: 1180, t, blast });
  applyCam(cam);
  drawBolt(BOLT1, p, I, t);
  if (t >= strike) {
    const k = (t - strike) / 0.6;
    if (k < 1) { const R = 40 + 700 * E.outCubic(k); ring(540, 1184, R, R * 0.13, 7 * (1 - k), '#BFE6FF', 0.85 * (1 - k)); }
    softDot(gctx, 540, 1180, 260, '#9FD4FF', 0.7 * Math.exp(-(t - strike) * 6));
  }
  const zapK = inv(strike, strike + 0.07, t);
  const pose = t < strike ? lerpPose(POSES.stand, POSES.flinch, E.outCubic(inv(0.02, strike, t)))
    : lerpPose(POSES.flinch, POSES.zap, clamp(E.outBack(zapK, 1.3), 0, 1.08));
  const face = t < strike ? FACES.worried : lerpFace(FACES.worried, FACES.shock, clamp(zapK * 1.5));
  const jit = t >= strike ? shake(t, 7 * clamp(I), 45, 9) : [0, 0];
  const st = { x: CH.x + jit[0], y: CH.y + jit[1], s: CH.s, pose, face, frizz: t >= strike ? E.outBack(zapK) : 0,
    soot: 0.4 * ramp(t, 0.3, 1.0), seed: 3 };
  const r = charLayer(cam, st, t, { light: clamp(I * 0.2, 0, 0.3), aura: t >= strike ? clamp(I * 0.28, 0, 0.3) : 0.08, ambient: 0.1 });
  applyCam(cam);
  if (t >= strike) bodyArcs(worldPaths(st, r), Math.round(t * FPS), Math.round(3 + 6 * clamp(I)), 1);
  sparks(11, 540, 575, strike, t, 50, { speed: 1150, life: 0.75, spread: Math.PI * 0.95 });
  sparks(12, 540, 1180, strike + 0.02, t, 34, { speed: 850, life: 0.5, dir: -Math.PI / 2, spread: 1.3 });
  if (t > 0.45) smoke(31, 548, 590, 0.45, t, { rate: 18, rise: 280, alpha: 0.32, size: 26 });
  drawRain(t, 1, 1);
  return { flash, blur: exitK > 0 ? [0, exitK * 170] : null };
};

// ================= S2: 30,000 AMPS =================
SC.amps = (lt, t) => {
  const c = TLd.cues, slam = c.slam;
  const enterK = 1 - E.outCubic(inv(0, 0.17, lt));
  const exitK = E.inExpo(inv(1.13, 1.267, lt));
  const [shx, shy] = t > slam ? shake(t, 24 * Math.exp(-(t - slam) * 6), 26, 5) : [0, 0];
  const cam = { x: 540, y: 960 + enterK * 900, zoom: lerp(1, 1.07, ramp(lt, 0, 1.27, E.inOutSine)) * (1 + exitK * 1.4),
    rot: -0.012 + 0.024 * ramp(lt, 0, 1.27), sx: shx, sy: shy };
  screenSpace();
  const g = ctx.createRadialGradient(540, 860, 40, 540, 960, 1250);
  g.addColorStop(0, '#1A2766'); g.addColorStop(0.55, '#0A1033'); g.addColorStop(1, '#03040E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  ctx.strokeStyle = 'rgba(120,160,255,0.08)'; ctx.lineWidth = 2;
  for (let x = -420; x <= 1500; x += 90) { ctx.beginPath(); ctx.moveTo(x, -500); ctx.lineTo(x, 2500); ctx.stroke(); }
  for (let y = -500 + ((lt * 80) % 90); y <= 2500; y += 90) { ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(1600, y); ctx.stroke(); }
  // crackling plasma columns at both edges
  const fr = Math.floor(t * FPS / 2);
  for (const [i, x] of [[0, 70], [1, 1010]]) {
    const b = makeBolt(500 + fr * 7 + i, x, -300, x + (i ? -30 : 30), 2300, { disp: 150, depth: 7, branches: 3 });
    drawBolt(b, 1, 0.5 + 0.4 * Math.abs(vnoise(t * 22 + i * 5, 1)), t, { width: 0.8 });
  }
  // gauge
  const v = 30000 * E.outCubic(inv(c.count_start + 0.02, slam, t));
  const frac = v / 30000;
  const gx = 540, gy = 1010, R = 360;
  const A0 = Math.PI, A1 = Math.PI * 2;
  ctx.lineCap = 'round';
  ctx.lineWidth = 38; ctx.strokeStyle = 'rgba(90,110,200,0.22)';
  ctx.beginPath(); ctx.arc(gx, gy, R, A0, A1); ctx.stroke();
  ctx.lineWidth = 38; ctx.strokeStyle = 'rgba(255,70,90,0.28)';
  ctx.beginPath(); ctx.arc(gx, gy, R, A0 + Math.PI * 0.8, A1); ctx.stroke();
  if (frac > 0.002) {
    const gr = ctx.createLinearGradient(gx - R, 0, gx + R, 0);
    gr.addColorStop(0, '#5CE1FF'); gr.addColorStop(0.55, '#FFD447'); gr.addColorStop(1, '#FF3B5C');
    ctx.lineWidth = 30; ctx.strokeStyle = gr;
    ctx.beginPath(); ctx.arc(gx, gy, R, A0, A0 + frac * Math.PI); ctx.stroke();
    gctx.lineCap = 'round'; gctx.lineWidth = 60; gctx.strokeStyle = frac > 0.8 ? 'rgba(255,90,110,0.8)' : 'rgba(120,220,255,0.7)';
    gctx.beginPath(); gctx.arc(gx, gy, R, A0, A0 + frac * Math.PI); gctx.stroke();
  }
  for (let i = 0; i <= 30; i++) {
    const a = A0 + (i / 30) * Math.PI, big = i % 5 === 0;
    const r1 = R - 40, r2 = R - (big ? 82 : 60);
    line(ctx, gx + Math.cos(a) * r1, gy + Math.sin(a) * r1, gx + Math.cos(a) * r2, gy + Math.sin(a) * r2, big ? 6 : 3, big ? 'rgba(220,230,255,0.9)' : 'rgba(170,185,240,0.55)');
    if (i % 10 === 0) {
      ctx.font = '800 34px Montserrat'; ctx.fillStyle = 'rgba(210,220,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i === 0 ? '0' : `${i}K`, gx + Math.cos(a) * (R - 122), gy + Math.sin(a) * (R - 122));
    }
  }
  // comparison: a home outlet barely moves the needle
  const outK = ramp(t, c.count_start + 0.25, c.count_start + 0.45, E.outBack);
  if (outK > 0) {
    const a = A0 + (15 / 30000) * Math.PI * 40;
    circle(ctx, gx + Math.cos(a) * R, gy + Math.sin(a) * R, 11 * outK, '#FFFFFF');
    ctx.globalAlpha = clamp(outK);
    ctx.font = '800 30px Montserrat'; ctx.textAlign = 'left'; ctx.fillStyle = '#BFD0FF';
    ctx.fillText('HOME OUTLET ≈ 15 A', gx - R - 10, gy + 50);
    ctx.globalAlpha = 1;
  }
  const over = t > slam ? 0.06 * Math.sin((t - slam) * 46) * Math.exp(-(t - slam) * 6) : 0;
  const na = A0 + clamp(frac + over, 0, 1.06) * Math.PI;
  const tipX = gx + Math.cos(na) * (R - 26), tipY = gy + Math.sin(na) * (R - 26);
  for (const [cc, w, col] of [[gctx, 3, 'rgba(255,120,120,0.9)'], [ctx, 1, '#FFFFFF']]) {
    cc.fillStyle = col;
    cc.beginPath();
    cc.moveTo(gx + Math.cos(na + Math.PI / 2) * 14 * w, gy + Math.sin(na + Math.PI / 2) * 14 * w);
    cc.lineTo(tipX, tipY);
    cc.lineTo(gx + Math.cos(na - Math.PI / 2) * 14 * w, gy + Math.sin(na - Math.PI / 2) * 14 * w);
    cc.closePath(); cc.fill();
  }
  circle(ctx, gx, gy, 30, '#20284F'); circle(ctx, gx, gy, 18, '#FFFFFF');
  if (t > slam) {
    sparks(61, tipX, tipY, slam, t, 44, { speed: 900, life: 0.6, dir: -0.3, spread: 1.6, cols: ['#FFFFFF', '#FFE27A', '#FF8A8A'] });
    softDot(gctx, tipX, tipY, 180, '#FF6A7A', 0.9 * Math.exp(-(t - slam) * 5));
  }
  // the counter
  const punch = t > slam ? 1 + 0.14 * Math.exp(-(t - slam) * 9) : 1 + 0.02 * Math.sin(t * 60) * (frac < 1 ? 1 : 0);
  ctx.save(); ctx.translate(540, 560); ctx.scale(punch, punch);
  ctx.font = '400 260px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const txt = fmt(Math.floor(v / 10) * 10);
  ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#070A1E'; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 0);
  ctx.restore();
  gctx.save(); gctx.translate(540, 560); gctx.scale(punch, punch);
  gctx.font = '400 260px Anton'; gctx.textAlign = 'center'; gctx.fillStyle = 'rgba(90,190,255,0.75)'; gctx.fillText(txt, 0, 0);
  gctx.restore();
  // "AMPS"
  const ak = ramp(t, slam - 0.02, slam + 0.14, (x) => E.outBack(x, 2.4));
  if (ak > 0) {
    ctx.save(); ctx.translate(540, 1178); ctx.scale(ak, ak);
    ctx.font = '900 118px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = '#0B0B1A'; ctx.strokeText('AMPS', 0, 0);
    ctx.fillStyle = '#FFD447'; ctx.fillText('AMPS', 0, 0);
    ctx.restore();
    gctx.save(); gctx.translate(540, 1178); gctx.scale(ak, ak); gctx.font = '900 118px Montserrat'; gctx.textAlign = 'center';
    gctx.textBaseline = 'middle'; gctx.fillStyle = 'rgba(255,200,60,0.55)'; gctx.fillText('AMPS', 0, 0); gctx.restore();
  }
  const flash = exitK * 0.55 + (t > slam ? 0.28 * Math.exp(-(t - slam) * 14) : 0);
  return { flash, blur: enterK > 0.02 ? [0, enterK * 160] : null, zblur: exitK * 0.4, zcx: 540, zcy: 600 };
};

// ================= S3: hotter than the Sun's surface =================
function sunIcon(x, y, r, t) {
  for (const [cc, m] of [[gctx, 1.25], [ctx, 1]]) {
    cc.fillStyle = cc === gctx ? 'rgba(255,140,40,0.8)' : '#FF9A3C';
    cc.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + t * 0.8;
      const rr = (i % 2 ? r * 1.18 : r * 1.42) * m;
      cc.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    cc.closePath(); cc.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
  g.addColorStop(0, '#FFF6C0'); g.addColorStop(0.5, '#FFC247'); g.addColorStop(1, '#FF6A1F');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function boltIcon(x, y, s, col, cc) {
  cc.fillStyle = col;
  cc.beginPath();
  const P = [[8, -52], [-26, 6], [-2, 6], [-12, 52], [26, -8], [2, -8], [14, -52]];
  P.forEach(([px, py], i) => (i ? cc.lineTo(x + px * s, y + py * s) : cc.moveTo(x + px * s, y + py * s)));
  cc.closePath(); cc.fill();
}
function thermo(x, level, fillA, fillB, glowCol, t) {
  const top = 380, bot = 1010, bw = 88, cw = 48, by = 1072, br = 76;
  // glass
  rrect(ctx, x - bw / 2, top - 30, bw, bot - top + 60, bw / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(210,225,255,0.35)'; ctx.stroke();
  for (let i = 0; i <= 10; i++) {
    const y = bot - (i / 10) * (bot - top);
    line(ctx, x + bw / 2 + 8, y, x + bw / 2 + (i % 5 ? 22 : 36), y, 3, 'rgba(200,215,255,0.45)');
  }
  const ly = bot - level * (bot - top);
  const g = ctx.createLinearGradient(0, bot, 0, top);
  g.addColorStop(0, fillA); g.addColorStop(1, fillB);
  rrect(ctx, x - cw / 2, ly, cw, bot - ly + 40, cw / 2); ctx.fillStyle = g; ctx.fill();
  rrect(gctx, x - cw / 2, ly, cw, bot - ly + 40, cw / 2); gctx.fillStyle = glowCol; gctx.fill();
  softDot(gctx, x, ly, 70, '#FFFFFF', 0.5);
  circle(ctx, x, by, br + 8, 'rgba(210,225,255,0.3)');
  circle(ctx, x, by, br, fillA);
  return ly;
}
SC.heat = (lt, t) => {
  const c = TLd.cues;
  const enterK = 1 - E.outCubic(inv(0, 0.2, lt));
  const exitK = E.inCubic(inv(1.40, 1.533, lt));
  const cam = { x: 540 + exitK * 1100, y: 960, zoom: (1 + enterK * 0.4) * lerp(1, 1.05, ramp(lt, 0, 1.53, E.inOutSine)), rot: 0 };
  screenSpace();
  ctx.fillStyle = '#070A1E'; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  softDot(ctx, 300, 820, 700, '#FF6A2A', 0.26);
  softDot(ctx, 780, 820, 700, '#3F8CFF', 0.3);
  const sunL = 0.183 * E.outCubic(inv(c.sun_rise, c.sun_rise + 0.5, t));
  const boltBase = 0.923 * E.outExpo(inv(c.bolt_rise, c.stamp - 0.03, t));
  const boltL = boltBase + (t > c.stamp ? 0.006 * vnoise(t * 30, 3) : 0);
  const sx = 345, bx = 725;
  const sly = thermo(sx, sunL, '#FF5A1F', '#FFC247', 'rgba(255,130,40,0.9)', t);
  const bly = thermo(bx, boltL, '#3F8CFF', '#E6FAFF', 'rgba(120,210,255,1)', t);
  sunIcon(sx, 1072, 46, t);
  boltIcon(bx, 1072, 0.95, '#FFFFFF', ctx);
  boltIcon(bx, 1072, 1.1, 'rgba(140,220,255,0.9)', gctx);
  // top-of-tube burst when the lightning column arrives
  if (t > c.stamp - 0.05) {
    sparks(71, bx, bly, c.stamp - 0.05, t, 40, { speed: 900, life: 0.55, dir: -Math.PI / 2, spread: 1.0 });
    softDot(gctx, bx, bly, 160, '#BFEFFF', 0.8 * Math.exp(-(t - c.stamp) * 4));
  }
  ctx.textBaseline = 'middle';
  ctx.font = '400 60px Anton';
  if (sunL > 0.004) {
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFB070';
    ctx.fillText(`${fmt(Math.round(5500 * sunL / 0.183 / 100) * 100)}°C`, sx - 64, sly);
  }
  if (boltL > 0.004) {
    ctx.textAlign = 'left'; ctx.fillStyle = '#AEEBFF';
    ctx.fillText(`${fmt(Math.round(27700 * clamp(boltBase / 0.923) / 100) * 100)}°C`, bx + 64, bly);
  }
  ctx.font = '800 34px Montserrat'; ctx.textAlign = 'center';
  ctx.fillStyle = '#FFB380'; ctx.fillText("SUN'S SURFACE", sx, 1190);
  ctx.fillStyle = '#9FE8FF'; ctx.fillText('LIGHTNING', bx, 1190);
  // 5x stamp
  const k = ramp(t, c.stamp, c.stamp + 0.18, (x) => E.outBack(x, 2.2));
  if (k > 0) {
    const s = lerp(2.2, 1, k);
    const tr = t - c.stamp;
    ring(540, 640, 110 + tr * 900, 110 + tr * 900, 8 * clamp(1 - tr * 3), '#FFD447', clamp(1 - tr * 3));
    ctx.save(); ctx.translate(540, 640); ctx.rotate(-0.12 * k); ctx.scale(s, s);
    ctx.globalAlpha = clamp(k * 1.5);
    circle(ctx, 0, 0, 96, '#FFD447');
    ctx.lineWidth = 8; ctx.strokeStyle = '#0B0B1A'; ctx.beginPath(); ctx.arc(0, 0, 96, 0, 7); ctx.stroke();
    ctx.fillStyle = '#0B0B1A'; ctx.font = '400 116px Anton'; ctx.textAlign = 'center'; ctx.fillText('5×', 4, 8);
    ctx.restore();
    softDot(gctx, 540, 640, 200, '#FFD447', 0.6 * clamp(k));
  }
  return { blur: exitK > 0 ? [exitK * 190, 0] : null, zblur: enterK * 0.3, zcx: 540, zcy: 700 };
};

// ================= S4a/S4b: flash-over, x-ray =================
function xrayWorld(cam, lt, t, o) {
  drawStorm(cam, { flash: 0.12, t: 0.8 + lt * 0.05 });
  drawRain(0, 0.7, 0, 0.8 + lt * 0.03);
  drawHill(cam, { flash: 0.12, crestY: 1180, t: 0.8 });
  applyCam(cam);
  drawBolt(BOLT1, 1, 0.45, 0.8 + lt * 0.2);
  // dim the world so the x-ray pops
  screenSpace();
  ctx.fillStyle = `rgba(2,4,16,${0.5 * o.dim})`; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  const st = { x: CH.x, y: CH.y, s: CH.s, pose: POSES.zap, face: FACES.shock, frizz: 1, soot: 0.3, seed: 3 };
  const scanY = o.scanY;
  ctx.save(); ctx.beginPath(); ctx.rect(-4000, scanY, 9000, 9000); ctx.clip();
  const r = drawCharacter(ctx, st, 0.8, PAL);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-4000, -4000, 9000, scanY + 4000); ctx.clip();
  drawCharacter(ctx, st, 0.8, XPAL);
  drawBones(ctx, st, r, t, 1, 1);
  drawHeart(ctx, gctx, st, r, o.heart, 1);
  ctx.restore();
  // scan line
  if (o.scanK > 0 && o.scanK < 1) {
    line(ctx, 200, scanY, 880, scanY, 4, 'rgba(200,245,255,0.95)');
    line(gctx, 200, scanY, 880, scanY, 26, 'rgba(90,200,255,0.9)');
  }
  return { st, r };
}
SC.flash = (lt, t) => {
  const c = TLd.cues;
  const enterK = 1 - E.outCubic(inv(0, 0.15, lt));
  const pull = E.inOutCubic(inv(0.08, 0.75, lt));
  const cam = { x: 540 - enterK * 1100, y: lerp(650, 1010, pull), zoom: lerp(2.3, 1.28, pull) * lerp(1, 1.04, inv(0.75, 1.63, lt)), rot: lerp(-0.04, 0, pull) };
  const scanK = inv(0.06, 0.42, lt);
  const scanY = lerp(520, 1260, E.inOutSine(scanK));
  const { st, r } = xrayWorld(cam, lt, t, { dim: scanK, scanY, scanK, heart: 1 + 0.08 * Math.sin(lt * 12) });
  applyCam(cam);
  const flowA = ramp(lt, 0.25, 0.45);
  if (flowA > 0) {
    const paths = worldPaths(st, r);
    flowCurrent(paths, lt, { alpha: flowA });
    bodyArcs(paths, Math.round(t * FPS), 3, 0.7 * flowA);
    // ground current spreading from the feet
    for (const k of ['L', 'R']) {
      const a = toWorld(st, r['an' + k]);
      for (let j = 0; j < 3; j++) {
        const ph = ((lt * 1.6 + j / 3) % 1);
        ring(a[0], 1196, 30 + ph * 240, (30 + ph * 240) * 0.16, 4, '#7FE9FF', 0.7 * (1 - ph) * flowA);
      }
    }
  }
  // "FLASHOVER" tag with a leader line to the skin
  const lk = ramp(t, c.label_flash, c.label_flash + 0.2);
  if (lk > 0) {
    const tgt = toWorld(st, r.U(-80, -100));
    ctx.save(); screenSpace();
    const m = new DOMMatrix().translate(W / 2, H / 2).rotate((cam.rot || 0) * 57.3).scale(cam.zoom).translate(-cam.x, -cam.y);
    const pt = m.transformPoint(new DOMPoint(tgt[0], tgt[1]));
    line(ctx, 230, 1010, lerp(230, pt.x, E.outCubic(lk)), lerp(1010, pt.y, E.outCubic(lk)), 4, 'rgba(127,233,255,0.9)');
    circle(ctx, pt.x, pt.y, 9 * lk, '#7FE9FF');
    ctx.restore();
    pill(230, 1010, 'FLASHOVER', '#7FE9FF', lk * 1.2, 40);
  }
  return { blur: enterK > 0.02 ? [enterK * 190, 0] : null };
};
SC.heart = (lt, t) => {
  const c = TLd.cues;
  const inK = E.outExpo(inv(0, 0.2, lt));
  const exitK = E.inCubic(inv(0.62, 0.733, lt));
  const cam = { x: lerp(540, 552, inK) + exitK * 500, y: lerp(990, 838, inK) + exitK * 600, zoom: lerp(1.32, 3.4, inK) * lerp(1, 1.07, inv(0.2, 0.73, lt)), rot: lerp(0, 0.03, inK) };
  let beat = 1;
  for (const b of c.beats) {
    beat += 0.26 * Math.exp(-Math.pow((t - b) / 0.05, 2)) + 0.12 * Math.exp(-Math.pow((t - b - 0.17) / 0.045, 2));
  }
  const { st, r } = xrayWorld(cam, lt + 1.6, t, { dim: 1, scanY: 3000, scanK: 1, heart: beat });
  applyCam(cam);
  const paths = worldPaths(st, r);
  flowCurrent(paths, lt + 1.6, { alpha: 1, speed: 700, dens: 14 });
  bodyArcs(paths, Math.round(t * FPS), 3, 0.6);
  // the heart glows on each beat — it is spared most of the current
  const hp = toWorld(st, r.heart);
  softDot(gctx, hp[0], hp[1], 90 * beat, '#FF4D6D', 0.55 * (beat - 0.9));
  return { zblur: (1 - inK) * 0.22, zcx: 540, zcy: 900, blur: exitK > 0 ? [exitK * 140, exitK * 160] : null };
};

// ================= S5: Lichtenberg figure on the forearm =================
function makeFern(seed) {
  const rng = mulberry32(seed), segs = [];
  const SPEED = 950;
  function grow(x, y, ang, len, w, depth, t0, bias) {
    let px = x, py = y, a = ang, tt = t0;
    const steps = Math.max(2, Math.floor(len / 15));
    for (let i = 0; i < steps; i++) {
      a += (rng() - 0.5) * 0.55 + (bias - a) * 0.08;
      const sl = 11 + rng() * 8;
      const nx = px + Math.cos(a) * sl, ny = py + Math.sin(a) * sl;
      const ww = w * (1 - (i / steps) * 0.75);
      tt += sl / SPEED;
      segs.push({ x1: px, y1: py, x2: nx, y2: ny, w: ww, t: tt, d: depth });
      if (depth < 4 && rng() < (depth === 0 ? 0.42 : 0.34)) {
        const side = i % 2 ? 1 : -1;
        const na = a + side * (0.55 + rng() * 0.55);
        grow(nx, ny, na, len * (0.28 + rng() * 0.3) * (depth === 0 ? 1.1 : 1), ww * 0.72, depth + 1, tt, na);
      }
      px = nx; py = ny;
    }
  }
  const ax = Math.atan2(0.742, -0.671); // along the arm, toward the wrist
  const root = [820, 470];
  grow(root[0], root[1], ax, 1050, 13, 0, 0, ax);
  grow(root[0] - 10, root[1] + 20, ax + 0.45, 620, 9, 1, 0.08, ax + 0.35);
  grow(root[0] + 20, root[1] + 5, ax - 0.5, 560, 9, 1, 0.12, ax - 0.4);
  return { segs, root };
}
function armShape(c) {
  c.beginPath();
  c.moveTo(1180 + 0.742 * -330, 180 + 0.671 * -330);
  c.lineTo(1180 + 0.742 * 330, 180 + 0.671 * 330);
  c.lineTo(-150 + 0.742 * 270, 1650 + 0.671 * 270);
  c.lineTo(-150 + 0.742 * -270, 1650 + 0.671 * -270);
  c.closePath();
}
SC.fern = (lt, t, shot) => {
  const c = TLd.cues, D = shot.end - shot.start;
  const enterK = 1 - E.outCubic(inv(0, 0.16, lt));
  const exitK = E.inCubic(inv(D - 0.137, D, lt));
  const gk = t - c.fern_grow;
  const follow = E.outCubic(clamp(gk / 1.3));
  const cam = { x: 540 - enterK * 700 + follow * -60, y: 960 - enterK * 800 + follow * 80,
    zoom: lerp(1.02, 1.2, E.inOutSine(inv(0, D, lt))) * (1 - exitK * 0.5), rot: lerp(-0.05, 0.02, inv(0, D, lt)) };
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0B1030'); bg.addColorStop(1, '#1B1446');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const b of BOKEH) softDot(ctx, (b.x + t * 20) % (W + 100) - 50, b.y + 10 * Math.sin(t + b.ph), b.r, '#7F9BFF', b.a);
  applyCam(cam);
  // arm
  ctx.save();
  armShape(ctx);
  const sg = ctx.createLinearGradient(1180 - 0.742 * 330 * 1.2, 180 - 0.671 * 330 * 1.2, 1180 + 0.742 * 330 * 1.2, 180 + 0.671 * 330 * 1.2);
  sg.addColorStop(0, '#8F5238'); sg.addColorStop(0.18, '#D98F6A'); sg.addColorStop(0.42, '#F7C3A0'); sg.addColorStop(0.62, '#EFB08C');
  sg.addColorStop(0.88, '#C27A58'); sg.addColorStop(1, '#7A4430');
  ctx.fillStyle = sg; ctx.fill();
  ctx.clip();
  gctx.save(); armShape(gctx); gctx.clip();
  ctx.globalAlpha = 0.22; ctx.globalCompositeOperation = 'multiply';
  const pat = ctx.createPattern(ENV.skinTex, 'repeat');
  ctx.fillStyle = pat; ctx.fillRect(-600, -600, 2400, 3200);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // flush of redness around the figure
  const segs = FERN.segs;
  for (const s of segs) {
    if (s.t > gk) continue;
    if (s.d > 1) continue;
    line(ctx, s.x1, s.y1, s.x2, s.y2, s.w * 4.5, 'rgba(230,80,95,0.07)');
  }
  // the figure
  for (const s of segs) {
    if (s.t > gk) continue;
    const age = gk - s.t;
    const fresh = clamp(1 - age / 0.18);
    const w = s.w * (0.55 + 0.45 * clamp(age / 0.1));
    line(ctx, s.x1, s.y1, s.x2, s.y2, w, fresh > 0 ? mixHex('#D23A5A', '#FFE0E8', fresh) : '#CF3A58');
    if (fresh > 0) line(gctx, s.x1, s.y1, s.x2, s.y2, w * 2 + 4, `rgba(255,120,150,${0.75 * fresh})`);
    else if (s.d === 0) line(gctx, s.x1, s.y1, s.x2, s.y2, w * 2, 'rgba(255,70,110,0.22)');
  }
  // sweat beads flash to steam as the current passes
  const rng = mulberry32(99);
  for (let i = 0; i < 30; i++) {
    const u = rng(), v = rng() - 0.5;
    const x = 1180 + (-150 - 1180) * u + 0.742 * v * 480, y = 180 + (1650 - 180) * u + 0.671 * v * 480;
    const dist = Math.hypot(x - FERN.root[0], y - FERN.root[1]);
    const hit = gk - dist / 950 - 0.05;
    const r0 = 5 + rng() * 7;
    if (hit < 0) {
      ellipse(ctx, x, y, r0, r0 * 0.9, 'rgba(255,255,255,0.18)');
      ellipse(ctx, x - r0 * 0.3, y - r0 * 0.35, r0 * 0.35, r0 * 0.28, 'rgba(255,255,255,0.8)');
    } else if (hit < 0.5) {
      const k = hit / 0.5;
      softDot(ctx, x + k * 20, y - k * 70, r0 * (2 + k * 5), '#F4F6FF', 0.45 * (1 - k));
    }
  }
  ctx.restore();
  gctx.restore();
  // sleeve cuff (the yellow raincoat, singed)
  ctx.save();
  const sx = 1180 + -0.671 * -60, sy = 180 + 0.742 * -60;
  ctx.translate(sx, sy); ctx.rotate(Math.atan2(0.742, -0.671) + Math.PI / 2);
  rrect(ctx, -420, -700, 840, 760, 40);
  const cg = ctx.createLinearGradient(-420, 0, 420, 0);
  cg.addColorStop(0, '#B06C0C'); cg.addColorStop(0.3, '#FFC23A'); cg.addColorStop(0.7, '#FFD466'); cg.addColorStop(1, '#C27A12');
  ctx.fillStyle = cg; ctx.fill();
  rrect(ctx, -430, -10, 860, 70, 30); ctx.fillStyle = '#DE8C16'; ctx.fill();
  ellipse(ctx, -120, 10, 80, 28, 'rgba(40,25,20,0.45)'); ellipse(ctx, 150, -40, 50, 20, 'rgba(40,25,20,0.35)');
  ctx.restore();
  pill(540, 250, 'LICHTENBERG FIGURE', '#FF86A6', ramp(t, c.label_fern, c.label_fern + 0.2) * 1.15, 40);
  return { blur: enterK > 0.02 ? [-enterK * 140, -enterK * 160] : null, zblur: -exitK * 0.35, zcx: 540, zcy: 960 };
};

// ================= S6 + S7: survivor, then the next storm =================
function survivorWorld(cam, lt, t, o) {
  const c = TLd.cues;
  drawStorm(cam, { flash: o.sky, t });
  drawRain(t, 0.75, 0);
  drawHill(cam, { flash: o.sky, crestY: 1200, t });
  applyCam(cam);
  // scorch mark + embers
  const sg = ctx.createRadialGradient(540, 1210, 10, 540, 1210, 360);
  sg.addColorStop(0, 'rgba(8,5,8,0.9)'); sg.addColorStop(0.6, 'rgba(12,8,14,0.55)'); sg.addColorStop(1, 'rgba(12,8,14,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(540, 1212, 380, 70, 0, 0, 7); ctx.fill();
  const rng = mulberry32(55);
  for (let i = 0; i < 16; i++) {
    const a = rng() * Math.PI * 2, d = 140 + rng() * 200;
    const x = 540 + Math.cos(a) * d, y = 1212 + Math.sin(a) * d * 0.18;
    const fl = 0.5 + 0.5 * vnoise(t * 6 + i, 8);
    circle(ctx, x, y, 3.5, `rgba(255,${120 + fl * 80},60,${0.8 * fl})`);
    circle(gctx, x, y, 12, `rgba(255,120,40,${0.6 * fl})`);
  }
  smoke(71, 700, 1205, -2, t, { rate: 5, rise: 200, alpha: 0.18, size: 30, life: 2 });
  smoke(72, 380, 1210, -2, t, { rate: 5, rise: 180, alpha: 0.16, size: 26, life: 2 });
  // the blown-off shoe
  ctx.save(); ctx.translate(850, 1212); ctx.rotate(0.35); ctx.scale(1.15, 1.15);
  drawShoe(ctx, [0, 0], 1, PAL, 0, false);
  ctx.restore();
  smoke(73, 860, 1190, -2, t, { rate: 7, rise: 190, alpha: 0.24, size: 16, life: 1.6 });
  // the survivor
  const thumbK = E.outBack(inv(c.survive + 0.02, c.survive + 0.22, t), 1.6);
  let pose = lerpPose(POSES.sit, POSES.sitThumb, clamp(thumbK, 0, 1.1));
  if (o.lower) pose = lerpPose(pose, POSES.sit, o.lower);
  let face = FACES.dazed;
  const blinkT = c.icons + 0.35;
  face = Object.assign({}, face, { blink: Math.max(face.blink, Math.exp(-Math.pow((t - blinkT) / 0.05, 2))) });
  face = lerpFace(face, FACES.grin, ramp(t, c.survive - 0.08, c.survive + 0.08));
  if (o.nervous > 0) face = lerpFace(face, FACES.nervous, o.nervous);
  const st = { x: 540, y: 1206, s: 1.15, pose, face, frizz: 1, soot: 0.85, shoeMissingL: true, seed: 3,
    headRot: 0.05 * Math.sin(t * 3) * (1 - ramp(t, c.survive - 0.1, c.survive + 0.1)) };
  charLayer(cam, st, t, { ambient: 0.16, light: o.sky * 0.6 });
  applyCam(cam);
  smoke(74, 552, 730, -2, t, { rate: 16, rise: 300, alpha: 0.34, size: 22, life: 1.4, wind: 40 });
  return st;
}
function survivorIcons(t, fade) {
  const c = TLd.cues;
  for (let i = 0; i < 10; i++) {
    const x = 540 + (i - 4.5) * 92, y = 450;
    const pk = E.outBack(inv(c.icons + i * 0.03, c.icons + i * 0.03 + 0.16, t), 2.2) * fade;
    if (pk <= 0) continue;
    const lit = i < 9 ? ramp(t, c.icons + 0.22 + i * 0.028, c.icons + 0.3 + i * 0.028) : 0;
    const dead = i === 9 ? ramp(t, c.icons + 0.5, c.icons + 0.65) : 0;
    const bounce = i < 9 ? 1 + 0.18 * Math.exp(-Math.pow((t - c.survive - i * 0.02) / 0.06, 2)) : 1;
    const col = i < 9 ? mixHex('#C9D2EE', '#4DFFB4', lit) : mixHex('#C9D2EE', '#4A5170', dead);
    ctx.save(); screenSpace(); ctx.translate(x, y + (i === 9 ? dead * 6 : 0)); ctx.scale(pk * bounce * 1.25, pk * bounce * 1.25);
    ctx.globalAlpha = i === 9 ? 1 - 0.45 * dead : 1;
    circle(ctx, 0, -30, 17, col);
    rrect(ctx, -23, -8, 46, 50, 20); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
    if (lit > 0) {
      gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(x, y); gctx.scale(pk * bounce * 1.25, pk * bounce * 1.25);
      circle(gctx, 0, -30, 22, `rgba(60,255,170,${0.7 * lit * fade})`); rrect(gctx, -28, -12, 56, 58, 24);
      gctx.fillStyle = `rgba(60,255,170,${0.6 * lit * fade})`; gctx.fill(); gctx.restore();
    }
  }
}
SC.survive = (lt, t) => {
  const c = TLd.cues;
  const inK = E.outCubic(inv(0, 0.28, lt));
  const cam = { x: 540, y: lerp(990, 1010, inK), zoom: lerp(1.45, 1.0, inK) * lerp(1, 1.04, inv(0.28, 1.43, lt)), rot: lerp(0.04, 0, inK) };
  const sky = 0.06 + 0.12 * Math.max(0, vnoise(t * 5, 4));
  survivorWorld(cam, lt, t, { sky });
  survivorIcons(t, 1);
  return { zblur: (1 - inK) * 0.3, zcx: 540, zcy: 900 };
};
SC.final = (lt, t) => {
  const c = TLd.cues;
  const up = E.inOutCubic(inv(0, 0.42, lt));
  const pre = inv(9.55, c.final_strike, t);
  const sky = 0.08 + 0.45 * pre * Math.abs(vnoise(t * 18, 6)) + (t >= c.final_strike ? 1 : 0);
  const [shx, shy] = shake(t, 4 + 10 * pre, 20, 4);
  const cam = { x: 540, y: lerp(1010, 700, up), zoom: lerp(1.04, 1.12, up), rot: 0, sx: shx, sy: shy };
  survivorWorld(cam, lt, t, { sky: clamp(sky), nervous: ramp(lt, 0.02, 0.2), lower: ramp(lt, 0.0, 0.25) });
  survivorIcons(t, 1 - ramp(lt, 0, 0.18));
  applyCam(cam);
  const lead = inv(c.final_strike - 0.12, c.final_strike, t);
  if (lead > 0) drawBolt(BOLT2, lerp(0.2, 1, lead), t >= c.final_strike ? 2 : 0.7, t);
  const flashTop = t >= c.final_strike ? lerp(1, 0.82, inv(c.final_strike, 10, t)) : 0;
  return { flashTop, noCaptions: true };
};
