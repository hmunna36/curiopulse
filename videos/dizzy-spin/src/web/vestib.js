// The balance organ of the inner ear, in "organ units" (the sac's middle is near the origin, y down): three loops of
// liquid (the semicircular canals) that leave a sac and come back to it, a bulge near one end of each loop with a jelly
// flap in it, the hearing snail (dim: not this story), the nerve to the brain; liquid as beads that ride round the
// loops; a droplet with a face that rides one loop; a chequered finish line. Plus the bulge up close ("amp units":
// the tube runs left to right through the middle): the flap, the hair cells with faces under it, their hairs, the
// nerve fibres and the signal on them. And a round window version for his ear.
'use strict';

const VB_COL = { wall: '#C27BA6', wallDk: '#9A5A86', liquid: '#1B4A8C', bead: '#A8F4FF', glow: '#5FD8FF', sac: '#B9709C', nerve: '#FFC24A', bg0: '#2A1238', bg1: '#08030F' };
let VB = null;
// Catmull-Rom through the points, n samples a segment
function vbDense(P, n = 14) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}
function vbPath(P) { const acc = polyLen(P); return { P, acc, L: acc[acc.length - 1] }; }
function vbAt(path, s) { const L = path.L; s = ((s % L) + L) % L; return polyAt(path.P, path.acc, s); }
function vbDir(path, s) { const a = vbAt(path, s - 3), b = vbAt(path, s + 3); const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; }
function initVestib() {
  const C = [
    [[-30, -20], [-90, -130], [-70, -270], [30, -320], [115, -230], [85, -90], [30, -20]],          // up: nodding
    [[50, 10], [150, -60], [290, -50], [340, 80], [270, 200], [150, 170], [60, 70]],                 // right: tilting
    [[-60, 40], [-150, -30], [-300, -30], [-365, 60], [-300, 150], [-160, 140], [-70, 80]],          // left, flat: shaking
  ].map((P) => vbPath(vbDense(P)));
  const snail = [];
  for (let i = 0; i <= 120; i++) { const a = 0.4 + i * 0.12, r = 78 * Math.exp(-0.085 * i * 0.12 * 4.2); snail.push([-160 + Math.cos(a) * r, 260 + Math.sin(a) * r * 0.86]); }
  VB = { canals: C, amp: C.map((p) => 0.13 * p.L), snail: vbPath(snail), nerve: vbPath(vbDense([[20, 90], [60, 200], [150, 300], [260, 360], [420, 400]])) };
}
// one canal as a tube: wall, liquid, beads. o: {flow (how far the liquid has gone, organ units), n (beads), lit 0..1,
// bend (the flap in its bulge, -1..1), dim}
function vbTube(c, g, path, o) {
  const P = path.P, lit = o.lit || 0, dim = o.dim || 0, ga = o.glowA === undefined ? 1 : o.glowA;
  const stroke = (cc, w, col) => { cc.beginPath(); cc.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) cc.lineTo(P[i][0], P[i][1]); cc.lineWidth = w; cc.lineCap = 'round'; cc.lineJoin = 'round'; cc.strokeStyle = col; cc.stroke(); };
  stroke(c, 46, dim ? mixHex(VB_COL.wall, '#2A1238', dim) : VB_COL.wall);
  // the bulge near the sac end
  const A = vbAt(path, VB.amp[o.i]), dA = vbDir(path, VB.amp[o.i]);
  circle(c, A[0], A[1], 38, VB_COL.wall);
  stroke(c, 28, VB_COL.liquid);
  circle(c, A[0], A[1], 27, VB_COL.liquid);
  if (lit > 0.01) stroke(g, 40, rgba(VB_COL.glow, 0.35 * lit * ga));
  // the flap across the bulge: a pale bar at right angles to the tube, bent by the flow
  const nx = -dA[1], ny = dA[0], b = (o.bend || 0) * 12;
  c.beginPath(); c.moveTo(A[0] - nx * 25, A[1] - ny * 25); c.quadraticCurveTo(A[0] + dA[0] * b, A[1] + dA[1] * b, A[0] + nx * 25 + dA[0] * b * 1.6, A[1] + ny * 25 + dA[1] * b * 1.6);
  c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = '#A8F0DC'; c.stroke();
  // the liquid's beads
  const n = o.n || 16, flow = o.flow || 0;
  for (let i = 0; i < n; i++) {
    const s = (i / n) * path.L + flow, p = vbAt(path, s);
    circle(c, p[0], p[1], 6.5, VB_COL.bead);
    circle(g, p[0], p[1], 15, rgba(VB_COL.glow, (0.55 + 0.3 * lit) * ga));
  }
}
// the whole organ in organ units on ctx and gctx as they are set (vbOn). o: {flow: [3], lit: [3], bend: [3], drop:
// {canal, s, mood, k}, finish: {canal, s, k, flag}, snail (0..1 how visible), nerve: 0..1 signal}
function vbDraw(t, o = {}) {
  const c = ctx, g = gctx;
  // the snail (hearing, not this story: dim)
  const sn = VB.snail.P, sa = o.snail === undefined ? 0.55 : o.snail;
  c.beginPath(); c.moveTo(sn[0][0], sn[0][1]); for (const p of sn) c.lineTo(p[0], p[1]);
  c.lineWidth = 30; c.lineCap = 'round'; c.strokeStyle = mixHex('#2A1238', '#8E5C86', sa); c.stroke();
  // the nerve to the brain
  const nv = VB.nerve.P;
  c.beginPath(); c.moveTo(nv[0][0], nv[0][1]); for (const p of nv) c.lineTo(p[0], p[1]);
  c.lineWidth = 24; c.strokeStyle = '#C9902E'; c.stroke();
  c.lineWidth = 12; c.strokeStyle = VB_COL.nerve; c.stroke();
  if (o.nerve > 0) for (let i = 0; i < 3; i++) { const u = ((t * 1.6 + i / 3) % 1), p = vbAt(VB.nerve, u * VB.nerve.L); circle(c, p[0], p[1], 9, '#FFF6D0'); circle(g, p[0], p[1], 26, rgba('#FFC24A', 0.7 * o.nerve)); }
  for (let i = 0; i < 3; i++) vbTube(c, g, VB.canals[i], { i, flow: (o.flow || [0, 0, 0])[i], lit: (o.lit || [0, 0, 0])[i], bend: (o.bend || [0, 0, 0])[i], n: [18, 18, 20][i], glowA: o.glowA });
  // the sac
  ellipse(c, 0, 30, 96, 74, VB_COL.sac);
  ellipse(c, 4, 34, 76, 56, VB_COL.liquid);
  for (let i = 0; i < 7; i++) { const a = t * 0.8 + i * 0.9; circle(c, 4 + Math.cos(a) * 46, 34 + Math.sin(a * 1.3) * 30, 5, VB_COL.bead); }
  if (o.finish && o.finish.k > 0.01) { c.save(); vbFinish(c, VB.canals[o.finish.canal], o.finish.s, o.finish.k, t, o.finish.flag || 0, o.finish.size || 1); c.restore(); }
  if (o.drop && o.drop.k > 0.01) {
    const pth = VB.canals[o.drop.canal], p = vbAt(pth, o.drop.s), d = vbDir(pth, o.drop.s);
    actor(() => vbDrop(c, g, p[0], p[1], o.drop.size || 1, Math.atan2(d[1], d[0]), o.drop, t));
  }
}
// a chequered band across a tube, and a small flag on a pole beside it
function vbFinish(c, path, s, k, t, flag, sz = 1) {
  const p = vbAt(path, s), d = vbDir(path, s), nx = -d[1], ny = d[0], q = E.outBack(clamp(k), 2);
  const ang = Math.atan2(d[1], d[0]);
  // the band across the tube: two rows of squares, the tube's width
  c.save(); c.translate(p[0], p[1]); c.rotate(ang);
  for (let i = -3; i < 3; i++) for (let j = -1; j < 1; j++) { c.fillStyle = (i + j) % 2 ? '#FFFFFF' : '#14141E'; c.fillRect(j * 9, i * 9 * q, 9, 9 * q); }
  c.restore();
  c.translate(p[0], p[1]); c.scale(sz, sz); c.translate(-p[0], -p[1]);
  const base = [p[0] + nx * 30, p[1] + ny * 30], top = [base[0] + nx * 54 * q, base[1] + ny * 54 * q];
  line(c, base[0], base[1], top[0], top[1], 4, '#E8E8F0');
  const wv = Math.sin(t * 14) * 4 * (0.4 + flag);
  c.save(); c.translate(top[0], top[1]); c.rotate(Math.atan2(ny, nx) + Math.PI / 2);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -6 + wv, 30 * q, 0); c.lineTo(30 * q, 22 * q); c.quadraticCurveTo(14, 16 + wv, 0, 22 * q); c.closePath();
  c.fillStyle = '#FFFFFF'; c.fill();
  paint(() => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) { c.fillStyle = '#14141E'; c.fillRect(i * 10 * q, j * 11 * q, 10 * q, 11 * q); } });
  c.restore();
}
// the droplet that rides the loop: a blue drop pointing back along the way it goes, with a face and arms up.
// o: {mood: 'whee' | 'calm' | 'proud', k (pop), size}
function vbDrop(c, g, x, y, s, ang, o, t) {
  const q = E.outBack(clamp(o.k === undefined ? 1 : o.k), 2) * s * 1.25;
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(q, q);
  // body: round at the front, a tail behind
  c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-14, -20, 6, -20); c.arc(6, 0, 20, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(-14, 20, -40, 0); c.closePath();
  c.fillStyle = '#4FC8FF'; c.fill();
  circle(g, 0, 0, 34, rgba('#5FD8FF', 0.5));
  c.restore();
  // the face stays upright
  c.save(); c.translate(x, y); c.scale(q, q);
  const mood = o.mood || 'whee';
  paint(() => {
    for (const ex of [-5, 9]) { ellipse(c, ex, -5, 4.6, 6, '#FFFFFF'); circle(c, ex + 1.2, -4, 2.6, '#0E1430'); }
    if (mood === 'whee') { ellipse(c, 2, 8, 6, 5.5, '#0E1430'); ellipse(c, 2, 10, 3.6, 2.2, '#FF7A8E'); }
    else if (mood === 'proud') { c.beginPath(); c.moveTo(-4, 6); c.quadraticCurveTo(2, 13, 9, 6); c.lineWidth = 2.6; c.strokeStyle = '#0E1430'; c.stroke(); }
    else { line(c, -2, 8, 7, 8, 2.4, '#0E1430'); }
  });
  // arms up
  for (const sd of [-1, 1]) { line(c, sd * 10, -10, sd * 18, -24 - 3 * Math.sin(t * 16 + sd), 4, '#4FC8FF'); circle(c, sd * 18, -25 - 3 * Math.sin(t * 16 + sd), 3.4, '#4FC8FF'); }
  c.restore();
}
// run fn with ctx and gctx set so that organ unit (0, 0) lands at (V.x, V.y) at V.s per unit; V.cam: (x, y) is a world
// point under that camera, else a screen point
function vbOn(V, fn) {
  for (const [c, sc] of [[ctx, 1], [gctx, 0.5]]) {
    c.save();
    if (V.cam) camTransform(c, V.cam, sc); else c.setTransform(sc, 0, 0, sc, 0, 0);
    c.translate(V.x, V.y); c.scale(V.s, V.s); if (V.rot) c.rotate(V.rot);
  }
  try { fn(); } finally { ctx.restore(); gctx.restore(); }
}
function vbBg(t, a = 1) {
  screenSpace();
  const bg = ctx.createRadialGradient(540, 820, 60, 540, 900, 1300);
  bg.addColorStop(0, '#3A1A4E'); bg.addColorStop(1, VB_COL.bg1);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  motes(t, 0.5 * a);
}
// the round window on his ear (world units, the camera applied by vbOn's V.cam): the organ inside, small
function vbWindow(cam, C, R, S, k, t, o = {}) {
  if (k <= 0.01) return;
  const r = R * E.outBack(clamp(k), 1.6);
  for (const [c, sc] of [[ctx, 1], [gctx, 0.5]]) { c.save(); camTransform(c, cam, sc); }
  // a soft wedge from his ear to the window
  if (o.ear) {
    const e = o.ear, a = Math.atan2(C[1] - e[1], C[0] - e[0]);
    ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(C[0] + Math.cos(a + 1.35) * r, C[1] + Math.sin(a + 1.35) * r); ctx.lineTo(C[0] + Math.cos(a - 1.35) * r, C[1] + Math.sin(a - 1.35) * r); ctx.closePath();
    ctx.fillStyle = 'rgba(160,220,255,0.16)'; ctx.fill();
  }
  circle(ctx, C[0], C[1], r + 7, '#EAF6FF');
  circle(gctx, C[0], C[1], r + 14, rgba('#8FD8FF', 0.16));
  ctx.save(); ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7); ctx.clip();
  gctx.save(); gctx.beginPath(); gctx.arc(C[0], C[1], r, 0, 7); gctx.clip();
  const bg = ctx.createRadialGradient(C[0], C[1], 4, C[0], C[1], r);
  bg.addColorStop(0, '#2A1038'); bg.addColorStop(1, '#0C0414');
  ctx.fillStyle = bg; ctx.fillRect(C[0] - r, C[1] - r, 2 * r, 2 * r);
  gctx.fillStyle = '#000000'; gctx.fillRect(C[0] - r, C[1] - r, 2 * r, 2 * r);
  ctx.translate(C[0], C[1]); ctx.scale(S, S); gctx.translate(C[0], C[1]); gctx.scale(S, S);
  if (o.focus) { ctx.translate(-o.focus[0], -o.focus[1]); gctx.translate(-o.focus[0], -o.focus[1]); }
  vbDraw(t, o);
  ctx.restore(); gctx.restore();
  ctx.restore(); gctx.restore();
}

// ---------------------------------------------------------------- the bulge up close (amp units: the tube along x)
const AMP = { tube: 70, wall: 26, bulgeTop: -170, floor: 210, crista: 112, flapTop: -150, cells: [-124, -62, 0, 62, 124], R: 36 };
function ampOn(V, fn) { vbOn(V, fn); }
// o: {flow: how far the liquid has gone (amp units, + = to the right), bend -1..1, hair (lean), mood per cell or one
// mood ('calm' | 'strain' | 'shout' | 'panic'), shout 0..1, signal 0..1 (beads down the fibres), sweat}
function ampDraw(t, o = {}) {
  const c = ctx, g = gctx, T = AMP.tube, Wl = AMP.wall;
  // the tube's walls and the bulge, as one wall shape, then the liquid inside
  const outline = (grow) => {
    c.beginPath();
    c.moveTo(-1400, -T - grow); c.lineTo(-300, -T - grow);
    c.bezierCurveTo(-240, AMP.bulgeTop - grow, 240, AMP.bulgeTop - grow, 300, -T - grow);
    c.lineTo(1400, -T - grow); c.lineTo(1400, T + grow); c.lineTo(300, T + grow);
    c.bezierCurveTo(250, AMP.floor + grow, -250, AMP.floor + grow, -300, T + grow);
    c.lineTo(-1400, T + grow); c.closePath();
  };
  outline(Wl); c.fillStyle = VB_COL.wall; c.fill();
  outline(0); c.fillStyle = VB_COL.liquid; c.fill();
  // beads of liquid (behind the flap)
  const rng = mulberry32(12), flow = o.flow || 0;
  for (let i = 0; i < 46; i++) {
    const x0 = rng() * 2800 - 1400, y = (rng() * 2 - 1) * (T - 14), x = ((x0 + flow + 1400) % 2800 + 2800) % 2800 - 1400;
    const yy = Math.abs(x) < 300 ? y - 70 * Math.max(0, 1 - Math.abs(x) / 300) * (y < 0 ? 1 : 0.2) : y;
    circle(c, x, yy, 9, VB_COL.bead); circle(g, x, yy, 22, rgba(VB_COL.glow, 0.5));
  }
  // the ridge the cells stand on
  c.beginPath(); c.moveTo(-240, AMP.floor - 6); c.bezierCurveTo(-170, AMP.crista - 30, 170, AMP.crista - 30, 240, AMP.floor - 6); c.closePath();
  c.fillStyle = '#E39CC0'; c.fill();
  // the nerve fibres under it, down to one bundle
  const sig = o.signal || 0;
  for (const x of AMP.cells) {
    c.beginPath(); c.moveTo(x, AMP.crista + 34); c.bezierCurveTo(x, AMP.floor + 60, 0, AMP.floor + 90, 0, AMP.floor + 160);
    c.lineWidth = 9; c.strokeStyle = '#C9902E'; c.stroke();
  }
  rrect(c, -22, AMP.floor + 150, 44, 400, 20); c.fillStyle = VB_COL.nerve; c.fill();
  if (sig > 0.01) for (let i = 0; i < 4; i++) { const u = (t * 1.8 + i / 4) % 1, y = AMP.floor + 160 + u * 380; circle(c, 0, y, 13, '#FFF6D0'); circle(g, 0, y, 34, rgba('#FFC24A', 0.75 * sig)); }
  // the jelly flap: a sail on the ridge, its top bent by the flow
  const bend = o.bend || 0, H0 = AMP.crista - 4, H1 = AMP.flapTop, side = (y, sd) => {
    const h = (H0 - y) / (H0 - H1), off = bend * 120 * Math.pow(h, 1.5);
    return [off + sd * lerp(52, 92, h), y];
  };
  const flap = (cc) => {
    cc.beginPath();
    for (let i = 0; i <= 12; i++) { const p = side(lerp(H0, H1, i / 12), -1); cc[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }
    for (let i = 12; i >= 0; i--) { const p = side(lerp(H0, H1, i / 12), 1); cc.lineTo(p[0], p[1]); }
    cc.closePath();
  };
  flap(g); g.fillStyle = '#000000'; g.fill();          // the jelly hides the glow of the beads behind it
  flap(c); c.fillStyle = '#62C9B0'; c.fill();
  paint(() => { c.lineWidth = 6; c.strokeStyle = '#2E8E78'; c.stroke(); });
  // a sheen inside the jelly
  paint(() => {
    c.beginPath();
    for (let i = 1; i <= 10; i++) { const p = side(lerp(H0, H1, i / 12), -0.55); c[i > 1 ? 'lineTo' : 'moveTo'](p[0], p[1]); }
    c.lineWidth = 9; c.strokeStyle = 'rgba(200,255,240,0.45)'; c.stroke();
  });
  // the hairs, up into the flap
  paint(() => {
    for (const x of AMP.cells) for (let j = -2; j <= 2; j++) {
      const bx = x + j * 6, top = AMP.crista - 150 + Math.abs(j) * 14, lean = bend * 70 * (o.hair === undefined ? 1 : o.hair);
      c.beginPath(); c.moveTo(bx, AMP.crista - 14); c.quadraticCurveTo(bx + lean * 0.2, (AMP.crista + top) / 2, bx + lean, top);
      c.lineWidth = 4.5; c.strokeStyle = '#3E7C6E'; c.stroke();
    }
  });
  // the hair cells, with faces
  AMP.cells.forEach((x, i) => {
    const mood = Array.isArray(o.mood) ? o.mood[i] : o.mood || 'calm', jig = (mood === 'shout' || mood === 'panic') ? 3 * Math.sin(t * 40 + i * 2) : 0;
    actor(() => { circle(c, x + jig, AMP.crista + 14, AMP.R, '#FFD3E2'); });
    paint(() => ampFace(c, x + jig, AMP.crista + 14, mood, bend, o.sweat || 0, t, i));
  });
}
function ampFace(c, x, y, mood, bend, sweat, t, i) {
  const lx = clamp(bend, -1, 1) * 2.5;
  const shut = mood === 'strain';
  c.save(); c.translate(x, y); c.scale(1.2, 1.2); c.translate(-x, -y);
  for (const ex of [-10, 10]) {
    if (shut) { line(c, x + ex - 6, y - 6, x + ex + 6, y - 4, 3.4, '#3A1530'); continue; }
    const ry = mood === 'panic' ? 9 : mood === 'shout' || mood === 'alert' ? 8 : 6.5;
    ellipse(c, x + ex, y - 6, 6.4, ry, '#FFFFFF'); circle(c, x + ex + lx, y - 6, mood === 'panic' ? 2.6 : 3.4, '#1A0E24');
  }
  if (mood === 'shout' || mood === 'panic') { ellipse(c, x, y + 11, 8, mood === 'panic' ? 8 : 10, '#5A1522'); ellipse(c, x, y + 15, 5, 3, '#E0616C'); }
  else if (mood === 'strain') { rrect(c, x - 9, y + 6, 18, 8, 3); c.fillStyle = '#FFFFFF'; c.fill(); }
  else if (mood === 'alert') { ellipse(c, x, y + 11, 4.5, 5, '#5A1522'); }
  else { c.beginPath(); c.moveTo(x - 6, y + 9); c.quadraticCurveTo(x, y + 13, x + 6, y + 9); c.lineWidth = 2.6; c.strokeStyle = '#3A1530'; c.stroke(); }
  if (sweat > 0.05 && i % 2 === 0) sweatDrop(c, x + 22, y - 18 + 6 * ((t * 2 + i) % 1), 0.5, sweat);
  c.restore();
}
// a word in a jagged burst (screen space), popping
function dzBurst(txt, x, y, size, k, col = '#FFD447', rot = -0.06, seed = 1, ink = '#14141E') {
  if (k <= 0.01) return;
  const q = E.outBack(clamp(k), 2.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(q, q);
  ctx.font = `400 ${size}px Anton`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width * 0.5 + size * 0.7, h = size * 0.95, rng = mulberry32(seed);
  ctx.beginPath();
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr = i % 2 ? 0.8 : 1.12 + 0.12 * rng(); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * w * rr, Math.sin(a) * h * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = ink; ctx.stroke();
  paint(() => { ctx.fillStyle = ink; ctx.fillText(txt, 0, size * 0.04); });
  ctx.restore();
}
