// Spicy-food Short: inside his mouth. Two views of the same idea, "a heat sensor is a fire alarm":
// 1. the cave (caveScene): the mouth from inside, the tongue as the floor, and one big red HEAT ALARM on a post, which the
//    chilli (chilliGuy, stall.js) walks up to and pulls;
// 2. the tongue in section (tongueScene): three small alarms sunk into the surface, each on the end of a nerve. Real heat
//    (a spoon of scalding soup) drives their gauges into the red and sets them off; the chilli's molecule, drawn as a
//    key (capKey), slides into the keyway on top and turns: the same alarm, with the gauge still cold.
// World coords: 1080x1920 at zoom 1, drawn under the camera into ctx and gctx. Nothing here is timed.
'use strict';

const MO = { surfY: 800, bs: 0.8, boxes: [[230, 925], [540, 925], [850, 925]], keyX: 46 };
let MO_NERVES = [], MO_TRUNK = null, MO_SPOTS = [];

// sample the smoothPath() curve (quadratics through the mid-points) into a dense polyline, so beads can ride it
function moDense(P, n = 10) {
  const out = [P[0]];
  let cur = P[0];
  for (let i = 1; i < P.length - 1; i++) {
    const m = [(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2];
    for (let k = 1; k <= n; k++) { const u = k / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; out.push([a * cur[0] + b * P[i][0] + d * m[0], a * cur[1] + b * P[i][1] + d * m[1]]); }
    cur = m;
  }
  out.push(P[P.length - 1]);
  return out;
}
function initMouth() {
  const s = MO.bs;
  MO_NERVES = MO.boxes.map(([bx, by], i) => {
    const P = [[bx, by + 138 * s], [bx + (i - 1) * 6 + 16, by + 220], [bx - 26 + (1 - i) * 30, by + 330], [540 + (i - 1) * 150, by + 470], [540 + (i - 1) * 36, by + 620], [540 + (i - 1) * 12, by + 760]];
    const d = moDense(P, 12);
    return { pts: d, acc: polyLen(d) };
  });
  const T = moDense([[540, 1660], [546, 1800], [530, 1960], [540, 2200]], 10);
  MO_TRUNK = { pts: T, acc: polyLen(T) };
  const rng = mulberry32(31);
  MO_SPOTS = [...Array(70)].map(() => [rng() * 1500 - 210, 860 + rng() * 1100, 5 + rng() * 15, rng()]);
}

// ---------------------------------------------------------------- the heat alarm
// (x, y) = the box's centre; it is 190 x 280 at s = 1. o: {gauge 0..1 (cold .. hot), pulled 0..1 (the handle is down),
// ring 0..1 (it is going off), post (length of the post under it), bell (default true), text (default true), dim 0..1}
function heatAlarm(x, y, s, t, o = {}) {
  const ring = o.ring || 0, gauge = clamp(o.gauge || 0), pulled = clamp(o.pulled || 0);
  const jx = ring * 3.5 * Math.sin(t * 74), strobe = ring * (0.5 + 0.5 * Math.sin(t * 24));
  const c = ctx;
  c.save(); c.translate(x + jx * s, y); c.scale(s, s);
  if (o.post) {
    const g = c.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#C9D2E4'); g.addColorStop(1, '#5E6884');
    c.fillStyle = g; c.fillRect(-14, 136, 28, o.post);
    ellipse(c, 0, 138 + o.post, 58, 15, '#5E6884'); ellipse(c, 0, 134 + o.post, 52, 12, '#AEB9CE');
  }
  if (o.bell !== false) {                 // the bell on its left side, and its hammer
    const bx = -134 + ring * 4 * Math.sin(t * 61), by = -52;
    line(c, -96, -52, -118, -52, 12, '#5E6884');
    const bg = c.createRadialGradient(bx - 12, by - 12, 4, bx, by, 40); bg.addColorStop(0, '#FFF1B8'); bg.addColorStop(0.5, '#F2B93A'); bg.addColorStop(1, '#A66A10');
    circle(c, bx, by, 38, '#6A4208'); c.fillStyle = bg; c.beginPath(); c.arc(bx, by, 34, 0, 7); c.fill(); circle(c, bx, by, 8, '#6A4208');
    const ha = 0.5 + ring * 0.5 * Math.sin(t * 61);
    line(c, -100, -6, -100 - 26 * Math.cos(ha), -6 - 30 * Math.sin(ha), 6, '#5E6884'); circle(c, -100 - 26 * Math.cos(ha), -6 - 30 * Math.sin(ha), 8, '#C9D2E4');
    if (ring > 0.05) for (let i = 0; i < 3; i++) {
      const p = (t * 3.2 + i / 3) % 1;
      c.beginPath(); c.arc(bx, by, 50 + 62 * p, Math.PI * 0.72, Math.PI * 1.28); c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = `rgba(255,236,170,${0.9 * (1 - p) * ring})`; c.stroke();
    }
  }
  // the lamp on top (left) and the keyway (right of centre)
  rrect(c, -88, -148, 72, 14, 5); c.fillStyle = '#5E6884'; c.fill();
  c.beginPath(); c.arc(-52, -146, 30, Math.PI, 0); c.closePath();
  const lg = c.createRadialGradient(-60, -160, 3, -52, -150, 34); lg.addColorStop(0, strobe > 0.5 ? '#FFFFFF' : '#FFB4A8'); lg.addColorStop(1, strobe > 0.5 ? '#FFD23E' : '#C81E22');
  c.fillStyle = lg; c.fill(); c.lineWidth = 3; c.strokeStyle = '#5A0A14'; c.stroke();
  rrect(c, MO.keyX - 34, -152, 68, 18, 6); c.fillStyle = '#E0B85A'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#6A4208'; c.stroke();
  rrect(c, MO.keyX - 9, -152, 18, 12, 3); c.fillStyle = '#2A1606'; c.fill();
  // the box
  rrect(c, -95, -140, 190, 280, 24);
  const g = c.createLinearGradient(-95, -140, 95, 140); g.addColorStop(0, '#FF5A54'); g.addColorStop(0.4, '#E2232F'); g.addColorStop(1, '#A01222');
  c.fillStyle = g; c.fill(); c.lineWidth = 7; c.strokeStyle = '#5A0A14'; c.stroke();
  rrect(c, -85, -130, 170, 260, 17); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.2)'; c.stroke();
  if (o.text !== false) { c.font = '400 25px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#FFF3DC'; c.fillText('HEAT  ALARM', 0, -113); }
  // the gauge: blue = cold, red = hot
  const gy = -42;
  circle(c, 0, gy, 56, '#3A0A12'); circle(c, 0, gy, 50, '#FFF3DC');
  c.lineWidth = 12; c.lineCap = 'butt';
  for (const [a0, a1, col] of [[1.0, 1.36, '#3F9BFF'], [1.36, 1.68, '#FFD447'], [1.68, 2.0, '#FF3A2A']]) { c.beginPath(); c.arc(0, gy + 8, 34, Math.PI * a0, Math.PI * a1); c.strokeStyle = col; c.stroke(); }
  const na = Math.PI * lerp(1.12, 1.9, gauge) + 0.05 * Math.sin(t * 19) * (0.3 + gauge);
  line(c, 0, gy + 8, Math.cos(na) * 36, gy + 8 + Math.sin(na) * 36, 6, '#22060C'); circle(c, 0, gy + 8, 8, '#22060C');
  c.font = '900 15px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#7A6A58'; c.fillText('°C', 0, gy + 30);
  // the handle in its slot
  rrect(c, -58, 26, 116, 96, 14); c.fillStyle = '#6A0C18'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3A060C'; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(-12, 100); c.lineTo(12, 100); c.lineTo(0, 114); c.closePath(); c.fill();
  const hy = 34 + 52 * E.outBack(pulled, 1.4);
  line(c, 0, 34, 0, hy + 8, 10, '#C9C4B6');
  rrect(c, -46, hy, 92, 26, 11); const hg = c.createLinearGradient(0, hy, 0, hy + 26); hg.addColorStop(0, '#FFFFFF'); hg.addColorStop(1, '#CFC8B8'); c.fillStyle = hg; c.fill(); c.lineWidth = 3; c.strokeStyle = '#6A6456'; c.stroke();
  if (o.text !== false) { c.font = '400 19px Anton'; c.fillStyle = '#C2182B'; c.fillText('PULL', 0, hy + 14); }
  if (o.dim) { rrect(c, -95, -140, 190, 280, 24); c.fillStyle = `rgba(30,6,30,${0.45 * o.dim})`; c.fill(); }
  c.restore();
  if (ring > 0.02) {
    softDot(gctx, x - 52 * s, y - 152 * s, 130 * s, strobe > 0.5 ? '#FFD23E' : '#FF3A2A', (0.4 + 0.4 * strobe) * ring);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; softDot(ctx, x - 52 * s, y - 152 * s, 380 * s, '#FF3A2A', 0.16 * strobe * ring); ctx.restore();
  }
}

// ---------------------------------------------------------------- the chilli's molecule, as a key
// Origin = the tip of the blade; the blade runs up for 84 units to the bow: a six-sided ring with two side groups (the
// real molecule has that ring at one end and a long zig-zag tail). turn 0..1 = turned in the lock (the bow goes edge-on).
function capKey(x, y, s, rot, t, o = {}) {
  const turn = clamp(o.turn || 0), sx = Math.max(0.4, Math.cos(turn * Math.PI * 0.37));   // turned: the bow is seen at an angle, still a ring
  const zig = [[0, 0], [8, -14], [-8, -28], [8, -42], [-8, -56], [0, -70], [0, -86]];
  for (const c of [ctx, gctx]) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    if (c === gctx) { c.globalAlpha = 0.5 * (o.glow === undefined ? 1 : o.glow); poly(c, zig, 18, '#FF7A1E'); c.translate(0, -122); c.scale(sx, 1); c.beginPath(); c.arc(0, 0, 40, 0, 7); c.lineWidth = 20; c.strokeStyle = '#FF7A1E'; c.stroke(); c.restore(); continue; }
    poly(c, zig, 15, '#7A2A06'); poly(c, zig, 9, '#FF8A1E'); poly(c, zig, 3.5, '#FFE08A');
    for (const [tx, ty] of [[8, -14], [8, -42]]) { line(c, tx, ty, tx + 15, ty, 11, '#7A2A06'); line(c, tx, ty, tx + 14, ty, 6, '#FF8A1E'); }
    c.translate(0, -122); c.scale(sx, 1);
    const hex = [...Array(6)].map((_, i) => [Math.sin(i * Math.PI / 3) * 38, -Math.cos(i * Math.PI / 3) * 38]);
    for (const [vi, col] of [[5, '#FFFFFF'], [1, '#FFD447']]) {         // the two side groups, up left and up right
      const v = hex[vi], e = [v[0] * 1.62, v[1] * 1.62];
      line(c, v[0], v[1], e[0], e[1], 12, '#7A2A06'); line(c, v[0], v[1], e[0], e[1], 6, '#FF8A1E');
      circle(c, e[0], e[1], 14, '#7A2A06'); circle(c, e[0], e[1], 10, col);
    }
    poly(c, hex, 17, '#7A2A06', true); poly(c, hex, 10, '#FF8A1E', true); poly(c, hex, 3.5, '#FFE08A', true);
    c.beginPath(); c.arc(0, 0, 19, 0, 7); c.lineWidth = 4; c.strokeStyle = 'rgba(122,42,6,0.7)'; c.stroke();
    c.restore();
  }
}

// ---------------------------------------------------------------- a spoon of scalding soup
function soupSpoon(x, y, s, rot, t, heat = 1) {
  const c = ctx;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const hg = c.createLinearGradient(0, -40, 0, 20); hg.addColorStop(0, '#F2F5FB'); hg.addColorStop(1, '#7C8BA8');
  c.lineCap = 'round'; c.lineWidth = 34; c.strokeStyle = '#5E6884'; c.beginPath(); c.moveTo(126, -8); c.quadraticCurveTo(330, -40, 640, -250); c.stroke();
  c.lineWidth = 24; c.strokeStyle = hg; c.stroke();
  c.beginPath(); c.ellipse(0, 0, 160, 60, 0, 0, 7); const bg = c.createLinearGradient(0, -60, 0, 60); bg.addColorStop(0, '#F2F5FB'); bg.addColorStop(1, '#6E7C98'); c.fillStyle = bg; c.fill();
  c.lineWidth = 5; c.strokeStyle = '#4A546E'; c.stroke();
  c.beginPath(); c.ellipse(0, -8, 140, 44, 0, 0, 7); const sg = c.createRadialGradient(-40, -22, 6, 0, -8, 150); sg.addColorStop(0, '#FFE08A'); sg.addColorStop(0.5, '#FF9A2E'); sg.addColorStop(1, '#E0560C'); c.fillStyle = sg; c.fill();
  for (let i = 0; i < 6; i++) { const p = (t * 1.3 + i / 6) % 1; c.beginPath(); c.arc(-90 + i * 36 + 8 * Math.sin(i * 3), -8 + 14 * Math.sin(i * 2.2), 4 + 9 * p, 0, 7); c.lineWidth = 3; c.strokeStyle = `rgba(255,240,190,${0.8 * (1 - p)})`; c.stroke(); }
  ellipse(c, -60, -22, 34, 8, 'rgba(255,255,255,0.35)', -0.1);
  c.restore();
  softDot(gctx, x, y - 6 * s, 210 * s, '#FF8A1E', 0.55 * heat);
  for (let i = 0; i < 4; i++) smokeCurl(x - 90 * s + i * 60 * s, y - 40 * s, ((t * 0.55 + i * 0.27) % 1), t, i + 1, '#FFEBD2');
}
// heat coming down from the spoon to the tongue: wavy red-orange rays with arrowheads (k = strength)
function heatRays(x, y0, y1, w, t, k) {
  if (k <= 0.01) return;
  for (const c of [ctx, gctx]) for (let i = 0; i < 6; i++) {
    const px = x - w / 2 + (i + 0.5) * (w / 6), ph = i * 1.3 - t * 9;
    c.beginPath();
    for (let j = 0; j <= 16; j++) { const u = j / 16, yy = lerp(y0, y1 - 26, u), xx = px + 13 * Math.sin(u * 9 + ph); j ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.lineWidth = c === gctx ? 16 : 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = rgba(i % 2 ? '#FF7A1E' : '#FFB01E', (c === gctx ? 0.4 : 0.9) * k); c.stroke();
    const ax = px + 13 * Math.sin(9 + ph), ay = y1 - 26 + 10 * Math.sin(t * 12 + i);
    c.fillStyle = rgba(i % 2 ? '#FF7A1E' : '#FFB01E', (c === gctx ? 0.4 : 0.95) * k); c.beginPath(); c.moveTo(ax - 17, ay - 4); c.lineTo(ax + 17, ay - 4); c.lineTo(ax, ay + 22); c.closePath(); c.fill();
  }
}

// ---------------------------------------------------------------- the tongue in section
function moSurf(x) {
  let pit = 0;
  for (const [bx] of MO.boxes) pit = Math.max(pit, clamp(1.25 - Math.abs(x - bx) / 96));
  pit = smooth(clamp(pit));
  return MO.surfY - 28 * Math.abs(Math.sin(Math.PI * (x + 40) / 94)) * (1 - pit) + 10 * pit;
}
function moNerve(i, t, o = {}) {
  const N = MO_NERVES[i], lit = o.lit || 0;
  poly(ctx, N.pts, 22, '#8A4A08'); poly(ctx, N.pts, 15, mixHex('#E89A22', '#FFC44A', lit)); poly(ctx, N.pts, 5, '#FFE9A8');
  poly(gctx, N.pts, 20, rgba('#FF9A2E', 0.12 + 0.3 * lit));
}
// beads of signal that left box i at time t0 and run down its nerve, then down the trunk
function moPulses(i, t, t0, n = 5, gap = 0.16, speed = 1250) {
  if (t < t0) return;
  const N = MO_NERVES[i], L = N.acc[N.acc.length - 1], LT = MO_TRUNK.acc[MO_TRUNK.acc.length - 1];
  for (let k = 0; k < n; k++) {
    const d = (t - t0 - k * gap) * speed;
    if (d < 0 || d > L + LT) continue;
    const p = d <= L ? polyAt(N.pts, N.acc, d) : polyAt(MO_TRUNK.pts, MO_TRUNK.acc, d - L);
    circle(ctx, p[0], p[1], 13, '#FFF6C8'); circle(ctx, p[0], p[1], 8, '#FFFFFF');
    softDot(gctx, p[0], p[1], 64, '#FFC44A', 0.95);
  }
}
// o: {heat 0..1 (the surface glows), cool 0..1 (a blue wash: nothing is hot), alarms: [{gauge, pulled, ring}, x3], keys: fn drawn between the tissue and the boxes}
function tongueScene(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx;
  // the mouth above the tongue: dark and wet, the palate and the upper teeth far above
  let g = c.createLinearGradient(0, -400, 0, 860); g.addColorStop(0, '#1E0510'); g.addColorStop(0.55, '#4A0F22'); g.addColorStop(1, '#75203A');
  c.fillStyle = g; c.fillRect(-900, -900, 2900, 1800);
  for (let i = 0; i < 14; i++) {         // a little wet shine in the dark
    const px = 60 + hash(i * 2.3) * 960, py = 180 + hash(i * 4.7) * 520, a = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 2.1);
    softDot(c, px, py, 26 + 30 * hash(i), '#FF8AA6', 0.05 + 0.05 * a);
  }
  // the tongue
  const path = () => { c.beginPath(); c.moveTo(-900, 2900); for (let x = -900; x <= 1980; x += 12) c.lineTo(x, moSurf(x)); c.lineTo(1980, 2900); c.closePath(); };
  path();
  g = c.createLinearGradient(0, MO.surfY - 30, 0, 2000); g.addColorStop(0, '#FFB1C0'); g.addColorStop(0.05, '#F58AA2'); g.addColorStop(0.3, '#D55A7C'); g.addColorStop(0.7, '#A0345A'); g.addColorStop(1, '#6A1C3E');
  c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  for (const [sx, sy, r, ph] of MO_SPOTS) ellipse(c, sx, sy, r * 2.2, r, `rgba(255,190,205,${0.05 + 0.05 * ph})`, 0.3);
  for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-300 + i * 210, 2000); c.quadraticCurveTo(-200 + i * 210, 1300, -330 + i * 210 + 80 * Math.sin(i), 880); c.lineWidth = 46; c.strokeStyle = 'rgba(120,30,70,0.07)'; c.stroke(); }
  if (o.heat > 0.01) { const hg = c.createLinearGradient(0, MO.surfY - 40, 0, MO.surfY + 230); hg.addColorStop(0, rgba('#FF8A1E', 0.6 * o.heat)); hg.addColorStop(1, rgba('#FF8A1E', 0)); c.fillStyle = hg; c.fillRect(-900, MO.surfY - 60, 2900, 320); }
  c.restore();
  c.beginPath(); for (let x = -900; x <= 1980; x += 12) { const y = moSurf(x); x === -900 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#FFD3DC'; c.stroke();
  if (o.heat > 0.01) { c.lineWidth = 14; c.strokeStyle = rgba('#FFB01E', 0.8 * o.heat); c.stroke(); gctx.beginPath(); for (let x = 60; x <= 1020; x += 24) { const y = moSurf(x); x === 60 ? gctx.moveTo(x, y) : gctx.lineTo(x, y); } gctx.lineWidth = 34; gctx.strokeStyle = rgba('#FF7A1E', 0.5 * o.heat); gctx.stroke(); }
  // the nerves, then whatever slides into the boxes, then the boxes on top
  const al = o.alarms || [];
  MO.boxes.forEach((b, i) => moNerve(i, t, { lit: (al[i] && al[i].ring) || 0 }));
  poly(c, MO_TRUNK.pts, 34, '#8A4A08'); poly(c, MO_TRUNK.pts, 24, '#E89A22'); poly(c, MO_TRUNK.pts, 8, '#FFE9A8');
  if (o.pulses) o.pulses();
  if (o.keys) o.keys();
  MO.boxes.forEach(([bx, by], i) => heatAlarm(bx, by, MO.bs, t, Object.assign({ bell: false, text: false }, al[i] || {})));
  if (o.cool > 0.01) { screenSpace(); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = rgba('#8FB8FF', 0.3 * o.cool); c.fillRect(0, 0, W, H); c.restore(); applyCam(cam); }
}

// ---------------------------------------------------------------- the cave: his mouth from inside
const caveTongueY = (x) => 1016 + 250 * Math.pow((x - 540) / 640, 2);
// o: {red 0..1 (the alarm's light washes the place), shake (the uvula and the tongue quiver)}
function caveBack(cam, t, o = {}) {
  applyCam(cam);
  const c = ctx, red = o.red || 0, q = o.shake || 0;
  let g = c.createRadialGradient(540, 760, 60, 540, 800, 1100); g.addColorStop(0, '#9A2238'); g.addColorStop(0.5, '#5A1024'); g.addColorStop(1, '#1E050E');
  c.fillStyle = g; c.fillRect(-600, -500, 2300, 2900);
  for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(540, 760, 300 + i * 120, 330 + i * 130, 0, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 22; c.strokeStyle = `rgba(255,150,170,${0.07 - i * 0.012})`; c.stroke(); }
  // the throat and the uvula
  c.beginPath(); c.ellipse(540, 720, 178, 232, 0, 0, 7); g = c.createRadialGradient(540, 760, 30, 540, 720, 240); g.addColorStop(0, '#0A0206'); g.addColorStop(1, '#2A0812'); c.fillStyle = g; c.fill();
  c.lineWidth = 16; c.strokeStyle = 'rgba(210,80,110,0.5)'; c.stroke();
  c.save(); c.translate(540, 478); c.rotate(0.07 * Math.sin(t * 2.3) + q * 0.22 * Math.sin(t * 41));
  c.beginPath(); c.moveTo(-34, 0); c.bezierCurveTo(-30, 80, -46, 120, -30, 160); c.bezierCurveTo(-16, 196, 16, 196, 30, 160); c.bezierCurveTo(46, 120, 30, 80, 34, 0); c.closePath();
  g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#F27A94'); g.addColorStop(1, '#B83A5A'); c.fillStyle = g; c.fill();
  ellipse(c, -12, 132, 9, 20, 'rgba(255,220,228,0.4)');
  c.restore();
  // the upper teeth
  for (let i = 0; i < 8; i++) {
    const u = (i - 3.5) / 3.5, tx = 540 + u * 520, w = 124 + 20 * Math.abs(u), h = 196 + 40 * Math.abs(u), ty = 150 + 70 * u * u;
    rrect(c, tx - w / 2, ty, w, h, 38); g = c.createLinearGradient(0, ty, 0, ty + h); g.addColorStop(0, '#B9A898'); g.addColorStop(1, '#FFF6E6'); c.fillStyle = g; c.fill();
    c.lineWidth = 4; c.strokeStyle = 'rgba(120,90,80,0.45)'; c.stroke();
  }
  c.fillStyle = '#C24A66'; c.fillRect(-600, -500, 2300, 660 + 0); c.beginPath(); c.moveTo(-600, 160); c.quadraticCurveTo(540, 260, 1700, 160); c.lineTo(1700, 120); c.lineTo(-600, 120); c.closePath(); c.fill();
  // the tongue: the floor
  const path = () => { c.beginPath(); c.moveTo(-600, 2600); for (let x = -600; x <= 1700; x += 20) c.lineTo(x, caveTongueY(x) + q * 5 * Math.sin(t * 46 + x * 0.02)); c.lineTo(1700, 2600); c.closePath(); };
  path(); g = c.createLinearGradient(0, 1000, 0, 2000); g.addColorStop(0, '#FF9FB2'); g.addColorStop(0.25, '#EE7392'); g.addColorStop(1, '#8E2A50'); c.fillStyle = g; c.fill();
  c.save(); path(); c.clip();
  const rng = mulberry32(8);
  for (let i = 0; i < 90; i++) { const px = -100 + rng() * 1280, py = caveTongueY(px) + 20 + rng() * 800, r = 6 + rng() * 9; ellipse(c, px, py, r * 1.5, r, `rgba(255,205,215,${0.16 + 0.14 * rng()})`); }
  c.beginPath(); c.moveTo(540, 1030); c.quadraticCurveTo(520, 1400, 540, 2000); c.lineWidth = 16; c.strokeStyle = 'rgba(150,40,80,0.28)'; c.stroke();
  c.restore();
  c.beginPath(); for (let x = -600; x <= 1700; x += 20) { const y = caveTongueY(x) + q * 5 * Math.sin(t * 46 + x * 0.02); x === -600 ? c.moveTo(x, y) : c.lineTo(x, y); } c.lineWidth = 8; c.strokeStyle = 'rgba(255,220,228,0.7)'; c.stroke();
  if (red > 0.01) { screenSpace(); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = rgba('#FF2A1E', 0.16 * red); c.fillRect(0, 0, W, H); c.restore(); applyCam(cam); }
}
