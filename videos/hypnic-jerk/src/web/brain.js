// Inside the head: side-view brain, EEG, spinal signals, x-ray sleeper, panic button, dream fall.
'use strict';

const BR = { col: '#F29BB5', sh: '#C9678A', hi: '#FFD3E0', dk: '#8E3D60', cb: '#E3839F' };
let GYRI = null, BPTS = null, BNET = null;

// ---------------------------------------------------------------- brain (side view, front = left)
function brainOutline(c) {
  c.beginPath();
  c.moveTo(-300, 40);
  c.bezierCurveTo(-332, -120, -212, -242, -60, -236);
  c.bezierCurveTo(62, -252, 232, -212, 292, -92);
  c.bezierCurveTo(332, -10, 322, 82, 252, 122);
  c.bezierCurveTo(200, 150, 120, 140, 62, 132);
  c.bezierCurveTo(0, 176, -132, 190, -202, 150);
  c.bezierCurveTo(-262, 130, -292, 102, -300, 40);
  c.closePath();
}

function initBrain() {
  const probe = mkCanvas(8, 8).getContext('2d');
  brainOutline(probe);
  const rng = mulberry32(21);
  GYRI = [];
  for (let i = 0; i < 34; i++) {
    let x, y;
    do { x = -300 + rng() * 600; y = -240 + rng() * 420; } while (!probe.isPointInPath(x, y));
    let a = rng() * Math.PI * 2;
    const P = [[x, y]];
    for (let k = 0; k < 9; k++) {
      a += (rng() - 0.5) * 1.6;
      x += Math.cos(a) * 24; y += Math.sin(a) * 24;
      P.push([x, y]);
    }
    GYRI.push(P);
  }
  BPTS = [];
  while (BPTS.length < 70) {
    const x = -290 + rng() * 580, y = -230 + rng() * 400;
    if (probe.isPointInPath(x, y)) BPTS.push([x, y, rng()]);
  }
  BNET = [];
  BPTS.forEach((p, i) => {
    const d = BPTS.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j]).filter((e) => e[1] !== i).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < 2; k++) if (d[k][1] > i) BNET.push([i, d[k][1]]);
  });
}

// set c to screen transform + local frame at (x, y), scale s
function local(c, x, y, s, rot, half) {
  const k = half ? 0.5 : 1;
  c.setTransform(k, 0, 0, k, 0, 0);
  c.translate(x, y); c.rotate(rot || 0); c.scale(s, s);
}

// o: {act 0..1 activity, calm 0..1 (warm -> cool sparks), alarm 0..1, face (cute eyes), t}
function drawBrain(x, y, s, t, o = {}) {
  const act = o.act === undefined ? 1 : o.act, calm = o.calm || 0, alarm = o.alarm || 0;
  const rot = o.rot || 0;
  // glow behind
  local(gctx, x, y, s, rot, true);
  ellipse(gctx, 0, -40, 330, 250, rgba(alarm > 0.3 ? '#FF3050' : '#FF7FB0', 0.10 + 0.25 * alarm));
  local(ctx, x, y, s, rot);
  // brainstem + cerebellum
  rrect(ctx, 70, 110, 64, 190, 30); ctx.fillStyle = '#D98AA3'; ctx.fill();
  line(ctx, 86, 130, 90, 290, 6, 'rgba(140,60,90,0.35)');
  ctx.save(); ctx.translate(208, 150); ctx.rotate(-0.15);
  ctx.beginPath(); ctx.ellipse(0, 0, 98, 64, 0, 0, Math.PI * 2);
  ctx.fillStyle = BR.cb; ctx.fill(); ctx.save(); ctx.clip();
  for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(-110, i * 12); ctx.quadraticCurveTo(0, i * 12 + 14, 110, i * 12); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(140,50,90,0.45)'; ctx.stroke(); }
  ctx.restore(); ctx.lineWidth = 6; ctx.strokeStyle = BR.dk; ctx.stroke(); ctx.restore();
  // cerebrum
  brainOutline(ctx);
  const g = ctx.createRadialGradient(-90, -130, 20, 0, -30, 360);
  g.addColorStop(0, BR.hi); g.addColorStop(0.45, BR.col); g.addColorStop(1, BR.sh);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  for (const P of GYRI) {
    poly(ctx, P, 9, 'rgba(160,60,100,0.42)');
    poly(ctx, P.map(([a, b]) => [a - 3, b - 4]), 4, 'rgba(255,225,235,0.45)');
  }
  // lateral + central sulcus
  ctx.beginPath(); ctx.moveTo(-170, 70); ctx.bezierCurveTo(-80, 40, 20, 20, 140, -10);
  ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(130,40,80,0.6)'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -238); ctx.bezierCurveTo(-20, -150, 20, -90, -30, 20);
  ctx.lineWidth = 9; ctx.stroke();
  if (alarm > 0) { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#FF2A40', 0.55 * alarm); ctx.fillRect(-400, -300, 800, 600); ctx.globalCompositeOperation = 'source-over'; }
  if (o.dim) { ctx.fillStyle = `rgba(20,20,60,${o.dim})`; ctx.fillRect(-400, -300, 800, 600); }
  ctx.restore();
  brainOutline(ctx); ctx.lineWidth = 7; ctx.strokeStyle = BR.dk; ctx.stroke();
  // neural activity: links that pulse + sparks that fire
  const warm = mixHex('#FFE27A', '#7FB4FF', calm), sparkCol = alarm > 0.3 ? '#FF4050' : (calm > 0.5 ? '#9CC8FF' : '#FFE27A');
  const rate = lerp(0.7, 4.2, act);
  BNET.forEach(([i, j], n) => {
    const ph = (t * rate * 0.35 + hash(n) * 7) % 1;
    const on = hash(n + 31) < 0.25 + 0.6 * act;
    if (!on) return;
    const a = BPTS[i], b = BPTS[j];
    line(ctx, a[0], a[1], b[0], b[1], 2.5, `rgba(255,255,255,${0.12 + 0.2 * act})`);
    const px = lerp(a[0], b[0], ph), py = lerp(a[1], b[1], ph);
    circle(ctx, px, py, 4.5, warm);
    local(gctx, x, y, s, rot, true); circle(gctx, px, py, 9, rgba(sparkCol, 0.8 * (0.4 + act))); local(ctx, x, y, s, rot);
  });
  BPTS.forEach(([px, py, r], i) => {
    const f = Math.pow(Math.max(0, Math.sin(t * rate * (1.3 + r) * 2 + r * 40)), 14) * (0.35 + 0.65 * act);
    if (f < 0.03) return;
    circle(ctx, px, py, 5 + 5 * f, `rgba(255,255,240,${f})`);
    local(gctx, x, y, s, rot, true); softDot(gctx, px, py, 40 * f + 10, sparkCol, f); local(ctx, x, y, s, rot);
  });
  if (o.face) brainFace(o.face, t);
  screenSpace();
}

// cartoon face for the "mini brain" character (drawn in brain-local coords)
function brainFace(f, t) {
  const blink = (t % 3.1) < 0.1 ? 0.15 : 1;
  for (const sx of [-70, 30]) {
    ellipse(ctx, sx, -40, 38, 46 * blink, '#FFFFFF');
    ctx.lineWidth = 5; ctx.strokeStyle = BR.dk; ctx.beginPath(); ctx.ellipse(sx, -40, 38, 46 * blink, 0, 0, 7); ctx.stroke();
    circle(ctx, sx + 8 * (f.lookX || 0), -34, 17 * blink, '#15132A');
    circle(ctx, sx + 8 * (f.lookX || 0) - 6, -42, 6 * blink, '#FFFFFF');
  }
  ctx.beginPath();
  if (f.grin) { ctx.moveTo(-70, 50); ctx.quadraticCurveTo(-20, 120, 40, 50); ctx.closePath(); ctx.fillStyle = '#5A1522'; ctx.fill(); }
  else { ctx.moveTo(-60, 60); ctx.quadraticCurveTo(-20, 80, 30, 60); ctx.lineWidth = 8; ctx.strokeStyle = '#5A1522'; ctx.stroke(); }
}

// faint head profile around the brain (facing left), in brain-local coords
function headProfile(x, y, s, a) {
  local(ctx, x, y, s, 0);
  ctx.beginPath();
  ctx.moveTo(40, -330); ctx.bezierCurveTo(260, -330, 380, -170, 372, 20);
  ctx.bezierCurveTo(366, 150, 300, 230, 240, 300); ctx.lineTo(230, 520);
  ctx.moveTo(-150, 520); ctx.lineTo(-160, 330);
  ctx.bezierCurveTo(-250, 320, -330, 290, -352, 230);
  ctx.bezierCurveTo(-372, 190, -360, 170, -372, 150);
  ctx.bezierCurveTo(-396, 140, -384, 120, -374, 108);
  ctx.bezierCurveTo(-408, 96, -432, 74, -420, 56);
  ctx.bezierCurveTo(-400, 20, -372, -10, -370, -40);
  ctx.bezierCurveTo(-372, -200, -220, -330, 40, -330);
  ctx.lineWidth = 6; ctx.strokeStyle = `rgba(127,200,255,${0.5 * a})`; ctx.stroke();
  ctx.fillStyle = `rgba(80,120,220,${0.08 * a})`; ctx.fill();
  // closed eye
  ctx.beginPath(); ctx.moveTo(-340, -10); ctx.quadraticCurveTo(-318, 4, -296, -8);
  ctx.lineWidth = 5; ctx.strokeStyle = `rgba(127,200,255,${0.6 * a})`; ctx.stroke();
  screenSpace();
}

// spinal cord leaving the brainstem, in screen coords (for signal paths)
function cordPath(x, y, s) {
  const P = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24, ly = 290 + k * 900;
    P.push([x + (104 + 40 * Math.sin(k * 2.4)) * s, y + ly * s]);
  }
  return P;
}
function drawCord(P, s, a = 1) {
  screenSpace();
  for (let i = 1; i < P.length; i += 2) { // vertebrae behind
    const [px, py] = P[i];
    rrect(ctx, px - 48 * s + 30 * s, py - 16 * s, 80 * s, 30 * s, 10 * s); ctx.fillStyle = `rgba(210,222,245,${0.28 * a})`; ctx.fill();
  }
  poly(ctx, P, 50 * s, `rgba(160,90,110,${a})`);
  poly(ctx, P, 38 * s, `rgba(236,196,170,${a})`);
  poly(ctx, P.map(([px, py]) => [px - 7 * s, py]), 8 * s, `rgba(255,236,220,${0.8 * a})`);
}
// dots travelling along a polyline: dir +1 = forward, -1 = backward
function signals(P, t, o = {}) {
  const acc = polyLen(P), L = acc[acc.length - 1];
  const n = o.n || 6, speed = o.speed || 900, col = o.col || '#7FB4FF', a = o.a === undefined ? 1 : o.a;
  if (a <= 0.01) return;
  screenSpace();
  for (let i = 0; i < n; i++) {
    let s = ((t - (o.t0 || 0)) * speed + (i / n) * L) % L;
    if (o.once) { s = (t - o.t0) * speed - i * (o.gap || 60); if (s < 0 || s > L) continue; }
    if (o.dir === -1) s = L - s;
    const [px, py] = polyAt(P, acc, s);
    const r = o.r || 11;
    circle(ctx, px, py, r, `rgba(255,255,255,${0.9 * a})`);
    softDot(ctx, px, py, r * 3, col, 0.6 * a);
    softDot(gctx, px, py, r * 4.5, col, a);
    // short trail
    for (let k = 1; k < 5; k++) {
      const [qx, qy] = polyAt(P, acc, s - (o.dir === -1 ? -1 : 1) * k * r * 1.4);
      circle(ctx, qx, qy, r * (1 - k * 0.18), rgba(col, 0.5 * a * (1 - k / 5)));
    }
  }
}

// ---------------------------------------------------------------- EEG panel
// state(tau): 0 = awake (fast, small), 1 = drifting into sleep (slow, big)
function drawEEG(x, y, w, h, t, state, col, label) {
  screenSpace();
  rrect(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(6,10,30,0.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(col, 0.55); ctx.stroke();
  ctx.save(); rrect(ctx, x, y, w, h, 26); ctx.clip();
  ctx.strokeStyle = 'rgba(127,160,255,0.08)'; ctx.lineWidth = 2;
  for (let gx = x; gx < x + w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }
  for (let gy = y; gy < y + h; gy += 40) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }
  const win = 1.6, cy = y + h * 0.58, P = [];
  for (let px = 0; px <= w; px += 3) {
    const tau = t - (w - px) / w * win;
    const k = clamp(state(tau));
    const fast = (1 - k) * (0.28 * Math.sin(2 * Math.PI * 17 * tau) + 0.18 * Math.sin(2 * Math.PI * 23 * tau + 1.3) + 0.12 * vnoise(tau * 60, 2));
    const alpha = Math.sin(Math.PI * clamp(k * 1.6)) * 0.45 * Math.sin(2 * Math.PI * 9.5 * tau);
    const theta = clamp(k * 1.4 - 0.3) * 0.95 * Math.sin(2 * Math.PI * 4.6 * tau + 0.4 * Math.sin(2 * Math.PI * 1.3 * tau));
    P.push([x + px, cy - (fast + alpha + theta) * h * 0.3]);
  }
  poly(ctx, P, 5, col);
  gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); poly(gctx, P, 10, rgba(col, 0.8));
  // write-head dot
  const last = P[P.length - 1]; circle(ctx, last[0], last[1], 8, '#FFFFFF'); softDot(gctx, last[0], last[1], 30, col, 1);
  ctx.restore();
  ctx.font = '800 30px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(200,215,255,0.75)'; ctx.fillText('BRAIN WAVES', x + 28, y + 36);
  if (label) { ctx.textAlign = 'right'; ctx.fillStyle = col; ctx.fillText(label, x + w - 28, y + 36); }
}

// ---------------------------------------------------------------- x-ray sleeper (overhead)
const XPJ = Object.assign({}, XPAL, { pj: true });
function xrayBed(cam, t, o = {}) {
  screenSpace();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#07102E'); bg.addColorStop(1, '#0B0A26');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  applyCam(cam);
  ctx.strokeStyle = 'rgba(80,140,255,0.10)'; ctx.lineWidth = 2;
  for (let gx = -400; gx < 1500; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, -600); ctx.lineTo(gx, 2600); ctx.stroke(); }
  for (let gy = -600; gy < 2600; gy += 60) { ctx.beginPath(); ctx.moveTo(-400, gy); ctx.lineTo(1500, gy); ctx.stroke(); }
  // bed + pillow + duvet as blueprint outlines
  ctx.setLineDash([18, 12]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(127,200,255,0.35)';
  rrect(ctx, 185, 250, 710, 1480, 26); ctx.stroke();
  rrect(ctx, 310, 320, 460, 240, 70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(165, 790); ctx.bezierCurveTo(300, 760, 780, 760, 915, 790); ctx.lineTo(935, 1760); ctx.lineTo(145, 1760); ctx.closePath(); ctx.stroke();
  ctx.setLineDash([]);
  const st = { x: LY.x, y: LY.y, s: LY.s * (o.scale || 1), pose: o.pose || POSES.sleep, face: FACES.sleepy, seed: 3 };
  const r = rig(st.pose);
  charLayer(cam, st, t, { pal: XPJ });
  applyCam(cam);
  drawBones(ctx, st, r, t, 1, 0.55);
  return { st, r };
}

// muscles as glowing bands; tension 0 = relaxed (dim blue), 1 = firing (hot red)
function muscles(cam, st, r, tension, t, flicker = 0) {
  const col = tension > 0.5 ? mixHex('#FF9A3C', '#FF3A3A', (tension - 0.5) * 2) : mixHex('#3F6BFF', '#FF9A3C', tension * 2);
  const hexCol = tension > 0.55 ? '#FF4A3A' : tension > 0.3 ? '#FF9A3C' : '#4A7BFF';
  const a = 0.35 + 0.55 * tension * (1 - flicker * 0.5 * (0.5 + 0.5 * vnoise(t * 45, 11)));
  const segs = [];
  for (const k of ['L', 'R']) segs.push([r['sh' + k], r['el' + k], 26], [r['el' + k], r['wr' + k], 22], [r['hip' + k], r['kn' + k], 32], [r['kn' + k], r['an' + k], 26]);
  const draw = (c, glow) => {
    for (const [p, q, w] of segs) {
      const A = toWorld(st, [lerp(p[0], q[0], 0.15), lerp(p[1], q[1], 0.15)]), B = toWorld(st, [lerp(p[0], q[0], 0.85), lerp(p[1], q[1], 0.85)]);
      line(c, A[0], A[1], B[0], B[1], w * st.s * (glow ? 1.6 : 1), glow ? rgba(hexCol, 0.7 * a) : col);
    }
    for (const s of [-1, 1]) {
      const pc = toWorld(st, r.U(s * 34, -110));
      ellipse(c, pc[0], pc[1], 34 * st.s, 24 * st.s, glow ? rgba(hexCol, 0.6 * a) : col);
    }
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
      const pa = toWorld(st, r.U(s * 18, -62 + i * 26));
      ellipse(c, pa[0], pa[1], 15 * st.s, 10 * st.s, glow ? rgba(hexCol, 0.5 * a) : col);
    }
  };
  applyCam(cam);
  ctx.globalAlpha = a; draw(ctx, false); ctx.globalAlpha = 1;
  draw(gctx, true);
}
// nerve routes from the brain to each limb (world coords)
function nervePaths(st, r) {
  const W_ = (p) => toWorld(st, p);
  const spine = [W_(r.head), W_(r.neck), W_(r.U(0, -120)), W_(r.U(0, -40)), W_(r.P)];
  const out = [];
  for (const k of ['L', 'R']) {
    out.push([...spine.slice(0, 3), W_(r['sh' + k]), W_(r['el' + k]), W_(r['wr' + k])]);
    out.push([...spine, W_(r['hip' + k]), W_(r['kn' + k]), W_(r['an' + k])]);
  }
  return { spine, limbs: out };
}

// ---------------------------------------------------------------- panic button console (screen coords)
function panicButton(x, y, s, press, cover, t, glow = 0) {
  local(ctx, x, y, s, 0);
  // console body
  rrect(ctx, -300, -40, 600, 260, 40); ctx.fillStyle = '#23263A'; ctx.fill();
  rrect(ctx, -300, -40, 600, 60, 30); ctx.fillStyle = '#34384F'; ctx.fill();
  // hazard stripes
  ctx.save(); rrect(ctx, -270, 110, 540, 70, 16); ctx.clip();
  ctx.fillStyle = '#FFC83A'; ctx.fillRect(-270, 110, 540, 70);
  ctx.fillStyle = '#1A1A22';
  for (let i = -8; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-270 + i * 60, 180); ctx.lineTo(-240 + i * 60, 110); ctx.lineTo(-210 + i * 60, 110); ctx.lineTo(-240 + i * 60, 180); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // label plate
  rrect(ctx, -130, 118, 260, 54, 12); ctx.fillStyle = '#F4F0E6'; ctx.fill();
  ctx.font = '400 46px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C8102E';
  ctx.fillText('PANIC', 0, 147);
  // bezel + dome
  ellipse(ctx, 0, 0, 190, 70, '#15161F');
  ellipse(ctx, 0, -6, 172, 60, '#9A9FB5');
  const dy = 36 * press;
  const dome = (c) => {
    c.beginPath(); c.moveTo(-150, -6); c.bezierCurveTo(-150, -120 + dy, 150, -120 + dy, 150, -6);
    c.ellipse(0, -6, 150, 50, 0, 0, Math.PI); c.closePath();
  };
  dome(ctx);
  const g = ctx.createRadialGradient(-40, -80 + dy, 10, 0, -30, 190);
  g.addColorStop(0, '#FF8A8A'); g.addColorStop(0.4, '#F0243A'); g.addColorStop(1, '#8A0A1A');
  ctx.fillStyle = g; ctx.fill();
  ellipse(ctx, -50, -70 + dy * 0.8, 42, 18, 'rgba(255,255,255,0.55)', -0.25);
  local(gctx, x, y, s, 0, true);
  softDot(gctx, 0, -40 + dy, 260, '#FF2040', 0.35 + 0.65 * glow);
  // flip cover (hinged at the back)
  if (cover < 1) {
    local(ctx, x, y, s, 0);
    ctx.save(); ctx.translate(0, -60); ctx.scale(1, lerp(1, -0.6, cover)); ctx.translate(0, 60);
    ctx.beginPath(); ctx.moveTo(-185, 0); ctx.lineTo(-165, -140); ctx.lineTo(165, -140); ctx.lineTo(185, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(200,230,255,0.22)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,240,255,0.7)'; ctx.stroke();
    ctx.restore();
  }
  screenSpace();
}

// cartoon glove fist (screen coords), knuckles down
function fist(x, y, s, rot = 0) {
  local(ctx, x, y, s, rot);
  rrect(ctx, -70, -330, 140, 200, 30); ctx.fillStyle = '#5E7FDC'; ctx.fill(); // sleeve
  rrect(ctx, -86, -150, 172, 48, 20); ctx.fillStyle = '#EDEFF7'; ctx.fill(); // cuff
  rrect(ctx, -100, -110, 200, 150, 60); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#1A1C2C'; ctx.stroke();
  for (let i = -1; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-100 + (i + 1) * 50, 40); ctx.lineTo(-100 + (i + 1) * 50, 0); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-96, -60); ctx.quadraticCurveTo(-40, -40, -30, 10); ctx.stroke(); // thumb
  screenSpace();
}

// rotating alarm beacon + red wash
function alarm(t, a, x = 540, y = 150) {
  if (a <= 0.01) return;
  screenSpace();
  const ang = t * 7;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const off of [0, Math.PI]) {
    const d = ang + off;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.arc(x, y, 1600, d - 0.28, d + 0.28); ctx.closePath();
    const g = ctx.createRadialGradient(x, y, 20, x, y, 1500);
    g.addColorStop(0, `rgba(255,40,60,${0.45 * a})`); g.addColorStop(1, 'rgba(255,40,60,0)');
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = `rgba(255,20,50,${0.12 * a * (0.5 + 0.5 * Math.sin(t * 14))})`; ctx.fillRect(0, 0, W, H);
  // the beacon itself
  rrect(ctx, x - 70, y - 10, 140, 40, 10); ctx.fillStyle = '#2A2C3C'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 55, y - 10); ctx.bezierCurveTo(x - 55, y - 110, x + 55, y - 110, x + 55, y - 10); ctx.closePath();
  ctx.fillStyle = mixHex('#7A1020', '#FF3050', a); ctx.fill();
  softDot(gctx, x, y - 50, 180, '#FF3050', a);
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

// tiny overhead bed with a sleeper (for the "super common" grid)
function miniBed(x, y, s, jolt, lit, t, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + 0.08 * jolt), s * (1 + 0.08 * jolt));
  rrect(ctx, -80, -130, 160, 260, 16); ctx.fillStyle = '#3B2B40'; ctx.fill();
  rrect(ctx, -70, -118, 140, 240, 12); ctx.fillStyle = '#C4CCEA'; ctx.fill();
  rrect(ctx, -50, -110, 100, 46, 16); ctx.fillStyle = '#F4F6FF'; ctx.fill();
  const hues = ['#2A1B14', '#6A3A1E', '#1B1B1B', '#C98A3A', '#4A2A1A'];
  circle(ctx, 0, -84 - 6 * jolt, 24, '#F2B892');
  ctx.beginPath(); ctx.arc(0, -84 - 6 * jolt, 25, Math.PI, 0); ctx.fillStyle = hues[seed % hues.length]; ctx.fill();
  const dcol = ['#D9A640', '#5EC6A8', '#E07A8C', '#7F9BFF', '#C39BFF'][seed % 5];
  ctx.translate(0, -8 * jolt);
  rrect(ctx, -74, -50, 148, 176, 14); ctx.fillStyle = dcol; ctx.fill();
  rrect(ctx, -74, -50, 148, 22, 10); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  if (jolt > 0.05) {
    ctx.lineWidth = 5; ctx.strokeStyle = `rgba(255,255,255,${jolt})`;
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 95, -40); ctx.lineTo(sd * 125, -60); ctx.moveTo(sd * 98, 0); ctx.lineTo(sd * 132, 0); ctx.stroke(); }
  }
  ctx.restore();
  if (lit > 0) {
    softDot(gctx, x, y, 200 * s, '#FFD447', 0.6 * lit);
    ctx.save(); ctx.translate(x, y - 170 * s); const ps = E.outBack(clamp(lit), 2.2) * s;
    ctx.scale(ps, ps);
    circle(ctx, 0, 0, 30, '#FFD447');
    ctx.font = '900 44px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1A1300'; ctx.fillText('!', 0, 2);
    ctx.restore();
  }
}
