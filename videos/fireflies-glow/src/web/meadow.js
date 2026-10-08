// A meadow on a summer night: a sky plate painted once (stars, a moon, a line of trees, mist over the grass), drawn
// sharp or out of focus, far fireflies that blink on their own clocks, grass in layers, one tall blade to cling to
// and one broad leaf to sit in front of.
'use strict';

const MDW = { PAD: 180, MOON: [846, 520], HORIZON: 1190 };
let MDW_BG = null, MDW_SOFT = null, MDW_FAR = null;

function initMeadow() {
  const P = MDW.PAD, w = W + 2 * P, h = H + 2 * P;
  MDW_BG = mkCanvas(w, h);
  const x = MDW_BG.getContext('2d'), rng = mulberry32(7711);
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#030816'); g.addColorStop(0.36, '#081A36'); g.addColorStop(0.60, '#0F3848'); g.addColorStop(0.64, '#0A2A30'); g.addColorStop(1, '#030B10');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // stars
  for (let i = 0; i < 230; i++) {
    const sx = rng() * w, sy = rng() * (MDW.HORIZON + P - 160), r = 0.7 + rng() * 1.9;
    x.fillStyle = `rgba(214,232,255,${0.25 + 0.6 * rng()})`; x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill();
  }
  // the moon and its halo
  const mx = MDW.MOON[0] + P, my = MDW.MOON[1] + P;
  const hg = x.createRadialGradient(mx, my, 20, mx, my, 420); hg.addColorStop(0, 'rgba(190,220,255,0.30)'); hg.addColorStop(1, 'rgba(190,220,255,0)');
  x.fillStyle = hg; x.fillRect(mx - 420, my - 420, 840, 840);
  x.fillStyle = '#EAF2FF'; x.beginPath(); x.arc(mx, my, 64, 0, 7); x.fill();
  x.fillStyle = 'rgba(160,185,225,0.55)'; for (const [dx, dy, r] of [[-20, -14, 13], [18, 10, 17], [-6, 26, 8], [24, -24, 7]]) { x.beginPath(); x.arc(mx + dx, my + dy, r, 0, 7); x.fill(); }
  // mist where the meadow meets the trees
  const hz = MDW.HORIZON + P;
  const mg = x.createLinearGradient(0, hz - 190, 0, hz + 120); mg.addColorStop(0, 'rgba(110,200,190,0)'); mg.addColorStop(0.6, 'rgba(110,200,190,0.16)'); mg.addColorStop(1, 'rgba(110,200,190,0)');
  x.fillStyle = mg; x.fillRect(0, hz - 190, w, 310);
  // a line of trees
  x.fillStyle = '#061820';
  for (let i = 0; i < 46; i++) {
    const tx = (i / 45) * w + (rng() - 0.5) * 40, th = 90 + rng() * 190, tw = 60 + rng() * 80;
    for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(tx + (rng() - 0.5) * tw, hz - th * (0.35 + 0.65 * rng()), tw * (0.34 + 0.3 * rng()), 0, 7); x.fill(); }
    x.fillRect(tx - 7, hz - th * 0.5, 14, th * 0.5 + 20);
  }
  // the meadow itself: darker toward us, with far tufts
  const gg = x.createLinearGradient(0, hz - 10, 0, h); gg.addColorStop(0, '#0B2B2A'); gg.addColorStop(0.3, '#082021'); gg.addColorStop(1, '#030C0F');
  x.fillStyle = gg; x.beginPath(); x.moveTo(0, hz + 8); for (let i = 0; i <= 24; i++) x.lineTo((i / 24) * w, hz + 8 * Math.sin(i * 1.1) - 6); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
  for (let i = 0; i < 420; i++) {
    const u = rng(), bx = rng() * w, by = hz + 6 + u * u * 520, bh = 16 + u * 70 + rng() * 20;
    x.strokeStyle = `rgba(${18 + 14 * rng() | 0},${62 + 30 * rng() | 0},${52 + 20 * rng() | 0},${0.55 + 0.3 * rng()})`; x.lineWidth = 2 + 4 * u; x.lineCap = 'round';
    x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + (rng() - 0.5) * 16, by - bh * 0.6, bx + (rng() - 0.5) * 34, by - bh); x.stroke();
  }
  // the same plate, out of focus (half size: drawn back up, it is softer still)
  MDW_SOFT = mkCanvas(w / 2, h / 2);
  const sx2 = MDW_SOFT.getContext('2d');
  sx2.filter = 'blur(7px)'; sx2.drawImage(MDW_BG, 0, 0, w / 2, h / 2); sx2.filter = 'none';
  // far fireflies: where they hang, and each one's own clock
  const r2 = mulberry32(905);
  MDW_FAR = [...Array(46)].map(() => ({ x: r2() * w, y: P + 470 + r2() * 900, per: 1.7 + r2() * 2.4, ph: r2() * 9, r: 5 + r2() * 9, dx: 14 + r2() * 26, dy: 8 + r2() * 16 }));
}
// the plate behind everything, with a little parallax. o: {soft, far: brightness of the far fireflies (1), glow: how much
// of them goes into the glow layer (0.6), top: only the far ones above this screen y, keep: [x0, x1, y0] a column they
// stay out of (close-ups keep them off his face)}
function mdwBack(cam, t, o = {}) {
  screenSpace();
  const P = MDW.PAD, k = 1 + (cam.zoom - 1) * 0.07, dx = -(cam.x - 540) * 0.22, dy = -(cam.y - 960) * 0.22;
  const ox = W / 2 - (W / 2 + P) * k + dx, oy = H / 2 - (H / 2 + P) * k + dy;
  ctx.drawImage(o.soft ? MDW_SOFT : MDW_BG, ox, oy, (W + 2 * P) * k, (H + 2 * P) * k);
  const far = o.far === undefined ? 1 : o.far;
  if (far <= 0) return;
  // every clock here goes round a whole number of times in the Short, so its last frame runs into its first (the loop)
  const D = window.TL && window.TL.duration > 5 ? window.TL.duration : 0, TAU = Math.PI * 2;
  const whole = (w) => (D ? (TAU * Math.max(1, Math.round((w * D) / TAU))) / D : w);
  for (const f of MDW_FAR) {
    const b = Math.pow(Math.max(0, Math.sin(whole(TAU / f.per) * t + f.ph)), 5) * far;
    if (b < 0.03) continue;
    const px = ox + (f.x + f.dx * Math.sin(whole(0.5) * t + f.ph)) * k, py = oy + (f.y + f.dy * Math.sin(whole(0.37) * t + f.ph * 2)) * k;
    if (o.top !== undefined && py > o.top) continue;
    if (o.keep && px > o.keep[0] && px < o.keep[1] && py > o.keep[2]) continue;      // not across the hero
    const r = f.r * k * (o.soft ? 1.7 : 1);
    softDot(ctx, px, py, r * 2.6, FF.GLOW, (o.soft ? 0.4 : 0.85) * b);
    softDot(gctx, px, py, r * 4, FF.GLOW, (o.glow === undefined ? 0.6 : o.glow) * b);
  }
}
// a band of grass along a base line (screen units). o: {y, n, h: [min, max], w: [min, max], col: [near-black, lighter],
// seed, sway, x0, x1, lean}
function mdwGrass(t, o) {
  const rng = mulberry32(o.seed || 1), n = o.n || 40, x0 = o.x0 === undefined ? -40 : o.x0, x1 = o.x1 === undefined ? W + 40 : o.x1;
  const c = ctx;
  for (let i = 0; i < n; i++) {
    const bx = x0 + (i + rng() * 0.9) / n * (x1 - x0), bh = lerp(o.h[0], o.h[1], rng()), bw = lerp(o.w[0], o.w[1], rng());
    const lean = (rng() - 0.5) * 0.5 + (o.lean || 0), sw = (o.sway === undefined ? 1 : o.sway) * 16 * Math.sin(t * (0.9 + rng() * 0.8) + rng() * 9);
    const tx = bx + lean * bh + sw, ty = o.y - bh, mxp = bx + lean * bh * 0.35 + sw * 0.3, myp = o.y - bh * 0.55;
    c.beginPath(); c.moveTo(bx - bw / 2, o.y + 6); c.quadraticCurveTo(mxp - bw * 0.5, myp, tx, ty); c.quadraticCurveTo(mxp + bw * 0.6, myp, bx + bw / 2, o.y + 6); c.closePath();
    c.fillStyle = mixHex(o.col[0], o.col[1], rng()); c.fill();
  }
  c.fillStyle = o.col[0]; c.fillRect(x0, o.y, x1 - x0, H - o.y + 10);
}
// one tall blade for her to hold on to (screen units): from (x, y0) up to about (x + lean, y1)
function mdwBlade(x, y0, y1, lean, t, w = 34, col = '#1D6A4A') {
  const c = ctx, sw = 7 * Math.sin(t * 1.1 + x);
  c.beginPath(); c.moveTo(x - w / 2, y0); c.quadraticCurveTo(x - w * 0.4 + lean * 0.3, (y0 + y1) / 2, x + lean + sw, y1);
  c.quadraticCurveTo(x + w * 0.7 + lean * 0.4, (y0 + y1) / 2, x + w / 2, y0); c.closePath(); c.fillStyle = col; c.fill();
  paint(() => { c.lineWidth = 3; c.strokeStyle = 'rgba(150,230,170,0.3)'; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + lean * 0.35, (y0 + y1) / 2, x + lean + sw, y1 + 20); c.stroke(); });
  return [x + lean * 0.62 + sw * 0.5, lerp(y0, y1, 0.72)];
}
// a broad leaf, big enough to be a stage (screen units): its stalk comes in from the right edge
function mdwLeaf(cx, cy, rx, ry, t, rot = -0.08) {
  const c = ctx, sw = 0.012 * Math.sin(t * 1.3);
  c.save(); c.translate(cx, cy); c.rotate(rot + sw);
  c.beginPath(); c.moveTo(-rx, 10); c.bezierCurveTo(-rx * 0.6, -ry * 1.15, rx * 0.5, -ry * 1.1, rx, -ry * 0.1); c.bezierCurveTo(rx * 0.6, ry * 0.95, -rx * 0.5, ry * 1.1, -rx, 10); c.closePath();
  c.fillStyle = '#15563C'; c.fill();
  paint(() => {
    c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = 'rgba(120,214,150,0.38)'; c.beginPath(); c.moveTo(-rx + 14, 8); c.quadraticCurveTo(0, -ry * 0.12, rx - 6, -ry * 0.1); c.stroke();
    c.lineWidth = 3.4; c.strokeStyle = 'rgba(120,214,150,0.22)';
    for (let i = 0; i < 6; i++) { const u = -0.7 + i * 0.27, bx = u * rx, by = -ry * 0.06 - 4; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + rx * 0.1, by + sd * ry * 0.4, bx + rx * 0.24, by + sd * ry * (0.72 - 0.3 * Math.abs(u))); c.stroke(); } }
  });
  // the stalk, off to the right
  c.lineCap = 'round'; c.lineWidth = 16; c.strokeStyle = '#124A34'; c.beginPath(); c.moveTo(rx - 8, -ry * 0.1); c.quadraticCurveTo(rx + 160, -ry * 0.3, rx + 420, ry * 0.5); c.stroke();
  c.restore();
}
