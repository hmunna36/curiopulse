// Spicy-food Short: the garden at dusk. A chilli plant heavy with red pods (it has eyes, when it wants to), a yellow bird
// on one of its branches eating a chilli without a care, and a mouse that sneaks up for one and regrets it.
// World coords: 1080x1920 at zoom 1, drawn under the camera into ctx and gctx. Nothing here is timed.
'use strict';

const GD = { ground: 1150, perch: [644, 734], head: [414, 578], low: [236, 1010] };
let GD_SKY = null;
// [x, y, angle, length, shade] for every leaf; [x, y, scale, tilt, flip] for every pod
const GD_LEAVES = [
  [398, 1100, -2.5, 120, 0], [396, 1080, -0.5, 130, 1], [300, 992, -2.7, 110, 1], [300, 992, -1.2, 96, 0], [250, 1004, 2.9, 88, 0],
  [408, 930, -0.4, 120, 0], [520, 852, -1.0, 104, 1], [560, 858, 0.5, 96, 0], [404, 860, -2.6, 116, 1],
  [300, 742, -2.2, 108, 0], [262, 752, 2.7, 92, 1], [330, 760, -1.0, 90, 1], [400, 800, -0.3, 110, 0],
  [530, 722, -1.2, 110, 0], [566, 726, 0.9, 88, 1], [790, 736, -0.5, 104, 0], [770, 738, 0.9, 84, 1], [470, 726, -2.0, 86, 1],
  [480, 602, -1.2, 96, 1], [540, 610, -0.2, 100, 0], [414, 700, -2.7, 104, 0],
];
const GD_PODS = [[236, 1012, 0.82, 0.16, false], [598, 870, 0.74, -0.2, true], [232, 762, 0.7, 0.2, false], [540, 614, 0.68, -0.14, true], [336, 906, 0.66, 0.1, false], [748, 748, 0.6, -0.1, true], [470, 1000, 0.62, -0.24, true]];

function initGarden() {
  GD_SKY = mkCanvas(1700, 2400);
  const x = GD_SKY.getContext('2d'), rng = mulberry32(57);
  x.translate(310, 200);                                  // covers x -310..1390, y -200..2200
  let g = x.createLinearGradient(0, -200, 0, 1150);
  g.addColorStop(0, '#0B1038'); g.addColorStop(0.42, '#2A2462'); g.addColorStop(0.72, '#7A3A66'); g.addColorStop(0.9, '#E0703A'); g.addColorStop(1, '#FFB24A');
  x.fillStyle = g; x.fillRect(-310, -200, 1700, 1700);
  for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + 0.6 * rng()})`; x.beginPath(); x.arc(-300 + rng() * 1680, -190 + rng() * 620, 0.8 + rng() * 1.8, 0, 7); x.fill(); }
  // the sun, half down
  g = x.createRadialGradient(790, 1120, 20, 790, 1120, 190); g.addColorStop(0, '#FFF1B8'); g.addColorStop(0.6, '#FFC24A'); g.addColorStop(1, '#FF8A2A');
  x.fillStyle = g; x.beginPath(); x.arc(790, 1120, 176, 0, 7); x.fill();
  for (const [yy, hh] of [[1040, 16], [1076, 12], [1104, 9]]) { x.fillStyle = 'rgba(122,58,102,0.55)'; x.fillRect(560, yy, 460, hh); }
  // hills and a fence
  for (const [base, amp, col, sd] of [[1040, 70, '#3A2458', 1], [1090, 50, '#241842', 2]]) {
    x.beginPath(); x.moveTo(-310, 1500);
    for (let px = -310; px <= 1390; px += 20) x.lineTo(px, base - amp * (0.5 + 0.5 * Math.sin(px * 0.004 * sd + sd * 2)) - 14 * Math.sin(px * 0.021 + sd));
    x.lineTo(1390, 1500); x.closePath(); x.fillStyle = col; x.fill();
  }
  x.fillStyle = '#120E26';
  for (let px = -290; px < 1390; px += 132) { x.beginPath(); x.moveTo(px, 1160); x.lineTo(px, 1010); x.lineTo(px + 14, 990); x.lineTo(px + 28, 1010); x.lineTo(px + 28, 1160); x.closePath(); x.fill(); }
  x.fillRect(-310, 1040, 1700, 14); x.fillRect(-310, 1100, 1700, 14);
  // the ground
  g = x.createLinearGradient(0, 1140, 0, 2200); g.addColorStop(0, '#221A2E'); g.addColorStop(0.3, '#181224'); g.addColorStop(1, '#0C0816');
  x.fillStyle = g; x.fillRect(-310, 1140, 1700, 1100);
  for (let i = 0; i < 260; i++) {                         // furrows of soil, pebbles, and tufts nearer the camera
    const py = 1180 + Math.pow(rng(), 0.8) * 1000, px = -300 + rng() * 1680, k = (py - 1140) / 1000;
    x.fillStyle = `rgba(${90 + 60 * rng()},${60 + 30 * rng()},${90 + 40 * rng()},${0.10 + 0.12 * rng()})`; x.beginPath(); x.ellipse(px, py, (16 + 40 * rng()) * (0.6 + k), (4 + 6 * rng()) * (0.6 + k), 0, 0, 7); x.fill();
  }
  for (let i = 0; i < 46; i++) {
    const py = 1260 + rng() * 900, px = -300 + rng() * 1680, k = 0.8 + (py - 1140) / 500, h = (26 + rng() * 40) * k;
    x.fillStyle = rng() < 0.5 ? '#1B3324' : '#142A1C';
    for (let j = -1; j <= 1; j++) { x.beginPath(); x.moveTo(px + j * 9 * k - 5 * k, py); x.lineTo(px + j * 16 * k + (rng() - 0.5) * 10, py - h * (1 - 0.25 * Math.abs(j))); x.lineTo(px + j * 9 * k + 5 * k, py); x.closePath(); x.fill(); }
  }
  x.fillStyle = '#2A1C22'; x.beginPath(); x.ellipse(400, 1196, 230, 54, 0, Math.PI, 0); x.fill();
  for (let i = 0; i < 70; i++) { const px = -300 + rng() * 1680, h = 14 + rng() * 26; x.fillStyle = rng() < 0.5 ? '#1F3A2A' : '#17301F'; x.beginPath(); x.moveTo(px - 6, 1152); x.lineTo(px + (rng() - 0.5) * 12, 1152 - h); x.lineTo(px + 6, 1152); x.closePath(); x.fill(); }
}

function gdLeaf(c, x, y, a, len, col, vein) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * 0.3, -len * 0.32, len * 0.76, -len * 0.22, len, 0); c.bezierCurveTo(len * 0.76, len * 0.22, len * 0.3, len * 0.32, 0, 0); c.closePath();
  c.fillStyle = col; c.fill();
  line(c, 4, 0, len * 0.9, 0, 2.5, vein);
  c.restore();
}
function gdBack(cam, t) {
  applyCam(cam);
  ctx.drawImage(GD_SKY, -310, -200);
  softDot(gctx, 790, 1090, 330, '#FF9A3C', 0.5);
  for (let i = 0; i < 9; i++) {                           // fireflies
    const px = 80 + hash(i * 3.3) * 920 + 30 * Math.sin(t * 0.7 + i), py = 560 + hash(i * 5.1) * 520 + 24 * Math.sin(t * 0.9 + i * 2), a = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.7);
    circle(ctx, px, py, 3.5, rgba('#F6FFB0', 0.8 * a)); softDot(gctx, px, py, 26, '#D8FF7A', 0.7 * a);
  }
}
// The plant. o: {eyes 0..1 (they open), look: [x, y], smirk 0..1, sway, lowGone (the lowest pod has been bitten: 0..1)}
function gdPlant(t, o = {}) {
  const c = ctx, sw = (o.sway === undefined ? 1 : o.sway) * 0.03 * Math.sin(t * 1.3);
  const stem = (P, w) => { smoothPath(c, P); c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#1F5E2E'; c.stroke(); c.lineWidth = w * 0.42; c.strokeStyle = '#4FAE62'; c.stroke(); };
  stem([[400, 1190], [392, 1040], [410, 900], [398, 760], [414, 640], [414, 600]], 18);
  stem([[396, 1044], [330, 1000], [300, 992], [236, 1004]], 10);
  stem([[408, 904], [470, 872], [520, 852], [598, 862]], 10);
  stem([[400, 804], [340, 762], [300, 742], [232, 756]], 10);
  stem([[404, 744], [470, 724], [600, 726], [712, 742], [794, 736]], 12);
  stem([[412, 664], [450, 624], [480, 602], [540, 606]], 9);
  stem([[404, 930], [370, 910], [336, 900]], 7); stem([[420, 1010], [450, 1000], [470, 994]], 7);
  GD_LEAVES.forEach(([lx, ly, a, len, sh], i) => gdLeaf(c, lx, ly, a + sw * (1 + (i % 3)), len, sh ? '#2E8B4A' : '#1F6E38', sh ? '#7FD98A' : '#4FAE62'));
  GD_PODS.forEach(([px, py, s, tilt, flip], i) => {
    line(c, px, py - 16 * s, px, py, 4, '#2E7D32');
    chilliPod(c, px, py, s, Math.PI / 2 + tilt + sw * 2, { flip, bitten: i === 0 ? (o.lowGone || 0) : 0 });
    softDot(gctx, px + 10, py + 60 * s, 80 * s, '#FF3A2A', 0.28);
  });
  // its head: a crown of leaves, and the face that shows when it has plans
  const [hx, hy] = GD.head;
  for (let i = 0; i < 9; i++) gdLeaf(c, hx, hy + 14, -Math.PI / 2 + (i - 4) * 0.5 + sw * 3, 92 + 14 * (i % 2), i % 2 ? '#2E8B4A' : '#1F6E38', '#4FAE62');
  ellipse(c, hx, hy + 6, 66, 58, '#1F6E38'); ellipse(c, hx - 6, hy, 58, 50, '#2A8446');
  const ey = clamp(o.eyes || 0), look = o.look || [0, 0], sm = o.smirk || 0;
  for (const sd of [-1, 1]) {
    const ex = hx + sd * 24, yy = hy - 2;
    if (ey < 0.08) { c.beginPath(); c.moveTo(ex - 14, yy); c.quadraticCurveTo(ex, yy + 7, ex + 14, yy); c.lineWidth = 4.5; c.lineCap = 'round'; c.strokeStyle = '#0E3A1C'; c.stroke(); }
    else {
      ellipse(c, ex, yy, 16, 17 * ey, '#FFFFFF'); circle(c, ex + look[0] * 6, yy + look[1] * 5 * ey, 7.5, '#0E2414'); circle(c, ex + look[0] * 6 - 2.4, yy + look[1] * 5 * ey - 2.6, 2.6, '#FFFFFF');
      c.save(); c.translate(ex, yy - 20 * ey); c.rotate(sd * 0.42 * ey); rrect(c, -20, -8, 40, 14, 6); c.fillStyle = '#0E3A1C'; c.fill(); c.restore();   // a heavy brow: it is scheming
    }
  }
  c.beginPath(); c.moveTo(hx - 16, hy + 30); c.quadraticCurveTo(hx + 2, hy + 34 + 10 * sm, hx + 22, hy + 26 - 8 * sm); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#0E3A1C'; c.stroke();
}
// The bird: origin = its feet on the perch; it faces left. o: {chomp 0..1 (beak open), bob (it nods), happy (eyes shut), look: [x, y], pod (it holds a chilli in its beak)}
function gdBird(x, y, s, t, o = {}) {
  const c = ctx, ch = clamp(o.chomp || 0);
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 3; i++) { c.save(); c.translate(36, -34); c.rotate(-0.55 - i * 0.17); rrect(c, -10, 0, 20, 104 - i * 9, 10); c.fillStyle = ['#D96A0C', '#F0921E', '#FFB83A'][i]; c.fill(); c.restore(); }
  for (const fx of [-14, 14]) { line(c, fx, -14, fx, 2, 7, '#E0560C'); line(c, fx - 10, 5, fx + 10, 5, 7, '#E0560C'); }
  c.translate(0, -(o.bob || 0) * 6);
  c.beginPath(); c.ellipse(0, -76, 62, 72, 0, 0, 7); let g = c.createRadialGradient(-22, -104, 8, 0, -76, 90); g.addColorStop(0, '#FFF0A0'); g.addColorStop(0.5, '#FFD23E'); g.addColorStop(1, '#E89A14'); c.fillStyle = g; c.fill();
  ellipse(c, -18, -58, 36, 44, 'rgba(255,244,190,0.7)');
  c.save(); c.translate(26, -72); c.rotate(0.3 + 0.05 * Math.sin(t * 3)); c.beginPath(); c.ellipse(0, 0, 30, 50, 0, 0, 7); c.fillStyle = '#E8961A'; c.fill(); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-4, -16 + i * 22, 22, 0.2, 2.0); c.lineWidth = 3; c.strokeStyle = 'rgba(150,80,10,0.5)'; c.stroke(); } c.restore();
  // the head nods with each bite
  c.translate(-16, -150 + (o.bob || 0) * 12); c.rotate(-0.14 * (o.bob || 0));
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(6 + i * 8, -36); c.quadraticCurveTo(26 + i * 14, -78 - i * 6, 44 + i * 16, -62 + i * 6); c.lineWidth = 9; c.lineCap = 'round'; c.strokeStyle = ['#FF8A1E', '#FFA52E', '#FFC24A'][i]; c.stroke(); }
  c.beginPath(); c.arc(0, 0, 46, 0, 7); g = c.createRadialGradient(-14, -16, 6, 0, 0, 52); g.addColorStop(0, '#FFF0A0'); g.addColorStop(0.6, '#FFD23E'); g.addColorStop(1, '#F0A81E'); c.fillStyle = g; c.fill();
  circle(c, -10, 16, 13, 'rgba(255,140,60,0.5)');
  // the beak, and what is in it
  if (o.pod) chilliPod(c, -74, 2 + 4 * ch, 0.5, Math.PI / 2 + 0.3, { bitten: 1, flip: true });
  c.beginPath(); c.moveTo(-38, -16); c.quadraticCurveTo(-76, -18 - 6 * ch, -92, -2 - 10 * ch); c.quadraticCurveTo(-70, 0 - 4 * ch, -40, 4); c.closePath(); c.fillStyle = '#FF7A1E'; c.fill();
  c.beginPath(); c.moveTo(-40, 4); c.quadraticCurveTo(-66, 6 + 10 * ch, -84, 6 + 22 * ch); c.quadraticCurveTo(-62, 20 + 12 * ch, -38, 18); c.closePath(); c.fillStyle = '#D95A0C'; c.fill();
  if (o.happy) { c.beginPath(); c.moveTo(-34, -22); c.quadraticCurveTo(-22, -34, -10, -22); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#2A1606'; c.stroke(); }
  else { const lk = o.look || [0, 0]; circle(c, -22, -24, 11, '#FFFFFF'); circle(c, -22 + lk[0] * 4, -24 + lk[1] * 4, 6.5, '#1A1020'); circle(c, -24 + lk[0] * 4, -26 + lk[1] * 4, 2.2, '#FFFFFF'); }
  c.restore();
}
// The mouse: origin = its feet; it faces right. o: {rear 0..1 (it stands up to bite), burn 0..1 (its eyes pop), hop, run (legs blur)}
function gdMouse(x, y, s, t, o = {}) {
  const c = ctx, rear = o.rear || 0, burn = o.burn || 0;
  c.save(); c.translate(x, y - (o.hop || 0)); c.scale(s, s);
  c.beginPath(); c.moveTo(-50, -30); c.bezierCurveTo(-100, -20 - 30 * Math.sin(t * 5), -120, -70, -160, -50 + 16 * Math.sin(t * 6)); c.lineWidth = 7; c.lineCap = 'round'; c.strokeStyle = '#E8A0B0'; c.stroke();
  for (const fx of [-30, 22]) ellipse(c, fx + (o.run ? 10 * Math.sin(t * 50 + fx) : 0), -4, 15, 8, '#8E88A4');
  c.rotate(-0.42 * rear);
  c.beginPath(); c.ellipse(0, -40, 60, 38, 0, 0, 7); let g = c.createRadialGradient(-16, -58, 6, 0, -40, 70); g.addColorStop(0, '#E4E0EE'); g.addColorStop(1, '#9A94B0'); c.fillStyle = g; c.fill();
  ellipse(c, 10, -28, 34, 20, 'rgba(240,236,248,0.7)');
  for (const [ex, ey2, r] of [[34, -92, 23], [62, -96, 21]]) { circle(c, ex, ey2, r, '#9A94B0'); circle(c, ex, ey2, r * 0.62, '#F0B0C0'); }
  c.beginPath(); c.arc(54, -58, 32, 0, 7); g = c.createRadialGradient(44, -70, 4, 54, -58, 36); g.addColorStop(0, '#E4E0EE'); g.addColorStop(1, '#A8A2BC'); c.fillStyle = g; c.fill();
  c.beginPath(); c.moveTo(74, -70); c.quadraticCurveTo(96, -60, 92, -48); c.quadraticCurveTo(80, -40, 70, -44); c.closePath(); c.fillStyle = '#B4AEC6'; c.fill();
  circle(c, 92, -52, 6.5, '#F08AA0');
  for (let i = -1; i <= 1; i++) line(c, 84, -46, 112, -42 + i * 9, 1.8, 'rgba(240,236,248,0.8)');
  if (burn > 0.3) { circle(c, 62, -66, 13, '#FFFFFF'); circle(c, 64, -66, 4.5, '#1A1020'); line(c, 48, -86, 72, -84, 4, '#6A6480'); }
  else { circle(c, 62, -66, 6, '#1A1020'); circle(c, 60.5, -67.5, 2, '#FFFFFF'); }
  for (const hx of [30, 44]) { line(c, hx, -34, hx + 26 + 14 * rear, -40 - 16 * rear, 9, '#9A94B0'); circle(c, hx + 28 + 14 * rear, -41 - 16 * rear, 7, '#F0B0C0'); }
  c.restore();
}
// "no burn": a white bubble with a flame in it, crossed out (screen space). k = pop
function noFlame(x, y, r, k, t) {
  if (k <= 0.01) return;
  const c = ctx, s = E.outBack(clamp(k), 2);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.scale(s, s);
  circle(c, 0, 0, r + 8, '#0B0B1A'); circle(c, 0, 0, r, '#FFFFFF');
  c.beginPath(); c.moveTo(0, -r * 0.62); c.bezierCurveTo(r * 0.5, -r * 0.1, r * 0.46, r * 0.5, 0, r * 0.56); c.bezierCurveTo(-r * 0.46, r * 0.5, -r * 0.5, -r * 0.1, -r * 0.2, -r * 0.2); c.bezierCurveTo(-r * 0.1, -r * 0.4, 0, -r * 0.5, 0, -r * 0.62);
  c.fillStyle = '#FF7A1E'; c.fill();
  c.beginPath(); c.moveTo(0, -r * 0.14); c.bezierCurveTo(r * 0.24, r * 0.1, r * 0.2, r * 0.42, 0, r * 0.44); c.bezierCurveTo(-r * 0.2, r * 0.42, -r * 0.24, r * 0.1, 0, -r * 0.14); c.fillStyle = '#FFD447'; c.fill();
  c.beginPath(); c.arc(0, 0, r - 5, 0, 7); c.lineWidth = 11; c.strokeStyle = '#E3182B'; c.stroke();
  line(c, -r * 0.66, -r * 0.66, r * 0.66, r * 0.66, 12, '#E3182B');
  c.restore();
}
