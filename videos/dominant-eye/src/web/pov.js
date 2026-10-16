// What he sees (dominant-eye, 16 Oct 2026): the night sky with the moon, and his own right hand rising from the lower
// right with the index finger up, its tip on the moon. Drawn in "pov space" (a 1080x1920 frame) under any view, so the
// same picture fills the screen in the POV shots and plays small on the brain's monitors.
// - povSet(V): V = {s, x, y} maps pov space to the screen (ctx) and to the glow layer (half size).
// - povView(t, o): o = {shift 0 (the boss eye's picture: the tip on the moon) .. 1 (the intern eye's: the tip jumps
//   right), ghost (a dashed outline where the finger was), streak (motion lines from the ghost to the finger), dim}.
// - povLids(k): two dark lids closing over the frame (a blink between the eyes), screen space.
// - povHUD(x, y, s, L, R, k): two little eye icons, his left and right as he sees them (1 open .. 0 shut).
// - jumpBurst(txt, x, y, s, k, rot): a word in a jagged yellow burst (screen space).
'use strict';

let POV_SKY = null;
const POV_MOON = [540, 790, 92];
const POV_TIP = [540, 806];          // the fingertip in the boss eye's picture: on the moon
const POV_JUMP = 265;                // how far it jumps in the intern's

function initPov() {
  POV_SKY = mkCanvas(1080, 1920);
  const c = POV_SKY.getContext('2d'), rng = mulberry32(4242);
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#03051A'); g.addColorStop(0.45, '#0B1438'); g.addColorStop(0.72, '#1B2560'); g.addColorStop(1, '#0A0E26');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 300; i++) {
    const x = rng() * 1080, y = rng() * 1500, r = 0.8 + rng() * rng() * 2.6;
    circle(c, x, y, r, `rgba(225,232,255,${0.25 + rng() * 0.6})`);
  }
  const ridge = (y0, amp, seed, col) => {
    const r2 = mulberry32(seed), ph = [r2() * 6, r2() * 6];
    c.beginPath(); c.moveTo(0, 1920);
    for (let x = 0; x <= 1080; x += 10) c.lineTo(x, y0 - amp * (0.6 * Math.sin(x / 210 + ph[0]) + 0.4 * Math.sin(x / 87 + ph[1])));
    c.lineTo(1080, 1920); c.closePath(); c.fillStyle = col; c.fill();
  };
  ridge(1560, 60, 5, '#1A2456');
  for (let i = 0; i < 40; i++) circle(c, 80 + rng() * 520, 1575 + rng() * 34, 1.8 + rng() * 2, rng() < 0.7 ? 'rgba(255,196,110,0.85)' : 'rgba(255,240,200,0.8)');
  ridge(1640, 50, 9, '#10183E');
  ridge(1740, 30, 13, '#090E28');
}
function povSet(V) {
  ctx.setTransform(V.s, 0, 0, V.s, V.x, V.y);
  gctx.setTransform(V.s / 2, 0, 0, V.s / 2, V.x / 2, V.y / 2);
}
// the view that puts pov point F at screen point P with scale s
function povAt(F, P, s) { return { s, x: P[0] - F[0] * s, y: P[1] - F[1] * s }; }

// the moon in pov space
let POV_GLOW = 1;   // the moon's bloom: lower on the brain's monitors, where the picture is small
function povMoon(t, a = 1) {
  const [x, y, r] = POV_MOON;
  a *= POV_GLOW;
  softDot(gctx, x, y, r * 4.4, '#9FB8FF', 0.26 * a);
  softDot(gctx, x, y, r * 1.8, '#E9F0FF', 0.3 * a);
  circle(ctx, x, y, r, '#F4F0DA');
  paint(() => {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    ellipse(ctx, x - r * 0.28, y - r * 0.18, r * 0.34, r * 0.26, 'rgba(176,170,140,0.45)', 0.4);
    ellipse(ctx, x + r * 0.22, y + r * 0.08, r * 0.26, r * 0.32, 'rgba(176,170,140,0.38)', -0.3);
    ellipse(ctx, x - r * 0.05, y + r * 0.42, r * 0.2, r * 0.14, 'rgba(176,170,140,0.32)');
    for (const [dx, dy, rr] of [[0.45, -0.38, 0.09], [-0.52, 0.3, 0.07], [0.12, -0.62, 0.06], [0.58, 0.42, 0.06]]) circle(ctx, x + dx * r, y + dy * r, rr * r, 'rgba(160,152,120,0.5)');
    ctx.restore();
  });
  circle(gctx, x, y, r * 0.98, `rgba(255,252,236,${0.4 * a})`);
}

// his right hand from behind, the index finger up with its tip at F (pov space). ghost: only a dashed outline
function povHand(F, o = {}) {
  const c = ctx, sk = '#F2B48E', skD = '#D98F6B', nail = '#FAD4C6', coat = PAL.coat, coatD = PAL.coatSh;
  const K = [F[0] + 70, F[1] + 360];                 // the middle of the fist (the back of the hand)
  const base = [K[0] - 62, K[1] - 92];               // the index finger's knuckle
  const fingerPath = () => {                          // the finger as one capsule from its knuckle to the tip
    const dx = F[0] - base[0], dy = F[1] - base[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, w = 41;
    const nx = -uy, ny = ux, an = Math.atan2(ny, nx);
    c.beginPath();
    c.moveTo(base[0] + nx * w, base[1] + ny * w);
    c.lineTo(F[0] + nx * w, F[1] + ny * w);
    c.arc(F[0], F[1], w, an, an - Math.PI, true);     // round the tip
    c.lineTo(base[0] - nx * w, base[1] - ny * w);
    c.closePath();
    return [ux, uy, w];
  };
  if (o.ghost) {
    c.save(); fingerPath(); c.fillStyle = `rgba(255,212,71,${0.16 * o.ghost})`; c.fill();
    c.setLineDash([18, 12]); c.lineWidth = 8; c.strokeStyle = `rgba(255,212,71,${0.9 * o.ghost})`; c.stroke();
    c.restore();
    return;
  }
  actor(() => {
    // the sleeve, from the lower right
    c.beginPath(); c.moveTo(K[0] - 30, K[1] + 90); c.lineTo(K[0] + 150, K[1] + 40); c.lineTo(K[0] + 520, K[1] + 760); c.lineTo(K[0] + 150, K[1] + 900); c.closePath();
    c.fillStyle = coat; c.fill();
    rrect(c, K[0] - 70, K[1] + 40, 250, 120, 50); c.fillStyle = coatD; c.fill();   // the cuff
    // the fist: the back of the hand, four knuckles on top (the index one rises into the finger)
    rrect(c, K[0] - 112, K[1] - 100, 236, 210, 74); c.fillStyle = sk; c.fill();
    for (let i = 1; i < 4; i++) circle(c, K[0] - 62 + i * 56, K[1] - 86, 34, sk);
    // the thumb along the left side
    c.beginPath(); c.ellipse(K[0] - 118, K[1] + 6, 40, 82, 0.25, 0, 7); c.fillStyle = sk; c.fill();
    // the finger
    fingerPath(); c.fillStyle = sk; c.fill();
  });
  paint(() => {
    const dx = F[0] - base[0], dy = F[1] - base[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    // the nail at the tip, two creases, the knuckle lines on the fist
    c.save(); c.translate(F[0] + ux * -34, F[1] + uy * -34); c.rotate(Math.atan2(uy, ux) + Math.PI / 2);
    rrect(c, -25, -32, 50, 58, 22); c.fillStyle = nail; c.fill();
    rrect(c, -20, -28, 40, 14, 8); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    c.restore();
    for (const u of [0.42, 0.7]) {
      const p = [base[0] + dx * u, base[1] + dy * u];
      c.beginPath(); c.moveTo(p[0] - 24, p[1] + 4); c.quadraticCurveTo(p[0], p[1] - 8, p[0] + 24, p[1] + 4);
      c.lineWidth = 4; c.strokeStyle = 'rgba(176,100,72,0.55)'; c.lineCap = 'round'; c.stroke();
    }
    for (let i = 1; i < 4; i++) {
      const x = K[0] - 62 + i * 56;
      c.beginPath(); c.moveTo(x - 14, K[1] - 60); c.quadraticCurveTo(x, K[1] - 70, x + 14, K[1] - 60);
      c.lineWidth = 4; c.strokeStyle = 'rgba(176,100,72,0.45)'; c.stroke();
    }
    line(c, K[0] - 100, K[1] - 10, K[0] - 60, K[1] + 30, 4, 'rgba(176,100,72,0.4)');
    // moonlight on the top edge of the finger
    c.beginPath(); c.moveTo(base[0] - 30, base[1] + 10); c.lineTo(F[0] - 34, F[1] + 6);
    c.lineWidth = 6; c.strokeStyle = 'rgba(220,232,255,0.45)'; c.stroke();
  });
}

// the whole picture. o: {shift, ghost, streak, dim, t}
function povView(t, o = {}) {
  ctx.drawImage(POV_SKY, 0, 0);
  // twinkles on loop clocks
  const rng = mulberry32(31);
  for (let i = 0; i < 10; i++) {
    const x = 60 + rng() * 960, y = 300 + rng() * 900, ph = rng() * 6, w = loopW(1.4 + rng() * 2);
    if (Math.hypot(x - POV_MOON[0], y - POV_MOON[1]) < 260) continue;
    const k = 0.55 + 0.45 * Math.sin(t * w + ph);
    circle(ctx, x, y, 2.2 + 1.6 * k, `rgba(235,240,255,${0.55 * k})`);
    softDot(gctx, x, y, 14, '#BFD2FF', 0.35 * k);
  }
  povMoon(t, 1 - 0.5 * (o.dim || 0));
  const sh = o.shift || 0, F = [POV_TIP[0] + POV_JUMP * sh, POV_TIP[1] + 10 * Math.sin(Math.PI * clamp(sh))];
  if ((o.ghost || 0) > 0.01) povHand([POV_TIP[0], POV_TIP[1]], { ghost: o.ghost });
  if ((o.streak || 0) > 0.01) {     // speed lines from where the finger was
    const k = clamp(o.streak);
    for (let i = -2; i <= 2; i++) {
      const y = POV_TIP[1] + 60 + i * 46, x0 = POV_TIP[0] + 40, x1 = F[0] - 70;
      if (x1 > x0) line(ctx, lerp(x1, x0, k), y, x1, y, 9, `rgba(255,255,255,${0.85 * k})`);
    }
  }
  povHand(F);
  if ((o.dim || 0) > 0.01) { ctx.fillStyle = `rgba(6,8,22,${0.55 * o.dim})`; ctx.fillRect(-200, -200, 1480, 2320); }
  return F;
}

// two lids that close over the frame and open again (k 0..1), screen space
function povLids(k) {
  if (k <= 0.01) return;
  screenSpace();
  const h = 980 * E.inOutSine(clamp(k));
  ctx.fillStyle = '#05040A';
  ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(1100, -20); ctx.lineTo(1100, h - 120); ctx.quadraticCurveTo(540, h + 120, -20, h - 120); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, 1940); ctx.lineTo(1100, 1940); ctx.lineTo(1100, 1920 - h + 120); ctx.quadraticCurveTo(540, 1920 - h - 120, -20, 1920 - h + 120); ctx.closePath(); ctx.fill();
}

// one eye icon (open 1 .. shut 0), screen space
function eyeIcon(x, y, s, open, col = '#FFFFFF') {
  const c = ctx;
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(() => {
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(0, -42, 46, 0); c.quadraticCurveTo(0, 42, -46, 0); c.closePath();
    c.fillStyle = 'rgba(8,10,28,0.9)'; c.fill();
    if (open > 0.5) {
      const ry = 26 * (open - 0.5) * 2;
      c.save(); c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -38 * (open - 0.5) * 2, 40, 0); c.quadraticCurveTo(0, 38 * (open - 0.5) * 2, -40, 0); c.closePath(); c.clip();
      c.fillStyle = '#FFFFFF'; c.fillRect(-46, -46, 92, 92);
      circle(c, 0, 0, 17, '#2A6BFF'); circle(c, 0, 0, 8, '#0B0B1A'); circle(c, -5, -6, 4, '#FFFFFF');
      c.restore();
      void ry;
    } else {
      c.beginPath(); c.moveTo(-34, -2); c.quadraticCurveTo(0, 20, 34, -2); c.lineWidth = 7; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
      for (const lx of [-18, 0, 18]) line(c, lx, 8 + (lx === 0 ? 2 : 0), lx * 1.2, 22, 4, col);
    }
    c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(0, -42, 46, 0); c.quadraticCurveTo(0, 42, -46, 0); c.closePath();
    c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  });
  c.restore();
}
// his two eyes as he sees them: L on the left. k = the pop
function povHUD(x, y, s, L, R, k = 1) {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 2);
  eyeIcon(x - 66 * s, y, s * q, L);
  eyeIcon(x + 66 * s, y, s * q, R);
}

// a word in a jagged yellow burst (screen space)
function jumpBurst(txt, x, y, s, k, rot = -0.1, col = '#FFD447') {
  if (k <= 0.01) return;
  screenSpace();
  const q = E.outBack(clamp(k), 2.6);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * q, s * q);
  const pts = [], n = 18;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 98 : 150; pts.push([Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.82]); }
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = '#0B0B1A'; ctx.fill();
  ctx.save(); ctx.scale(0.9, 0.9); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
  paint(() => {
    ctx.font = '400 104px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 12; ctx.strokeStyle = '#0B0B1A'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, 0, 4);
  });
  ctx.restore();
}
