// Environment: storm sky, clouds, hills, rain, lightning bolts, sparks, smoke.
'use strict';

const ENV = {};

function makeCloudLayer(seed, w, h, body, rim, n, lit) {
  const c = mkCanvas(w, h), x = c.getContext('2d'), rng = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const cx = rng() * w, cy = h * 0.12 + Math.pow(rng(), 0.8) * h * 0.72;
    const r = 90 + rng() * 230;
    const g = x.createRadialGradient(cx, cy + r * 0.25, 0, cx, cy, r);
    if (lit) {
      g.addColorStop(0, rgba(rim, 0.75)); g.addColorStop(0.5, rgba(body, 0.35)); g.addColorStop(1, rgba(body, 0));
    } else {
      g.addColorStop(0, rgba(body, 0.95)); g.addColorStop(0.55, rgba(rim, 0.55)); g.addColorStop(1, rgba(rim, 0));
    }
    x.fillStyle = g;
    x.beginPath(); x.ellipse(cx, cy, r * 1.35, r * 0.8, 0, 0, Math.PI * 2); x.fill();
  }
  return c;
}

function makeRidge(seed, y0, amp, step) {
  const pts = [];
  for (let x = -600; x <= W + 600; x += step) {
    pts.push([x, y0 - amp * (0.55 * (vnoise(x / 260, seed) + 1) + 0.3 * vnoise(x / 90, seed + 3))]);
  }
  return pts;
}

function initEnv() {
  ENV.cloudsBack = makeCloudLayer(11, 2000, 1150, '#1B2254', '#2A2F6E', 80, false);
  ENV.cloudsBackLit = makeCloudLayer(11, 2000, 1150, '#6F7FE0', '#E6ECFF', 80, true);
  ENV.cloudsFront = makeCloudLayer(29, 2200, 900, '#0C1233', '#1B2150', 60, false);
  ENV.ridgeFar = makeRidge(4, 1120, 120, 40);
  ENV.ridgeMid = makeRidge(9, 1175, 70, 40);
  // grass blades along the foreground hill crest
  const rng = mulberry32(77);
  ENV.blades = [];
  for (let i = 0; i < 260; i++) {
    const x = -500 + rng() * (W + 1000);
    ENV.blades.push({ x, h: 14 + rng() * 26, lean: (rng() - 0.5) * 0.5, ph: rng() * 10 });
  }
  // skin micro-texture for the macro shot
  const tex = mkCanvas(512, 512), tx = tex.getContext('2d');
  const id = tx.createImageData(512, 512), r2 = mulberry32(5);
  for (let i = 0; i < 512 * 512; i++) {
    const v = 128 + (r2() - 0.5) * 50;
    id.data[i * 4] = v; id.data[i * 4 + 1] = v * 0.92; id.data[i * 4 + 2] = v * 0.85; id.data[i * 4 + 3] = 255;
  }
  tx.putImageData(id, 0, 0);
  tx.globalAlpha = 0.5;
  for (let i = 0; i < 900; i++) { // pores / creases
    tx.fillStyle = `rgba(90,50,40,${0.25 + r2() * 0.3})`;
    tx.beginPath(); tx.arc(r2() * 512, r2() * 512, 0.8 + r2() * 1.6, 0, 7); tx.fill();
  }
  ENV.skinTex = tex;
}

// foreground hill crest height at world x (character stands at x=540 on y=crestY)
function hillY(x, crestY) {
  const d = (x - 540) / 700;
  return crestY + d * d * 260 + 8 * vnoise(x / 70, 2);
}

// parallax camera: layer p=0 fixed to screen, p=1 moves with the world
function parallax(cam, p) {
  return { x: W / 2 + (cam.x - W / 2) * p, y: H / 2 + (cam.y - H / 2) * p, zoom: 1 + (cam.zoom - 1) * p,
    rot: (cam.rot || 0) * p, sx: (cam.sx || 0) * p, sy: (cam.sy || 0) * p };
}

// full storm backdrop. o: {flash, crestY, t, dim}
function drawStorm(cam, o) {
  const f = o.flash || 0, t = o.t;
  screenSpace();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixHex('#05081A', '#5E6CC8', f * 0.55));
  g.addColorStop(0.45, mixHex('#0E1540', '#8391EA', f * 0.6));
  g.addColorStop(0.62, mixHex('#2A2266', '#B4B9FF', f * 0.5));
  g.addColorStop(1, mixHex('#0A0C24', '#30387A', f * 0.4));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // clouds (parallax 0.35), drifting slowly
  camTransform(ctx, parallax(cam, 0.35), 1);
  const drift = (t || 0) * 18;
  ctx.globalAlpha = 1;
  ctx.drawImage(ENV.cloudsBack, -460 - drift, -160);
  if (f > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = clamp(f * 0.95);
    ctx.drawImage(ENV.cloudsBackLit, -460 - drift, -160);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(ENV.cloudsFront, -560 + drift * 1.6, -330);

  // distant ridges (parallax 0.55)
  camTransform(ctx, parallax(cam, 0.55), 1);
  const ridge = (pts, col, colLit) => {
    ctx.fillStyle = mixHex(col, colLit, f * 0.5);
    ctx.beginPath(); ctx.moveTo(pts[0][0], H + 900);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(pts[pts.length - 1][0], H + 900); ctx.closePath(); ctx.fill();
  };
  ridge(ENV.ridgeFar, '#11173F', '#3B4696');
  ridge(ENV.ridgeMid, '#0C1131', '#2A3276');
  ctx.globalAlpha = 1;
}

function drawHill(cam, o) {
  const f = o.flash || 0, crest = o.crestY, t = o.t;
  applyCam(cam);
  const g = ctx.createLinearGradient(0, crest - 40, 0, crest + 700);
  g.addColorStop(0, mixHex('#1A2352', '#4C5BB4', f * 0.55));
  g.addColorStop(0.35, mixHex('#10163A', '#2B347C', f * 0.4));
  g.addColorStop(1, '#070A1C');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-800, H + 1200);
  for (let x = -800; x <= W + 800; x += 20) ctx.lineTo(x, hillY(x, crest));
  ctx.lineTo(W + 800, H + 1200); ctx.closePath(); ctx.fill();
  // rim light on the crest
  ctx.strokeStyle = rgba('#9DB0FF', 0.18 + f * 0.6);
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = -800; x <= W + 800; x += 20) (x === -800 ? ctx.moveTo(x, hillY(x, crest)) : ctx.lineTo(x, hillY(x, crest)));
  ctx.stroke();
  // grass
  for (const b of ENV.blades) {
    const y = hillY(b.x, crest) + 4;
    const sway = b.lean + 0.18 * vnoise(t * 1.3 + b.ph, 3) + (o.blast || 0) * (b.x < 540 ? -0.9 : 0.9) * clamp(1 - Math.abs(b.x - 540) / 700);
    ctx.strokeStyle = mixHex('#1F2B60', '#6B7FE0', f * 0.6);
    ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x, y);
    ctx.quadraticCurveTo(b.x + sway * b.h * 0.5, y - b.h * 0.6, b.x + sway * b.h, y - b.h);
    ctx.stroke();
  }
}

// rain streaks in screen space. layerSel: 0 = back (small, dim), 1 = front (big)
function drawRain(t, amount, layerSel, frozen) {
  screenSpace();
  const n = layerSel === 0 ? 260 : 70;
  const tt = frozen === undefined ? t : frozen;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const k = i + layerSel * 1000;
    const speed = layerSel === 0 ? 1900 + hash(k) * 700 : 3000 + hash(k) * 900;
    const len = layerSel === 0 ? 34 + hash(k + 3) * 30 : 90 + hash(k + 3) * 60;
    const y = ((hash(k + 1) * 2300 + tt * speed) % 2300) - 200;
    const x = hash(k + 2) * 1500 - 200 - y * 0.16;
    const a = (layerSel === 0 ? 0.14 + hash(k + 4) * 0.14 : 0.10 + hash(k + 4) * 0.12) * amount;
    ctx.strokeStyle = `rgba(190,210,255,${a})`;
    ctx.lineWidth = layerSel === 0 ? 2 : 3.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * 0.16, y - len); ctx.stroke();
  }
}

// ---------- lightning ----------
function makeBolt(seed, x1, y1, x2, y2, opt = {}) {
  const rng = mulberry32(seed);
  const main = jagged(rng, x1, y1, x2, y2, opt.disp || 260, opt.depth || 7);
  const branches = [];
  const nb = opt.branches === undefined ? 7 : opt.branches;
  for (let i = 0; i < nb; i++) {
    const idx = Math.floor((0.08 + rng() * 0.62) * (main.length - 1));
    const [bx, by] = main[idx];
    const side = rng() < 0.5 ? -1 : 1;
    const len = 120 + rng() * 260;
    const ang = Math.PI / 2 + side * (0.35 + rng() * 0.6);
    const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
    const pts = jagged(rng, bx, by, ex, ey, len * 0.5, 5);
    const subs = [];
    if (rng() < 0.6) {
      const j = Math.floor(pts.length * (0.3 + rng() * 0.4));
      const a2 = ang + side * (0.4 + rng() * 0.4), l2 = len * (0.3 + rng() * 0.3);
      subs.push(jagged(rng, pts[j][0], pts[j][1], pts[j][0] + Math.cos(a2) * l2, pts[j][1] + Math.sin(a2) * l2, l2 * 0.5, 4));
    }
    branches.push({ at: idx / (main.length - 1), pts, subs, w: 0.35 + rng() * 0.25, flick: rng() * 10 });
  }
  return { main, branches, x1, y1, x2, y2 };
}

// progress p: 0..1 of the leader down the main channel; I: brightness
function drawBolt(b, p, I, t, opt = {}) {
  if (I <= 0.001 || p <= 0) return;
  const n = b.main.length;
  const upto = Math.max(2, Math.floor(p * (n - 1)) + 1);
  const pts = b.main.slice(0, upto);
  const width = opt.width || 1;
  const strokeAll = (c, glow) => {
    const s = glow ? 1 : 1;
    const draw = (P, w, col) => poly(c, P, w * width * s, col);
    // branches first
    for (const br of b.branches) {
      if (br.at > p) continue;
      const bp = clamp((p - br.at) / 0.35);
      const fl = 0.55 + 0.45 * Math.abs(vnoise(t * 30 + br.flick, 4));
      const m = Math.max(2, Math.floor(bp * br.pts.length));
      const P = br.pts.slice(0, m);
      const a = I * fl * br.w;
      if (glow) { draw(P, 16, `rgba(110,160,255,${0.8 * a})`); draw(P, 5, `rgba(230,245,255,${a})`); }
      else { draw(P, 7, `rgba(150,195,255,${0.55 * a})`); draw(P, 2.2, `rgba(245,250,255,${a})`); }
      for (const sb of br.subs) {
        if (bp < 0.6) continue;
        if (glow) draw(sb, 9, `rgba(110,160,255,${0.6 * a})`);
        else draw(sb, 1.6, `rgba(235,245,255,${0.8 * a})`);
      }
    }
    if (glow) {
      draw(pts, 46, `rgba(80,130,255,${0.55 * Math.min(1, I)})`);
      draw(pts, 20, `rgba(160,210,255,${0.9 * Math.min(1, I)})`);
      draw(pts, 8, `rgba(255,255,255,${Math.min(1, I)})`);
    } else {
      draw(pts, 18, `rgba(120,180,255,${0.35 * Math.min(1, I)})`);
      draw(pts, 8, `rgba(200,235,255,${0.9 * Math.min(1, I)})`);
      draw(pts, 3.5, `rgba(255,255,255,${Math.min(1, I)})`);
    }
  };
  strokeAll(ctx, false);
  strokeAll(gctx, true);
  // leader tip hot spot
  if (p < 1) {
    const [tx, ty] = pts[pts.length - 1];
    softDot(gctx, tx, ty, 40, '#CFE6FF', 0.9 * I);
  }
}

// ---------- particles ----------
// deterministic burst: returns nothing, draws sparks alive at time t
function sparks(seed, x, y, t0, t, n, o = {}) {
  const dt = t - t0;
  if (dt < 0) return;
  const rng = mulberry32(seed);
  const life = o.life || 0.6, sp = o.speed || 900, grav = o.grav === undefined ? 1400 : o.grav;
  const dir = o.dir === undefined ? -Math.PI / 2 : o.dir, spread = o.spread || Math.PI;
  const cols = o.cols || ['#FFFFFF', '#BFE6FF', '#FFE27A'];
  for (let i = 0; i < n; i++) {
    const L = life * (0.4 + rng() * 0.8);
    const a = dir + (rng() - 0.5) * spread * 2, v = sp * (0.3 + rng() * 0.9);
    const col = cols[Math.floor(rng() * cols.length)];
    const k = dt / L;
    if (k > 1) continue;
    const px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + 0.5 * grav * dt * dt;
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v + grav * dt;
    const tail = 0.035;
    const qx = px - vx * tail, qy = py - vy * tail;
    const al = (1 - k) * (o.alpha || 1);
    line(ctx, px, py, qx, qy, (o.w || 4) * (1 - k * 0.6), rgba(col, al));
    line(gctx, px, py, qx, qy, (o.w || 4) * 2.4, rgba(col, al * 0.9));
  }
}

function ring(x, y, r, ry, w, col, a) {
  if (a <= 0) return;
  for (const [c, m] of [[ctx, 1], [gctx, 1.8]]) {
    c.strokeStyle = rgba(col, a); c.lineWidth = w * m;
    c.beginPath(); c.ellipse(x, y, Math.max(0.1, r), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.stroke();
  }
}

// rising smoke plume from (x,y) — puffs born continuously from t0
function smoke(seed, x, y, t0, t, o = {}) {
  const rate = o.rate || 14, life = o.life || 1.4, rng = mulberry32(seed);
  const n = Math.floor((t - t0) * rate);
  for (let i = Math.max(0, n - Math.ceil(life * rate)); i <= n; i++) {
    const born = t0 + i / rate, age = (t - born) / life;
    if (age < 0 || age > 1) continue;
    const r1 = hash(seed + i * 3.1), r2 = hash(seed + i * 7.7);
    const px = x + (r1 - 0.5) * (o.spread || 20) + vnoise(born * 3 + age * 2, seed) * 40 * age + (o.wind || 30) * age;
    const py = y - (o.rise || 220) * age;
    const r = (o.size || 26) * (0.5 + age * 1.6) * (0.8 + r2 * 0.4);
    const a = (o.alpha || 0.35) * Math.sin(Math.PI * Math.min(1, age * 1.3));
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, rgba(o.col || '#9AA3C4', a)); g.addColorStop(1, rgba(o.col || '#9AA3C4', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill();
  }
}
