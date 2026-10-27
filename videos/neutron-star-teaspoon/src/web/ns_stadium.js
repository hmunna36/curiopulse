// How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 — an atom as an empty stadium at night (screen space under a view).
// The bowl seen from high in the near stands: rows of empty seats (blue, with red sections) rising away from a striped pitch,
// four floodlight towers whose lamp banks glow, light falling on the grass; a pea on the centre spot (the middle of the atom)
// and a tumbleweed rolling across. squeeze q 0..1 folds the whole bowl in onto the pea (the stands crumple and the floodlights
// lean in), leaving it packed with other peas: the stuff in the spoon.
'use strict';

const SD = { cx: 540, cy: 1180, prx: 330, pry: 160 };
// row s (0 = pitch edge, 1 = the rim): an ellipse rising away from us on the far side and dropping toward us on the near side
function sdRow(s, q) {
  const k = 1 - 0.985 * clamp(q);
  return { cx: SD.cx, cy: SD.cy + (-210 * s) * k, rx: (SD.prx + 520 * s) * k, ry: (SD.pry + 390 * s) * k };
}
// the bowl. V = {x, y, s} a view (screen = (p - [V.x, V.y]) * V.s + [540, 960]); o: {q squeeze, lights, t}
function sdDraw(V, t, o = {}) {
  const q = o.q || 0;
  ctx.save(); ctx.translate(540, 960); ctx.scale(V.s, V.s); ctx.translate(-V.x, -V.y);
  gctx.save(); gctx.setTransform(0.5, 0, 0, 0.5, 0, 0); gctx.translate(540, 960); gctx.scale(V.s, V.s); gctx.translate(-V.x, -V.y);
  const crum = (a, s) => 1 + q * 0.18 * Math.sin(a * 7 + s * 11) * Math.sin(a * 3 - s * 5);
  // the night sky above the far rim
  const rows = 26;
  const seat = (i, a) => {
    const sec = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 24);
    const tier = i < rows * 0.45 ? 0 : 1;                          // lower and upper tier: two shades
    return (sec === 17 || sec === 18) ? (i % 2 ? '#A8303E' : '#BC3C48') : tier ? (i % 2 ? '#1E3578' : '#243E88') : (i % 2 ? '#2A4C9E' : '#3256AE');
  };
  const band = (i, a0, a1) => {
    const s0 = i / rows, s1 = (i + 1) / rows, R0 = sdRow(s0, q), R1 = sdRow(s1, q);
    const n = 48;
    for (let j = 0; j < n; j++) {
      const u0 = a0 + (a1 - a0) * j / n, u1 = a0 + (a1 - a0) * (j + 1) / n, um = (u0 + u1) / 2;
      const P = (R, u, s) => [R.cx + R.rx * Math.cos(u) * crum(u, s), R.cy + R.ry * Math.sin(u) * crum(u, s)];
      const a = P(R0, u0, s0), b = P(R0, u1, s0), c = P(R1, u1, s1), d = P(R1, u0, s1);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
      ctx.fillStyle = (j % 6 === 5) ? '#5A5E78' : (i === Math.round(rows * 0.45) ? '#141832' : seat(i, um)); ctx.fill();
      // the seat backs: a thin lighter line along each row
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  };
  // far half (behind the pitch): outer rows first
  for (let i = rows - 1; i >= 0; i--) band(i, Math.PI, Math.PI * 2);
  // the rim: a dark roof edge with a band of light under it
  {
    const R = sdRow(1, q);
    ctx.lineWidth = 26 * (1 - q * 0.9); ctx.strokeStyle = '#0C1026';
    ctx.beginPath(); ctx.ellipse(R.cx, R.cy, R.rx, R.ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
  }
  // the pitch: stripes, lines, the centre spot
  const P0 = sdRow(0, q);
  ctx.save(); ctx.beginPath(); ctx.ellipse(P0.cx, P0.cy, P0.rx, P0.ry, 0, 0, 7); ctx.clip();
  ctx.fillStyle = '#2E7A3A'; ctx.fillRect(P0.cx - P0.rx, P0.cy - P0.ry, P0.rx * 2, P0.ry * 2);
  ctx.fillStyle = '#358A42';
  for (let k = -8; k <= 8; k += 2) ctx.fillRect(P0.cx + k * P0.rx / 8, P0.cy - P0.ry, P0.rx / 8, P0.ry * 2);
  paint(() => {
    ctx.strokeStyle = 'rgba(240,250,240,0.85)'; ctx.lineWidth = 4 * (1 - 0.8 * q);
    ctx.beginPath(); ctx.ellipse(P0.cx, P0.cy, P0.rx * 0.9, P0.ry * 0.86, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(P0.cx, P0.cy - P0.ry * 0.86); ctx.lineTo(P0.cx, P0.cy + P0.ry * 0.86); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(P0.cx, P0.cy, P0.rx * 0.2, P0.ry * 0.2, 0, 0, 7); ctx.stroke();
  });
  // the floodlights' pools on the grass
  ctx.globalCompositeOperation = 'lighter';
  for (const s of [-1, 1]) { const g = ctx.createRadialGradient(P0.cx + s * P0.rx * 0.45, P0.cy, 0, P0.cx + s * P0.rx * 0.45, P0.cy, P0.rx * 0.8); g.addColorStop(0, 'rgba(120,140,110,0.35)'); g.addColorStop(1, 'rgba(120,140,110,0)'); ctx.fillStyle = g; ctx.fillRect(P0.cx - P0.rx, P0.cy - P0.ry, P0.rx * 2, P0.ry * 2); }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  if (o.under) o.under();
  // near half (in front of the pitch): inner rows first
  for (let i = 0; i < rows; i++) band(i, 0, Math.PI);
  // floodlight towers on the far rim, leaning in as it folds
  const Rr = sdRow(1, q);
  for (const a of [Math.PI * 1.18, Math.PI * 1.4, Math.PI * 1.6, Math.PI * 1.82]) {
    const bx = Rr.cx + Rr.rx * Math.cos(a), by = Rr.cy + Rr.ry * Math.sin(a);
    const lean = q * 1.2 * (Math.cos(a) > 0 ? -1 : 1);
    const L = 240 * (1 - 0.9 * q), tx = bx + Math.sin(lean) * L, ty = by - Math.cos(lean) * L;
    line(ctx, bx, by, tx, ty, 10 * (1 - 0.8 * q), '#1A1E34');
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(lean);
    const lw = 90 * (1 - 0.9 * q), lh = 46 * (1 - 0.9 * q);
    rrect(ctx, -lw / 2, -lh / 2, lw, lh, 6); ctx.fillStyle = '#20253E'; ctx.fill();
    const on = o.lights === undefined ? 1 : o.lights;
    paint(() => { for (let r = 0; r < 2; r++) for (let cc = 0; cc < 4; cc++) circle(ctx, -lw / 2 + lw * (cc + 0.5) / 4, -lh / 4 + r * lh / 2, lh * 0.18, on > 0.5 ? '#FFFBEA' : '#555'); });
    ctx.restore();
    if (on > 0.02) { softDot(gctx, tx, ty, 110 * (1 - 0.8 * q), '#FFF4D6', 0.75 * on * (1 - q)); softDot(gctx, tx, ty, 34 * (1 - 0.8 * q), '#FFFFFF', 0.9 * on * (1 - q)); }
  }
  ctx.restore(); gctx.restore();
}
// screen position of a point of the bowl under the view
function sdPt(V, x, y) { return [540 + (x - V.x) * V.s, 960 + (y - V.y) * V.s]; }
// the pea on the centre spot (screen), r = its radius (px)
function sdPea(x, y, r, t, glow = 0.4) {
  softDot(gctx, x, y, r * 3, '#B8FF9A', glow);
  ctx.fillStyle = '#5DBF4A'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#9BE07C'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, 7); ctx.fill();
}
// a tumbleweed (screen), rolling: rot
function sdTumble(x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = '#B08A5A'; ctx.lineWidth = Math.max(1.5, r * 0.09); ctx.lineCap = 'round';
  const rng = mulberry32(6);
  for (let i = 0; i < 16; i++) {
    const a0 = rng() * 6.28, a1 = a0 + 1 + rng() * 2.5, rr = r * (0.55 + 0.45 * rng());
    ctx.beginPath(); ctx.arc((rng() - 0.5) * r * 0.3, (rng() - 0.5) * r * 0.3, rr, a0, a1); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.8, r * 0.18, 0, 0, 7); ctx.fill();
}
// the packed peas: a disc of tightly packed glowing balls (screen), what is left when the empty space is crushed out
function sdPacked(x, y, R, r, t, a = 1) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fillStyle = '#3E7FBC'; ctx.fill();
  ctx.save(); ctx.clip();
  const dy = r * 1.732;
  for (let j = -Math.ceil(R / dy) - 1; j <= Math.ceil(R / dy) + 1; j++) {
    for (let i = -Math.ceil(R / (2 * r)) - 1; i <= Math.ceil(R / (2 * r)) + 1; i++) {
      const px = x + i * 2 * r + (j % 2 ? r : 0), py = y + j * dy;
      const d = Math.hypot(px - x, py - y); if (d > R + r) continue;
      const sh = 0.8 + 0.2 * Math.sin(px * 0.13 + py * 0.07 + t * 3);
      ctx.fillStyle = `rgb(${Math.round(120 * sh)},${Math.round(190 * sh)},${Math.round(240 * sh)})`; ctx.beginPath(); ctx.arc(px, py, r * 0.92, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(235,250,255,0.9)'; ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.3, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
  ctx.restore();
  softDot(gctx, x, y, R * 1.6, '#9FDCFF', 0.14 * a);
}
