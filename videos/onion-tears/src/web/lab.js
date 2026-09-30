// Onion-tears Short: the high-speed camera lab. A guillotine blade goes into an onion in slow motion, and the
// droplets burst out in two stages (a fast mist, then threads breaking into drops) and climb a ruler to 60 cm.
// Science: Cornell, "Droplet outbursts from onion cutting" (PNAS 2025; arXiv 2505.06016): droplets up to
// ~60 cm high; blunter blades and faster cuts eject more and faster droplets.
'use strict';

const LAB = { onionX: 560, onionY: 1080, r: 120, rulerX: 190, y0: 1080, y60: 380 };
let LAB_DROPS = null;

function initLab() {
  const rng = mulberry32(61);
  LAB_DROPS = [...Array(90)].map((_, i) => {
    const fast = i < 40;                         // stage 1: the fast mist; stage 2: threads that fragment
    const a = -Math.PI / 2 + (rng() - 0.5) * (fast ? 1.4 : 0.9);
    const top = fast ? 0.35 + rng() * 0.65 : 0.15 + rng() * 0.4;       // fraction of 60 cm reached
    return { a, top, fast, d: rng() * (fast ? 0.2 : 0.6), r: fast ? 3 + rng() * 5 : 5 + rng() * 8, ph: rng() * 7 };
  });
  LAB_DROPS[0].top = 1; LAB_DROPS[0].a = -Math.PI / 2 + 0.08; // the record holder
}

function labBg(t) {
  const c = ctx;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0B1426'); g.addColorStop(1, '#050A14');
  c.fillStyle = g; c.fillRect(-900, -900, 2900, 3700);
  for (let x = -900; x < 2000; x += 60) line(c, x, -900, x, 2800, 1.5, 'rgba(120,170,255,0.08)');
  for (let y = -900; y < 2800; y += 60) line(c, -900, y, 2000, y, 1.5, 'rgba(120,170,255,0.08)');
  // backlight
  softDot(c, 560, 900, 700, '#3A6FB8', 0.35);
  // bench
  c.fillStyle = '#1B2436'; c.fillRect(-900, LAB.y0 + 60, 2900, 1200);
  line(c, -900, LAB.y0 + 60, 2000, LAB.y0 + 60, 5, '#4A5A78');
}

function ruler(k) {
  if (k <= 0) return;
  const c = ctx, x = LAB.rulerX, y0 = LAB.y0 + 60, y1 = LAB.y60 - 20;
  c.save(); c.globalAlpha = clamp(k);
  rrect(c, x - 40, y1 - 20, 80, y0 - y1 + 20, 8); c.fillStyle = '#F2D46B'; c.fill();
  c.font = '800 30px Montserrat'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#2A2206';
  for (let cm = 0; cm <= 60; cm += 5) {
    const y = lerp(y0, LAB.y60, cm / 60);
    line(c, x - 40, y, x - (cm % 10 ? 20 : 4), y, 4, '#2A2206');
    if (cm % 10 === 0) c.fillText(String(cm), x + 2, y);
  }
  c.restore();
}

function labOnion(t, cut) {
  const c = ctx, { onionX: x, onionY: y, r } = LAB;
  onionBulb(c, x, y, r / 1.02, t, {});
  if (cut > 0) { // the blade's slit
    line(c, x, y - r * 1.2, x, y - r * 1.2 + cut * r * 1.9, 6, 'rgba(250,245,220,0.9)');
  }
}
function guillotine(t, y) {
  const c = ctx, x = LAB.onionX;
  line(c, x - 260, -900, x - 260, LAB.y0 + 60, 18, '#5A6680'); line(c, x + 260, -900, x + 260, LAB.y0 + 60, 18, '#5A6680');
  line(c, x - 260, y - 230, x + 260, y - 230, 26, '#46526A');
  c.beginPath(); c.moveTo(x - 150, y - 230); c.lineTo(x + 150, y - 230); c.lineTo(x + 150, y - 40); c.lineTo(x, y); c.lineTo(x - 150, y - 40); c.closePath();
  const g = c.createLinearGradient(x - 150, 0, x + 150, 0);
  g.addColorStop(0, '#5E6A82'); g.addColorStop(0.5, '#AAB5C8'); g.addColorStop(1, '#56627A');
  c.fillStyle = g; c.fill();
  line(c, x - 150, y - 40, x, y, 4, '#E6ECF6'); line(c, x, y, x + 150, y - 40, 4, '#E6ECF6');
}

// droplets at slow-motion time u (seconds since the blade hit, in "video" time) — drawn in world coords
function labDrops(u, count = 1) {
  if (u <= 0) return 0;
  let hi = 0;
  const n = Math.round(LAB_DROPS.length * count);
  for (let i = 0; i < n; i++) {
    const d = LAB_DROPS[i], uu = u - d.d;
    if (uu <= 0) continue;
    const Hh = d.top * (LAB.y0 - LAB.y60), T = d.fast ? 1.6 : 2.2;          // rise to the top in T seconds, then fall
    const v = 2 * Hh / T, g = v / T;
    const s = v * uu - 0.5 * g * uu * uu;
    if (s < -200) continue;
    const x = LAB.onionX + Math.cos(d.a) * s * 0.55 + 0 * d.ph, y = LAB.y0 - LAB.r * 1.1 - s * Math.abs(Math.sin(d.a));
    hi = Math.max(hi, s);
    if (!d.fast && uu < 0.5) { // a thread before it breaks
      line(ctx, LAB.onionX, LAB.y0 - LAB.r * 1.1, x, y, d.r * 0.8, 'rgba(220,255,235,0.6)');
    }
    circle(ctx, x, y, d.r, 'rgba(225,255,240,0.95)'); circle(ctx, x - d.r * 0.3, y - d.r * 0.3, d.r * 0.35, '#FFFFFF');
    softDot(gctx, x, y, d.r * 3, '#9CFFC0', 0.3);
  }
  return hi;
}

function hud(t, k, label) {
  if (k <= 0) return;
  screenSpace();
  ctx.save(); ctx.globalAlpha = clamp(k);
  const on = Math.sin(t * 6) > 0;
  if (on) circle(ctx, 150, 440, 16, '#FF3A4A');
  ctx.font = '800 38px Montserrat'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText('REC', 180, 441);
  ctx.textAlign = 'right'; ctx.fillStyle = '#7FE9FF'; ctx.fillText(label, 960, 441);
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  for (const [x, y, dx, dy] of [[110, 400, 1, 1], [970, 400, -1, 1], [110, 1640, 1, -1], [870, 1640, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + dy * 60); ctx.lineTo(x, y); ctx.lineTo(x + dx * 60, y); ctx.stroke();
  }
  ctx.restore();
}

SC.spray = (lt, t, shot) => {
  const c = cu(), D = shot.end - shot.start;
  const hit = c.spraying - 0.1;
  const cam = camKeys(t, [[shot.start, 560, 960, 1.5], [c.highspeed, 560, 930, 1.35], [hit, 560, 960, 1.45], [c.droplets, 520, 860, 1.05], [c.sixty, 470, 760, 0.95], [shot.end, 470, 750, 0.98]]);
  applyCam(cam);
  labBg(t);
  ruler(ramp(t, c.droplets, c.droplets + 0.4));
  const by = t < hit ? lerp(380, LAB.onionY - LAB.r * 1.2, ramp(t, c.highspeed, hit, E.inOutSine)) : LAB.onionY - LAB.r * 1.2 + (t - hit) * 30;
  labOnion(t, t > hit ? clamp((t - hit) * 0.25) : 0);
  guillotine(t, by);
  // slow motion: the droplets' own clock runs at ~0.8x, and the record holder tops out on "sixty"
  const u = (t - hit) * ((c.sixty + 0.4 - hit) > 0 ? 1.6 / (c.sixty + 0.4 - hit) : 1);
  const hi = labDrops(u);
  if (t > c.sixty) { // the 60 cm marker
    applyCam(cam);
    line(ctx, LAB.rulerX + 40, LAB.y60, LAB.onionX + 200, LAB.y60, 5, rgba('#FFD447', ramp(t, c.sixty, c.sixty + 0.3)));
  }
  hud(t, ramp(lt, 0, 0.3), 'HIGH-SPEED CAM');
  screenSpace();
  bigWord('60 CM!', 680, 640, 170, '#FFD447', pop(t, c.sixty + 0.15, 0.3), -0.06);
  pill(540, 1200, 'SLOW MOTION', '#7FE9FF', pop(t, c.highspeed + 0.2) * (1 - ramp(t, c.droplets, c.droplets + 0.3)), 44);
  return { glow: 0.7, desat: 0.15, flash: 0.35 * (t > hit ? 1 - ramp(t, hit, hit + 0.15) : 0), zblur: 0.2 * (1 - ramp(lt, 0, 0.35)) };
};
