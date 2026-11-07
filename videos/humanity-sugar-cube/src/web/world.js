// All of HUMANITY Fits in a Sugar Cube: the money shot (8 Nov 2026). Everyone on Earth, as one crowd that covers the
// planet to its curved horizon under a starry dusk; giant silver sugar tongs come down and SQUEEZE the whole crowd into
// one glowing cube. Screen space (1080x1920); a camera of its own: wcam = {k (push), dx, dy}.
'use strict';

let WD_SKY = null, WD_CROWD = null;
const WD = { horizon: 1060, cx: 540, R: 3400, pinch: [540, 1150] };
const WD_SHIRTS = ['#FF5A6E', '#FFC23A', '#4DB8FF', '#4DFFB4', '#C8A8FF', '#FF9A3C', '#F4F0E6', '#2FA37A', '#E04A8A', '#3A6BD8'];
const WD_SKINS = ['#F2C3A0', '#E0A57E', '#C68457', '#9C6340', '#6E4126', '#F6D2B6'];
const WD_GLINTS = [];

function wdLimbY(x, v = 0) {   // the planet's curved surface: v = 0 at the horizon
  const dx = x - WD.cx;
  return WD.horizon + (WD.R - Math.sqrt(Math.max(0, WD.R * WD.R - dx * dx))) * (1 - v);
}
function initWorld() {
  // the sky: deep dusk, stars, a band of Milky Way
  WD_SKY = mkCanvas(W, H);
  let x = WD_SKY.getContext('2d'), r = mulberry32(2208);
  const g = x.createLinearGradient(0, 0, 0, WD.horizon + 80);
  g.addColorStop(0, '#05071E'); g.addColorStop(0.55, '#141A5A'); g.addColorStop(0.85, '#3A3A9A'); g.addColorStop(1, '#7A5AC8');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.save(); x.translate(540, 600); x.rotate(-0.5);
  for (let i = 0; i < 900; i++) { const px = (r() - 0.5) * 1800, py = (r() + r() + r() - 1.5) * 170; x.fillStyle = `rgba(220,210,255,${0.05 + 0.12 * r()})`; x.beginPath(); x.arc(px, py, 1 + 5 * r(), 0, 7); x.fill(); }
  x.restore();
  for (let i = 0; i < 420; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * r()})`; x.beginPath(); x.arc(r() * W, r() * WD.horizon, 0.7 + 1.8 * r() * r(), 0, 7); x.fill(); }
  // the crowd: everyone, in rows to the curved horizon (far rows are dots; the near rows are people)
  WD_CROWD = mkCanvas(W, H);
  x = WD_CROWD.getContext('2d'); r = mulberry32(8000);
  const rows = 46;
  for (let j = 0; j < rows; j++) {
    const v = j / (rows - 1), pv = Math.pow(v, 1.7);
    const h = 5 + 120 * pv, dx = Math.max(2.6, h * 0.5);
    for (let px = -40 + r() * dx; px < W + 40; px += dx * (0.8 + 0.4 * r())) {
      const py = wdLimbY(px, pv) + (H - WD.horizon + 40) * pv + (r() - 0.5) * dx * 0.3;
      const shirt = WD_SHIRTS[Math.floor(r() * WD_SHIRTS.length)], skin = WD_SKINS[Math.floor(r() * WD_SKINS.length)];
      if (h < 9) { x.fillStyle = shirt; x.fillRect(px - h * 0.3, py - h * 0.5, h * 0.6, h * 0.6); x.fillStyle = skin; x.fillRect(px - h * 0.2, py - h * 0.85, h * 0.4, h * 0.35); continue; }
      rrect(x, px - h * 0.22, py - h * 0.62, h * 0.44, h * 0.62, h * 0.16); x.fillStyle = shirt; x.fill();
      x.fillStyle = skin; x.beginPath(); x.arc(px, py - h * 0.78, h * 0.17, 0, 7); x.fill();
      x.fillStyle = r() < 0.7 ? '#2A1B14' : '#6E5A4A'; x.beginPath(); x.arc(px, py - h * 0.83, h * 0.16, Math.PI, Math.PI * 2); x.fill();
      if (h > 40 && r() < 0.5) {   // a waving arm
        const sd = r() < 0.5 ? -1 : 1;
        line(x, px + sd * h * 0.18, py - h * 0.55, px + sd * h * 0.36, py - h * 0.98, h * 0.1, skin);
      }
      if (r() < 0.05 && WD_GLINTS.length < 140) WD_GLINTS.push([px + h * 0.2, py - h * 0.9, h, r()]);   // a phone light
    }
  }
}
// giant silver sugar tongs from the top of the frame: hinge h, the claws at cx +- spread, y
function wdTongs(c, h, cx, y, spread, s = 1) {
  for (const sd of [-1, 1]) {
    const tip = [cx + sd * spread, y];
    const mid = [h[0] + sd * (spread * 1.1 + 60), h[1] + (y - h[1]) * 0.55];
    c.beginPath(); c.moveTo(h[0], h[1]); c.quadraticCurveTo(mid[0], mid[1], tip[0], tip[1]);
    c.lineWidth = 74 * s; c.lineCap = 'round'; c.strokeStyle = '#7E8A9C'; c.stroke();
    c.lineWidth = 44 * s; c.strokeStyle = '#E2E9F2'; c.stroke();
    ellipse(c, tip[0] - sd * 14 * s, tip[1], 34 * s, 46 * s, '#C3CCD8');
    ellipse(c, tip[0] - sd * 20 * s, tip[1] - 8 * s, 14 * s, 22 * s, '#F4F8FC');
  }
}
// the whole shot. o = {count (0..1 the counter), tongs (0..1 down), pinch (0..1 closing), sq (0..1 the crowd squeezed),
// formed (0..1 the cube), push, shake}
function wdDraw(t, o) {
  screenSpace();
  ctx.save();
  const k = o.push || 1, P = WD.pinch;
  ctx.translate(540 + (o.dx || 0), 980 + (o.dy || 0)); ctx.scale(k, k); ctx.translate(-540, -980);
  gctx.save(); gctx.translate(540 + (o.dx || 0), 980 + (o.dy || 0)); gctx.scale(k, k); gctx.translate(-540, -980);
  ctx.drawImage(WD_SKY, 0, 0);
  // the atmosphere's glow along the curve
  ctx.beginPath(); for (let x2 = -60; x2 <= W + 60; x2 += 30) { const y2 = wdLimbY(x2); x2 === -60 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2); }
  ctx.lineWidth = 30; ctx.strokeStyle = 'rgba(127,233,255,0.35)'; ctx.stroke();
  for (let x2 = 0; x2 <= W; x2 += 90) softDot(gctx, x2, wdLimbY(x2) - 6, 120, '#7FE9FF', 0.35);
  // the ground of the planet (stays when everyone has gone)
  ctx.beginPath(); ctx.moveTo(-60, H + 60); for (let x2 = -60; x2 <= W + 60; x2 += 30) ctx.lineTo(x2, wdLimbY(x2)); ctx.lineTo(W + 60, H + 60); ctx.closePath();
  const gg = ctx.createLinearGradient(0, WD.horizon, 0, H); gg.addColorStop(0, '#1C3A5A'); gg.addColorStop(1, '#0E2238');
  ctx.fillStyle = gg; ctx.fill();
  // the crowd: squeezed toward the pinch point (and streaks of people flying into it)
  const sq = o.sq || 0;
  if (sq < 0.995) {
    const sx = 1 - 0.985 * E.inCubic(sq), sy = 1 - 0.97 * E.inQuad(sq);
    ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(sx, sy); ctx.translate(-P[0], -P[1]);
    ctx.drawImage(WD_CROWD, 0, 0);
    ctx.restore();
    // phone lights twinkle (glow layer)
    for (const [gx, gy, gh, ph] of WD_GLINTS) {
      const tw = 0.5 + 0.5 * Math.sin(t * loopW(3 + 2 * ph) + ph * 30);
      const qx = P[0] + (gx - P[0]) * sx, qy = P[1] + (gy - P[1]) * sy;
      softDot(gctx, qx, qy, 6 + gh * 0.25, '#FFFFFF', 0.6 * tw * (1 - sq));
    }
  }
  if (sq > 0.02 && sq < 1) {   // streaks: people zipping in
    const r = mulberry32(91);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d0 = 180 + 700 * r(), u = clamp(sq * 1.3 - r() * 0.3);
      if (u <= 0 || u >= 1) continue;
      const d = d0 * (1 - E.inCubic(u)), x0 = P[0] + Math.cos(a) * d, y0 = P[1] + Math.sin(a) * d * 0.55;
      const x1 = P[0] + Math.cos(a) * d * 0.7, y1 = P[1] + Math.sin(a) * d * 0.55 * 0.7;
      line(ctx, x0, y0, x1, y1, 3 + 4 * r(), rgba(WD_SHIRTS[i % WD_SHIRTS.length], 0.8));
    }
    softDot(gctx, P[0], P[1], 120 + 160 * sq, '#FFFFFF', 0.5 * sq);
  }
  // the cube between the claws
  const f = o.formed || 0;
  if (f > 0.01) {
    cfCube(ctx, P[0], P[1] - 4, 2.1 * E.outBack(clamp(f), 2), { glow: 1 });
    softDot(gctx, P[0], P[1], 220, '#BFF0FF', 0.7 * f);
  }
  // the tongs come down, then close
  const td = o.tongs || 0;
  if (td > 0.001) {
    const y = lerp(-900, P[1], E.outCubic(td));
    const spread = lerp(470, 52, E.inOutCubic(o.pinch || 0));
    actor(() => wdTongs(ctx, [540, y - 1250], P[0], y, spread));
  }
  gctx.restore();
  ctx.restore();
}
